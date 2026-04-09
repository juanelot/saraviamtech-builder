import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { sectionLabel, t, pickVariant, RADIUS_MAP, reveal } from './utils.js';

export function renderOdometer(
  brand: BrandCard,
  tokens: DesignTokens,
  data: { personality?: string } & Record<string, any> = {},
): string {
  const { copy } = brand;
  const layout = data.personality ? pickVariant(data.personality) : 'cinematic';
  const isBrutalist = layout === 'brutalist' || layout === 'tech';
  const isEditorial = layout === 'editorial' || layout === 'deco';

  const radius = RADIUS_MAP[tokens.radius] ?? '1.25rem';
  const sectionBg = isEditorial ? tokens.surface : tokens.bg;

  const odoId = `odo_${Math.random().toString(36).slice(2, 7)}`;

  // Extract stats from data or generate sensible defaults
  const statsRaw: Array<{ value: string; suffix: string; label: string }> = data.stats
    ? (data.stats as any[]).slice(0, 4).map((s: any) => ({
        value: String(s.value ?? '99'),
        suffix: String(s.suffix ?? '%'),
        label: String(s.label ?? s),
      }))
    : [
        { value: '500', suffix: '+', label: t('stats.projects', brand.language) },
        { value: '98', suffix: '%', label: t('stats.satisfaction', brand.language) },
        { value: '10', suffix: '+', label: t('stats.years', brand.language) },
        { value: '24', suffix: '/7', label: t('stats.support', brand.language) },
      ];

  const fontFamily = isBrutalist ? `'${tokens.displayFont}',serif` : `'${tokens.bodyFont}',monospace`;

  const statCards = statsRaw.map((stat) => {
    const digits = stat.value.replace(/\D/g, '').split('');
    const digitHtml = digits.map(() => `
<div class="${odoId}-digit" style="display:inline-block;overflow:hidden;height:1.15em;position:relative;vertical-align:top;">
  <div class="${odoId}-strip" style="display:flex;flex-direction:column;transition:transform 1.5s cubic-bezier(.16,1,.3,1);">
    ${[0,1,2,3,4,5,6,7,8,9].map(n => `<span style="display:block;height:1.15em;line-height:1.15;">${n}</span>`).join('')}
  </div>
</div>`).join('');

    return `
<div class="${odoId}-item" data-value="${stat.value}" data-suffix="${stat.suffix}" style="text-align:center;padding:2.5rem 1.5rem;background:${tokens.surface};border-radius:${radius};border:1px solid ${tokens.muted}18;">
  <div style="font-family:${fontFamily};font-size:clamp(2.5rem,5vw,4rem);font-weight:700;color:${tokens.accent};letter-spacing:-0.03em;overflow:hidden;height:1.15em;display:flex;justify-content:center;align-items:flex-start;">
    ${digitHtml}
    <span style="font-family:${fontFamily};font-size:clamp(1.75rem,3.5vw,2.75rem);font-weight:700;color:${tokens.accent};vertical-align:top;line-height:1.15;">${stat.suffix}</span>
  </div>
  <div style="font-size:0.85rem;color:${tokens.muted};margin-top:0.75rem;">${stat.label}</div>
</div>`;
  }).join('');

  return `
<section style="padding:5rem 2rem;background:${sectionBg};">
  <div style="max-width:56rem;margin:0 auto;">
    ${reveal(sectionLabel(tokens, t('stats.label', brand.language)), 'fadeUp', 0)}
    ${reveal(`<h2 style="font-size:clamp(1.75rem,3.5vw,2.5rem);font-weight:${isBrutalist ? '900' : '600'};text-align:center;color:${tokens.text};margin-bottom:3rem;letter-spacing:-0.02em;text-transform:${isBrutalist ? 'uppercase' : 'none'};">${copy.tagline}</h2>`, 'fadeUp', 100)}
    <div id="${odoId}-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1.5rem;">
      ${statCards}
    </div>
  </div>
</section>
<script>
(function(){
  var items=document.querySelectorAll('.${odoId}-item');
  if(!items.length||!('IntersectionObserver' in window))return;
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(!e.isIntersecting)return;
      var item=e.target;
      var val=item.dataset.value.replace(/\\D/g,'');
      var digits=val.split('');
      var strips=item.querySelectorAll('.${odoId}-strip');
      strips.forEach(function(strip,i){
        var target=parseInt(digits[i]||'0',10);
        var h=strip.children[0] ? strip.children[0].offsetHeight : 20;
        setTimeout(function(){
          strip.style.transform='translateY(-'+(target*h)+'px)';
        },i*80);
      });
      io.unobserve(item);
    });
  },{threshold:0.4});
  items.forEach(function(el){io.observe(el);});
})();
</script>`;
}
