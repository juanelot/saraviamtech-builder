import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { sectionLabel, t, pickVariant, SPACING_MAP, RADIUS_MAP, reveal, gradientText } from './utils.js';

/**
 * Cursor-Reactive Environment — glow follows cursor, 3D tilt cards, magnetic buttons.
 * Creates an immersive interactive environment where the cursor is a first-class element.
 * Adapted from modules/cursor-reactive.html.
 */
export function renderCursorReactive(
  brand: BrandCard,
  tokens: DesignTokens,
  data: { personality?: string } & Record<string, any> = {},
): string {
  const { copy } = brand;
  const layout = data.personality ? pickVariant(data.personality) : 'cinematic';
  const sp = SPACING_MAP[tokens.spacing];
  const r = RADIUS_MAP[tokens.radius];
  const services = copy.services ?? [];

  if (services.length < 2) return '';

  const sid = `cur_${Math.random().toString(36).slice(2, 7)}`;

  const isBrutalist = layout === 'brutalist' || layout === 'tech';
  const isEditorial  = layout === 'editorial' || layout === 'deco';
  const isMinimal    = layout === 'minimal';

  const items = services.slice(0, 4);

  const fontWeight  = isBrutalist ? '900' : isEditorial ? '300' : '700';
  const fontStyle   = isEditorial ? 'italic' : 'normal';
  const cardBorder  = isBrutalist
    ? `border:2px solid ${tokens.accent};`
    : `border:1px solid ${tokens.muted}18;`;
  const titleSize   = 'clamp(1.1rem,2vw,1.4rem)';

  const cards = items.map((svc, i) => `
    <div class="${sid}-card" style="
      background:${tokens.surface};
      ${cardBorder}
      border-radius:${r};
      padding:2.25rem 1.75rem;
      position:relative;
      overflow:hidden;
      cursor:default;
      transform-style:preserve-3d;
      transition:box-shadow 0.3s;
      will-change:transform;
    ">
      <!-- Spotlight overlay -->
      <div class="${sid}-spot" style="
        position:absolute;inset:0;
        background:radial-gradient(circle 200px at 50% 50%, ${tokens.accent}12, transparent);
        opacity:0;
        transition:opacity 0.3s;
        pointer-events:none;
        border-radius:${r};
      "></div>

      <div style="position:relative;z-index:1;">
        <div style="font-size:0.6rem;letter-spacing:0.15em;text-transform:uppercase;color:${tokens.accent};margin-bottom:1rem;font-weight:600;">
          ${String(i + 1).padStart(2,'0')}
        </div>
        <h3 style="
          font-family:'${tokens.displayFont}',serif;
          font-size:${titleSize};
          font-weight:${fontWeight};
          font-style:${fontStyle};
          color:${tokens.text};
          letter-spacing:-0.02em;
          margin-bottom:0.75rem;
          line-height:1.2;
        ">${svc}</h3>
        <p style="font-size:0.85rem;color:${tokens.muted};line-height:1.65;">${copy.description ?? t('services.desc', brand.language)}</p>
      </div>
    </div>`).join('');

  return `
<section id="services" style="padding:${sp.section};background:${tokens.bg};position:relative;overflow:hidden;">
  <!-- Global cursor glow -->
  <div id="${sid}-glow" style="
    position:fixed;width:480px;height:480px;border-radius:50%;
    background:radial-gradient(circle, ${tokens.accent}10 0%, transparent 70%);
    pointer-events:none;z-index:0;
    transform:translate(-50%,-50%);
    transition:opacity 0.3s;
    will-change:transform;
    top:0;left:0;
  "></div>

  <div style="max-width:1080px;margin:0 auto;padding:0 clamp(1.5rem,4vw,3rem);position:relative;z-index:1;">
    ${reveal(`<div style="text-align:${isBrutalist ? 'left' : 'center'};margin-bottom:3.5rem;">
      ${sectionLabel(tokens, t('label.services', brand.language))}
      <h2 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(1.75rem,4vw,2.75rem);font-weight:${fontWeight};font-style:${fontStyle};color:${tokens.text};letter-spacing:-0.04em;margin-top:0.5rem;">
        ${gradientText(tokens, copy.heroLine ?? copy.tagline ?? '', 'span')}
      </h2>
    </div>`, 'fadeUp', 0)}

    <div id="${sid}-grid" style="
      display:grid;
      grid-template-columns:repeat(auto-fit,minmax(240px,1fr));
      gap:1.25rem;
    ">
      ${cards}
    </div>
  </div>
</section>
<script>
(function(){
  var glow = document.getElementById('${sid}-glow');
  var cards = document.querySelectorAll('.${sid}-card');
  var spots = document.querySelectorAll('.${sid}-spot');

  // Track mouse for glow
  if (glow) {
    document.addEventListener('mousemove', function(e) {
      glow.style.left = e.clientX + 'px';
      glow.style.top  = e.clientY + 'px';
    }, { passive: true });
    document.addEventListener('mouseenter', function() { glow.style.opacity = '1'; });
    document.addEventListener('mouseleave', function() { glow.style.opacity = '0'; });
  }

  // 3D tilt + spotlight per card
  cards.forEach(function(card, idx) {
    var spot = spots[idx];
    card.addEventListener('mousemove', function(e) {
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var cx = rect.width / 2;
      var cy = rect.height / 2;
      var rotX = ((y - cy) / cy) * -8;
      var rotY = ((x - cx) / cx) * 8;
      card.style.transform = 'perspective(800px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) scale3d(1.02,1.02,1.02)';
      card.style.boxShadow = '0 20px 50px ${tokens.accent}20';
      if (spot) {
        spot.style.background = 'radial-gradient(circle 200px at ' + x + 'px ' + y + 'px, ${tokens.accent}18, transparent)';
        spot.style.opacity = '1';
      }
    });
    card.addEventListener('mouseleave', function() {
      card.style.transform = '';
      card.style.boxShadow = '';
      if (spot) spot.style.opacity = '0';
    });
  });
})();
</script>`;
}
