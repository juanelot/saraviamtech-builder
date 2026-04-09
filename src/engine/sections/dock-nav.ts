import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { t, pickVariant, RADIUS_MAP } from './utils.js';

/**
 * Dock Nav — macOS Dock-style floating navigation with icon magnification on hover.
 * Replaces or enhances the default top navbar with a floating dock at the bottom/top.
 * Adapted from modules/dock-nav.html.
 */
export function renderDockNav(
  brand: BrandCard,
  tokens: DesignTokens,
  data: { personality?: string } & Record<string, any> = {},
): string {
  const layout = data.personality ? pickVariant(data.personality) : 'cinematic';
  const r = RADIUS_MAP[tokens.radius];

  const sid = `dn_${Math.random().toString(36).slice(2, 7)}`;

  const isBrutalist = layout === 'brutalist' || layout === 'tech';

  // Nav items
  const navItems = [
    { label: brand.name.split(' ')[0] ?? 'Home', icon: '⌂', href: '#top' },
    { label: t('hero.nav_services', brand.language), icon: '◈', href: '#services' },
    { label: t('label.gallery', brand.language),  icon: '◉', href: '#gallery' },
    { label: t('label.our_story', brand.language), icon: '◎', href: '#about' },
    { label: t('hero.nav_contact', brand.language), icon: '→', href: '#contact' },
  ];

  const dockBg = `${tokens.surface}e0`;
  const iconBg = tokens.bg;
  const borderColor = `${tokens.muted}20`;

  const items = navItems.map((item, i) => `
    <a
      class="${sid}-item"
      href="${item.href}"
      data-label="${item.label}"
      style="
        display:flex;flex-direction:column;
        align-items:center;justify-content:center;
        width:3rem;height:3rem;
        background:${iconBg};
        border-radius:${r === '0' ? '0.5rem' : r};
        border:1px solid ${borderColor};
        text-decoration:none;
        color:${tokens.muted};
        font-size:1.1rem;
        transition:transform 0.3s cubic-bezier(.16,1,.3,1), box-shadow 0.3s, color 0.2s;
        position:relative;
        will-change:transform;
        flex-shrink:0;
      "
      onmouseover="this.style.color='${tokens.accent}'"
      onmouseout="this.style.color='${tokens.muted}'"
    >
      <span style="line-height:1;">${item.icon}</span>

      <!-- Tooltip label -->
      <span style="
        position:absolute;
        bottom:calc(100% + 0.6rem);
        left:50%;transform:translateX(-50%);
        background:${tokens.surface};
        border:1px solid ${borderColor};
        color:${tokens.text};
        font-size:0.65rem;
        font-family:inherit;
        font-weight:500;
        letter-spacing:0.03em;
        padding:0.3rem 0.6rem;
        border-radius:${r === '0' ? '4px' : '6px'};
        white-space:nowrap;
        opacity:0;
        transition:opacity 0.2s, transform 0.2s;
        transform:translateX(-50%) translateY(4px);
        pointer-events:none;
      " class="${sid}-tooltip">${item.label}</span>
    </a>`).join('');

  return `
<!-- Dock Navigation -->
<nav id="${sid}-dock" style="
  position:fixed;
  bottom:1.75rem;
  left:50%;transform:translateX(-50%);
  z-index:9000;
  background:${dockBg};
  backdrop-filter:blur(16px);
  -webkit-backdrop-filter:blur(16px);
  border:1px solid ${borderColor};
  border-radius:${r === '0' ? '0.75rem' : '1.25rem'};
  padding:0.625rem;
  display:flex;
  align-items:flex-end;
  gap:0.5rem;
  box-shadow:0 8px 32px rgba(0,0,0,0.18),0 2px 8px rgba(0,0,0,0.08);
  ${isBrutalist ? `border:2px solid ${tokens.accent};` : ''}
">
  ${items}
</nav>
<script>
(function(){
  var dock  = document.getElementById('${sid}-dock');
  var items = dock ? dock.querySelectorAll('.${sid}-item') : [];
  var tips  = dock ? dock.querySelectorAll('.${sid}-tooltip') : [];
  if (!dock || !items.length) return;

  var BASE  = 48; // px — resting size
  var MAX   = 72; // px — hovered size
  var RANGE = 2;  // neighbor range for magnification

  items.forEach(function(item, idx) {
    var tip = tips[idx];

    item.addEventListener('mouseenter', function() {
      if (tip) { tip.style.opacity = '1'; tip.style.transform = 'translateX(-50%) translateY(0)'; }
    });
    item.addEventListener('mouseleave', function() {
      if (tip) { tip.style.opacity = '0'; tip.style.transform = 'translateX(-50%) translateY(4px)'; }
    });
  });

  dock.addEventListener('mousemove', function(e) {
    var dRect = dock.getBoundingClientRect();
    var mx = e.clientX;

    items.forEach(function(item, i) {
      var iRect = item.getBoundingClientRect();
      var cx    = iRect.left + iRect.width / 2;
      var dist  = Math.abs(mx - cx);
      var maxDist = BASE * (RANGE + 1);
      var scale = dist < maxDist
        ? 1 + ((MAX - BASE) / BASE) * Math.pow(1 - dist / maxDist, 2)
        : 1;
      item.style.transform = 'scale(' + scale + ')';
      item.style.transformOrigin = 'bottom center';
    });
  });

  dock.addEventListener('mouseleave', function() {
    items.forEach(function(item) {
      item.style.transform = 'scale(1)';
    });
  });
})();
</script>`;
}
