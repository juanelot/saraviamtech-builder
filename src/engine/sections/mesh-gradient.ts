import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { pickVariant, reveal, btn } from './utils.js';

export function renderMeshGradient(
  brand: BrandCard,
  tokens: DesignTokens,
  data: { personality?: string } & Record<string, any> = {},
): string {
  const { copy } = brand;
  const layout = data.personality ? pickVariant(data.personality) : 'cinematic';
  const isBrutalist = layout === 'brutalist';
  const isEditorial = layout === 'editorial' || layout === 'deco';

  const canvasId = `meshCanvas_${Math.random().toString(36).slice(2, 7)}`;

  // Build blob colors from brand tokens
  const a1 = tokens.accent;
  const a2 = tokens.surface2 ?? tokens.surface;

  const headlineSize = 'clamp(2.5rem,6vw,5rem)';
  const headlineWeight = isBrutalist ? '900' : isEditorial ? '300' : '700';
  const headlineTx = isBrutalist ? 'uppercase' : 'none';
  const headlineFs = isEditorial ? 'italic' : 'normal';

  const cta = btn(tokens, 'ghost', copy.cta);

  return `
<section style="position:relative;min-height:80vh;display:flex;align-items:center;justify-content:center;overflow:hidden;padding:0;">
  <canvas id="${canvasId}" style="position:absolute;inset:0;width:100%;height:100%;z-index:0;display:block;"></canvas>
  <div style="position:relative;z-index:2;text-align:center;max-width:42rem;padding:3rem 2rem;">
    ${reveal(`<p style="font-size:0.75rem;letter-spacing:0.15em;text-transform:uppercase;color:${tokens.muted};margin-bottom:1.5rem;">${copy.tagline}</p>`, 'fadeUp', 0)}
    ${reveal(`<h2 style="font-size:${headlineSize};font-weight:${headlineWeight};letter-spacing:-0.03em;line-height:1.1;color:${tokens.text};text-transform:${headlineTx};font-style:${headlineFs};margin-bottom:1rem;">${copy.headline}</h2>`, 'fadeUp', 100)}
    ${reveal(`<p style="font-size:1.05rem;color:${tokens.muted};line-height:1.6;margin-bottom:2rem;">${copy.description ?? ''}</p>`, 'fadeUp', 200)}
    ${reveal(cta, 'fadeUp', 300)}
  </div>
</section>
<script>
(function(){
  var canvas = document.getElementById('${canvasId}');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var blobs = [
    {x:.3,y:.4,vx:.0006,vy:.0004,r:.35,color:'${a1}40'},
    {x:.7,y:.6,vx:-.0005,vy:.0007,r:.3,color:'${a2}30'},
    {x:.5,y:.2,vx:.0004,vy:-.0005,r:.25,color:'${tokens.accent}25'},
    {x:.2,y:.8,vx:-.0006,vy:-.0004,r:.28,color:'${a1}20'},
  ];
  function resize(){canvas.width=canvas.offsetWidth;canvas.height=canvas.offsetHeight;}
  resize();window.addEventListener('resize',resize);
  function draw(){
    var w=canvas.width,h=canvas.height;
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle='${tokens.bg}';ctx.fillRect(0,0,w,h);
    blobs.forEach(function(b){
      b.x+=b.vx;b.y+=b.vy;
      if(b.x<-.1||b.x>1.1)b.vx*=-1;
      if(b.y<-.1||b.y>1.1)b.vy*=-1;
      var grd=ctx.createRadialGradient(b.x*w,b.y*h,0,b.x*w,b.y*h,b.r*Math.max(w,h));
      grd.addColorStop(0,b.color);grd.addColorStop(1,'transparent');
      ctx.globalCompositeOperation='lighter';
      ctx.fillStyle=grd;ctx.fillRect(0,0,w,h);
      ctx.globalCompositeOperation='source-over';
    });
    requestAnimationFrame(draw);
  }
  draw();
})();
</script>`;
}
