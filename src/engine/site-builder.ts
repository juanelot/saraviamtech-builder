/**
 * site-builder.ts
 *
 * Builds a complete site HTML from a LayoutPlan produced by the Layout Director.
 * Each section is rendered by a dedicated composer, so no two sites share
 * the same structural skeleton.
 *
 * Falls back to a deterministic plan (no OpenAI needed) when AI is unavailable.
 */
import type { BrandCard, ModuleSelection, SiteType, LandingConfig } from '../types/index.js';
import { buildFromTemplate } from './template-injector.js';
import { buildLayoutPlan, buildLandingPlan, type LayoutPlan, type DesignTokens, type SectionPlan } from './layout-director.js';
import { scrapeUrl } from './scraper.js';

import { t } from './sections/utils.js';
import { renderHeroFullbleed } from './sections/hero-fullbleed.js';
import { renderHeroSplit } from './sections/hero-split.js';
import { renderHeroEditorial } from './sections/hero-editorial.js';
import { renderStoryNarrative } from './sections/story-narrative.js';
import { renderGalleryMasonry } from './sections/gallery-masonry.js';
import { renderGalleryGrid } from './sections/gallery-grid.js';
import { renderCarousel } from './sections/carousel.js';
import { renderServicesGrid } from './sections/services-grid.js';
import { renderServicesSticky } from './sections/services-sticky.js';
import { renderStatsBand } from './sections/stats-band.js';
import { renderQuoteFeature } from './sections/quote-feature.js';
import { renderTestimonials } from './sections/testimonials.js';
import { renderCtaBanner } from './sections/cta-banner.js';
import { renderContactForm } from './sections/contact-form.js';
import { renderFaqAccordion } from './sections/faq-accordion.js';
import { renderAccordionSlider } from './sections/accordion-slider.js';
import { renderStickyCards } from './sections/sticky-cards.js';
import { renderFlipCards } from './sections/flip-cards.js';
import { renderTypewriterHero } from './sections/typewriter-hero.js';
import { renderHorizontalScroll } from './sections/horizontal-scroll.js';
import { renderKineticMarquee } from './sections/kinetic-marquee.js';
import { renderSpotlightServices } from './sections/spotlight-services.js';
import { renderMeshHero } from './sections/mesh-hero.js';
import { renderFooter } from './sections/footer.js';
import { renderSpotlightBorder } from './sections/spotlight-border.js';
import { renderMeshGradient } from './sections/mesh-gradient.js';
import { renderGlitchEffect } from './sections/glitch-effect.js';
import { renderTextScramble } from './sections/text-scramble.js';
import { renderOdometer } from './sections/odometer.js';
import { renderStickyStack } from './sections/sticky-stack.js';
import { renderSvgDraw } from './sections/svg-draw.js';
import { renderZoomParallax } from './sections/zoom-parallax.js';
import { renderTypewriter } from './sections/typewriter.js';
import { renderCircularText } from './sections/circular-text.js';
import { renderTextMask } from './sections/text-mask.js';
import { renderCurtainReveal } from './sections/curtain-reveal.js';
import { renderSplitScroll } from './sections/split-scroll.js';
import { renderColorShift } from './sections/color-shift.js';
import { renderCursorReactive } from './sections/cursor-reactive.js';
import { renderCursorReveal } from './sections/cursor-reveal.js';
import { renderImageTrail } from './sections/image-trail.js';
import { renderMagneticGrid } from './sections/magnetic-grid.js';
import { renderCoverflow } from './sections/coverflow.js';
import { renderViewTransitions } from './sections/view-transitions.js';
import { renderParticleButton } from './sections/particle-button.js';
import { renderGradientStroke } from './sections/gradient-stroke.js';
import { renderDockNav } from './sections/dock-nav.js';
import { renderDragPan } from './sections/drag-pan.js';
import { renderDynamicIsland } from './sections/dynamic-island.js';
import { renderLandingHero } from './sections/landing-hero.js';
import { renderLandingBenefits } from './sections/landing-benefits.js';
import { renderLandingSocialProof } from './sections/landing-social-proof.js';
import { renderLandingPricing } from './sections/landing-pricing.js';
import { renderLandingCtaFinal } from './sections/landing-cta-final.js';
import { renderLandingLeadForm } from './sections/landing-lead-form.js';
import { renderLandingFooter } from './sections/landing-footer.js';

