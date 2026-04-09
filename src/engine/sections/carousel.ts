import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { sectionLabel, RADIUS_MAP, t, reveal } from './utils.js';

export function renderCarousel(
  brand: BrandCard,
  tokens: DesignTokens,
  data: { images?: string[] } = {},
): string {
  const images = data.images ?? [];
  if (images.length < 2) return '';

  const r = RADIUS_MAP[tokens.radius];
  const id = `cr${Math.random().toString(36).slice(2, 7)}`;

  // Build slides — large cinematic cards with tilt + spotlight
  const slides = images.map((src, i) => `
    <div
      class="${id}-slide"
      data-index="${i}"
      style="
        flex:0 0 auto;
        width:clamp(300px,48vw,680px);
        border-radius:${r};
        overflow:hidden;
        scroll-snap-align:start;
        position:relative;
        cursor:grab;
        transform-style:preserve-3d;
        transition:transform 0.5s cubic-bezier(.16,1,.3,1),box-shadow 0.5s;
        box-shadow: 0 2px 20px rgba(0,0,0,0.3);
      "
      onmouseenter="tiltEnter_${id}(this)"
      onmouseleave="tiltLeave_${id}(this)"
      onmousemove="tiltMove_${id}(this,event)"
    >
      <img
        src="${src}"
        alt="${brand.name} ${i + 1}"
        loading="lazy"
        style="
          width:100%;
          height:auto;
          min-height:240px;
          max-height:560px;
          object-fit:cover;
          object-position:center top;
          display:block;
          pointer-events:none;
          transition:transform 0.6s cubic-bezier(.16,1,.3,1);
        "
        class="${id}-img"
      >
      <!-- Spotlight overlay -->
      <div class="${id}-spot" style="
        position:absolute;inset:0;z-index:2;
        pointer-events:none;
        background:radial-gradient(circle 280px at var(--mx,50%) var(--my,50%), ${tokens.accent}28, transparent 65%);
        opacity:0;transition:opacity 0.3s;
      "></div>
      <!-- Gradient bottom fade -->
      <div style="position:absolute;inset:0;background:linear-gradient(to top,${tokens.bg}80 0%,transparent 50%);z-index:1;pointer-events:none;"></div>
      <!-- Index badge -->
      <div style="
        position:absolute;bottom:1rem;left:1rem;z-index:3;
        font-family:'${tokens.displayFont}',serif;
        font-size:clamp(1.25rem,3vw,2rem);
        font-weight:700;
        color:${tokens.text}50;
        line-height:1;
        letter-spacing:-0.04em;
        pointer-events:none;
        user-select:none;
      ">${String(i + 1).padStart(2, '0')}</div>
    </div>`).join('');

  // Dots
  const dots = images.map((_, i) => `
    <button
      id="${id}-dot-${i}"
      onclick="goTo_${id}(${i})"
      style="
        width:${i === 0 ? '2rem' : '0.4rem'};
        height:0.4rem;
        border-radius:9999px;
        border:none;
        background:${i === 0 ? tokens.accent : tokens.muted + '40'};
        cursor:pointer;
        transition:all 0.35s cubic-bezier(.16,1,.3,1);
        padding:0;
      "
      aria-label="Slide ${i + 1}"
    ></button>`).join('');

  return `
<section id="showcase" style="padding:clamp(4rem,8vw,7rem) 0;background:${tokens.bg};overflow:hidden;">

  <!-- Header row -->
  <div style="max-width:1400px;margin:0 auto;padding:0 clamp(1.5rem,4vw,3.5rem);margin-bottom:2.5rem;">
    <div style="display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:1.5rem;">
      <div>
        ${sectionLabel(tokens, t('label.showcase', brand.language))}
        <h2 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(1.5rem,3.5vw,2.5rem);font-weight:700;color:${tokens.text};letter-spacing:-0.04em;line-height:1.1;margin-top:0.5rem;max-width:20ch;">${brand.copy.tagline}</h2>
      </div>
      <!-- Controls -->
      <div style="display:flex;gap:0.5rem;align-items:center;">
        <button id="${id}-prev" aria-label="Anterior" style="
          width:2.75rem;height:2.75rem;border-radius:50%;
          background:${tokens.surface};border:1px solid ${tokens.muted}25;
          cursor:pointer;color:${tokens.text};font-size:1.1rem;
          display:flex;align-items:center;justify-content:center;
          transition:all 0.2s;
        "
        onmouseover="this.style.borderColor='${tokens.accent}';this.style.color='${tokens.accent}';this.style.background='${tokens.accent}15'"
        onmouseout="this.style.borderColor='${tokens.muted}25';this.style.color='${tokens.text}';this.style.background='${tokens.surface}'"
        >&#8592;</button>
        <button id="${id}-next" aria-label="Siguiente" style="
          width:2.75rem;height:2.75rem;border-radius:50%;
          background:${tokens.surface};border:1px solid ${tokens.muted}25;
          cursor:pointer;color:${tokens.text};font-size:1.1rem;
          display:flex;align-items:center;justify-content:center;
          transition:all 0.2s;
        "
        onmouseover="this.style.borderColor='${tokens.accent}';this.style.color='${tokens.accent}';this.style.background='${tokens.accent}15'"
        onmouseout="this.style.borderColor='${tokens.muted}25';this.style.color='${tokens.text}';this.style.background='${tokens.surface}'"
        >&#8594;</button>
      </div>
    </div>
  </div>

  <!-- Track — full bleed to edges -->
  <div
    id="${id}"
    style="
      display:flex;
      gap:1.25rem;
      overflow-x:auto;
      scroll-snap-type:x mandatory;
      scrollbar-width:none;
      -webkit-overflow-scrolling:touch;
      padding:0.5rem clamp(1.5rem,4vw,3.5rem) 1.5rem;
      cursor:grab;
      user-select:none;
    "
  >${slides}</div>

  <!-- Progress line + dots -->
  <div style="max-width:1400px;margin:1.75rem auto 0;padding:0 clamp(1.5rem,4vw,3.5rem);">
    <div style="display:flex;gap:0.4rem;align-items:center;">
      ${dots}
      <span id="${id}-counter" style="margin-left:auto;font-size:0.75rem;color:${tokens.muted};font-feature-settings:'tnum';letter-spacing:0.04em;">01 / ${String(images.length).padStart(2,'0')}</span>
    </div>
  </div>
</section>

<script>
(function(){
  var track = document.getElementById('${id}');
  var btnPrev = document.getElementById('${id}-prev');
  var btnNext = document.getElementById('${id}-next');
  if(!track||!btnPrev||!btnNext) return;

  var total = ${images.length};
  var cur = 0;
  var isDragging = false, startX = 0, scrollLeft = 0;

  // ── Tilt effect ──
  window.tiltEnter_${id} = function(el) {
    el.querySelector('.${id}-spot').style.opacity = '1';
  };
  window.tiltLeave_${id} = function(el) {
    el.style.transform = '';
    el.querySelector('.${id}-spot').style.opacity = '0';
    var img = el.querySelector('.${id}-img');
    if(img) img.style.transform = '';
  };
  window.tiltMove_${id} = function(el, e) {
    var r = el.getBoundingClientRect();
    var x = e.clientX - r.left, y = e.clientY - r.top;
    var cx = r.width / 2, cy = r.height / 2;
    var rx = (y - cy) / cy * 6;
    var ry = (x - cx) / cx * -6;
    el.style.transform = 'perspective(900px) rotateX('+rx+'deg) rotateY('+ry+'deg) scale3d(1.02,1.02,1.02)';
    el.style.boxShadow = '0 20px 60px rgba(0,0,0,0.5)';
    el.querySelector('.${id}-spot').style.setProperty('--mx', x+'px');
    el.querySelector('.${id}-spot').style.setProperty('--my', y+'px');
    var img = el.querySelector('.${id}-img');
    if(img) img.style.transform = 'scale(1.04) translate('+((x-cx)/cx*-4)+'px,'+((y-cy)/cy*-4)+'px)';
  };

  // ── Slide navigation ──
  function slideW() {
    var s = track.querySelector('.${id}-slide');
    return s ? s.offsetWidth + 20 : 0;
  }

  function updateDots(idx) {
    for(var i=0;i<total;i++){
      var d = document.getElementById('${id}-dot-'+i);
      if(!d) continue;
      d.style.background = i===idx ? '${tokens.accent}' : '${tokens.muted}40';
      d.style.width = i===idx ? '2rem' : '0.4rem';
    }
    var counter = document.getElementById('${id}-counter');
    if(counter) counter.textContent = String(idx+1).padStart(2,'0')+' / '+String(total).padStart(2,'0');
  }

  window.goTo_${id} = function(idx) {
    cur = Math.max(0, Math.min(idx, total-1));
    track.scrollTo({ left: slideW() * cur, behavior: 'smooth' });
    updateDots(cur);
  };

  btnPrev.addEventListener('click', function(){ window.goTo_${id}(cur-1); });
  btnNext.addEventListener('click', function(){ window.goTo_${id}(cur+1); });

  // Sync on manual scroll
  track.addEventListener('scroll', function(){
    var sw = slideW();
    if(!sw) return;
    var idx = Math.round(track.scrollLeft / sw);
    if(idx !== cur){ cur = idx; updateDots(cur); }
  });

  // ── Drag to scroll ──
  track.addEventListener('mousedown', function(e){
    isDragging = true;
    track.style.cursor = 'grabbing';
    startX = e.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
    e.preventDefault();
  });
  document.addEventListener('mouseup', function(){
    if(!isDragging) return;
    isDragging = false;
    track.style.cursor = 'grab';
    // Snap to nearest
    var sw = slideW();
    if(sw) window.goTo_${id}(Math.round(track.scrollLeft / sw));
  });
  document.addEventListener('mousemove', function(e){
    if(!isDragging) return;
    e.preventDefault();
    track.scrollLeft = scrollLeft - (e.pageX - track.offsetLeft - startX) * 1.2;
  });

  // ── Autoplay ──
  var timer = setInterval(function(){
    window.goTo_${id}(cur+1 < total ? cur+1 : 0);
  }, 4500);
  track.addEventListener('mouseenter', function(){ clearInterval(timer); });
  track.addEventListener('mouseleave', function(){
    timer = setInterval(function(){
      window.goTo_${id}(cur+1 < total ? cur+1 : 0);
    }, 4500);
  });
})();
</script>`;
}
