import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { sectionLabel, t, pickVariant, SPACING_MAP, RADIUS_MAP, reveal } from './utils.js';

/**
 * Drag Pan — infinite draggable canvas where users can pan in any direction.
 * Great for portfolios, service showcases, or creative galleries.
 * Adapted from modules/drag-pan.html.
 */
export function renderDragPan(
  brand: BrandCard,
  tokens: DesignTokens,
  data: { gallery?: string[]; personality?: string } & Record<string, any> = {},
): string {
  const { copy } = brand;
  const layout = data.personality ? pickVariant(data.personality) : 'cinematic';
  const sp = SPACING_MAP[tokens.spacing];
  const r = RADIUS_MAP[tokens.radius];
  const services = copy.services ?? [];

  const sid = `dp_${Math.random().toString(36).slice(2, 7)}`;

  const isBrutalist = layout === 'brutalist' || layout === 'tech';
  const isEditorial  = layout === 'editorial' || layout === 'deco';

  const fontWeight = isBrutalist ? '900' : isEditorial ? '300' : '700';
  const fontStyle  = isEditorial ? 'italic' : 'normal';

  // Build canvas cards — services + brand keywords
  const allItems = [
    { type: 'brand', text: brand.name, sub: copy.tagline ?? '' },
    ...services.slice(0, 5).map(s => ({ type: 'service', text: s, sub: copy.description ?? '' })),
    { type: 'accent', text: '✦', sub: '' },
    { type: 'quote', text: copy.tagline ?? copy.heroLine ?? '', sub: brand.name },
    { type: 'accent', text: '◈', sub: '' },
  ].filter(Boolean);

  // Random positions within a 1600x1000 canvas
  const positions = [
    { x: 100,  y: 80  },
    { x: 400,  y: 200 },
    { x: 800,  y: 60  },
    { x: 200,  y: 400 },
    { x: 650,  y: 350 },
    { x: 1050, y: 150 },
    { x: 950,  y: 420 },
    { x: 380,  y: 560 },
    { x: 750,  y: 580 },
  ];

  const cardBgs = [
    tokens.surface,
    `color-mix(in srgb, ${tokens.accent} 12%, ${tokens.surface})`,
    tokens.bg,
    tokens.surface,
    `color-mix(in srgb, ${tokens.accent} 6%, ${tokens.bg})`,
    tokens.surface2 ?? tokens.surface,
  ];

  const canvasCards = allItems.map((item, i) => {
    const pos = positions[i % positions.length] ?? { x: i * 120, y: i * 80 };
    const bg  = item.type === 'accent'
      ? `color-mix(in srgb, ${tokens.accent} 20%, ${tokens.surface})`
      : cardBgs[i % cardBgs.length];
    const w   = item.type === 'accent' ? '5rem' : item.type === 'brand' ? '16rem' : '13rem';
    const pad = item.type === 'accent' ? '1.5rem' : '1.5rem 1.75rem';
    return `
    <div style="
      position:absolute;
      left:${pos.x}px;top:${pos.y}px;
      width:${w};
      background:${bg};
      border:1px solid ${tokens.muted}15;
      border-radius:${r};
      padding:${pad};
      ${item.type === 'accent' ? 'display:flex;align-items:center;justify-content:center;aspect-ratio:1;' : ''}
    ">
      ${item.type === 'accent'
        ? `<span style="font-size:1.5rem;color:${tokens.accent};opacity:0.7;">${item.text}</span>`
        : `<div style="font-size:0.55rem;letter-spacing:0.15em;text-transform:uppercase;color:${tokens.accent};margin-bottom:0.5rem;">${brand.name}</div>
           <div style="font-family:'${tokens.displayFont}',serif;font-size:clamp(0.9rem,1.5vw,1.1rem);font-weight:${fontWeight};font-style:${fontStyle};color:${tokens.text};letter-spacing:-0.02em;line-height:1.2;margin-bottom:0.4rem;">${item.text}</div>
           ${item.sub ? `<div style="font-size:0.75rem;color:${tokens.muted};line-height:1.5;">${item.sub.slice(0,60)}${item.sub.length > 60 ? '…' : ''}</div>` : ''}`
      }
    </div>`;
  }).join('');

  return `
<section id="showcase" style="padding:${sp.section};background:${tokens.bg};">
  <div style="max-width:1200px;margin:0 auto;padding:0 clamp(1.5rem,4vw,3rem);">
    ${reveal(`<div style="text-align:center;margin-bottom:2rem;">
      ${sectionLabel(tokens, t('label.what_we_offer', brand.language))}
      <h2 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(1.75rem,4vw,2.75rem);font-weight:${fontWeight};font-style:${fontStyle};color:${tokens.text};letter-spacing:-0.04em;margin-top:0.5rem;">${copy.heroLine ?? copy.tagline ?? ''}</h2>
    </div>`, 'fadeUp', 0)}

    <!-- Drag canvas container -->
    <div
      id="${sid}-viewport"
      style="
        position:relative;
        height:clamp(360px,50vw,480px);
        border-radius:${r};
        overflow:hidden;
        cursor:grab;
        border:1px solid ${tokens.muted}10;
        background:${tokens.bg};
        user-select:none;
        touch-action:none;
      "
    >
      <!-- Subtle grid pattern -->
      <div style="position:absolute;inset:0;background-image:radial-gradient(${tokens.muted}15 1px,transparent 1px);background-size:28px 28px;pointer-events:none;"></div>

      <!-- Draggable canvas -->
      <div id="${sid}-canvas" style="position:absolute;inset:0;width:1800px;height:1000px;will-change:transform;">
        ${canvasCards}
      </div>

      <!-- Hint -->
      <div id="${sid}-hint" style="
        position:absolute;bottom:1rem;right:1rem;
        font-size:0.7rem;color:${tokens.muted};
        opacity:0.5;letter-spacing:0.08em;
        pointer-events:none;
      ">Drag to explore ↗</div>
    </div>
  </div>
</section>
<script>
(function(){
  var viewport = document.getElementById('${sid}-viewport');
  var canvas   = document.getElementById('${sid}-canvas');
  var hint     = document.getElementById('${sid}-hint');
  if (!viewport || !canvas) return;

  var isDragging = false;
  var startX = 0, startY = 0;
  var transX = -200, transY = -50;
  var velX = 0, velY = 0;
  var lastX = 0, lastY = 0;
  var rafId = null;

  function setTransform() {
    canvas.style.transform = 'translate(' + transX + 'px,' + transY + 'px)';
  }

  function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }

  viewport.addEventListener('mousedown', function(e) {
    isDragging = true;
    startX = e.clientX - transX;
    startY = e.clientY - transY;
    lastX  = e.clientX;
    lastY  = e.clientY;
    velX = velY = 0;
    viewport.style.cursor = 'grabbing';
    if (rafId) cancelAnimationFrame(rafId);
    if (hint) hint.style.opacity = '0';
  });

  document.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    velX = e.clientX - lastX;
    velY = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    transX = clamp(e.clientX - startX, -1200, 200);
    transY = clamp(e.clientY - startY, -600, 100);
    setTransform();
  });

  document.addEventListener('mouseup', function() {
    if (!isDragging) return;
    isDragging = false;
    viewport.style.cursor = 'grab';
    // momentum
    function momentum() {
      velX *= 0.92;
      velY *= 0.92;
      transX = clamp(transX + velX, -1200, 200);
      transY = clamp(transY + velY, -600, 100);
      setTransform();
      if (Math.abs(velX) > 0.5 || Math.abs(velY) > 0.5) {
        rafId = requestAnimationFrame(momentum);
      }
    }
    rafId = requestAnimationFrame(momentum);
  });

  setTransform();
})();
</script>`;
}