// ─── Nav (always rendered outside the section pipeline) ─────────────────────

/** Minimal landing nav — logo only + single CTA anchored to lead form */
function renderLandingNav(brand: BrandCard, tokens: DesignTokens): string {
  const { copy } = brand;
  return `
<style>
  #landing-nav-hamburger { display:none;background:none;border:none;cursor:pointer;padding:0.25rem;color:${tokens.text}; }
  #landing-nav-drawer {
    display:none;position:fixed;top:0;left:0;right:0;bottom:0;z-index:999;
    background:${tokens.bg}f5;backdrop-filter:blur(20px);
    flex-direction:column;align-items:center;justify-content:center;gap:2rem;
  }
  #landing-nav-drawer.open { display:flex; }
  #landing-nav-drawer a { font-size:1.5rem;font-weight:600;color:${tokens.text};text-decoration:none;font-family:'${tokens.displayFont}',serif; }
  #landing-nav-drawer a:hover { color:${tokens.accent}; }
  #landing-nav-drawer-close { position:absolute;top:1.5rem;right:1.5rem;background:none;border:none;cursor:pointer;color:${tokens.muted};font-size:1.5rem; }
  @media (max-width: 768px) {
    #landing-nav-links { display:none !important; }
    #landing-nav-hamburger { display:flex !important; }
  }
</style>
<nav id="landing-site-nav" style="
  position:fixed;top:0;left:0;right:0;z-index:1000;
  padding:1.25rem 2.5rem;
  display:flex;align-items:center;justify-content:space-between;
  background:${tokens.bg}00;backdrop-filter:blur(0px);
  border-bottom:1px solid transparent;
  transition:background 0.4s,backdrop-filter 0.4s,border-color 0.4s;
  font-family:'${tokens.bodyFont}',sans-serif;
">
  <div style="font-family:'${tokens.displayFont}',serif;font-weight:700;font-size:1.1rem;letter-spacing:-0.03em;color:${tokens.text};">${brand.name}</div>
  <div id="landing-nav-links" style="display:flex;align-items:center;gap:1.5rem;">
    <a href="#benefits" style="font-size:0.85rem;color:${tokens.muted};text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='${tokens.text}'" onmouseout="this.style.color='${tokens.muted}'">${brand.language === 'en' ? 'Benefits' : 'Beneficios'}</a>
    <a href="#pricing" style="font-size:0.85rem;color:${tokens.muted};text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='${tokens.text}'" onmouseout="this.style.color='${tokens.muted}'">${brand.language === 'en' ? 'Pricing' : 'Precios'}</a>
    <a href="#lead-form" style="display:inline-flex;align-items:center;padding:0.6rem 1.5rem;background:${tokens.accent};color:#fff;font-weight:600;font-size:0.8rem;border-radius:0.5rem;text-decoration:none;transition:opacity 0.2s;" onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">${copy.cta}</a>
  </div>
  <button id="landing-nav-hamburger" onclick="document.getElementById('landing-nav-drawer').classList.add('open')" aria-label="Abrir menú">
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
      <line x1="2" y1="5" x2="20" y2="5"/><line x1="2" y1="11" x2="20" y2="11"/><line x1="2" y1="17" x2="20" y2="17"/>
    </svg>
  </button>
</nav>
<div id="landing-nav-drawer">
  <button id="landing-nav-drawer-close" onclick="document.getElementById('landing-nav-drawer').classList.remove('open')">✕</button>
  <a href="#benefits" onclick="document.getElementById('landing-nav-drawer').classList.remove('open')">${brand.language === 'en' ? 'Benefits' : 'Beneficios'}</a>
  <a href="#pricing" onclick="document.getElementById('landing-nav-drawer').classList.remove('open')">${brand.language === 'en' ? 'Pricing' : 'Precios'}</a>
  <a href="#lead-form" onclick="document.getElementById('landing-nav-drawer').classList.remove('open')" style="color:${tokens.accent};">${copy.cta}</a>
</div>
<script>
(function(){
  var nav = document.getElementById('landing-site-nav');
  window.addEventListener('scroll', function() {
    var s = window.scrollY > 60;
    if(nav){
      nav.style.background = s ? '${tokens.bg}e8' : '${tokens.bg}00';
      nav.style.backdropFilter = s ? 'blur(16px)' : 'blur(0px)';
      nav.style.borderBottomColor = s ? '${tokens.muted}28' : 'transparent';
    }
  });
})();
</script>`;
}

