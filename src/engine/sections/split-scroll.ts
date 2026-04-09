import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { sectionLabel, t, pickVariant, SPACING_MAP } from './utils.js';

/**
 * Split Scroll — two columns scroll in opposite directions simultaneously.
 * Left scrolls down (services/features), right scrolls up (process/values).
 * Creates visual tension and ensures both sides get attention.
 * Adapted from modules/split-scroll.html.
 */
export function renderSplitScroll(
  brand: BrandCard,
  tokens: DesignTokens,
  data: { personality?: string } & Record<string, any> = {},
): string {
  const { copy } = brand;
  const layout = data.personality ? pickVariant(data.personality) : 'cinematic';
  const sp = SPACING_MAP[tokens.spacing];
  const services = copy.services ?? [];

  if (services.length < 2) return '';

  const sid = `ss_${Math.random().toString(36).slice(2, 7)}`;

  const isBrutalist = layout === 'brutalist' || layout === 'tech';
  const isEditorial  = layout === 'editorial' || layout === 'deco' || layout === 'minimal';

  // Left column items (services)
  const leftItems = services.slice(0, 4);
  // Right column items — process steps or brand values
  const rightLabels = [
    t('label.our_story', brand.language),
    t('label.services', brand.language),
    t('label.testimonials', brand.language),
    t('label.get_in_touch', brand.language),
  ];

  // Background tones for alternating panels
  const leftBgs = [
    tokens.surface,
    `color-mix(in srgb, ${tokens.accent} 8%, ${tokens.bg})`,
    tokens.bg,
    `color-mix(in srgb, ${tokens.surface} 50%, ${tokens.bg})`,
  ];
  const rightBgs = [
    tokens.bg,
    tokens.surface,
    `color-mix(in srgb, ${tokens.accent} 5%, ${tokens.surface})`,
    tokens.bg,
  ];

  const fontSize = isBrutalist ? 'clamp(1.5rem,3vw,2.25rem)' : 'clamp(1.25rem,2.5vw,1.875rem)';
  const fontWeight = isBrutalist ? '900' : isEditorial ? '300' : '700';
  const fontStyle = isEditorial ? 'italic' : 'normal';
  const dividerColor = isBrutalist ? tokens.accent : `${tokens.muted}20`;

  const leftPanels = leftItems.map((svc, i) => `
    <div style="
      height:100dvh;
      display:flex;flex-direction:column;
      align-items:center;justify-content:center;
      padding:3rem 2.5rem;
      text-align:center;
      background:${leftBgs[i % leftBgs.length]};
    ">
      <div style="font-size:0.6rem;letter-spacing:0.18em;text-transform:uppercase;color:${tokens.accent};margin-bottom:1rem;font-weight:600;">${String(i + 1).padStart(2,'0')}</div>
      <h3 style="font-family:'${tokens.displayFont}',serif;font-size:${fontSize};font-weight:${fontWeight};font-style:${fontStyle};color:${tokens.text};letter-spacing:-0.03em;margin-bottom:0.75rem;line-height:1.1;">${svc}</h3>
      <p style="font-size:0.875rem;color:${tokens.muted};line-height:1.7;max-width:28ch;">${copy.description ?? ''}</p>
    </div>`).join('');

  const rightPanels = rightLabels.map((label, i) => `
    <div style="
      height:100dvh;
      display:flex;flex-direction:column;
      align-items:center;justify-content:center;
      padding:3rem 2.5rem;
      text-align:center;
      background:${rightBgs[i % rightBgs.length]};
    ">
      <div style="font-size:0.6rem;letter-spacing:0.18em;text-transform:uppercase;color:${tokens.muted};margin-bottom:1rem;">${label}</div>
      <h3 style="font-family:'${tokens.displayFont}',serif;font-size:${fontSize};font-weight:${fontWeight};font-style:${fontStyle};color:${tokens.text};letter-spacing:-0.03em;margin-bottom:0.75rem;line-height:1.1;">${services[i] ?? brand.name ?? ''}</h3>
      <p style="font-size:0.875rem;color:${tokens.muted};line-height:1.7;max-width:28ch;">${copy.tagline ?? ''}</p>
    </div>`).join('');

  return `
<section id="services" style="background:${tokens.bg};position:relative;">
  <!-- Section header -->
  <div style="padding:${sp.section};padding-bottom:0;text-align:center;">
    ${sectionLabel(tokens, t('label.services', brand.language))}
    <h2 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(1.75rem,4vw,2.75rem);font-weight:${fontWeight};font-style:${fontStyle};color:${tokens.text};letter-spacing:-0.04em;">${copy.heroLine ?? copy.tagline ?? ''}</h2>
  </div>

  <!-- Split scroll container — 400vh to allow scroll range -->
  <div id="${sid}-driver" style="height:400vh;position:relative;">
    <div id="${sid}-sticky" style="position:sticky;top:0;height:100dvh;display:flex;overflow:hidden;">

      <!-- Left column — scrolls down -->
      <div style="flex:1;overflow:hidden;position:relative;">
        <div id="${sid}-left" style="position:absolute;left:0;right:0;will-change:transform;">
          ${leftPanels}
        </div>
      </div>

      <!-- Divider -->
      <div style="width:1px;background:${dividerColor};flex-shrink:0;"></div>

      <!-- Right column — scrolls up (starts at bottom) -->
      <div style="flex:1;overflow:hidden;position:relative;">
        <div id="${sid}-right" style="position:absolute;left:0;right:0;will-change:transform;">
          ${rightPanels}
        </div>
      </div>

    </div>
  </div>
</section>
<script>
(function(){
  var driver = document.getElementById('${sid}-driver');
  var leftCol  = document.getElementById('${sid}-left');
  var rightCol = document.getElementById('${sid}-right');
  if (!driver || !leftCol || !rightCol) return;

  var count = 4;
  var itemH = window.innerHeight;

  // Position right column at bottom to start
  rightCol.style.transform = 'translateY(-' + ((count - 1) * itemH) + 'px)';

  function onScroll() {
    var rect = driver.getBoundingClientRect();
    var driverH = driver.offsetHeight;
    var scrolled = Math.max(0, -rect.top);
    var maxScroll = driverH - window.innerHeight;
    var progress = Math.min(1, scrolled / maxScroll);
    var offset = progress * (count - 1) * itemH;

    leftCol.style.transform  = 'translateY(-' + offset + 'px)';
    rightCol.style.transform = 'translateY(-' + ((count - 1) * itemH - offset) + 'px)';
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
</script>`;
}
