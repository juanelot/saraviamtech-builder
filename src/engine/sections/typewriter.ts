import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { pickVariant, btn, RADIUS_MAP, reveal } from './utils.js';

/**
 * renderTypewriter — CTA section with a looping typewriter that cycles
 * through brand services/keywords. Different from typewriter-hero (which is
 * a full hero section): this is a mid-page CTA block.
 */
export function renderTypewriter(
  brand: BrandCard,
  tokens: DesignTokens,
  data: { personality?: string } & Record<string, any> = {},
): string {
  const { copy } = brand;
  const services = copy.services ?? [];
  const layout = data.personality ? pickVariant(data.personality) : 'cinematic';
  const isBrutalist = layout === 'brutalist';
  const isEditorial = layout === 'editorial' || layout === 'deco';

  const radius = RADIUS_MAP[tokens.radius] ?? '1rem';
  const sectionBg = layout === 'cinematic' || layout === 'maximalist' ? tokens.bg : tokens.surface;

  const twId = `tw_${Math.random().toString(36).slice(2, 7)}`;

  const words = services.length >= 2
    ? services.slice(0, 5)
    : [copy.tagline, copy.headline, brand.name];

  const wordsJson = JSON.stringify(words);

  const ctaPrimary = btn(tokens, 'primary', copy.cta);
  const ctaGhost = btn(tokens, 'ghost', copy.cta);

  return `
<section style="padding:6rem 2rem;background:${sectionBg};text-align:center;">
  <div style="max-width:44rem;margin:0 auto;">
    ${reveal(`<p style="font-size:0.75rem;letter-spacing:0.15em;text-transform:uppercase;color:${tokens.muted};margin-bottom:1.5rem;">${brand.name}</p>`, 'fadeUp', 0)}

    ${reveal(`<h2 style="font-size:clamp(2rem,5vw,4rem);font-weight:${isBrutalist ? '900' : isEditorial ? '300' : '700'};letter-spacing:-0.03em;line-height:1.15;color:${tokens.text};text-transform:${isBrutalist ? 'uppercase' : 'none'};font-style:${isEditorial ? 'italic' : 'normal'};margin-bottom:0.5rem;font-family:'${tokens.displayFont}',serif;">
      ${copy.tagline}
    </h2>`, 'fadeUp', 100)}

    ${reveal(`<div style="font-size:clamp(1.5rem,3.5vw,3rem);font-weight:${isBrutalist ? '900' : '600'};letter-spacing:-0.02em;color:${tokens.accent};font-family:'${tokens.displayFont}',serif;margin-bottom:2rem;min-height:1.3em;display:flex;align-items:center;justify-content:center;gap:0.5rem;">
      <span id="${twId}-word"></span><span id="${twId}-cursor" style="display:inline-block;width:3px;height:0.9em;background:${tokens.accent};border-radius:1px;animation:${twId}Blink 1s step-end infinite;vertical-align:middle;"></span>
    </div>`, 'fadeUp', 200)}

    ${reveal(`<p style="font-size:1rem;color:${tokens.muted};line-height:1.6;margin-bottom:2.5rem;max-width:36ch;margin-left:auto;margin-right:auto;">${copy.description ?? ''}</p>`, 'fadeUp', 250)}

    ${reveal(`<div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">${ctaPrimary}${ctaGhost}</div>`, 'fadeUp', 300)}
  </div>
</section>
<style>
@keyframes ${twId}Blink { 0%,100%{opacity:1} 50%{opacity:0} }
</style>
<script>
(function(){
  var words=${wordsJson};
  var wordEl=document.getElementById('${twId}-word');
  if(!wordEl)return;
  var wi=0,ci=0,deleting=false,pause=0;
  function tick(){
    if(pause>0){pause--;setTimeout(tick,50);return;}
    var w=words[wi];
    if(!deleting){
      wordEl.textContent=w.slice(0,ci+1);
      ci++;
      if(ci>=w.length){deleting=false;pause=60;setTimeout(tick,50);}
      else{setTimeout(tick,80);}
    } else {
      wordEl.textContent=w.slice(0,ci-1);
      ci--;
      if(ci<=0){deleting=false;wi=(wi+1)%words.length;ci=0;pause=10;setTimeout(tick,50);}
      else{setTimeout(tick,40);}
    }
    if(pause===60&&!deleting){deleting=true;}
  }
  tick();
})();
</script>`;
}
