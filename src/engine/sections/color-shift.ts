import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { t, pickVariant, RADIUS_MAP, btn } from './utils.js';

/**
 * Color Shift — background palette transitions per section during scroll.
 * Each service/chapter gets its own mood, color tone, and emotional context.
 * Adapted from modules/color-shift.html.
 */
export function renderColorShift(
  brand: BrandCard,
  tokens: DesignTokens,
  data: { personality?: string } & Record<string, any> = {},
): string {
  const { copy } = brand;
  const layout = data.personality ? pickVariant(data.personality) : 'cinematic';
  const r = RADIUS_MAP[tokens.radius];
  const services = copy.services ?? [];

  if (services.length < 2) return '';

  const sid = `cs_${Math.random().toString(36).slice(2, 7)}`;

  const isBrutalist = layout === 'brutalist' || layout === 'tech';
  const isEditorial  = layout === 'editorial' || layout === 'deco';
  const isMinimal    = layout === 'minimal';

  // Generate color chapters — derive from tokens + mood shifts
  const accent = tokens.accent;
  const isLight = tokens.bg.startsWith('#f') || tokens.bg.startsWith('#e') || tokens.bg.startsWith('#d');

  const chapters = [
    { bg: tokens.bg,      text: tokens.text,    label: brand.name },
    { bg: isLight ? '#1a120a' : `color-mix(in srgb,${accent} 15%,${tokens.surface})`, text: isLight ? '#f0e8df' : tokens.text, label: services[0] ?? '' },
    { bg: isLight ? '#0a1a12' : `color-mix(in srgb,${accent} 8%,${tokens.bg})`,       text: isLight ? '#dff0e8' : tokens.text, label: services[1] ?? '' },
    { bg: isLight ? '#0d0a1a' : tokens.surface,  text: isLight ? '#e0dff0' : tokens.text, label: services[2] ?? services[0] ?? '' },
    { bg: isLight ? '#f5f3ef' : tokens.bg,       text: isLight ? '#1a1a1f' : tokens.text, label: copy.tagline ?? '' },
  ].slice(0, Math.min(services.length + 1, 5));

  const fontWeight = isBrutalist ? '900' : isEditorial ? '300' : '600';
  const fontStyle  = isEditorial ? 'italic' : 'normal';
  const textAlign  = 'center';

  const sections = chapters.map((ch, i) => {
    const isFirst = i === 0;
    const isLast  = i === chapters.length - 1;
    return `
  <div
    class="${sid}-section"
    data-bg="${ch.bg}"
    data-text="${ch.text}"
    style="
      min-height:100dvh;
      display:flex;flex-direction:column;
      align-items:center;justify-content:center;
      text-align:${textAlign};
      padding:5rem clamp(1.5rem,5vw,4rem);
      position:relative;
      ${isFirst ? `border-bottom:1px solid ${tokens.muted}15;` : ''}
    "
  >
    ${isBrutalist && !isFirst
      ? `<div style="position:absolute;top:0;left:0;right:0;height:3px;background:${accent};"></div>`
      : ''}

    <div style="max-width:720px;">
      <div style="font-size:0.65rem;letter-spacing:0.2em;text-transform:uppercase;color:${ch.text};opacity:0.45;margin-bottom:1.5rem;">
        ${String(i + 1).padStart(2,'0')} — ${ch.label}
      </div>

      <h2 style="
        font-family:'${tokens.displayFont}',serif;
        font-size:clamp(2.5rem,7vw,6rem);
        font-weight:${fontWeight};
        font-style:${fontStyle};
        color:${ch.text};
        letter-spacing:-0.04em;
        line-height:0.95;
        margin-bottom:1.5rem;
      ">
        ${isFirst ? copy.heroLine ?? brand.name : (services[i - 1] ?? ch.label)}
      </h2>

      <p style="
        font-size:clamp(0.95rem,1.8vw,1.15rem);
        color:${ch.text};
        opacity:0.6;
        max-width:50ch;
        margin:0 auto;
        line-height:1.75;
      ">
        ${isFirst
          ? (copy.description ?? copy.tagline ?? '')
          : (copy.description ?? t('services.desc', brand.language))}
      </p>

      ${isLast ? `<div style="margin-top:2.5rem;">${btn(tokens, 'primary', t('hero.explore', brand.language), '#contact')}</div>` : ''}
    </div>

    ${!isFirst && !isLast
      ? `<div style="position:absolute;bottom:3rem;left:50%;transform:translateX(-50%);font-size:0.75rem;color:${ch.text};opacity:0.3;letter-spacing:0.15em;text-transform:uppercase;">scroll</div>`
      : ''}
  </div>`;
  }).join('');

  return `
<div id="${sid}-container" style="position:relative;background:${tokens.bg};color:${tokens.text};transition:background 0.7s cubic-bezier(.4,0,.2,1),color 0.7s cubic-bezier(.4,0,.2,1);" id="services">
  ${sections}
</div>
<script>
(function(){
  var container = document.getElementById('${sid}-container');
  var sections  = document.querySelectorAll('.${sid}-section');
  if (!container || !sections.length) return;

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting && entry.intersectionRatio > 0.4) {
        var bg   = entry.target.dataset.bg;
        var text = entry.target.dataset.text;
        if (bg)   container.style.background = bg;
        if (text) container.style.color = text;
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(function(s) { observer.observe(s); });
})();
</script>`;
}