function renderNav(brand: BrandCard, tokens: DesignTokens): string {
  const { copy } = brand;
  return `
<style>
  #site-nav-links { display:flex;gap:2rem;align-items:center; }
  #nav-hamburger { display:none;background:none;border:none;cursor:pointer;padding:0.25rem;color:${tokens.text}; }
  #nav-drawer {
    display:none;position:fixed;top:0;left:0;right:0;bottom:0;z-index:999;
    background:${tokens.bg}f5;backdrop-filter:blur(20px);
    flex-direction:column;align-items:center;justify-content:center;gap:2rem;
  }
  #nav-drawer.open { display:flex; }
  #nav-drawer a {
    font-size:1.5rem;font-weight:600;color:${tokens.text};text-decoration:none;
    font-family:'${tokens.displayFont}',serif;letter-spacing:-0.02em;
    transition:color 0.2s;
  }
  #nav-drawer a:hover { color:${tokens.accent}; }
  #nav-drawer-close {
    position:absolute;top:1.5rem;right:1.5rem;background:none;border:none;
    cursor:pointer;color:${tokens.muted};font-size:1.5rem;line-height:1;
  }
  @media (max-width: 768px) {
    #site-nav-links { display:none !important; }
    #nav-hamburger { display:flex !important; }
  }
</style>
<nav id="site-nav" style="
  position:fixed;top:0;left:0;right:0;z-index:1000;
  padding:1.25rem 2.5rem;
  display:flex;align-items:center;justify-content:space-between;
  background:${tokens.bg}00;
  backdrop-filter:blur(0px);
  border-bottom:1px solid transparent;
  transition:background 0.4s,backdrop-filter 0.4s,border-color 0.4s;
  font-family:'${tokens.bodyFont}',sans-serif;
">
  <div style="font-family:'${tokens.displayFont}',serif;font-weight:700;font-size:1.1rem;letter-spacing:-0.03em;color:${tokens.text};">${brand.name}</div>
  <div id="site-nav-links">
    <a href="#services" style="font-size:0.85rem;color:${tokens.muted};text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='${tokens.text}'" onmouseout="this.style.color='${tokens.muted}'">${t('footer.services', brand.language)}</a>
    <a href="#contact" style="font-size:0.85rem;color:${tokens.muted};text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='${tokens.text}'" onmouseout="this.style.color='${tokens.muted}'">${t('footer.contact', brand.language)}</a>
    <a href="#contact" style="display:inline-flex;align-items:center;padding:0.6rem 1.5rem;background:${tokens.accent};color:#fff;font-weight:600;font-size:0.8rem;border-radius:0.5rem;text-decoration:none;">${copy.cta}</a>
  </div>
  <button id="nav-hamburger" onclick="document.getElementById('nav-drawer').classList.add('open')" aria-label="Abrir menú">
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
      <line x1="2" y1="5" x2="20" y2="5"/><line x1="2" y1="11" x2="20" y2="11"/><line x1="2" y1="17" x2="20" y2="17"/>
    </svg>
  </button>
</nav>
<div id="nav-drawer">
  <button id="nav-drawer-close" onclick="document.getElementById('nav-drawer').classList.remove('open')" aria-label="Cerrar menú">✕</button>
  <a href="#services" onclick="document.getElementById('nav-drawer').classList.remove('open')">${t('footer.services', brand.language)}</a>
  <a href="#contact" onclick="document.getElementById('nav-drawer').classList.remove('open')">${t('footer.contact', brand.language)}</a>
  <a href="#contact" onclick="document.getElementById('nav-drawer').classList.remove('open')" style="color:${tokens.accent};">${copy.cta}</a>
</div>
<script>
(function(){
  var nav = document.getElementById('site-nav');
  window.addEventListener('scroll', function() {
    var s = window.scrollY > 60;
    if(nav){
      nav.style.background = s ? '${tokens.bg}e8' : '${tokens.bg}00';
      nav.style.backdropFilter = s ? 'blur(16px)' : 'blur(0px)';
      nav.style.borderBottomColor = s ? '${tokens.muted}28' : 'transparent';
    }
  });
})();
</script>`;
}

