import type { CinematicModule, ModuleSelection, BusinessType } from '../types/index.js';

export const MODULES: CinematicModule[] = [
  { id: '01', name: 'Text Mask Reveal', file: 'text-mask.html', category: 'scroll-driven', description: 'Giant headline fills with colour via scroll clip-path', bestFor: ['agency-studio', 'portfolio-creative', 'luxury-jewelry'], incompatibleWith: [] },
  { id: '02', name: 'Sticky Stack Narrative', file: 'sticky-stack.html', category: 'scroll-driven', description: 'Product pins left, feature cards scroll right', bestFor: ['saas-tech', 'professional-services', 'ecommerce'], incompatibleWith: ['07'] },
  { id: '03', name: 'Layered Zoom Parallax', file: 'zoom-parallax.html', category: 'scroll-driven', description: 'Depth layers at different speeds, product reveals at center', bestFor: ['luxury-jewelry', 'restaurant-food', 'real-estate'], incompatibleWith: [] },
  { id: '06', name: 'Horizontal Scroll Hijack', file: 'horizontal-scroll.html', category: 'scroll-driven', description: 'Vertical scroll drives horizontal card gallery', bestFor: ['portfolio-creative', 'agency-studio', 'ecommerce'], incompatibleWith: ['07'] },
  { id: '07', name: 'Sticky Card Stack', file: 'sticky-cards.html', category: 'scroll-driven', description: 'Cards pin and stack on top of each other', bestFor: ['saas-tech', 'professional-services', 'fitness-health'], incompatibleWith: ['02', '06'] },
  { id: '12', name: 'Scroll SVG Draw', file: 'svg-draw.html', category: 'scroll-driven', description: 'SVG paths draw with stroke-dashoffset on scroll', bestFor: ['portfolio-creative', 'saas-tech', 'agency-studio'], incompatibleWith: [] },
  { id: '13', name: 'Curtain Reveal', file: 'curtain-reveal.html', category: 'scroll-driven', description: 'Hero splits open like a curtain', bestFor: ['auto-detailing', 'restaurant-food', 'luxury-jewelry'], incompatibleWith: [] },
  { id: '16', name: 'Split Screen Scroll', file: 'split-scroll.html', category: 'scroll-driven', description: 'Two columns scroll opposite directions', bestFor: ['real-estate', 'portfolio-creative', 'agency-studio'], incompatibleWith: [] },
  { id: '20', name: 'Scroll Color Shift', file: 'color-shift.html', category: 'scroll-driven', description: 'Background palette transitions per section', bestFor: ['restaurant-food', 'fitness-health', 'ecommerce'], incompatibleWith: [] },
  { id: '04', name: 'Cursor-Reactive', file: 'cursor-reactive.html', category: 'cursor-hover', description: 'Glow follows cursor, 3D tilt cards, magnetic buttons', bestFor: ['saas-tech', 'agency-studio', 'portfolio-creative'], incompatibleWith: ['25'] },
  { id: '09', name: 'Accordion Slider', file: 'accordion-slider.html', category: 'cursor-hover', description: 'Narrow strips expand on hover', bestFor: ['restaurant-food', 'ecommerce', 'real-estate'], incompatibleWith: [] },
  { id: '11', name: 'Cursor Image Reveal', file: 'cursor-reveal.html', category: 'cursor-hover', description: 'Before/after wipe, circular spotlight', bestFor: ['auto-detailing', 'real-estate', 'portfolio-creative'], incompatibleWith: [] },
  { id: '14', name: 'Hover Image Trail', file: 'image-trail.html', category: 'cursor-hover', description: 'Mouse leaves trail of fading images', bestFor: ['agency-studio', 'portfolio-creative', 'luxury-jewelry'], incompatibleWith: [] },
  { id: '18', name: '3D Flip Cards', file: 'flip-cards.html', category: 'cursor-hover', description: 'Cards rotate 180deg on hover', bestFor: ['professional-services', 'saas-tech', 'ecommerce'], incompatibleWith: [] },
  { id: '22', name: 'Magnetic Repel Grid', file: 'magnetic-grid.html', category: 'cursor-hover', description: 'Grid tiles push away from cursor', bestFor: ['portfolio-creative', 'agency-studio'], incompatibleWith: [] },
  { id: '25', name: 'Spotlight Border Cards', file: 'spotlight-border.html', category: 'cursor-hover', description: 'Grid borders illuminate under cursor', bestFor: ['saas-tech', 'professional-services'], incompatibleWith: ['04'] },
  { id: '29', name: 'Drag-to-Pan Grid', file: 'drag-pan.html', category: 'cursor-hover', description: 'Infinite canvas draggable in any direction', bestFor: ['portfolio-creative', 'agency-studio'], incompatibleWith: [] },
  { id: '05', name: 'View Transition Morphing', file: 'view-transitions.html', category: 'click-tap', description: 'Cards expand into overlays', bestFor: ['ecommerce', 'portfolio-creative'], incompatibleWith: [] },
  { id: '21', name: 'Odometer Counter', file: 'odometer.html', category: 'click-tap', description: 'Mechanical digit wheels roll to target numbers', bestFor: ['saas-tech', 'professional-services', 'fitness-health'], incompatibleWith: [] },
  { id: '23', name: 'Particle Explosion Button', file: 'particle-button.html', category: 'click-tap', description: 'CTAs burst into particles on click', bestFor: ['saas-tech', 'agency-studio', 'ecommerce'], incompatibleWith: [] },
  { id: '27', name: '3D Coverflow Carousel', file: 'coverflow.html', category: 'click-tap', description: 'Center-focused carousel, edges angled in perspective', bestFor: ['ecommerce', 'portfolio-creative', 'restaurant-food'], incompatibleWith: [] },
  { id: '28', name: 'Dynamic Island Nav', file: 'dynamic-island.html', category: 'click-tap', description: 'Pill morphs to show notifications and status', bestFor: ['saas-tech', 'agency-studio'], incompatibleWith: [] },
  { id: '30', name: 'macOS Dock Nav', file: 'dock-nav.html', category: 'click-tap', description: 'Icons magnify as cursor approaches', bestFor: ['saas-tech', 'portfolio-creative'], incompatibleWith: [] },
  { id: '08', name: 'Text Scramble Decode', file: 'text-scramble.html', category: 'ambient-auto', description: 'Matrix-style character cycling resolving to real text', bestFor: ['saas-tech', 'agency-studio', 'portfolio-creative'], incompatibleWith: ['24'] },
  { id: '10', name: 'Kinetic Marquee', file: 'kinetic-marquee.html', category: 'ambient-auto', description: 'Infinite text bands, scroll-reactive speed', bestFor: ['agency-studio', 'ecommerce', 'restaurant-food'], incompatibleWith: ['24'] },
  { id: '15', name: 'Mesh Gradient Background', file: 'mesh-gradient.html', category: 'ambient-auto', description: 'Animated lava-lamp colour blobs', bestFor: ['saas-tech', 'portfolio-creative', 'luxury-jewelry'], incompatibleWith: [] },
  { id: '17', name: 'Circular Text Path', file: 'circular-text.html', category: 'ambient-auto', description: 'Text on spinning SVG circle', bestFor: ['luxury-jewelry', 'agency-studio', 'restaurant-food'], incompatibleWith: [] },
  { id: '19', name: 'Glitch Effect', file: 'glitch-effect.html', category: 'ambient-auto', description: 'RGB channel split on hover', bestFor: ['portfolio-creative', 'agency-studio', 'saas-tech'], incompatibleWith: [] },
  { id: '24', name: 'Typewriter Effect', file: 'typewriter.html', category: 'ambient-auto', description: 'Text types letter by letter', bestFor: ['saas-tech', 'professional-services', 'portfolio-creative'], incompatibleWith: ['08', '10'] },
  { id: '26', name: 'Gradient Stroke Text', file: 'gradient-stroke.html', category: 'ambient-auto', description: 'Animated gradient along outlined text', bestFor: ['luxury-jewelry', 'agency-studio', 'portfolio-creative'], incompatibleWith: [] },
];

