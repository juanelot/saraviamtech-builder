import type { BrandCard, BusinessType, Mood } from '../types/index.js';
import slugify from 'slugify';
import { hasOpenAI, creativeChat, parseJSON } from '../lib/openai.js';
import { scrapeSocialProfile, mergeSocialSources } from './social-scraper.js';

const DARK_PALETTES: Record<string, BrandCard['colors']> = {
  'warm-night':  { bg: '#09090b', surface: '#111114', accent: '#c8a97e', text: '#eae7e2', muted: '#5a5a5e' },
  'deep-teal':   { bg: '#0a0a0b', surface: '#111114', accent: '#5eadb5', text: '#eae7e2', muted: '#5a5a5e' },
  'ember':       { bg: '#09090b', surface: '#111114', accent: '#e85d3a', text: '#eae7e2', muted: '#5a5a5e' },
  'indigo':      { bg: '#09090b', surface: '#111114', accent: '#4f46e5', text: '#eae7e2', muted: '#5a5a5e' },
  'forest':      { bg: '#09090b', surface: '#111114', accent: '#4ca879', text: '#eae7e2', muted: '#5a5a5e' },
  'rose':        { bg: '#0d090b', surface: '#15100e', accent: '#e0607e', text: '#eae7e2', muted: '#5a5a5e' },
  'amber':       { bg: '#0c0900', surface: '#141100', accent: '#f59e0b', text: '#eae7e2', muted: '#5a5a5e' },
  'violet':      { bg: '#09090d', surface: '#111118', accent: '#8b5cf6', text: '#eae7e2', muted: '#5a5a5e' },
  'cyan':        { bg: '#090b0d', surface: '#11151a', accent: '#06b6d4', text: '#eae7e2', muted: '#5a5a5e' },
  'slate-gold':  { bg: '#0b0c10', surface: '#14151c', accent: '#d4af37', text: '#eae7e2', muted: '#5a5a5e' },
};

const LIGHT_PALETTES: Record<string, BrandCard['colors']> = {
  'cream':       { bg: '#f5f3ef', surface: '#ffffff', accent: '#4f46e5', text: '#1a1a1f', muted: '#6b6b73' },
  'warm-ivory':  { bg: '#fafaf8', surface: '#ffffff', accent: '#e85d3a', text: '#1a1a1f', muted: '#6b6b73' },
  'cool-gray':   { bg: '#fafafa', surface: '#ffffff', accent: '#5eadb5', text: '#1a1a1f', muted: '#6b6b73' },
  'blush':       { bg: '#fdf4f5', surface: '#ffffff', accent: '#e0607e', text: '#1a1a1f', muted: '#6b6b73' },
  'sage':        { bg: '#f4f7f4', surface: '#ffffff', accent: '#4ca879', text: '#1a1a1f', muted: '#6b6b73' },
  'sand':        { bg: '#faf8f3', surface: '#ffffff', accent: '#d4af37', text: '#1a1a1f', muted: '#6b6b73' },
  'lavender':    { bg: '#f7f5fc', surface: '#ffffff', accent: '#8b5cf6', text: '#1a1a1f', muted: '#6b6b73' },
  'sky':         { bg: '#f3fafc', surface: '#ffffff', accent: '#06b6d4', text: '#1a1a1f', muted: '#6b6b73' },
};

const FONTS: Record<string, BrandCard['font']> = {
  modern: {
    display: 'Outfit',
    body: 'Outfit',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap',
  },
  technical: {
    display: 'Geist Mono',
    body: 'Geist',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;700&family=Geist+Mono:wght@400;500&display=swap',
  },
  creative: {
    display: 'Syne',
    body: 'Outfit',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Outfit:wght@300;400;500&display=swap',
  },
  premium: {
    display: 'Cormorant Garamond',
    body: 'Outfit',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Outfit:wght@300;400;500&display=swap',
  },
};

// ── Copy variants: 3 options per business type, seed picks among them ─────────
type CopyVariant = (name: string) => BrandCard['copy'];

