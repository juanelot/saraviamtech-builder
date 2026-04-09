import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { sectionLabel, t, pickVariant, SPACING_MAP, RADIUS_MAP, reveal } from './utils.js';

/**
 * Magnetic Grid — grid tiles push away from the cursor position (repulsion effect).
 * Creates a visually stunning interactive gallery or services showcase.
 * Adapted from modules/magnetic-grid.html.
 */
export function renderMagneticGrid(
  brand: BrandCard,
  tokens: DesignTokens,
  data: { gallery?: string[]; personality?: string } & Record<string, any> = {},
): string {
  const { copy } = brand;
  const layout = data.personality ? pickVariant(data.personality) : 'cinematic';
  const sp = SPACING_MAP[tokens.spacing];
  const r = RADIUS_MAP[tokens.radius];
  const services = copy.services ?? [];

  const sid = `mg_${Math.random().toString(36).slice(2, 7)}`;

  const isBrutalist = layout === 'brutalist' || layout === 'tech';
  const isEditorial  = layout === 'editorial' || layout === 'deco';

  const fontWeight = isBrutalist ? '900' : isEditorial ? '300' : '700';
  const fontStyle  = isEditorial ? 'italic' : 'normal';

  // Build grid cells — services + brand keywords
  const keywords = [
    brand.name,
    ...(copy.services ?? []).slice(0, 5),
    copy.tagline?.split(' ').slice(0,2).join(' ') ?? '',
    '✦',
    '◈',
    '→',
  ].filter(Boolean).slice(0, 12);

  // Cell backgrounds — varied opacity/accent mix
  const cellBgs = [
    tokens.surface,
    `color-mix(in srgb, ${tokens.accent} 10%, ${tokens.surface})`,
    tokens.bg,
    `color-mix(in srgb, ${tokens.accent} 5%, ${tokens.bg})`,
    tokens.surface,
    tokens.surface2 ?? tokens.surface,
  ];

  const cells = keywords.map((kw, i) => {
    const bg = cellBgs[i % cellBgs.length];
    const isAccent = i === 0 || kw === '✦' || kw === '◈' || kw === '→';
    return `
    <div
      class="${sid}-cell"
      style="
        background:${isAccent ? `color-mix(in srgb, ${tokens.accent} 15%, ${bg})` : bg};
        border:1px solid ${tokens.muted}12;
        border-radius:${r};
        display:flex;align-items:center;justify-content:center;
        aspect-ratio:1;
        cursor:default;
        transition:transform 0.4s cubic-bezier(.16,1,.3,1), box-shadow 0.4s;
        will-change:transform;
        overflow:hidden;
        position:relative;
      "
    >
      <span style="
        font-family:'${tokens.displayFont}',serif;
        font-size:${isAccent && kw === brand.name ? 'clamp(0.75rem,1.5vw,1.1rem)' : 'clamp(0.7rem,1.2vw,0.95rem)'};
        font-weight:${isAccent ? '700' : fontWeight};
        font-style:${fontStyle};
        color:${isAccent ? tokens.accent : tokens.text};
        text-align:center;
        padding:0.5rem;
        line-height:1.2;
        letter-spacing:-0.01em;
      ">${kw}</span>
    </div>`;
  }).join('');

  return `
<section id="showcase" style="padding:${sp.section};background:${tokens.bg};">
  <div style="max-width:1100px;margin:0 auto;padding:0 clamp(1.5rem,4vw,3rem);">
    ${reveal(`<div style="text-align:center;margin-bottom:3rem;">
      ${sectionLabel(tokens, t('label.what_we_offer', brand.language))}
      <h2 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(1.75rem,4vw,2.75rem);font-weight:${fontWeight};font-style:${fontStyle};color:${tokens.text};letter-spacing:-0.04em;margin-top:0.5rem;">${copy.heroLine ?? copy.tagline ?? ''}</h2>
    </div>`, 'fadeUp', 0)}

    <div
      id="${sid}-grid"
      style="
        display:grid;
        grid-template-columns:repeat(4,1fr);
        gap:0.75rem;
      "
    >
      ${cells}
    </div>

    ${reveal(`<p style="text-align:center;font-size:0.8rem;color:${tokens.muted};margin-top:1.5rem;opacity:0.5;letter-spacing:0.08em;">Hover over the grid</p>`, 'fadeUp', 200)}
  </div>
</section>
<script>
(function(){
  var grid  = document.getElementById('${sid}-grid');
  var cells = document.querySelectorAll('.${sid}-cell');
  if (!grid || !cells.length) return;

  var repelRadius = 120;
  var repelStrength = 24;

  grid.addEventListener('mousemove', function(e) {
    var gRect = grid.getBoundingClientRect();
    var mx = e.clientX - gRect.left;
    var my = e.clientY - gRect.top;

    cells.forEach(function(cell) {
      var rect = cell.getBoundingClientRect();
      var cx = rect.left + rect.width / 2 - gRect.left;
      var cy = rect.top + rect.height / 2 - gRect.top;
      var dx = cx - mx;
      var dy = cy - my;
      var dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < repelRadius) {
        var force = (1 - dist / repelRadius) * repelStrength;
        var nx = (dx / dist) * force;
        var ny = (dy / dist) * force;
        cell.style.transform = 'translate(' + nx + 'px, ' + ny + 'px)';
        cell.style.boxShadow = '0 8px 24px ' + '${tokens.accent}' + '20';
      } else {
        cell.style.transform = '';
        cell.style.boxShadow = '';
      }
    });
  });

  grid.addEventListener('mouseleave', function() {
    cells.forEach(function(cell) {
      cell.style.transform = '';
      cell.style.boxShadow = '';
    });
  });
})();
</script>`;
}
