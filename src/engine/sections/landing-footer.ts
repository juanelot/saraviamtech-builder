/**
 * landing-footer.ts
 *
 * Minimal footer for Landing Pages — just logo, tagline, and copyright.
 * No heavy nav columns. Keeps focus on conversion.
 */
import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { t } from './utils.js';

export function renderLandingFooter(
  brand: BrandCard,
  tokens: DesignTokens,
  _data: Record<string, any> = {},
): string {
  const lang = brand.language ?? 'es';
  const year = new Date().getFullYear();

  return `
<footer style="
  padding:2.5rem 2.5rem;
  background:${tokens.surface};
  border-top:1px solid ${tokens.muted}12;
  display:flex;align-items:center;justify-content:space-between;
  flex-wrap:wrap;gap:1rem;
">
  <div>
    <div style="font-family:'${tokens.displayFont}',serif;font-weight:700;font-size:1rem;letter-spacing:-0.03em;color:${tokens.text};margin-bottom:0.25rem;">${brand.name}</div>
    <div style="font-size:0.78rem;color:${tokens.muted};">${brand.copy.tagline}</div>
  </div>
  <div style="font-size:0.75rem;color:${tokens.muted};">
    © ${year} ${brand.name}. ${t('landing.footer.rights', lang)}
  </div>
</footer>`;
}