const COPY_TEMPLATES_ES: Record<BusinessType, CopyVariant[]> = {
  'saas-tech': [
    (name) => ({
      headline: `${name} — Construido para escalar`,
      tagline: 'Lanza más rápido. Piensa en grande.',
      heroLine: 'La plataforma que convierte ideas en productos.',
      description: `${name} le da a tu equipo las herramientas para moverse con precisión y confianza. Del concepto al lanzamiento, eliminamos la fricción.`,
      services: ['Integración API', 'Analítica en tiempo real', 'Colaboración en equipo', 'Seguridad empresarial'],
      cta: 'Empieza gratis',
    }),
    (name) => ({
      headline: `${name} — El poder del código bien hecho`,
      tagline: 'Infraestructura seria. Equipos ágiles.',
      heroLine: 'Software que escala contigo desde el día uno.',
      description: `${name} combina potencia técnica con facilidad de uso. Construye más rápido, despliega con confianza y escala sin límites.`,
      services: ['Automatización', 'Dashboards en tiempo real', 'SDK y APIs', 'SSO empresarial'],
      cta: 'Prueba 14 días gratis',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'El futuro del software ya está aquí.',
      heroLine: 'Donde la tecnología se convierte en ventaja competitiva.',
      description: `Con ${name}, tu equipo tiene todo lo que necesita: integración sin fricciones, datos al instante y seguridad que no compromete la velocidad.`,
      services: ['API REST & GraphQL', 'Monitoreo en tiempo real', 'Gestión de equipos', 'Auditoría y compliance'],
      cta: 'Ver demo en vivo',
    }),
  ],
  'agency-studio': [
    (name) => ({
      headline: `${name}`,
      tagline: 'Creamos experiencias que impactan.',
      heroLine: 'Dirección creativa. Ejecución precisa.',
      description: `${name} es un estudio creativo especializado en identidad de marca, experiencias digitales y estrategia de campaña para empresas visionarias.`,
      services: ['Identidad de marca', 'Diseño web', 'Motion & Video', 'Estrategia'],
      cta: 'Ver nuestro trabajo',
    }),
    (name) => ({
      headline: `${name} — Studio`,
      tagline: 'Ideas que se ven, se sienten y se recuerdan.',
      heroLine: 'Arte aplicado. Resultados medibles.',
      description: `${name} transforma visiones en marcas poderosas. Combinamos storytelling, diseño y estrategia para crear presencias que mueven audiencias.`,
      services: ['Branding completo', 'Diseño digital', 'Producción audiovisual', 'Consultoría creativa'],
      cta: 'Hablemos de tu proyecto',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Tu marca, reinventada.',
      heroLine: 'Del concepto a la cultura de marca.',
      description: `En ${name} creamos desde cero o llevamos tu marca al siguiente nivel. Cada proyecto es una oportunidad de decir algo distinto y duradero.`,
      services: ['Identidad visual', 'UX & Diseño web', 'Campañas digitales', 'Dirección de arte'],
      cta: 'Ver portafolio',
    }),
  ],
  'restaurant-food': [
    (name) => ({
      headline: `${name}`,
      tagline: 'Cada plato cuenta una historia.',
      heroLine: 'Comida elaborada con intención.',
      description: `En ${name} creemos que la buena cocina está en los detalles: ingredientes de origen, técnica paciente y hospitalidad genuina.`,
      services: ['Comer en el lugar', 'Eventos privados', 'Catering', 'Para llevar'],
      cta: 'Reservar mesa',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Sabor que se queda contigo.',
      heroLine: 'Cocina con alma, servicio con calidez.',
      description: `${name} es más que un restaurante — es una experiencia. Ingredientes frescos, recetas propias y un ambiente que invita a quedarse.`,
      services: ['Menú del día', 'Cenas privadas', 'Maridaje & vinos', 'Pedidos a domicilio'],
      cta: 'Ver menú',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Del mercado a tu mesa.',
      heroLine: 'Ingredientes honestos. Sabores únicos.',
      description: `En ${name} la cocina es un acto de respeto: por el producto, por el comensal y por la tradición. Ven a descubrir algo diferente.`,
      services: ["Carta de temporada", "Chef's table", 'Eventos corporativos', 'Takeaway gourmet'],
      cta: 'Haz tu reserva',
    }),
  ],
  'ecommerce': [
    (name) => ({
      headline: `${name}`,
      tagline: 'Curado para ti.',
      heroLine: 'Descubre productos que definen tu estilo.',
      description: `${name} te ofrece una selección cuidadosamente curada de productos premium, diseñados para elevar tu día a día.`,
      services: ['Envío gratis', 'Devoluciones fáciles', 'Programa de lealtad', 'Tarjetas de regalo'],
      cta: 'Comprar ahora',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Lo que buscas, donde lo necesitas.',
      heroLine: 'Productos que hacen la diferencia.',
      description: `En ${name} encontrarás lo mejor de cada categoría, con entrega rápida, garantía real y atención que no falla.`,
      services: ['Envío express', 'Garantía extendida', 'Club de miembros', 'Gift wrapping'],
      cta: 'Explorar tienda',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Calidad que se nota desde el primer uso.',
      heroLine: 'Compra inteligente. Vive mejor.',
      description: `${name} selecciona cada producto con criterio: durabilidad, diseño y valor real. Sin compromisos, sin relleno.`,
      services: ['Envío en 24h', 'Política de cambio flexible', 'Puntos acumulables', 'Ediciones limitadas'],
      cta: 'Ver colección',
    }),
  ],
  'portfolio-creative': [
    (name) => ({
      headline: `${name}`,
      tagline: 'Visión hecha forma.',
      heroLine: 'Diseño que habla antes que tú.',
      description: `${name} es una práctica creativa en la intersección del storytelling visual, el diseño de interacción y la dirección de arte.`,
      services: ['Dirección de arte', 'Diseño visual', 'Fotografía', 'Ilustración'],
      cta: 'Ver portafolio',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Creatividad sin atajos.',
      heroLine: 'Cada proyecto, una historia visual diferente.',
      description: `${name} trabaja en el espacio donde el concepto se convierte en imagen. Proyectos que comunican, que sorprenden y que perduran.`,
      services: ['Branding visual', 'Diseño editorial', 'Identidad digital', 'Animación'],
      cta: 'Explorar trabajo',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Arte con propósito.',
      heroLine: 'Diseño que transforma la percepción.',
      description: `${name} crea desde la curiosidad y ejecuta con precisión. Cada proyecto nace de entender profundamente el problema antes de buscar la solución visual.`,
      services: ['Identidad de marca', 'Dirección creativa', 'Diseño de producto', 'Consultoría visual'],
      cta: 'Trabajemos juntos',
    }),
  ],
  'luxury-jewelry': [
    (name) => ({
      headline: `${name}`,
      tagline: 'Llevado con intención.',
      heroLine: 'Creado para momentos que duran para siempre.',
      description: `${name} crea joyería fina con significado. Cada pieza es elaborada a mano por artesanos y diseñada para convertirse en una reliquia.`,
      services: ['Joyería fina', 'Diseño personalizado', 'Grabado', 'Restauración'],
      cta: 'Explorar la colección',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Piezas que cuentan tu historia.',
      heroLine: 'Lujo que se hereda, no se olvida.',
      description: `En ${name} cada joya nace de un proceso artesanal riguroso. Materiales selectos, diseño atemporal y el detalle que convierte lo ordinario en extraordinario.`,
      services: ['Colecciones exclusivas', 'Joyería a medida', 'Certificación de piedras', 'Cuidado y mantenimiento'],
      cta: 'Ver colecciones',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'La elegancia del detalle.',
      heroLine: 'Cada pieza, una obra.',
      description: `${name} es sinónimo de joyería de autor. Inspiradas en la naturaleza y el arte, nuestras piezas son únicas como quien las lleva.`,
      services: ['Alta joyería', 'Ediciones limitadas', 'Consulta privada', 'Empaque de lujo'],
      cta: 'Agendar visita privada',
    }),
  ],
  'real-estate': [
    (name) => ({
      headline: `${name}`,
      tagline: 'Encuentra tu lugar.',
      heroLine: 'Donde vives define cómo vives.',
      description: `${name} conecta a compradores exigentes con propiedades excepcionales. Vamos más allá de la transacción para encontrar hogares que se adapten a tu vida.`,
      services: ['Venta residencial', 'Alquileres', 'Administración de propiedades', 'Valoraciones'],
      cta: 'Ver propiedades',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Tu próximo hogar te espera.',
      heroLine: 'Propiedades que inspiran. Asesoría que tranquiliza.',
      description: `${name} acompaña cada etapa de tu decisión inmobiliaria. Desde la búsqueda hasta las llaves en mano, estamos contigo.`,
      services: ['Compra & venta', 'Arrendamiento', 'Inversión inmobiliaria', 'Avalúos'],
      cta: 'Buscar propiedades',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Inversiones inteligentes. Hogares ideales.',
      heroLine: 'El espacio correcto cambia todo.',
      description: `En ${name} entendemos que comprar una propiedad es una de las decisiones más importantes de tu vida. Por eso lo hacemos con datos, experiencia y honestidad.`,
      services: ['Residencial premium', 'Propiedades comerciales', 'Portafolio de inversión', 'Gestoría completa'],
      cta: 'Habla con un asesor',
    }),
  ],
  'fitness-health': [
    (name) => ({
      headline: `${name}`,
      tagline: 'Muévete con propósito.',
      heroLine: 'Tu mejor rendimiento empieza aquí.',
      description: `${name} se basa en una creencia: el esfuerzo constante se convierte en resultados extraordinarios. Te damos el entorno y la guía para lograrlo.`,
      services: ['Entrenamiento personal', 'Clases grupales', 'Nutrición', 'Recuperación'],
      cta: 'Comenzar a entrenar',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Más fuerte cada día.',
      heroLine: 'El cuerpo que quieres, el método que funciona.',
      description: `En ${name} no vendemos motivación vacía — ofrecemos metodología real, entrenadores certificados y un espacio diseñado para el progreso.`,
      services: ['Planes personalizados', 'HIIT & funcional', 'Seguimiento nutricional', 'Fisioterapia'],
      cta: 'Empieza hoy',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Tu transformación, nuestra misión.',
      heroLine: 'Salud que se construye, no se improvisa.',
      description: `${name} integra entrenamiento, alimentación y bienestar mental en un solo lugar. Resultados reales, acompañamiento constante.`,
      services: ['Coaching integral', 'Clases especializadas', 'Plan nutricional', 'Zona de recuperación'],
      cta: 'Ver planes',
    }),
  ],
  'auto-detailing': [
    (name) => ({
      headline: `${name}`,
      tagline: 'Tu auto, perfeccionado.',
      heroLine: 'El detalle lo es todo.',
      description: `${name} ofrece detallado automotriz profesional usando productos premium y técnica meticulosa. Restauramos, protegemos y realzamos.`,
      services: ['Detallado completo', 'Corrección de pintura', 'Recubrimiento cerámico', 'Renovación de interior'],
      cta: 'Reservar servicio',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Obsesionados con la perfección.',
      heroLine: 'Tu vehículo merece el mejor cuidado.',
      description: `En ${name} cada auto es tratado como si fuera nuestro. Usamos los mejores productos y procesos para garantizar un acabado que supera expectativas.`,
      services: ['Lavado premium', 'Pulido y cera', 'Protección PPF', 'Detailing de motor'],
      cta: 'Cotizar servicio',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Brillante por fuera. Impecable por dentro.',
      heroLine: 'Cuidado profesional. Resultados visibles.',
      description: `${name} combina experiencia técnica y pasión por los autos para ofrecer resultados que duran. Sin atajos, sin compromisos.`,
      services: ['Detallado exterior', 'Tratamiento interior', 'Ceramic coating', 'Paint protection film'],
      cta: 'Agendar ahora',
    }),
  ],
  'professional-services': [
    (name) => ({
      headline: `${name}`,
      tagline: 'Experiencia que mueve la aguja.',
      heroLine: 'Pensamiento estratégico. Resultados medibles.',
      description: `${name} brinda asesoría experta y ejecución práctica para empresas que navegan la complejidad. Nos asociamos con líderes para generar resultados reales.`,
      services: ['Consultoría', 'Asesoría', 'Implementación', 'Capacitación'],
      cta: 'Ponerse en contacto',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'El conocimiento correcto, en el momento correcto.',
      heroLine: 'Soluciones que escalan. Equipos que crecen.',
      description: `${name} trabaja con organizaciones que quieren resultados, no excusas. Traemos metodología probada, perspectiva fresca y compromiso real.`,
      services: ['Diagnóstico organizacional', 'Estrategia de negocio', 'Transformación digital', 'Formación ejecutiva'],
      cta: 'Agenda una llamada',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Tu negocio, nuestro compromiso.',
      heroLine: 'De la visión al resultado, paso a paso.',
      description: `En ${name} creemos que la asesoría de calidad cambia empresas. Por eso cada proyecto lo abordamos con profundidad, honestidad y foco en el impacto.`,
      services: ['Consultoría estratégica', 'Gestión del cambio', 'Auditoría de procesos', 'Mentoring ejecutivo'],
      cta: 'Trabajemos juntos',
    }),
  ],
  'music-events': [
    (name) => ({
      headline: `${name}`,
      tagline: 'El sonido que mueve multitudes.',
      heroLine: 'Experiencias que no se olvidan.',
      description: `${name} produce eventos musicales y experiencias en vivo que conectan artistas y audiencias a través de producción de primer nivel.`,
      services: ['Producción de eventos', 'Booking de artistas', 'Sonido profesional', 'Marketing de eventos'],
      cta: 'Ver próximos eventos',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Donde la música cobra vida.',
      heroLine: 'Cada show, una experiencia única.',
      description: `${name} diseña y produce eventos que van más allá del entretenimiento. Desde pequeños sets íntimos hasta grandes festivales, hacemos que cada nota cuente.`,
      services: ['Festivales & shows', 'Producción técnica', 'Gestión de artistas', 'Experiencias inmersivas'],
      cta: 'Ver cartelera',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'La música como experiencia total.',
      heroLine: 'Producción que se siente, no solo se escucha.',
      description: `En ${name} la música es el centro pero la experiencia lo es todo. Producción impecable, curaduría artística y espacios diseñados para vivir el sonido.`,
      services: ['Eventos en vivo', 'Producción audiovisual', 'DJ & artistas', 'Experiencias privadas'],
      cta: 'Explorar eventos',
    }),
  ],
  'education': [
    (name) => ({
      headline: `${name}`,
      tagline: 'El conocimiento que te transforma.',
      heroLine: 'Aprende diferente. Crece más rápido.',
      description: `${name} ofrece programas educativos diseñados para el mundo real, combinando metodología probada con tecnología de vanguardia.`,
      services: ['Cursos online', 'Mentoría personalizada', 'Certificaciones', 'Talleres presenciales'],
      cta: 'Explorar cursos',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Aprende hoy lo que el mundo necesita mañana.',
      heroLine: 'Educación que abre puertas.',
      description: `${name} forma profesionales listos para los desafíos reales. Programas actualizados, instructores activos en la industria y comunidad que potencia tu carrera.`,
      services: ['Bootcamps intensivos', 'Cursos a tu ritmo', 'Asesoría de carrera', 'Comunidad de aprendizaje'],
      cta: 'Ver programas',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'El aprendizaje que no se detiene.',
      heroLine: 'Más que cursos — una comunidad que te impulsa.',
      description: `En ${name} creemos que aprender bien es la inversión más rentable. Programas diseñados por expertos, con acompañamiento real y resultados comprobados.`,
      services: ['Formación online', 'Mentoría 1:1', 'Proyectos reales', 'Certificados reconocidos'],
      cta: 'Comenzar ahora',
    }),
  ],
  'beauty-salon': [
    (name) => ({
      headline: `${name}`,
      tagline: 'Tu mejor versión, cada día.',
      heroLine: 'Donde el cuidado se convierte en arte.',
      description: `${name} es un espacio de belleza premium donde cada servicio está diseñado para realzar tu confianza y bienestar.`,
      services: ['Corte y color', 'Tratamientos faciales', 'Manicura y pedicura', 'Maquillaje profesional'],
      cta: 'Reservar cita',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Belleza con propósito.',
      heroLine: 'El ritual de cuidarte empieza aquí.',
      description: `En ${name} cada visita es un momento para ti. Expertos certificados, productos de primera y un ambiente que invita a relajarse y brillar.`,
      services: ['Colorimetría avanzada', 'Rituales de belleza', 'Nail art', 'Beauty coaching'],
      cta: 'Agendar ahora',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Tú decides cómo brillas.',
      heroLine: 'Experiencia de salón. Resultados de editorial.',
      description: `${name} fusiona tendencia y técnica para ofrecerte resultados que se notan. Cada cita es una experiencia personalizada de principio a fin.`,
      services: ['Estilismo personalizado', 'Tratamientos capilares', 'Skincare premium', 'Maquillaje de ocasión'],
      cta: 'Ver servicios',
    }),
  ],
  'legal-finance': [
    (name) => ({
      headline: `${name}`,
      tagline: 'Tu patrimonio, protegido.',
      heroLine: 'Claridad legal. Solidez financiera.',
      description: `${name} provee asesoría legal y financiera de alto nivel, con enfoque en proteger y hacer crecer el patrimonio de nuestros clientes.`,
      services: ['Asesoría legal', 'Planificación financiera', 'Gestión de inversiones', 'Protección patrimonial'],
      cta: 'Agendar consulta',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Decisiones informadas. Resultados seguros.',
      heroLine: 'Tu tranquilidad financiera comienza con la asesoría correcta.',
      description: `${name} combina experiencia jurídica y financiera para proteger lo que más te importa. Asesoría clara, soluciones a medida.`,
      services: ['Derecho corporativo', 'Finanzas personales', 'Inversiones', 'Planificación fiscal'],
      cta: 'Solicitar consulta',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Expertos en lo que más importa.',
      heroLine: 'Asesoría que protege. Estrategia que multiplica.',
      description: `En ${name} entendemos que cada cliente tiene necesidades únicas. Por eso ofrecemos soluciones legales y financieras integrales, siempre con enfoque personalizado.`,
      services: ['Estructuración legal', 'Wealth management', 'Due diligence', 'Compliance y riesgo'],
      cta: 'Habla con nosotros',
    }),
  ],
  'construction': [
    (name) => ({
      headline: `${name}`,
      tagline: 'Construimos para durar.',
      heroLine: 'De la estructura al acabado, sin compromisos.',
      description: `${name} es una empresa constructora con décadas de experiencia en proyectos residenciales, comerciales e industriales de alta complejidad.`,
      services: ['Construcción residencial', 'Proyectos comerciales', 'Remodelaciones', 'Gestión de obra'],
      cta: 'Solicitar presupuesto',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Calidad que se construye, no se improvisa.',
      heroLine: 'Cada proyecto, un legado.',
      description: `${name} ejecuta con rigor técnico y cumplimiento de plazos. Años de experiencia respaldando proyectos que superan expectativas y se mantienen en el tiempo.`,
      services: ['Obra civil', 'Proyectos residenciales', 'Remodelación & acabados', 'Supervisión de obras'],
      cta: 'Pide tu cotización',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'La base lo es todo.',
      heroLine: 'Construimos con precisión. Entregamos con orgullo.',
      description: `En ${name} cada metro cuadrado lleva nuestra firma de calidad. Materiales certificados, mano de obra experta y cumplimiento garantizado.`,
      services: ['Construcción llave en mano', 'Diseño & build', 'Rehabilitación de espacios', 'Project management'],
      cta: 'Comenzar proyecto',
    }),
  ],
  'pet-services': [
    (name) => ({
      headline: `${name}`,
      tagline: 'Tu mascota merece lo mejor.',
      heroLine: 'Cuidado con amor y profesionalismo.',
      description: `${name} ofrece servicios integrales para el bienestar de tu mascota, con personal certificado y un ambiente seguro y cálido.`,
      services: ['Veterinaria', 'Grooming', 'Hotel para mascotas', 'Adiestramiento'],
      cta: 'Agendar cita',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Felices ellos, felices tú.',
      heroLine: 'El bienestar de tu mascota, nuestra prioridad.',
      description: `En ${name} tratamos a cada mascota como si fuera propia. Desde consultas veterinarias hasta grooming spa, siempre con el máximo cuidado.`,
      services: ['Consulta veterinaria', 'Baño & estilismo', 'Guardería diurna', 'Clases de obediencia'],
      cta: 'Ver servicios',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Amor profesional para quien más quieres.',
      heroLine: 'Cuidamos lo que más importa.',
      description: `${name} es el espacio donde tu mascota se siente en casa. Personal apasionado, instalaciones premium y servicios diseñados para su bienestar total.`,
      services: ['Medicina veterinaria', 'Spa & grooming', 'Hospedaje premium', 'Nutrición animal'],
      cta: 'Reservar ahora',
    }),
  ],
  'nonprofit': [
    (name) => ({
      headline: `${name}`,
      tagline: 'Juntos, hacemos la diferencia.',
      heroLine: 'Un impacto real, una comunidad a la vez.',
      description: `${name} trabaja cada día para crear un mundo más equitativo y sostenible, apoyado por voluntarios comprometidos y donantes generosos.`,
      services: ['Programas comunitarios', 'Voluntariado', 'Donaciones', 'Alianzas corporativas'],
      cta: 'Únete a nuestra causa',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'El cambio empieza con quienes actúan.',
      heroLine: 'Transformamos intención en impacto.',
      description: `${name} convierte la solidaridad en acción concreta. Programas con métricas reales, transparencia total y una comunidad que crece con cada proyecto.`,
      services: ['Proyectos sociales', 'Red de voluntarios', 'Campaña de donación', 'Responsabilidad corporativa'],
      cta: 'Apoya nuestra misión',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Impacto que trasciende.',
      heroLine: 'Cada acción cuenta. Cada peso importa.',
      description: `En ${name} creemos en la transparencia y en la acción. Cada proyecto que impulsamos tiene objetivos claros, seguimiento riguroso y resultados que se pueden ver.`,
      services: ['Iniciativas comunitarias', 'Voluntariado corporativo', 'Donaciones en especie', 'Educación social'],
      cta: 'Involúcrate',
    }),
  ],
  'photography': [
    (name) => ({
      headline: `${name}`,
      tagline: 'Capturamos lo que las palabras no pueden.',
      heroLine: 'Cada imagen cuenta tu historia.',
      description: `${name} es un estudio fotográfico especializado en retratos, eventos y fotografía comercial que trasciende lo ordinario.`,
      services: ['Fotografía de bodas', 'Retratos', 'Fotografía comercial', 'Edición profesional'],
      cta: 'Ver portafolio',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'La luz perfecta. El momento justo.',
      heroLine: 'Fotografía que habla sin palabras.',
      description: `${name} documenta momentos con precisión artística. Cada encuadre es intencional, cada luz es trabajada, cada historia es única.`,
      services: ['Sesiones de marca', 'Fotografía de eventos', 'Editorial & moda', 'Fotografía de producto'],
      cta: 'Ver trabajo',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Tu historia, en imágenes que perduran.',
      heroLine: 'Arte visual que trasciende el tiempo.',
      description: `En ${name} fotografiar es un acto de escucha. Entendemos a las personas, las marcas y los momentos para capturar lo que realmente importa.`,
      services: ['Retratos de autor', 'Cobertura de eventos', 'Branding visual', 'Fine art photography'],
      cta: 'Hablemos de tu proyecto',
    }),
  ],
  'travel-tourism': [
    (name) => ({
      headline: `${name}`,
      tagline: 'El mundo te espera.',
      heroLine: 'Viajes que transforman.',
      description: `${name} diseña experiencias de viaje únicas e irrepetibles, con itinerarios personalizados que combinan aventura, cultura y confort.`,
      services: ['Paquetes de viaje', 'Viajes personalizados', 'Turismo de aventura', 'Viajes corporativos'],
      cta: 'Planear mi viaje',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Cada destino, una historia nueva.',
      heroLine: 'Viaja más. Preocúpate menos.',
      description: `${name} se encarga de cada detalle para que tú solo tengas que disfrutar. Destinos cuidadosamente seleccionados y experiencias que van más allá del turismo convencional.`,
      services: ['Tours guiados', 'Viajes a medida', 'Escapadas de fin de semana', 'Travel planning'],
      cta: 'Explorar destinos',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Viajar bien es un arte.',
      heroLine: 'Experiencias que te cambian para siempre.',
      description: `En ${name} creemos que los mejores viajes son los que se preparan bien. Diseñamos itinerarios con propósito: cultura auténtica, conexiones reales y momentos únicos.`,
      services: ['Itinerarios exclusivos', 'Turismo cultural', 'Viajes de lujo', 'Grupos y familias'],
      cta: 'Diseña tu viaje',
    }),
  ],
  'gaming-esports': [
    (name) => ({
      headline: `${name}`,
      tagline: 'Juega. Compite. Domina.',
      heroLine: 'Donde los gamers se convierten en leyendas.',
      description: `${name} es el hub definitivo para la comunidad gamer: torneos, contenido exclusivo, equipamiento premium y entrenamiento competitivo.`,
      services: ['Torneos', 'Coaching profesional', 'Streaming', 'Equipamiento gaming'],
      cta: 'Unirse ahora',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'El próximo nivel te espera.',
      heroLine: 'Gaming en serio. Comunidad real.',
      description: `${name} es más que una plataforma — es donde los mejores se encuentran. Competencias organizadas, entrenamiento de élite y comunidad que te impulsa.`,
      services: ['Liga competitiva', 'Entrenamiento pro', 'Contenido & streaming', 'Tienda gamer'],
      cta: 'Entrar al juego',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'GG. Para siempre.',
      heroLine: 'Tu escena. Tu reglas. Tu juego.',
      description: `${name} reúne lo mejor del mundo gamer: competencias de alto nivel, contenido de calidad y una comunidad que entiende lo que significa jugar en serio.`,
      services: ['Torneos online & presencial', 'Coaching 1:1', 'Plataforma de streaming', 'Gear premium'],
      cta: 'Únete ahora',
    }),
  ],
  'other': [
    (name) => ({
      headline: `${name}`,
      tagline: 'Excelencia en todo lo que hacemos.',
      heroLine: 'Construido con cuidado. Entregado con precisión.',
      description: `${name} está comprometido a entregar resultados extraordinarios para cada cliente. Descubre lo que podemos hacer por ti.`,
      services: ['Servicio uno', 'Servicio dos', 'Servicio tres', 'Servicio cuatro'],
      cta: 'Contáctanos',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Hacemos las cosas bien.',
      heroLine: 'Resultados que hablan por sí mismos.',
      description: `En ${name} cada proyecto importa. Trabajamos con atención al detalle, plazos reales y comunicación clara de principio a fin.`,
      services: ['Consulta inicial', 'Diagnóstico', 'Implementación', 'Seguimiento'],
      cta: 'Hablemos',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Tu solución, nuestra especialidad.',
      heroLine: 'Comprometidos con lo que realmente importa.',
      description: `${name} existe para resolver problemas reales con soluciones que duran. Sin promesas vacías, con resultados concretos.`,
      services: ['Evaluación inicial', 'Plan de acción', 'Ejecución', 'Resultados medibles'],
      cta: 'Empezar ahora',
    }),
  ],
};

