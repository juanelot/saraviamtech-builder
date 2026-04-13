/**
 * Shared utilities for section renderers.
 */
import type { DesignTokens } from '../layout-director.js';

// ─── i18n micro-dictionary ───────────────────────────────────────────────────
type Lang = 'es' | 'en';

const STRINGS: Record<string, Record<Lang, string>> = {
  // section labels
  'label.showcase':     { es: 'Galería',           en: 'Showcase' },
  'label.gallery':      { es: 'Galería',            en: 'Gallery' },
  'label.services':     { es: 'Servicios',          en: 'Services' },
  'label.our_story':    { es: 'Nuestra historia',   en: 'Our story' },
  'label.what_we_offer':{ es: 'Lo que ofrecemos',   en: 'What we offer' },
  'label.faq':          { es: 'Preguntas frecuentes', en: 'FAQ' },
  'label.testimonials': { es: 'Testimonios',        en: 'Testimonials' },
  'label.get_in_touch': { es: 'Contáctanos',        en: 'Get in touch' },
  // hero buttons / scroll
  'hero.explore':       { es: 'Explorar ↓',         en: 'Explore ↓' },
  'hero.learn_more':    { es: 'Ver más ↓',           en: 'Learn more ↓' },
  'hero.scroll':        { es: 'bajar',              en: 'scroll' },
  'hero.nav_services':  { es: 'Servicios',          en: 'Services' },
  'hero.nav_portfolio': { es: 'Portafolio',         en: 'Portfolio' },
  'hero.nav_contact':   { es: 'Contacto',           en: 'Contact' },
  // contact form
  'contact.name':       { es: 'Nombre',             en: 'Name' },
  'contact.name_ph':    { es: 'Tu nombre',          en: 'Your name' },
  'contact.email':      { es: 'Correo',             en: 'Email' },
  'contact.subject':    { es: 'Asunto',             en: 'Subject' },
  'contact.subject_ph': { es: '¿En qué te podemos ayudar?', en: 'How can we help?' },
  'contact.message':    { es: 'Mensaje',            en: 'Message' },
  'contact.message_ph': { es: 'Cuéntanos sobre tu proyecto...', en: 'Tell us about your project...' },
  // footer
  'footer.services':    { es: 'Servicios',          en: 'Services' },
  'footer.contact':     { es: 'Contacto',           en: 'Contact' },
  'footer.rights':      { es: 'Todos los derechos reservados.', en: 'All rights reserved.' },
  // faq
  'faq.heading':        { es: 'Preguntas frecuentes', en: 'Frequently asked questions' },
  'faq.q1':             { es: '¿Cuál es su plazo típico de proyecto?', en: 'What is your typical project timeline?' },
  'faq.a1':             { es: 'La mayoría de los proyectos se completan en 4–8 semanas según el alcance y la complejidad.', en: 'Most projects are completed within 4–8 weeks depending on scope, complexity, and feedback cycles.' },
  'faq.q2':             { es: '¿Trabajan con clientes internacionales?', en: 'Do you work with international clients?' },
  'faq.a2':             { es: 'Sí, trabajamos con clientes de todo el mundo con un flujo de trabajo remoto optimizado.', en: 'Yes — we work with clients globally. Our remote-first workflow is optimized for async collaboration.' },
  'faq.q3':             { es: '¿Cómo funciona su sistema de precios?', en: 'How does your pricing work?' },
  'faq.a3':             { es: 'Ofrecemos precios por proyecto y por retención. Contáctenos para una cotización personalizada.', en: 'We offer both project-based and retainer pricing. Contact us for a custom quote tailored to your needs.' },
  'faq.q4':             { es: '¿Qué pasa después de la entrega del proyecto?', en: 'What happens after project delivery?' },
  'faq.a4':             { es: 'Ofrecemos 30 días de soporte post-lanzamiento y paquetes de mantenimiento continuo.', en: 'We provide a 30-day support period post-launch and offer ongoing maintenance packages.' },
  // testimonials
  'test.heading':       { es: 'Lo que dicen nuestros clientes', en: 'What our clients say' },
  'test.t1':            { es: 'Un equipo excepcional que superó nuestras expectativas. La calidad y atención al detalle son incomparables.', en: 'An exceptional team that delivered beyond our expectations. The quality and attention to detail is unmatched.' },
  'test.t2':            { es: 'Trabajar con ellos transformó completamente la presencia de nuestra marca. Profesionales, creativos y orientados a resultados.', en: 'Working with them transformed our brand presence completely. Professional, creative, and results-driven.' },
  'test.t3':            { es: 'La colaboración más fluida que he tenido. Entendieron nuestra visión al instante y ejecutaron a la perfección.', en: 'The most seamless collaboration I\'ve ever had. They understood our vision instantly and executed flawlessly.' },
  // story
  'story.paragraph':    { es: 'Creemos en los detalles que otros pasan por alto — la textura de un acabado, el ritmo de una frase, el peso de una decisión. Cada proyecto lleva nuestra atención completa desde el primer boceto hasta la entrega final.', en: 'We believe in the details that others overlook — the texture of a finish, the cadence of a sentence, the weight of a choice. Every project carries our full attention from the first sketch to the final delivery.' },
  'story.years':        { es: 'Años de oficio',     en: 'Years of craft' },
  'story.projects':     { es: 'Proyectos entregados', en: 'Projects delivered' },
  'story.satisfaction': { es: 'Satisfacción del cliente', en: 'Client satisfaction' },
  // services
  'services.desc':      { es: 'Aportamos experiencia y precisión en cada área de trabajo.', en: 'We bring expertise and precision to every engagement in this area.' },
  // landing — hero conversion
  'landing.hero.badge':     { es: 'Nuevo', en: 'New' },
  'landing.hero.social':    { es: 'Más de {n} clientes satisfechos', en: 'Trusted by {n}+ happy clients' },
  // landing — benefits
  'landing.benefits.label': { es: 'Por qué elegirnos', en: 'Why choose us' },
  'landing.benefits.h2':    { es: 'Todo lo que necesitas para crecer', en: 'Everything you need to grow' },
  'landing.benefits.b1.title': { es: 'Resultados rápidos', en: 'Fast results' },
  'landing.benefits.b1.desc':  { es: 'Entregamos en tiempo récord sin sacrificar calidad.', en: 'We deliver in record time without sacrificing quality.' },
  'landing.benefits.b2.title': { es: 'Soporte dedicado', en: 'Dedicated support' },
  'landing.benefits.b2.desc':  { es: 'Un equipo experto disponible cuando lo necesitas.', en: 'An expert team available when you need them.' },
  'landing.benefits.b3.title': { es: 'Probado y escalable', en: 'Proven & scalable' },
  'landing.benefits.b3.desc':  { es: 'Soluciones que crecen con tu negocio.', en: 'Solutions that scale with your business.' },
  'landing.benefits.b4.title': { es: 'Sin complicaciones', en: 'No hassle' },
  'landing.benefits.b4.desc':  { es: 'Proceso claro, comunicación directa, sin sorpresas.', en: 'Clear process, direct communication, no surprises.' },
  // landing — social proof
  'landing.proof.label':   { es: 'Empresas que confían en nosotros', en: 'Trusted by' },
  'landing.proof.h2':      { es: 'Ellos ya lo comprobaron', en: 'They already verified it' },
  // landing — pricing
  'landing.pricing.label': { es: 'Planes', en: 'Pricing' },
  'landing.pricing.h2':    { es: 'Inversión clara, sin sorpresas', en: 'Clear pricing, no surprises' },
  'landing.pricing.popular': { es: 'Más popular', en: 'Most popular' },
  'landing.pricing.cta':   { es: 'Comenzar ahora', en: 'Get started' },
  'landing.pricing.p1.name': { es: 'Starter', en: 'Starter' },
  'landing.pricing.p1.price': { es: '$299', en: '$299' },
  'landing.pricing.p1.period': { es: '/ mes', en: '/ month' },
  'landing.pricing.p1.desc': { es: 'Perfecto para comenzar', en: 'Perfect to get started' },
  'landing.pricing.p2.name': { es: 'Pro', en: 'Pro' },
  'landing.pricing.p2.price': { es: '$799', en: '$799' },
  'landing.pricing.p2.period': { es: '/ mes', en: '/ month' },
  'landing.pricing.p2.desc': { es: 'Para negocios en crecimiento', en: 'For growing businesses' },
  'landing.pricing.p3.name': { es: 'Enterprise', en: 'Enterprise' },
  'landing.pricing.p3.price': { es: 'Custom', en: 'Custom' },
  'landing.pricing.p3.period': { es: '', en: '' },
  'landing.pricing.p3.desc': { es: 'Soluciones a medida', en: 'Tailored solutions' },
  // landing — cta-final
  'landing.ctafinal.label': { es: 'Listo para comenzar', en: 'Ready to start' },
  'landing.ctafinal.h2':    { es: 'Da el siguiente paso hoy', en: 'Take the next step today' },
  'landing.ctafinal.sub':   { es: 'Sin compromisos. Sin tarjeta de crédito. Solo resultados.', en: 'No commitments. No credit card. Just results.' },
  // landing — lead form
  'landing.form.label':    { es: 'Contacto rápido', en: 'Quick contact' },
  'landing.form.h2':       { es: 'Hablemos de tu proyecto', en: "Let's talk about your project" },
  'landing.form.name':     { es: 'Tu nombre', en: 'Your name' },
  'landing.form.email':    { es: 'Tu correo', en: 'Your email' },
  'landing.form.message':  { es: 'Cuéntanos brevemente (opcional)', en: 'Tell us briefly (optional)' },
  'landing.form.submit':   { es: 'Enviar mensaje', en: 'Send message' },
  'landing.form.privacy':  { es: 'No compartimos tu información con terceros.', en: 'We never share your info with third parties.' },
  // landing — footer minimal
  'landing.footer.rights': { es: 'Todos los derechos reservados.', en: 'All rights reserved.' },
};

