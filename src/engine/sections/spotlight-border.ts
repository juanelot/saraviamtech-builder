import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { sectionLabel, t, pickVariant, SPACING_MAP, RADIUS_MAP, reveal, gradientText } from './utils.js';

/**
 * Spotlight Border — card borders illuminate under the cursor with a radial glow effect.
 * Creates a sophisticated "active" feeling for service/feature grids.
 * Adapted from modules/spotlight-border.html.
 */
export function renderSpotlightBorder(
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

  const sid = `sb_${Math.random().toString(36).slice(2, 7)}`;

  const isBrutalist = layout === 'brutalist' || layout === 'tech';
  const isEditorial  = layout === 'editorial' || layout === 'deco';
  const isMinimal    = layout === 'minimal';

  const items = services.slice(0, 6);

  const fontWeight = isBrutalist ? '900' : isEditorial ? '300' : '700';
  const fontStyle  = isEditorial ? 'italic' : 'normal';

  const icons = ['◈', '◉', '◎', '◆', '◇', '◍'];

  const cards = items.map((svc, i) => `
    <div
      class="${sid}-card"
      style="
        position:relative;
        background:${tokens.surface};
        border-radius:${r};
        padding:2.25rem 1.75rem;
        overflow:hidden;
        cursor:default;
        transition:box-shadow 0.3s;
      "
    >
      <div class="${sid}-border" style="
        position:absolute;inset:0;border-radius:${r};
        background:radial-gradient(circle 150px at -100px -100px, ${tokens.accent}60, transparent 60%);
        opacity:0;transition:opacity 0.3s;
        pointer-events:none;z-index:0;
      "></div>
      <div style="position:absolute;inset:0;border-radius:${r};border:1px solid ${tokens.muted}15;pointer-events:none;z-index:1;"></div>
      <div style="position:relative;z-index:2;">
        <div style="font-size:1.25rem;color:${tokens.accent};margin-bottom:1.25rem;opacity:0.7;">${icons[i % icons.length]}</div>
        <div style="font-size:0.6rem;letter-spacing:0.15em;text-transform:uppercase;color:${tokens.muted};margin-bottom:0.75rem;">${String(i + 1).padStart(2,'0')}</div>
        <h3 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(1.05rem,1.8vw,1.3rem);font-weight:${fontWeight};font-style:${fontStyle};color:${tokens.text};letter-spacing:-0.02em;margin-bottom:0.75rem;line-height:1.2;">${svc}</h3>
        <p style="font-size:0.825rem;color:${tokens.muted};line-height:1.65;">${copy.description ?? t('services.desc', brand.language)}</p>
        ${!isMinimal ? `<div style="margin-top:1.25rem;font-size:0.8rem;color:${tokens.accent};font-weight:600;opacity:0;transition:opacity 0.3s;" class="${sid}-arrow">→</div>` : ''}
      </div>
    </div>`).join('');

  return `
<section id="services" style="padding:${sp.section};background:${tokens.bg};">
  <div style="max-width:1100px;margin:0 auto;padding:0 clamp(1.5rem,4vw,3rem);">
    ${reveal(`<div style="text-align:center;margin-bottom:3.5rem;">
      ${sectionLabel(tokens, t('label.services', brand.language))}
      <h2 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(1.75rem,4vw,2.75rem);font-weight:${fontWeight};font-style:${fontStyle};color:${tokens.text};letter-spacing:-0.04em;margin-top:0.5rem;">
        ${gradientText(tokens, copy.heroLine ?? copy.tagline ?? '', 'span')}
      </h2>
    </div>`, 'fadeUp', 0)}
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1px;background:${tokens.muted}10;border-radius:${r};overflow:hidden;">
      ${cards}
    </div>
  </div>
</section>
<script>
(function(){
  var cards   = document.querySelectorAll('.${sid}-card');
  var borders = document.querySelectorAll('.${sid}-border');
  var arrows  = document.querySelectorAll('.${sid}-arrow');
  cards.forEach(function(card, idx) {
    var border = borders[idx];
    var arrow  = arrows[idx];
    card.addEventListener('mousemove', function(e) {
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      if (border) {
        border.style.background = 'radial-gradient(circle 180px at ' + x + 'px ' + y + 'px, ${tokens.accent}55, transparent 65%)';
        border.style.opacity = '1';
      }
    });
    card.addEventListener('mouseenter', function() {
      if (arrow) arrow.style.opacity = '1';
      card.style.boxShadow = '0 8px 32px ${tokens.accent}15';
    });
    card.addEventListener('mouseleave', function() {
      if (border) border.style.opacity = '0';
      if (arrow) arrow.style.opacity = '0';
      card.style.boxShadow = '';
    });
  });
})();
</script>`;
}