// ─── Section dispatcher ──────────────────────────────────────────────────────

function renderSection(
  section: SectionPlan,
  brand: BrandCard,
  tokens: DesignTokens,
  mediaData: { heroImageUrl?: string; heroVideoUrl?: string; images?: string[] },
): string {
  const d: any = { ...section.data, variant: section.variant, ...mediaData };

  switch (section.type) {
    case 'hero-fullbleed':   return renderHeroFullbleed(brand, tokens, d);
    case 'hero-split':       return renderHeroSplit(brand, tokens, d);
    case 'hero-editorial':   return renderHeroEditorial(brand, tokens, d);
    case 'story-narrative':  return renderStoryNarrative(brand, tokens, d);
    case 'gallery-masonry':  return renderGalleryMasonry(brand, tokens, d);
    case 'gallery-grid':     return renderGalleryGrid(brand, tokens, d);
    case 'carousel':         return renderCarousel(brand, tokens, d);
    case 'services-grid':    return renderServicesGrid(brand, tokens, d);
    case 'services-sticky':  return renderServicesSticky(brand, tokens, d);
    case 'stats-band':       return renderStatsBand(brand, tokens, d);
    case 'quote-feature':    return renderQuoteFeature(brand, tokens, d);
    case 'testimonials':     return renderTestimonials(brand, tokens, d);
    case 'cta-banner':       return renderCtaBanner(brand, tokens, d);
    case 'contact-form':     return renderContactForm(brand, tokens, d);
    case 'faq-accordion':    return renderFaqAccordion(brand, tokens, d);
    case 'accordion-slider':  return renderAccordionSlider(brand, tokens, d);
    case 'sticky-cards':      return renderStickyCards(brand, tokens, d);
    case 'flip-cards':        return renderFlipCards(brand, tokens, d);
    case 'typewriter-hero':   return renderTypewriterHero(brand, tokens, d);
    case 'horizontal-scroll': return renderHorizontalScroll(brand, tokens, d);
    case 'kinetic-marquee':    return renderKineticMarquee(brand, tokens, d);
    case 'spotlight-services': return renderSpotlightServices(brand, tokens, d);
    case 'mesh-hero':          return renderMeshHero(brand, tokens, d);
    case 'footer':           return renderFooter(brand, tokens, d);
    case 'spotlight-border': return renderSpotlightBorder(brand, tokens, d);
    case 'mesh-gradient':    return renderMeshGradient(brand, tokens, d);
    case 'glitch-effect':    return renderGlitchEffect(brand, tokens, d);
    case 'text-scramble':    return renderTextScramble(brand, tokens, d);
    case 'odometer':         return renderOdometer(brand, tokens, d);
    case 'sticky-stack':     return renderStickyStack(brand, tokens, d);
    case 'svg-draw':         return renderSvgDraw(brand, tokens, d);
    case 'zoom-parallax':    return renderZoomParallax(brand, tokens, d);
    case 'typewriter':        return renderTypewriter(brand, tokens, d);
    case 'circular-text':     return renderCircularText(brand, tokens, d);
    case 'text-mask':         return renderTextMask(brand, tokens, d);
    case 'curtain-reveal':    return renderCurtainReveal(brand, tokens, d);
    case 'split-scroll':      return renderSplitScroll(brand, tokens, d);
    case 'color-shift':       return renderColorShift(brand, tokens, d);
    case 'cursor-reactive':   return renderCursorReactive(brand, tokens, d);
    case 'cursor-reveal':     return renderCursorReveal(brand, tokens, d);
    case 'image-trail':       return renderImageTrail(brand, tokens, d);
    case 'magnetic-grid':     return renderMagneticGrid(brand, tokens, d);
    case 'coverflow':         return renderCoverflow(brand, tokens, d);
    case 'view-transitions':  return renderViewTransitions(brand, tokens, d);
    case 'particle-button':   return renderParticleButton(brand, tokens, d);
    case 'gradient-stroke':   return renderGradientStroke(brand, tokens, d);
    case 'dock-nav':          return renderDockNav(brand, tokens, d);
    case 'drag-pan':          return renderDragPan(brand, tokens, d);
    case 'dynamic-island':      return renderDynamicIsland(brand, tokens, d);
    // ─── Landing Page sections ──────────────────────────────────────────────
    case 'landing-hero':        return renderLandingHero(brand, tokens, d);
    case 'landing-benefits':    return renderLandingBenefits(brand, tokens, d);
    case 'landing-social-proof':return renderLandingSocialProof(brand, tokens, d);
    case 'landing-pricing':     return renderLandingPricing(brand, tokens, d);
    case 'landing-cta-final':   return renderLandingCtaFinal(brand, tokens, d);
    case 'landing-lead-form':   return renderLandingLeadForm(brand, tokens, d);
    case 'landing-footer':      return renderLandingFooter(brand, tokens, d);
    default:                    return '';
  }
}

