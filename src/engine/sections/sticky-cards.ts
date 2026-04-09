import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { sectionLabel, SPACING_MAP, RADIUS_MAP, t, pickVariant, reveal, gradientText } from './utils.js';

/**
 * Sticky Card Stack — cards pin to screen as user scrolls, stacking on top of each other.
 * Great for process steps, pricing tiers, or feature showcases.
 * Adapted from modules/sticky-cards.html.
 */
export function renderStickyCards(
  brand: BrandCard,
  tokens: DesignTokens,
  data: { personality?: string } & Record<string, any> = {},
): string {
  const { copy } = brand;
  const sp = SPACING_MAP[tokens.spacing];
  const r = RADIUS_MAP[tokens.radius];
  const services = copy.services ?? [];
  const layout = data.personality ? pickVariant(data.personality) : 'cinematic';

  if (services.length < 2) return '';

  const items = services.slice(0, 5);

  // Color palette for cards — derived from tokens
  const cardPalettes: Array<{ bg: string; text: string }> = [
    { bg: tokens.surface,  text: tokens.text },
    { bg: `color-mix(in srgb, ${tokens.accent} 15%, ${tokens.surface})`, text: tokens.text },
    { bg: tokens.surface2 ?? tokens.surface, text: tokens.text },
    { bg: `color-mix(in srgb, ${tokens.accent} 8%, ${tokens.bg})`,  text: tokens.text },
    { bg: tokens.bg, text: tokens.text },
  ];

  // Fallback for browsers without color-mix (use fixed offsets)
  const darkPalettes = [
    { bg: tokens.surface,  text: tokens.text },
    { bg: tokens.accent + '22', text: tokens.text },
    { bg: tokens.surface,  text: tokens.text },
    { bg: tokens.bg, text: tokens.text },
    { bg: tokens.surface2 ?? tokens.surface, text: tokens.text },
  ];

  // ── BRUTALIST — bold full-bleed cards, accent borders ─────────────────────
  if (layout === 'brutalist' || layout === 'tech') {
    const cards = items.map((svc, i) => {
      const pal = darkPalettes[i % darkPalettes.length]!;
      return `
    <div style="
      position:sticky;top:${80 + i * 20}px;
      border-radius:${r === '0' ? '0' : '1.25rem'};padding:3rem 2.5rem;
      margin-bottom:2rem;min-height:280px;
      display:flex;flex-direction:column;justify-content:flex-end;
      background:${pal.bg};border:2px solid ${i === 0 ? tokens.accent : tokens.muted + '20'};
      z-index:${i + 1};
    ">
      <div style="font-size:0.65rem;letter-spacing:0.12em;text-transform:uppercase;color:${tokens.accent};margin-bottom:0.75rem;font-weight:700;">${String(i + 1).padStart(2, '0')} / ${t('label.services', brand.language)}</div>
      <h3 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(1.5rem,3.5vw,2.25rem);font-weight:900;color:${pal.text};letter-spacing:-0.03em;text-transform:uppercase;margin-bottom:0.75rem;line-height:1.05;">${svc}</h3>
      <p style="font-size:0.9rem;color:${tokens.muted};line-height:1.7;max-width:52ch;">${t('services.desc', brand.language)}</p>
    </div>`;
    }).join('');

    return `
<section id="services" style="padding:${sp.section};background:${tokens.bg};border-top:4px solid ${tokens.accent};">
  <div style="max-width:780px;margin:0 auto;padding:0 clamp(1.5rem,4vw,3.5rem);">
    ${reveal(`<div style="margin-bottom:3rem;">
      <h2 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(2rem,5vw,3.5rem);font-weight:900;color:${tokens.text};text-transform:uppercase;letter-spacing:-0.04em;">${copy.heroLine}</h2>
    </div>`, 'fadeUp', 0)}
    ${cards}
  </div>
</section>`;
  }

  // ── EDITORIAL / MINIMAL — whitespace, numbered, italic ────────────────────
  if (layout === 'editorial' || layout === 'minimal' || layout === 'deco') {
    const cards = items.map((svc, i) => `
    <div style="
      position:sticky;top:${90 + i * 16}px;
      border-radius:${r};padding:3rem 2.5rem;
      margin-bottom:1.5rem;min-height:260px;
      display:flex;flex-direction:column;justify-content:flex-end;
      background:${tokens.surface};border:1px solid ${tokens.muted}15;
      box-shadow:0 4px 24px rgba(0,0,0,0.04);
      z-index:${i + 1};
    ">
      <div style="font-family:'${tokens.displayFont}',serif;font-size:4rem;font-weight:300;color:${tokens.muted}20;line-height:1;position:absolute;top:1.5rem;right:2rem;">${String(i + 1).padStart(2, '0')}</div>
      <div style="font-size:0.7rem;letter-spacing:0.1em;text-transform:uppercase;color:${tokens.accent};margin-bottom:0.5rem;font-style:italic;">${t('label.services', brand.language)}</div>
      <h3 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(1.4rem,3vw,2rem);font-weight:400;font-style:italic;color:${tokens.text};letter-spacing:-0.03em;margin-bottom:0.75rem;">${svc}</h3>
      <p style="font-size:0.875rem;color:${tokens.muted};line-height:1.75;max-width:50ch;">${t('services.desc', brand.language)}</p>
    </div>`).join('');

    return `
<section id="services" style="padding:${sp.section};background:${tokens.bg};">
  <div style="max-width:760px;margin:0 auto;padding:0 clamp(1.5rem,4vw,3.5rem);">
    ${reveal(`<div style="text-align:center;margin-bottom:3.5rem;">
      ${sectionLabel(tokens, t('label.services', brand.language))}
      <h2 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(1.75rem,4vw,2.75rem);font-weight:400;font-style:italic;color:${tokens.text};letter-spacing:-0.04em;">${copy.tagline}</h2>
    </div>`, 'fadeUp', 0)}
    ${cards}
  </div>
</section>`;
  }

  // ── DEFAULT / CINEMATIC — colorful stacking cards ─────────────────────────
  const cards = items.map((svc, i) => {
    const pal = darkPalettes[i % darkPalettes.length]!;
    return `
    <div style="
      position:sticky;top:${80 + i * 20}px;
      border-radius:${r};padding:3rem 2.5rem;
      margin-bottom:2rem;min-height:300px;
      display:flex;flex-direction:column;justify-content:flex-end;
      background:${pal.bg};
      box-shadow:0 20px 60px rgba(0,0,0,0.12);
      z-index:${i + 1};
    ">
      <div style="font-size:0.65rem;letter-spacing:0.12em;text-transform:uppercase;color:${tokens.accent};margin-bottom:0.75rem;font-weight:400;">${String(i + 1).padStart(2, '0')} — ${t('label.services', brand.language)}</div>
      <h3 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(1.5rem,3.5vw,2.25rem);font-weight:700;color:${pal.text};letter-spacing:-0.03em;margin-bottom:0.75rem;line-height:1.1;">${gradientText({ ...tokens }, svc, 'span', 'font-size:inherit;font-weight:inherit;')}</h3>
      <p style="font-size:0.9rem;color:${tokens.muted};line-height:1.75;max-width:52ch;">${t('services.desc', brand.language)}</p>
    </div>`;
  }).join('');

  return `
<section id="services" style="padding:${sp.section};background:${tokens.bg};">
  <div style="max-width:780px;margin:0 auto;padding:0 clamp(1.5rem,4vw,3.5rem);">
    ${reveal(`<div style="margin-bottom:3rem;">
      ${sectionLabel(tokens, t('label.services', brand.language))}
      <h2 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(1.75rem,4vw,2.75rem);font-weight:700;color:${tokens.text};letter-spacing:-0.04em;margin-top:0.5rem;">${copy.heroLine}</h2>
    </div>`, 'fadeLeft', 0)}
    ${cards}
  </div>
</section>`;
}
