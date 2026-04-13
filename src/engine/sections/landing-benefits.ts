/**
 * landing-benefits.ts
 *
 * 4-column benefits grid for Landing Pages.
 * Icons (SVG inline), title, description. Replaces the heavy services sections.
 */
import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { sectionLabel, SPACING_MAP, RADIUS_MAP, t, reveal } from './utils.js';

const ICONS = [
  // lightning bolt
  `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  // headset
  `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>`,
  // trending up
  `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
  // check circle
  `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
];

export function renderLandingBenefits(
  brand: BrandCard,
  tokens: DesignTokens,
  data: Record<string, any> = {},
): string {
  const sp = SPACING_MAP[tokens.spacing];
  const r = RADIUS_MAP[tokens.radius];
  const lang = brand.language ?? 'es';

  const benefits = [
    { icon: ICONS[0]!, title: t('landing.benefits.b1.title', lang), desc: t('landing.benefits.b1.desc', lang) },
    { icon: ICONS[1]!, title: t('landing.benefits.b2.title', lang), desc: t('landing.benefits.b2.desc', lang) },
    { icon: ICONS[2]!, title: t('landing.benefits.b3.title', lang), desc: t('landing.benefits.b3.desc', lang) },
    { icon: ICONS[3]!, title: t('landing.benefits.b4.title', lang), desc: t('landing.benefits.b4.desc', lang) },
  ];

  const cards = benefits.map((b, i) => reveal(`
    <div style="
      padding:2rem;background:${tokens.surface};border:1px solid ${tokens.muted}12;
      border-radius:${r};transition:border-color 0.3s,transform 0.3s,box-shadow 0.3s;
    " onmouseover="this.style.borderColor='${tokens.accent}30';this.style.transform='translateY(-4px)';this.style.boxShadow='0 16px 40px ${tokens.accent}15'" onmouseout="this.style.borderColor='${tokens.muted}12';this.style.transform='';this.style.boxShadow=''">
      <div style="width:2.75rem;height:2.75rem;border-radius:${r};background:${tokens.accent}15;color:${tokens.accent};display:flex;align-items:center;justify-content:center;margin-bottom:1.25rem;">
        ${b.icon}
      </div>
      <h3 style="font-family:'${tokens.displayFont}',serif;font-size:1.1rem;font-weight:700;color:${tokens.text};margin-bottom:0.625rem;letter-spacing:-0.02em;">${b.title}</h3>
      <p style="font-size:0.875rem;color:${tokens.muted};line-height:1.75;">${b.desc}</p>
    </div>`, 'fadeUp', i * 80)).join('');

  return `
<section id="benefits" style="padding:${sp.section};background:${tokens.bg};">
  <div style="max-width:1200px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:3.5rem;">
      ${reveal(sectionLabel(tokens, t('landing.benefits.label', lang)), 'fadeUp', 0)}
      ${reveal(`<h2 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(1.75rem,4vw,3rem);font-weight:800;letter-spacing:-0.04em;color:${tokens.text};margin:0;">${t('landing.benefits.h2', lang)}</h2>`, 'fadeUp', 60)}
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1.25rem;">
      ${cards}
    </div>
  </div>
</section>`;
}