// ─── Grain noise overlay (visual quality) ───────────────────────────────────

function grainStyle(): string {
  return `
<style>
body::after {
  content:'';position:fixed;inset:0;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  opacity:0.035;pointer-events:none;z-index:9998;
}
</style>`;
}

// ─── Smooth scroll + page-load fade ─────────────────────────────────────────

function globalScripts(): string {
  return `
<script>
document.documentElement.style.scrollBehavior = 'smooth';
// Fade-in on load
document.addEventListener('DOMContentLoaded', function() {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.5s';
  requestAnimationFrame(function() { document.body.style.opacity = '1'; });

  // ── Scroll-reveal via IntersectionObserver ──
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function(el) { io.observe(el); });
  } else {
    reveals.forEach(function(el) { el.classList.add('revealed'); });
  }

  // ── Animated counters ──
  var counters = document.querySelectorAll('[data-count-to]');
  if (counters.length && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var target = el.getAttribute('data-count-to') || '0';
        var isNum = /^\\d+$/.test(target.replace(/[+%,]/g,''));
        if (!isNum) { el.textContent = target; cio.unobserve(el); return; }
        var suffix = target.replace(/[\\d,]/g, '');
        var num = parseInt(target.replace(/[^\\d]/g, ''), 10);
        var dur = 1800, start = 0, t0 = null;
        function step(ts) {
          if (!t0) t0 = ts;
          var p = Math.min((ts - t0) / dur, 1);
          var ease = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.floor(ease * num) + suffix;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        cio.unobserve(el);
      });
    }, { threshold: 0.3 });
    counters.forEach(function(el) { cio.observe(el); });
  }
});
</script>`;
}

// ─── Main export ─────────────────────────────────────────────────────────────

/**
 * buildSite — async now, runs Layout Director (LLM or fallback) to get plan.
 * Returns complete standalone HTML.
 */
