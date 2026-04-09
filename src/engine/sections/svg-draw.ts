import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { sectionLabel, t, pickVariant, reveal } from './utils.js';

export function renderSvgDraw(
  brand: BrandCard,
  tokens: DesignTokens,
  data: { personality?: string } & Record<string, any> = {},
): string {
  const { copy } = brand;
  const services = copy.services ?? [];
  const layout = data.personality ? pickVariant(data.personality) : 'cinematic';
  const isBrutalist = layout === 'brutalist';
  const isEditorial = layout === 'editorial' || layout === 'deco';

  const sectionBg = isEditorial ? tokens.surface : tokens.bg;

  const svgId = `svgDraw_${Math.random().toString(36).slice(2, 7)}`;

  // Milestones: use services or default process steps
  const milestones = services.length >= 4
    ? services.slice(0, 5)
    : [
        t('process.discover', brand.language),
        t('process.design', brand.language),
        t('process.build', brand.language),
        t('process.launch', brand.language),
        t('process.grow', brand.language),
      ];

  const milestoneHtml = milestones.map((m, i) => {
    const pct = [5, 28, 50, 72, 92][i] ?? (i * 22);
    return `<div class="${svgId}-milestone" style="position:absolute;left:50%;transform:translateX(-50%);text-align:center;opacity:0;width:80%;top:${pct}%;">
  <h3 style="font-size:1.1rem;font-weight:600;margin-bottom:0.25rem;color:${tokens.text};">${m}</h3>
  <p style="font-size:0.8rem;color:${tokens.muted};line-height:1.4;">${copy.tagline}</p>
</div>`;
  }).join('');

  return `
<section style="background:${sectionBg};">
  <div style="max-width:52rem;margin:0 auto;padding:5rem 2rem 2rem;">
    ${reveal(sectionLabel(tokens, t('process.label', brand.language)), 'fadeUp', 0)}
    ${reveal(`<h2 style="font-size:clamp(1.75rem,3.5vw,2.75rem);font-weight:${isBrutalist ? '900' : '600'};color:${tokens.text};margin-bottom:1rem;letter-spacing:-0.02em;text-transform:${isBrutalist ? 'uppercase' : 'none'};font-style:${isEditorial ? 'italic' : 'normal'};">${copy.tagline}</h2>`, 'fadeUp', 100)}
  </div>

  <!-- SVG draw section — sticky + scrollable -->
  <div style="position:relative;height:300vh;max-width:50rem;margin:0 auto;padding:0 2rem;" id="${svgId}-section">
    <div style="position:sticky;top:0;min-height:100dvh;display:flex;align-items:center;justify-content:center;">
      <svg viewBox="0 0 400 500" style="width:100%;max-width:480px;" id="${svgId}-svg">
        <path id="${svgId}-path" d="M200,20 C200,20 80,80 80,140 C80,200 320,200 320,260 C320,320 80,320 80,380 C80,440 200,480 200,480"
          style="fill:none;stroke:${tokens.accent};stroke-width:2;stroke-linecap:round;stroke-linejoin:round;"/>
        <circle cx="200" cy="20"  r="5" fill="${tokens.accent}" opacity=".4"/>
        <circle cx="80"  cy="140" r="5" fill="${tokens.accent}" opacity=".4"/>
        <circle cx="320" cy="260" r="5" fill="${tokens.accent}" opacity=".4"/>
        <circle cx="80"  cy="380" r="5" fill="${tokens.accent}" opacity=".4"/>
        <circle cx="200" cy="480" r="5" fill="${tokens.accent}" opacity=".4"/>
      </svg>
    </div>
    ${milestoneHtml}
  </div>
</section>
<script>
(function(){
  var path=document.getElementById('${svgId}-path');
  var section=document.getElementById('${svgId}-section');
  var milestones=document.querySelectorAll('.${svgId}-milestone');
  if(!path||!section)return;

  var len=path.getTotalLength();
  path.style.strokeDasharray=len;
  path.style.strokeDashoffset=len;

  function lerp(a,b,t){return a+(b-a)*t;}

  window.addEventListener('scroll',function(){
    var rect=section.getBoundingClientRect();
    var total=section.offsetHeight-window.innerHeight;
    var scrolled=-rect.top;
    var p=Math.max(0,Math.min(1,scrolled/total));

    path.style.strokeDashoffset=len*(1-p);

    milestones.forEach(function(m,i){
      var start=i/milestones.length;
      var end=start+.15;
      var mp=Math.max(0,Math.min(1,(p-start)/(end-start)));
      m.style.opacity=mp.toFixed(3);
      m.style.transform='translateX(-50%) translateY('+(lerp(12,0,mp)).toFixed(1)+'px)';
    });
  },{passive:true});
})();
</script>`;
}
