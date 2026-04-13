/**
 * landing-cta-final.ts
 *
 * Full-width final CTA band before the footer.
 * Bold headline + sub-text + dual CTA + trust signals.
 */
import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { RADIUS_MAP, t, reveal } from './utils.js';

export function renderLandingCtaFinal(
  brand: BrandCard,
  tokens: DesignTokens,
  data: { ctaText?: string } = {},
): string {
  const r = RADIUS_MAP[tokens.radius];
  const lang = brand.language ?? 'es';
  const cta = data.ctaText ?? brand.copy.cta;

  return `
<section style="
  padding:6rem 2.5rem;
  background:${tokens.accent};
  position:relative;overflow:hidden;
  text-align:center;
">
  <!-- decorative circles -->
  <div style="position:absolute;top:-20%;left:-8%;width:40%;height:150%;border-radius:50%;background:rgba(255,255,255,0.04);pointer-events:none;"></div>
  <div style="position:absolute;bottom:-20%;right:-5%;width:35%;height:130%;border-radius:50%;background:rgba(255,255,255,0.04);pointer-events:none;"></div>
  <div style="max-width:720px;margin:0 auto;position:relative;z-index:1;">
    ${reveal(`<p style="font-size:0.7rem;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:rgba(255,255,255,0.65);margin-bottom:1rem;">${t('landing.ctafinal.label', lang)}</p>`, 'fadeUp', 0)}
    ${reveal(`<h2 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(2rem,5vw,3.5rem);font-weight:800;letter-spacing:-0.04em;color:#fff;line-height:1.05;margin:0 0 1.25rem;">${t('landing.ctafinal.h2', lang)}</h2>`, 'fadeUp', 80)}
    ${reveal(`<p style="font-size:1rem;color:rgba(255,255,255,0.7);margin-bottom:2.25rem;">${t('landing.ctafinal.sub', lang)}</p>`, 'fadeUp', 140)}
    ${reveal(`
    <div style="display:flex;flex-wrap:wrap;gap:0.875rem;justify-content:center;margin-bottom:1.75rem;">
      <a href="#lead-form" style="display:inline-flex;align-items:center;padding:1rem 2.5rem;background:#fff;color:${tokens.accent};font-weight:700;font-size:0.9rem;border-radius:${r};text-decoration:none;transition:transform 0.25s,box-shadow 0.25s;" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 10px 30px rgba(0,0,0,0.2)'" onmouseout="this.style.transform='';this.style.boxShadow=''">${cta}</a>
    </div>
    <p style="font-size:0.75rem;color:rgba(255,255,255,0.5);">🔒 ${t('landing.form.privacy', lang)}</p>
    `, 'fadeUp', 200)}
  </div>
</section>`;
}
