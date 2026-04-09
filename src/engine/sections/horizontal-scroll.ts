import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { sectionLabel, RADIUS_MAP, t, pickVariant, reveal } from './utils.js';

/**
 * Horizontal Scroll — vertical scroll translates into a horizontal pan of cards.
 * Great for services, portfolio items, or process steps.
 * Pure CSS/JS implementation (no GSAP dependency).
 * Adapted from modules/horizontal-scroll.html.
 */
export function renderHorizontalScroll(
  brand: BrandCard,
  tokens: DesignTokens,
  data: { images?: string[]; personality?: string } & Record<string, any> = {},
): string {
  const { copy } = brand;
  const services = copy.services ?? [];
  if (services.length < 3) return '';

  const r = RADIUS_MAP[tokens.radius];
  const layout = data.personality ? pickVariant(data.personality) : 'cinematic';
  const images = data.images ?? [];
  const id = `hs${Math.random().toString(36).slice(2, 7)}`;

  const items = services.slice(0, 6);

  // Card backgrounds
  const gradients = [
    `linear-gradient(135deg,${tokens.surface},${tokens.bg})`,
    `linear-gradient(135deg,${tokens.accent}22,${tokens.surface})`,
    `linear-gradient(135deg,${tokens.surface2 ?? tokens.surface},${tokens.accent}15)`,
    `linear-gradient(135deg,${tokens.bg},${tokens.accent}18)`,
    `linear-gradient(135deg,${tokens.accent}15,${tokens.surface})`,
    `linear-gradient(135deg,${tokens.surface},${tokens.accent}22)`,
  ];

  // ── BRUTALIST ────────────────────────────────────────────────────────────────
  const cardStyle = layout === 'brutalist' || layout === 'tech'
    ? (svc: string, i: number) => {
        const bg = images[i] ? `url('${images[i]}') center/cover` : gradients[i % gradients.length];
        return `
        <div style="
          flex-shrink:0;width:clamp(280px,38vw,420px);height:62vh;
          border-radius:0;overflow:hidden;position:relative;
          border:2px solid ${tokens.muted}25;
          border-top:${i === 0 ? `4px solid ${tokens.accent}` : `2px solid ${tokens.muted}25`};
          display:flex;flex-direction:column;justify-content:flex-end;padding:2rem;cursor:default;
          transition:transform 0.3s cubic-bezier(.16,1,.3,1);
        " onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform=''"
        >
          <div style="position:absolute;inset:0;background:${bg};z-index:0;transition:transform 0.5s ease;"></div>
          <div style="position:absolute;inset:0;background:linear-gradient(to top,${tokens.bg}dd 0%,${tokens.bg}44 50%,transparent 80%);z-index:1;"></div>
          <div style="position:relative;z-index:2;">
            <div style="font-size:0.7rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${tokens.accent};margin-bottom:0.5rem;">${String(i + 1).padStart(2, '0')}</div>
            <h3 style="font-family:'${tokens.displayFont}',serif;font-size:1.3rem;font-weight:900;text-transform:uppercase;letter-spacing:0.02em;color:${tokens.text};margin-bottom:0.35rem;">${svc}</h3>
            <p style="font-size:0.8rem;color:${tokens.muted};line-height:1.5;max-width:30ch;">${copy.description.split('.')[0]}.</p>
          </div>
        </div>`;
      }
    : layout === 'editorial' || layout === 'minimal' || layout === 'deco'
    ? (svc: string, i: number) => {
        const bg = images[i] ? `url('${images[i]}') center/cover` : gradients[i % gradients.length];
        return `
        <div style="
          flex-shrink:0;width:clamp(280px,35vw,400px);height:62vh;
          border-radius:${r};overflow:hidden;position:relative;
          border:1px solid ${tokens.muted}18;
          display:flex;flex-direction:column;justify-content:flex-end;padding:2rem;cursor:default;
          transition:transform 0.3s cubic-bezier(.16,1,.3,1);
        " onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform=''"
        >
          <div style="position:absolute;inset:0;background:${bg};z-index:0;"></div>
          <div style="position:absolute;inset:0;background:linear-gradient(to top,${tokens.bg}ee 0%,${tokens.bg}55 40%,transparent 70%);z-index:1;"></div>
          <div style="position:relative;z-index:2;">
            <div style="font-size:0.65rem;font-style:italic;letter-spacing:0.1em;text-transform:uppercase;color:${tokens.accent};margin-bottom:0.4rem;">${String(i + 1).padStart(2, '0')}</div>
            <h3 style="font-family:'${tokens.displayFont}',serif;font-size:1.2rem;font-weight:400;font-style:italic;color:${tokens.text};margin-bottom:0.35rem;">${svc}</h3>
            <p style="font-size:0.78rem;color:${tokens.muted};line-height:1.5;max-width:30ch;">${copy.description.split('.')[0]}.</p>
          </div>
        </div>`;
      }
    : (svc: string, i: number) => {
        // cinematic default
        const bg = images[i] ? `url('${images[i]}') center/cover` : gradients[i % gradients.length];
        return `
        <div style="
          flex-shrink:0;width:clamp(300px,40vw,500px);height:65vh;
          border-radius:${r};overflow:hidden;position:relative;
          border:1px solid ${tokens.muted}20;
          display:flex;flex-direction:column;justify-content:flex-end;padding:2rem;cursor:default;
          transition:transform 0.3s cubic-bezier(.16,1,.3,1);
        " onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform=''"
        >
          <div style="position:absolute;inset:0;background:${bg};z-index:0;transition:transform 0.5s ease;" class="${id}-bg"></div>
          <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.85) 0%,rgba(0,0,0,0.3) 40%,transparent 70%);z-index:1;"></div>
          <div style="position:relative;z-index:2;">
            <div style="font-size:0.65rem;letter-spacing:0.12em;text-transform:uppercase;color:${tokens.accent};margin-bottom:0.5rem;font-weight:400;">${String(i + 1).padStart(2, '0')} / ${t('label.services', brand.language)}</div>
            <h3 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(1.1rem,2.5vw,1.5rem);font-weight:600;letter-spacing:-0.015em;color:${tokens.text};margin-bottom:0.35rem;">${svc}</h3>
            <p style="font-size:0.82rem;color:${tokens.muted};line-height:1.5;max-width:32ch;">${copy.description.split('.')[0]}.</p>
          </div>
        </div>`;
      };

  const cards = items.map((svc, i) => cardStyle(svc, i)).join('');

  const borderTop = layout === 'brutalist' || layout === 'tech'
    ? `border-top:4px solid ${tokens.accent};`
    : '';

  const heading = layout === 'editorial' || layout === 'minimal'
    ? `<div style="text-align:center;margin-bottom:3rem;">
        ${sectionLabel(tokens, t('label.services', brand.language))}
        <h2 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(1.75rem,4vw,2.75rem);font-weight:400;font-style:italic;color:${tokens.text};margin-top:0.5rem;">${copy.tagline}</h2>
      </div>`
    : layout === 'brutalist' || layout === 'tech'
    ? `<h2 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(2rem,5vw,3.5rem);font-weight:900;text-transform:uppercase;letter-spacing:-0.04em;color:${tokens.text};margin-bottom:3rem;">${copy.heroLine}</h2>`
    : `<div style="display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:1.5rem;margin-bottom:2.5rem;">
        <div>
          ${sectionLabel(tokens, t('label.services', brand.language))}
          <h2 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(1.75rem,4vw,2.75rem);font-weight:700;letter-spacing:-0.04em;color:${tokens.text};margin-top:0.5rem;">${copy.tagline}</h2>
        </div>
        <p style="font-size:0.85rem;color:${tokens.muted};max-width:30ch;line-height:1.6;">${t('scroll.hint', brand.language)}</p>
      </div>`;

  return `
<section id="services" style="padding:clamp(4rem,8vw,7rem) 0;background:${tokens.bg};${borderTop}overflow:hidden;">
  <div style="max-width:1400px;margin:0 auto;padding:0 clamp(1.5rem,4vw,3.5rem);">
    ${reveal(heading, 'fadeUp', 0)}
  </div>
  <!-- Scrollable track -->
  <div id="${id}-wrap" style="overflow-x:auto;overflow-y:visible;-webkit-overflow-scrolling:touch;scrollbar-width:none;cursor:grab;">
    <div style="display:flex;gap:16px;padding:0 clamp(1.5rem,4vw,3.5rem) 2rem;width:max-content;">
      ${cards}
    </div>
  </div>
  <!-- Progress indicator -->
  <div style="max-width:1400px;margin:1.5rem auto 0;padding:0 clamp(1.5rem,4vw,3.5rem);display:flex;align-items:center;gap:1rem;">
    <div style="flex:1;height:1px;background:${tokens.muted}20;border-radius:1px;overflow:hidden;">
      <div id="${id}-fill" style="height:100%;background:${tokens.accent};width:0%;transition:width 0.1s;border-radius:1px;"></div>
    </div>
    <span id="${id}-label" style="font-size:0.7rem;color:${tokens.muted};letter-spacing:0.08em;flex-shrink:0;">1 / ${items.length}</span>
  </div>
</section>
${horizontalScrollScript(id, items.length)}`;
}

