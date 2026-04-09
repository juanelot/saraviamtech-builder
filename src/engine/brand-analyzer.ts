import type { BrandCard, BusinessType, Mood } from '../types/index.js';
import slugify from 'slugify';
import { hasOpenAI, creativeChat, parseJSON } from '../lib/openai.js';
import { scrapeSocialProfile, mergeSocialSources } from './social-scraper.js';

const DARK_PALETTES: Record<string, BrandCard['colors']> = {
  'warm-night': { bg: '#09090b', surface: '#111114', accent: '#c8a97e', text: '#eae7e2', muted: '#5a5a5e' },
  'deep-teal': { bg: '#0a0a0b', surface: '#111114', accent: '#5eadb5', text: '#eae7e2', muted: '#5a5a5e' },
  'ember': { bg: '#09090b', surface: '#111114', accent: '#e85d3a', text: '#eae7e2', muted: '#5a5a5e' },
  'indigo': { bg: '#09090b', surface: '#111114', accent: '#4f46e5', text: '#eae7e2', muted: '#5a5a5e' },
  'forest': { bg: '#09090b', surface: '#111114', accent: '#4ca879', text: '#eae7e2', muted: '#5a5a5e' },
};

const LIGHT_PALETTES: Record<string, BrandCard['colors']> = {
  'cream': { bg: '#f5f3ef', surface: '#ffffff', accent: '#4f46e5', text: '#1a1a1f', muted: '#6b6b73' },
  'warm-ivory': { bg: '#fafaf8', surface: '#ffffff', accent: '#e85d3a', text: '#1a1a1f', muted: '#6b6b73' },
  'cool-gray': { bg: '#fafafa', surface: '#ffffff', accent: '#5eadb5', text: '#1a1a1f', muted: '#6b6b73' },
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

const COPY_TEMPLATES_ES: Record<BusinessType, (name: string) => BrandCard['copy']> = {
  'saas-tech': (name) => ({
    headline: `${name} — Construido para escalar`,
    tagline: 'Lanza más rápido. Piensa en grande.',
    heroLine: 'La plataforma que convierte ideas en productos.',
    description: `${name} le da a tu equipo las herramientas para moverse con precisión y confianza. Del concepto al lanzamiento, eliminamos la fricción.`,
    services: ['Integración API', 'Analítica en tiempo real', 'Colaboración en equipo', 'Seguridad empresarial'],
    cta: 'Empieza gratis',
  }),
  'agency-studio': (name) => ({
    headline: `${name}`,
    tagline: 'Creamos experiencias que impactan.',
    heroLine: 'Dirección creativa. Ejecución precisa.',
    description: `${name} es un estudio creativo especializado en identidad de marca, experiencias digitales y estrategia de campaña para empresas visionarias.`,
    services: ['Identidad de marca', 'Diseño web', 'Motion & Video', 'Estrategia'],
    cta: 'Ver nuestro trabajo',
  }),
  'restaurant-food': (name) => ({
    headline: `${name}`,
    tagline: 'Cada plato cuenta una historia.',
    heroLine: 'Comida elaborada con intención.',
    description: `En ${name} creemos que la buena cocina está en los detalles: ingredientes de origen, técnica paciente y hospitalidad genuina.`,
    services: ['Comer en el lugar', 'Eventos privados', 'Catering', 'Para llevar'],
    cta: 'Reservar mesa',
  }),
  'ecommerce': (name) => ({
    headline: `${name}`,
    tagline: 'Curado para ti.',
    heroLine: 'Descubre productos que definen tu estilo.',
    description: `${name} te ofrece una selección cuidadosamente curada de productos premium, diseñados para elevar tu día a día.`,
    services: ['Envío gratis', 'Devoluciones fáciles', 'Programa de lealtad', 'Tarjetas de regalo'],
    cta: 'Comprar ahora',
  }),
  'portfolio-creative': (name) => ({
    headline: `${name}`,
    tagline: 'Visión hecha forma.',
    heroLine: 'Diseño que habla antes que tú.',
    description: `${name} es una práctica creativa en la intersección del storytelling visual, el diseño de interacción y la dirección de arte.`,
    services: ['Dirección de arte', 'Diseño visual', 'Fotografía', 'Ilustración'],
    cta: 'Ver portafolio',
  }),
  'luxury-jewelry': (name) => ({
    headline: `${name}`,
    tagline: 'Llevado con intención.',
    heroLine: 'Creado para momentos que duran para siempre.',
    description: `${name} crea joyería fina con significado. Cada pieza es elaborada a mano por artesanos y diseñada para convertirse en una reliquia.`,
    services: ['Joyería fina', 'Diseño personalizado', 'Grabado', 'Restauración'],
    cta: 'Explorar la colección',
  }),
  'real-estate': (name) => ({
    headline: `${name}`,
    tagline: 'Encuentra tu lugar.',
    heroLine: 'Donde vives define cómo vives.',
    description: `${name} conecta a compradores exigentes con propiedades excepcionales. Vamos más allá de la transacción para encontrar hogares que se adapten a tu vida.`,
    services: ['Venta residencial', 'Alquileres', 'Administración de propiedades', 'Valoraciones'],
    cta: 'Ver propiedades',
  }),
  'fitness-health': (name) => ({
    headline: `${name}`,
    tagline: 'Muévete con propósito.',
    heroLine: 'Tu mejor rendimiento empieza aquí.',
    description: `${name} se basa en una creencia: el esfuerzo constante se convierte en resultados extraordinarios. Te damos el entorno y la guía para lograrlo.`,
    services: ['Entrenamiento personal', 'Clases grupales', 'Nutrición', 'Recuperación'],
    cta: 'Comenzar a entrenar',
  }),
  'auto-detailing': (name) => ({
    headline: `${name}`,
    tagline: 'Tu auto, perfeccionado.',
    heroLine: 'El detalle lo es todo.',
    description: `${name} ofrece detallado automotriz profesional usando productos premium y técnica meticulosa. Restauramos, protegemos y realzamos.`,
    services: ['Detallado completo', 'Corrección de pintura', 'Recubrimiento cerámico', 'Renovación de interior'],
    cta: 'Reservar servicio',
  }),
  'professional-services': (name) => ({
    headline: `${name}`,
    tagline: 'Experiencia que mueve la aguja.',
    heroLine: 'Pensamiento estratégico. Resultados medibles.',
    description: `${name} brinda asesoría experta y ejecución práctica para empresas que navegan la complejidad. Nos asociamos con líderes para generar resultados reales.`,
    services: ['Consultoría', 'Asesoría', 'Implementación', 'Capacitación'],
    cta: 'Ponerse en contacto',
  }),
  'music-events': (name) => ({
    headline: `${name}`,
    tagline: 'El sonido que mueve multitudes.',
    heroLine: 'Experiencias que no se olvidan.',
    description: `${name} produce eventos musicales y experiencias en vivo que conectan artistas y audiencias a través de producción de primer nivel.`,
    services: ['Producción de eventos', 'Booking de artistas', 'Sonido profesional', 'Marketing de eventos'],
    cta: 'Ver próximos eventos',
  }),
  'education': (name) => ({
    headline: `${name}`,
    tagline: 'El conocimiento que te transforma.',
    heroLine: 'Aprende diferente. Crece más rápido.',
    description: `${name} ofrece programas educativos diseñados para el mundo real, combinando metodología probada con tecnología de vanguardia.`,
    services: ['Cursos online', 'Mentoría personalizada', 'Certificaciones', 'Talleres presenciales'],
    cta: 'Explorar cursos',
  }),
  'beauty-salon': (name) => ({
    headline: `${name}`,
    tagline: 'Tu mejor versión, cada día.',
    heroLine: 'Donde el cuidado se convierte en arte.',
    description: `${name} es un espacio de belleza premium donde cada servicio está diseñado para realzar tu confianza y bienestar.`,
    services: ['Corte y color', 'Tratamientos faciales', 'Manicura y pedicura', 'Maquillaje profesional'],
    cta: 'Reservar cita',
  }),
  'legal-finance': (name) => ({
    headline: `${name}`,
    tagline: 'Tu patrimonio, protegido.',
    heroLine: 'Claridad legal. Solidez financiera.',
    description: `${name} provee asesoría legal y financiera de alto nivel, con enfoque en proteger y hacer crecer el patrimonio de nuestros clientes.`,
    services: ['Asesoría legal', 'Planificación financiera', 'Gestión de inversiones', 'Protección patrimonial'],
    cta: 'Agendar consulta',
  }),
  'construction': (name) => ({
    headline: `${name}`,
    tagline: 'Construimos para durar.',
    heroLine: 'De la estructura al acabado, sin compromisos.',
    description: `${name} es una empresa constructora con décadas de experiencia en proyectos residenciales, comerciales e industriales de alta complejidad.`,
    services: ['Construcción residencial', 'Proyectos comerciales', 'Remodelaciones', 'Gestión de obra'],
    cta: 'Solicitar presupuesto',
  }),
  'pet-services': (name) => ({
    headline: `${name}`,
    tagline: 'Tu mascota merece lo mejor.',
    heroLine: 'Cuidado con amor y profesionalismo.',
    description: `${name} ofrece servicios integrales para el bienestar de tu mascota, con personal certificado y un ambiente seguro y cálido.`,
    services: ['Veterinaria', 'Grooming', 'Hotel para mascotas', 'Adiestramiento'],
    cta: 'Agendar cita',
  }),
  'nonprofit': (name) => ({
    headline: `${name}`,
    tagline: 'Juntos, hacemos la diferencia.',
    heroLine: 'Un impacto real, una comunidad a la vez.',
    description: `${name} trabaja cada día para crear un mundo más equitativo y sostenible, apoyado por voluntarios comprometidos y donantes generosos.`,
    services: ['Programas comunitarios', 'Voluntariado', 'Donaciones', 'Alianzas corporativas'],
    cta: 'Únete a nuestra causa',
  }),
  'photography': (name) => ({
    headline: `${name}`,
    tagline: 'Capturamos lo que las palabras no pueden.',
    heroLine: 'Cada imagen cuenta tu historia.',
    description: `${name} es un estudio fotográfico especializado en retratos, eventos y fotografía comercial que trasciende lo ordinario.`,
    services: ['Fotografía de bodas', 'Retratos', 'Fotografía comercial', 'Edición profesional'],
    cta: 'Ver portafolio',
  }),
  'travel-tourism': (name) => ({
    headline: `${name}`,
    tagline: 'El mundo te espera.',
    heroLine: 'Viajes que transforman.',
    description: `${name} diseña experiencias de viaje únicas e irrepetibles, con itinerarios personalizados que combinan aventura, cultura y confort.`,
    services: ['Paquetes de viaje', 'Viajes personalizados', 'Turismo de aventura', 'Viajes corporativos'],
    cta: 'Planear mi viaje',
  }),
  'gaming-esports': (name) => ({
    headline: `${name}`,
    tagline: 'Juega. Compite. Domina.',
    heroLine: 'Donde los gamers se convierten en leyendas.',
    description: `${name} es el hub definitivo para la comunidad gamer: torneos, contenido exclusivo, equipamiento premium y entrenamiento competitivo.`,
    services: ['Torneos', 'Coaching profesional', 'Streaming', 'Equipamiento gaming'],
    cta: 'Unirse ahora',
  }),
  'other': (name) => ({
    headline: `${name}`,
    tagline: 'Excelencia en todo lo que hacemos.',
    heroLine: 'Construido con cuidado. Entregado con precisión.',
    description: `${name} está comprometido a entregar resultados extraordinarios para cada cliente. Descubre lo que podemos hacer por ti.`,
    services: ['Servicio uno', 'Servicio dos', 'Servicio tres', 'Servicio cuatro'],
    cta: 'Contáctanos',
  }),
};

const COPY_TEMPLATES: Record<BusinessType, (name: string) => BrandCard['copy']> = {
  'saas-tech': (name) => ({
    headline: `${name} — Built for Scale`,
    tagline: 'Ship faster. Think bigger.',
    heroLine: 'The platform that turns ideas into products.',
    description: `${name} gives your team the tools to move with precision and confidence. From concept to deployment, we remove the friction.`,
    services: ['API Integration', 'Real-time Analytics', 'Team Collaboration', 'Enterprise Security'],
    cta: 'Start for free',
  }),
  'agency-studio': (name) => ({
    headline: `${name}`,
    tagline: 'We craft experiences that move.',
    heroLine: 'Creative direction. Precision execution.',
    description: `${name} is a creative studio specializing in brand identity, digital experiences, and campaign strategy for forward-thinking companies.`,
    services: ['Brand Identity', 'Web Design', 'Motion & Video', 'Strategy'],
    cta: 'See our work',
  }),
  'restaurant-food': (name) => ({
    headline: `${name}`,
    tagline: 'Every dish tells a story.',
    heroLine: 'Food crafted with intention.',
    description: `At ${name}, we believe great food is the sum of its details — sourced ingredients, patient technique, and genuine hospitality.`,
    services: ['Dine-in', 'Private Events', 'Catering', 'Takeaway'],
    cta: 'Reserve a table',
  }),
  'ecommerce': (name) => ({
    headline: `${name}`,
    tagline: 'Curated for you.',
    heroLine: 'Discover products that define your style.',
    description: `${name} brings you a carefully curated selection of premium products, designed to elevate your everyday.`,
    services: ['Free Shipping', 'Easy Returns', 'Loyalty Program', 'Gift Cards'],
    cta: 'Shop now',
  }),
  'portfolio-creative': (name) => ({
    headline: `${name}`,
    tagline: 'Vision into form.',
    heroLine: 'Design that speaks before you do.',
    description: `${name} is a creative practice working at the intersection of visual storytelling, interaction design, and art direction.`,
    services: ['Art Direction', 'Visual Design', 'Photography', 'Illustration'],
    cta: 'View portfolio',
  }),
  'luxury-jewelry': (name) => ({
    headline: `${name}`,
    tagline: 'Worn with intention.',
    heroLine: 'Crafted for moments that last forever.',
    description: `${name} creates fine jewelry that carries meaning. Each piece is handcrafted by artisans and designed to become an heirloom.`,
    services: ['Fine Jewelry', 'Custom Design', 'Engraving', 'Restoration'],
    cta: 'Explore the collection',
  }),
  'real-estate': (name) => ({
    headline: `${name}`,
    tagline: 'Find your place.',
    heroLine: 'Where you live shapes how you live.',
    description: `${name} connects discerning buyers with exceptional properties. We go beyond transactions to find homes that truly fit your life.`,
    services: ['Residential Sales', 'Rentals', 'Property Management', 'Valuations'],
    cta: 'Browse properties',
  }),
  'fitness-health': (name) => ({
    headline: `${name}`,
    tagline: 'Move with purpose.',
    heroLine: 'Your best performance starts here.',
    description: `${name} is built on one belief: consistent effort compounds into extraordinary results. We give you the environment and guidance to make it happen.`,
    services: ['Personal Training', 'Group Classes', 'Nutrition', 'Recovery'],
    cta: 'Start training',
  }),
  'auto-detailing': (name) => ({
    headline: `${name}`,
    tagline: 'Your car, perfected.',
    heroLine: 'Detail is everything.',
    description: `${name} delivers professional-grade auto detailing using premium products and meticulous technique. We restore, protect, and enhance.`,
    services: ['Full Detail', 'Paint Correction', 'Ceramic Coating', 'Interior Refresh'],
    cta: 'Book a detail',
  }),
  'professional-services': (name) => ({
    headline: `${name}`,
    tagline: 'Expertise that moves the needle.',
    heroLine: 'Strategic thinking. Measurable outcomes.',
    description: `${name} provides expert counsel and hands-on execution for businesses navigating complexity. We partner with leaders to drive real results.`,
    services: ['Consulting', 'Advisory', 'Implementation', 'Training'],
    cta: 'Get in touch',
  }),
  'music-events': (name) => ({
    headline: `${name}`,
    tagline: 'The sound that moves crowds.',
    heroLine: 'Experiences you will not forget.',
    description: `${name} produces live music events and experiences that connect artists and audiences through world-class production.`,
    services: ['Event Production', 'Artist Booking', 'Pro Sound', 'Event Marketing'],
    cta: 'See upcoming events',
  }),
  'education': (name) => ({
    headline: `${name}`,
    tagline: 'Knowledge that transforms.',
    heroLine: 'Learn differently. Grow faster.',
    description: `${name} delivers education programs designed for the real world, blending proven methodology with cutting-edge technology.`,
    services: ['Online Courses', 'Personal Mentoring', 'Certifications', 'Workshops'],
    cta: 'Explore courses',
  }),
  'beauty-salon': (name) => ({
    headline: `${name}`,
    tagline: 'Your best self, every day.',
    heroLine: 'Where care becomes art.',
    description: `${name} is a premium beauty space where every service is designed to enhance your confidence and wellbeing.`,
    services: ['Cut & Color', 'Facial Treatments', 'Nail Care', 'Professional Makeup'],
    cta: 'Book appointment',
  }),
  'legal-finance': (name) => ({
    headline: `${name}`,
    tagline: 'Your assets, protected.',
    heroLine: 'Legal clarity. Financial strength.',
    description: `${name} provides elite legal and financial advisory, focused on protecting and growing our clients' wealth with precision.`,
    services: ['Legal Advisory', 'Financial Planning', 'Investment Management', 'Asset Protection'],
    cta: 'Schedule consultation',
  }),
  'construction': (name) => ({
    headline: `${name}`,
    tagline: 'We build to last.',
    heroLine: 'From structure to finish, no compromises.',
    description: `${name} is a construction firm with decades of experience in high-complexity residential, commercial, and industrial projects.`,
    services: ['Residential Construction', 'Commercial Projects', 'Renovations', 'Project Management'],
    cta: 'Request a quote',
  }),
  'pet-services': (name) => ({
    headline: `${name}`,
    tagline: 'Your pet deserves the best.',
    heroLine: 'Care with love and professionalism.',
    description: `${name} offers comprehensive pet wellbeing services, with certified staff and a safe, warm environment your pet will love.`,
    services: ['Veterinary Care', 'Grooming', 'Pet Hotel', 'Training'],
    cta: 'Book appointment',
  }),
  'nonprofit': (name) => ({
    headline: `${name}`,
    tagline: 'Together, we make a difference.',
    heroLine: 'Real impact, one community at a time.',
    description: `${name} works every day to create a more equitable and sustainable world, supported by committed volunteers and generous donors.`,
    services: ['Community Programs', 'Volunteering', 'Donations', 'Corporate Partnerships'],
    cta: 'Join our cause',
  }),
  'photography': (name) => ({
    headline: `${name}`,
    tagline: 'We capture what words cannot.',
    heroLine: 'Every image tells your story.',
    description: `${name} is a photography studio specializing in portraits, events, and commercial photography that transcends the ordinary.`,
    services: ['Wedding Photography', 'Portraits', 'Commercial Photography', 'Professional Editing'],
    cta: 'View portfolio',
  }),
  'travel-tourism': (name) => ({
    headline: `${name}`,
    tagline: 'The world is waiting.',
    heroLine: 'Journeys that transform.',
    description: `${name} designs unique travel experiences with personalized itineraries that combine adventure, culture, and comfort.`,
    services: ['Travel Packages', 'Custom Trips', 'Adventure Tourism', 'Corporate Travel'],
    cta: 'Plan my trip',
  }),
  'gaming-esports': (name) => ({
    headline: `${name}`,
    tagline: 'Play. Compete. Dominate.',
    heroLine: 'Where gamers become legends.',
    description: `${name} is the ultimate hub for the gaming community: tournaments, exclusive content, premium gear, and competitive training.`,
    services: ['Tournaments', 'Pro Coaching', 'Streaming', 'Gaming Gear'],
    cta: 'Join now',
  }),
  'other': (name) => ({
    headline: `${name}`,
    tagline: 'Excellence in everything we do.',
    heroLine: 'Built with care. Delivered with precision.',
    description: `${name} is committed to delivering outstanding results for every client. Discover what we can do for you.`,
    services: ['Service One', 'Service Two', 'Service Three', 'Service Four'],
    cta: 'Contact us',
  }),
};

function selectPalette(businessType: BusinessType, mood: Mood, theme: 'dark' | 'light'): BrandCard['colors'] {
  const palettes = theme === 'dark' ? DARK_PALETTES : LIGHT_PALETTES;

  const darkMap: Record<string, string> = {
    'restaurant-food': 'warm-night',
    'luxury-jewelry': 'warm-night',
    'saas-tech': 'indigo',
    'agency-studio': 'ember',
    'portfolio-creative': 'deep-teal',
    'fitness-health': 'forest',
    'auto-detailing': 'ember',
    'ecommerce': 'deep-teal',
    'real-estate': 'indigo',
    'professional-services': 'deep-teal',
    'other': 'indigo',
  };

  const lightMap: Record<string, string> = {
    'restaurant-food': 'warm-ivory',
    'luxury-jewelry': 'cream',
    'saas-tech': 'cool-gray',
    'agency-studio': 'warm-ivory',
    'portfolio-creative': 'cream',
    'fitness-health': 'cool-gray',
    'auto-detailing': 'warm-ivory',
    'ecommerce': 'cream',
    'real-estate': 'cream',
    'professional-services': 'cool-gray',
    'other': 'cool-gray',
  };

  const map = theme === 'dark' ? darkMap : lightMap;
  const key = map[businessType] ?? (theme === 'dark' ? 'indigo' : 'cool-gray');
  return palettes[key]!;
}

function selectFont(businessType: BusinessType, _mood: Mood): BrandCard['font'] {
  if (['saas-tech', 'professional-services'].includes(businessType)) return FONTS['technical']!;
  if (['luxury-jewelry', 'restaurant-food'].includes(businessType)) return FONTS['premium']!;
  if (['agency-studio', 'portfolio-creative'].includes(businessType)) return FONTS['creative']!;
  return FONTS['modern']!;
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
): Promise<BrandCard> {
  const slug = slugify(businessName, { lower: true, strict: true });
  const colors = selectPalette(businessType, mood, theme);
  const font = selectFont(businessType, mood);
  const templates = language === 'es' ? COPY_TEMPLATES_ES : COPY_TEMPLATES;
  const copyFn = templates[businessType];
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
      const enriched = await creativeChat(
        `You are a brand copywriter. ${langInstruction} Return ONLY valid JSON with keys: headline, tagline, heroLine, description, services (array of 4 strings), cta.`,
        `Business: "${businessName}". Type: ${businessType}. Mood: ${mood}. Theme: ${theme}.${description ? ` Context: ${description}` : ''}${socialContext}\n\nWrite compelling copy. Keep it concise and match the tone.`,
      );
      const parsed = parseJSON<typeof copy>(enriched);
      Object.assign(copy, parsed);
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