export function t(key: string, lang: Lang = 'es'): string {
  return STRINGS[key]?.[lang] ?? STRINGS[key]?.['en'] ?? key;
}

export const RADIUS_MAP: Record<DesignTokens['radius'], string> = {
  none: '0',
  sm: '0.375rem',
  md: '0.75rem',
  lg: '1.25rem',
  pill: '999px',
};

export const SPACING_MAP: Record<DesignTokens['spacing'], { section: string; inner: string }> = {
  compact: { section: '4rem 2rem', inner: '2rem' },
  normal:  { section: '7rem 2.5rem', inner: '3rem' },
  generous:{ section: '10rem 3rem', inner: '5rem' },
};

export function shadow(tokens: DesignTokens, size: 'sm' | 'md' | 'lg' = 'md'): string {
  const a = { sm: '0 4px 14px', md: '0 8px 28px', lg: '0 16px 56px' }[size];
  switch (tokens.shadowStyle) {
    case 'none': return 'none';
    case 'hard': return `${a} rgba(0,0,0,0.6)`;
    case 'soft': return `${a} rgba(0,0,0,0.18)`;
    case 'glow': return `${a} ${tokens.accent}35`;
  }
}

export function btn(tokens: DesignTokens, style: 'primary' | 'ghost', text: string, href = '#contact'): string {
  const r = RADIUS_MAP[tokens.radius];
  if (style === 'primary') {
    return `<a href="${href}" style="display:inline-flex;align-items:center;padding:0.9rem 2.25rem;background:${tokens.accent};color:#fff;font-weight:600;font-size:0.875rem;border-radius:${r};text-decoration:none;transition:transform 0.25s,box-shadow 0.25s;" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 12px 32px ${tokens.accent}45'" onmouseout="this.style.transform='';this.style.boxShadow=''">${text}</a>`;
  }
  return `<a href="${href}" style="display:inline-flex;align-items:center;padding:0.9rem 2.25rem;background:transparent;border:1px solid ${tokens.muted}50;color:${tokens.text};font-weight:600;font-size:0.875rem;border-radius:${r};text-decoration:none;transition:border-color 0.25s;" onmouseover="this.style.borderColor='${tokens.accent}'" onmouseout="this.style.borderColor='${tokens.muted}50'">${text}</a>`;
}

