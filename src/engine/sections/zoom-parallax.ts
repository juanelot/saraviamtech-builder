import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { pickVariant, btn, RADIUS_MAP } from './utils.js';

export function renderZoomParallax(
  brand: BrandCard,
  tokens: DesignTokens,
  data: { personality?: string } & Record<string, any> = {},
): string {
  const { copy } = brand;
  const layout = data.personality ? pickVariant(data.personality) : 'cinematic';
  const isBrutalist = layout === 'brutalist';
  const isEditorial = layout === 'editorial' || layout === 'deco';

  const radius = RADIUS_MAP[tokens.radius] ?? '1.5rem';
  const zpId = `zp_${Math.random().toString(36).slice(2, 7)}`;

  // Big word to zoom through
  const word = isBrutalist
    ? brand.name.toUpperCase().split(' ')[0]
    : isEditorial
      ? copy.tagline.split(' ').slice(0, 2).join(' ').toUpperCase()
      : brand.name.toUpperCase();

  const cta = btn(tokens, 'primary', copy.cta);

  return `
<section style="position:relative;height:500vh;background:${tokens.bg};" id="${zpId}-section">
  <div style="position:sticky;top:0;min-height:100dvh;overflow:hidden;display:flex;align-items:center;justify-content:center;perspective:1000px;">

    <!-- Background glow layer -->
    <div id="${zpId}-bg" style="position:absolute;inset:-20%;z-index:1;background:radial-gradient(ellipse at 50% 40%,${tokens.surface} 0%,${tokens.bg} 70%);will-change:transform;"></div>

    <!-- Mid decorative shapes -->
    <div id="${zpId}-mid" style="position:absolute;inset:0;z-index:2;will-change:transform;">
      <div style="position:absolute;width:20rem;height:20rem;border-radius:50%;background:radial-gradient(circle,${tokens.accent}18 0%,transparent 70%);top:10%;left:5%;"></div>
      <div style="position:absolute;width:14rem;height:14rem;border-radius:50%;background:radial-gradient(circle,${tokens.surface2 ?? tokens.accent}14 0%,transparent 70%);top:55%;right:10%;"></div>
      <div style="position:absolute;width:24rem;height:24rem;border-radius:50%;background:radial-gradient(circle,${tokens.accent}10 0%,transparent 70%);bottom:5%;left:35%;"></div>
    </div>

    <!-- Foreground big word -->
    <div id="${zpId}-fg" style="position:absolute;inset:0;z-index:3;display:flex;align-items:center;justify-content:center;will-change:transform,opacity;">
      <div style="font-size:clamp(5rem,15vw,14rem);font-weight:900;letter-spacing:-0.04em;text-transform:uppercase;font-family:'${tokens.displayFont}',serif;color:${tokens.text};opacity:0.9;text-align:center;line-height:0.95;">${word}</div>
    </div>

    <!-- Product reveal -->
    <div id="${zpId}-product" style="position:absolute;inset:0;z-index:4;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;will-change:transform,opacity;">
      <div style="background:${tokens.surface};border:1px solid ${tokens.muted}22;border-radius:${radius};padding:3.5rem 3rem;text-align:center;max-width:28rem;box-shadow:0 40px 80px rgba(0,0,0,0.25);">
        <h2 style="font-size:2rem;font-weight:${isBrutalist ? '900' : '600'};letter-spacing:-0.025em;margin-bottom:0.75rem;color:${tokens.text};text-transform:${isBrutalist ? 'uppercase' : 'none'};font-style:${isEditorial ? 'italic' : 'normal'};">${copy.headline}</h2>
        <p style="font-size:0.95rem;color:${tokens.muted};line-height:1.6;margin-bottom:1.5rem;">${copy.description ?? copy.tagline}</p>
        ${cta}
      </div>
    </div>
  </div>
</section>
<script>
(function(){
  var section=document.getElementById('${zpId}-section');
  var bg=document.getElementById('${zpId}-bg');
  var mid=document.getElementById('${zpId}-mid');
  var fg=document.getElementById('${zpId}-fg');
  var product=document.getElementById('${zpId}-product');
  if(!section||!fg)return;

  window.addEventListener('scroll',function(){
    var rect=section.getBoundingClientRect();
    var total=section.offsetHeight-window.innerHeight;
    var scrolled=-rect.top;
    var p=Math.max(0,Math.min(1,scrolled/total));

    // Background: barely moves
    if(bg) bg.style.transform='scale('+(1+p*0.15)+')';

    // Mid: moderate movement
    if(mid){
      mid.style.transform='scale('+(1+p*0.6)+') translateY('+(p*-100)+'px)';
      mid.style.opacity=String(1-p*0.8);
    }

    // Foreground word: zooms past
    var fgP=Math.min(p/0.5,1);
    if(fg){
      fg.style.transform='scale('+(1+fgP*5)+')';
      fg.style.opacity=String(Math.max(0,1-fgP*1.5));
    }

    // Product card: fades in mid-scroll, fades out near end
    if(product){
      var inStart=0.4,inEnd=0.6,outStart=0.75,outEnd=0.9;
      var inP=Math.max(0,Math.min(1,(p-inStart)/(inEnd-inStart)));
      var outP=Math.max(0,Math.min(1,(p-outStart)/(outEnd-outStart)));
      var scale=0.85+inP*0.15;
      var opacity=inP*(1-outP);
      product.style.opacity=String(opacity);
      product.style.transform='scale('+scale+')';
    }
  },{passive:true});
})();
</script>`;
}
