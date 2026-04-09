import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { t, pickVariant, RADIUS_MAP, btn, reveal } from './utils.js';

/**
 * Curtain Reveal — two halves of the screen slide apart on scroll, revealing the content behind.
 * Dramatic entrance for brand reveals, product launches, and hero sections.
 * Adapted from modules/curtain-reveal.html.
 */
export function renderCurtainReveal(
  brand: BrandCard,
  tokens: DesignTokens,
  data: { heroImage?: string; personality?: string } & Record<string, any> = {},
): string {
  const { copy } = brand;
  const layout = data.personality ? pickVariant(data.personality) : 'cinematic';
  const r = RADIUS_MAP[tokens.radius];

  const sid = `cr_${Math.random().toString(36).slice(2, 7)}`;

  // The big split words — brand name split in two halves
  const name = (brand.name ?? copy.heroLine ?? 'DISCOVER').toUpperCase();
  const mid = Math.ceil(name.length / 2);
  const wordLeft = name.slice(0, mid);
  const wordRight = name.slice(mid);

  // Inner content (behind the curtain)
  const innerBg = data.heroImage
    ? `url(${data.heroImage}) center/cover no-repeat`
    : `linear-gradient(135deg, ${tokens.surface} 0%, ${tokens.bg} 100%)`;

  const curtainBg = tokens.bg;

  // Text styles based on personality
  const wordFontSize = 'clamp(3rem, 10vw, 9rem)';
  const wordWeight = layout === 'brutalist' ? '900' : '700';
  const wordColor = tokens.text;
  const curtainBorder = layout === 'brutalist'
    ? `border-right:4px solid ${tokens.accent};`
    : `border-right:1px solid ${tokens.muted}20;`;
  const curtainBorderRight = layout === 'brutalist'
    ? `border-left:4px solid ${tokens.accent};`
    : `border-left:1px solid ${tokens.muted}20;`;

  return `
<section id="hero-curtain" style="position:relative;overflow:hidden;">
  <!-- Scroll driver — 300vh tall to give scroll room -->
  <div id="${sid}-driver" style="height:300vh;position:relative;">
    <div id="${sid}-sticky" style="position:sticky;top:0;height:100dvh;overflow:hidden;display:flex;align-items:center;justify-content:center;">

      <!-- Content behind the curtain -->
      <div style="
        position:absolute;inset:0;
        background:${innerBg};
        display:flex;flex-direction:column;
        align-items:center;justify-content:center;
        text-align:center;padding:3rem;
        z-index:1;
      ">
        ${data.heroImage
          ? `<div style="position:absolute;inset:0;background:linear-gradient(to bottom, ${tokens.bg}60, ${tokens.bg}90);z-index:0;"></div>`
          : ''}
        <div style="position:relative;z-index:1;">
          <div style="font-size:0.7rem;letter-spacing:0.18em;text-transform:uppercase;color:${tokens.accent};margin-bottom:1.5rem;">${brand.name}</div>
          <h2 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(1.75rem,4vw,3rem);font-weight:700;color:${tokens.text};letter-spacing:-0.03em;margin-bottom:1rem;line-height:1.1;">${copy.heroLine ?? copy.tagline ?? ''}</h2>
          <p style="font-size:1rem;color:${tokens.muted};max-width:44ch;line-height:1.7;margin:0 auto 2rem;">${copy.description ?? ''}</p>
          ${btn(tokens, 'primary', t('hero.explore', brand.language), '#services')}
        </div>
      </div>

      <!-- Left curtain panel -->
      <div id="${sid}-left" style="
        position:absolute;top:0;left:0;bottom:0;width:50%;
        background:${curtainBg};
        z-index:2;
        display:flex;align-items:center;justify-content:flex-end;
        padding-right:3rem;
        ${curtainBorder}
        will-change:transform;
      ">
        <span style="font-family:'${tokens.displayFont}',serif;font-size:${wordFontSize};font-weight:${wordWeight};letter-spacing:-0.05em;color:${wordColor};text-transform:uppercase;line-height:1;">${wordLeft}</span>
      </div>

      <!-- Right curtain panel -->
      <div id="${sid}-right" style="
        position:absolute;top:0;right:0;bottom:0;width:50%;
        background:${curtainBg};
        z-index:2;
        display:flex;align-items:center;justify-content:flex-start;
        padding-left:3rem;
        ${curtainBorderRight}
        will-change:transform;
      ">
        <span style="font-family:'${tokens.displayFont}',serif;font-size:${wordFontSize};font-weight:${wordWeight};letter-spacing:-0.05em;color:${wordColor};text-transform:uppercase;line-height:1;">${wordRight}</span>
      </div>

    </div>
  </div>
</section>
<script>
(function(){
  var driver = document.getElementById('${sid}-driver');
  var left   = document.getElementById('${sid}-left');
  var right  = document.getElementById('${sid}-right');
  if (!driver || !left || !right) return;

  function onScroll() {
    var rect = driver.getBoundingClientRect();
    var driverH = driver.offsetHeight;
    var scrolled = -rect.top;
    // Progress 0→1 over first 60% of scroll range
    var progress = Math.max(0, Math.min(1, scrolled / (driverH * 0.6)));
    var eased = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2; // ease in-out quad
    var pct = eased * 100;
    left.style.transform  = 'translateX(-' + pct + '%)';
    right.style.transform = 'translateX(' + pct + '%)';
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
</script>`;
}