export function sectionLabel(tokens: DesignTokens, label: string): string {
  return `<div style="font-size:0.68rem;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:${tokens.accent};margin-bottom:1.25rem;display:flex;align-items:center;gap:0.5rem;"><span style="display:block;width:1.75rem;height:1px;background:${tokens.accent};"></span>${label}</div>`;
}

export function displayHeading(tokens: DesignTokens, text: string, size = 'clamp(2rem,5vw,3.5rem)'): string {
  return `<h2 style="font-family:'${tokens.displayFont}',serif;font-size:${size};font-weight:700;line-height:1.05;letter-spacing:-0.03em;color:${tokens.text};margin:0;">${text}</h2>`;
}

// Maps design personality → variant string for section layout selection
export type DesignPersonality =
  | 'luxury-editorial' | 'brutalist-bold' | 'dark-cinematic'
  | 'warm-organic' | 'tech-precision' | 'playful-maximalist'
  | 'minimal-light' | 'art-deco-geometric';

// Returns a layout variant key based on personality
export function pickVariant(personality: DesignPersonality | string | undefined): string {
  switch (personality) {
    case 'luxury-editorial':   return 'editorial';
    case 'brutalist-bold':     return 'brutalist';
    case 'dark-cinematic':     return 'cinematic';
    case 'warm-organic':       return 'organic';
    case 'tech-precision':     return 'tech';
    case 'playful-maximalist': return 'maximalist';
    case 'minimal-light':      return 'minimal';
    case 'art-deco-geometric': return 'deco';
    default:                   return 'cinematic';
  }
}

