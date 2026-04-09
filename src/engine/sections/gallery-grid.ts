import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { sectionLabel, SPACING_MAP, RADIUS_MAP, t, pickVariant, reveal, revealStagger } from './utils.js';

export function renderGalleryGrid(
  brand: BrandCard,
  tokens: DesignTokens,
  data: { images?: string[]; personality?: string } = {},
): string {
  const images = data.images ?? [];
  if (!images.length) return '';

  const sp = SPACING_MAP[tokens.spacing];
  const r = RADIUS_MAP[tokens.radius];
  const layout = data.personality ? pickVariant(data.personality) : 'cinematic';

  const imgCard = (src: string, i: number) => `
    <div style="overflow:hidden;border-radius:${r};cursor:zoom-in;position:relative;min-height:200px;" onclick="window.openGalleryLightbox && window.openGalleryLightbox('${src}')">
      <img src="${src}" alt="${brand.name} ${i + 1}" loading="lazy" style="width:100%;height:auto;min-height:200px;display:block;object-fit:cover;object-position:center top;transition:transform 0.6s cubic-bezier(.16,1,.3,1),filter 0.4s;" onmouseover="this.style.transform='scale(1.04)';this.style.filter='brightness(1.07)'" onmouseout="this.style.transform='scale(1)';this.style.filter=''">
      <div style="position:absolute;inset:0;background:linear-gradient(to top,${tokens.bg}80,transparent 50%);opacity:0;transition:opacity 0.4s;pointer-events:none;"></div>
    </div>`;

  // ── BRUTALIST — tight grid, no radius ────────────────────────────────────
  if (layout === 'brutalist' || layout === 'tech') {
    return `
<section id="gallery" style="padding:${sp.section};background:${tokens.surface};border-top:2px solid ${tokens.accent}30;">
  <div style="max-width:1200px;margin:0 auto;">
    ${reveal(`<h2 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(2rem,5vw,3rem);font-weight:900;color:${tokens.text};text-transform:uppercase;letter-spacing:-0.03em;margin-bottom:2rem;">${t('label.gallery', brand.language)}</h2>`, 'fadeUp', 0)}
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:2px;">
      ${revealStagger(images.slice(0, 9).map((src, i) => imgCard(src, i).replace(`border-radius:${r}`, 'border-radius:0')), 'fadeUp', 80, 60)}
    </div>
  </div>
</section>
${gridLightboxScript()}`;
  }

  // ── EDITORIAL — wider spacing, captions ─────────────────────────────────
  if (layout === 'editorial' || layout === 'minimal' || layout === 'deco') {
    return `
<section id="gallery" style="padding:${sp.section};background:${tokens.bg};">
  <div style="max-width:1200px;margin:0 auto;">
    ${reveal(`<div style="text-align:center;margin-bottom:3.5rem;">
      ${sectionLabel(tokens, t('label.gallery', brand.language))}
    </div>`, 'fadeUp', 0)}
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:1.5rem;">
      ${revealStagger(images.slice(0, 9).map((src, i) => imgCard(src, i)), 'scaleIn', 80, 80)}
    </div>
  </div>
</section>
${gridLightboxScript()}`;
  }

  // ── DEFAULT — standard grid with reveal ─────────────────────────────────
  return `
<section id="gallery" style="padding:${sp.section};background:${tokens.surface};">
  <div style="max-width:1200px;margin:0 auto;">
    ${reveal(sectionLabel(tokens, t('label.gallery', brand.language)), 'fadeUp', 0)}
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1.25rem;">
      ${revealStagger(images.slice(0, 9).map((src, i) => imgCard(src, i)), 'fadeUp', 80, 80)}
    </div>
  </div>
</section>
${gridLightboxScript()}`;
}

function gridLightboxScript(): string {
  return `
<script>
(function(){
  window.openGalleryLightbox = function(src) {
    var lb = document.getElementById('grid-lb');
    if (!lb) {
      lb = document.createElement('div');
      lb.id = 'grid-lb';
      lb.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.92);display:flex;align-items:center;justify-content:center;cursor:zoom-out;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);opacity:0;transition:opacity 0.3s;';
      lb.innerHTML = '<img id="grid-lb-img" style="max-width:90vw;max-height:85vh;border-radius:0.75rem;pointer-events:none;transform:scale(0.95);transition:transform 0.3s cubic-bezier(.16,1,.3,1);">';
      lb.addEventListener('click', function(){ lb.style.opacity='0'; setTimeout(function(){ lb.style.display='none'; }, 300); });
      document.body.appendChild(lb);
    }
    lb.style.display = 'flex';
    requestAnimationFrame(function(){ lb.style.opacity='1'; document.getElementById('grid-lb-img').style.transform='scale(1)'; });
    document.getElementById('grid-lb-img').src = src;
  };
})();
</script>`;
}