function horizontalScrollScript(id: string, count: number): string {
  return `
<script>
(function(){
  var wrap = document.getElementById('${id}-wrap');
  var fill = document.getElementById('${id}-fill');
  var label = document.getElementById('${id}-label');
  if (!wrap) return;

  // Drag-to-scroll
  var isDown = false, startX = 0, scrollLeft = 0;
  wrap.addEventListener('mousedown', function(e) {
    isDown = true; wrap.style.cursor = 'grabbing';
    startX = e.pageX - wrap.offsetLeft;
    scrollLeft = wrap.scrollLeft;
  });
  wrap.addEventListener('mouseleave', function() { isDown = false; wrap.style.cursor = 'grab'; });
  wrap.addEventListener('mouseup', function() { isDown = false; wrap.style.cursor = 'grab'; });
  wrap.addEventListener('mousemove', function(e) {
    if (!isDown) return;
    e.preventDefault();
    var x = e.pageX - wrap.offsetLeft;
    wrap.scrollLeft = scrollLeft - (x - startX) * 1.5;
  });

  // Progress bar
  wrap.addEventListener('scroll', function() {
    var max = wrap.scrollWidth - wrap.clientWidth;
    var p = max > 0 ? wrap.scrollLeft / max : 0;
    if (fill) fill.style.width = (p * 100) + '%';
    if (label) label.textContent = (Math.min(Math.ceil(p * ${count} + 0.5), ${count})) + ' / ${count}';
  });
})();
</script>`;
}
