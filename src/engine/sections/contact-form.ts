import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { sectionLabel, SPACING_MAP, RADIUS_MAP, t, pickVariant, reveal, glassCard } from './utils.js';

export function renderContactForm(
  brand: BrandCard,
  tokens: DesignTokens,
  data: { personality?: string } & Record<string, any> = {},
): string {
  const { copy } = brand;
  const sp = SPACING_MAP[tokens.spacing];
  const r = RADIUS_MAP[tokens.radius];
  const layout = data.personality ? pickVariant(data.personality) : 'cinematic';

  const inputStyle = `width:100%;padding:0.875rem 1.125rem;background:${tokens.surface2};border:1px solid ${tokens.muted}25;border-radius:${r};color:${tokens.text};font-family:'${tokens.bodyFont}',sans-serif;font-size:0.95rem;outline:none;transition:border-color 0.3s,box-shadow 0.3s;box-sizing:border-box;`;
  const focusGlow = `onfocus="this.style.borderColor='${tokens.accent}';this.style.boxShadow='0 0 20px ${tokens.accent}15'" onblur="this.style.borderColor='${tokens.muted}25';this.style.boxShadow='none'"`;

  const formFields = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
      <div>
        <label style="display:block;font-size:0.72rem;font-weight:500;color:${tokens.muted};letter-spacing:0.08em;text-transform:uppercase;margin-bottom:0.5rem;">${t('contact.name', brand.language)}</label>
        <input type="text" placeholder="${t('contact.name_ph', brand.language)}" style="${inputStyle}" ${focusGlow}>
      </div>
      <div>
        <label style="display:block;font-size:0.72rem;font-weight:500;color:${tokens.muted};letter-spacing:0.08em;text-transform:uppercase;margin-bottom:0.5rem;">${t('contact.email', brand.language)}</label>
        <input type="email" placeholder="your@email.com" style="${inputStyle}" ${focusGlow}>
      </div>
    </div>
    <div>
      <label style="display:block;font-size:0.72rem;font-weight:500;color:${tokens.muted};letter-spacing:0.08em;text-transform:uppercase;margin-bottom:0.5rem;">${t('contact.subject', brand.language)}</label>
      <input type="text" placeholder="${t('contact.subject_ph', brand.language)}" style="${inputStyle}" ${focusGlow}>
    </div>
    <div>
      <label style="display:block;font-size:0.72rem;font-weight:500;color:${tokens.muted};letter-spacing:0.08em;text-transform:uppercase;margin-bottom:0.5rem;">${t('contact.message', brand.language)}</label>
      <textarea placeholder="${t('contact.message_ph', brand.language)}" rows="5" style="${inputStyle}resize:vertical;" ${focusGlow}></textarea>
    </div>`;

  const submitBtn = (align = 'flex-start') => `
    <button type="submit" style="padding:1rem 2.5rem;background:${tokens.accent};color:#fff;font-weight:600;font-size:0.9rem;border-radius:${r};border:none;cursor:pointer;transition:transform 0.3s cubic-bezier(.16,1,.3,1),box-shadow 0.3s;font-family:'${tokens.bodyFont}',sans-serif;align-self:${align};" onmouseover="this.style.transform='translateY(-2px) scale(1.02)';this.style.boxShadow='0 10px 28px ${tokens.accent}40'" onmouseout="this.style.transform='';this.style.boxShadow=''">${copy.cta}</button>`;

  // ── BRUTALIST — full-width, stark form on accent ──────────────────────────
  if (layout === 'brutalist') {
    return `
<section id="contact" style="padding:${sp.section};background:${tokens.surface};position:relative;overflow:hidden;">
  <div style="max-width:1200px;margin:0 auto;">
    ${reveal(`<div style="border:2px solid ${tokens.accent};border-radius:${r};overflow:hidden;">
      <div style="background:${tokens.accent};padding:2.5rem 3rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;">
        <h2 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(2rem,5vw,3.5rem);font-weight:900;line-height:0.95;letter-spacing:-0.04em;color:#fff;text-transform:uppercase;">${copy.cta}</h2>
        <p style="font-size:0.9rem;color:rgba(255,255,255,0.75);max-width:36ch;line-height:1.7;">${copy.tagline}</p>
      </div>
      <div style="padding:3rem;background:${tokens.bg};">
        <form style="display:flex;flex-direction:column;gap:1rem;max-width:700px;margin:0 auto;" onsubmit="return false;">
          ${formFields}
          ${submitBtn()}
        </form>
      </div>
    </div>`, 'fadeUp', 0)}
  </div>
</section>`;
  }

  // ── EDITORIAL / MINIMAL — centered narrow form ────────────────────────────
  if (layout === 'editorial' || layout === 'minimal' || layout === 'deco') {
    return `
<section id="contact" style="padding:${sp.section};background:${tokens.bg};position:relative;overflow:hidden;">
  <div style="max-width:680px;margin:0 auto;position:relative;z-index:1;">
    ${reveal(`<div style="text-align:center;margin-bottom:3.5rem;">
      ${sectionLabel(tokens, t('label.get_in_touch', brand.language))}
      <h2 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(2rem,5vw,3.5rem);font-weight:400;font-style:italic;line-height:1.1;letter-spacing:-0.03em;color:${tokens.text};">${copy.cta}</h2>
      <div style="width:3rem;height:1px;background:${tokens.accent};margin:1.5rem auto 0;"></div>
    </div>`, 'fadeUp', 0)}
    ${reveal(`<form style="display:flex;flex-direction:column;gap:1.25rem;" onsubmit="return false;">
      ${formFields}
      ${submitBtn('center')}
    </form>`, 'fadeUp', 150)}
  </div>
</section>`;
  }

  // ── ORGANIC — softer layout with glass form card ─────────────────────────
  if (layout === 'organic') {
    return `
<section id="contact" style="padding:${sp.section};background:${tokens.surface};position:relative;overflow:hidden;">
  <div style="position:absolute;bottom:10%;left:5%;width:250px;height:250px;border-radius:50%;background:${tokens.accent}06;filter:blur(80px);animation:float 12s ease-in-out infinite;pointer-events:none;"></div>
  <div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1.5fr;gap:clamp(3rem,6vw,7rem);align-items:start;flex-wrap:wrap;">
    <div>
      ${reveal(sectionLabel(tokens, t('label.get_in_touch', brand.language)), 'fadeLeft', 0)}
      ${reveal(`<h2 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(2rem,4vw,3rem);font-weight:700;line-height:1.1;letter-spacing:-0.03em;color:${tokens.text};margin-bottom:1.25rem;">${copy.cta}</h2>`, 'fadeLeft', 80)}
      ${reveal(`<p style="font-size:0.9rem;color:${tokens.muted};line-height:1.8;margin-bottom:2.5rem;">${copy.tagline}</p>`, 'fadeLeft', 160)}
      ${reveal(`<div style="display:flex;flex-direction:column;gap:1rem;">
        <a href="mailto:hello@${brand.slug}.com" style="display:flex;align-items:center;gap:0.875rem;font-size:0.9rem;color:${tokens.muted};text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='${tokens.text}'" onmouseout="this.style.color='${tokens.muted}'">
          <span style="width:2.5rem;height:2.5rem;border-radius:${r};background:linear-gradient(135deg,${tokens.accent}25,${tokens.accent}08);display:flex;align-items:center;justify-content:center;font-size:0.9rem;color:${tokens.accent};flex-shrink:0;">✉</span>
          hello@${brand.slug}.com
        </a>
      </div>`, 'fadeLeft', 240)}
    </div>
    ${reveal(glassCard(tokens, `
      <form style="display:flex;flex-direction:column;gap:1rem;" onsubmit="return false;">
        ${formFields}
        ${submitBtn()}
      </form>
    `, { padding: '2.5rem' }), 'fadeRight', 100)}
  </div>
</section>`;
  }

  // ── DEFAULT: split layout (cinematic/tech/maximalist) ─────────────────────
  return `
<section id="contact" style="padding:${sp.section};background:${tokens.bg};position:relative;overflow:hidden;">
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse 60% 50% at 50% 50%,${tokens.accent}08 0%,transparent 70%);pointer-events:none;"></div>
  <div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1.2fr;gap:clamp(3rem,6vw,7rem);align-items:start;position:relative;z-index:1;flex-wrap:wrap;">
    <div>
      ${reveal(sectionLabel(tokens, t('label.get_in_touch', brand.language)), 'fadeLeft', 0)}
      ${reveal(`<h2 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(2rem,5vw,3.5rem);font-weight:700;line-height:1.05;letter-spacing:-0.04em;color:${tokens.text};margin-bottom:1.5rem;">${copy.cta}</h2>`, 'fadeLeft', 80)}
      ${reveal(`<p style="font-size:0.95rem;color:${tokens.muted};line-height:1.8;margin-bottom:3rem;max-width:38ch;">${copy.tagline}</p>`, 'fadeLeft', 160)}
      ${reveal(`<div style="display:flex;flex-direction:column;gap:1.25rem;">
        <a href="mailto:hello@${brand.slug}.com" style="display:flex;align-items:center;gap:0.875rem;font-size:0.9rem;color:${tokens.muted};text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='${tokens.text}'" onmouseout="this.style.color='${tokens.muted}'">
          <span style="width:2rem;height:2rem;border-radius:${r};background:${tokens.accent}15;display:flex;align-items:center;justify-content:center;font-size:0.85rem;color:${tokens.accent};">✉</span>
          hello@${brand.slug}.com
        </a>
        <a href="tel:+18000000000" style="display:flex;align-items:center;gap:0.875rem;font-size:0.9rem;color:${tokens.muted};text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='${tokens.text}'" onmouseout="this.style.color='${tokens.muted}'">
          <span style="width:2rem;height:2rem;border-radius:${r};background:${tokens.accent}15;display:flex;align-items:center;justify-content:center;font-size:0.85rem;color:${tokens.accent};">☎</span>
          +1 (800) 000-0000
        </a>
      </div>`, 'fadeLeft', 240)}
    </div>
    ${reveal(`<form style="display:flex;flex-direction:column;gap:1rem;" onsubmit="return false;">
      ${formFields}
      ${submitBtn()}
    </form>`, 'fadeRight', 100)}
  </div>
</section>`;
}
