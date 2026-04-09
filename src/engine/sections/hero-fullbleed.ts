import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { btn, sectionLabel, RADIUS_MAP, t, pickVariant, gradientText, reveal, decorativeLine } from './utils.js';

export function renderHeroFullbleed(
  brand: BrandCard,
  tokens: DesignTokens,
  data: { heroImageUrl?: string; heroVideoUrl?: string; personality?: string } = {},
): string {
  const { copy } = brand;
  const variant = data.personality ? pickVariant(data.personality) : 'cinematic';
  const r = RADIUS_MAP[tokens.radius];

  const heightStyle = tokens.heroHeight === 'full' ? 'min-height:100dvh'
    : tokens.heroHeight === 'large' ? 'min-height:80dvh'
    : 'min-height:60dvh';

  const mediaEl = data.heroVideoUrl
    ? `<video src="${data.heroVideoUrl}" autoplay muted loop playsinline style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;"></video>`
    : data.heroImageUrl
    ? `<img src="${data.heroImageUrl}" alt="${brand.name}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;" class="hover-scale">`
    : '';

  const glowStyle = tokens.accentGlow ? `box-shadow:0 0 120px ${tokens.accent}30;` : '';

  // ── Variant: CINEMATIC — image/video full bg, content bottom-left ──────────
  if (variant === 'cinematic' || variant === 'maximalist') {
    const hasBgMedia = !!data.heroImageUrl || !!data.heroVideoUrl;
    const fallbackBg = !hasBgMedia
      ? `<div style="position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 30% 60%, ${tokens.accent}35 0%, ${tokens.bg} 65%);z-index:0;"></div>
         <div style="position:absolute;top:20%;right:10%;width:300px;height:300px;border-radius:50%;background:${tokens.accent}08;filter:blur(80px);animation:float 8s ease-in-out infinite;pointer-events:none;z-index:0;"></div>`
      : '';
    return `
<section id="hero" style="${heightStyle};display:flex;align-items:flex-end;position:relative;overflow:hidden;${glowStyle}background:${tokens.bg};">
  ${mediaEl}
  ${fallbackBg}
  <div style="position:absolute;inset:0;background:linear-gradient(to top, ${tokens.bg} 0%, ${tokens.bg}cc 25%, ${tokens.bg}55 55%, transparent 100%);z-index:1;pointer-events:none;"></div>
  <div style="position:relative;z-index:2;max-width:1200px;margin:0 auto;padding:0 2.5rem clamp(4rem,10dvh,8rem);width:100%;">
    ${reveal(sectionLabel(tokens, brand.industry), 'fadeUp', 0)}
    ${reveal(`<h1 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(3.5rem,10vw,9rem);font-weight:700;line-height:0.92;letter-spacing:-0.05em;max-width:12ch;margin-bottom:1.75rem;">
      ${gradientText(tokens, copy.headline, 'span', 'color:' + tokens.text)}
    </h1>`, 'fadeUp', 150)}
    ${reveal(`<div style="display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:2rem;">
      <div>
        <p style="font-size:clamp(0.95rem,2vw,1.15rem);color:${tokens.muted};margin-bottom:2rem;max-width:44ch;line-height:1.8;">${copy.tagline}</p>
        <div style="display:flex;gap:1rem;flex-wrap:wrap;">
          ${btn(tokens, 'primary', copy.cta)}
          ${btn(tokens, 'ghost', t('hero.explore', brand.language), '#services')}
        </div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem;padding-bottom:0.5rem;">
        <div style="width:1px;height:3rem;background:linear-gradient(to bottom, transparent, ${tokens.muted}60);"></div>
        <span style="font-size:0.65rem;letter-spacing:0.15em;text-transform:uppercase;color:${tokens.muted};writing-mode:vertical-lr;">${t('hero.scroll', brand.language)}</span>
      </div>
    </div>`, 'fadeUp', 300)}
  </div>
</section>`;
  }

  // ── Variant: EDITORIAL — huge type, minimal media, horizontal rule ─────────
  if (variant === 'editorial' || variant === 'deco') {
    const words = copy.headline.split(' ');
    const half = Math.ceil(words.length / 2);
    const line1 = words.slice(0, half).join(' ');
    const line2 = words.slice(half).join(' ');
    return `
<section id="hero" style="${heightStyle};display:flex;flex-direction:column;justify-content:flex-end;padding:0 clamp(2rem,5vw,5rem) clamp(4rem,8dvh,7rem);position:relative;overflow:hidden;background:${tokens.bg};">
  ${data.heroImageUrl ? `<div style="position:absolute;top:0;right:0;width:38%;height:100%;overflow:hidden;z-index:0;"><img src="${data.heroImageUrl}" alt="${brand.name}" style="width:100%;height:100%;object-fit:cover;opacity:0.35;" class="hover-scale"></div>` : `<div style="position:absolute;top:-2rem;right:-4rem;width:55%;height:120%;background:radial-gradient(ellipse 70% 80% at 60% 40%, ${tokens.accent}20 0%, transparent 70%);pointer-events:none;z-index:0;"></div>`}
  <div style="position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,${tokens.accent}60,transparent);"></div>
  <div style="position:relative;z-index:1;max-width:1300px;margin:0 auto;width:100%;">
    ${reveal(`<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:3rem;flex-wrap:wrap;gap:1rem;">
      ${sectionLabel(tokens, brand.industry)}
      <p style="font-size:0.85rem;color:${tokens.muted};max-width:30ch;line-height:1.7;text-align:right;">${copy.tagline}</p>
    </div>`, 'fadeUp', 0)}
    ${reveal(`<h1 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(4rem,12vw,11rem);font-weight:700;line-height:0.9;letter-spacing:-0.05em;color:${tokens.text};margin-bottom:3rem;">
      <span style="display:block;">${line1}</span>
      <span style="display:block;">${gradientText(tokens, line2 || '.', 'span', 'font-style:italic;')}</span>
    </h1>`, 'fadeUp', 150)}
    ${reveal(`<div style="padding-top:2rem;border-top:1px solid ${tokens.muted}20;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:2rem;">
      <div style="display:flex;gap:1rem;">${btn(tokens, 'primary', copy.cta)}</div>
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
        ${(copy.services ?? []).slice(0, 3).map(s => `<span class="hover-glow" style="padding:0.4rem 1rem;border:1px solid ${tokens.muted}30;border-radius:${r};font-size:0.75rem;color:${tokens.muted};letter-spacing:0.04em;backdrop-filter:blur(8px);background:${tokens.surface}80;">${s}</span>`).join('')}
      </div>
    </div>`, 'fadeUp', 300)}
  </div>
  ${decorativeLine(tokens, 'wave')}
</section>`;
  }

  // ── Variant: BRUTALIST — raw grid, oversized number, stark ────────────────
  if (variant === 'brutalist') {
    return `
<section id="hero" style="${heightStyle};display:grid;grid-template-columns:1fr;position:relative;overflow:hidden;background:${tokens.bg};border-bottom:4px solid ${tokens.accent};">
  ${data.heroImageUrl ? `<img src="${data.heroImageUrl}" alt="${brand.name}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;mix-blend-mode:overlay;opacity:0.25;z-index:0;">` : ''}
  <div style="position:absolute;top:0;right:0;font-family:'${tokens.displayFont}',serif;font-size:clamp(15rem,35vw,30rem);font-weight:900;line-height:0.85;color:${tokens.accent}12;pointer-events:none;user-select:none;z-index:0;letter-spacing:-0.08em;">01</div>
  <div style="position:relative;z-index:1;display:flex;flex-direction:column;justify-content:flex-end;padding:clamp(2rem,4vw,4rem);${heightStyle};">
    ${reveal(`<div style="border-top:2px solid ${tokens.text}30;padding-top:1.5rem;margin-bottom:2rem;">
      <span style="font-size:0.7rem;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:${tokens.accent};">${brand.industry}</span>
    </div>`, 'fadeLeft', 0)}
    ${reveal(`<h1 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(3.5rem,10vw,8rem);font-weight:900;line-height:0.88;letter-spacing:-0.04em;color:${tokens.text};margin-bottom:2.5rem;text-transform:uppercase;max-width:16ch;-webkit-text-stroke:1px ${tokens.accent}25;">${copy.headline}</h1>`, 'fadeUp', 100)}
    ${reveal(`<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:2rem;padding-top:2rem;border-top:2px solid ${tokens.muted}20;">
      <p style="font-size:1rem;color:${tokens.muted};max-width:40ch;line-height:1.7;">${copy.tagline}</p>
      <div style="display:flex;gap:1rem;flex-wrap:wrap;">${btn(tokens, 'primary', copy.cta)}${btn(tokens, 'ghost', t('hero.explore', brand.language), '#services')}</div>
    </div>`, 'fadeUp', 250)}
  </div>
</section>`;
  }

  // ── Variant: TECH/MINIMAL — centered, clean, grid overlay ─────────────────
  if (variant === 'tech' || variant === 'minimal') {
    const hasBg = !!data.heroImageUrl || !!data.heroVideoUrl;
    return `
<section id="hero" style="${heightStyle};display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;background:${tokens.bg};">
  ${hasBg ? mediaEl : ''}
  ${hasBg ? `<div style="position:absolute;inset:0;background:${tokens.bg}bb;z-index:1;pointer-events:none;"></div>` : ''}
  ${!hasBg && variant === 'tech' ? `<div style="position:absolute;inset:0;background-image:linear-gradient(${tokens.muted}08 1px,transparent 1px),linear-gradient(90deg,${tokens.muted}08 1px,transparent 1px);background-size:60px 60px;pointer-events:none;z-index:0;"></div>` : ''}
  ${!hasBg && variant === 'minimal' ? `<div style="position:absolute;inset:0;background:radial-gradient(ellipse 60% 60% at 50% 40%, ${tokens.accent}15 0%, transparent 70%);z-index:0;pointer-events:none;"></div>` : ''}
  <div style="position:absolute;top:15%;left:50%;transform:translateX(-50%);width:400px;height:400px;border-radius:50%;background:${tokens.accent}06;filter:blur(100px);animation:pulseGlow 6s ease-in-out infinite;pointer-events:none;z-index:0;"></div>
  <div style="position:relative;z-index:2;text-align:center;max-width:900px;padding:clamp(3rem,8vw,6rem) 2.5rem;">
    ${reveal(sectionLabel(tokens, brand.industry), 'scaleIn', 0)}
    ${reveal(`<h1 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(3rem,9vw,7.5rem);font-weight:700;line-height:0.94;letter-spacing:-0.05em;color:${tokens.text};margin:0 auto 1.5rem;max-width:14ch;">${copy.headline}</h1>`, 'fadeUp', 150)}
    ${reveal(`<p style="font-size:clamp(1rem,2vw,1.2rem);color:${tokens.muted};margin-bottom:2.5rem;max-width:50ch;line-height:1.8;margin-left:auto;margin-right:auto;">${copy.tagline}</p>`, 'fadeUp', 250)}
    ${reveal(`<div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">
      ${btn(tokens, 'primary', copy.cta)}
      ${btn(tokens, 'ghost', t('hero.explore', brand.language), '#services')}
    </div>`, 'fadeUp', 350)}
    ${variant === 'tech' ? reveal(`<div style="margin-top:4rem;display:flex;align-items:center;justify-content:center;gap:2rem;flex-wrap:wrap;">
      ${(copy.services ?? []).slice(0, 4).map(s => `<span class="hover-glow" style="padding:0.35rem 1rem;border:1px solid ${tokens.muted}20;border-radius:${r};font-size:0.75rem;color:${tokens.muted};letter-spacing:0.08em;text-transform:uppercase;backdrop-filter:blur(8px);background:${tokens.surface}60;display:flex;align-items:center;gap:0.5rem;"><span style="width:0.35rem;height:0.35rem;border-radius:50%;background:${tokens.accent};display:inline-block;"></span>${s}</span>`).join('')}
    </div>`, 'fadeUp', 450) : ''}
  </div>
</section>`;
  }

  // ── Variant: ORGANIC — asymmetric, warm, off-center ───────────────────────
  return `
<section id="hero" style="${heightStyle};display:grid;grid-template-columns:1.4fr 1fr;align-items:center;position:relative;overflow:hidden;background:${tokens.bg};">
  ${data.heroImageUrl ? `<div style="position:absolute;right:0;top:0;width:45%;height:100%;overflow:hidden;z-index:0;"><img src="${data.heroImageUrl}" alt="${brand.name}" style="width:100%;height:100%;object-fit:cover;" class="hover-scale"></div><div style="position:absolute;right:45%;top:0;width:20%;height:100%;background:linear-gradient(to right, ${tokens.bg}, transparent);z-index:1;pointer-events:none;"></div>` : `<div style="position:absolute;inset:0;background:radial-gradient(ellipse 70% 80% at 70% 50%, ${tokens.accent}20 0%, transparent 65%);pointer-events:none;z-index:0;"></div>`}
  <div style="position:absolute;bottom:20%;right:15%;width:200px;height:200px;border-radius:50%;border:1px solid ${tokens.accent}15;animation:float 10s ease-in-out infinite;pointer-events:none;z-index:0;"></div>
  <div style="position:relative;z-index:2;padding:clamp(3rem,8vw,7rem) clamp(2rem,5vw,5rem);">
    ${reveal(sectionLabel(tokens, brand.industry), 'fadeLeft', 0)}
    ${reveal(`<h1 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(2.5rem,7vw,6.5rem);font-weight:700;line-height:1;letter-spacing:-0.04em;color:${tokens.text};margin-bottom:1.5rem;">${copy.headline}</h1>`, 'fadeUp', 100)}
    ${reveal(`<p style="font-size:1.05rem;color:${tokens.muted};margin-bottom:2.5rem;max-width:44ch;line-height:1.85;">${copy.tagline}</p>`, 'fadeUp', 200)}
    ${reveal(`<div style="display:flex;gap:1rem;flex-wrap:wrap;">${btn(tokens, 'primary', copy.cta)}${btn(tokens, 'ghost', t('hero.learn_more', brand.language), '#services')}</div>`, 'fadeUp', 300)}
  </div>
</section>`;
}
