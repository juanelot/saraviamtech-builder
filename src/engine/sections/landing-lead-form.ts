/**
 * landing-lead-form.ts
 *
 * Short 3-field lead capture form optimised for conversion.
 * Name + Email + optional Message. mailto: action by default.
 */
import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { sectionLabel, SPACING_MAP, RADIUS_MAP, t, reveal } from './utils.js';

export function renderLandingLeadForm(
  brand: BrandCard,
  tokens: DesignTokens,
  data: Record<string, any> = {},
): string {
  const sp = SPACING_MAP[tokens.spacing];
  const r = RADIUS_MAP[tokens.radius];
  const lang = brand.language ?? 'es';
  const cta = data.ctaText ?? brand.copy.cta;

  const inputStyle = `
    width:100%;padding:0.875rem 1.125rem;
    background:${tokens.surface2};
    border:1px solid ${tokens.muted}22;
    border-radius:${r};
    color:${tokens.text};
    font-family:'${tokens.bodyFont}',sans-serif;
    font-size:0.95rem;outline:none;
    transition:border-color 0.3s,box-shadow 0.3s;
    box-sizing:border-box;
  `;
  const focus = `onfocus="this.style.borderColor='${tokens.accent}';this.style.boxShadow='0 0 0 3px ${tokens.accent}18'" onblur="this.style.borderColor='${tokens.muted}22';this.style.boxShadow='none'"`;

  const email = brand.socialData?.contactInfo?.email ?? `hola@${brand.slug}.com`;

  return `
<section id="lead-form" style="padding:${sp.section};background:${tokens.surface};border-top:1px solid ${tokens.muted}10;">
  <div style="max-width:700px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:2.75rem;">
      ${reveal(sectionLabel(tokens, t('landing.form.label', lang)), 'fadeUp', 0)}
      ${reveal(`<h2 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(1.75rem,4vw,2.75rem);font-weight:800;letter-spacing:-0.04em;color:${tokens.text};margin:0;">${t('landing.form.h2', lang)}</h2>`, 'fadeUp', 60)}
    </div>
    ${reveal(`
    <form action="mailto:${email}" method="POST" enctype="text/plain" style="display:flex;flex-direction:column;gap:1rem;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
        <div>
          <label style="display:block;font-size:0.72rem;font-weight:500;color:${tokens.muted};letter-spacing:0.08em;text-transform:uppercase;margin-bottom:0.5rem;">${t('landing.form.name', lang)}</label>
          <input type="text" name="name" required placeholder="${t('contact.name_ph', lang)}" style="${inputStyle}" ${focus}>
        </div>
        <div>
          <label style="display:block;font-size:0.72rem;font-weight:500;color:${tokens.muted};letter-spacing:0.08em;text-transform:uppercase;margin-bottom:0.5rem;">${t('landing.form.email', lang)}</label>
          <input type="email" name="email" required placeholder="you@example.com" style="${inputStyle}" ${focus}>
        </div>
      </div>
      <div>
        <label style="display:block;font-size:0.72rem;font-weight:500;color:${tokens.muted};letter-spacing:0.08em;text-transform:uppercase;margin-bottom:0.5rem;">${t('landing.form.message', lang)}</label>
        <textarea name="message" rows="4" placeholder="${t('landing.form.message', lang)}" style="${inputStyle}resize:vertical;"></textarea>
      </div>
      <button type="submit" style="
        padding:1rem 2.5rem;
        background:${tokens.accent};color:#fff;
        font-weight:700;font-size:0.9rem;
        border-radius:${r};border:none;cursor:pointer;
        font-family:'${tokens.bodyFont}',sans-serif;
        transition:transform 0.25s,box-shadow 0.25s;
        align-self:stretch;
      " onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 12px 32px ${tokens.accent}40'" onmouseout="this.style.transform='';this.style.boxShadow=''">${t('landing.form.submit', lang)}</button>
      <p style="text-align:center;font-size:0.75rem;color:${tokens.muted};margin-top:0.25rem;">🔒 ${t('landing.form.privacy', lang)}</p>
    </form>`, 'fadeUp', 120)}
  </div>
</section>`;
}
