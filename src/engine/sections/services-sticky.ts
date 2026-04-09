import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { sectionLabel, SPACING_MAP, RADIUS_MAP, t, pickVariant, reveal, revealStagger, glassCard, gradientText } from './utils.js';

export function renderServicesSticky(
  brand: BrandCard,
  tokens: DesignTokens,
  data: { personality?: string } & Record<string, any> = {},
): string {
  const { copy } = brand;
  const sp = SPACING_MAP[tokens.spacing];
  const r = RADIUS_MAP[tokens.radius];
  const services = copy.services ?? [];
  const layout = data.personality ? pickVariant(data.personality) : 'cinematic';

  // ── BRUTALIST — bordered items, accent numbers ──────────────────────────
  if (layout === 'brutalist' || layout === 'tech') {
    return `
<section id="services" style="padding:${sp.section};background:${tokens.bg};border-top:2px solid ${tokens.accent}30;">
  <div style="max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1.2fr;gap:clamp(3rem,6vw,8rem);align-items:start;">
    <div style="position:sticky;top:8rem;">
      ${reveal(`<h2 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(2rem,5vw,3.5rem);font-weight:900;line-height:1;letter-spacing:-0.04em;color:${tokens.text};text-transform:uppercase;margin-bottom:1.5rem;">${copy.heroLine}</h2>`, 'fadeLeft', 0)}
      ${reveal(`<p style="font-size:0.95rem;color:${tokens.muted};line-height:1.8;max-width:36ch;">${copy.description}</p>`, 'fadeLeft', 100)}
      ${reveal(`<div style="width:3rem;height:3px;background:${tokens.accent};margin-top:2rem;"></div>`, 'fadeLeft', 200)}
    </div>
    <div style="border-top:2px solid ${tokens.muted}20;">
      ${services.map((svc, i) => reveal(`
      <div style="padding:2rem 0;border-bottom:2px solid ${tokens.muted}15;display:flex;align-items:flex-start;gap:2rem;transition:padding-left 0.3s;" onmouseover="this.style.paddingLeft='1rem'" onmouseout="this.style.paddingLeft='0'">
        <span style="font-family:'${tokens.displayFont}',serif;font-size:2.5rem;font-weight:900;line-height:1;flex-shrink:0;width:3rem;">${gradientText(tokens, String(i + 1).padStart(2, '0'), 'span', 'font-size:inherit;font-weight:inherit;')}</span>
        <div style="flex:1;">
          <h3 style="font-size:1.2rem;font-weight:700;color:${tokens.text};letter-spacing:-0.02em;margin-bottom:0.5rem;text-transform:uppercase;">${svc}</h3>
          <p style="font-size:0.85rem;color:${tokens.muted};line-height:1.75;">${t('services.desc', brand.language)}</p>
        </div>
        <span style="color:${tokens.accent};font-size:1.25rem;flex-shrink:0;transition:transform 0.3s;" onmouseover="this.style.transform='translateX(6px)'" onmouseout="this.style.transform=''">→</span>
      </div>`, 'fadeRight', i * 80)).join('')}
    </div>
  </div>
</section>`;
  }

  // ── EDITORIAL / MINIMAL — refined, thin rules ──────────────────────────
  if (layout === 'editorial' || layout === 'minimal' || layout === 'deco') {
    return `
<section id="services" style="padding:${sp.section};background:${tokens.bg};">
  <div style="max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1.2fr;gap:clamp(3rem,6vw,8rem);align-items:start;">
    <div style="position:sticky;top:8rem;">
      ${reveal(sectionLabel(tokens, t('label.services', brand.language)), 'fadeUp', 0)}
      ${reveal(`<h2 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(2rem,5vw,3.5rem);font-weight:400;font-style:italic;line-height:1.05;letter-spacing:-0.04em;color:${tokens.text};margin-bottom:1.5rem;">${copy.heroLine}</h2>`, 'fadeUp', 80)}
      ${reveal(`<p style="font-size:0.95rem;color:${tokens.muted};line-height:1.8;max-width:36ch;">${copy.description}</p>`, 'fadeUp', 160)}
    </div>
    <div>
      ${services.map((svc, i) => reveal(`
      <div style="padding:2rem 0;border-bottom:1px solid ${tokens.muted}15;display:flex;align-items:center;gap:2rem;transition:padding-left 0.3s;" onmouseover="this.style.paddingLeft='0.5rem'" onmouseout="this.style.paddingLeft='0'">
        <span style="font-family:'${tokens.displayFont}',serif;font-size:0.9rem;color:${tokens.muted};font-weight:300;flex-shrink:0;width:2rem;">${String(i + 1).padStart(2, '0')}</span>
        <h3 style="font-family:'${tokens.displayFont}',serif;font-size:1.25rem;font-weight:500;color:${tokens.text};letter-spacing:-0.02em;flex:1;transition:color 0.2s;" onmouseover="this.style.color='${tokens.accent}'" onmouseout="this.style.color='${tokens.text}'">${svc}</h3>
        <span style="color:${tokens.accent};font-size:0.8rem;transition:transform 0.3s;" onmouseover="this.style.transform='translateX(4px)'" onmouseout="this.style.transform=''">→</span>
      </div>`, 'fadeUp', i * 80)).join('')}
    </div>
  </div>
</section>`;
  }

  // ── ORGANIC — glass card items ──────────────────────────────────────────
  if (layout === 'organic') {
    return `
<section id="services" style="padding:${sp.section};background:${tokens.surface};position:relative;overflow:hidden;">
  <div style="position:absolute;bottom:15%;right:10%;width:250px;height:250px;border-radius:50%;background:${tokens.accent}06;filter:blur(80px);animation:float 12s ease-in-out infinite;pointer-events:none;"></div>
  <div style="max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1.2fr;gap:clamp(3rem,6vw,8rem);align-items:start;">
    <div style="position:sticky;top:8rem;">
      ${reveal(sectionLabel(tokens, t('label.services', brand.language)), 'fadeUp', 0)}
      ${reveal(`<h2 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(2rem,5vw,3.5rem);font-weight:700;line-height:1.05;letter-spacing:-0.04em;color:${tokens.text};margin-bottom:1.5rem;">${copy.heroLine}</h2>`, 'fadeUp', 80)}
      ${reveal(`<p style="font-size:0.95rem;color:${tokens.muted};line-height:1.8;max-width:36ch;">${copy.description}</p>`, 'fadeUp', 160)}
    </div>
    <div style="display:flex;flex-direction:column;gap:1rem;">
      ${services.map((svc, i) => reveal(glassCard(tokens, `
        <div style="display:flex;align-items:flex-start;gap:1.25rem;">
          <span style="width:2.25rem;height:2.25rem;border-radius:50%;background:linear-gradient(135deg,${tokens.accent}25,${tokens.accent}08);display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;color:${tokens.accent};flex-shrink:0;">${i + 1}</span>
          <div style="flex:1;">
            <h3 style="font-size:1.1rem;font-weight:600;color:${tokens.text};letter-spacing:-0.02em;margin-bottom:0.4rem;">${svc}</h3>
            <p style="font-size:0.85rem;color:${tokens.muted};line-height:1.75;">${t('services.desc', brand.language)}</p>
          </div>
        </div>
      `, { padding: '1.75rem', hover: true }), 'fadeRight', i * 80)).join('')}
    </div>
  </div>
</section>`;
  }

  // ── DEFAULT — classic sticky left ──────────────────────────────────────
  return `
<section id="services" style="padding:${sp.section};background:${tokens.bg};">
  <div style="max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1.2fr;gap:clamp(3rem,6vw,8rem);align-items:start;">
    <div style="position:sticky;top:8rem;">
      ${reveal(sectionLabel(tokens, t('label.services', brand.language)), 'fadeLeft', 0)}
      ${reveal(`<h2 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(2rem,5vw,3.5rem);font-weight:700;line-height:1.05;letter-spacing:-0.04em;color:${tokens.text};margin-bottom:1.5rem;">${copy.heroLine}</h2>`, 'fadeLeft', 80)}
      ${reveal(`<p style="font-size:0.95rem;color:${tokens.muted};line-height:1.8;max-width:36ch;">${copy.description}</p>`, 'fadeLeft', 160)}
    </div>
    <div>
      ${services.map((svc, i) => reveal(`
      <div class="hover-glow" style="padding:2.5rem 0;border-bottom:1px solid ${tokens.muted}15;display:flex;align-items:flex-start;gap:2rem;border:1px solid transparent;border-radius:${r};transition:padding 0.3s,border-color 0.3s;" onmouseover="this.style.padding='2.5rem 1.5rem';this.style.borderColor='${tokens.muted}15'" onmouseout="this.style.padding='2.5rem 0';this.style.borderColor='transparent'">
        <span style="font-family:'${tokens.displayFont}',serif;font-size:3rem;font-weight:700;line-height:1;flex-shrink:0;width:3rem;">${gradientText(tokens, String(i + 1).padStart(2, '0'), 'span', 'font-size:inherit;font-weight:inherit;opacity:0.4;')}</span>
        <div style="flex:1;">
          <h3 style="font-size:1.35rem;font-weight:600;color:${tokens.text};letter-spacing:-0.02em;margin-bottom:0.5rem;">${svc}</h3>
          <p style="font-size:0.9rem;color:${tokens.muted};line-height:1.75;">${t('services.desc', brand.language)}</p>
        </div>
        <span style="color:${tokens.accent};font-size:1.25rem;flex-shrink:0;transition:transform 0.3s;" onmouseover="this.style.transform='translateX(6px)'" onmouseout="this.style.transform=''">→</span>
      </div>`, 'fadeUp', i * 80)).join('')}
    </div>
  </div>
</section>`;
}
