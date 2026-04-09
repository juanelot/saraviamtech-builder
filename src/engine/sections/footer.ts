import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { RADIUS_MAP, t, pickVariant, gradientText, decorativeLine } from './utils.js';

export function renderFooter(
  brand: BrandCard,
  tokens: DesignTokens,
  data: { personality?: string } & Record<string, any> = {},
): string {
  const { copy } = brand;
  const services = copy.services ?? [];
  const r = RADIUS_MAP[tokens.radius];
  const layout = data.personality ? pickVariant(data.personality) : 'cinematic';

  const socialBtns = ['TW', 'IG', 'LI'].map(s => `
    <a href="#" class="hover-lift" style="width:2.25rem;height:2.25rem;border-radius:${r};background:${tokens.surface};border:1px solid ${tokens.muted}20;display:flex;align-items:center;justify-content:center;font-size:0.65rem;font-weight:700;color:${tokens.muted};text-decoration:none;transition:all 0.3s cubic-bezier(.16,1,.3,1);letter-spacing:0.04em;" onmouseover="this.style.borderColor='${tokens.accent}';this.style.color='${tokens.accent}';this.style.background='${tokens.accent}10'" onmouseout="this.style.borderColor='${tokens.muted}20';this.style.color='${tokens.muted}';this.style.background='${tokens.surface}'">${s}</a>`).join('');

  // ── BRUTALIST — accent top border, minimal ────────────────────────────────
  if (layout === 'brutalist' || layout === 'tech') {
    return `
${decorativeLine(tokens, 'zigzag')}
<footer style="background:${tokens.bg};border-top:4px solid ${tokens.accent};">
  <div style="max-width:1200px;margin:0 auto;padding:4rem clamp(2rem,5vw,5rem) 2.5rem;">
    <div style="display:grid;grid-template-columns:1fr auto;gap:4rem;margin-bottom:4rem;flex-wrap:wrap;">
      <div>
        <div style="font-family:'${tokens.displayFont}',serif;font-weight:900;font-size:clamp(2rem,5vw,3.5rem);color:${tokens.text};margin-bottom:0.75rem;letter-spacing:-0.04em;line-height:0.9;text-transform:uppercase;">${brand.name}</div>
        <p style="font-size:0.85rem;color:${tokens.muted};line-height:1.7;max-width:36ch;">${copy.tagline}</p>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;justify-content:space-between;">
        <div style="display:flex;gap:0.5rem;">${socialBtns}</div>
        <a href="mailto:hello@${brand.slug}.com" style="font-size:0.85rem;color:${tokens.accent};text-decoration:none;font-weight:600;">hello@${brand.slug}.com</a>
      </div>
    </div>
    <div style="border-top:1px solid ${tokens.muted}15;padding-top:2rem;display:flex;align-items:center;justify-content:space-between;gap:2rem;flex-wrap:wrap;">
      <div style="display:flex;gap:2rem;flex-wrap:wrap;">
        ${services.slice(0, 5).map(s => `<a href="#services" style="font-size:0.8rem;color:${tokens.muted};text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='${tokens.text}'" onmouseout="this.style.color='${tokens.muted}'">${s}</a>`).join('')}
      </div>
      <div style="font-size:0.72rem;color:${tokens.muted};">© ${new Date().getFullYear()} ${brand.name}. Powered by <a href="#" style="color:${tokens.accent};text-decoration:none;">SaraviamTech</a></div>
    </div>
  </div>
</footer>`;
  }

  // ── EDITORIAL / MINIMAL — centered, type-focused ──────────────────────────
  if (layout === 'editorial' || layout === 'minimal' || layout === 'deco') {
    return `
${decorativeLine(tokens, 'dots')}
<footer style="background:${tokens.bg};border-top:1px solid ${tokens.muted}15;">
  <div style="max-width:900px;margin:0 auto;padding:5rem clamp(2rem,5vw,5rem) 3rem;text-align:center;">
    <div style="font-family:'${tokens.displayFont}',serif;font-weight:700;font-size:clamp(1.5rem,4vw,2.5rem);letter-spacing:-0.04em;font-style:italic;margin-bottom:0.75rem;">${gradientText(tokens, brand.name, 'span', 'font-size:inherit;font-weight:inherit;')}</div>
    <p style="font-size:0.875rem;color:${tokens.muted};line-height:1.75;max-width:44ch;margin:0 auto 2rem;">${copy.tagline}</p>
    <div style="display:flex;justify-content:center;gap:2.5rem;flex-wrap:wrap;margin-bottom:2.5rem;">
      ${services.slice(0, 5).map(s => `<a href="#services" style="font-size:0.8rem;color:${tokens.muted};text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='${tokens.text}'" onmouseout="this.style.color='${tokens.muted}'">${s}</a>`).join('')}
    </div>
    <div style="display:flex;justify-content:center;gap:0.5rem;margin-bottom:3rem;">${socialBtns}</div>
    <div style="padding-top:2rem;border-top:1px solid ${tokens.muted}12;font-size:0.72rem;color:${tokens.muted};">© ${new Date().getFullYear()} ${brand.name}. ${t('footer.rights', brand.language)} — Powered by <a href="#" style="color:${tokens.accent};text-decoration:none;">SaraviamTech</a></div>
  </div>
</footer>`;
  }

  // ── DEFAULT: 3-column grid ─────────────────────────────────────────────────
  const bottomBar = `
    <div style="padding-top:2rem;border-top:1px solid ${tokens.muted}12;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;">
      <div style="font-size:0.72rem;color:${tokens.muted};">© ${new Date().getFullYear()} ${brand.name}. ${t('footer.rights', brand.language)}</div>
      <div style="font-size:0.72rem;color:${tokens.muted};">Powered by <a href="#" style="color:${tokens.accent};text-decoration:none;">SaraviamTech</a></div>
    </div>`;

  return `
${decorativeLine(tokens, 'wave')}
<footer style="background:${tokens.bg};border-top:1px solid ${tokens.muted}15;">
  <div style="max-width:1200px;margin:0 auto;padding:5rem 2.5rem 2.5rem;">
    <div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:4rem;margin-bottom:4rem;flex-wrap:wrap;">
      <div>
        <div style="font-family:'${tokens.displayFont}',serif;font-weight:700;font-size:1.35rem;letter-spacing:-0.03em;margin-bottom:1rem;">${gradientText(tokens, brand.name, 'span', 'font-size:inherit;font-weight:inherit;')}</div>
        <p style="font-size:0.875rem;color:${tokens.muted};line-height:1.75;max-width:32ch;margin-bottom:1.5rem;">${copy.tagline}</p>
        <div style="display:flex;gap:0.75rem;">${socialBtns}</div>
      </div>
      <div>
        <div style="font-size:0.7rem;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:${tokens.muted};margin-bottom:1rem;">${t('footer.services', brand.language)}</div>
        ${services.slice(0, 5).map(s => `<div style="margin-bottom:0.5rem;"><a href="#services" style="font-size:0.875rem;color:${tokens.muted};text-decoration:none;line-height:1.5;transition:color 0.2s;" onmouseover="this.style.color='${tokens.text}'" onmouseout="this.style.color='${tokens.muted}'">${s}</a></div>`).join('')}
      </div>
      <div>
        <div style="font-size:0.7rem;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:${tokens.muted};margin-bottom:1rem;">${t('footer.contact', brand.language)}</div>
        <div style="font-size:0.875rem;color:${tokens.muted};margin-bottom:0.5rem;"><a href="mailto:hello@${brand.slug}.com" style="color:${tokens.accent};text-decoration:none;">hello@${brand.slug}.com</a></div>
        <div style="font-size:0.875rem;color:${tokens.muted};margin-bottom:0.5rem;">+1 (800) 000-0000</div>
      </div>
    </div>
    ${bottomBar}
  </div>
</footer>`;
}