// Multiple combo pools per business type — randomised on each generation for variety
const BUSINESS_COMBO_POOLS: Record<BusinessType, Array<[string, string?, string?]>> = {
  'saas-tech':            [['07','25','24'], ['01','04','08'], ['02','25','08'], ['20','28','24']],
  'agency-studio':        [['06','14','10'], ['01','22','19'], ['16','29','26'], ['13','04','10']],
  'ecommerce':            [['06','09','21'], ['27','11','10'], ['20','05','23'], ['07','18','15']],
  'restaurant-food':      [['20','09','17'], ['03','11','10'], ['13','14','26'], ['16','09','17']],
  'portfolio-creative':   [['16','14','19'], ['01','29','26'], ['06','22','15'], ['13','11','19']],
  'luxury-jewelry':       [['03','14','26'], ['01','11','17'], ['20','14','15'], ['16','11','26']],
  'real-estate':          [['16','11','15'], ['03','09','17'], ['20','11','10'], ['02','09','15']],
  'fitness-health':       [['20','23','24'], ['07','04','10'], ['01','23','08'], ['16','18','15']],
  'auto-detailing':       [['13','11','21'], ['03','04','10'], ['16','09','19'], ['20','23','08']],
  'professional-services':[['02','18','08'], ['07','25','24'], ['01','11','17'], ['16','05','15']],
  // New business types
  'music-events':         [['20','23','10'], ['13','04','19'], ['01','14','26'], ['16','04','08']],
  'education':            [['07','18','08'], ['02','25','24'], ['06','05','10'], ['16','11','15']],
  'beauty-salon':         [['03','14','26'], ['20','09','17'], ['01','11','15'], ['27','14','10']],
  'legal-finance':        [['02','18','08'], ['07','25','24'], ['16','11','15'], ['01','05','17']],
  'construction':         [['13','04','21'], ['16','11','10'], ['07','23','08'], ['20','18','08']],
  'pet-services':         [['20','14','17'], ['03','09','10'], ['16','22','15'], ['27','11','26']],
  'nonprofit':            [['01','11','17'], ['20','09','10'], ['16','14','15'], ['07','23','24']],
  'photography':          [['16','14','19'], ['03','11','15'], ['01','22','26'], ['13','14','17']],
  'travel-tourism':       [['03','09','17'], ['20','14','10'], ['06','11','15'], ['27','09','26']],
  'gaming-esports':       [['20','04','19'], ['01','23','08'], ['07','25','24'], ['16','22','10']],
  'other':                [['07','23','10'], ['01','14','26'], ['16','11','15'], ['20','04','08']],
};

