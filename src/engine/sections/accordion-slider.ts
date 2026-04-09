import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { sectionLabel, RADIUS_MAP, t, pickVariant, reveal } from './utils.js';

/**
 * Accordion Image Slider — panels expand on hover to reveal title + description.
 * Great for services, portfolio items, or process steps with images.
 * Adapted from modules/accordion-slider.html.
 */
export function renderAccordionSlider(
  brand: BrandCard,
  tokens: DesignTokens,
  data: { images?: string[]; personality?: string } & Record<string, any> = {},
): string {
  const { copy } = brand;
  const services = copy.services ?? [];
  const images = data.images ?? [];
  const r = RADIUS_MAP[tokens.radius];
  const layout = data.personality ? pickVariant(data.personality) : 'cinematic';

  // Build panel backgrounds — use provided images or gradient fallbacks
  const gradients = [
    `linear-gradient(135deg,${tokens.surface},${tokens.bg})`,
    `linear-gradient(135deg,${tokens.accent}22,${tokens.bg})`,
    `linear-gradient(135deg,${tokens.surface2 ?? tokens.surface},${tokens.accent}15)`,
    `linear-gradient(135deg,${tokens.bg},${tokens.accent}18)`,
    `linear-gradient(135deg,${tokens.accent}15,${tokens.surface})`,
  ];

  const panelItems = services.slice(0, 5).map((svc, i) => {
    const bg = images[i]
      ? `url('${images[i]}') center/cover`
      : gradients[i % gradients.length];
    return { svc, bg, i };
  });

  if (panelItems.length < 2) return '';

  const id = `acc${Math.random().toString(36).slice(2, 7)}`;

  // ── BRUTALIST / TECH — vertical variant, bold borders ─────────────────────
  if (layout === 'brutalist' || layout === 'tech') {
    const panels = panelItems.map(({ svc, bg, i }) => `
      <div class="${id}-vpanel" style="
        height:60px;border-radius:${r === '0' ? '0' : '10px'};overflow:hidden;
        position:relative;cursor:pointer;
        transition:height 0.5s cubic-bezier(.16,1,.3,1);
        border:2px solid ${tokens.muted}20;
      ">
        <div style="position:absolute;inset:0;background:${bg};transition:transform 0.5s;"></div>
        <div style="position:absolute;inset:0;background:linear-gradient(to right,${tokens.bg}cc 0%,${tokens.bg}55 50%,transparent 80%);"></div>
        <div class="${id}-collapsed" style="position:absolute;top:50%;left:1.5rem;transform:translateY(-50%);font-size:0.85rem;font-weight:700;color:${tokens.text};letter-spacing:0.06em;text-transform:uppercase;transition:opacity 0.3s;z-index:2;">
          <span style="color:${tokens.accent};margin-right:0.75rem;">${String(i + 1).padStart(2, '0')}</span>${svc}
        </div>
        <div class="${id}-expanded" style="position:absolute;bottom:1.5rem;left:1.5rem;z-index:2;opacity:0;transform:translateY(10px);transition:all 0.4s cubic-bezier(.16,1,.3,1) 0.1s;">
          <h3 style="font-family:'${tokens.displayFont}',serif;font-size:1.4rem;font-weight:900;color:${tokens.text};text-transform:uppercase;letter-spacing:-0.02em;margin-bottom:0.35rem;">${svc}</h3>
          <p style="font-size:0.8rem;color:${tokens.muted};line-height:1.6;max-width:42ch;">${t('services.desc', brand.language)}</p>
        </div>
      </div>`).join('');

    return `
<section id="services" style="padding:clamp(4rem,8vw,7rem) 0;background:${tokens.bg};border-top:4px solid ${tokens.accent};">
  <div style="max-width:900px;margin:0 auto;padding:0 clamp(1.5rem,4vw,3.5rem);">
    ${reveal(`<h2 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(2rem,5vw,3.5rem);font-weight:900;color:${tokens.text};text-transform:uppercase;letter-spacing:-0.04em;margin-bottom:3rem;">${copy.heroLine}</h2>`, 'fadeUp', 0)}
    <div style="display:flex;flex-direction:column;gap:6px;">${panels}</div>
  </div>
</section>
${accordionScript(id, 'vertical', tokens)}`;
  }

  // ── EDITORIAL / MINIMAL — horizontal, refined typography ──────────────────
  if (layout === 'editorial' || layout === 'minimal' || layout === 'deco') {
    const panels = panelItems.map(({ svc, bg, i }) => `
      <div class="${id}-panel" style="
        flex:1;border-radius:${r};overflow:hidden;position:relative;cursor:pointer;
        transition:flex 0.6s cubic-bezier(.16,1,.3,1);
        border:1px solid ${tokens.muted}15;
      ">
        <div style="position:absolute;inset:0;background:${bg};transition:transform 0.6s cubic-bezier(.16,1,.3,1);"></div>
        <div style="position:absolute;inset:0;background:linear-gradient(to top,${tokens.bg}ee 0%,${tokens.bg}44 40%,transparent 65%);"></div>
        <div class="${id}-vtitle" style="position:absolute;bottom:1.75rem;left:1rem;font-size:0.7rem;font-weight:500;letter-spacing:0.1em;text-transform:uppercase;writing-mode:vertical-rl;color:${tokens.muted};z-index:2;transition:opacity 0.3s;">${svc}</div>
        <div class="${id}-content" style="position:absolute;bottom:0;left:0;right:0;padding:1.75rem 1.5rem;z-index:2;">
          <div style="font-size:0.7rem;letter-spacing:0.12em;text-transform:uppercase;color:${tokens.accent};margin-bottom:0.5rem;font-style:italic;opacity:0;transform:translateY(8px);transition:all 0.4s cubic-bezier(.16,1,.3,1) 0.1s;" class="${id}-num">${String(i + 1).padStart(2, '0')}</div>
          <h3 style="font-family:'${tokens.displayFont}',serif;font-size:1.25rem;font-weight:400;font-style:italic;color:${tokens.text};letter-spacing:-0.015em;margin-bottom:0.4rem;opacity:0;transform:translateY(10px);transition:all 0.4s cubic-bezier(.16,1,.3,1) 0.15s;" class="${id}-title">${svc}</h3>
          <p style="font-size:0.8rem;color:${tokens.muted};line-height:1.6;max-width:28ch;opacity:0;transform:translateY(10px);transition:all 0.4s cubic-bezier(.16,1,.3,1) 0.2s;" class="${id}-desc">${t('services.desc', brand.language)}</p>
        </div>
      </div>`).join('');

    return `
<section id="services" style="padding:clamp(4rem,8vw,7rem) 0;background:${tokens.bg};">
  <div style="max-width:1200px;margin:0 auto;padding:0 clamp(1.5rem,4vw,3.5rem);">
    ${reveal(`<div style="text-align:center;margin-bottom:3rem;">
      ${sectionLabel(tokens, t('label.services', brand.language))}
      <h2 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(1.75rem,4vw,2.75rem);font-weight:400;font-style:italic;color:${tokens.text};letter-spacing:-0.04em;">${copy.tagline}</h2>
    </div>`, 'fadeUp', 0)}
    <div style="display:flex;gap:8px;height:clamp(340px,55vh,520px);">${panels}</div>
  </div>
</section>
${accordionScript(id, 'horizontal', tokens)}`;
  }

  // ── DEFAULT / CINEMATIC — horizontal accordion, cinematic overlays ─────────
  const panels = panelItems.map(({ svc, bg, i }) => `
    <div class="${id}-panel${i === 0 ? ' active' : ''}" style="
      flex:${i === 0 ? '5' : '1'};border-radius:${r};overflow:hidden;position:relative;cursor:pointer;
      transition:flex 0.6s cubic-bezier(.16,1,.3,1);
    ">
      <div style="position:absolute;inset:0;background:${bg};transition:transform 0.6s cubic-bezier(.16,1,.3,1);"></div>
      <div style="position:absolute;inset:0;background:linear-gradient(to top,${tokens.bg}dd 0%,${tokens.bg}33 40%,transparent 65%);"></div>
      <div class="${id}-vtitle" style="position:absolute;bottom:1.75rem;left:1rem;font-size:0.65rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;writing-mode:vertical-rl;color:${tokens.text}80;z-index:2;transition:opacity 0.3s;">${svc}</div>
      <div class="${id}-content" style="position:absolute;bottom:0;left:0;right:0;padding:2rem 1.75rem;z-index:2;">
        <div style="font-size:0.65rem;letter-spacing:0.12em;text-transform:uppercase;color:${tokens.accent};margin-bottom:0.5rem;opacity:0;transform:translateY(8px);transition:all 0.4s cubic-bezier(.16,1,.3,1) 0.1s;" class="${id}-num">${String(i + 1).padStart(2, '0')}</div>
        <h3 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(1.1rem,2.5vw,1.5rem);font-weight:700;color:${tokens.text};letter-spacing:-0.02em;margin-bottom:0.4rem;opacity:0;transform:translateY(10px);transition:all 0.4s cubic-bezier(.16,1,.3,1) 0.15s;" class="${id}-title">${svc}</h3>
        <p style="font-size:0.82rem;color:${tokens.muted};line-height:1.65;max-width:30ch;opacity:0;transform:translateY(10px);transition:all 0.4s cubic-bezier(.16,1,.3,1) 0.2s;" class="${id}-desc">${t('services.desc', brand.language)}</p>
      </div>
    </div>`).join('');

  return `
<section id="services" style="padding:clamp(4rem,8vw,7rem) 0;background:${tokens.bg};overflow:hidden;">
  <div style="max-width:1400px;margin:0 auto;padding:0 clamp(1.5rem,4vw,3.5rem);">
    ${reveal(`<div style="display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:1.5rem;margin-bottom:2.5rem;">
      <div>
        ${sectionLabel(tokens, t('label.services', brand.language))}
        <h2 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(1.75rem,4vw,2.75rem);font-weight:700;color:${tokens.text};letter-spacing:-0.04em;margin-top:0.5rem;">${copy.tagline}</h2>
      </div>
      <span style="font-size:0.75rem;color:${tokens.muted};letter-spacing:0.08em;">${t('label.services', brand.language)} — ${services.slice(0, 5).length}</span>
    </div>`, 'fadeUp', 0)}
    <div style="display:flex;gap:8px;height:clamp(340px,60vh,560px);">${panels}</div>
  </div>
</section>
${accordionScript(id, 'horizontal', tokens)}`;
}

function accordionScript(id: string, mode: 'horizontal' | 'vertical', tokens: DesignTokens): string {
  if (mode === 'vertical') {
    return `
<script>
(function(){
  var panels = document.querySelectorAll('.${id}-vpanel');
  function activate(panel) {
    panels.forEach(function(p) {
      p.style.height = '60px';
      var c = p.querySelector('.${id}-collapsed');
      var e = p.querySelector('.${id}-expanded');
      var bg = p.querySelector('div');
      if(c) c.style.opacity = '1';
      if(e){ e.style.opacity='0'; e.style.transform='translateY(10px)'; }
      if(bg) bg.style.transform = '';
    });
    panel.style.height = '240px';
    var c = panel.querySelector('.${id}-collapsed');
    var e = panel.querySelector('.${id}-expanded');
    var bg = panel.querySelector('div');
    if(c) c.style.opacity = '0';
    if(e){ e.style.opacity='1'; e.style.transform='translateY(0)'; }
    if(bg) bg.style.transform = 'scale(1.04)';
  }
  panels.forEach(function(p) {
    p.addEventListener('mouseenter', function(){ activate(p); });
    p.addEventListener('click', function(){ activate(p); });
  });
  if(panels[0]) activate(panels[0]);
})();
</script>`;
  }

  return `
<script>
(function(){
  var panels = document.querySelectorAll('.${id}-panel');
  function activate(panel) {
    panels.forEach(function(p) {
      p.style.flex = '1';
      var vt = p.querySelector('.${id}-vtitle');
      var num = p.querySelector('.${id}-num');
      var title = p.querySelector('.${id}-title');
      var desc = p.querySelector('.${id}-desc');
      var bg = p.querySelector('div');
      if(vt) vt.style.opacity = '1';
      if(num){ num.style.opacity='0'; num.style.transform='translateY(8px)'; }
      if(title){ title.style.opacity='0'; title.style.transform='translateY(10px)'; }
      if(desc){ desc.style.opacity='0'; desc.style.transform='translateY(10px)'; }
      if(bg) bg.style.transform = '';
      p.classList.remove('active');
    });
    panel.style.flex = '5';
    panel.classList.add('active');
    var vt = panel.querySelector('.${id}-vtitle');
    var num = panel.querySelector('.${id}-num');
    var title = panel.querySelector('.${id}-title');
    var desc = panel.querySelector('.${id}-desc');
    var bg = panel.querySelector('div');
    if(vt) vt.style.opacity = '0';
    if(num){ num.style.opacity='1'; num.style.transform='translateY(0)'; }
    if(title){ title.style.opacity='1'; title.style.transform='translateY(0)'; }
    if(desc){ desc.style.opacity='1'; desc.style.transform='translateY(0)'; }
    if(bg) bg.style.transform = 'scale(1.05)';
  }
  panels.forEach(function(p) {
    p.addEventListener('mouseenter', function(){ activate(p); });
    p.addEventListener('click', function(){ activate(p); });
  });
  if(panels[0]) activate(panels[0]);
})();
</script>`;
}
