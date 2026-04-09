import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { sectionLabel, t, pickVariant, SPACING_MAP, reveal, btn } from './utils.js';

/**
 * Gradient Stroke — animated gradient flowing along outlined text.
 * Brand name or tagline rendered as giant outlined text with gradient animation.
 * Great as a section divider, brand accent, or CTA backdrop.
 * Adapted from modules/gradient-stroke.html.
 */
export function renderGradientStroke(
  brand: BrandCard,
  tokens: DesignTokens,
  data: { personality?: string } & Record<string, any> = {},
): string {
  const { copy } = brand;
  const layout = data.personality ? pickVariant(data.personality) : 'cinematic';
  const sp = SPACING_MAP[tokens.spacing];

  const sid = `gs_${Math.random().toString(36).slice(2, 7)}`;

  const isBrutalist = layout === 'brutalist' || layout === 'tech';
  const isEditorial  = layout === 'editorial' || layout === 'deco';

  // Build gradient from brand tokens
  const highlight = tokens.highlight ?? tokens.surface2 ?? tokens.accent;
  const grad = `linear-gradient(90deg, ${tokens.accent}, ${highlight}, ${tokens.accent})`;

  // The big stroke text
  const strokeWord = (brand.name ?? copy.heroLine ?? 'STUDIO').toUpperCase();
  const filledWord = (copy.tagline ?? copy.heroLine ?? '').toUpperCase().split(' ').slice(0, 3).join(' ') || strokeWord;

  const fontWeight = isBrutalist ? '900' : '800';
  const letterSpacing = isBrutalist ? '-0.06em' : '-0.05em';

  return `
<section id="brand-accent" style="padding:${sp.section};background:${tokens.bg};overflow:hidden;position:relative;">
  <!-- Subtle background grid -->
  <div style="position:absolute;inset:0;background-image:linear-gradient(${tokens.muted}08 1px,transparent 1px),linear-gradient(90deg,${tokens.muted}08 1px,transparent 1px);background-size:48px 48px;pointer-events:none;"></div>

  <div style="max-width:1200px;margin:0 auto;padding:0 clamp(1.5rem,4vw,3rem);position:relative;z-index:1;">
    ${reveal(`<div style="text-align:center;margin-bottom:3rem;">
      ${sectionLabel(tokens, brand.name)}
    </div>`, 'fadeUp', 0)}

    <!-- Outlined animated gradient text -->
    <div style="text-align:center;overflow:hidden;margin-bottom:1.5rem;">
      ${reveal(`<div class="${sid}-stroke" style="
        font-family:'${tokens.displayFont}',serif;
        font-size:clamp(4rem,18vw,16rem);
        font-weight:${fontWeight};
        letter-spacing:${letterSpacing};
        text-transform:uppercase;
        line-height:0.88;
        display:block;
        color:transparent;
        background:${grad};
        background-size:300% 100%;
        -webkit-background-clip:text;
        background-clip:text;
        -webkit-text-fill-color:transparent;
        -webkit-text-stroke:${isBrutalist ? '2px' : '1.5px'} transparent;
        animation:${sid}GradMove 6s linear infinite;
        user-select:none;cursor:default;
      ">${strokeWord}</div>`, 'scaleIn', 0)}
    </div>

    <!-- Divider -->
    <div style="display:flex;align-items:center;gap:1.5rem;margin:2rem 0;">
      <div style="flex:1;height:1px;background:${tokens.muted}15;"></div>
      <div style="width:6px;height:6px;border-radius:50%;background:${tokens.accent};"></div>
      <div style="flex:1;height:1px;background:${tokens.muted}15;"></div>
    </div>

    <!-- Filled gradient text (smaller) -->
    <div style="text-align:center;overflow:hidden;margin-bottom:3rem;">
      ${reveal(`<div class="${sid}-filled" style="
        font-family:'${tokens.displayFont}',serif;
        font-size:clamp(2.5rem,10vw,9rem);
        font-weight:${fontWeight};
        letter-spacing:${letterSpacing};
        text-transform:uppercase;
        line-height:0.92;
        background:${grad};
        background-size:200% 200%;
        -webkit-background-clip:text;
        background-clip:text;
        -webkit-text-fill-color:transparent;
        animation:${sid}GradShift 4s ease infinite;
        user-select:none;cursor:default;
      ">${filledWord}</div>`, 'scaleIn', 100)}
    </div>

    ${reveal(`<div style="text-align:center;">
      <p style="font-size:1rem;color:${tokens.muted};max-width:48ch;margin:0 auto 2rem;line-height:1.75;">${copy.description ?? copy.tagline ?? ''}</p>
      <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">
        ${btn(tokens, 'primary', t('hero.explore', brand.language), '#services')}
        ${btn(tokens, 'ghost', t('hero.nav_contact', brand.language), '#contact')}
      </div>
    </div>`, 'fadeUp', 200)}
  </div>
</section>
<style>
@keyframes ${sid}GradMove {
  0%   { background-position: 0% 50%; }
  100% { background-position: 300% 50%; }
}
@keyframes ${sid}GradShift {
  0%,100% { background-position: 0% 50%; }
  50%     { background-position: 100% 50%; }
}
</style>`;
}
