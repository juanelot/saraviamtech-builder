import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { sectionLabel, SPACING_MAP, RADIUS_MAP, t, pickVariant, reveal, revealStagger } from './utils.js';

export function renderGalleryMasonry(
  brand: BrandCard,
  tokens: DesignTokens,
  data: { images?: string[]; personality?: string } = {},
): string {
  const images = data.images ?? [];
  if (!images.length) return '';

  const sp = SPACING_MAP[tokens.spacing];
  const r = RADIUS_MAP[tokens.radius];
  const layout = data.personality ? pickVariant(data.personality) : 'cinematic';

  const imgCard = (src: string, i: number, span = '') => `
    <div style="overflow:hidden;border-radius:${r};${span}cursor:zoom-in;position:relative;break-inside:avoid;margin-bottom:1rem;" onclick="openLightbox('${src}')">
      <img src="${src}" alt="${brand.name} ${i + 1}" loading="lazy" style="width:100%;height:auto;display:block;object-fit:cover;object-position:center top;transition:transform 0.6s cubic-bezier(.16,1,.3,1),filter 0.4s;" onmouseover="this.style.transform='scale(1.04)';this.style.filter='brightness(1.06)'" onmouseout="this.style.transform='scale(1)';this.style.filter=''">
      <div style="position:absolute;inset:0;background:linear-gradient(to top,${tokens.bg}60,transparent 50%);opacity:0;transition:opacity 0.4s;pointer-events:none;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0'"></div>
    </div>`;

  // ── BRUTALIST — hard columns, no gaps, thick borders ───────────────────────
  if (layout === 'brutalist' || layout === 'tech') {
    const imgHtml = images.slice(0, 9).map((src, i) =>
      reveal(imgCard(src, i, 'border-radius:0;'), 'fadeUp', i * 60)
    ).join('');
    return `
<section id="gallery" style="padding:${sp.section};background:${tokens.bg};border-top:2px solid ${tokens.accent}30;">
  <div style="max-width:1200px;margin:0 auto;">
    ${reveal(`<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:3rem;">
      <h2 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(2rem,5vw,3rem);font-weight:900;color:${tokens.text};text-transform:uppercase;letter-spacing:-0.03em;">${t('label.gallery', brand.language)}</h2>
      <span style="font-size:0.75rem;font-weight:700;color:${tokens.accent};letter-spacing:0.12em;text-transform:uppercase;">${images.length} IMG</span>
    </div>`, 'fadeUp', 0)}
    <div style="columns:3;column-gap:2px;">
      ${imgHtml}
    </div>
  </div>
</section>
${lightboxScript('masonry')}`;
  }

  // ── EDITORIAL / MINIMAL — elegant spacing, caption overlay ──────────────
  if (layout === 'editorial' || layout === 'minimal' || layout === 'deco') {
    const imgHtml = images.slice(0, 9).map((src, i) =>
      reveal(imgCard(src, i), 'scaleIn', i * 60)
    ).join('');
    return `
<section id="gallery" style="padding:${sp.section};background:${tokens.bg};">
  <div style="max-width:1200px;margin:0 auto;">
    ${reveal(`<div style="text-align:center;margin-bottom:3.5rem;">
      ${sectionLabel(tokens, t('label.gallery', brand.language))}
      <h2 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(1.75rem,4vw,2.75rem);font-weight:400;font-style:italic;color:${tokens.text};letter-spacing:-0.03em;">${brand.copy.tagline}</h2>
    </div>`, 'fadeUp', 0)}
    <div style="columns:3;column-gap:1.25rem;">
      ${imgHtml}
    </div>
  </div>
</section>
${lightboxScript('masonry')}`;
  }

  // ── DEFAULT — true masonry with CSS columns ────────────────────────────
  const imgHtml = images.slice(0, 9).map((src, i) =>
    reveal(imgCard(src, i), 'fadeUp', i * 60)
  ).join('');

  return `
<section id="gallery" style="padding:${sp.section};background:${tokens.bg};">
  <div style="max-width:1200px;margin:0 auto;">
    ${reveal(`<div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:3rem;flex-wrap:wrap;gap:1rem;">
      <div>
        ${sectionLabel(tokens, t('label.gallery', brand.language))}
        <h2 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(1.75rem,4vw,2.75rem);font-weight:700;color:${tokens.text};letter-spacing:-0.03em;">${brand.copy.tagline}</h2>
      </div>
      <span style="font-size:0.8rem;color:${tokens.muted};">${images.length} ${brand.language === 'es' ? 'imágenes' : 'images'}</span>
    </div>`, 'fadeUp', 0)}
    <div style="columns:3;column-gap:1rem;">
      ${imgHtml}
    </div>
  </div>
</section>
${lightboxScript('masonry')}`;
}

function lightboxScript(prefix: string): string {
  return `
<script>
(function(){
  function openLightbox(src) {
    var lb = document.getElementById('${prefix}-lb');
    if (!lb) {
      lb = document.createElement('div');
      lb.id = '${prefix}-lb';
      lb.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.92);display:flex;align-items:center;justify-content:center;cursor:zoom-out;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);opacity:0;transition:opacity 0.3s;';
      lb.innerHTML = '<img id="${prefix}-lb-img" style="max-width:90vw;max-height:85vh;border-radius:0.75rem;pointer-events:none;transform:scale(0.95);transition:transform 0.3s cubic-bezier(.16,1,.3,1);">';
      lb.addEventListener('click', function(){ lb.style.opacity='0'; setTimeout(function(){ lb.style.display='none'; }, 300); });
      document.body.appendChild(lb);
    }
    lb.style.display = 'flex';
    requestAnimationFrame(function(){ lb.style.opacity='1'; document.getElementById('${prefix}-lb-img').style.transform='scale(1)'; });
    document.getElementById('${prefix}-lb-img').src = src;
  }
  window.openLightbox = openLightbox;
})();
</script>`;
}
