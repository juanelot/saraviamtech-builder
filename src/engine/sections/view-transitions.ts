import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { sectionLabel, t, pickVariant, SPACING_MAP, RADIUS_MAP, reveal, btn } from './utils.js';

/**
 * View Transitions — service/product cards expand into full overlays with smooth morph animation.
 * Click any card to see it expand to fill the viewport with full content.
 * Adapted from modules/view-transitions.html.
 */
export function renderViewTransitions(
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

  const sid = `vt_${Math.random().toString(36).slice(2, 7)}`;

  const isBrutalist = layout === 'brutalist' || layout === 'tech';
  const isEditorial  = layout === 'editorial' || layout === 'deco';
  const isLight      = tokens.bg.startsWith('#f') || tokens.bg.startsWith('#e');

  const items = services.slice(0, 6);

  const fontWeight = isBrutalist ? '900' : isEditorial ? '300' : '700';
  const fontStyle  = isEditorial ? 'italic' : 'normal';

  // Accent colors per card
  const accentVariants = [
    tokens.accent,
    tokens.highlight ?? tokens.accent,
    `color-mix(in srgb, ${tokens.accent} 70%, ${tokens.surface})`,
    tokens.accent,
    tokens.highlight ?? tokens.accent,
    tokens.accent,
  ];

  const cards = items.map((svc, i) => {
    const cardAccent = accentVariants[i % accentVariants.length];
    return `
    <div
      class="${sid}-card"
      data-idx="${i}"
      style="
        background:${tokens.surface};
        border:1px solid ${tokens.muted}15;
        border-radius:${r};
        padding:2rem 1.75rem;
        cursor:pointer;
        position:relative;
        overflow:hidden;
        transition:transform 0.3s cubic-bezier(.16,1,.3,1), box-shadow 0.3s;
      "
      onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 16px 48px ${tokens.accent}20'"
      onmouseout="this.style.transform='';this.style.boxShadow=''"
    >
      <div style="
        width:2.5rem;height:2.5rem;border-radius:${r};
        background:${cardAccent}18;
        display:flex;align-items:center;justify-content:center;
        margin-bottom:1.25rem;
      ">
        <div style="width:1rem;height:1px;background:${cardAccent};"></div>
      </div>
      <h3 style="
        font-family:'${tokens.displayFont}',serif;
        font-size:clamp(1.1rem,2vw,1.375rem);
        font-weight:${fontWeight};
        font-style:${fontStyle};
        color:${tokens.text};
        letter-spacing:-0.02em;
        margin-bottom:0.625rem;
        line-height:1.2;
      ">${svc}</h3>
      <p style="font-size:0.825rem;color:${tokens.muted};line-height:1.65;margin-bottom:1.25rem;">${copy.description ?? t('services.desc', brand.language)}</p>
      <div style="font-size:0.75rem;color:${cardAccent};font-weight:600;letter-spacing:0.05em;display:flex;align-items:center;gap:0.4rem;">
        ${t('hero.learn_more', brand.language)} <span style="font-size:1rem;">→</span>
      </div>
    </div>`;
  }).join('');

  // Overlay panels for each service
  const overlays = items.map((svc, i) => {
    const cardAccent = accentVariants[i % accentVariants.length];
    return `
    <div
      id="${sid}-overlay-${i}"
      style="
        position:fixed;inset:0;z-index:9990;
        background:${tokens.bg};
        display:none;
        flex-direction:column;
        align-items:center;justify-content:center;
        padding:3rem;
        opacity:0;
        transition:opacity 0.35s cubic-bezier(.4,0,.2,1);
      "
    >
      <div style="max-width:680px;width:100%;text-align:center;">
        <div style="font-size:0.65rem;letter-spacing:0.18em;text-transform:uppercase;color:${cardAccent};margin-bottom:1.5rem;">${brand.name} — ${String(i + 1).padStart(2,'0')}</div>
        <h2 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(2rem,5vw,4rem);font-weight:${fontWeight};font-style:${fontStyle};color:${tokens.text};letter-spacing:-0.04em;margin-bottom:1.25rem;line-height:1.05;">${svc}</h2>
        <p style="font-size:1.05rem;color:${tokens.muted};line-height:1.8;max-width:52ch;margin:0 auto 2.5rem;">${copy.description ?? t('services.desc', brand.language)}</p>
        ${btn(tokens, 'primary', t('hero.explore', brand.language), '#contact')}
      </div>
      <button
        onclick="document.getElementById('${sid}-overlay-${i}').style.opacity='0';setTimeout(function(){document.getElementById('${sid}-overlay-${i}').style.display='none';document.body.style.overflow='';},350);"
        style="
          position:absolute;top:2rem;right:2rem;
          background:${tokens.surface};border:1px solid ${tokens.muted}20;
          color:${tokens.text};border-radius:50%;
          width:2.75rem;height:2.75rem;
          font-size:1.25rem;cursor:pointer;
          display:flex;align-items:center;justify-content:center;
          transition:background 0.2s;
        "
        onmouseover="this.style.background='${tokens.accent}';this.style.color='#fff'"
        onmouseout="this.style.background='${tokens.surface}';this.style.color='${tokens.text}'"
      >×</button>
    </div>`;
  }).join('');

  return `
<section id="services" style="padding:${sp.section};background:${tokens.bg};">
  <div style="max-width:1080px;margin:0 auto;padding:0 clamp(1.5rem,4vw,3rem);">
    ${reveal(`<div style="text-align:center;margin-bottom:3rem;">
      ${sectionLabel(tokens, t('label.services', brand.language))}
      <h2 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(1.75rem,4vw,2.75rem);font-weight:${fontWeight};font-style:${fontStyle};color:${tokens.text};letter-spacing:-0.04em;margin-top:0.5rem;">${copy.heroLine ?? copy.tagline ?? ''}</h2>
    </div>`, 'fadeUp', 0)}

    <div style="
      display:grid;
      grid-template-columns:repeat(auto-fit,minmax(260px,1fr));
      gap:1.25rem;
    " id="${sid}-grid">
      ${cards}
    </div>
  </div>
</section>

${overlays}

<script>
(function(){
  var cards = document.querySelectorAll('.${sid}-card');
  cards.forEach(function(card) {
    card.addEventListener('click', function() {
      var idx = card.dataset.idx;
      var overlay = document.getElementById('${sid}-overlay-' + idx);
      if (!overlay) return;
      overlay.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(function() {
        requestAnimationFrame(function() {
          overlay.style.opacity = '1';
        });
      });
    });
  });
})();
</script>`;
}