const COPY_TEMPLATES: Record<BusinessType, CopyVariant[]> = {
  'saas-tech': [
    (name) => ({
      headline: `${name} — Built for Scale`,
      tagline: 'Ship faster. Think bigger.',
      heroLine: 'The platform that turns ideas into products.',
      description: `${name} gives your team the tools to move with precision and confidence. From concept to deployment, we remove the friction.`,
      services: ['API Integration', 'Real-time Analytics', 'Team Collaboration', 'Enterprise Security'],
      cta: 'Start for free',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Infrastructure for teams that mean business.',
      heroLine: 'Build once. Scale indefinitely.',
      description: `${name} gives developers and teams the foundation to ship confidently. Powerful APIs, real-time data, and security that never sleeps.`,
      services: ['Developer APIs', 'Live Dashboards', 'Team Workflows', 'Compliance Tools'],
      cta: 'Try free for 14 days',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Your competitive edge, codified.',
      heroLine: 'Where great products are built.',
      description: `${name} removes the friction between idea and execution. Your team stays focused on what matters — we handle everything else.`,
      services: ['REST & GraphQL APIs', 'Real-time Monitoring', 'Access Control', 'Audit Logs'],
      cta: 'See live demo',
    }),
  ],
  'agency-studio': [
    (name) => ({
      headline: `${name}`,
      tagline: 'We craft experiences that move.',
      heroLine: 'Creative direction. Precision execution.',
      description: `${name} is a creative studio specializing in brand identity, digital experiences, and campaign strategy for forward-thinking companies.`,
      services: ['Brand Identity', 'Web Design', 'Motion & Video', 'Strategy'],
      cta: 'See our work',
    }),
    (name) => ({
      headline: `${name} Studio`,
      tagline: 'Ideas that are seen, felt, remembered.',
      heroLine: 'Applied art. Measurable results.',
      description: `${name} transforms visions into powerful brands. We combine storytelling, design, and strategy to create presences that move audiences.`,
      services: ['Full Branding', 'Digital Design', 'Video Production', 'Creative Consulting'],
      cta: "Let's talk",
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Your brand, reinvented.',
      heroLine: 'From concept to brand culture.',
      description: `At ${name} we build from scratch or take your brand to the next level. Every project is an opportunity to say something different and lasting.`,
      services: ['Visual Identity', 'UX & Web Design', 'Digital Campaigns', 'Art Direction'],
      cta: 'View portfolio',
    }),
  ],
  'restaurant-food': [
    (name) => ({
      headline: `${name}`,
      tagline: 'Every dish tells a story.',
      heroLine: 'Food crafted with intention.',
      description: `At ${name}, we believe great food is the sum of its details — sourced ingredients, patient technique, and genuine hospitality.`,
      services: ['Dine-in', 'Private Events', 'Catering', 'Takeaway'],
      cta: 'Reserve a table',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Flavor that stays with you.',
      heroLine: 'Cooking with soul. Service with warmth.',
      description: `${name} is more than a restaurant — it's an experience. Fresh ingredients, original recipes, and an atmosphere that invites you to linger.`,
      services: ["Today's Menu", 'Private Dinners', 'Wine Pairing', 'Delivery'],
      cta: 'View menu',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'From market to table.',
      heroLine: 'Honest ingredients. Unique flavors.',
      description: `At ${name}, cooking is an act of respect — for the ingredient, the diner, and tradition. Come discover something different.`,
      services: ['Seasonal Menu', "Chef's Table", 'Corporate Events', 'Gourmet Takeaway'],
      cta: 'Make a reservation',
    }),
  ],
  'ecommerce': [
    (name) => ({
      headline: `${name}`,
      tagline: 'Curated for you.',
      heroLine: 'Discover products that define your style.',
      description: `${name} brings you a carefully curated selection of premium products, designed to elevate your everyday.`,
      services: ['Free Shipping', 'Easy Returns', 'Loyalty Program', 'Gift Cards'],
      cta: 'Shop now',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'What you need, where you need it.',
      heroLine: 'Products that make a difference.',
      description: `At ${name} you'll find the best of every category, with fast delivery, real guarantees, and support that never fails.`,
      services: ['Express Shipping', 'Extended Warranty', 'Members Club', 'Gift Wrapping'],
      cta: 'Explore store',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Quality you notice from first use.',
      heroLine: 'Shop smart. Live better.',
      description: `${name} selects every product with care: durability, design, and real value. No compromises, no filler.`,
      services: ['24h Delivery', 'Flexible Returns', 'Reward Points', 'Limited Editions'],
      cta: 'View collection',
    }),
  ],
  'portfolio-creative': [
    (name) => ({
      headline: `${name}`,
      tagline: 'Vision into form.',
      heroLine: 'Design that speaks before you do.',
      description: `${name} is a creative practice working at the intersection of visual storytelling, interaction design, and art direction.`,
      services: ['Art Direction', 'Visual Design', 'Photography', 'Illustration'],
      cta: 'View portfolio',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Creativity without shortcuts.',
      heroLine: 'Each project, a different visual story.',
      description: `${name} works in the space where concept becomes image. Projects that communicate, surprise, and endure.`,
      services: ['Visual Branding', 'Editorial Design', 'Digital Identity', 'Animation'],
      cta: 'Explore work',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Art with purpose.',
      heroLine: 'Design that transforms perception.',
      description: `${name} creates from curiosity and executes with precision. Every project starts with understanding the problem deeply before seeking the visual solution.`,
      services: ['Brand Identity', 'Creative Direction', 'Product Design', 'Visual Consulting'],
      cta: "Let's work together",
    }),
  ],
  'luxury-jewelry': [
    (name) => ({
      headline: `${name}`,
      tagline: 'Worn with intention.',
      heroLine: 'Crafted for moments that last forever.',
      description: `${name} creates fine jewelry that carries meaning. Each piece is handcrafted by artisans and designed to become an heirloom.`,
      services: ['Fine Jewelry', 'Custom Design', 'Engraving', 'Restoration'],
      cta: 'Explore the collection',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Pieces that tell your story.',
      heroLine: 'Luxury you inherit, never forget.',
      description: `At ${name} each jewel emerges from a rigorous artisan process. Select materials, timeless design, and the detail that turns the ordinary into extraordinary.`,
      services: ['Exclusive Collections', 'Bespoke Jewelry', 'Stone Certification', 'Care & Maintenance'],
      cta: 'View collections',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'The elegance of detail.',
      heroLine: 'Every piece, a work of art.',
      description: `${name} is synonymous with signature jewelry. Inspired by nature and art, our pieces are as unique as those who wear them.`,
      services: ['Haute Joaillerie', 'Limited Editions', 'Private Consultation', 'Luxury Packaging'],
      cta: 'Book a private visit',
    }),
  ],
  'real-estate': [
    (name) => ({
      headline: `${name}`,
      tagline: 'Find your place.',
      heroLine: 'Where you live shapes how you live.',
      description: `${name} connects discerning buyers with exceptional properties. We go beyond transactions to find homes that truly fit your life.`,
      services: ['Residential Sales', 'Rentals', 'Property Management', 'Valuations'],
      cta: 'Browse properties',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Your next home is waiting.',
      heroLine: 'Properties that inspire. Guidance that reassures.',
      description: `${name} accompanies every stage of your real estate decision. From search to keys in hand, we're with you.`,
      services: ['Buying & Selling', 'Leasing', 'Real Estate Investment', 'Appraisals'],
      cta: 'Search properties',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Smart investments. Ideal homes.',
      heroLine: 'The right space changes everything.',
      description: `At ${name} we understand that buying a property is one of the most important decisions of your life. We approach it with data, experience, and honesty.`,
      services: ['Premium Residential', 'Commercial Properties', 'Investment Portfolio', 'Full Concierge'],
      cta: 'Talk to an advisor',
    }),
  ],
  'fitness-health': [
    (name) => ({
      headline: `${name}`,
      tagline: 'Move with purpose.',
      heroLine: 'Your best performance starts here.',
      description: `${name} is built on one belief: consistent effort compounds into extraordinary results. We give you the environment and guidance to make it happen.`,
      services: ['Personal Training', 'Group Classes', 'Nutrition', 'Recovery'],
      cta: 'Start training',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Stronger every day.',
      heroLine: 'The body you want. The method that works.',
      description: `At ${name} we don't sell empty motivation — we offer real methodology, certified coaches, and a space designed for progress.`,
      services: ['Personalized Plans', 'HIIT & Functional', 'Nutrition Tracking', 'Physiotherapy'],
      cta: 'Start today',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Your transformation, our mission.',
      heroLine: 'Health that is built, not improvised.',
      description: `${name} integrates training, nutrition, and mental wellbeing in one place. Real results, constant support.`,
      services: ['Integral Coaching', 'Specialty Classes', 'Nutrition Plan', 'Recovery Zone'],
      cta: 'View plans',
    }),
  ],
  'auto-detailing': [
    (name) => ({
      headline: `${name}`,
      tagline: 'Your car, perfected.',
      heroLine: 'Detail is everything.',
      description: `${name} delivers professional-grade auto detailing using premium products and meticulous technique. We restore, protect, and enhance.`,
      services: ['Full Detail', 'Paint Correction', 'Ceramic Coating', 'Interior Refresh'],
      cta: 'Book a detail',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Obsessed with perfection.',
      heroLine: 'Your vehicle deserves the best care.',
      description: `At ${name} every car is treated as if it were our own. We use the finest products and processes to guarantee a finish that exceeds expectations.`,
      services: ['Premium Wash', 'Polish & Wax', 'PPF Protection', 'Engine Detailing'],
      cta: 'Get a quote',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Gleaming outside. Flawless inside.',
      heroLine: 'Professional care. Visible results.',
      description: `${name} combines technical expertise and passion for cars to deliver results that last. No shortcuts, no compromises.`,
      services: ['Exterior Detailing', 'Interior Treatment', 'Ceramic Coating', 'Paint Protection Film'],
      cta: 'Book now',
    }),
  ],
  'professional-services': [
    (name) => ({
      headline: `${name}`,
      tagline: 'Expertise that moves the needle.',
      heroLine: 'Strategic thinking. Measurable outcomes.',
      description: `${name} provides expert counsel and hands-on execution for businesses navigating complexity. We partner with leaders to drive real results.`,
      services: ['Consulting', 'Advisory', 'Implementation', 'Training'],
      cta: 'Get in touch',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'The right knowledge at the right moment.',
      heroLine: 'Solutions that scale. Teams that grow.',
      description: `${name} works with organizations that want results, not excuses. We bring proven methodology, fresh perspective, and real commitment.`,
      services: ['Organizational Diagnosis', 'Business Strategy', 'Digital Transformation', 'Executive Training'],
      cta: 'Schedule a call',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Your business, our commitment.',
      heroLine: 'From vision to result, step by step.',
      description: `At ${name} we believe quality advisory changes businesses. That's why we approach every project with depth, honesty, and focus on impact.`,
      services: ['Strategic Consulting', 'Change Management', 'Process Audit', 'Executive Mentoring'],
      cta: "Let's work together",
    }),
  ],
  'music-events': [
    (name) => ({
      headline: `${name}`,
      tagline: 'The sound that moves crowds.',
      heroLine: 'Experiences you will not forget.',
      description: `${name} produces live music events and experiences that connect artists and audiences through world-class production.`,
      services: ['Event Production', 'Artist Booking', 'Pro Sound', 'Event Marketing'],
      cta: 'See upcoming events',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Where music comes alive.',
      heroLine: 'Every show, a unique experience.',
      description: `${name} designs and produces events that go beyond entertainment. From intimate sets to major festivals, we make every note count.`,
      services: ['Festivals & Shows', 'Technical Production', 'Artist Management', 'Immersive Experiences'],
      cta: 'View lineup',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Music as a total experience.',
      heroLine: 'Production you feel, not just hear.',
      description: `At ${name} music is the center but experience is everything. Impeccable production, artistic curation, and spaces designed to live the sound.`,
      services: ['Live Events', 'Audiovisual Production', 'DJs & Artists', 'Private Experiences'],
      cta: 'Explore events',
    }),
  ],
  'education': [
    (name) => ({
      headline: `${name}`,
      tagline: 'Knowledge that transforms.',
      heroLine: 'Learn differently. Grow faster.',
      description: `${name} delivers education programs designed for the real world, blending proven methodology with cutting-edge technology.`,
      services: ['Online Courses', 'Personal Mentoring', 'Certifications', 'Workshops'],
      cta: 'Explore courses',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: "Learn today what the world needs tomorrow.",
      heroLine: 'Education that opens doors.',
      description: `${name} trains professionals ready for real challenges. Updated programs, industry-active instructors, and a community that boosts your career.`,
      services: ['Intensive Bootcamps', 'Self-paced Courses', 'Career Advisory', 'Learning Community'],
      cta: 'View programs',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Learning that never stops.',
      heroLine: 'More than courses — a community that drives you.',
      description: `At ${name} we believe learning well is the most profitable investment. Expert-designed programs, real support, and proven outcomes.`,
      services: ['Online Training', '1:1 Mentoring', 'Real Projects', 'Recognized Certificates'],
      cta: 'Start now',
    }),
  ],
  'beauty-salon': [
    (name) => ({
      headline: `${name}`,
      tagline: 'Your best self, every day.',
      heroLine: 'Where care becomes art.',
      description: `${name} is a premium beauty space where every service is designed to enhance your confidence and wellbeing.`,
      services: ['Cut & Color', 'Facial Treatments', 'Nail Care', 'Professional Makeup'],
      cta: 'Book appointment',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Beauty with purpose.',
      heroLine: 'The ritual of self-care starts here.',
      description: `At ${name} every visit is a moment for you. Certified experts, premium products, and an atmosphere that invites you to relax and shine.`,
      services: ['Advanced Colorimetry', 'Beauty Rituals', 'Nail Art', 'Beauty Coaching'],
      cta: 'Book now',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'You decide how you shine.',
      heroLine: 'Salon experience. Editorial results.',
      description: `${name} fuses trend and technique to deliver results that show. Every appointment is a personalized experience from start to finish.`,
      services: ['Personalized Styling', 'Hair Treatments', 'Premium Skincare', 'Occasion Makeup'],
      cta: 'View services',
    }),
  ],
  'legal-finance': [
    (name) => ({
      headline: `${name}`,
      tagline: 'Your assets, protected.',
      heroLine: 'Legal clarity. Financial strength.',
      description: `${name} provides elite legal and financial advisory, focused on protecting and growing our clients' wealth with precision.`,
      services: ['Legal Advisory', 'Financial Planning', 'Investment Management', 'Asset Protection'],
      cta: 'Schedule consultation',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Informed decisions. Secure outcomes.',
      heroLine: 'Your financial peace of mind starts with the right advice.',
      description: `${name} combines legal and financial expertise to protect what matters most to you. Clear advice, tailored solutions.`,
      services: ['Corporate Law', 'Personal Finance', 'Investments', 'Tax Planning'],
      cta: 'Request consultation',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Experts in what matters most.',
      heroLine: 'Advisory that protects. Strategy that multiplies.',
      description: `At ${name} we understand every client has unique needs. That's why we offer comprehensive legal and financial solutions, always with a personalized approach.`,
      services: ['Legal Structuring', 'Wealth Management', 'Due Diligence', 'Compliance & Risk'],
      cta: 'Talk to us',
    }),
  ],
  'construction': [
    (name) => ({
      headline: `${name}`,
      tagline: 'We build to last.',
      heroLine: 'From structure to finish, no compromises.',
      description: `${name} is a construction firm with decades of experience in high-complexity residential, commercial, and industrial projects.`,
      services: ['Residential Construction', 'Commercial Projects', 'Renovations', 'Project Management'],
      cta: 'Request a quote',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Quality that is built, not improvised.',
      heroLine: 'Every project, a legacy.',
      description: `${name} executes with technical rigor and deadline compliance. Years of experience backing projects that exceed expectations and stand the test of time.`,
      services: ['Civil Works', 'Residential Projects', 'Renovation & Finishes', 'Site Supervision'],
      cta: 'Get your quote',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'The foundation is everything.',
      heroLine: 'We build with precision. We deliver with pride.',
      description: `At ${name} every square meter bears our quality signature. Certified materials, expert workmanship, and guaranteed compliance.`,
      services: ['Turnkey Construction', 'Design & Build', 'Space Rehabilitation', 'Project Management'],
      cta: 'Start a project',
    }),
  ],
  'pet-services': [
    (name) => ({
      headline: `${name}`,
      tagline: 'Your pet deserves the best.',
      heroLine: 'Care with love and professionalism.',
      description: `${name} offers comprehensive pet wellbeing services, with certified staff and a safe, warm environment your pet will love.`,
      services: ['Veterinary Care', 'Grooming', 'Pet Hotel', 'Training'],
      cta: 'Book appointment',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Happy pets, happy you.',
      heroLine: "Your pet's wellbeing, our priority.",
      description: `At ${name} we treat every pet as if it were our own. From veterinary consultations to spa grooming, always with maximum care.`,
      services: ['Vet Consultation', 'Bath & Styling', 'Day Care', 'Obedience Classes'],
      cta: 'View services',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Professional love for those you love most.',
      heroLine: 'We care for what matters most.',
      description: `${name} is the space where your pet feels at home. Passionate staff, premium facilities, and services designed for their total wellbeing.`,
      services: ['Veterinary Medicine', 'Spa & Grooming', 'Premium Boarding', 'Animal Nutrition'],
      cta: 'Reserve now',
    }),
  ],
  'nonprofit': [
    (name) => ({
      headline: `${name}`,
      tagline: 'Together, we make a difference.',
      heroLine: 'Real impact, one community at a time.',
      description: `${name} works every day to create a more equitable and sustainable world, supported by committed volunteers and generous donors.`,
      services: ['Community Programs', 'Volunteering', 'Donations', 'Corporate Partnerships'],
      cta: 'Join our cause',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Change starts with those who act.',
      heroLine: 'We transform intention into impact.',
      description: `${name} turns solidarity into concrete action. Real-metric programs, full transparency, and a community that grows with every project.`,
      services: ['Social Projects', 'Volunteer Network', 'Donation Campaign', 'Corporate Responsibility'],
      cta: 'Support our mission',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Impact that transcends.',
      heroLine: 'Every action counts. Every dollar matters.',
      description: `At ${name} we believe in transparency and action. Every project we support has clear objectives, rigorous tracking, and visible results.`,
      services: ['Community Initiatives', 'Corporate Volunteering', 'In-kind Donations', 'Social Education'],
      cta: 'Get involved',
    }),
  ],
  'photography': [
    (name) => ({
      headline: `${name}`,
      tagline: 'We capture what words cannot.',
      heroLine: 'Every image tells your story.',
      description: `${name} is a photography studio specializing in portraits, events, and commercial photography that transcends the ordinary.`,
      services: ['Wedding Photography', 'Portraits', 'Commercial Photography', 'Professional Editing'],
      cta: 'View portfolio',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Perfect light. Perfect moment.',
      heroLine: 'Photography that speaks without words.',
      description: `${name} documents moments with artistic precision. Every frame is intentional, every light is worked, every story is unique.`,
      services: ['Brand Sessions', 'Event Photography', 'Editorial & Fashion', 'Product Photography'],
      cta: 'View work',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Your story, in images that endure.',
      heroLine: 'Visual art that transcends time.',
      description: `At ${name} photography is an act of listening. We understand people, brands, and moments to capture what truly matters.`,
      services: ['Author Portraits', 'Event Coverage', 'Visual Branding', 'Fine Art Photography'],
      cta: "Let's talk",
    }),
  ],
  'travel-tourism': [
    (name) => ({
      headline: `${name}`,
      tagline: 'The world is waiting.',
      heroLine: 'Journeys that transform.',
      description: `${name} designs unique travel experiences with personalized itineraries that combine adventure, culture, and comfort.`,
      services: ['Travel Packages', 'Custom Trips', 'Adventure Tourism', 'Corporate Travel'],
      cta: 'Plan my trip',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Every destination, a new story.',
      heroLine: 'Travel more. Worry less.',
      description: `${name} takes care of every detail so you can simply enjoy. Carefully selected destinations and experiences that go beyond conventional tourism.`,
      services: ['Guided Tours', 'Tailor-made Travel', 'Weekend Getaways', 'Travel Planning'],
      cta: 'Explore destinations',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Traveling well is an art.',
      heroLine: 'Experiences that change you forever.',
      description: `At ${name} we believe the best trips are the ones well prepared. We design purposeful itineraries: authentic culture, real connections, unique moments.`,
      services: ['Exclusive Itineraries', 'Cultural Tourism', 'Luxury Travel', 'Groups & Families'],
      cta: 'Design your trip',
    }),
  ],
  'gaming-esports': [
    (name) => ({
      headline: `${name}`,
      tagline: 'Play. Compete. Dominate.',
      heroLine: 'Where gamers become legends.',
      description: `${name} is the ultimate hub for the gaming community: tournaments, exclusive content, premium gear, and competitive training.`,
      services: ['Tournaments', 'Pro Coaching', 'Streaming', 'Gaming Gear'],
      cta: 'Join now',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'The next level is waiting.',
      heroLine: 'Serious gaming. Real community.',
      description: `${name} is more than a platform — it's where the best meet. Organized competitions, elite training, and a community that drives you forward.`,
      services: ['Competitive League', 'Pro Training', 'Content & Streaming', 'Gamer Store'],
      cta: 'Enter the game',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'GG. Forever.',
      heroLine: 'Your scene. Your rules. Your game.',
      description: `${name} brings together the best of the gaming world: high-level competitions, quality content, and a community that understands what it means to play seriously.`,
      services: ['Online & LAN Tournaments', '1:1 Coaching', 'Streaming Platform', 'Premium Gear'],
      cta: 'Join now',
    }),
  ],
  'other': [
    (name) => ({
      headline: `${name}`,
      tagline: 'Excellence in everything we do.',
      heroLine: 'Built with care. Delivered with precision.',
      description: `${name} is committed to delivering outstanding results for every client. Discover what we can do for you.`,
      services: ['Service One', 'Service Two', 'Service Three', 'Service Four'],
      cta: 'Contact us',
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'We get things done right.',
      heroLine: 'Results that speak for themselves.',
      description: `At ${name} every project matters. We work with attention to detail, realistic deadlines, and clear communication from start to finish.`,
      services: ['Initial Consultation', 'Diagnosis', 'Implementation', 'Follow-up'],
      cta: "Let's talk",
    }),
    (name) => ({
      headline: `${name}`,
      tagline: 'Your solution, our specialty.',
      heroLine: 'Committed to what really matters.',
      description: `${name} exists to solve real problems with solutions that last. No empty promises, concrete results.`,
      services: ['Initial Assessment', 'Action Plan', 'Execution', 'Measurable Results'],
      cta: 'Get started',
    }),
  ],
};

