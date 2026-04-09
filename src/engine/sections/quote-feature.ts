import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { SPACING_MAP, RADIUS_MAP, pickVariant, reveal, glassCard, gradientText, decorativeLine } from './utils.js';

export function renderQuoteFeature(
  brand: BrandCard,
  tokens: DesignTokens,
  data: { quote?: string; author?: string; role?: string; personality?: string } = {},
): string {
  const sp = SPACING_MAP[tokens.spacing];
  const r = RADIUS_MAP[tokens.radius];
  const quote = data.quote ?? brand.copy.description;
  const author = data.author ?? brand.name;
  const role = data.role ?? 'Founder';
  const layout = data.personality ? pickVariant(data.personality) : 'cinematic';

  // ── BRUTALIST — raw, left-aligned, oversized mark ─────────────────────────
  if (layout === 'brutalist' || layout === 'tech') {
    return `
<section style="padding:${sp.section};background:${tokens.surface};position:relative;overflow:hidden;border-top:3px solid ${tokens.accent};">
  <div style="max-width:1000px;margin:0 auto;position:relative;z-index:1;">
    ${reveal(`<div style="font-family:'${tokens.displayFont}',serif;font-size:8rem;font-weight:900;line-height:0.8;letter-spacing:-0.05em;margin-bottom:1rem;">${gradientText(tokens, '"', 'span', 'font-size:inherit;font-weight:inherit;')}</div>`, 'fadeLeft', 0)}
    ${reveal(`<blockquote style="font-family:'${tokens.displayFont}',serif;font-size:clamp(1.5rem,4vw,2.5rem);font-weight:700;line-height:1.25;color:${tokens.text};margin:0 0 2.5rem;letter-spacing:-0.02em;text-transform:uppercase;">${quote}</blockquote>`, 'fadeUp', 100)}
    ${reveal(`<div style="display:flex;align-items:center;gap:1.5rem;">
      <div style="width:3rem;height:2px;background:${tokens.accent};"></div>
      <div>
        <div style="font-size:0.9rem;font-weight:700;color:${tokens.text};letter-spacing:0.04em;">${author}</div>
        <div style="font-size:0.7rem;color:${tokens.muted};letter-spacing:0.12em;text-transform:uppercase;margin-top:0.15rem;">${role}</div>
      </div>
    </div>`, 'fadeUp', 200)}
  </div>
</section>`;
  }

  // ── MINIMAL / EDITORIAL — centered, refined, italic ──────────────────────
  if (layout === 'minimal' || layout === 'deco') {
    return `
<section style="padding:${sp.section};background:${tokens.bg};position:relative;overflow:hidden;">
  <div style="max-width:760px;margin:0 auto;text-align:center;position:relative;z-index:1;">
    ${reveal(`<div style="width:2rem;height:1px;background:${tokens.accent};margin:0 auto 2.5rem;"></div>`, 'scaleIn', 0)}
    ${reveal(`<blockquote style="font-family:'${tokens.displayFont}',serif;font-size:clamp(1.35rem,3.5vw,2.25rem);font-weight:300;font-style:italic;line-height:1.55;color:${tokens.text};margin:0 0 2.5rem;">"${quote}"</blockquote>`, 'fadeUp', 100)}
    ${reveal(`<div style="font-size:0.8rem;font-weight:600;color:${tokens.text};letter-spacing:0.04em;">${author}</div>
    <div style="font-size:0.68rem;color:${tokens.muted};letter-spacing:0.12em;text-transform:uppercase;margin-top:0.25rem;">${role}</div>`, 'fadeUp', 200)}
    ${decorativeLine(tokens, 'dots')}
  </div>
</section>`;
  }

  // ── ORGANIC — glass card with left accent bar ─────────────────────────────
  if (layout === 'organic') {
    return `
<section style="padding:${sp.section};background:${tokens.surface};position:relative;overflow:hidden;">
  <div style="position:absolute;top:20%;right:10%;width:200px;height:200px;border-radius:50%;background:${tokens.accent}06;filter:blur(60px);animation:float 10s ease-in-out infinite;pointer-events:none;"></div>
  <div style="max-width:900px;margin:0 auto;">
    ${reveal(glassCard(tokens, `
      <div style="position:absolute;top:0;left:0;bottom:0;width:4px;background:${tokens.accent};border-radius:4px 0 0 4px;"></div>
      <div style="position:absolute;top:-1rem;right:-1rem;font-family:'${tokens.displayFont}',serif;font-size:10rem;font-weight:700;line-height:1;color:${tokens.accent}08;pointer-events:none;">"</div>
      <blockquote style="font-family:'${tokens.displayFont}',serif;font-size:clamp(1.3rem,3vw,2rem);font-weight:400;font-style:italic;line-height:1.5;color:${tokens.text};margin:0 0 2rem;position:relative;z-index:1;">"${quote}"</blockquote>
      <div style="display:flex;align-items:center;gap:1rem;">
        <div style="width:2.5rem;height:2.5rem;border-radius:50%;background:linear-gradient(135deg,${tokens.accent}30,${tokens.accent}10);display:flex;align-items:center;justify-content:center;font-family:'${tokens.displayFont}',serif;font-weight:700;font-size:1rem;color:${tokens.accent};">${author[0]?.toUpperCase() ?? 'A'}</div>
        <div>
          <div style="font-size:0.875rem;font-weight:600;color:${tokens.text};">${author}</div>
          <div style="font-size:0.72rem;color:${tokens.muted};letter-spacing:0.06em;text-transform:uppercase;">${role}</div>
        </div>
      </div>
    `, { padding: '3rem 3.5rem' }), 'scaleIn', 0)}
  </div>
</section>`;
  }

  // ── DEFAULT: centered with giant gradient quote mark ───────────────────────
  return `
<section style="padding:${sp.section};background:${tokens.surface};position:relative;overflow:hidden;">
  <div style="position:absolute;top:50%;left:2rem;transform:translateY(-50%);font-size:clamp(12rem,20vw,18rem);font-weight:700;line-height:1;color:${tokens.accent}07;font-family:'${tokens.displayFont}',serif;pointer-events:none;user-select:none;animation:pulseGlow 8s ease-in-out infinite;">"</div>
  <div style="max-width:900px;margin:0 auto;text-align:center;position:relative;z-index:1;">
    ${reveal(`<blockquote style="font-family:'${tokens.displayFont}',serif;font-size:clamp(1.5rem,4vw,2.75rem);font-weight:400;font-style:italic;line-height:1.45;color:${tokens.text};margin:0 0 2.5rem;">"${quote}"</blockquote>`, 'fadeUp', 0)}
    ${reveal(`<div style="display:flex;align-items:center;justify-content:center;gap:1rem;">
      <div style="width:2.5rem;height:1px;background:${tokens.accent};"></div>
      <div style="text-align:left;">
        <div style="font-size:0.9rem;font-weight:600;color:${tokens.text};">${author}</div>
        <div style="font-size:0.75rem;color:${tokens.muted};letter-spacing:0.06em;text-transform:uppercase;">${role}</div>
      </div>
    </div>`, 'fadeUp', 150)}
  </div>
</section>`;
}
