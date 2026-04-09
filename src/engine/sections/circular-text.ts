import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { pickVariant, btn, RADIUS_MAP, reveal } from './utils.js';

export function renderCircularText(
  brand: BrandCard,
  tokens: DesignTokens,
  data: { personality?: string } & Record<string, any> = {},
): string {
  const { copy } = brand;
  const layout = data.personality ? pickVariant(data.personality) : 'cinematic';
  const isBrutalist = layout === 'brutalist';
  const isEditorial = layout === 'editorial' || layout === 'deco';

  const radius = RADIUS_MAP[tokens.radius] ?? '50%';
  const sectionBg = isEditorial ? tokens.surface : tokens.bg;
  const ctId = `ct_${Math.random().toString(36).slice(2, 7)}`;

  // Circular text = brand name repeated or tagline
  const circText = `${brand.name.toUpperCase()} · ${copy.tagline.toUpperCase()} · `;
  // Repeat to fill circle
  const repeated = circText.repeat(2);

  const cta = btn(tokens, 'primary', copy.cta);

  return `
<section style="padding:5rem 2rem;background:${sectionBg};display:flex;align-items:center;justify-content:center;gap:4rem;flex-wrap:wrap;min-height:50vh;">
  <!-- Circular rotating SVG badge -->
  <div style="position:relative;width:14rem;height:14rem;flex-shrink:0;">
    <svg viewBox="0 0 200 200" width="100%" height="100%" id="${ctId}-svg" style="animation:${ctId}Spin 18s linear infinite;">
      <defs>
        <path id="${ctId}-circle" d="M100,100 m-75,0 a75,75 0 1,1 150,0 a75,75 0 1,1 -150,0"/>
      </defs>
      <text font-size="${isBrutalist ? '11' : '10'}" font-weight="${isBrutalist ? '700' : '400'}" font-style="${isEditorial ? 'italic' : 'normal'}" letter-spacing="2" fill="${tokens.text}" font-family="${tokens.displayFont}, serif">
        <textPath href="#${ctId}-circle">${repeated}</textPath>
      </text>
    </svg>
    <!-- Center mark -->
    <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;">
      <div style="width:4.5rem;height:4.5rem;border-radius:50%;background:${tokens.accent};display:flex;align-items:center;justify-content:center;">
        <span style="font-size:1.25rem;color:#fff;font-weight:700;">✦</span>
      </div>
    </div>
  </div>

  <!-- Content -->
  <div style="max-width:28rem;">
    ${reveal(`<p style="font-size:0.75rem;letter-spacing:0.15em;text-transform:uppercase;color:${tokens.muted};margin-bottom:1rem;">${brand.name}</p>`, 'fadeLeft', 0)}
    ${reveal(`<h2 style="font-size:clamp(2rem,4vw,3.25rem);font-weight:${isBrutalist ? '900' : isEditorial ? '300' : '700'};letter-spacing:-0.03em;line-height:1.1;color:${tokens.text};font-family:'${tokens.displayFont}',serif;font-style:${isEditorial ? 'italic' : 'normal'};text-transform:${isBrutalist ? 'uppercase' : 'none'};margin-bottom:1rem;">${copy.headline}</h2>`, 'fadeLeft', 100)}
    ${reveal(`<p style="font-size:0.95rem;color:${tokens.muted};line-height:1.7;margin-bottom:2rem;">${copy.description ?? copy.tagline}</p>`, 'fadeLeft', 200)}
    ${reveal(cta, 'fadeLeft', 300)}
  </div>
</section>
<style>
@keyframes ${ctId}Spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
</style>`;
}
