import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { sectionLabel, t, pickVariant, RADIUS_MAP, reveal } from './utils.js';

export function renderStickyStack(
  brand: BrandCard,
  tokens: DesignTokens,
  data: { personality?: string } & Record<string, any> = {},
): string {
  const { copy } = brand;
  const services = copy.services ?? [];
  if (services.length < 2) return '';

  const layout = data.personality ? pickVariant(data.personality) : 'cinematic';
  const isBrutalist = layout === 'brutalist';
  const isEditorial = layout === 'editorial' || layout === 'deco';

  const radius = RADIUS_MAP[tokens.radius] ?? '1rem';
  const sectionBg = isEditorial ? tokens.surface : tokens.bg;

  const ssId = `ss_${Math.random().toString(36).slice(2, 7)}`;
  const items = services.slice(0, 4);

  // Right: scrolling feature cards
  const featureCards = items.map((s, i) => {
    const num = String(i + 1).padStart(2, '0');
    return `
<div class="${ssId}-card" data-feature="${i}" style="padding:2.5rem 2rem;border-radius:${radius};background:${tokens.surface};border:1px solid ${tokens.muted}20;opacity:${i === 0 ? '1' : '0.35'};transform:translateY(${i === 0 ? '0' : '10px'});transition:all .4s cubic-bezier(.16,1,.3,1);">
  <div style="font-size:0.75rem;font-weight:500;color:${tokens.accent};letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.75rem;">${num}</div>
  <h3 style="font-size:1.25rem;font-weight:${isBrutalist ? '700' : '600'};letter-spacing:-0.01em;margin-bottom:0.625rem;color:${tokens.text};text-transform:${isBrutalist ? 'uppercase' : 'none'};">${s}</h3>
  <p style="font-size:0.9rem;color:${tokens.muted};line-height:1.6;">${copy.description ?? ''}</p>
</div>`;
  }).join('');

  // Left: sticky visual panel — shows which feature is active
  const mockupStates = items.map((s, i) => `
<div class="${ssId}-state" data-state="${i}" style="position:absolute;inset:0;padding:2rem;display:flex;flex-direction:column;justify-content:center;opacity:${i === 0 ? '1' : '0'};transition:opacity .5s ease;">
  <div style="font-size:0.75rem;letter-spacing:0.1em;text-transform:uppercase;color:${tokens.muted};margin-bottom:1rem;">0${i + 1} / 0${items.length}</div>
  <div style="font-size:2.5rem;font-weight:700;color:${tokens.accent};letter-spacing:-0.03em;margin-bottom:0.5rem;">${String(i + 1).padStart(2, '0')}</div>
  <div style="font-size:1rem;font-weight:600;color:${tokens.text};margin-bottom:0.5rem;">${s}</div>
  <div style="height:4px;border-radius:2px;background:${tokens.muted}20;margin-top:1.5rem;overflow:hidden;">
    <div style="height:100%;width:${Math.round(((i + 1) / items.length) * 100)}%;background:${tokens.accent};border-radius:2px;"></div>
  </div>
</div>`).join('');

  return `
<section style="padding:5rem 2rem;background:${sectionBg};" id="services">
  <div style="max-width:68rem;margin:0 auto;">
    ${reveal(sectionLabel(tokens, t('services.label', brand.language)), 'fadeUp', 0)}
    ${reveal(`<h2 style="font-size:clamp(1.75rem,3.5vw,2.75rem);font-weight:${isBrutalist ? '900' : '600'};color:${tokens.text};margin-bottom:3rem;letter-spacing:-0.02em;text-transform:${isBrutalist ? 'uppercase' : 'none'};font-style:${isEditorial ? 'italic' : 'normal'};">${copy.tagline}</h2>`, 'fadeUp', 100)}

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:start;">
      <!-- Sticky left panel -->
      <div style="position:sticky;top:7rem;height:fit-content;">
        <div style="background:${tokens.surface};border:1px solid ${tokens.muted}20;border-radius:${radius};overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.08);">
          <div style="height:2.5rem;background:${tokens.surface2 ?? tokens.bg};border-bottom:1px solid ${tokens.muted}15;display:flex;align-items:center;padding:0 1rem;gap:0.4rem;">
            <div style="width:0.6rem;height:0.6rem;border-radius:50%;background:${tokens.muted}40;"></div>
            <div style="width:0.6rem;height:0.6rem;border-radius:50%;background:${tokens.muted}40;"></div>
            <div style="width:0.6rem;height:0.6rem;border-radius:50%;background:${tokens.muted}40;"></div>
          </div>
          <div style="position:relative;min-height:16rem;" id="${ssId}-mockup">
            ${mockupStates}
          </div>
        </div>
      </div>

      <!-- Scrolling features -->
      <div style="display:flex;flex-direction:column;gap:3rem;padding:2.5rem 0;" id="${ssId}-features">
        ${featureCards}
      </div>
    </div>
  </div>
</section>
<script>
(function(){
  var cards=document.querySelectorAll('.${ssId}-card');
  var states=document.querySelectorAll('.${ssId}-state');
  if(!cards.length||!('IntersectionObserver' in window))return;

  function activate(idx){
    cards.forEach(function(c,i){
      var active=i===idx;
      c.style.opacity=active?'1':'0.35';
      c.style.transform=active?'translateY(0)':'translateY(10px)';
      c.style.borderColor=active?'${tokens.accent}':'${tokens.muted}20';
    });
    states.forEach(function(s,i){
      s.style.opacity=i===idx?'1':'0';
    });
  }

  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        activate(parseInt(e.target.dataset.feature,10));
      }
    });
  },{threshold:0.5,rootMargin:'0px 0px -30% 0px'});

  cards.forEach(function(c){io.observe(c);});
})();
</script>`;
}
