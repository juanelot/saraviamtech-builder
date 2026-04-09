import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { sectionLabel, t, pickVariant, RADIUS_MAP, reveal } from './utils.js';

export function renderTextScramble(
  brand: BrandCard,
  tokens: DesignTokens,
  data: { personality?: string } & Record<string, any> = {},
): string {
  const { copy } = brand;
  const services = copy.services ?? [];

  const layout = data.personality ? pickVariant(data.personality) : 'cinematic';
  const isBrutalist = layout === 'brutalist' || layout === 'tech';
  const isEditorial = layout === 'editorial' || layout === 'deco';

  const radius = RADIUS_MAP[tokens.radius] ?? '1rem';
  const sectionBg = layout === 'cinematic' || layout === 'maximalist' ? tokens.bg : tokens.surface;

  const headlineText = (copy.headline ?? brand.name).toUpperCase();
  const scrambleId = `scramble_${Math.random().toString(36).slice(2, 7)}`;

  const items = services.slice(0, 4);
  const cards = items.map((s) => `
<div class="${scrambleId}-hover-card" style="background:${tokens.surface};border:1px solid ${tokens.muted}22;border-radius:${radius};padding:2.25rem 1.75rem;transition:border-color .3s;cursor:default;">
  <h3 data-scramble-hover="${s}" style="font-size:1rem;font-weight:${isBrutalist ? '700' : '600'};margin-bottom:0.5rem;color:${tokens.text};text-transform:${isBrutalist ? 'uppercase' : 'none'};">${s}</h3>
  <p style="font-size:0.85rem;color:${tokens.muted};line-height:1.5;">${copy.description ?? ''}</p>
</div>`).join('');

  return `
<section style="padding:5rem 2rem;background:${sectionBg};" id="services">
  <div style="max-width:52rem;margin:0 auto;text-align:center;">
    ${reveal(sectionLabel(tokens, t('services.label', brand.language)), 'fadeUp', 0)}

    <!-- Scroll-triggered scramble headline -->
    <div style="margin-bottom:3rem;">
      <div id="${scrambleId}-headline" data-scramble="${headlineText}" style="font-size:clamp(2.5rem,8vw,6rem);font-weight:${isBrutalist ? '900' : isEditorial ? '300' : '700'};letter-spacing:-0.03em;line-height:1.1;color:${tokens.text};font-family:'${tokens.displayFont}',serif;font-style:${isEditorial ? 'italic' : 'normal'};min-height:1.2em;text-transform:uppercase;">${headlineText}</div>
      <p style="font-size:1rem;color:${tokens.muted};margin-top:1rem;max-width:40ch;margin-left:auto;margin-right:auto;">${copy.tagline}</p>
    </div>

    <!-- Hover-scramble service cards -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;text-align:left;" id="${scrambleId}-grid">
      ${cards}
    </div>
  </div>
</section>
<style>
.${scrambleId}-hover-card:hover { border-color: ${tokens.accent} !important; }
.${scrambleId}-char { display:inline-block; }
.${scrambleId}-char.resolved { color:${tokens.accent}; }
.${scrambleId}-char.scrambling { color:${tokens.muted}; }
</style>
<script>
(function(){
  var CHARS='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&';
  function scramble(el,finalText,dur){
    dur=dur||1200;
    var len=finalText.length,start=null;
    function frame(ts){
      if(!start)start=ts;
      var p=Math.min((ts-start)/dur,1);
      var html='';
      for(var i=0;i<len;i++){
        if(finalText[i]===' '){html+=' ';continue;}
        var threshold=(i/len)*0.7+0.15;
        if(p>=threshold){
          html+='<span class="${scrambleId}-char resolved">'+finalText[i]+'</span>';
        } else {
          html+='<span class="${scrambleId}-char scrambling">'+CHARS[Math.floor(Math.random()*CHARS.length)]+'</span>';
        }
      }
      el.innerHTML=html;
      if(p<1)requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  // Scroll-triggered headline
  var headline=document.getElementById('${scrambleId}-headline');
  if(headline && 'IntersectionObserver' in window){
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ scramble(headline,headline.dataset.scramble,1400); io.unobserve(headline); }
      });
    },{threshold:0.3});
    io.observe(headline);
  }

  // Hover scrambles on service cards
  document.querySelectorAll('#${scrambleId}-grid [data-scramble-hover]').forEach(function(el){
    var orig=el.dataset.scrambleHover;
    el.addEventListener('mouseenter',function(){ scramble(el,orig,600); });
  });
})();
</script>`;
}
