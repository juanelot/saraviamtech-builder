/**
 * landing-social-proof.ts
 *
 * Social proof section for Landing Pages.
 * Shows logo-placeholder tiles + a trust statement strip.
 * Complements the testimonials section.
 */
import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { sectionLabel, RADIUS_MAP, t, reveal } from './utils.js';

export function renderLandingSocialProof(
  brand: BrandCard,
  tokens: DesignTokens,
  data: Record<string, any> = {},
): string {
  const r = RADIUS_MAP[tokens.radius];
  const lang = brand.language ?? 'es';

  // Generate placeholder company name tiles
  const companies = [
    'Acme Corp', 'Vertex Inc', 'NovaTech', 'Orion Labs',
    'Pulse Co', 'Stratos', 'Zenith HQ', 'Apex Group',
  ];

  const logos = companies.map((name, i) => reveal(`
    <div style="
      padding:1rem 1.5rem;background:${tokens.surface};border:1px solid ${tokens.muted}10;
      border-radius:${r};display:flex;align-items:center;justify-content:center;
      min-height:4rem;transition:border-color 0.3s;
    " onmouseover="this.style.borderColor='${tokens.accent}25'" onmouseout="this.style.borderColor='${tokens.muted}10'">
      <span style="font-family:'${tokens.displayFont}',serif;font-size:0.9rem;font-weight:700;color:${tokens.muted};letter-spacing:-0.02em;white-space:nowrap;">${name}</span>
    </div>`, 'fadeUp', i * 50)).join('');

  const stats = [
    { n: '500+', label: lang === 'es' ? 'Clientes' : 'Clients' },
    { n: '98%',  label: lang === 'es' ? 'Satisfacción' : 'Satisfaction' },
    { n: '4.9★', label: lang === 'es' ? 'Valoración' : 'Rating' },
  ];

  const statsRow = stats.map(s => `
    <div style="text-align:center;">
      <div style="font-family:'${tokens.displayFont}',serif;font-size:2rem;font-weight:800;color:${tokens.text};letter-spacing:-0.04em;">${s.n}</div>
      <div style="font-size:0.78rem;color:${tokens.muted};letter-spacing:0.06em;text-transform:uppercase;margin-top:0.25rem;">${s.label}</div>
    </div>`).join('');

  return `
<section style="padding:5rem 2.5rem;background:${tokens.surface};border-top:1px solid ${tokens.muted}10;border-bottom:1px solid ${tokens.muted}10;">
  <div style="max-width:1100px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:2.5rem;">
      ${reveal(sectionLabel(tokens, t('landing.proof.label', lang)), 'fadeUp', 0)}
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-bottom:3.5rem;">
      ${logos}
    </div>
    <div style="display:flex;justify-content:center;gap:4rem;padding:2.5rem 0;border-top:1px solid ${tokens.muted}10;flex-wrap:wrap;">
      ${statsRow}
    </div>
  </div>
</section>`;
}
