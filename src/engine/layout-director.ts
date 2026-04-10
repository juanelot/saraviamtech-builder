/**
 * layout-director.ts
 *
 * Uses the frontend-design skill as context + OpenAI to produce a
 * per-site layout plan: design personality, tokens, section sequence.
 *
 * Falls back to a deterministic plan if OpenAI is not available.
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { BrandCard } from '../types/index.js';
import { miniChat, creativeChat, parseJSON, hasOpenAI } from '../lib/openai.js';

// ─── Design System Loader ─────────────────────────────────────────────────────

const __dir = dirname(fileURLToPath(import.meta.url));
// Resolve path to .agents/skills/frontend-design/design-systems/
const DESIGN_SYSTEMS_DIR = join(__dir, '..', '..', '.agents', 'skills', 'frontend-design', 'design-systems');

// Maps businessType + theme to best-fit design system file
const DESIGN_SYSTEM_MAP: Record<string, string[]> = {
  'saas-tech':            ['linear.md', 'vercel.md', 'resend.md'],
  'agency-studio':        ['framer.md', 'figma.md', 'sentry.md'],
  'portfolio-creative':   ['framer.md', 'cursor.md', 'figma.md'],
  'restaurant-food':      ['airbnb.md', 'notion.md', 'intercom.md'],
  'luxury-jewelry':       ['apple.md', 'stripe.md', 'airbnb.md'],
  'real-estate':          ['apple.md', 'stripe.md', 'notion.md'],
  'ecommerce':            ['airbnb.md', 'notion.md', 'stripe.md'],
  'fitness-health':       ['spotify.md', 'sentry.md', 'framer.md'],
  'auto-detailing':       ['sentry.md', 'linear.md', 'framer.md'],
  'professional-services':['stripe.md', 'intercom.md', 'ibm.md'],
};

function pickDesignSystem(businessType: string, theme: 'dark' | 'light', seed: number = 0): string {
  const options = DESIGN_SYSTEM_MAP[businessType] ?? ['linear.md', 'stripe.md', 'framer.md'];
  // Prefer dark systems for dark theme, light for light
  const darkSystems = ['linear.md', 'resend.md', 'sentry.md', 'framer.md', 'spotify.md', 'supabase.md', 'raycast.md'];
  const lightSystems = ['vercel.md', 'stripe.md', 'notion.md', 'airbnb.md', 'apple.md', 'cursor.md', 'ibm.md', 'intercom.md', 'figma.md'];
  const preferred = options.filter(f => theme === 'dark' ? darkSystems.includes(f) : lightSystems.includes(f));
  const pool = preferred.length > 0 ? preferred : options;
  // Use seed to pick among all valid options, not always the first
  const pick = pool[seed % pool.length]!;
  try {
    const content = readFileSync(join(DESIGN_SYSTEMS_DIR, pick!), 'utf-8');
    return `## Reference Design System (${pick!.replace('.md', '')} — adapt tokens, don't copy verbatim)\n\n${content}`;
  } catch {
    return '';
  }
}

// ─── Section types the section library supports ─────────────────────────────
export type SectionType =
  | 'hero-fullbleed'     // full-viewport hero with media overlay
  | 'hero-split'         // 50/50 image + text split
  | 'hero-editorial'     // oversized typography, minimal media
  | 'story-narrative'    // long-form editorial text block
  | 'gallery-masonry'    // irregular image grid (needs images)
  | 'gallery-grid'       // uniform image grid
  | 'carousel'           // horizontal scrolling showcase (needs images)
  | 'services-grid'      // icon + text service cards
  | 'services-sticky'    // sticky scroll narrative for services
  | 'stats-band'         // horizontal numbers/stats strip
  | 'testimonials'       // quotes carousel
  | 'quote-feature'      // large pull-quote with author
  | 'cta-banner'         // full-width call-to-action
  | 'contact-form'       // email + phone contact block
  | 'faq-accordion'      // collapsible FAQ list
  | 'accordion-slider'   // image panels that expand on hover (services showcase)
  | 'sticky-cards'       // cards that pin/stack as user scrolls (process steps)
  | 'flip-cards'         // 3D flip cards revealing detail on hover (services/features)
  | 'typewriter-hero'    // hero with cycling typewriter headline effect
  | 'horizontal-scroll'    // horizontal drag-pan card gallery for services/portfolio
  | 'kinetic-marquee'     // infinite CSS marquee of services in two rows
  | 'spotlight-services'  // services grid with radial spotlight hover effect
  | 'mesh-hero'           // hero with animated canvas mesh gradient background
  | 'spotlight-border'    // service cards with cursor spotlight border effect
  | 'mesh-gradient'       // canvas blob gradient animated background section
  | 'glitch-effect'       // RGB channel split glitch on hover
  | 'text-scramble'       // matrix-style character cycling headline
  | 'odometer'            // mechanical digit rolling counter
  | 'sticky-stack'        // sticky left panel + scrolling feature cards
  | 'svg-draw'            // SVG path animated by scroll progress
  | 'zoom-parallax'       // 5-viewport parallax zoom reveal
  | 'typewriter'          // mid-page CTA with looping typewriter
  | 'circular-text'       // rotating SVG badge with circular text
  | 'text-mask'           // giant headline fills with color via scroll clip-path reveal
  | 'curtain-reveal'      // hero splits open like a theater curtain on scroll
  | 'split-scroll'        // two columns scroll in opposite directions
  | 'color-shift'         // background palette transitions per section during scroll
  | 'cursor-reactive'     // glow follows cursor, 3D tilt cards, magnetic buttons
  | 'cursor-reveal'       // before/after wipe with circular spotlight following cursor
  | 'image-trail'         // mouse leaves trail of fading colored shapes
  | 'magnetic-grid'       // grid tiles push away from cursor position
  | 'coverflow'           // 3D center-focused carousel with angled edges
  | 'view-transitions'    // cards expand into overlays with smooth morph animation
  | 'particle-button'     // CTA section with buttons that burst into particles on click
  | 'gradient-stroke'     // animated gradient flowing along outlined brand text
  | 'dock-nav'            // macOS Dock style nav with icon magnification
  | 'drag-pan'            // infinite draggable canvas in any direction
  | 'dynamic-island'      // pill-shaped element morphs to show brand content
  | 'footer';             // site footer (always last)

export type DesignPersonality =
  | 'luxury-editorial'      // Vogue, Chanel energy — refined, spacious, serif-heavy
  | 'brutalist-bold'        // raw grids, heavy type, zero ornament
  | 'dark-cinematic'        // film-noir, atmospheric dark, glows and blur
  | 'warm-organic'          // earthy tones, handmade feel, generous whitespace
  | 'tech-precision'        // monospace accents, data-forward, tight grid
  | 'playful-maximalist'    // color explosions, overlapping layers, kinetic
  | 'minimal-light'         // near-zero decoration, whitespace king
  | 'art-deco-geometric'    // geometric ornaments, gold/black/ivory, symmetry
  | 'neo-retro'             // 70s/80s revival — saturated colors, chunky borders, retro grids
  | 'glassmorphism'         // blur backdrops, frosted glass surfaces, luminous borders
  | 'swiss-grid'            // strict grid, functional typography, helvetica energy
  | 'cyberpunk-neon'        // deep black + neon accents, scanlines, glitch energy
  | 'nature-earthy'         // organic textures, earth palettes, curved soft forms
  | 'gradient-flow';        // gradients as identity — fluid color transitions everywhere

export interface DesignTokens {
  // Typography
  displayFont: string;       // Google Font name for headings
  bodyFont: string;          // Google Font name for body
  googleFontsUrl: string;

  // Colors (full palette beyond brand accent)
  bg: string;
  surface: string;
  surface2: string;
  accent: string;
  text: string;
  muted: string;
  highlight?: string;        // optional 2nd accent

  // Spatial
  radius: 'none' | 'sm' | 'md' | 'lg' | 'pill';   // border-radius style
  shadowStyle: 'none' | 'soft' | 'hard' | 'glow';  // box-shadow personality
  spacing: 'compact' | 'normal' | 'generous';       // section padding scale
  heroHeight: 'full' | 'large' | 'medium';          // hero section size

  // Decoration
  grainOverlay: boolean;
  backgroundPattern?: 'none' | 'noise' | 'grid' | 'dots' | 'lines';
  accentGlow: boolean;
}

export interface SectionPlan {
  type: SectionType;
  variant?: string;          // e.g. 'dark' | 'light' | 'inverted' | 'split'
  data?: Record<string, any>; // extra hints for the section renderer
}

export interface LayoutPlan {
  personality: DesignPersonality;
  tokens: DesignTokens;
  sections: SectionPlan[];
  reasoning: string;
}

// ─── Font catalog with genuine design variety ────────────────────────────────
const FONT_CATALOG: Record<string, Pick<DesignTokens, 'displayFont' | 'bodyFont' | 'googleFontsUrl'>> = {
  'cormorant-plus-jost': {
    displayFont: 'Cormorant Garamond',
    bodyFont: 'Jost',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Jost:wght@300;400;500&display=swap',
  },
  'playfair-karla': {
    displayFont: 'Playfair Display',
    bodyFont: 'Karla',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Karla:wght@300;400;500&display=swap',
  },
  'cabinet-satoshi': {
    displayFont: 'Cabinet Grotesk',
    bodyFont: 'Satoshi',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,700;1,9..40,400&display=swap',
  },
  'syne-space': {
    displayFont: 'Syne',
    bodyFont: 'Space Grotesk',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Space+Grotesk:wght@300;400;500&display=swap',
  },
  'bebas-dm': {
    displayFont: 'Bebas Neue',
    bodyFont: 'DM Sans',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap',
  },
  'dm-serif-inter': {
    displayFont: 'DM Serif Display',
    bodyFont: 'DM Sans',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap',
  },
  'fraunces-outfit': {
    displayFont: 'Fraunces',
    bodyFont: 'Outfit',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,700;1,400&family=Outfit:wght@300;400;500&display=swap',
  },
  'geist-mono': {
    displayFont: 'Geist Mono',
    bodyFont: 'Geist',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Geist:wght@300;400;600&family=Geist+Mono:wght@400;500&display=swap',
  },
  'canela-apercu': {
    displayFont: 'Libre Baskerville',
    bodyFont: 'Nunito Sans',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Nunito+Sans:wght@300;400;600&display=swap',
  },
  // New distinctive pairs aligned with design systems
  'bricolage-figtree': {
    displayFont: 'Bricolage Grotesque',
    bodyFont: 'Figtree',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@300;400;600;700;800&family=Figtree:wght@300;400;500;600&display=swap',
  },
  'unbounded-inter': {
    displayFont: 'Unbounded',
    bodyFont: 'Plus Jakarta Sans',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Unbounded:wght@300;400;700;900&family=Plus+Jakarta+Sans:wght@300;400;500&display=swap',
  },
  'instrument-serif-work': {
    displayFont: 'Instrument Serif',
    bodyFont: 'Work Sans',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Work+Sans:wght@300;400;500;600&display=swap',
  },
  'clash-display-satoshi': {
    displayFont: 'Clash Display',
    bodyFont: 'Satoshi',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Familjen+Grotesk:wght@400;500;600;700&family=Raleway:wght@300;400;500&display=swap',
  },
  'editorial-neue-mono': {
    displayFont: 'Editorial New',
    bodyFont: 'JetBrains Mono',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=JetBrains+Mono:wght@400;500&display=swap',
  },
  'bodoni-ibm-plex': {
    displayFont: 'Bodoni Moda',
    bodyFont: 'IBM Plex Sans',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,400;0,700;1,400&family=IBM+Plex+Sans:wght@300;400;500&display=swap',
  },
  'chillax-epilogue': {
    displayFont: 'Epilogue',
    bodyFont: 'Manrope',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Epilogue:wght@300;400;700;900&family=Manrope:wght@300;400;500;600&display=swap',
  },
  // New font pairs for new personalities
  'space-mono-inter': {
    displayFont: 'Space Mono',
    bodyFont: 'Inter',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Inter:wght@300;400;500&display=swap',
  },
  'archivo-source': {
    displayFont: 'Archivo Black',
    bodyFont: 'Source Sans 3',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Archivo+Black&family=Source+Sans+3:wght@300;400;600&display=swap',
  },
  'raleway-nunito': {
    displayFont: 'Raleway',
    bodyFont: 'Nunito',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;700;900&family=Nunito:wght@300;400;600&display=swap',
  },
  'righteous-dm': {
    displayFont: 'Righteous',
    bodyFont: 'DM Sans',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Righteous&family=DM+Sans:wght@300;400;500&display=swap',
  },
  'josefin-lato': {
    displayFont: 'Josefin Sans',
    bodyFont: 'Lato',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@300;400;600;700&family=Lato:wght@300;400;700&display=swap',
  },
  'orbitron-exo': {
    displayFont: 'Orbitron',
    bodyFont: 'Exo 2',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Exo+2:wght@300;400;500&display=swap',
  },
};

// ─── Deterministic fallback plans by personality ─────────────────────────────

// Seed-based picker for layout director
function ldSeedPick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length]!;
}

function buildFallbackPlan(brand: BrandCard, imageCount: number, seed: number = Date.now()): LayoutPlan {
  const { businessType, mood, theme, colors } = brand;

  // 1:N personality map — seed picks among 2-3 options per type
  const personalityMap: Record<string, DesignPersonality[]> = {
    'luxury-jewelry':        ['luxury-editorial', 'art-deco-geometric', 'minimal-light'],
    'restaurant-food':       ['warm-organic', 'nature-earthy', 'luxury-editorial'],
    'saas-tech':             ['tech-precision', 'dark-cinematic', 'swiss-grid'],
    'agency-studio':         ['dark-cinematic', 'brutalist-bold', 'glassmorphism'],
    'portfolio-creative':    ['brutalist-bold', 'dark-cinematic', 'playful-maximalist'],
    'ecommerce':             ['minimal-light', 'gradient-flow', 'glassmorphism'],
    'fitness-health':        ['brutalist-bold', 'dark-cinematic', 'neo-retro'],
    'auto-detailing':        ['dark-cinematic', 'brutalist-bold', 'tech-precision'],
    'real-estate':           ['luxury-editorial', 'minimal-light', 'swiss-grid'],
    'professional-services': ['minimal-light', 'swiss-grid', 'tech-precision'],
    'music-events':          ['cyberpunk-neon', 'dark-cinematic', 'brutalist-bold'],
    'education':             ['swiss-grid', 'minimal-light', 'gradient-flow'],
    'beauty-salon':          ['gradient-flow', 'warm-organic', 'glassmorphism'],
    'legal-finance':         ['minimal-light', 'swiss-grid', 'luxury-editorial'],
    'construction':          ['brutalist-bold', 'dark-cinematic', 'swiss-grid'],
    'pet-services':          ['nature-earthy', 'warm-organic', 'playful-maximalist'],
    'nonprofit':             ['warm-organic', 'nature-earthy', 'gradient-flow'],
    'photography':           ['dark-cinematic', 'minimal-light', 'luxury-editorial'],
    'travel-tourism':        ['glassmorphism', 'gradient-flow', 'nature-earthy'],
    'gaming-esports':        ['cyberpunk-neon', 'brutalist-bold', 'dark-cinematic'],
  };

  const personalityOptions = personalityMap[businessType] ?? ['dark-cinematic', 'minimal-light', 'brutalist-bold'];
  const personality: DesignPersonality = ldSeedPick(personalityOptions, seed);

  // 1:N font map — each personality gets 2-3 options
  const fontMap: Record<DesignPersonality, string[]> = {
    'luxury-editorial':   ['instrument-serif-work', 'cormorant-plus-jost', 'playfair-karla'],
    'warm-organic':       ['fraunces-outfit', 'canela-apercu', 'dm-serif-inter'],
    'tech-precision':     ['editorial-neue-mono', 'geist-mono', 'space-mono-inter'],
    'dark-cinematic':     ['bricolage-figtree', 'syne-space', 'chillax-epilogue'],
    'brutalist-bold':     ['unbounded-inter', 'bebas-dm', 'archivo-source'],
    'minimal-light':      ['bodoni-ibm-plex', 'instrument-serif-work', 'cabinet-satoshi'],
    'playful-maximalist': ['chillax-epilogue', 'righteous-dm', 'raleway-nunito'],
    'art-deco-geometric': ['playfair-karla', 'bodoni-ibm-plex', 'cormorant-plus-jost'],
    'neo-retro':          ['righteous-dm', 'josefin-lato', 'bebas-dm'],
    'glassmorphism':      ['bricolage-figtree', 'syne-space', 'chillax-epilogue'],
    'swiss-grid':         ['josefin-lato', 'space-mono-inter', 'archivo-source'],
    'cyberpunk-neon':     ['orbitron-exo', 'editorial-neue-mono', 'bebas-dm'],
    'nature-earthy':      ['cormorant-plus-jost', 'fraunces-outfit', 'dm-serif-inter'],
    'gradient-flow':      ['raleway-nunito', 'bricolage-figtree', 'chillax-epilogue'],
  };

  const fontOptions = fontMap[personality];
  const fontKey = ldSeedPick(fontOptions, seed + 7); // offset seed so font != palette pick
  const fontTokens = FONT_CATALOG[fontKey]!;

  const tokens: DesignTokens = {
    ...fontTokens,
    bg: colors.bg,
    surface: theme === 'dark' ? '#111114' : '#ffffff',
    surface2: theme === 'dark' ? '#18181c' : '#f5f5f5',
    accent: colors.accent,
    text: colors.text,
    muted: colors.muted,
    radius: (personality === 'brutalist-bold' || personality === 'swiss-grid') ? 'none'
          : (personality === 'luxury-editorial' || personality === 'nature-earthy') ? 'sm'
          : (personality === 'warm-organic' || personality === 'glassmorphism' || personality === 'gradient-flow') ? 'lg'
          : (personality === 'neo-retro') ? 'pill'
          : 'md',
    shadowStyle: (personality === 'dark-cinematic' || personality === 'cyberpunk-neon') ? 'glow'
               : (personality === 'brutalist-bold' || personality === 'swiss-grid') ? 'hard'
               : (personality === 'minimal-light') ? 'none'
               : (personality === 'glassmorphism' || personality === 'gradient-flow') ? 'glow'
               : 'soft',
    spacing: (personality === 'luxury-editorial' || personality === 'nature-earthy') ? 'generous'
           : (personality === 'tech-precision' || personality === 'swiss-grid') ? 'compact'
           : 'normal',
    heroHeight: 'full',
    grainOverlay: theme === 'dark' || personality === 'dark-cinematic' || personality === 'cyberpunk-neon',
    accentGlow: personality === 'dark-cinematic' || personality === 'cyberpunk-neon' || personality === 'glassmorphism' || personality === 'gradient-flow',
    backgroundPattern: (personality === 'tech-precision' || personality === 'swiss-grid') ? 'grid'
                     : (personality === 'dark-cinematic' || personality === 'cyberpunk-neon') ? 'noise'
                     : (personality === 'neo-retro') ? 'dots'
                     : 'none',
  };

  // Build section list based on available data
  const heroType: SectionType =
    (personality === 'tech-precision' || personality === 'dark-cinematic' || personality === 'cyberpunk-neon')
      ? 'typewriter-hero'
    : (personality === 'warm-organic' || personality === 'luxury-editorial' || personality === 'nature-earthy')
      ? 'mesh-hero'
    : (personality === 'brutalist-bold' || personality === 'swiss-grid')
      ? 'curtain-reveal'
    : (personality === 'gradient-flow' || personality === 'glassmorphism')
      ? 'dynamic-island'
    : (personality === 'neo-retro' || personality === 'playful-maximalist')
      ? 'text-mask'
    : 'hero-fullbleed';

  const sections: SectionPlan[] = [
    { type: heroType, variant: theme },
  ];

  if (imageCount >= 4) {
    sections.push({ type: 'gallery-masonry' });
    sections.push({ type: 'carousel' });
  } else if (imageCount >= 3) {
    sections.push({ type: 'gallery-grid' });
    sections.push({ type: 'carousel' });
  } else if (imageCount >= 2) {
    sections.push({ type: 'carousel' });
  }

  // Pick services section variant based on personality
  const svcCount = brand.copy.services?.length ?? 0;
  if (personality === 'luxury-editorial' && svcCount >= 3) {
    sections.push({ type: 'accordion-slider' });
    sections.push({ type: 'gradient-stroke' });
  } else if (personality === 'dark-cinematic' && svcCount >= 3) {
    sections.push({ type: 'horizontal-scroll' });
    sections.push({ type: 'color-shift' });
  } else if (personality === 'playful-maximalist' && svcCount >= 2) {
    sections.push({ type: 'flip-cards' });
    sections.push({ type: 'magnetic-grid' });
  } else if (personality === 'warm-organic' && svcCount >= 3) {
    sections.push({ type: 'split-scroll' });
    sections.push({ type: 'cursor-reveal' });
  } else if (personality === 'tech-precision' && svcCount >= 2) {
    sections.push({ type: 'sticky-cards' });
    sections.push({ type: 'spotlight-border' });
  } else if (personality === 'minimal-light' && svcCount >= 2) {
    sections.push({ type: 'view-transitions' });
    sections.push({ type: 'text-mask' });
  } else if (personality === 'art-deco-geometric' && svcCount >= 2) {
    sections.push({ type: 'sticky-cards' });
    sections.push({ type: 'gradient-stroke' });
  } else if (personality === 'brutalist-bold' && svcCount >= 3) {
    sections.push({ type: 'horizontal-scroll' });
    sections.push({ type: 'glitch-effect' });
  } else if (personality === 'neo-retro' && svcCount >= 2) {
    sections.push({ type: 'coverflow' });
    sections.push({ type: 'kinetic-marquee' });
  } else if (personality === 'glassmorphism' && svcCount >= 2) {
    sections.push({ type: 'cursor-reactive' });
    sections.push({ type: 'spotlight-border' });
  } else if (personality === 'swiss-grid' && svcCount >= 2) {
    sections.push({ type: 'split-scroll' });
    sections.push({ type: 'text-scramble' });
  } else if (personality === 'cyberpunk-neon' && svcCount >= 2) {
    sections.push({ type: 'color-shift' });
    sections.push({ type: 'glitch-effect' });
  } else if (personality === 'nature-earthy' && svcCount >= 2) {
    sections.push({ type: 'accordion-slider' });
    sections.push({ type: 'image-trail' });
  } else if (personality === 'gradient-flow' && svcCount >= 2) {
    sections.push({ type: 'coverflow' });
    sections.push({ type: 'gradient-stroke' });
  } else {
    sections.push({ type: 'services-grid', variant: theme });
  }

  // kinetic-marquee after hero for playful/brutalist/neo-retro/cyberpunk personalities
  if ((personality === 'playful-maximalist' || personality === 'brutalist-bold' || personality === 'neo-retro' || personality === 'cyberpunk-neon') && svcCount >= 2) {
    sections.splice(1, 0, { type: 'kinetic-marquee' });
  }

  if (businessType === 'restaurant-food' || businessType === 'agency-studio' || businessType === 'photography') {
    sections.push({ type: 'story-narrative' });
  }

  // image-trail for creative/luxury/nature personalities
  if ((personality === 'luxury-editorial' || personality === 'nature-earthy' || personality === 'gradient-flow') && svcCount >= 2) {
    sections.push({ type: 'image-trail' });
  }

  sections.push({ type: 'stats-band', variant: theme === 'dark' ? 'accent' : 'light' });
  sections.push({ type: 'testimonials' });
  sections.push({ type: 'quote-feature' });

  // Use particle-button CTA for action-oriented personalities, cta-banner for others
  const ctaType: SectionType = (personality === 'playful-maximalist' || personality === 'neo-retro' || personality === 'gradient-flow' || personality === 'cyberpunk-neon')
    ? 'particle-button'
    : 'cta-banner';
  sections.push({ type: ctaType, variant: 'accent' });

  sections.push({ type: 'contact-form', variant: theme });
  sections.push({ type: 'footer' });

  // Inject personality into every section's data so renderers can pick layout variants
  const taggedSections = sections.map(s => ({
    ...s,
    data: { ...(s.data ?? {}), personality },
  }));

  return {
    personality,
    tokens,
    sections: taggedSections,
    reasoning: `Deterministic plan for ${businessType} with ${personality} personality.`,
  };
}

// ─── LLM-driven plan ─────────────────────────────────────────────────────────

function buildSkillContext(brand: BrandCard, seed: number = 0): string {
  const designSystem = pickDesignSystem(brand.businessType, brand.theme as 'dark' | 'light', seed);
  return `You are applying the frontend-design skill:
- Choose a BOLD aesthetic direction (brutally minimal, maximalist, editorial, dark cinematic, etc.)
- Pick fonts that are distinctive — NEVER Inter or Roboto as display fonts
- Commit to a cohesive color story with a dominant + sharp accent
- Make the layout MEMORABLE and context-specific
- Vary across generations — NO two sites should look the same
- NEVER use generic purple gradients on white, or Geist/Space Grotesk as default choices
${designSystem ? `\n${designSystem}\n\nIMPORTANT: Use the design system above as your concrete foundation. Extract real hex values, real font names, real spacing. Adapt them to this specific business — don't copy blindly. These tokens are your starting point, not your cage.` : ''}`;
}

export async function buildLayoutPlan(
  brand: BrandCard,
  imageCount: number = 0,
  scrapedData?: { headlines?: string[]; colors?: string[]; images?: string[] },
  noAI?: boolean,
  seed?: number,
): Promise<LayoutPlan> {
  const effectiveSeed = seed ?? (Date.now() ^ Math.floor(Math.random() * 0xffff));
  if (noAI || !hasOpenAI()) {
    return buildFallbackPlan(brand, imageCount, effectiveSeed);
  }

  const fontOptions = Object.entries(FONT_CATALOG)
    .map(([k, v]) => `${k}: display="${v.displayFont}" body="${v.bodyFont}"`)
    .join(', ');

  const sectionTypes: SectionType[] = [
    'hero-fullbleed', 'hero-split', 'hero-editorial',
    'story-narrative', 'gallery-masonry', 'gallery-grid', 'carousel',
    'services-grid', 'services-sticky', 'stats-band',
    'testimonials', 'quote-feature', 'cta-banner', 'contact-form', 'faq-accordion',
    'accordion-slider', 'sticky-cards', 'flip-cards', 'typewriter-hero', 'horizontal-scroll',
    'kinetic-marquee', 'spotlight-services', 'mesh-hero',
    // New sections from Fase 1
    'text-mask', 'curtain-reveal', 'split-scroll', 'color-shift',
    'cursor-reactive', 'cursor-reveal', 'image-trail', 'magnetic-grid',
    'coverflow', 'view-transitions', 'particle-button', 'gradient-stroke',
    'drag-pan', 'dynamic-island',
  ];

  const personalities: DesignPersonality[] = [
    'luxury-editorial', 'brutalist-bold', 'dark-cinematic',
    'warm-organic', 'tech-precision', 'playful-maximalist',
    'minimal-light', 'art-deco-geometric',
    // New personalities from Fase 2
    'neo-retro', 'glassmorphism', 'swiss-grid', 'cyberpunk-neon',
    'nature-earthy', 'gradient-flow',
  ];

  // Rotating style directives — each seed picks a different creative constraint
  const styleDirectives = [
    'Go BRUTALLY MINIMAL: strip everything non-essential, let whitespace dominate, choose a razor-sharp single accent.',
    'Go MAXIMALIST and KINETIC: layer elements, pick expressive heavy typography, use bold color blocks, choose animated sections.',
    'Go DARK CINEMATIC: deep blacks, atmospheric glow effects, film-noir mood, pick sections with dramatic reveals.',
    'Go EDITORIAL LUXURY: oversized serif headlines, generous spacing, restrained palette, high-contrast moments.',
    'Go TECH-FORWARD: monospace accents, grid-heavy layout, data-driven sections, precise minimal UI.',
    'Go WARM ORGANIC: earthy tones, handcrafted feel, curved elements, narrative-driven layout.',
    'Go NEO-RETRO: bold chunky borders, saturated vintage palette, retro-grid layout, playful typography.',
    'Go GLASSMORPHISM: frosted blurred surfaces, luminous borders, depth through layers.',
    'Go SWISS GRID: strict horizontal bands, functional Helvetica-energy type, primary color blocks.',
    'Go GRADIENT FLOW: fluid color transitions as identity, gradients everywhere, smooth morphing sections.',
    'Go CYBERPUNK NEON: ultra-dark base + electric neon accents, glitch effects, scanline texture.',
    'Go ART DECO: geometric ornaments, gold/black/ivory palette, symmetrical grandeur.',
  ];
  const directive = styleDirectives[effectiveSeed % styleDirectives.length];

  const systemPrompt = `${buildSkillContext(brand, effectiveSeed)}

You are a senior art director generating a layout plan for a website. Return ONLY valid JSON.

The layout plan must feel like a real production website — NOT a template. Every field must reflect the specific business and mood.
CREATIVE DIRECTIVE FOR THIS GENERATION: ${directive}
Variation seed: ${effectiveSeed % 1000} — commit fully to the directive above. Avoid generic or default choices.`;

  const userPrompt = `
Business: "${brand.name}"
Type: ${brand.businessType}
Mood: ${brand.mood}
Theme: ${brand.theme}
Existing accent color: ${brand.colors.accent}
Description: ${brand.copy.description}
Variation seed: ${effectiveSeed % 1000}
${scrapedData?.headlines?.length ? `Scraped headlines: ${scrapedData.headlines.slice(0, 4).join(' | ')}` : ''}
${scrapedData?.colors?.length ? `Scraped brand colors: ${scrapedData.colors.slice(0, 5).join(', ')}` : ''}
Images available: ${imageCount}

Available personalities: ${personalities.join(', ')}
Font pairs (use key string): ${fontOptions}
Available section types: ${sectionTypes.join(', ')}

IMPORTANT SECTION RULES:
- hero must be first section (pick best hero variant for personality)
- carousel: include if imageCount >= 2; gallery-masonry/gallery-grid: include if imageCount >= 3
- footer must be last
- 6-10 sections total
- SERVICES SECTION: You MUST pick one of these for the services/features section based on personality:
  * accordion-slider → for dark-cinematic, luxury-editorial, playful-maximalist, warm-organic
  * sticky-cards → for tech-precision, minimal-light, art-deco-geometric, brutalist-bold
  * flip-cards → great alternative for any personality when you want 3D card interactions
  * horizontal-scroll → cinematic/editorial personalities with 4+ services
  * services-grid → only if none of the above fit
  * services-sticky → only as last resort
- NEVER include both services-grid AND accordion-slider/sticky-cards/flip-cards/horizontal-scroll
- HEADLINE EFFECT: For tech-precision and dark-cinematic personalities, consider using typewriter-hero instead of a standard hero
- radius: "none"|"sm"|"md"|"lg"|"pill"
- shadowStyle: "none"|"soft"|"hard"|"glow"
- spacing: "compact"|"normal"|"generous"
- heroHeight: "full"|"large"|"medium"
- backgroundPattern: "none"|"noise"|"grid"|"dots"|"lines"

Return JSON exactly matching this shape:
{
  "personality": "<personality>",
  "fontKey": "<font-pair-key>",
  "tokens": {
    "bg": "<hex>",
    "surface": "<hex>",
    "surface2": "<hex>",
    "accent": "<hex>",
    "text": "<hex>",
    "muted": "<hex>",
    "highlight": "<hex or null>",
    "radius": "<value>",
    "shadowStyle": "<value>",
    "spacing": "<value>",
    "heroHeight": "<value>",
    "grainOverlay": <bool>,
    "backgroundPattern": "<value>",
    "accentGlow": <bool>
  },
  "sections": [
    { "type": "<SectionType>", "variant": "<optional string>", "data": {} }
  ],
  "reasoning": "<1-2 sentences why this direction>"
}`;

  try {
    const raw = await creativeChat(systemPrompt, userPrompt, effectiveSeed);
    const parsed = parseJSON<any>(raw);

    const fontKey: string = parsed.fontKey ?? 'syne-space';
    const fontTokens = FONT_CATALOG[fontKey] ?? FONT_CATALOG['syne-space']!;

    const tokens: DesignTokens = {
      ...fontTokens,
      bg: parsed.tokens.bg,
      surface: parsed.tokens.surface,
      surface2: parsed.tokens.surface2,
      accent: parsed.tokens.accent,
      text: parsed.tokens.text,
      muted: parsed.tokens.muted,
      highlight: parsed.tokens.highlight ?? undefined,
      radius: parsed.tokens.radius ?? 'md',
      shadowStyle: parsed.tokens.shadowStyle ?? 'soft',
      spacing: parsed.tokens.spacing ?? 'normal',
      heroHeight: parsed.tokens.heroHeight ?? 'full',
      grainOverlay: parsed.tokens.grainOverlay ?? false,
      backgroundPattern: parsed.tokens.backgroundPattern ?? 'none',
      accentGlow: parsed.tokens.accentGlow ?? false,
    };

    // Inject personality into every section's data for layout variant selection
    const taggedSections = (parsed.sections as SectionPlan[]).map(s => ({
      ...s,
      data: { ...(s.data ?? {}), personality: parsed.personality },
    }));

    return {
      personality: parsed.personality,
      tokens,
      sections: taggedSections,
      reasoning: parsed.reasoning,
    };
  } catch (err) {
    console.warn('[layout-director] LLM plan failed, using fallback:', err);
    return buildFallbackPlan(brand, imageCount, effectiveSeed);
  }
}
