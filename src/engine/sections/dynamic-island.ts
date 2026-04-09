import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { sectionLabel, t, pickVariant, SPACING_MAP, RADIUS_MAP, reveal, btn } from './utils.js';

/**
 * Dynamic Island — pill-shaped notification element that morphs to show different content.
 * Used as a hero announcement bar or interactive CTA element.
 * Adapted from modules/dynamic-island.html.
 */
export function renderDynamicIsland(
  brand: BrandCard,
  tokens: DesignTokens,
  data: { personality?: string } & Record<string, any> = {},
): string {
  const { copy } = brand;
  const layout = data.personality ? pickVariant(data.personality) : 'cinematic';
  const sp = SPACING_MAP[tokens.spacing];

  const sid = `di_${Math.random().toString(36).slice(2, 7)}`;

  const isBrutalist = layout === 'brutalist' || layout === 'tech';
  const isEditorial  = layout === 'editorial' || layout === 'deco';

  const fontWeight = isBrutalist ? '900' : isEditorial ? '300' : '700';
  const fontStyle  = isEditorial ? 'italic' : 'normal';

  const services = copy.services ?? [];

  // States to cycle through
  const states = [
    { label: brand.name,          text: copy.tagline ?? copy.heroLine ?? '', icon: '◈' },
    { label: t('label.services', brand.language), text: services[0] ?? '', icon: '◉' },
    { label: t('label.get_in_touch', brand.language), text: copy.description ?? '', icon: '→' },
    { label: brand.name,          text: services[1] ?? copy.tagline ?? '', icon: '✦' },
  ];

  const islandBg = tokens.bg === '#ffffff' || tokens.bg.startsWith('#f') ? '#0a0a0b' : tokens.bg;
  const islandText = tokens.bg === '#ffffff' || tokens.bg.startsWith('#f') ? '#eae7e2' : tokens.text;

  return `
<section id="hero-island" style="padding:${sp.section};background:${tokens.bg};position:relative;overflow:hidden;text-align:center;">
  <!-- Background -->
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse 60% 40% at 50% 50%, ${tokens.accent}06, transparent);pointer-events:none;"></div>

  <div style="max-width:800px;margin:0 auto;padding:0 clamp(1.5rem,4vw,3rem);position:relative;z-index:1;">
    <!-- Dynamic Island element -->
    <div style="display:flex;justify-content:center;margin-bottom:3rem;">
      <div
        id="${sid}-island"
        style="
          background:${islandBg};
          border-radius:999px;
          padding:0.6rem 1.25rem;
          display:flex;align-items:center;gap:0.75rem;
          cursor:pointer;
          transition:all 0.5s cubic-bezier(.16,1,.3,1);
          max-width:80vw;
          overflow:hidden;
          border:1px solid ${tokens.muted}15;
          box-shadow:0 4px 24px rgba(0,0,0,0.15);
          position:relative;
        "
      >
        <div id="${sid}-icon" style="
          width:1.75rem;height:1.75rem;border-radius:50%;
          background:${tokens.accent};
          display:flex;align-items:center;justify-content:center;
          font-size:0.75rem;color:#fff;
          flex-shrink:0;
          transition:transform 0.3s;
        ">${states[0]?.icon ?? '◈'}</div>

        <div id="${sid}-content" style="display:flex;flex-direction:column;gap:0.1rem;overflow:hidden;transition:all 0.4s;">
          <span id="${sid}-label" style="font-size:0.6rem;letter-spacing:0.12em;text-transform:uppercase;color:${tokens.accent};font-weight:600;white-space:nowrap;">${states[0]?.label ?? ''}</span>
          <span id="${sid}-text"  style="font-size:0.8rem;color:${islandText};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:280px;">${states[0]?.text?.slice(0,50) ?? ''}</span>
        </div>

        <div style="width:1px;height:1.25rem;background:${tokens.muted}20;flex-shrink:0;"></div>
        <span style="font-size:0.7rem;color:${tokens.muted};flex-shrink:0;">tap</span>
      </div>
    </div>

    <!-- Hero content -->
    ${reveal(`<div>
      <h1 style="
        font-family:'${tokens.displayFont}',serif;
        font-size:clamp(2.5rem,6vw,5rem);
        font-weight:${fontWeight};
        font-style:${fontStyle};
        color:${tokens.text};
        letter-spacing:-0.04em;
        line-height:1.05;
        margin-bottom:1.25rem;
      ">${copy.heroLine ?? copy.tagline ?? brand.name}</h1>
      <p style="font-size:1.05rem;color:${tokens.muted};max-width:50ch;margin:0 auto 2.5rem;line-height:1.8;">${copy.description ?? ''}</p>
      <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">
        ${btn(tokens, 'primary', t('hero.explore', brand.language), '#services')}
        ${btn(tokens, 'ghost', t('hero.nav_contact', brand.language), '#contact')}
      </div>
    </div>`, 'fadeUp', 100)}
  </div>
</section>
<script>
(function(){
  var island  = document.getElementById('${sid}-island');
  var icon    = document.getElementById('${sid}-icon');
  var label   = document.getElementById('${sid}-label');
  var text    = document.getElementById('${sid}-text');
  if (!island || !icon || !label || !text) return;

  var states  = ${JSON.stringify(states)};
  var current = 0;
  var isExpanded = false;

  function nextState() {
    current = (current + 1) % states.length;
    var s = states[current];
    icon.textContent  = s.icon;
    label.textContent = s.label;
    text.textContent  = (s.text ?? '').slice(0, 50);
    // Quick scale bounce on icon
    icon.style.transform = 'scale(1.3)';
    setTimeout(function() { icon.style.transform = 'scale(1)'; }, 200);
  }

  // Toggle expanded on click
  island.addEventListener('click', function() {
    isExpanded = !isExpanded;
    if (isExpanded) {
      island.style.borderRadius = '1.25rem';
      island.style.padding = '1rem 1.5rem';
      island.style.gap = '1rem';
      text.style.whiteSpace = 'normal';
      text.style.maxWidth = '360px';
    } else {
      island.style.borderRadius = '999px';
      island.style.padding = '0.6rem 1.25rem';
      island.style.gap = '0.75rem';
      text.style.whiteSpace = 'nowrap';
      text.style.maxWidth = '280px';
      nextState();
    }
  });

  // Auto-cycle every 3s
  setInterval(function() {
    if (!isExpanded) nextState();
  }, 3000);
})();
</script>`;
}