export function pickModules(businessType: BusinessType, preferredModuleIds?: string[]): ModuleSelection {
  const allModules = new Map(MODULES.map(m => [m.id, m]));

  if (preferredModuleIds && preferredModuleIds.length >= 1) {
    const preferred = preferredModuleIds.map(id => allModules.get(id)).filter(Boolean) as CinematicModule[];
    const scrollDriven = preferred.find(m => m.category === 'scroll-driven');
    const secondary = preferred.find(m => m.category === 'cursor-hover' || m.category === 'click-tap');
    const tertiary = preferred.find(m => m.category === 'ambient-auto');

    if (scrollDriven) {
      return {
        primary: scrollDriven,
        secondary,
        tertiary,
        reasoning: preferred.map(m => `${m.name}: selected by user preference`),
      };
    }
  }

  // Pick a random combo from the pool for variety on each generation
  const pool = BUSINESS_COMBO_POOLS[businessType] ?? BUSINESS_COMBO_POOLS['other'];
  const [primaryId, secondaryId, tertiaryId] = pool[Math.floor(Math.random() * pool.length)]!;
  const primary = allModules.get(primaryId)!;
  const secondary = secondaryId ? allModules.get(secondaryId) : undefined;
  const tertiary = tertiaryId ? allModules.get(tertiaryId) : undefined;

  return {
    primary,
    secondary,
    tertiary,
    reasoning: [
      `${primary.name}: primary scroll-driven module, backbone of the page experience`,
      secondary ? `${secondary.name}: adds interaction depth for ${businessType} audiences` : '',
      tertiary ? `${tertiary.name}: ambient typography layer that reinforces brand personality` : '',
    ].filter(Boolean),
  };
}
