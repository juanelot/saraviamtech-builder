import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { RADIUS_MAP, pickVariant, reveal, revealStagger, gradientText, glassCard } from './utils.js';

const DEFAULT_STATS = [
  { n: '200+', label: 'Projects Delivered' },
  { n: '98%', label: 'Client Satisfaction' },
  { n: '10+', label: 'Years of Expertise' },
  { n: '40+', label: 'Industry Awards' },
];

export function renderStatsBand(
  brand: BrandCard,
  tokens: DesignTokens,
  data: { stats?: Array<{ n: string; label: string }>; variant?: string; personality?: string } = {},
): string {
  const stats = data.stats ?? DEFAULT_STATS;
  const layout = data.personality ? pickVariant(data.personality) : 'cinematic';
  const r = RADIUS_MAP[tokens.radius];

  // ── BRUTALIST — stark, number-first, horizontal rules ─────────────────────
  if (layout === 'brutalist' || layout === 'tech') {
    return `
<section style="padding:4rem clamp(2rem,5vw,5rem);background:${tokens.bg};overflow:hidden;position:relative;border-top:2px solid ${tokens.accent}30;border-bottom:2px solid ${tokens.accent}30;">
  <div style="max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(${stats.length},1fr);gap:0;">
    ${stats.map((s, i) => reveal(`
    <div style="padding:2rem;${i < stats.length - 1 ? `border-right:2px solid ${tokens.muted}20;` : ''}position:relative;overflow:hidden;">
      <div style="position:absolute;bottom:-0.5rem;right:0.5rem;font-family:'${tokens.displayFont}',serif;font-size:4.5rem;font-weight:900;color:${tokens.accent}08;line-height:1;pointer-events:none;">${String(i + 1).padStart(2, '0')}</div>
      <div style="font-family:'${tokens.displayFont}',serif;font-size:clamp(2.5rem,5vw,4rem);font-weight:900;line-height:1;letter-spacing:-0.04em;" data-count-to="${s.n}">${gradientText(tokens, s.n, 'span', 'font-size:inherit;font-weight:inherit;')}</div>
      <div style="font-size:0.72rem;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:${tokens.muted};margin-top:0.5rem;">${s.label}</div>
    </div>`, 'fadeUp', i * 100)).join('')}
  </div>
</section>`;
  }

  // ── EDITORIAL / MINIMAL — clean, horizontal, small type ──────────────────
  if (layout === 'editorial' || layout === 'minimal' || layout === 'deco') {
    return `
<section style="padding:5rem clamp(2rem,5vw,5rem);background:${tokens.surface};overflow:hidden;">
  <div style="max-width:1100px;margin:0 auto;">
    <div style="display:grid;grid-template-columns:repeat(${stats.length},1fr);gap:0;border-top:1px solid ${tokens.muted}20;border-bottom:1px solid ${tokens.muted}20;">
      ${stats.map((s, i) => reveal(`
      <div style="padding:2.5rem 2rem;${i < stats.length - 1 ? `border-right:1px solid ${tokens.muted}15;` : ''}text-align:center;">
        <div style="font-family:'${tokens.displayFont}',serif;font-size:clamp(2rem,4.5vw,3.5rem);font-weight:300;line-height:1;color:${tokens.text};letter-spacing:-0.03em;" data-count-to="${s.n}">${s.n}</div>
        <div style="font-size:0.68rem;font-weight:500;letter-spacing:0.14em;text-transform:uppercase;color:${tokens.accent};margin-top:0.75rem;">${s.label}</div>
      </div>`, 'fadeUp', i * 100)).join('')}
    </div>
  </div>
</section>`;
  }

  // ── ORGANIC / WARM — card blocks ──────────────────────────────────────────
  if (layout === 'organic') {
    return `
<section style="padding:5rem clamp(2rem,5vw,5rem);background:${tokens.bg};overflow:hidden;">
  <div style="position:absolute;left:10%;top:20%;width:200px;height:200px;border-radius:50%;background:${tokens.accent}06;filter:blur(60px);animation:float 10s ease-in-out infinite;pointer-events:none;"></div>
  <div style="max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;">
    ${revealStagger(stats.map(s => `
    ${glassCard(tokens, `
      <div style="text-align:center;">
        <div style="font-family:'${tokens.displayFont}',serif;font-size:clamp(2.5rem,5vw,3.5rem);font-weight:700;line-height:1;letter-spacing:-0.04em;" data-count-to="${s.n}">${gradientText(tokens, s.n, 'span', 'font-size:inherit;font-weight:inherit;')}</div>
        <div style="font-size:0.72rem;font-weight:500;letter-spacing:0.1em;text-transform:uppercase;color:${tokens.muted};margin-top:0.5rem;">${s.label}</div>
      </div>
    `, { hover: true })}`), 'scaleIn', 0, 100)}
  </div>
</section>`;
  }

  // ── DEFAULT: accent or surface band ───────────────────────────────────────
  const isAccent = data.variant === 'accent';
  const bg = isAccent ? tokens.accent : tokens.surface;
  const textColor = isAccent ? '#fff' : tokens.text;
  const mutedColor = isAccent ? 'rgba(255,255,255,0.65)' : tokens.muted;

  return `
<section style="padding:4rem 2.5rem;background:${bg};overflow:hidden;position:relative;">
  ${isAccent && tokens.accentGlow ? `<div style="position:absolute;inset:0;background:radial-gradient(ellipse 60% 80% at 50% 50%,rgba(255,255,255,0.08) 0%,transparent 70%);pointer-events:none;"></div>` : ''}
  <div style="max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:2rem;">
    ${stats.map((s, i) => reveal(`
    <div style="flex:1;min-width:160px;text-align:center;${i < stats.length - 1 ? `border-right:1px solid ${isAccent ? 'rgba(255,255,255,0.2)' : tokens.muted + '20'};` : ''}padding:0 2rem;">
      <div style="font-family:'${tokens.displayFont}',serif;font-size:clamp(2.5rem,5vw,4rem);font-weight:700;line-height:1;color:${textColor};letter-spacing:-0.04em;" data-count-to="${s.n}">${s.n}</div>
      <div style="font-size:0.75rem;font-weight:500;letter-spacing:0.1em;text-transform:uppercase;color:${mutedColor};margin-top:0.5rem;">${s.label}</div>
    </div>`, 'fadeUp', i * 100)).join('')}
  </div>
</section>`;
}
