import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { sectionLabel, t, pickVariant, SPACING_MAP, RADIUS_MAP, reveal, gradientText } from './utils.js';

/**
 * Text Mask Reveal — giant headline fills with gradient color via scroll-driven clip-path.
 * Visitor must scroll to "complete" the visual, forcing engagement with the headline.
 * Adapted from modules/text-mask.html.
 */
export function renderTextMask(
  brand: BrandCard,
  tokens: DesignTokens,
  data: { personality?: string } & Record<string, any> = {},
): string {
  const { copy } = brand;
  const layout = data.personality ? pickVariant(data.personality) : 'cinematic';
  const sp = SPACING_MAP[tokens.spacing];
  const r = RADIUS_MAP[tokens.radius];

  // The big word to reveal — first word of heroLine or brand name
  const rawWord = (copy.heroLine ?? brand.name ?? 'STUDIO').toUpperCase().split(' ')[0] ?? 'STUDIO';
  // Second word for two-line effect
  const words = (copy.heroLine ?? brand.name ?? '').toUpperCase().split(' ');
  const line1 = words[0] ?? rawWord;
  const line2 = words[1] ?? (copy.tagline?.toUpperCase().split(' ')[0] ?? '');

  const sid = `tm_${Math.random().toString(36).slice(2, 7)}`;

  // Gradient for filled text — accent to highlight
  const highlight = tokens.highlight ?? tokens.accent;
  const gradAngle = layout === 'brutalist' ? '90deg' : '135deg';
  const gradFill = `linear-gradient(${gradAngle}, ${tokens.accent}, ${highlight})`;

  // Outline color for unfilled state
  const strokeColor = layout === 'minimal' || layout === 'editorial'
    ? `${tokens.text}20`
    : `${tokens.muted}30`;

  const fontSize = 'clamp(4rem, 18vw, 14rem)';

  // Background glow for cinematic/maximalist
  const bgGlow = (layout === 'cinematic' || layout === 'maximalist')
    ? `<div style="position:absolute;inset:0;background:radial-gradient(ellipse 60% 50% at 50% 60%, ${tokens.accent}08, transparent);pointer-events:none;"></div>`
    : '';

  return `
<section id="brand" style="position:relative;background:${tokens.bg};overflow:hidden;padding:${sp.section};">
  ${bgGlow}
  <div style="max-width:1100px;margin:0 auto;padding:0 clamp(1.5rem,4vw,3rem);">
    ${reveal(`<div style="margin-bottom:3rem;text-align:center;">
      ${sectionLabel(tokens, t('label.our_story', brand.language))}
      <p style="font-size:1rem;color:${tokens.muted};max-width:48ch;margin:0 auto;line-height:1.75;">${copy.description ?? copy.tagline ?? ''}</p>
    </div>`, 'fadeUp', 0)}

    <!-- Scroll-driven text mask -->
    <div id="${sid}-wrap" style="position:relative;text-align:center;user-select:none;cursor:default;padding:2rem 0;">
      <!-- Layer 1: outlined / ghost text -->
      <div style="
        font-family:'${tokens.displayFont}',serif;
        font-size:${fontSize};
        font-weight:900;
        letter-spacing:-0.05em;
        line-height:0.88;
        text-align:center;
        text-transform:uppercase;
        color:transparent;
        -webkit-text-stroke:1.5px ${strokeColor};
        position:relative;
        z-index:1;
      ">${line1}${line2 ? `<br>${line2}` : ''}</div>

      <!-- Layer 2: gradient-filled version, clip-path reveals on scroll -->
      <div id="${sid}-reveal" style="
        position:absolute;
        inset:0;
        display:flex;
        align-items:center;
        justify-content:center;
        z-index:2;
        clip-path:inset(100% 0 0 0);
        transition:clip-path 0.05s linear;
      ">
        <div style="
          font-family:'${tokens.displayFont}',serif;
          font-size:${fontSize};
          font-weight:900;
          letter-spacing:-0.05em;
          line-height:0.88;
          text-align:center;
          text-transform:uppercase;
          background:${gradFill};
          -webkit-background-clip:text;
          background-clip:text;
          -webkit-text-fill-color:transparent;
          padding:2rem 0;
        ">${line1}${line2 ? `<br>${line2}` : ''}</div>
      </div>
    </div>

    ${reveal(`<div style="text-align:center;margin-top:2.5rem;">
      <p style="font-size:0.95rem;color:${tokens.muted};max-width:44ch;margin:0 auto;line-height:1.8;font-style:${layout === 'editorial' ? 'italic' : 'normal'};">${copy.tagline ?? ''}</p>
    </div>`, 'fadeUp', 200)}
  </div>
</section>
<script>
(function(){
  var wrap = document.getElementById('${sid}-wrap');
  var reveal = document.getElementById('${sid}-reveal');
  if (!wrap || !reveal) return;

  function onScroll() {
    var rect = wrap.getBoundingClientRect();
    var wh = window.innerHeight;
    // start reveal when section enters viewport, complete when it reaches top
    var progress = Math.max(0, Math.min(1, (wh - rect.top) / (wh + rect.height * 0.4)));
    var pct = Math.round((1 - progress) * 100);
    reveal.style.clipPath = 'inset(' + pct + '% 0 0 0)';
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
</script>`;
}
