import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { btn, sectionLabel, RADIUS_MAP, t, pickVariant, gradientText, reveal, glassCard } from './utils.js';

export function renderHeroSplit(
  brand: BrandCard,
  tokens: DesignTokens,
  data: { heroImageUrl?: string; heroVideoUrl?: string; personality?: string } = {},
): string {
  const { copy } = brand;
  const r = RADIUS_MAP[tokens.radius];
  const heightStyle = tokens.heroHeight === 'full' ? 'min-height:100dvh' : 'min-height:80dvh';
  const layout = data.personality ? pickVariant(data.personality) : 'cinematic';

  const mediaSide = data.heroVideoUrl
    ? `<video src="${data.heroVideoUrl}" autoplay muted loop playsinline style="width:100%;height:100%;object-fit:cover;border-radius:${r};"></video>`
    : data.heroImageUrl
    ? `<img src="${data.heroImageUrl}" alt="${brand.name}" style="width:100%;height:100%;object-fit:cover;border-radius:${r};" class="hover-scale">`
    : `<div style="width:100%;height:100%;min-height:500px;background:radial-gradient(ellipse 80% 80% at 50% 50%, ${tokens.accent}30 0%, ${tokens.bg} 80%);border-radius:${r};display:flex;align-items:center;justify-content:center;"><span style="font-family:'${tokens.displayFont}',serif;font-size:clamp(4rem,8vw,9rem);font-weight:700;color:${tokens.accent}18;letter-spacing:-0.05em;">${brand.name.slice(0, 2).toUpperCase()}</span></div>`;

  // ── BRUTALIST — stark split, heavy borders ───────────────────────────────
  if (layout === 'brutalist' || layout === 'tech') {
    return `
<section id="hero" style="${heightStyle};display:grid;grid-template-columns:1fr 1fr;align-items:stretch;overflow:hidden;background:${tokens.bg};position:relative;border-bottom:4px solid ${tokens.accent};">
  <div style="padding:clamp(3rem,8vw,7rem) clamp(2rem,5vw,4rem);display:flex;flex-direction:column;justify-content:flex-end;position:relative;z-index:1;">
    ${layout === 'tech' ? `<div style="position:absolute;inset:0;background-image:linear-gradient(${tokens.muted}06 1px,transparent 1px),linear-gradient(90deg,${tokens.muted}06 1px,transparent 1px);background-size:50px 50px;pointer-events:none;"></div>` : ''}
    <div style="position:relative;z-index:1;">
      ${reveal(`<span style="font-size:0.7rem;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:${tokens.accent};border-bottom:2px solid ${tokens.accent};padding-bottom:0.5rem;display:inline-block;margin-bottom:2rem;">${brand.industry}</span>`, 'fadeLeft', 0)}
      ${reveal(`<h1 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(2.5rem,6vw,5.5rem);font-weight:900;line-height:0.92;letter-spacing:-0.04em;margin-bottom:1.5rem;color:${tokens.text};text-transform:uppercase;">${copy.headline}</h1>`, 'fadeUp', 100)}
      ${reveal(`<p style="font-size:1rem;color:${tokens.muted};margin-bottom:2.5rem;max-width:40ch;line-height:1.7;">${copy.tagline}</p>`, 'fadeUp', 200)}
      ${reveal(`<div style="display:flex;gap:1rem;flex-wrap:wrap;">${btn(tokens, 'primary', copy.cta)}${btn(tokens, 'ghost', t('hero.explore', brand.language), '#services')}</div>`, 'fadeUp', 300)}
    </div>
  </div>
  <div style="height:100%;overflow:hidden;border-left:2px solid ${tokens.accent}30;">
    ${mediaSide}
  </div>
</section>`;
  }

  // ── EDITORIAL / DECO — elegant, italic accent, thin rules ────────────────
  if (layout === 'editorial' || layout === 'deco') {
    const words = copy.headline.split(' ');
    const half = Math.ceil(words.length / 2);
    return `
<section id="hero" style="${heightStyle};display:grid;grid-template-columns:1.1fr 1fr;align-items:center;overflow:hidden;background:${tokens.bg};position:relative;">
  <div style="position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,${tokens.accent}50,transparent 60%);"></div>
  <div style="padding:clamp(3rem,8vw,7rem) clamp(2rem,5vw,5rem);position:relative;z-index:1;">
    ${reveal(sectionLabel(tokens, brand.industry), 'fadeUp', 0)}
    ${reveal(`<h1 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(2.5rem,6vw,6rem);font-weight:700;line-height:0.95;letter-spacing:-0.04em;margin-bottom:1.75rem;color:${tokens.text};">
      <span style="display:block;">${words.slice(0, half).join(' ')}</span>
      <span style="display:block;">${gradientText(tokens, words.slice(half).join(' ') || '.', 'span', 'font-style:italic;')}</span>
    </h1>`, 'fadeUp', 100)}
    ${reveal(`<p style="font-size:1rem;color:${tokens.muted};margin-bottom:2.5rem;max-width:40ch;line-height:1.85;font-style:italic;">${copy.tagline}</p>`, 'fadeUp', 200)}
    ${reveal(`<div style="display:flex;gap:1rem;flex-wrap:wrap;">${btn(tokens, 'primary', copy.cta)}${btn(tokens, 'ghost', t('hero.learn_more', brand.language), '#services')}</div>`, 'fadeUp', 300)}
  </div>
  <div style="height:100%;min-height:500px;overflow:hidden;padding:2.5rem;">
    <div style="height:100%;border-radius:${r};overflow:hidden;position:relative;">
      ${mediaSide}
      <div style="position:absolute;inset:0;background:linear-gradient(to top,${tokens.bg}40,transparent 40%);pointer-events:none;"></div>
    </div>
  </div>
</section>`;
  }

  // ── MINIMAL — super clean, lots of whitespace ────────────────────────────
  if (layout === 'minimal') {
    return `
<section id="hero" style="${heightStyle};display:grid;grid-template-columns:1fr 1fr;align-items:center;overflow:hidden;background:${tokens.bg};position:relative;">
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse 40% 50% at 25% 50%,${tokens.accent}08,transparent);pointer-events:none;"></div>
  <div style="padding:clamp(4rem,10vw,8rem) clamp(2rem,5vw,5rem);position:relative;z-index:1;">
    ${reveal(`<div style="display:flex;align-items:center;gap:1rem;margin-bottom:3rem;">
      <div style="width:2rem;height:1px;background:${tokens.accent};"></div>
      <span style="font-size:0.68rem;font-weight:500;letter-spacing:0.18em;text-transform:uppercase;color:${tokens.accent};">${brand.industry}</span>
    </div>`, 'fadeUp', 0)}
    ${reveal(`<h1 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(2.5rem,6vw,5.5rem);font-weight:300;line-height:1;letter-spacing:-0.04em;margin-bottom:1.75rem;color:${tokens.text};">${copy.headline}</h1>`, 'fadeUp', 100)}
    ${reveal(`<p style="font-size:1rem;color:${tokens.muted};margin-bottom:3rem;max-width:38ch;line-height:1.9;">${copy.tagline}</p>`, 'fadeUp', 200)}
    ${reveal(`<div style="display:flex;gap:1rem;">${btn(tokens, 'primary', copy.cta)}</div>`, 'fadeUp', 300)}
  </div>
  <div style="height:100%;min-height:500px;overflow:hidden;padding:3rem;">
    <div style="height:100%;border-radius:${r};overflow:hidden;">
      ${mediaSide}
    </div>
  </div>
</section>`;
  }

  // ── ORGANIC — warm, rounded, glass overlay card ──────────────────────────
  if (layout === 'organic') {
    return `
<section id="hero" style="${heightStyle};display:grid;grid-template-columns:1fr 1.1fr;align-items:center;overflow:hidden;background:${tokens.bg};position:relative;">
  <div style="position:absolute;bottom:10%;left:5%;width:250px;height:250px;border-radius:50%;background:${tokens.accent}10;filter:blur(80px);animation:float 10s ease-in-out infinite;pointer-events:none;"></div>
  <div style="padding:clamp(3rem,8vw,7rem) clamp(2rem,5vw,5rem);position:relative;z-index:1;">
    ${reveal(sectionLabel(tokens, brand.industry), 'fadeUp', 0)}
    ${reveal(`<h1 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(2.5rem,6vw,5.5rem);font-weight:700;line-height:1.02;letter-spacing:-0.03em;margin-bottom:1.5rem;color:${tokens.text};">${copy.headline}</h1>`, 'fadeUp', 100)}
    ${reveal(`<p style="font-size:1.05rem;color:${tokens.muted};margin-bottom:2.5rem;max-width:42ch;line-height:1.85;">${copy.tagline}</p>`, 'fadeUp', 200)}
    ${reveal(`<div style="display:flex;gap:1rem;flex-wrap:wrap;">${btn(tokens, 'primary', copy.cta)}${btn(tokens, 'ghost', t('hero.learn_more', brand.language), '#services')}</div>`, 'fadeUp', 300)}
  </div>
  <div style="height:100%;min-height:500px;overflow:hidden;padding:2rem 2rem 2rem 0;position:relative;">
    <div style="height:100%;border-radius:${RADIUS_MAP['lg']};overflow:hidden;position:relative;">
      ${mediaSide}
      <div style="position:absolute;bottom:2rem;left:2rem;right:2rem;z-index:2;">
        ${glassCard(tokens, `<div style="font-family:'${tokens.displayFont}',serif;font-size:1.1rem;font-weight:600;color:${tokens.text};">${brand.name}</div><div style="font-size:0.75rem;color:${tokens.muted};margin-top:0.25rem;">${copy.tagline.slice(0, 60)}...</div>`, { padding: '1.25rem 1.5rem', blur: 16 })}
      </div>
    </div>
  </div>
</section>`;
  }

  // ── DEFAULT (cinematic) — classic split with reveal ──────────────────────
  return `
<section id="hero" style="${heightStyle};display:grid;grid-template-columns:1fr 1fr;align-items:center;overflow:hidden;background:${tokens.bg};position:relative;">
  <div style="padding:clamp(3rem,8vw,7rem) clamp(2rem,5vw,5rem);position:relative;z-index:1;">
    ${reveal(sectionLabel(tokens, brand.industry), 'fadeUp', 0)}
    ${reveal(`<h1 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(2.5rem,6vw,6rem);font-weight:700;line-height:1;letter-spacing:-0.04em;margin-bottom:1.5rem;color:${tokens.text};">${copy.headline}</h1>`, 'fadeUp', 100)}
    ${reveal(`<p style="font-size:1.05rem;color:${tokens.muted};margin-bottom:2.5rem;max-width:42ch;line-height:1.8;">${copy.tagline}</p>`, 'fadeUp', 200)}
    ${reveal(`<div style="display:flex;gap:1rem;flex-wrap:wrap;">
      ${btn(tokens, 'primary', copy.cta)}
      ${btn(tokens, 'ghost', t('hero.learn_more', brand.language), '#services')}
    </div>`, 'fadeUp', 300)}
  </div>
  <div style="height:100%;min-height:500px;overflow:hidden;padding:2rem 2rem 2rem 0;">
    ${mediaSide}
  </div>
  <div style="position:absolute;inset:0;background-image:radial-gradient(${tokens.muted}10 1px,transparent 1px);background-size:32px 32px;pointer-events:none;z-index:0;"></div>
</section>`;
}