// ─── Visual effect helpers ──────────────────────────────────────────────────

/** Gradient-filled text (accent → highlight or lighter accent) */
export function gradientText(
  tokens: DesignTokens,
  text: string,
  tag: 'span' | 'div' | 'h1' | 'h2' = 'span',
  extraStyle = '',
): string {
  const to = tokens.highlight ?? lighten(tokens.accent, 40);
  return `<${tag} style="background:linear-gradient(135deg,${tokens.accent},${to});-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;${extraStyle}">${text}</${tag}>`;
}

/** Lighten a hex color by a percentage (simple approximation) */
function lighten(hex: string, pct: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (n >> 16) + Math.round(pct * 2.55));
  const g = Math.min(255, ((n >> 8) & 0xff) + Math.round(pct * 2.55));
  const b = Math.min(255, (n & 0xff) + Math.round(pct * 2.55));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/** Glassmorphism card wrapper */
export function glassCard(
  tokens: DesignTokens,
  content: string,
  opts: { padding?: string; radius?: string; blur?: number; border?: boolean; hover?: boolean } = {},
): string {
  const p = opts.padding ?? '2.5rem';
  const r = opts.radius ?? RADIUS_MAP[tokens.radius];
  const bl = opts.blur ?? 12;
  const border = opts.border !== false;
  const hoverAttr = opts.hover
    ? ` onmouseover="this.style.transform='translateY(-4px) scale(1.01)';this.style.boxShadow='0 20px 60px ${tokens.accent}18'" onmouseout="this.style.transform='';this.style.boxShadow='none'"`
    : '';
  return `<div style="padding:${p};border-radius:${r};background:${tokens.surface}cc;backdrop-filter:blur(${bl}px);-webkit-backdrop-filter:blur(${bl}px);${border ? `border:1px solid ${tokens.muted}15;` : ''}transition:transform 0.4s cubic-bezier(.16,1,.3,1),box-shadow 0.4s cubic-bezier(.16,1,.3,1);"${hoverAttr}>${content}</div>`;
}

