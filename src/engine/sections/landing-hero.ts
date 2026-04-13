/**
 * landing-hero.ts
 *
 * Conversion-optimised hero for Landing Pages.
 * Single goal: get the visitor to click the primary CTA.
 * Features: badge, headline, sub-headline, dual CTA, social proof pill, optional hero image.
 */
import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { RADIUS_MAP, t, btn } from './utils.js';

export function renderLandingHero(
  brand: BrandCard,
  tokens: DesignTokens,
  data: { heroImageUrl?: string; ctaText?: string; goal?: string } = {},
): string {
  const { copy } = brand;
  const r = RADIUS_MAP[tokens.radius];
  const lang = brand.language ?? 'es';
  const cta = data.ctaText ?? copy.cta;
  const hasImage = !!data.heroImageUrl;

  const badge = `
    <div style="display:inline-flex;align-items:center;gap:0.5rem;padding:0.35rem 0.875rem;border-radius:999px;border:1px solid ${tokens.accent}35;background:${tokens.accent}10;margin-bottom:1.75rem;">
      <span style="width:0.45rem;height:0.45rem;border-radius:50%;background:${tokens.accent};animation:lhPulse 2s ease-in-out infinite;display:inline-block;"></span>
      <span style="font-size:0.7rem;font-weight:600;color:${tokens.accent};letter-spacing:0.1em;text-transform:uppercase;">${t('landing.hero.badge', lang)}</span>
    </div>`;

  const headline = `
    <h1 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(2.5rem,6vw,5rem);font-weight:800;line-height:1.02;letter-spacing:-0.04em;color:${tokens.text};margin:0 0 1.25rem;">
      ${copy.heroLine || copy.headline}
    </h1>`;

  const sub = `
    <p style="font-size:clamp(1rem,2.2vw,1.25rem);color:${tokens.muted};line-height:1.65;max-width:52ch;margin-bottom:2.25rem;">
      ${data.goal ?? copy.tagline}
    </p>`;

  const ctaRow = `
    <div style="display:flex;flex-wrap:wrap;gap:0.875rem;align-items:center;margin-bottom:2.5rem;">
      ${btn(tokens, 'primary', cta, '#lead-form')}
      ${btn(tokens, 'ghost', t('hero.learn_more', lang), '#benefits')}
    </div>`;

  const socialProof = `
    <div style="display:flex;align-items:center;gap:0.75rem;">
      <div style="display:flex;">
        ${[1,2,3,4,5].map(i => `<div style="width:2rem;height:2rem;border-radius:50%;background:${tokens.surface2};border:2px solid ${tokens.bg};margin-left:${i > 1 ? '-0.5rem' : '0'};display:flex;align-items:center;justify-content:center;font-size:0.65rem;color:${tokens.muted};font-weight:700;">${i}</div>`).join('')}
      </div>
      <span style="font-size:0.78rem;color:${tokens.muted};">${t('landing.hero.social', lang).replace('{n}', '500')}</span>
    </div>`;

  const imageBlock = hasImage ? `
    <div style="position:relative;border-radius:${r};overflow:hidden;box-shadow:0 32px 80px ${tokens.accent}18;aspect-ratio:16/10;">
      <img src="${data.heroImageUrl}" alt="${brand.name}" style="width:100%;height:100%;object-fit:cover;" loading="eager">
      <div style="position:absolute;inset:0;background:linear-gradient(to bottom,transparent 60%,${tokens.bg}80);"></div>
    </div>` : '';

  return `
<style>
  @keyframes lhPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }
  @keyframes lhFadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  #landing-hero > * { animation: lhFadeUp 0.7s cubic-bezier(.16,1,.3,1) both; }
  #landing-hero .lh-text > * { animation: lhFadeUp 0.7s cubic-bezier(.16,1,.3,1) both; }
  #landing-hero .lh-text > *:nth-child(1){animation-delay:0.1s}
  #landing-hero .lh-text > *:nth-child(2){animation-delay:0.18s}
  #landing-hero .lh-text > *:nth-child(3){animation-delay:0.26s}
  #landing-hero .lh-text > *:nth-child(4){animation-delay:0.34s}
  #landing-hero .lh-text > *:nth-child(5){animation-delay:0.42s}
</style>
<section id="landing-hero" style="
  min-height:100svh;
  display:flex;align-items:center;
  padding:7rem 2.5rem 5rem;
  background:${tokens.bg};
  position:relative;overflow:hidden;
">
  <!-- ambient glow -->
  <div style="position:absolute;top:-10%;left:-5%;width:60%;height:70%;border-radius:50%;background:${tokens.accent}06;filter:blur(120px);pointer-events:none;"></div>
  <div style="max-width:1200px;margin:0 auto;width:100%;display:grid;grid-template-columns:${hasImage ? '1fr 1fr' : '1fr'};gap:4rem;align-items:center;">
    <div class="lh-text">
      ${badge}
      ${headline}
      ${sub}
      ${ctaRow}
      ${socialProof}
    </div>
    ${imageBlock}
  </div>
</section>`;
}
