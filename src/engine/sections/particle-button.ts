import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { sectionLabel, t, pickVariant, SPACING_MAP, RADIUS_MAP, reveal, gradientText } from './utils.js';

/**
 * Particle Button CTA — call-to-action section with buttons that explode in particles on click.
 * Tactile feedback that celebrates the conversion action with burst animations.
 * Adapted from modules/particle-button.html.
 */
export function renderParticleButton(
  brand: BrandCard,
  tokens: DesignTokens,
  data: { personality?: string } & Record<string, any> = {},
): string {
  const { copy } = brand;
  const layout = data.personality ? pickVariant(data.personality) : 'cinematic';
  const sp = SPACING_MAP[tokens.spacing];
  const r = RADIUS_MAP[tokens.radius];

  const sid = `pb_${Math.random().toString(36).slice(2, 7)}`;

  const isBrutalist = layout === 'brutalist' || layout === 'tech';
  const isEditorial  = layout === 'editorial' || layout === 'deco';

  const fontWeight = isBrutalist ? '900' : isEditorial ? '300' : '700';
  const fontStyle  = isEditorial ? 'italic' : 'normal';

  const sectionBg = (layout === 'cinematic' || layout === 'maximalist')
    ? tokens.surface
    : tokens.bg;

  // CTA headline
  const headline = copy.heroLine ?? copy.tagline ?? brand.name;

  return `
<section id="contact-cta" style="padding:${sp.section};background:${sectionBg};position:relative;overflow:hidden;text-align:center;">
  <!-- Background accent glow -->
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse 50% 60% at 50% 100%, ${tokens.accent}08, transparent);pointer-events:none;"></div>

  ${isBrutalist
    ? `<div style="position:absolute;top:0;left:0;right:0;height:4px;background:${tokens.accent};"></div>`
    : ''}

  <div style="max-width:720px;margin:0 auto;padding:0 clamp(1.5rem,4vw,3rem);position:relative;z-index:1;">
    ${reveal(`<div style="margin-bottom:1rem;">
      ${sectionLabel(tokens, t('label.get_in_touch', brand.language))}
    </div>`, 'fadeUp', 0)}

    ${reveal(`<h2 style="
      font-family:'${tokens.displayFont}',serif;
      font-size:clamp(2rem,5vw,4rem);
      font-weight:${fontWeight};
      font-style:${fontStyle};
      color:${tokens.text};
      letter-spacing:-0.04em;
      line-height:1.05;
      margin-bottom:1.25rem;
    ">${gradientText(tokens, headline, 'span')}</h2>`, 'fadeUp', 100)}

    ${reveal(`<p style="font-size:1.05rem;color:${tokens.muted};max-width:48ch;margin:0 auto 3rem;line-height:1.8;">${copy.description ?? copy.tagline ?? ''}</p>`, 'fadeUp', 150)}

    ${reveal(`<div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">
      <button
        class="${sid}-btn"
        data-type="particles"
        data-color="${tokens.accent}"
        onclick="location.href='#contact'"
        style="
          padding:1rem 2.5rem;
          background:${tokens.accent};
          color:#fff;
          border:none;
          border-radius:${r};
          font-size:0.9rem;
          font-weight:600;
          cursor:pointer;
          position:relative;
          transition:transform 0.2s, box-shadow 0.2s;
          font-family:inherit;
        "
        onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 12px 32px ${tokens.accent}45'"
        onmouseout="this.style.transform='';this.style.boxShadow=''"
      >${t('hero.explore', brand.language)}</button>

      <button
        class="${sid}-btn"
        data-type="ring"
        data-color="${tokens.accent}"
        onclick="location.href='tel:'"
        style="
          padding:1rem 2.5rem;
          background:transparent;
          color:${tokens.text};
          border:1px solid ${tokens.muted}40;
          border-radius:${r};
          font-size:0.9rem;
          font-weight:600;
          cursor:pointer;
          position:relative;
          transition:border-color 0.2s, color 0.2s;
          font-family:inherit;
        "
        onmouseover="this.style.borderColor='${tokens.accent}';this.style.color='${tokens.accent}'"
        onmouseout="this.style.borderColor='${tokens.muted}40';this.style.color='${tokens.text}'"
      >${t('hero.nav_contact', brand.language)}</button>
    </div>`, 'fadeUp', 200)}
  </div>
</section>
<script>
(function(){
  document.querySelectorAll('.${sid}-btn').forEach(function(btn){
    btn.addEventListener('click', function(e) {
      var rect = btn.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      var type  = btn.dataset.type;
      var color = btn.dataset.color;
      if (type === 'particles') spawnParticles(cx, cy, color);
      else if (type === 'ring') spawnRing(cx, cy, color);
    });
  });

  function spawnParticles(cx, cy, color) {
    for (var i = 0; i < 18; i++) {
      var p = document.createElement('div');
      p.style.cssText = [
        'position:fixed',
        'width:7px',
        'height:7px',
        'border-radius:50%',
        'pointer-events:none',
        'z-index:9999',
        'background:' + color,
        'left:' + cx + 'px',
        'top:' + cy + 'px',
        'transform:translate(-50%,-50%)',
      ].join(';');
      document.body.appendChild(p);
      var angle = (i / 18) * Math.PI * 2;
      var distance = 60 + Math.random() * 80;
      var tx = Math.cos(angle) * distance;
      var ty = Math.sin(angle) * distance;
      var dur = 500 + Math.random() * 400;
      p.animate([
        { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
        { transform: 'translate(calc(-50% + ' + tx + 'px), calc(-50% + ' + ty + 'px)) scale(0)', opacity: 0 }
      ], { duration: dur, easing: 'cubic-bezier(0,0,0.2,1)', fill: 'forwards' }).onfinish = function(){ p.remove(); };
    }
  }

  function spawnRing(cx, cy, color) {
    var ring = document.createElement('div');
    ring.style.cssText = [
      'position:fixed',
      'border-radius:50%',
      'pointer-events:none',
      'z-index:9998',
      'border:2px solid ' + color,
      'left:' + cx + 'px',
      'top:' + cy + 'px',
      'width:0',
      'height:0',
      'transform:translate(-50%,-50%)',
    ].join(';');
    document.body.appendChild(ring);
    ring.animate([
      { width: '0px', height: '0px', opacity: 0.8 },
      { width: '160px', height: '160px', opacity: 0 }
    ], { duration: 600, easing: 'cubic-bezier(0,0,0.2,1)', fill: 'forwards' }).onfinish = function(){ ring.remove(); };
  }
})();
</script>`;
}
