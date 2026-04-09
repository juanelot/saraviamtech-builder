import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { sectionLabel, t, pickVariant, SPACING_MAP, RADIUS_MAP, reveal, gradientText } from './utils.js';

/**
 * Image Trail — mouse leaves a trail of fading colored cards/shapes as it moves.
 * Used as a hero or story section to create a unique, memorable interaction.
 * Adapted from modules/image-trail.html.
 */
export function renderImageTrail(
  brand: BrandCard,
  tokens: DesignTokens,
  data: { gallery?: string[]; personality?: string } & Record<string, any> = {},
): string {
  const { copy } = brand;
  const layout = data.personality ? pickVariant(data.personality) : 'cinematic';
  const sp = SPACING_MAP[tokens.spacing];
  const r = RADIUS_MAP[tokens.radius];

  const sid = `it_${Math.random().toString(36).slice(2, 7)}`;

  const isBrutalist = layout === 'brutalist' || layout === 'tech';
  const isEditorial  = layout === 'editorial' || layout === 'deco';

  const fontWeight = isBrutalist ? '900' : isEditorial ? '300' : '700';
  const fontStyle  = isEditorial ? 'italic' : 'normal';

  // Trail colors — derived from accent + surface variants
  const trailColors = [
    tokens.accent,
    tokens.highlight ?? tokens.surface2 ?? tokens.accent,
    `color-mix(in srgb, ${tokens.accent} 60%, ${tokens.surface})`,
    tokens.surface,
    `color-mix(in srgb, ${tokens.accent} 30%, ${tokens.bg})`,
    tokens.surface2 ?? tokens.surface,
  ];

  const services = copy.services ?? [];

  return `
<section id="about" style="padding:${sp.section};background:${tokens.bg};position:relative;overflow:hidden;">
  <div
    id="${sid}-zone"
    style="
      position:relative;
      min-height:60dvh;
      display:flex;flex-direction:column;
      align-items:center;justify-content:center;
      text-align:center;
      cursor:none;
      overflow:hidden;
      border-radius:${r};
      background:${tokens.surface};
      border:1px solid ${tokens.muted}10;
    "
  >
    <!-- Content -->
    <div style="position:relative;z-index:2;padding:4rem 2rem;max-width:680px;">
      ${sectionLabel(tokens, t('label.our_story', brand.language))}
      <h2 style="
        font-family:'${tokens.displayFont}',serif;
        font-size:clamp(2rem,5vw,4rem);
        font-weight:${fontWeight};
        font-style:${fontStyle};
        color:${tokens.text};
        letter-spacing:-0.04em;
        margin:0.5rem 0 1rem;
        line-height:1.05;
      ">${gradientText(tokens, copy.heroLine ?? brand.name, 'span')}</h2>
      <p style="font-size:1rem;color:${tokens.muted};line-height:1.8;max-width:48ch;margin:0 auto;">
        ${copy.description ?? copy.tagline ?? ''}
      </p>
      <p style="font-size:0.75rem;color:${tokens.muted};margin-top:2rem;opacity:0.5;letter-spacing:0.1em;text-transform:uppercase;">Move your cursor here</p>
    </div>

    <!-- Services tags floating -->
    <div style="display:flex;flex-wrap:wrap;gap:0.5rem;justify-content:center;padding:0 2rem 3rem;position:relative;z-index:2;">
      ${services.slice(0,5).map(s => `
        <span style="
          font-size:0.75rem;
          padding:0.4rem 1rem;
          border-radius:999px;
          border:1px solid ${tokens.muted}20;
          color:${tokens.muted};
          background:${tokens.bg};
          transition:all 0.2s;
        "
        onmouseover="this.style.borderColor='${tokens.accent}';this.style.color='${tokens.accent}'"
        onmouseout="this.style.borderColor='${tokens.muted}20';this.style.color='${tokens.muted}'"
        >${s}</span>`).join('')}
    </div>
  </div>
</section>
<script>
(function(){
  var zone = document.getElementById('${sid}-zone');
  if (!zone) return;

  var colors = ${JSON.stringify(trailColors)};
  var radius = '${r}';
  var idx = 0;
  var lastX = -999, lastY = -999;
  var threshold = 40; // px between trail items

  zone.addEventListener('mousemove', function(e) {
    var rect = zone.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;

    if (Math.hypot(x - lastX, y - lastY) < threshold) return;
    lastX = x; lastY = y;

    var el = document.createElement('div');
    var color = colors[idx % colors.length];
    idx++;
    var size = 60 + Math.random() * 60;
    var rotate = (Math.random() - 0.5) * 30;
    el.style.cssText = [
      'position:absolute',
      'pointer-events:none',
      'z-index:1',
      'width:' + size + 'px',
      'height:' + size + 'px',
      'border-radius:' + radius,
      'background:' + color,
      'left:' + (x - size/2) + 'px',
      'top:' + (y - size/2) + 'px',
      'transform:rotate(' + rotate + 'deg) scale(0)',
      'opacity:0.7',
      'transition:transform 0.3s cubic-bezier(.16,1,.3,1), opacity 0.6s ease',
    ].join(';');
    zone.appendChild(el);

    requestAnimationFrame(function() {
      el.style.transform = 'rotate(' + rotate + 'deg) scale(1)';
    });

    setTimeout(function() {
      el.style.opacity = '0';
      el.style.transform = 'rotate(' + rotate + 'deg) scale(0.5)';
      setTimeout(function() { el.remove(); }, 600);
    }, 400);
  });

  zone.addEventListener('mouseleave', function() {
    // fade all trail items
    zone.querySelectorAll('div[style*="position:absolute"]').forEach(function(el) {
      el.style.opacity = '0';
      setTimeout(function() { try{ el.remove(); }catch(e){} }, 400);
    });
  });
})();
</script>`;
}
