/**
 * template-injector.ts
 *
 * Takes a raw module HTML file and injects brand content + saraviamtech footer.
 * Modules must have data-sc-slot attributes on hero text nodes.
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { BrandCard } from '../types/index.js';
import type { DesignTokens } from './layout-director.js';
import { renderFooter } from './sections/footer.js';

const __dir = dirname(fileURLToPath(import.meta.url));
const MODULES_DIR = join(__dir, '..', '..', 'modules');

// Human-readable names for UI display
export const MODULE_META: Record<string, { name: string; desc: string; number: number }> = {
  'accordion-slider':  { number: 11, name: 'Accordion Slider',      desc: 'Paneles que se expanden al hover — galería densa y visual' },
  'circular-text':     { number: 27, name: 'Texto Circular',         desc: 'Texto en arco circular animado — badges y logos' },
  'color-shift':       { number:  9, name: 'Color Shift',            desc: 'La página cambia de paleta al hacer scroll — capítulos de marca' },
  'coverflow':         { number: 14, name: 'Coverflow 3D',           desc: 'Carrusel 3D estilo coverflow — portafolio o productos' },
  'cursor-reactive':   { number: 21, name: 'Cursor Reactivo',        desc: 'Glow de cursor, tilt 3D y botones magnéticos' },
  'cursor-reveal':     { number: 17, name: 'Cursor Reveal',          desc: 'Imagen oculta que se revela siguiendo el cursor' },
  'curtain-reveal':    { number: 16, name: 'Curtain Reveal',         desc: 'Cortina animada que descubre el contenido — cinematico' },
  'dock-nav':          { number: 22, name: 'Dock Nav (macOS)',        desc: 'Barra de navegación estilo dock de macOS' },
  'drag-pan':          { number: 23, name: 'Drag to Pan',            desc: 'Grid arrastrable — portfolios y galerías inmersivas' },
  'dynamic-island':    { number: 20, name: 'Dynamic Island',         desc: 'Notificaciones animadas estilo Dynamic Island de iPhone' },
  'flip-cards':        { number: 12, name: 'Flip Cards 3D',          desc: 'Tarjetas que giran en 3D — servicios y equipo' },
  'glitch-effect':     { number: 28, name: 'Glitch Effect',          desc: 'Distorsión glitch animada — marcas tech y gaming' },
  'gradient-stroke':   { number: 30, name: 'Gradient Stroke',        desc: 'Degradado animado sobre texto con trazo — tipografía hero' },
  'horizontal-scroll': { number:  6, name: 'Scroll Horizontal',      desc: 'Scroll horizontal bloqueado — storytelling secuencial' },
  'image-trail':       { number: 18, name: 'Image Trail',            desc: 'Imágenes que siguen al cursor como estela' },
  'kinetic-marquee':   { number:  7, name: 'Marquee Cinético',       desc: 'Marquee con velocidad reactiva al scroll — frases de marca' },
  'magnetic-grid':     { number: 24, name: 'Grid Magnético',         desc: 'Grid que repele elementos al acercar el cursor' },
  'mesh-gradient':     { number:  4, name: 'Mesh Gradient',          desc: 'Fondo de malla de gradiente animada — ambient y premium' },
  'odometer':          { number: 13, name: 'Odometer Counter',        desc: 'Contadores animados tipo odómetro — stats y métricas' },
  'particle-button':   { number: 25, name: 'Particle Button',        desc: 'CTA que explota en partículas al hacer click' },
  'split-scroll':      { number:  8, name: 'Split Screen',           desc: 'Scroll dividido en dos columnas — storytelling dual' },
  'spotlight-border':  { number: 15, name: 'Spotlight Border',       desc: 'Tarjetas con borde de spotlight reactivo al cursor' },
  'sticky-cards':      { number:  3, name: 'Sticky Cards',           desc: 'Tarjetas que se apilan al hacer scroll — servicios' },
  'sticky-stack':      { number:  2, name: 'Sticky Stack',           desc: 'Narrativa sticky en capas — storytelling inmersivo' },
  'svg-draw':          { number: 26, name: 'SVG Draw',               desc: 'Trazado de SVG animado por scroll — iconografía y logos' },
  'text-mask':         { number:  1, name: 'Text Mask',              desc: 'Imagen enmascarada por texto — hero impactante' },
  'text-scramble':     { number: 10, name: 'Text Scramble',          desc: 'Texto que se desordenada y reordena — tech y glitch' },
  'typewriter':        { number:  5, name: 'Typewriter',             desc: 'Efecto de máquina de escribir — mensajes en secuencia' },
  'view-transitions':  { number: 29, name: 'View Transitions',       desc: 'Transiciones de página suaves con View Transitions API' },
  'zoom-parallax':     { number: 19, name: 'Zoom Parallax',          desc: 'Capas con parallax de zoom al hacer scroll — cinematico' },
};

export interface ModuleInfo {
  id: string;
  name: string;
  desc: string;
  number: number;
  file: string;
}

export function listModules(): ModuleInfo[] {
  return Object.entries(MODULE_META)
    .map(([id, meta]) => ({ id, ...meta, file: `${id}.html` }))
    .sort((a, b) => a.number - b.number);
}

// Build minimal DesignTokens from BrandCard colors for footer rendering
function tokensFromBrand(brand: BrandCard): DesignTokens {
  return {
    bg:               brand.colors.bg,
    surface:          brand.colors.surface,
    surface2:         brand.colors.surface,
    accent:           brand.colors.accent,
    text:             brand.colors.text,
    muted:            brand.colors.muted,
    displayFont:      brand.font.display,
    bodyFont:         brand.font.body,
    googleFontsUrl:   brand.font.googleFontsUrl,
    radius:           'md',
    shadowStyle:      'soft',
    spacing:          'normal',
    heroHeight:       'full',
    grainOverlay:     false,
    accentGlow:       false,
  } as DesignTokens;
}

// Replace :root CSS variable values with brand colors
function injectCssTokens(html: string, brand: BrandCard): string {
  return html.replace(
    /:root\s*\{([^}]+)\}/,
    (_match: string, body: string) => {
      let patched = body;
      patched = patched.replace(/--bg\s*:\s*[^;]+;/, `--bg: ${brand.colors.bg};`);
      patched = patched.replace(/--text\s*:\s*[^;]+;/, `--text: ${brand.colors.text};`);
      patched = patched.replace(/--accent\s*:\s*[^;]+;/, `--accent: ${brand.colors.accent};`);
      patched = patched.replace(/--muted\s*:\s*[^;]+;/, `--muted: ${brand.colors.muted};`);
      patched = patched.replace(/--surface\s*:\s*[^;]+;/, `--surface: ${brand.colors.surface};`);
      // border: slightly lighter than bg
      patched = patched.replace(/--border\s*:\s*[^;]+;/, `--border: ${brand.colors.surface};`);
      return `:root {${patched}}`;
    }
  );
}

// Replace slot content — keeps the element tag+attributes, replaces inner text only
function fillSlot(html: string, slot: string, content: string): string {
  // Matches: <tag ... data-sc-slot="slot" ...>ANYTHING</tag>
  const re = new RegExp(
    `(<[^>]+data-sc-slot="${slot}"[^>]*>)([^<]*(?:<span[^>]*>[^<]*<\/span>[^<]*)*)(<\/[^>]+>)`,
    'i'
  );
  return html.replace(re, (_m: string, open: string, _inner: string, close: string) => {
    // Preserve any <span> wrapper in h1 (accent word) — replace only leading text
    // For headline: put business name in accent span, headline as main text
    return `${open}${content}${close}`;
  });
}

// For the headline h1 — keep accent span if present, inject brand headline
function fillHeadline(html: string, brand: BrandCard): string {
  const re = new RegExp(
    `(<h1[^>]*data-sc-slot="headline"[^>]*>)([^<]*(?:<span[^>]*>[^<]*<\/span>[^<]*)*)(<\/h1>)`,
    'i'
  );
  return html.replace(re, (_m: string, open: string, _inner: string, close: string) => {
    const headline = brand.copy.headline;
    const words = headline.split(' ');
    // Put last 1-2 words in accent span
    const breakAt = Math.max(1, words.length - 2);
    const main = words.slice(0, breakAt).join(' ');
    const accent = words.slice(breakAt).join(' ');
    return `${open}${main} <span>${accent}</span>${close}`;
  });
}

function setLang(html: string, lang: 'es' | 'en'): string {
  return html.replace(/(<html[^>]*lang=")[^"]*"/, `$1${lang}"`);
}

function setTitle(html: string, brand: BrandCard): string {
  return html.replace(/<title>[^<]*<\/title>/, `<title>${brand.name}</title>`);
}

function injectGoogleFont(html: string, brand: BrandCard): string {
  // Module already has its own Google Font link — add brand font after it
  if (brand.font.googleFontsUrl && !html.includes(brand.font.googleFontsUrl)) {
    return html.replace(
      '</head>',
      `<link href="${brand.font.googleFontsUrl}" rel="stylesheet">\n</head>`
    );
  }
  return html;
}

function appendFooter(html: string, brand: BrandCard): string {
  const tokens = tokensFromBrand(brand);
  const footerHtml = renderFooter(brand, tokens, { personality: 'cinematic' });
  // Remove existing simple footer if present (demo footer in modules)
  const cleaned = html.replace(/<footer[^>]*>[\s\S]*?<\/footer>/i, '');
  return cleaned.replace('</body>', `${footerHtml}\n</body>`);
}

function injectSaraviamMeta(html: string): string {
  return html.replace(
    '</head>',
    `<meta name="generator" content="SaraviamTech Builder">\n</head>`
  );
}

function injectHeroVideo(html: string, videoUrl: string): string {
  const videoTag = `
<style>
#sc-hero-video{position:fixed;top:0;left:0;width:100%;height:100%;object-fit:cover;z-index:-1;opacity:0.55;}
</style>
<video id="sc-hero-video" src="${videoUrl}" autoplay muted loop playsinline></video>`;
  return html.replace('<body>', `<body>${videoTag}`);
}

// Replace all Unsplash URLs in module HTML with user images (rotating through available ones)
function replaceModuleImages(html: string, images: string[]): string {
  if (!images.length) return html;
  let idx = 0;
  return html.replace(
    /https:\/\/images\.unsplash\.com\/[^'")\s]+/g,
    () => images[idx++ % images.length]
  );
}

export function buildFromTemplate(
  brand: BrandCard,
  moduleId: string,
  heroImageUrl?: string,
  heroVideoUrl?: string,
  extraImages?: string[],
): string {
  const filePath = join(MODULES_DIR, `${moduleId}.html`);
  let html: string;
  try {
    html = readFileSync(filePath, 'utf-8');
  } catch {
    throw new Error(`Template module not found: ${moduleId}`);
  }

  // 1. CSS token injection
  html = injectCssTokens(html, brand);

  // 2. Slot injection
  html = fillHeadline(html, brand);
  html = fillSlot(html, 'description', brand.copy.description || brand.copy.tagline);
  html = fillSlot(html, 'business-name', brand.name);
  html = fillSlot(html, 'cta', brand.copy.cta);

  // 3. Meta / lang / title
  html = setLang(html, brand.language ?? 'es');
  html = setTitle(html, brand);
  html = injectSaraviamMeta(html);
  html = injectGoogleFont(html, brand);

  // 4. Media injection — replace all Unsplash images with user's images, then add video
  const allImages = [heroImageUrl, ...(extraImages ?? [])].filter(Boolean) as string[];
  if (allImages.length) html = replaceModuleImages(html, allImages);
  if (heroVideoUrl) html = injectHeroVideo(html, heroVideoUrl);

  // 5. Footer
  html = appendFooter(html, brand);

  return html;
}
