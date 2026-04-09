import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { sectionLabel, t, pickVariant } from './utils.js';

export function renderKineticMarquee(
  brand: BrandCard,
  tokens: DesignTokens,
  data: { personality?: string } & Record<string, any> = {},
): string {
  const { copy } = brand;
  const services = copy.services ?? [];
  if (services.length < 2) return '';

  const layout = data.personality ? pickVariant(data.personality) : 'cinematic';

  // Personality-based styling
  const isBrutalist = layout === 'brutalist';
  const isEditorial = layout === 'editorial' || layout === 'deco';

  const fontWeight = isBrutalist ? '900' : isEditorial ? '300' : '700';
  const textTransform = isBrutalist ? 'uppercase' : 'none';
  const fontStyle = isEditorial ? 'italic' : 'normal';
  const fontSize = 'clamp(2rem,5vw,4rem)';

  // Triplicar items para loop seamless
  const items = [...services, ...services, ...services];

  const separator = isBrutalist ? ' ✦ ' : isEditorial ? ' · ' : ' ● ';

  const row1Items = items
    .map(s => `<span style="white-space:nowrap;font-weight:${fontWeight};font-style:${fontStyle};text-transform:${textTransform};">${s}</span><span style="opacity:0.35;margin:0 1.5rem;">${separator}</span>`)
    .join('');

  // Row 2: outlined text (webkit-text-stroke)
  const strokeColor = tokens.accent;
  const row2Items = items
    .map(s => `<span style="white-space:nowrap;font-weight:${fontWeight};font-style:${fontStyle};text-transform:${textTransform};-webkit-text-stroke:1.5px ${strokeColor};color:transparent;">${s}</span><span style="opacity:0.25;margin:0 1.5rem;-webkit-text-stroke:0;color:${tokens.muted};">${separator}</span>`)
    .join('');

  const sectionBg = layout === 'cinematic' || layout === 'maximalist' ? tokens.bg : tokens.surface;

  return `
<section style="overflow:hidden;padding:4rem 0;background:${sectionBg};position:relative;border-top:1px solid ${tokens.muted}12;border-bottom:1px solid ${tokens.muted}12;">
  ${tokens.accentGlow ? `<div style="position:absolute;inset:0;background:radial-gradient(ellipse 40% 80% at 50% 50%,${tokens.accent}06,transparent);pointer-events:none;"></div>` : ''}

  <!-- Row 1: forward -->
  <div style="overflow:hidden;margin-bottom:1.5rem;">
    <div style="display:flex;align-items:center;animation:marquee 22s linear infinite;width:max-content;font-family:'${tokens.displayFont}',serif;font-size:${fontSize};line-height:1;color:${tokens.text};gap:0;">
      ${row1Items}
    </div>
  </div>

  <!-- Row 2: reverse, outlined -->
  <div style="overflow:hidden;">
    <div style="display:flex;align-items:center;animation:marquee 28s linear infinite reverse;width:max-content;font-family:'${tokens.displayFont}',serif;font-size:${fontSize};line-height:1;gap:0;">
      ${row2Items}
    </div>
  </div>
</section>`;
}
