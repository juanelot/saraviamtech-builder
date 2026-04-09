import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { btn, sectionLabel, RADIUS_MAP, t, pickVariant, gradientText, reveal } from './utils.js';

function hexToRgba(hex: string, alpha: number): string {
  const m = hex.match(/^#([0-9a-f]{6})$/i);
  if (m) {
    const r = parseInt(m[1]!.slice(0, 2), 16);
    const g = parseInt(m[1]!.slice(2, 4), 16);
    const b = parseInt(m[1]!.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  return `${hex}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;
}

export function renderMeshHero(
  brand: BrandCard,
  tokens: DesignTokens,
  data: { heroImageUrl?: string; heroVideoUrl?: string; personality?: string } & Record<string, any> = {},
): string {
  const { copy } = brand;
  const layout = data.personality ? pickVariant(data.personality) : 'cinematic';
  const r = RADIUS_MAP[tokens.radius];
  const id = `mesh-${Math.random().toString(36).slice(2, 7)}`;

  const heightStyle = tokens.heroHeight === 'full' ? 'min-height:100dvh'
    : tokens.heroHeight === 'large' ? 'min-height:80dvh'
    : 'min-height:60dvh';

  const hasMedia = !!data.heroImageUrl || !!data.heroVideoUrl;

  const mediaEl = data.heroVideoUrl
    ? `<video src="${data.heroVideoUrl}" autoplay muted loop playsinline style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;opacity:0.5;"></video>`
    : data.heroImageUrl
    ? `<img src="${data.heroImageUrl}" alt="${brand.name}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;opacity:0.4;">`
    : '';

  const canvasOpacity = hasMedia ? '0.6' : '1';

  const blob1 = hexToRgba(tokens.accent, 0.22);
  const blob2 = hexToRgba(tokens.accent, 0.15);
  const blob3 = `${tokens.muted}33`;
  const blob4 = tokens.surface;

  // Content layout varies by personality
  const isEditorial = layout === 'editorial' || layout === 'deco';
  const isBrutalist = layout === 'brutalist';
  const isTech = layout === 'tech' || layout === 'minimal';

  let contentLayout: string;

  if (isBrutalist) {
    contentLayout = `
    <div style="position:relative;z-index:2;${heightStyle};display:flex;flex-direction:column;justify-content:flex-end;padding:clamp(2rem,4vw,4rem);">
      ${reveal(`<div style="border-top:2px solid ${tokens.text}40;padding-top:1.5rem;margin-bottom:1.5rem;">
        <span style="font-size:0.7rem;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:${tokens.accent};">${brand.industry}</span>
      </div>`, 'fadeLeft', 0)}
      ${reveal(`<h1 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(3.5rem,10vw,8rem);font-weight:900;line-height:0.88;letter-spacing:-0.04em;color:${tokens.text};margin-bottom:2rem;text-transform:uppercase;max-width:16ch;">${copy.headline}</h1>`, 'fadeUp', 100)}
      ${reveal(`<div style="display:flex;align-items:center;gap:2rem;flex-wrap:wrap;padding-top:1.5rem;border-top:1px solid ${tokens.muted}25;">
        <p style="font-size:0.95rem;color:${tokens.muted};max-width:38ch;line-height:1.75;">${copy.tagline}</p>
        <div style="display:flex;gap:1rem;flex-wrap:wrap;">${btn(tokens, 'primary', copy.cta)}${btn(tokens, 'ghost', t('hero.explore', brand.language), '#services')}</div>
      </div>`, 'fadeUp', 250)}
    </div>`;
  } else if (isTech) {
    contentLayout = `
    <div style="position:relative;z-index:2;${heightStyle};display:flex;align-items:center;justify-content:center;">
      <div style="text-align:center;max-width:900px;padding:clamp(3rem,8vw,6rem) 2.5rem;">
        ${reveal(sectionLabel(tokens, brand.industry), 'scaleIn', 0)}
        ${reveal(`<h1 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(3rem,9vw,7.5rem);font-weight:700;line-height:0.94;letter-spacing:-0.05em;color:${tokens.text};margin:0 auto 1.5rem;max-width:14ch;">${gradientText(tokens, copy.headline, 'span')}</h1>`, 'fadeUp', 150)}
        ${reveal(`<p style="font-size:clamp(1rem,2vw,1.2rem);color:${tokens.muted};margin-bottom:2.5rem;max-width:50ch;line-height:1.8;margin-left:auto;margin-right:auto;">${copy.tagline}</p>`, 'fadeUp', 250)}
        ${reveal(`<div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">
          ${btn(tokens, 'primary', copy.cta)}
          ${btn(tokens, 'ghost', t('hero.explore', brand.language), '#services')}
        </div>`, 'fadeUp', 350)}
      </div>
    </div>`;
  } else if (isEditorial) {
    const words = copy.headline.split(' ');
    const half = Math.ceil(words.length / 2);
    const line1 = words.slice(0, half).join(' ');
    const line2 = words.slice(half).join(' ');
    contentLayout = `
    <div style="position:relative;z-index:2;${heightStyle};display:flex;flex-direction:column;justify-content:flex-end;padding:0 clamp(2rem,5vw,5rem) clamp(4rem,8dvh,7rem);">
      <div style="max-width:1300px;margin:0 auto;width:100%;">
        ${reveal(`<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:3rem;flex-wrap:wrap;gap:1rem;">
          ${sectionLabel(tokens, brand.industry)}
          <p style="font-size:0.85rem;color:${tokens.muted};max-width:30ch;line-height:1.7;text-align:right;">${copy.tagline}</p>
        </div>`, 'fadeUp', 0)}
        ${reveal(`<h1 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(4rem,12vw,11rem);font-weight:700;line-height:0.9;letter-spacing:-0.05em;color:${tokens.text};margin-bottom:3rem;">
          <span style="display:block;">${line1}</span>
          <span style="display:block;">${gradientText(tokens, line2 || '.', 'span', 'font-style:italic;')}</span>
        </h1>`, 'fadeUp', 150)}
        ${reveal(`<div style="padding-top:2rem;border-top:1px solid ${tokens.muted}20;display:flex;align-items:center;gap:2rem;flex-wrap:wrap;">
          ${btn(tokens, 'primary', copy.cta)}
          ${btn(tokens, 'ghost', t('hero.explore', brand.language), '#services')}
        </div>`, 'fadeUp', 300)}
      </div>
    </div>`;
  } else {
    // Default: cinematic / organic — content bottom-left
    contentLayout = `
    <div style="position:absolute;inset:0;background:linear-gradient(to top, ${tokens.bg} 0%, ${tokens.bg}cc 25%, ${tokens.bg}55 55%, transparent 100%);z-index:1;pointer-events:none;"></div>
    <div style="position:relative;z-index:2;max-width:1200px;margin:0 auto;padding:0 2.5rem clamp(4rem,10dvh,8rem);width:100%;${heightStyle};display:flex;flex-direction:column;justify-content:flex-end;">
      ${reveal(sectionLabel(tokens, brand.industry), 'fadeUp', 0)}
      ${reveal(`<h1 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(3.5rem,10vw,9rem);font-weight:700;line-height:0.92;letter-spacing:-0.05em;max-width:12ch;margin-bottom:1.75rem;">
        ${gradientText(tokens, copy.headline, 'span', 'color:' + tokens.text)}
      </h1>`, 'fadeUp', 150)}
      ${reveal(`<div style="display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:2rem;">
        <div>
          <p style="font-size:clamp(0.95rem,2vw,1.15rem);color:${tokens.muted};margin-bottom:2rem;max-width:44ch;line-height:1.8;">${copy.tagline}</p>
          <div style="display:flex;gap:1rem;flex-wrap:wrap;">
            ${btn(tokens, 'primary', copy.cta)}
            ${btn(tokens, 'ghost', t('hero.explore', brand.language), '#services')}
          </div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem;padding-bottom:0.5rem;">
          <div style="width:1px;height:3rem;background:linear-gradient(to bottom, transparent, ${tokens.muted}60);"></div>
          <span style="font-size:0.65rem;letter-spacing:0.15em;text-transform:uppercase;color:${tokens.muted};writing-mode:vertical-lr;">${t('hero.scroll', brand.language)}</span>
        </div>
      </div>`, 'fadeUp', 300)}
    </div>`;
  }

  return `
<section id="hero" style="${heightStyle};position:relative;overflow:hidden;background:${tokens.bg};">
  <canvas id="${id}-mesh" style="position:absolute;inset:0;width:100%;height:100%;opacity:${canvasOpacity};z-index:0;pointer-events:none;"></canvas>
  ${mediaEl}
  ${contentLayout}
</section>
<script>
(function(){
  var canvas = document.getElementById('${id}-mesh');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var blobs = [
    {x:0.3,y:0.4,vx:0.0003,vy:0.0002,r:0.35,color:'${blob1}'},
    {x:0.7,y:0.6,vx:-0.0002,vy:0.0004,r:0.3,color:'${blob2}'},
    {x:0.5,y:0.3,vx:0.0004,vy:-0.0003,r:0.25,color:'${blob3}'},
    {x:0.2,y:0.7,vx:-0.0003,vy:-0.0002,r:0.3,color:'${blob4}'}
  ];
  function resize(){
    canvas.width = (canvas.offsetWidth || window.innerWidth) * (window.devicePixelRatio || 1);
    canvas.height = (canvas.offsetHeight || window.innerHeight) * (window.devicePixelRatio || 1);
  }
  resize();
  window.addEventListener('resize', resize);
  function draw(){
    var w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    blobs.forEach(function(b){
      b.x += b.vx; b.y += b.vy;
      if(b.x < 0 || b.x > 1) b.vx *= -1;
      if(b.y < 0 || b.y > 1) b.vy *= -1;
      var grd = ctx.createRadialGradient(b.x*w, b.y*h, 0, b.x*w, b.y*h, b.r*Math.max(w, h));
      grd.addColorStop(0, b.color);
      grd.addColorStop(1, 'transparent');
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
    });
    requestAnimationFrame(draw);
  }
  draw();
})();
</script>`;
}