// Seed-based picker: selects deterministically from array using a numeric seed
function seedPick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length]!;
}

function selectPalette(businessType: BusinessType, mood: Mood, theme: 'dark' | 'light', seed: number): BrandCard['colors'] {
  const palettes = theme === 'dark' ? DARK_PALETTES : LIGHT_PALETTES;

  // 1:N — each type has 2-3 palette options; seed picks among them
  const darkMap: Record<string, string[]> = {
    'restaurant-food':      ['warm-night', 'ember', 'forest', 'amber', 'rose'],
    'luxury-jewelry':       ['warm-night', 'slate-gold', 'indigo', 'deep-teal', 'violet'],
    'saas-tech':            ['indigo', 'deep-teal', 'cyan', 'violet', 'ember'],
    'agency-studio':        ['ember', 'violet', 'indigo', 'deep-teal', 'rose'],
    'portfolio-creative':   ['deep-teal', 'violet', 'ember', 'forest', 'cyan'],
    'fitness-health':       ['forest', 'ember', 'indigo', 'cyan', 'amber'],
    'auto-detailing':       ['ember', 'deep-teal', 'warm-night', 'indigo', 'slate-gold'],
    'ecommerce':            ['deep-teal', 'indigo', 'violet', 'ember', 'rose'],
    'real-estate':          ['indigo', 'warm-night', 'slate-gold', 'deep-teal', 'violet'],
    'professional-services':['deep-teal', 'indigo', 'forest', 'cyan', 'slate-gold'],
    'music-events':         ['ember', 'violet', 'rose', 'indigo', 'deep-teal'],
    'education':            ['indigo', 'forest', 'cyan', 'deep-teal', 'amber'],
    'beauty-salon':         ['rose', 'ember', 'warm-night', 'violet', 'indigo'],
    'legal-finance':        ['deep-teal', 'indigo', 'slate-gold', 'warm-night', 'cyan'],
    'construction':         ['ember', 'amber', 'deep-teal', 'forest', 'slate-gold'],
    'pet-services':         ['forest', 'deep-teal', 'warm-night', 'cyan', 'amber'],
    'nonprofit':            ['forest', 'indigo', 'cyan', 'deep-teal', 'ember'],
    'photography':          ['warm-night', 'deep-teal', 'slate-gold', 'ember', 'violet'],
    'travel-tourism':       ['deep-teal', 'forest', 'cyan', 'indigo', 'amber'],
    'gaming-esports':       ['indigo', 'violet', 'ember', 'rose', 'deep-teal'],
    'other':                ['indigo', 'ember', 'deep-teal', 'forest', 'violet'],
  };

  const lightMap: Record<string, string[]> = {
    'restaurant-food':      ['warm-ivory', 'sand', 'cream', 'sage', 'blush'],
    'luxury-jewelry':       ['cream', 'sand', 'lavender', 'warm-ivory', 'blush'],
    'saas-tech':            ['cool-gray', 'sky', 'cream', 'lavender', 'warm-ivory'],
    'agency-studio':        ['warm-ivory', 'blush', 'lavender', 'cool-gray', 'cream'],
    'portfolio-creative':   ['cream', 'lavender', 'sky', 'warm-ivory', 'blush'],
    'fitness-health':       ['cool-gray', 'sage', 'sky', 'warm-ivory', 'cream'],
    'auto-detailing':       ['warm-ivory', 'cool-gray', 'sand', 'cream', 'sky'],
    'ecommerce':            ['cream', 'blush', 'lavender', 'warm-ivory', 'cool-gray'],
    'real-estate':          ['cream', 'sand', 'cool-gray', 'lavender', 'warm-ivory'],
    'professional-services':['cool-gray', 'cream', 'sky', 'warm-ivory', 'sand'],
    'music-events':         ['warm-ivory', 'blush', 'lavender', 'cream', 'cool-gray'],
    'education':            ['cool-gray', 'sky', 'lavender', 'warm-ivory', 'cream'],
    'beauty-salon':         ['blush', 'cream', 'lavender', 'warm-ivory', 'sand'],
    'legal-finance':        ['cool-gray', 'cream', 'sand', 'warm-ivory', 'sky'],
    'construction':         ['warm-ivory', 'sand', 'cool-gray', 'cream', 'sage'],
    'pet-services':         ['sage', 'cream', 'sky', 'warm-ivory', 'blush'],
    'nonprofit':            ['sage', 'cool-gray', 'cream', 'sky', 'warm-ivory'],
    'photography':          ['cream', 'cool-gray', 'sand', 'lavender', 'warm-ivory'],
    'travel-tourism':       ['sky', 'sage', 'cool-gray', 'warm-ivory', 'cream'],
    'gaming-esports':       ['lavender', 'cool-gray', 'blush', 'cream', 'sky'],
    'other':                ['cool-gray', 'cream', 'warm-ivory', 'lavender', 'sage'],
  };

  const map = theme === 'dark' ? darkMap : lightMap;
  const options = map[businessType] ?? (theme === 'dark' ? ['indigo', 'deep-teal', 'ember'] : ['cool-gray', 'cream', 'warm-ivory']);
  const key = seedPick(options, seed);
  return palettes[key]!;
}

