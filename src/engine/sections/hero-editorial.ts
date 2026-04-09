import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { btn, sectionLabel, RADIUS_MAP, t, pickVariant, gradientText, reveal, decorativeLine } from './utils.js';

export function renderHeroEditorial(
  brand: BrandCard,
  tokens: DesignTokens,
  data: { heroImageUrl?: string; personality?: string } & Record<string, any> = {},
): string {
  const { copy } = brand;
  const r = RADIUS_MAP[tokens.radius];
  const layout = data.personality ? pickVariant(data.personality) : 'editorial';
  const words = copy.headline.split(' ');
  const half = Math.ceil(words.length / 2);
  const line1 = words.slice(0, half).join(' ');
  const line2 = words.slice(half).join(' ');

  // ── BRUTALIST — uppercase, ultra-heavy, raw ───────────────────────────────
  if (layout === 'brutalist' || layout === 'tech') {
    return `
<section id="hero" style="min-height:100dvh;display:flex;flex-direction:column;justify-content:flex-end;padding:0 clamp(2rem,5vw,5rem) clamp(4rem,8dvh,6rem);position:relative;overflow:hidden;background:${tokens.bg};">
  <div style="position:absolute;top:0;left:0;right:0;height:6px;background:${tokens.accent};"></div>
  <div style="position:absolute;top:1.5rem;left:clamp(2rem,5vw,5rem);right:clamp(2rem,5vw,5rem);display:flex;align-items:center;justify-content:space-between;">
    <span style="font-family:'${tokens.displayFont}',serif;font-weight:900;font-size:1rem;letter-spacing:-0.03em;color:${tokens.text};">${brand.name}</span>
    <span style="font-size:0.65rem;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:${tokens.muted};">${brand.industry}</span>
  </div>
  ${data.heroImageUrl ? `<img src="${data.heroImageUrl}" alt="${brand.name}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;mix-blend-mode:overlay;opacity:0.2;z-index:0;">` : ''}
  <div style="position:absolute;top:0;right:0;bottom:0;width:2px;background:${tokens.accent}30;"></div>
  <div style="position:relative;z-index:1;">
    ${reveal(`<h1 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(4.5rem,14vw,13rem);font-weight:900;line-height:0.85;letter-spacing:-0.05em;color:${tokens.text};text-transform:uppercase;margin-bottom:2.5rem;">
      <span style="display:block;">${line1}</span>
      <span style="display:block;-webkit-text-stroke:2px ${tokens.accent};color:transparent;">${line2 || brand.name}</span>
    </h1>`, 'fadeUp', 0)}
    ${reveal(`<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:2rem;padding-top:1.5rem;border-top:2px solid ${tokens.muted}25;">
      <p style="font-size:0.95rem;color:${tokens.muted};max-width:40ch;line-height:1.75;">${copy.tagline}</p>
      <div style="display:flex;gap:1rem;">${btn(tokens, 'primary', copy.cta)}</div>
    </div>`, 'fadeUp', 200)}
  </div>
</section>`;
  }

  // ── ORGANIC / MAXIMALIST — layered, expressive ────────────────────────────
  if (layout === 'organic' || layout === 'maximalist') {
    return `
<section id="hero" style="min-height:100dvh;display:flex;align-items:center;padding:0 clamp(2rem,5vw,5rem);position:relative;overflow:hidden;background:${tokens.bg};">
  ${data.heroImageUrl ? `<div style="position:absolute;top:0;right:0;width:50%;height:100%;overflow:hidden;z-index:0;"><img src="${data.heroImageUrl}" alt="${brand.name}" style="width:100%;height:100%;object-fit:cover;" class="hover-scale"></div><div style="position:absolute;top:0;right:50%;width:30%;height:100%;background:linear-gradient(to right,${tokens.bg},transparent);z-index:1;pointer-events:none;"></div>` : `<div style="position:absolute;top:-10%;right:-10%;width:60%;height:120%;border-radius:50%;background:radial-gradient(ellipse,${tokens.accent}20 0%,transparent 65%);pointer-events:none;z-index:0;"></div>`}
  <div style="position:absolute;bottom:15%;left:10%;width:200px;height:200px;border-radius:50%;border:1px solid ${tokens.accent}12;animation:float 12s ease-in-out infinite;pointer-events:none;"></div>
  <div style="position:relative;z-index:2;max-width:700px;">
    ${reveal(sectionLabel(tokens, brand.industry), 'fadeLeft', 0)}
    ${reveal(`<h1 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(3rem,8vw,7rem);font-weight:700;line-height:0.95;letter-spacing:-0.04em;color:${tokens.text};margin-bottom:1.75rem;">
      <span style="display:block;">${line1}</span>
      <span style="display:block;">${gradientText(tokens, line2 || '.', 'span', 'font-style:italic;')}</span>
    </h1>`, 'fadeUp', 100)}
    ${reveal(`<p style="font-size:1.05rem;color:${tokens.muted};max-width:44ch;line-height:1.85;margin-bottom:2.5rem;">${copy.tagline}</p>`, 'fadeUp', 200)}
    ${reveal(`<div style="display:flex;gap:1rem;flex-wrap:wrap;">${btn(tokens, 'primary', copy.cta)}${btn(tokens, 'ghost', t('hero.explore', brand.language), '#services')}</div>`, 'fadeUp', 300)}
  </div>
</section>`;
  }

  // ── MINIMAL / DECO — pure typography, no chrome ──────────────────────────
  if (layout === 'minimal' || layout === 'deco') {
    return `
<section id="hero" style="min-height:100dvh;display:flex;flex-direction:column;justify-content:center;padding:clamp(5rem,12vw,10rem) clamp(2rem,5vw,5rem);position:relative;overflow:hidden;background:${tokens.bg};">
  <div style="max-width:1100px;margin:0 auto;width:100%;">
    ${reveal(`<div style="display:flex;align-items:center;gap:1.5rem;margin-bottom:3rem;">
      <div style="width:2rem;height:1px;background:${tokens.accent};"></div>
      <span style="font-size:0.7rem;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:${tokens.accent};">${brand.industry}</span>
    </div>`, 'fadeUp', 0)}
    ${reveal(`<h1 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(4rem,11vw,9.5rem);font-weight:700;line-height:0.9;letter-spacing:-0.05em;color:${tokens.text};margin-bottom:3.5rem;">
      <span style="display:block;">${line1}</span>
      <span style="display:block;font-weight:300;font-style:italic;color:${tokens.muted};">${line2 || ''}</span>
    </h1>`, 'fadeUp', 150)}
    ${reveal(`<div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:3rem;padding-top:2.5rem;border-top:1px solid ${tokens.muted}20;">
      <p style="font-size:1rem;color:${tokens.muted};max-width:40ch;line-height:1.85;">${copy.tagline}</p>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:1rem;">
        ${btn(tokens, 'primary', copy.cta)}
        ${(copy.services ?? []).slice(0, 3).map(s => `<span style="font-size:0.72rem;color:${tokens.muted};letter-spacing:0.06em;text-transform:uppercase;">${s}</span>`).join('')}
      </div>
    </div>`, 'fadeUp', 300)}
  </div>
</section>`;
  }

  // ── DEFAULT: editorial (luxury/cinematic) ─────────────────────────────────
  return `
<section id="hero" style="min-height:100dvh;display:flex;flex-direction:column;justify-content:flex-end;padding:0 clamp(2rem,5vw,5rem) clamp(4rem,10dvh,7rem);position:relative;overflow:hidden;background:${tokens.bg};">
  <div style="position:absolute;top:50%;right:3rem;transform:translateY(-60%);font-family:'${tokens.displayFont}',serif;font-size:clamp(12rem,28vw,26rem);font-weight:700;line-height:1;color:${tokens.accent}06;letter-spacing:-0.06em;pointer-events:none;user-select:none;">${new Date().getFullYear()}</div>
  ${data.heroImageUrl ? `<div style="position:absolute;top:0;right:0;width:42%;height:100%;overflow:hidden;z-index:0;"><img src="${data.heroImageUrl}" alt="${brand.name}" style="width:100%;height:100%;object-fit:cover;opacity:0.4;" class="hover-scale"><div style="position:absolute;inset:0;background:linear-gradient(to right,${tokens.bg} 0%,transparent 50%);"></div></div>` : ''}
  <div style="position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,${tokens.muted}30,transparent);"></div>
  <div style="position:relative;z-index:1;max-width:1200px;margin:0 auto;width:100%;">
    ${reveal(`<div style="display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:3rem;margin-bottom:2rem;">
      ${sectionLabel(tokens, brand.industry)}
      <p style="font-size:0.95rem;color:${tokens.muted};max-width:32ch;line-height:1.75;text-align:right;">${copy.tagline}</p>
    </div>`, 'fadeUp', 0)}
    ${reveal(`<h1 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(4rem,11vw,10rem);font-weight:700;line-height:0.92;letter-spacing:-0.05em;color:${tokens.text};margin-bottom:3rem;">
      <span style="display:block;">${line1}</span>
      <span style="display:block;">${gradientText(tokens, line2, 'span', '')}</span>
    </h1>`, 'fadeUp', 150)}
    ${reveal(`<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:2rem;padding-top:2rem;border-top:1px solid ${tokens.muted}20;">
      <div style="display:flex;gap:1rem;">${btn(tokens, 'primary', copy.cta)}</div>
      <div style="display:flex;gap:3rem;">
        ${[['hero.nav_services', 'services'], ['hero.nav_portfolio', 'portfolio'], ['hero.nav_contact', 'contact']].map(([key, anchor]) => `<a href="#${anchor}" style="font-size:0.8rem;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;color:${tokens.muted};text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='${tokens.text}'" onmouseout="this.style.color='${tokens.muted}'">${t(key, brand.language)}</a>`).join('')}
      </div>
    </div>`, 'fadeUp', 300)}
  </div>
</section>`;
}
