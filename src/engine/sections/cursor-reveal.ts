import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { sectionLabel, t, pickVariant, SPACING_MAP, reveal } from './utils.js';

/**
 * Cursor Reveal — before/after wipe effect with a circular spotlight that follows the cursor.
 * Reveals a second visual layer (brand color / accent) under the cursor position.
 * Adapted from modules/cursor-reveal.html.
 */
export function renderCursorReveal(
  brand: BrandCard,
  tokens: DesignTokens,
  data: { heroImage?: string; personality?: string } & Record<string, any> = {},
): string {
  const { copy } = brand;
  const layout = data.personality ? pickVariant(data.personality) : 'cinematic';
  const sp = SPACING_MAP[tokens.spacing];

  const sid = `crv_${Math.random().toString(36).slice(2, 7)}`;

  const isBrutalist = layout === 'brutalist' || layout === 'tech';
  const isEditorial  = layout === 'editorial' || layout === 'deco';

  const fontWeight = isBrutalist ? '900' : isEditorial ? '300' : '700';
  const fontStyle  = isEditorial ? 'italic' : 'normal';

  const services = copy.services ?? [];
  const feat1 = services[0] ?? copy.heroLine ?? brand.name;
  const feat2 = services[1] ?? copy.tagline ?? brand.name;

  // Layer A: base (muted/dark)
  const layerABg = tokens.surface;
  const layerAText = tokens.muted;

  // Layer B: accent (revealed under cursor)
  const layerBBg = `color-mix(in srgb, ${tokens.accent} 15%, ${tokens.bg})`;
  const layerBText = tokens.text;

  return `
<section id="about" style="padding:${sp.section};background:${tokens.bg};position:relative;">
  <div style="max-width:1100px;margin:0 auto;padding:0 clamp(1.5rem,4vw,3rem);">
    ${reveal(`<div style="text-align:center;margin-bottom:3rem;">
      ${sectionLabel(tokens, t('label.our_story', brand.language))}
      <h2 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(1.75rem,4vw,2.75rem);font-weight:${fontWeight};font-style:${fontStyle};color:${tokens.text};letter-spacing:-0.04em;margin-top:0.5rem;">${copy.heroLine ?? copy.tagline ?? ''}</h2>
    </div>`, 'fadeUp', 0)}

    <!-- Cursor reveal container -->
    <div
      id="${sid}-container"
      style="
        position:relative;
        height:clamp(300px,50vw,500px);
        border-radius:1.25rem;
        overflow:hidden;
        cursor:none;
        user-select:none;
      "
    >
      <!-- Layer A: base (always visible) -->
      <div style="
        position:absolute;inset:0;
        background:${layerABg};
        display:flex;align-items:center;justify-content:center;
        flex-direction:column;text-align:center;padding:3rem;
      ">
        <p style="font-size:0.65rem;letter-spacing:0.18em;text-transform:uppercase;color:${layerAText};margin-bottom:1rem;opacity:0.5;">${brand.name}</p>
        <h3 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(1.5rem,4vw,3rem);font-weight:${fontWeight};font-style:${fontStyle};color:${layerAText};letter-spacing:-0.03em;line-height:1.1;">${feat1}</h3>
        <p style="font-size:0.9rem;color:${layerAText};margin-top:1rem;opacity:0.6;max-width:42ch;line-height:1.7;">${copy.description ?? ''}</p>
      </div>

      <!-- Layer B: revealed under spotlight -->
      <div
        id="${sid}-layer"
        style="
          position:absolute;inset:0;
          background:${layerBBg};
          display:flex;align-items:center;justify-content:center;
          flex-direction:column;text-align:center;padding:3rem;
          clip-path:circle(0px at 50% 50%);
          transition:none;
          pointer-events:none;
        "
      >
        <p style="font-size:0.65rem;letter-spacing:0.18em;text-transform:uppercase;color:${tokens.accent};margin-bottom:1rem;">${brand.name}</p>
        <h3 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(1.5rem,4vw,3rem);font-weight:${fontWeight};font-style:${fontStyle};color:${layerBText};letter-spacing:-0.03em;line-height:1.1;">${feat2}</h3>
        <p style="font-size:0.9rem;color:${tokens.muted};margin-top:1rem;max-width:42ch;line-height:1.7;">${copy.tagline ?? ''}</p>
      </div>

      <!-- Custom cursor ring -->
      <div id="${sid}-cursor" style="
        position:absolute;
        width:120px;height:120px;
        border-radius:50%;
        border:2px solid ${tokens.accent};
        transform:translate(-50%,-50%);
        pointer-events:none;
        z-index:10;
        display:none;
        transition:width 0.15s, height 0.15s;
      "></div>
    </div>

    ${reveal(`<p style="text-align:center;font-size:0.8rem;color:${tokens.muted};margin-top:1.5rem;letter-spacing:0.05em;">Move your cursor over the image</p>`, 'fadeUp', 300)}
  </div>
</section>
<script>
(function(){
  var container = document.getElementById('${sid}-container');
  var layer     = document.getElementById('${sid}-layer');
  var cursor    = document.getElementById('${sid}-cursor');
  if (!container || !layer || !cursor) return;

  var radius = 120;

  container.addEventListener('mouseenter', function() {
    cursor.style.display = 'block';
  });
  container.addEventListener('mouseleave', function() {
    cursor.style.display = 'none';
    layer.style.clipPath = 'circle(0px at 50% 50%)';
  });
  container.addEventListener('mousemove', function(e) {
    var rect = container.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    cursor.style.left = x + 'px';
    cursor.style.top  = y + 'px';
    layer.style.clipPath = 'circle(' + radius + 'px at ' + x + 'px ' + y + 'px)';
  });
})();
</script>`;
}
