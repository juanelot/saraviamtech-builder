/**
 * landing-pricing.ts
 *
 * 3-column pricing cards for Landing Pages.
 * Center card is highlighted as "most popular".
 */
import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { sectionLabel, SPACING_MAP, RADIUS_MAP, t, reveal } from './utils.js';

export function renderLandingPricing(
  brand: BrandCard,
  tokens: DesignTokens,
  data: Record<string, any> = {},
): string {
  const sp = SPACING_MAP[tokens.spacing];
  const r = RADIUS_MAP[tokens.radius];
  const lang = brand.language ?? 'es';

  const plans = [
    {
      name: t('landing.pricing.p1.name', lang),
      price: t('landing.pricing.p1.price', lang),
      period: t('landing.pricing.p1.period', lang),
      desc: t('landing.pricing.p1.desc', lang),
      popular: false,
      features: brand.copy.services.slice(0, 3).map(s => s),
    },
    {
      name: t('landing.pricing.p2.name', lang),
      price: t('landing.pricing.p2.price', lang),
      period: t('landing.pricing.p2.period', lang),
      desc: t('landing.pricing.p2.desc', lang),
      popular: true,
      features: brand.copy.services.slice(0, 5).map(s => s),
    },
    {
      name: t('landing.pricing.p3.name', lang),
      price: t('landing.pricing.p3.price', lang),
      period: t('landing.pricing.p3.period', lang),
      desc: t('landing.pricing.p3.desc', lang),
      popular: false,
      features: brand.copy.services.map(s => s),
    },
  ];

  const cards = plans.map((plan, i) => {
    const featList = plan.features.map(f => `
      <li style="display:flex;align-items:center;gap:0.625rem;font-size:0.875rem;color:${plan.popular ? 'rgba(255,255,255,0.85)' : tokens.muted};padding:0.375rem 0;">
        <span style="color:${plan.popular ? '#fff' : tokens.accent};flex-shrink:0;">✓</span>${f}
      </li>`).join('');

    if (plan.popular) {
      return reveal(`
      <div style="
        background:${tokens.accent};border-radius:${r};padding:2.5rem 2rem;
        position:relative;box-shadow:0 24px 60px ${tokens.accent}35;
        transform:scale(1.04);
      ">
        <div style="position:absolute;top:-0.875rem;left:50%;transform:translateX(-50%);
          background:#fff;color:${tokens.accent};font-size:0.65rem;font-weight:700;
          letter-spacing:0.1em;text-transform:uppercase;padding:0.3rem 1rem;border-radius:999px;white-space:nowrap;">
          ${t('landing.pricing.popular', lang)}
        </div>
        <div style="font-family:'${tokens.displayFont}',serif;font-size:1.1rem;font-weight:700;color:rgba(255,255,255,0.9);margin-bottom:1rem;">${plan.name}</div>
        <div style="display:flex;align-items:baseline;gap:0.25rem;margin-bottom:0.5rem;">
          <span style="font-family:'${tokens.displayFont}',serif;font-size:clamp(2rem,5vw,3rem);font-weight:800;color:#fff;letter-spacing:-0.04em;">${plan.price}</span>
          <span style="font-size:0.875rem;color:rgba(255,255,255,0.65);">${plan.period}</span>
        </div>
        <p style="font-size:0.8rem;color:rgba(255,255,255,0.6);margin-bottom:1.75rem;">${plan.desc}</p>
        <ul style="list-style:none;padding:0;margin:0 0 2rem;border-top:1px solid rgba(255,255,255,0.18);padding-top:1.25rem;">${featList}</ul>
        <a href="#lead-form" style="display:block;text-align:center;padding:0.875rem 1.5rem;background:#fff;color:${tokens.accent};font-weight:700;font-size:0.875rem;border-radius:${r};text-decoration:none;transition:opacity 0.2s;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">${t('landing.pricing.cta', lang)}</a>
      </div>`, 'fadeUp', i * 80);
    }

    return reveal(`
    <div style="
      background:${tokens.surface};border:1px solid ${tokens.muted}15;border-radius:${r};padding:2.5rem 2rem;
      transition:border-color 0.3s,box-shadow 0.3s;
    " onmouseover="this.style.borderColor='${tokens.accent}30';this.style.boxShadow='0 12px 30px ${tokens.accent}10'" onmouseout="this.style.borderColor='${tokens.muted}15';this.style.boxShadow=''">
      <div style="font-family:'${tokens.displayFont}',serif;font-size:1.1rem;font-weight:700;color:${tokens.text};margin-bottom:1rem;">${plan.name}</div>
      <div style="display:flex;align-items:baseline;gap:0.25rem;margin-bottom:0.5rem;">
        <span style="font-family:'${tokens.displayFont}',serif;font-size:clamp(2rem,5vw,2.5rem);font-weight:800;color:${tokens.text};letter-spacing:-0.04em;">${plan.price}</span>
        <span style="font-size:0.875rem;color:${tokens.muted};">${plan.period}</span>
      </div>
      <p style="font-size:0.8rem;color:${tokens.muted};margin-bottom:1.75rem;">${plan.desc}</p>
      <ul style="list-style:none;padding:0;margin:0 0 2rem;border-top:1px solid ${tokens.muted}12;padding-top:1.25rem;">${featList}</ul>
      <a href="#lead-form" style="display:block;text-align:center;padding:0.875rem 1.5rem;background:${tokens.accent}12;color:${tokens.accent};font-weight:700;font-size:0.875rem;border-radius:${r};text-decoration:none;border:1px solid ${tokens.accent}25;transition:background 0.2s,color 0.2s;" onmouseover="this.style.background='${tokens.accent}';this.style.color='#fff'" onmouseout="this.style.background='${tokens.accent}12';this.style.color='${tokens.accent}'">${t('landing.pricing.cta', lang)}</a>
    </div>`, 'fadeUp', i * 80);
  }).join('');

  return `
<section id="pricing" style="padding:${sp.section};background:${tokens.bg};">
  <div style="max-width:1100px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:3.5rem;">
      ${reveal(sectionLabel(tokens, t('landing.pricing.label', lang)), 'fadeUp', 0)}
      ${reveal(`<h2 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(1.75rem,4vw,3rem);font-weight:800;letter-spacing:-0.04em;color:${tokens.text};margin:0;">${t('landing.pricing.h2', lang)}</h2>`, 'fadeUp', 60)}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1.5rem;align-items:center;">
      ${cards}
    </div>
  </div>
</section>`;
}