function selectFont(businessType: BusinessType, _mood: Mood, seed: number): BrandCard['font'] {
  // 1:N — each group has multiple font options
  const techFonts = [FONTS['technical']!, FONTS['modern']!];
  const premiumFonts = [FONTS['premium']!, FONTS['creative']!];
  const creativeFonts = [FONTS['creative']!, FONTS['premium']!];
  const modernFonts = [FONTS['modern']!, FONTS['creative']!, FONTS['technical']!];

  if (['saas-tech', 'professional-services'].includes(businessType)) return seedPick(techFonts, seed);
  if (['luxury-jewelry', 'restaurant-food'].includes(businessType)) return seedPick(premiumFonts, seed);
  if (['agency-studio', 'portfolio-creative'].includes(businessType)) return seedPick(creativeFonts, seed);
  return seedPick(modernFonts, seed);
}

export async function analyzeBrand(
  businessName: string,
  businessType: BusinessType,
  mood: Mood,
  theme: 'dark' | 'light',
  description?: string,
  sourceUrl?: string,
  language: 'es' | 'en' = 'es',
  socialUrls?: string[],
  seed?: number,
): Promise<BrandCard> {
  // Generate seed if not provided — ensures each run is different
  const effectiveSeed = seed ?? (Date.now() ^ Math.floor(Math.random() * 0xffff));
  const slug = slugify(businessName, { lower: true, strict: true });
  const colors = selectPalette(businessType, mood, theme, effectiveSeed);
  const font = selectFont(businessType, mood, effectiveSeed);
  const templates = language === 'es' ? COPY_TEMPLATES_ES : COPY_TEMPLATES;
  const variants = templates[businessType] ?? templates['other'] ?? [];
  const copyFn = variants.length > 0 ? seedPick(variants, effectiveSeed) : templates['other']![0]!;
  if (typeof copyFn !== 'function') {
    const fallback = templates['other']![0]!;
    if (typeof fallback !== 'function') throw new Error('No valid copy template found');
    return { name: businessName, slug, industry: businessType.replace(/-/g, ' '), businessType, mood, theme, language, colors, font, copy: fallback(businessName), sourceUrl, socialData: undefined };
  }
  const copy = copyFn(businessName);

  if (description) {
    copy.description = description;
  }

  // ── Scraping de redes sociales / sitio web existente ──────────────────────
  let socialData: BrandCard['socialData'] | undefined;
  if (socialUrls && socialUrls.length > 0) {
    const scrapeResults = await Promise.allSettled(
      socialUrls.map(u => scrapeSocialProfile(u)),
    );
    const successful = scrapeResults
      .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof scrapeSocialProfile>>> => r.status === 'fulfilled')
      .map(r => r.value);

    if (successful.length > 0) {
      socialData = mergeSocialSources(successful);

      // Aplicar colores de la marca si se encontraron
      if (socialData.colors.length >= 1) {
        colors.accent = socialData.colors[0]!;
      }

      // Usar bio como descripción si no se proporcionó una
      if (!description && socialData.bio) {
        copy.description = socialData.bio;
      }

      // Enriquecer nombre de la empresa si se detectó uno más preciso
      // (solo si el nombre scrapeado contiene el nombre que el usuario ingresó)
      if (
        socialData.profileName &&
        socialData.profileName.toLowerCase().includes(businessName.toLowerCase().split(' ')[0]!) &&
        socialData.profileName.length < 60
      ) {
        copy.headline = socialData.profileName;
      }
    }
  }

  // Enrich copy with OpenAI in the correct language if available
  if (hasOpenAI()) {
    try {
      const langInstruction = language === 'es'
        ? 'Escribe TODO el copy en ESPAÑOL. No uses inglés en ningún campo.'
        : 'Write ALL copy in ENGLISH.';
      const socialContext = socialData
        ? `\nSocial/web data found:\n- Bio: "${socialData.bio ?? 'n/a'}"\n- Category: "${socialData.category ?? 'n/a'}"\n- Headlines found: ${socialData.headlines.slice(0, 3).join(' | ')}`
        : '';
      const forbiddenDefaults = language === 'es'
        ? 'NO uses frases genéricas como "Excelencia en todo lo que hacemos" o "Construido con cuidado". Sé específico para este negocio.'
        : 'Do NOT use generic phrases like "Excellence in everything we do" or "Built with care". Be specific to this business.';
      const enriched = await creativeChat(
        `You are a brand copywriter. ${langInstruction} Return ONLY valid JSON with keys: headline, tagline, heroLine, description, services (array of 4 strings), cta. ${forbiddenDefaults} Be bold, specific, and memorable.`,
        `Business: "${businessName}". Type: ${businessType}. Mood: ${mood}. Theme: ${theme}. Variation seed: ${effectiveSeed % 1000}.${description ? ` Context: ${description}` : ''}${socialContext}\n\nWrite compelling copy. Keep it concise and match the tone. Make it distinct from typical ${businessType} websites.`,
        effectiveSeed,
      );
      const parsed = parseJSON<typeof copy>(enriched);
      if (parsed && typeof parsed === 'object') {
        if (typeof parsed.headline === 'string') copy.headline = parsed.headline;
        if (typeof parsed.tagline === 'string') copy.tagline = parsed.tagline;
        if (typeof parsed.heroLine === 'string') copy.heroLine = parsed.heroLine;
        if (typeof parsed.description === 'string') copy.description = parsed.description;
        if (Array.isArray(parsed.services) && parsed.services.every((s: unknown) => typeof s === 'string')) copy.services = parsed.services;
        if (typeof parsed.cta === 'string') copy.cta = parsed.cta;
      }
    } catch {
      // Keep deterministic copy on failure
    }
  }

  return {
    name: businessName,
    slug,
    industry: businessType.replace(/-/g, ' '),
    businessType,
    mood,
    theme,
    language,
    colors,
    font,
    copy,
    sourceUrl,
    socialData,
  };
}