/** Decorative SVG separators */
export function decorativeLine(tokens: DesignTokens, variant: 'wave' | 'zigzag' | 'dots' | 'diamond' = 'wave'): string {
  const c = tokens.accent;
  switch (variant) {
    case 'wave':
      return `<div style="width:100%;overflow:hidden;line-height:0;"><svg viewBox="0 0 1200 40" preserveAspectRatio="none" style="width:100%;height:40px;"><path d="M0,20 Q150,0 300,20 T600,20 T900,20 T1200,20" fill="none" stroke="${c}" stroke-width="1.5" opacity="0.3"/></svg></div>`;
    case 'zigzag':
      return `<div style="width:100%;overflow:hidden;line-height:0;"><svg viewBox="0 0 1200 24" preserveAspectRatio="none" style="width:100%;height:24px;"><path d="M0,12 ${Array.from({ length: 24 }, (_, i) => `L${(i + 1) * 50},${i % 2 === 0 ? 0 : 24}`).join(' ')}" fill="none" stroke="${c}" stroke-width="1" opacity="0.25"/></svg></div>`;
    case 'dots':
      return `<div style="display:flex;align-items:center;justify-content:center;gap:0.75rem;padding:1.5rem 0;">${Array.from({ length: 5 }, (_, i) => `<div style="width:${i === 2 ? '0.5rem' : '0.25rem'};height:${i === 2 ? '0.5rem' : '0.25rem'};border-radius:50%;background:${c};opacity:${i === 2 ? '0.6' : '0.25'};"></div>`).join('')}</div>`;
    case 'diamond':
      return `<div style="display:flex;align-items:center;justify-content:center;gap:1rem;padding:1.5rem 0;"><div style="flex:1;height:1px;background:linear-gradient(90deg,transparent,${c}30);"></div><div style="width:8px;height:8px;transform:rotate(45deg);border:1.5px solid ${c}50;"></div><div style="flex:1;height:1px;background:linear-gradient(90deg,${c}30,transparent);"></div></div>`;
  }
}

/** Reveal wrapper — adds .reveal class for IntersectionObserver scroll animation */
export function reveal(content: string, animation: 'fadeUp' | 'fadeLeft' | 'fadeRight' | 'scaleIn' = 'fadeUp', delay = 0): string {
  return `<div class="reveal reveal-${animation}" style="${delay ? `transition-delay:${delay}ms;` : ''}">${content}</div>`;
}

/** Stagger-reveal a list of items */
export function revealStagger(items: string[], animation: 'fadeUp' | 'fadeLeft' | 'fadeRight' | 'scaleIn' = 'fadeUp', baseDelay = 0, step = 100): string {
  return items.map((item, i) => reveal(item, animation, baseDelay + i * step)).join('');
}

/** Decorative divider line with accent dot */
export function decorativeDivider(tokens: DesignTokens): string {
  return `<div style="display:flex;align-items:center;gap:1rem;margin:2rem 0;">
    <div style="flex:1;height:1px;background:${tokens.muted}20;"></div>
    <div style="width:6px;height:6px;border-radius:50%;background:${tokens.accent};opacity:0.6;"></div>
    <div style="flex:1;height:1px;background:${tokens.muted}20;"></div>
  </div>`;
}

export function patternBg(tokens: DesignTokens): string {
  switch (tokens.backgroundPattern) {
    case 'grid':
      return `background-image:linear-gradient(${tokens.muted}10 1px,transparent 1px),linear-gradient(90deg,${tokens.muted}10 1px,transparent 1px);background-size:48px 48px;`;
    case 'dots':
      return `background-image:radial-gradient(${tokens.muted}25 1px,transparent 1px);background-size:24px 24px;`;
    case 'lines':
      return `background-image:repeating-linear-gradient(0deg,${tokens.muted}12 0,${tokens.muted}12 1px,transparent 0,transparent 50%);background-size:100% 32px;`;
    case 'noise':
      return `background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");`;
    default:
      return '';
  }
}
