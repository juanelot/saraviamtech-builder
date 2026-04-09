import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { RADIUS_MAP, SPACING_MAP, sectionLabel, pickVariant, reveal, gradientText, glassCard, decorativeLine } from './utils.js';

export function renderCtaBanner(
  brand: BrandCard,
  tokens: DesignTokens,
  data: { variant?: string; personality?: string } = {},
): string {
  const r = RADIUS_MAP[tokens.radius];
  const sp = SPACING_MAP[tokens.spacing];
  const isAccent = data.variant === 'accent';
  const layout = data.personality ? pickVariant(data.personality) : 'cinematic';
  const { copy } = brand;

  // ── BRUTALIST — full-bleed accent with oversized type ─────────────────────
  if (layout === 'brutalist') {
    return `
<section style="padding:${sp.section};background:${tokens.accent};position:relative;overflow:hidden;border-top:4px solid ${tokens.text}20;border-bottom:4px solid ${tokens.text}20;">
  <div style="position:absolute;top:-2rem;left:-2rem;font-family:'${tokens.displayFont}',serif;font-size:clamp(10rem,22vw,18rem);font-weight:900;line-height:1;color:rgba(0,0,0,0.1);pointer-events:none;letter-spacing:-0.06em;user-select:none;">!</div>
  <div style="max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:3rem;flex-wrap:wrap;position:relative;z-index:1;">
    <div>
      ${reveal(`<h2 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(2.5rem,7vw,5.5rem);font-weight:900;line-height:0.9;letter-spacing:-0.04em;color:#fff;text-transform:uppercase;margin-bottom:1rem;">${copy.cta}</h2>`, 'fadeLeft', 0)}
      ${reveal(`<p style="font-size:1rem;color:rgba(255,255,255,0.7);max-width:42ch;line-height:1.7;">${copy.tagline}</p>`, 'fadeUp', 100)}
    </div>
    ${reveal(`<a href="#contact" style="display:inline-flex;align-items:center;padding:1.1rem 3rem;background:#fff;color:${tokens.accent};font-weight:700;font-size:0.9rem;border-radius:${r};text-decoration:none;flex-shrink:0;letter-spacing:0.02em;transition:transform 0.3s cubic-bezier(.16,1,.3,1),box-shadow 0.3s;" onmouseover="this.style.transform='translateY(-3px) scale(1.02)';this.style.boxShadow='0 16px 40px rgba(0,0,0,0.25)'" onmouseout="this.style.transform='';this.style.boxShadow=''">${copy.cta} →</a>`, 'scaleIn', 200)}
  </div>
</section>`;
  }

  // ── EDITORIAL / MAGAZINE — centered, refined ──────────────────────────────
  if (layout === 'editorial' || layout === 'deco' || layout === 'minimal') {
    return `
<section style="padding:${sp.section};background:${tokens.bg};position:relative;overflow:hidden;">
  <div style="max-width:900px;margin:0 auto;text-align:center;position:relative;z-index:1;">
    ${reveal(`<div style="width:4rem;height:1px;background:${tokens.accent};margin:0 auto 2rem;"></div>`, 'scaleIn', 0)}
    ${reveal(`<h2 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(2.5rem,6vw,4.5rem);font-weight:400;font-style:italic;line-height:1.1;letter-spacing:-0.03em;color:${tokens.text};margin-bottom:1.5rem;">${copy.tagline}</h2>`, 'fadeUp', 100)}
    ${reveal(`<p style="font-size:0.9rem;color:${tokens.muted};max-width:44ch;line-height:1.8;margin:0 auto 2.5rem;">${copy.description}</p>`, 'fadeUp', 200)}
    ${reveal(`<a href="#contact" style="display:inline-flex;align-items:center;padding:1rem 3rem;background:${tokens.accent};color:#fff;font-weight:600;font-size:0.875rem;border-radius:${r};text-decoration:none;letter-spacing:0.04em;transition:transform 0.3s cubic-bezier(.16,1,.3,1),box-shadow 0.3s;" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 12px 32px ${tokens.accent}45'" onmouseout="this.style.transform='';this.style.boxShadow=''">${copy.cta}</a>`, 'scaleIn', 300)}
    ${decorativeLine(tokens, 'dots')}
  </div>
</section>`;
  }

  // ── ORGANIC — card with floating decorative circle ────────────────────────
  if (layout === 'organic') {
    return `
<section style="padding:${sp.section};background:${tokens.surface};position:relative;overflow:hidden;">
  <div style="max-width:1100px;margin:0 auto;">
    ${reveal(glassCard(tokens, `
      <div style="position:absolute;bottom:-3rem;right:-3rem;width:16rem;height:16rem;border-radius:50%;background:${tokens.accent}12;pointer-events:none;animation:float 10s ease-in-out infinite;"></div>
      <div style="position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:3rem;flex-wrap:wrap;">
        <div style="flex:1;min-width:260px;">
          <h2 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(1.75rem,4vw,3rem);font-weight:700;line-height:1.1;letter-spacing:-0.03em;color:${tokens.text};margin-bottom:1rem;">${copy.cta}</h2>
          <p style="font-size:0.9rem;color:${tokens.muted};line-height:1.8;max-width:44ch;">${copy.tagline}</p>
        </div>
        <a href="#contact" style="display:inline-flex;align-items:center;padding:1rem 2.5rem;background:${tokens.accent};color:#fff;font-weight:600;font-size:0.875rem;border-radius:${r};text-decoration:none;flex-shrink:0;transition:transform 0.3s cubic-bezier(.16,1,.3,1);" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform=''">${copy.cta}</a>
      </div>
    `, { padding: 'clamp(3rem,6vw,5rem)', radius: RADIUS_MAP['lg'] }), 'scaleIn', 0)}
  </div>
</section>`;
  }

  // ── TECH / MAXIMALIST / CINEMATIC — side-by-side with glowing panel ──────
  if (layout === 'tech' || layout === 'maximalist' || layout === 'cinematic') {
    const bg = isAccent ? tokens.accent : tokens.surface;
    const textColor = isAccent ? '#fff' : tokens.text;
    const mutedColor = isAccent ? 'rgba(255,255,255,0.75)' : tokens.muted;
    const btnBg = isAccent ? '#fff' : tokens.accent;
    const btnColor = isAccent ? tokens.accent : '#fff';
    return `
<section style="padding:${sp.section};background:${bg};position:relative;overflow:hidden;">
  ${isAccent ? `<div style="position:absolute;inset:0;background:radial-gradient(ellipse 60% 70% at 70% 50%,rgba(255,255,255,0.12) 0%,transparent 70%);pointer-events:none;"></div>` : `<div style="position:absolute;inset:0;background:radial-gradient(ellipse 50% 60% at 50% 50%,${tokens.accent}12 0%,transparent 70%);pointer-events:none;"></div>`}
  ${tokens.accentGlow && !isAccent ? `<div style="position:absolute;bottom:-5rem;right:5rem;width:20rem;height:20rem;border-radius:50%;background:${tokens.accent}18;filter:blur(60px);pointer-events:none;animation:pulseGlow 6s ease-in-out infinite;"></div>` : ''}
  <div style="max-width:1100px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:3rem;flex-wrap:wrap;position:relative;z-index:1;">
    <div style="flex:1;min-width:280px;">
      ${reveal(`<h2 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(2rem,5vw,3.5rem);font-weight:700;line-height:1.05;letter-spacing:-0.04em;margin-bottom:1rem;">${isAccent ? `<span style="color:#fff;">${copy.cta}</span>` : gradientText(tokens, copy.cta, 'span')}</h2>`, 'fadeLeft', 0)}
      ${reveal(`<p style="font-size:1rem;color:${mutedColor};line-height:1.75;max-width:44ch;">${copy.tagline}</p>`, 'fadeUp', 100)}
    </div>
    ${reveal(`<a href="#contact" style="display:inline-flex;align-items:center;padding:1rem 2.5rem;background:${btnBg};color:${btnColor};font-weight:600;font-size:0.9rem;border-radius:${r};text-decoration:none;transition:transform 0.3s cubic-bezier(.16,1,.3,1),box-shadow 0.3s;" onmouseover="this.style.transform='translateY(-2px) scale(1.02)';this.style.boxShadow='0 12px 32px rgba(0,0,0,0.2)'" onmouseout="this.style.transform='';this.style.boxShadow=''">${copy.cta}</a>`, 'scaleIn', 200)}
  </div>
</section>`;
  }

  // fallback
  return `
<section style="padding:${sp.section};background:${tokens.surface};position:relative;overflow:hidden;">
  <div style="max-width:1100px;margin:0 auto;text-align:center;">
    ${reveal(`<h2 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(2rem,5vw,3.5rem);font-weight:700;color:${tokens.text};margin-bottom:1rem;">${copy.cta}</h2>`, 'fadeUp', 0)}
    ${reveal(`<p style="font-size:1rem;color:${tokens.muted};margin-bottom:2rem;">${copy.tagline}</p>`, 'fadeUp', 100)}
    ${reveal(`<a href="#contact" style="display:inline-flex;align-items:center;padding:1rem 2.5rem;background:${tokens.accent};color:#fff;font-weight:600;border-radius:${r};text-decoration:none;">${copy.cta}</a>`, 'scaleIn', 200)}
  </div>
</section>`;
}
