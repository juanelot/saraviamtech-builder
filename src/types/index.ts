export interface SocialScrapeResult {
  platform: 'instagram' | 'facebook' | 'linkedin' | 'tiktok' | 'twitter' | 'website' | 'unknown';
  profileName?: string;
  bio?: string;
  avatarUrl?: string;
  followerCount?: string;
  images: string[];
  colors: string[];
  headlines: string[];
  links: string[];
  category?: string;
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
  };
}

export interface BrandCard {
  name: string;
  slug: string;
  industry: string;
  businessType: BusinessType;
  mood: Mood;
  theme: 'dark' | 'light';
  language: 'es' | 'en';
  colors: {
    bg: string;
    surface: string;
    accent: string;
    text: string;
    muted: string;
  };
  font: {
    display: string;
    body: string;
    googleFontsUrl: string;
  };
  copy: {
    headline: string;
    tagline: string;
    heroLine: string;
    description: string;
    services: string[];
    cta: string;
  };
  sourceUrl?: string;
  socialData?: SocialScrapeResult;
}

export type BusinessType =
  | 'saas-tech'
  | 'agency-studio'
  | 'ecommerce'
  | 'restaurant-food'
  | 'portfolio-creative'
  | 'luxury-jewelry'
  | 'real-estate'
  | 'fitness-health'
  | 'auto-detailing'
  | 'professional-services'
  | 'music-events'
  | 'education'
  | 'beauty-salon'
  | 'legal-finance'
  | 'construction'
  | 'pet-services'
  | 'nonprofit'
  | 'photography'
  | 'travel-tourism'
  | 'gaming-esports'
  | 'other';

export type Mood = 'premium' | 'playful' | 'technical' | 'warm' | 'minimal' | 'bold';

export type ModuleCategory = 'scroll-driven' | 'cursor-hover' | 'click-tap' | 'ambient-auto';

export interface CinematicModule {
  id: string;
  name: string;
  file: string;
  category: ModuleCategory;
  description: string;
  bestFor: BusinessType[];
  incompatibleWith: string[];
}

export interface ModuleSelection {
  primary: CinematicModule;   // scroll-driven (required)
  secondary?: CinematicModule; // cursor/hover or click/tap
  tertiary?: CinematicModule;  // ambient/typography
  reasoning: string[];
}

export interface GeneratedSite {
  id: string;
  slug: string;
  brandCard: BrandCard;
  modules: ModuleSelection;
  html: string;
  createdAt: string;
  url: string;
  status: 'generating' | 'ready' | 'error';
  error?: string;
  heroImageUrl?: string;
  heroVideoUrl?: string;
  galleryImageUrls?: string[];
  siteType?: SiteType;
  templateModuleId?: string;
}

export interface SiteRegistry {
  sites: GeneratedSite[];
  updatedAt: string;
}

export type SiteType = 'full' | 'landing' | 'template';

export interface LandingConfig {
  /** Primary conversion goal shown above the fold */
  goal?: string;
  /** CTA button text (overrides brand.copy.cta if set) */
  ctaText?: string;
  /** Whether to include a pricing section */
  showPricing?: boolean;
  /** Whether to include an FAQ section */
  showFaq?: boolean;
  /** Whether to include a short lead form (vs full contact form) */
  showLeadForm?: boolean;
}

export interface CreateSiteRequest {
  businessName: string;
  businessType: BusinessType;
  mood: Mood;
  theme: 'dark' | 'light';
  language?: 'es' | 'en';
  description: string;
  sourceUrl?: string;
  preferredModules?: string[];
  heroImageUrl?: string;  // public path e.g. /generations/images/xxx.jpg
  heroVideoUrl?: string;  // public path e.g. /generations/videos/xxx.mp4
  galleryImageUrls?: string[];  // additional images for gallery/carousel
  customSections?: string[];    // optional ordered list of section types to override AI plan
  socialUrls?: string[];        // URLs de redes sociales o sitio web del negocio para scraping
  siteType?: SiteType;          // 'full' (default) | 'landing' | 'template'
  landingConfig?: LandingConfig; // extra config when siteType === 'landing'
  templateModuleId?: string;    // module filename without .html, e.g. 'zoom-parallax'
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
