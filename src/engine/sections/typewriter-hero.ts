import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { sectionLabel, t, pickVariant, reveal } from './utils.js';

/**
 * Typewriter Hero — hero with cycling typewriter effect on the headline.
 * Great for tech/agency brands that want to show multiple services/benefits.
 * Adapted from modules/typewriter.html.
 */
export function renderTypewriterHero(
  brand: BrandCard,
  tokens: DesignTokens,
  data: { heroImageUrl?: string; heroVideoUrl?: string; personality?: string } & Record<string, any> = {},
): string {
  const { copy } = brand;
  const layout = data.personality ? pickVariant(data.personality) : 'cinematic';
  const id = `tw${Math.random().toString(36).slice(2, 7)}`;

  // Cycling phrases from services or tagline variants
  const services = copy.services ?? [];
  const phrases = services.length >= 3
    ? services.slice(0, 4).map(s => `${copy.heroLine.split(' ').slice(0, 3).join(' ')} ${s}.`)
    : [copy.heroLine, copy.tagline, copy.description.split('.')[0] + '.'];

  const phrasesJson = JSON.stringify(phrases);

  // Media element — video takes priority over image (same pattern as hero-fullbleed)
  const hasMedia = !!(data.heroVideoUrl || data.heroImageUrl);
  const mediaEl = data.heroVideoUrl
    ? `<video src="${data.heroVideoUrl}" autoplay muted loop playsinline style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;"></video>`
    : data.heroImageUrl
    ? `<img src="${data.heroImageUrl}" alt="${brand.name}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;">`
    : '';

  const bgStyle = hasMedia ? '' : `background:${tokens.bg};`;
  const overlay = hasMedia
    ? `<div style="position:absolute;inset:0;background:linear-gradient(to bottom,${tokens.bg}bb 0%,${tokens.bg}66 40%,${tokens.bg}ee 100%);z-index:1;"></div>`
    : '';

  // ── TECH / BRUTALIST — monospace code block style ───────────────────────────
  if (layout === 'brutalist' || layout === 'tech') {
    return `
<section style="min-height:100dvh;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;${bgStyle}padding:clamp(5rem,10vw,9rem) clamp(1.5rem,4vw,3.5rem) clamp(4rem,8vw,7rem);">
  ${mediaEl}
  ${overlay}
  <div style="position:relative;z-index:2;max-width:900px;width:100%;text-align:left;">
    ${reveal(`<div style="font-family:monospace;font-size:0.85rem;color:${tokens.accent};letter-spacing:0.08em;margin-bottom:2rem;opacity:0.8;">$ ${brand.name.toLowerCase().replace(/\s+/g, '-')} --init</div>`, 'fadeUp', 0)}
    <div style="
      font-family:monospace;
      font-size:clamp(1.75rem,4vw,3.5rem);
      font-weight:700;
      color:${tokens.text};
      line-height:1.3;
      letter-spacing:-0.02em;
      margin-bottom:2.5rem;
      border-left:4px solid ${tokens.accent};
      padding-left:1.5rem;
    ">
      <span id="${id}-text"></span><span style="display:inline-block;width:3px;height:1.1em;background:${tokens.accent};margin-left:3px;vertical-align:text-bottom;animation:${id}blink 0.6s step-end infinite;"></span>
    </div>
    ${reveal(`<p style="font-size:1rem;color:${tokens.muted};line-height:1.7;max-width:52ch;margin-bottom:2.5rem;">${copy.description}</p>`, 'fadeUp', 100)}
    ${reveal(`<div style="display:flex;gap:1rem;flex-wrap:wrap;">
      <a href="#contact" style="display:inline-flex;align-items:center;padding:0.85rem 2.25rem;background:${tokens.accent};color:#fff;font-weight:700;font-size:0.85rem;text-decoration:none;text-transform:uppercase;letter-spacing:0.06em;border:2px solid ${tokens.accent};">${copy.cta}</a>
      <a href="#services" style="display:inline-flex;align-items:center;padding:0.85rem 2.25rem;background:transparent;color:${tokens.text};font-weight:700;font-size:0.85rem;text-decoration:none;text-transform:uppercase;letter-spacing:0.06em;border:2px solid ${tokens.muted}40;">${t('footer.services', brand.language)}</a>
    </div>`, 'fadeUp', 200)}
  </div>
</section>
${typewriterScript(id, phrasesJson, 'mono')}`;
  }

  // ── EDITORIAL / MINIMAL — serif, clean ────────────────────────────────────
  if (layout === 'editorial' || layout === 'minimal' || layout === 'deco') {
    return `
<section style="min-height:100dvh;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;${bgStyle}padding:clamp(5rem,10vw,9rem) clamp(1.5rem,4vw,3.5rem) clamp(4rem,8vw,7rem);text-align:center;">
  ${mediaEl}
  ${overlay}
  <div style="position:relative;z-index:2;max-width:800px;width:100%;">
    ${reveal(`${sectionLabel(tokens, brand.businessType ?? brand.name)}`, 'fadeUp', 0)}
    <div style="
      font-family:'${tokens.displayFont}',serif;
      font-size:clamp(2.5rem,6vw,5rem);
      font-weight:400;
      font-style:italic;
      color:${tokens.text};
      line-height:1.15;
      letter-spacing:-0.03em;
      margin:1.5rem 0 2.5rem;
    ">
      <span id="${id}-text"></span><span style="display:inline-block;width:2px;height:0.9em;background:${tokens.accent};margin-left:2px;vertical-align:text-bottom;animation:${id}blink 0.6s step-end infinite;opacity:0.7;"></span>
    </div>
    ${reveal(`<p style="font-size:1.05rem;color:${tokens.muted};line-height:1.7;max-width:48ch;margin:0 auto 3rem;">${copy.description}</p>`, 'fadeUp', 100)}
    ${reveal(`<a href="#contact" style="display:inline-flex;align-items:center;padding:0.9rem 2.5rem;border:1px solid ${tokens.text}40;color:${tokens.text};font-size:0.85rem;text-decoration:none;letter-spacing:0.08em;text-transform:uppercase;transition:all 0.3s;" onmouseover="this.style.background='${tokens.text}';this.style.color='${tokens.bg}'" onmouseout="this.style.background='transparent';this.style.color='${tokens.text}'">${copy.cta}</a>`, 'fadeUp', 200)}
  </div>
</section>
${typewriterScript(id, phrasesJson, 'serif')}`;
  }

  // ── CINEMATIC (default) — dark, glowing cursor, dramatic ─────────────────
  return `
<section style="min-height:100dvh;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;position:relative;${bgStyle}padding:clamp(5rem,10vw,9rem) clamp(1.5rem,4vw,3.5rem) clamp(4rem,8vw,7rem);overflow:hidden;">
  ${mediaEl}
  ${overlay}
  ${hasMedia ? '' : `<div style="position:absolute;inset:0;background:radial-gradient(ellipse at 30% 50%,${tokens.accent}15 0%,transparent 60%);pointer-events:none;z-index:1;"></div>`}
  <div style="position:relative;z-index:2;max-width:900px;">
    ${reveal(`${sectionLabel(tokens, t('label.services', brand.language))}`, 'fadeLeft', 0)}
    <div style="
      font-family:'${tokens.displayFont}',serif;
      font-size:clamp(2.5rem,6vw,5.5rem);
      font-weight:700;
      color:${tokens.text};
      line-height:1.1;
      letter-spacing:-0.04em;
      margin:1.25rem 0 2rem;
    ">
      <span id="${id}-text"></span><span style="display:inline-block;width:4px;height:0.9em;background:${tokens.accent};margin-left:4px;vertical-align:text-bottom;animation:${id}blink 0.6s step-end infinite;box-shadow:0 0 12px ${tokens.accent};"></span>
    </div>
    ${reveal(`<p style="font-size:1.05rem;color:${tokens.muted};line-height:1.7;max-width:48ch;margin-bottom:3rem;">${copy.description}</p>`, 'fadeUp', 100)}
    ${reveal(`<div style="display:flex;gap:1rem;flex-wrap:wrap;">
      <a href="#contact" style="display:inline-flex;align-items:center;gap:0.5rem;padding:1rem 2.5rem;background:${tokens.accent};color:#fff;font-weight:600;font-size:0.9rem;border-radius:0.5rem;text-decoration:none;">${copy.cta} →</a>
      <a href="#services" style="display:inline-flex;align-items:center;padding:1rem 2.5rem;background:${tokens.surface};color:${tokens.text};font-size:0.9rem;border-radius:0.5rem;text-decoration:none;border:1px solid ${tokens.muted}20;">${t('footer.services', brand.language)}</a>
    </div>`, 'fadeUp', 200)}
  </div>
</section>
${typewriterScript(id, phrasesJson, 'sans')}`;
}

function typewriterScript(id: string, phrasesJson: string, style: 'mono' | 'serif' | 'sans'): string {
  return `
<style>
@keyframes ${id}blink { 50% { opacity: 0; } }
</style>
<script>
(function(){
  var phrases = ${phrasesJson};
  var el = document.getElementById('${id}-text');
  if (!el) return;
  var pi = 0, ci = 0, deleting = false, pause = 0;
  function tick() {
    var phrase = phrases[pi];
    if (!deleting) {
      ci++;
      if (ci > phrase.length) {
        pause++;
        if (pause > 35) { deleting = true; pause = 0; }
        setTimeout(tick, 80);
        return;
      }
    } else {
      ci--;
      if (ci < 0) {
        ci = 0; deleting = false;
        pi = (pi + 1) % phrases.length;
        pause = 0;
        setTimeout(tick, 400);
        return;
      }
    }
    el.textContent = phrase.substring(0, ci);
    setTimeout(tick, deleting ? 25 : ${style === 'mono' ? 55 : 70});
  }
  tick();
})();
</script>`;
}
