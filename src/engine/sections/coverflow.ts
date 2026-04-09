import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { sectionLabel, t, pickVariant, SPACING_MAP, RADIUS_MAP, reveal } from './utils.js';

/**
 * Coverflow — 3D center-focused carousel with angled side cards (iTunes/Apple Music style).
 * Great for galleries, portfolios, testimonials, or service showcases.
 * Adapted from modules/coverflow.html.
 */
export function renderCoverflow(
  brand: BrandCard,
  tokens: DesignTokens,
  data: { gallery?: string[]; personality?: string } & Record<string, any> = {},
): string {
  const { copy } = brand;
  const layout = data.personality ? pickVariant(data.personality) : 'cinematic';
  const sp = SPACING_MAP[tokens.spacing];
  const r = RADIUS_MAP[tokens.radius];
  const services = copy.services ?? [];

  if (services.length < 2) return '';

  const sid = `cf_${Math.random().toString(36).slice(2, 7)}`;

  const isBrutalist = layout === 'brutalist' || layout === 'tech';
  const isEditorial  = layout === 'editorial' || layout === 'deco';

  const fontWeight = isBrutalist ? '900' : isEditorial ? '300' : '700';
  const fontStyle  = isEditorial ? 'italic' : 'normal';

  const items = services.slice(0, 6);

  // Card background colors — derived from accent
  const cardBgs = [
    `linear-gradient(135deg, ${tokens.accent}20, ${tokens.surface})`,
    `linear-gradient(135deg, ${tokens.surface}, ${tokens.bg})`,
    `linear-gradient(135deg, ${tokens.surface2 ?? tokens.surface}, ${tokens.accent}10)`,
    `linear-gradient(135deg, ${tokens.bg}, ${tokens.surface})`,
    `linear-gradient(135deg, ${tokens.accent}15, ${tokens.surface2 ?? tokens.surface})`,
    `linear-gradient(135deg, ${tokens.surface}, ${tokens.accent}08)`,
  ];

  const cards = items.map((svc, i) => `
    <div
      class="${sid}-card"
      data-idx="${i}"
      style="
        flex-shrink:0;
        width:clamp(200px,35vw,300px);
        aspect-ratio:3/4;
        border-radius:${r};
        background:${cardBgs[i % cardBgs.length]};
        border:1px solid ${tokens.muted}15;
        display:flex;flex-direction:column;
        align-items:flex-start;justify-content:flex-end;
        padding:1.75rem;
        cursor:pointer;
        transform-style:preserve-3d;
        will-change:transform;
        transition:transform 0.5s cubic-bezier(.16,1,.3,1), box-shadow 0.5s, opacity 0.5s;
        position:relative;overflow:hidden;
        user-select:none;
      "
    >
      <!-- Decorative top area -->
      <div style="position:absolute;top:1.5rem;left:1.75rem;right:1.75rem;">
        <div style="font-size:0.6rem;letter-spacing:0.18em;text-transform:uppercase;color:${tokens.accent};margin-bottom:0.5rem;">${String(i + 1).padStart(2,'0')}</div>
        <div style="width:2rem;height:1.5px;background:${tokens.accent};opacity:0.6;"></div>
      </div>

      <!-- Card content -->
      <div>
        <h3 style="
          font-family:'${tokens.displayFont}',serif;
          font-size:clamp(1.1rem,2vw,1.4rem);
          font-weight:${fontWeight};
          font-style:${fontStyle};
          color:${tokens.text};
          letter-spacing:-0.02em;
          margin-bottom:0.5rem;
          line-height:1.2;
        ">${svc}</h3>
        <p style="font-size:0.8rem;color:${tokens.muted};line-height:1.6;">${copy.description ?? t('services.desc', brand.language)}</p>
      </div>
    </div>`).join('');

  return `
<section id="services" style="padding:${sp.section};background:${tokens.bg};overflow:hidden;">
  <div style="max-width:1200px;margin:0 auto;">
    ${reveal(`<div style="text-align:center;margin-bottom:3rem;padding:0 clamp(1.5rem,4vw,3rem);">
      ${sectionLabel(tokens, t('label.services', brand.language))}
      <h2 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(1.75rem,4vw,2.75rem);font-weight:${fontWeight};font-style:${fontStyle};color:${tokens.text};letter-spacing:-0.04em;margin-top:0.5rem;">${copy.heroLine ?? copy.tagline ?? ''}</h2>
    </div>`, 'fadeUp', 0)}

    <!-- Coverflow viewport -->
    <div
      id="${sid}-viewport"
      style="
        perspective:1200px;
        perspective-origin:50% 50%;
        overflow:hidden;
        position:relative;
        padding:2rem 0 3rem;
      "
    >
      <div
        id="${sid}-track"
        style="
          display:flex;
          gap:1.5rem;
          align-items:center;
          justify-content:center;
          padding:0 3rem;
          transition:transform 0.5s cubic-bezier(.16,1,.3,1);
          transform-style:preserve-3d;
        "
      >
        ${cards}
      </div>
    </div>

    <!-- Navigation dots -->
    <div style="display:flex;justify-content:center;gap:0.5rem;padding:0 0 1rem;">
      ${items.map((_, i) => `<button
        class="${sid}-dot"
        data-idx="${i}"
        style="
          width:${i === 0 ? '1.5rem' : '0.4rem'};
          height:0.4rem;
          border-radius:999px;
          background:${i === 0 ? tokens.accent : tokens.muted + '30'};
          border:none;cursor:pointer;
          transition:all 0.3s;
          padding:0;
        "
      ></button>`).join('')}
    </div>
  </div>
</section>
<script>
(function(){
  var track  = document.getElementById('${sid}-track');
  var dots   = document.querySelectorAll('.${sid}-dot');
  var cards  = document.querySelectorAll('.${sid}-card');
  if (!track || !cards.length) return;

  var current = 0;
  var total   = cards.length;

  function updateCoverflow() {
    cards.forEach(function(card, i) {
      var offset = i - current;
      var absOff = Math.abs(offset);
      var rotY   = offset * -42; // degrees
      var transX = offset * 20; // px overlap
      var scale  = absOff === 0 ? 1 : 0.78 - absOff * 0.04;
      var opacity = absOff > 2 ? 0 : 1 - absOff * 0.25;
      var zIndex  = total - absOff;
      var shadow  = absOff === 0
        ? '0 32px 80px ${tokens.accent}30'
        : '0 8px 24px rgba(0,0,0,0.15)';

      card.style.transform = 'rotateY(' + rotY + 'deg) translateX(' + transX + 'px) scale(' + scale + ')';
      card.style.opacity   = opacity;
      card.style.zIndex    = zIndex;
      card.style.boxShadow = shadow;
    });

    dots.forEach(function(dot, i) {
      dot.style.width      = i === current ? '1.5rem' : '0.4rem';
      dot.style.background = i === current ? '${tokens.accent}' : '${tokens.muted}30';
    });
  }

  cards.forEach(function(card) {
    card.addEventListener('click', function() {
      var idx = parseInt(card.dataset.idx);
      current = idx;
      updateCoverflow();
    });
  });

  dots.forEach(function(dot) {
    dot.addEventListener('click', function() {
      current = parseInt(dot.dataset.idx);
      updateCoverflow();
    });
  });

  // Keyboard navigation
  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft')  { current = Math.max(0, current - 1); updateCoverflow(); }
    if (e.key === 'ArrowRight') { current = Math.min(total - 1, current + 1); updateCoverflow(); }
  });

  updateCoverflow();
})();
</script>`;
}
