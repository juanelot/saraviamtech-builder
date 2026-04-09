import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { sectionLabel, displayHeading, SPACING_MAP, RADIUS_MAP, t, pickVariant, reveal, revealStagger, glassCard, decorativeLine, gradientText, decorativeDivider } from './utils.js';

export function renderStoryNarrative(
  brand: BrandCard,
  tokens: DesignTokens,
  data: { personality?: string } & Record<string, any> = {},
): string {
  const { copy } = brand;
  const sp = SPACING_MAP[tokens.spacing];
  const r = RADIUS_MAP[tokens.radius];
  const layout = data.personality ? pickVariant(data.personality) : 'cinematic';

  const stats = [
    ['10+', t('story.years', brand.language)],
    ['200+', t('story.projects', brand.language)],
    ['98%', t('story.satisfaction', brand.language)],
  ];

  // ── CENTERED EDITORIAL — full-width pull-quote style ──────────────────────
  if (layout === 'editorial' || layout === 'deco') {
    return `
<section id="story" style="padding:${sp.section};background:${tokens.bg};position:relative;overflow:hidden;">
  <div style="position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,${tokens.accent}40,${tokens.accent}40,transparent);"></div>
  <div style="max-width:880px;margin:0 auto;text-align:center;position:relative;z-index:1;">
    ${reveal(sectionLabel(tokens, t('label.our_story', brand.language)), 'fadeUp', 0)}
    ${reveal(`<blockquote style="font-family:'${tokens.displayFont}',serif;font-size:clamp(1.75rem,4vw,3rem);font-weight:400;font-style:italic;line-height:1.4;color:${tokens.text};margin:0 auto 3rem;max-width:20ch;">"${copy.description}"</blockquote>`, 'fadeUp', 100)}
    ${reveal(`<p style="font-size:0.95rem;color:${tokens.muted};line-height:1.9;max-width:60ch;margin:0 auto 3.5rem;">${t('story.paragraph', brand.language)}</p>`, 'fadeUp', 200)}
    ${decorativeLine(tokens, 'diamond')}
    <div style="display:flex;gap:0;justify-content:center;border-top:1px solid ${tokens.muted}20;border-bottom:1px solid ${tokens.muted}20;flex-wrap:wrap;">
      ${stats.map(([n, l], i) => reveal(`
      <div style="flex:1;min-width:160px;padding:2rem;${i < stats.length - 1 ? `border-right:1px solid ${tokens.muted}20;` : ''}">
        <div style="font-family:'${tokens.displayFont}',serif;font-size:clamp(2rem,5vw,3.5rem);font-weight:700;letter-spacing:-0.04em;" data-count-to="${n}">${gradientText(tokens, n, 'span', 'font-size:inherit;font-weight:inherit;')}</div>
        <div style="font-size:0.7rem;font-weight:500;letter-spacing:0.12em;text-transform:uppercase;color:${tokens.muted};margin-top:0.25rem;">${l}</div>
      </div>`, 'fadeUp', 300 + i * 100)).join('')}
    </div>
  </div>
</section>`;
  }

  // ── BRUTALIST / TECH — horizontal numbered list, stark ────────────────────
  if (layout === 'brutalist' || layout === 'tech') {
    return `
<section id="story" style="padding:${sp.section};background:${tokens.surface};position:relative;overflow:hidden;">
  <div style="max-width:1200px;margin:0 auto;">
    ${reveal(`<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:4rem;margin-bottom:clamp(3rem,6vw,5rem);flex-wrap:wrap;">
      ${displayHeading(tokens, copy.heroLine, 'clamp(2rem,5vw,4rem)')}
      <p style="font-size:0.95rem;color:${tokens.muted};max-width:36ch;line-height:1.85;flex:1;min-width:250px;">${copy.description}</p>
    </div>`, 'fadeUp', 0)}
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:0;border-top:1px solid ${tokens.muted}20;">
      ${stats.map(([n, l], i) => reveal(`
      <div style="padding:2.5rem 2rem;${i < stats.length - 1 ? `border-right:1px solid ${tokens.muted}15;` : ''}border-bottom:1px solid ${tokens.muted}15;position:relative;overflow:hidden;">
        <div style="position:absolute;bottom:-1rem;right:1rem;font-family:'${tokens.displayFont}',serif;font-size:5rem;font-weight:900;color:${tokens.accent}08;pointer-events:none;line-height:1;">${String(i + 1).padStart(2, '0')}</div>
        <div style="font-family:'${tokens.displayFont}',serif;font-size:clamp(2.5rem,5vw,4rem);font-weight:700;color:${tokens.accent};letter-spacing:-0.04em;" data-count-to="${n}">${n}</div>
        <div style="font-size:0.75rem;font-weight:500;letter-spacing:0.1em;text-transform:uppercase;color:${tokens.muted};margin-top:0.5rem;">${l}</div>
      </div>`, 'fadeLeft', i * 120)).join('')}
    </div>
  </div>
</section>`;
  }

  // ── ORGANIC / WARM — image-adjacent, conversational ───────────────────────
  if (layout === 'organic' || layout === 'maximalist') {
    return `
<section id="story" style="padding:${sp.section};background:${tokens.surface};position:relative;overflow:hidden;">
  <div style="position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,${tokens.accent}30,transparent);pointer-events:none;"></div>
  <div style="position:absolute;top:30%;right:5%;width:250px;height:250px;border-radius:50%;background:${tokens.accent}06;filter:blur(80px);animation:float 12s ease-in-out infinite;pointer-events:none;"></div>
  <div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:clamp(3rem,7vw,8rem);align-items:center;flex-wrap:wrap;">
    <div>
      ${revealStagger(stats.map(([n, l]) => glassCard(tokens, `
        <div style="font-family:'${tokens.displayFont}',serif;font-size:2.5rem;font-weight:700;line-height:1;letter-spacing:-0.03em;" data-count-to="${n}">${gradientText(tokens, n, 'span', 'font-size:inherit;font-weight:inherit;')}</div>
        <div style="font-size:0.72rem;color:${tokens.muted};text-transform:uppercase;letter-spacing:0.1em;margin-top:0.4rem;">${l}</div>
      `, { padding: '1.75rem', hover: true })), 'fadeLeft', 0, 100)}
      ${reveal(`<div style="padding:1.5rem;background:${tokens.accent}12;border-left:3px solid ${tokens.accent};border-radius:0 ${r} ${r} 0;margin-top:1.5rem;">
        <p style="font-size:0.9rem;color:${tokens.text};line-height:1.8;font-style:italic;">"${copy.description}"</p>
      </div>`, 'fadeUp', 400)}
    </div>
    <div>
      ${reveal(sectionLabel(tokens, t('label.our_story', brand.language)), 'fadeRight', 0)}
      ${reveal(displayHeading(tokens, copy.heroLine, 'clamp(1.75rem,3.5vw,2.75rem)'), 'fadeRight', 100)}
      ${reveal(`<div style="width:3rem;height:3px;background:${tokens.accent};margin:1.5rem 0;border-radius:2px;"></div>`, 'fadeRight', 200)}
      ${reveal(`<p style="font-size:0.95rem;color:${tokens.muted};line-height:1.9;">${t('story.paragraph', brand.language)}</p>`, 'fadeRight', 300)}
    </div>
  </div>
</section>`;
  }

  // ── DEFAULT: classic split (cinematic/minimal) ─────────────────────────────
  return `
<section id="story" style="padding:${sp.section};background:${tokens.surface};position:relative;overflow:hidden;">
  <div style="position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,${tokens.accent}30,transparent);pointer-events:none;"></div>
  <div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1.5fr;gap:clamp(3rem,6vw,7rem);align-items:start;flex-wrap:wrap;">
    <div style="position:sticky;top:8rem;">
      ${reveal(sectionLabel(tokens, t('label.our_story', brand.language)), 'fadeLeft', 0)}
      ${reveal(displayHeading(tokens, copy.heroLine, 'clamp(1.75rem,4vw,3rem)'), 'fadeLeft', 100)}
      ${reveal(`<div style="width:3rem;height:3px;background:${tokens.accent};margin-top:2rem;border-radius:2px;"></div>`, 'fadeLeft', 200)}
    </div>
    <div>
      ${reveal(decorativeDivider(tokens), 'fadeUp', 80)}
      ${reveal(glassCard(tokens, `<p style="font-size:clamp(1.05rem,2vw,1.3rem);color:${tokens.text};line-height:1.9;font-style:italic;">${copy.description}</p>`, { padding: '1.5rem 2rem' }), 'fadeUp', 100)}
      ${reveal(`<p style="font-size:0.95rem;color:${tokens.muted};line-height:1.85;">${t('story.paragraph', brand.language)}</p>`, 'fadeUp', 200)}
      <div style="margin-top:3rem;display:flex;gap:3rem;flex-wrap:wrap;">
        ${stats.map(([n, l], i) => reveal(`
        <div>
          <div style="font-family:'${tokens.displayFont}',serif;font-size:2.5rem;font-weight:700;line-height:1;" data-count-to="${n}">${gradientText(tokens, n, 'span', 'font-size:inherit;font-weight:inherit;')}</div>
          <div style="font-size:0.75rem;color:${tokens.muted};letter-spacing:0.08em;text-transform:uppercase;margin-top:0.25rem;">${l}</div>
        </div>`, 'fadeUp', 300 + i * 100)).join('')}
      </div>
    </div>
  </div>
</section>`;
}