export async function buildSite(
  brand: BrandCard,
  _modules: ModuleSelection,   // kept for API compat, no longer primary driver
  heroImageUrl?: string,
  heroVideoUrl?: string,
  extraImages?: string[],       // additional images from gallery
  customSections?: string[],    // optional override: ordered list of section types
  noAI?: boolean,               // skip LLM, use deterministic fallback (for previews)
  seed?: number,
  siteType?: SiteType,          // 'full' (default) | 'landing' | 'template'
  landingConfig?: LandingConfig,
  templateModuleId?: string,    // module id when siteType === 'template'
): Promise<string> {

  // Template mode: inject brand into a chosen cinematic module, skip Layout Director
  if (siteType === 'template' && templateModuleId) {
    return buildFromTemplate(brand, templateModuleId, heroImageUrl, heroVideoUrl, extraImages);
  }

  // 1. Optionally scrape source URL for extra context
  let scrapedData: { headlines?: string[]; colors?: string[]; images?: string[] } | undefined;
  if (brand.sourceUrl) {
    try {
      const scraped = await scrapeUrl(brand.sourceUrl);
      scrapedData = {
        headlines: scraped.headlines,
        colors: scraped.colors,
        images: scraped.images,
      };
    } catch (e) {
      console.warn('[site-builder] scrape failed:', e);
    }
  }

  // 2. Collect all available images (hero first, then gallery, then scraped, then social)
  const allImages: string[] = [];
  if (heroImageUrl) allImages.push(heroImageUrl);
  if (extraImages?.length) allImages.push(...extraImages);
  if (scrapedData?.images?.length) allImages.push(...scrapedData.images.slice(0, 8));
  if (brand.socialData?.images?.length) allImages.push(...brand.socialData.images.slice(0, 12));

  // De-duplicate images
  const uniqueImages = [...new Set(allImages)];

  // 3. Get layout plan from director (LLM or deterministic fallback)
  // Pass total unique image count so the director can include gallery/carousel sections
  let plan: LayoutPlan;
  if (siteType === 'landing') {
    const effectiveSeed = seed ?? (Date.now() ^ Math.floor(Math.random() * 0xffff));
    plan = buildLandingPlan(brand, uniqueImages.length, {
      showPricing: landingConfig?.showPricing,
      showFaq: landingConfig?.showFaq,
      showLeadForm: landingConfig?.showLeadForm,
    }, effectiveSeed);
  } else {
    plan = await buildLayoutPlan(brand, uniqueImages.length, scrapedData, noAI, seed);
  }
  let { tokens, sections } = plan;

  // If a heroVideoUrl is provided, force the first section to a video-capable hero
  const videoCapableHeros = new Set(['hero-fullbleed', 'hero-split', 'mesh-hero', 'typewriter-hero']);
  if (heroVideoUrl && sections.length > 0 && !videoCapableHeros.has(sections[0].type)) {
    sections = [{ type: 'hero-fullbleed', variant: sections[0].variant ?? brand.theme }, ...sections.slice(1)];
  }

  // If customSections provided, override the AI plan's section list
  // Keep tokens/personality from the plan but swap the sections
  if (customSections && customSections.length > 0) {
    sections = customSections.map(type => ({ type: type as any, data: {} }));
    // Ensure footer is always last
    if (!sections.some(s => s.type === 'footer')) {
      sections.push({ type: 'footer', data: {} });
    }
  }

  console.log(`[site-builder] personality=${plan.personality} sections=${sections.map(s => s.type).join(',')} images=${uniqueImages.length}`);

  // 4. Build media data passed to each section
  // Gallery sections get all images except the hero (index 0) to avoid duplication
  const galleryImages = uniqueImages.length > 1 ? uniqueImages.slice(1) : uniqueImages;

  const mediaData = {
    heroImageUrl,
    heroVideoUrl,
    images: uniqueImages.length > 1 ? galleryImages : undefined,
  };

  // 5. Compose HTML
  const sectionHtml = sections.map(s => renderSection(s, brand, tokens, mediaData)).join('\n');

  const html = `<!DOCTYPE html>
<html lang="${brand.language ?? 'es'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${brand.name} — ${brand.copy.tagline}</title>
  <meta name="description" content="${brand.copy.description}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="${tokens.googleFontsUrl}" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: ${tokens.bg};
      --surface: ${tokens.surface};
      --surface2: ${tokens.surface2};
      --accent: ${tokens.accent};
      --text: ${tokens.text};
      --muted: ${tokens.muted};
      --font-display: '${tokens.displayFont}', serif;
      --font-body: '${tokens.bodyFont}', sans-serif;
    }
    html { scroll-behavior: smooth; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--font-body);
      font-size: 1rem;
      line-height: 1.6;
      min-height: 100dvh;
    }
    img, video { max-width: 100%; }
    a { color: inherit; }
    html, body { overflow-x: hidden; }
    /* ── Scroll reveal animations ── */
    .reveal {
      opacity: 0;
      transition: opacity 0.8s cubic-bezier(.16,1,.3,1), transform 0.8s cubic-bezier(.16,1,.3,1);
    }
    .reveal-fadeUp { transform: translateY(32px); }
    .reveal-fadeLeft { transform: translateX(-32px); }
    .reveal-fadeRight { transform: translateX(32px); }
    .reveal-scaleIn { transform: scale(0.92); }
    .reveal.revealed {
      opacity: 1;
      transform: translateY(0) translateX(0) scale(1);
    }
    /* ── Hover utility classes ── */
    .hover-lift {
      transition: transform 0.4s cubic-bezier(.16,1,.3,1), box-shadow 0.4s cubic-bezier(.16,1,.3,1);
    }
    .hover-lift:hover {
      transform: translateY(-6px) scale(1.02);
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
    }
    .hover-glow {
      transition: border-color 0.3s, box-shadow 0.3s;
    }
    .hover-glow:hover {
      border-color: var(--accent) !important;
      box-shadow: 0 0 30px color-mix(in srgb, var(--accent) 20%, transparent);
    }
    .hover-scale {
      transition: transform 0.5s cubic-bezier(.16,1,.3,1);
    }
    .hover-scale:hover { transform: scale(1.04); }
    /* ── Marquee animation ── */
    @keyframes marquee {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    /* ── Subtle float animation ── */
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
    /* ── Pulse glow ── */
    @keyframes pulseGlow {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 0.8; }
    }
    /* ── Mobile responsive ── */
    @media (max-width: 768px) {
      section {
        padding-left: 1.25rem !important;
        padding-right: 1.25rem !important;
      }
      nav { padding: 1rem 1.25rem !important; }
      /* Colapsar cualquier grid multi-columna a 1 columna */
      [style*="grid-template-columns"] {
        grid-template-columns: 1fr !important;
      }
      /* Resetear spans de bento grid */
      [style*="grid-column:span"] {
        grid-column: span 1 !important;
      }
      [style*="grid-column: span"] {
        grid-column: span 1 !important;
      }
      /* Colapsar flex rows que deberían stackearse */
      [style*="display:flex"][style*="justify-content:space-between"] {
        flex-direction: column !important;
        gap: 1rem !important;
      }
      /* Reducir padding de secciones internas */
      [style*="max-width:1200px"], [style*="max-width:1100px"], [style*="max-width:1300px"], [style*="max-width:900px"] {
        padding-left: 0 !important;
        padding-right: 0 !important;
      }
      /* Ocultar elementos decorativos solo para móvil */
      .mobile-hide { display: none !important; }
      /* Hero: reducir altura mínima */
      #hero { min-height: 100svh !important; }
      /* Writing mode vertical — ocultar en móvil */
      [style*="writing-mode:vertical"] { display: none !important; }
      [style*="writing-mode: vertical"] { display: none !important; }
      /* Ajustar padding de hero para no quedar bajo nav */
      #hero > div { padding-bottom: 3rem !important; }
    }
    @media (max-width: 480px) {
      /* Tipografía: limitar tamaños mínimos de h1 */
      h1 { font-size: clamp(2rem, 9vw, 4rem) !important; line-height: 1.1 !important; }
      h2 { font-size: clamp(1.5rem, 7vw, 2.5rem) !important; }
      /* Padding de secciones aún más compacto */
      section { padding-left: 1rem !important; padding-right: 1rem !important; }
      /* Botones: stackear verticalmente */
      [style*="display:flex"][style*="gap:1rem"] { flex-wrap: wrap !important; }
      /* Imagen lateral decorativa en heroes — ocultar */
      [style*="right:0;top:0;width:45%"],
      [style*="right:0;top:0;width:38%"] { display: none !important; }
    }
  </style>
  ${tokens.grainOverlay ? grainStyle() : ''}
</head>
<body>
${siteType === 'landing' ? renderLandingNav(brand, tokens) : renderNav(brand, tokens)}
${sectionHtml}
${globalScripts()}
</body>
</html>`;

  return html;
}

/**
 * buildSiteSync — synchronous wrapper for cases where async isn't feasible.
 * Uses deterministic fallback (no LLM call).
 */
export function buildSiteSync(
  brand: BrandCard,
  modules: ModuleSelection,
  heroImageUrl?: string,
  heroVideoUrl?: string,
): string {
  // Return a minimal HTML while async build runs — caller should use buildSite()
  return `<!DOCTYPE html><html><head><title>${brand.name}</title></head><body><p>Building site...</p></body></html>`;
}
