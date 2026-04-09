import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { sectionLabel, displayHeading, SPACING_MAP, RADIUS_MAP, shadow, t, pickVariant, reveal, revealStagger, glassCard, gradientText } from './utils.js';

const GLYPHS = ['◆', '▲', '●', '■', '◈', '◉', '⬡', '⬟', '⬘', '⊕'];
const NUMS = ['01', '02', '03', '04', '05', '06'];

export function renderServicesGrid(
  brand: BrandCard,
  tokens: DesignTokens,
  data: { variant?: string; personality?: string } = {},
): string {
  const { copy } = brand;
  const sp = SPACING_MAP[tokens.spacing];
  const r = RADIUS_MAP[tokens.radius];
  const services = copy.services ?? [];
  const layout = data.personality ? pickVariant(data.personality) : 'cinematic';
  const isBg = data.variant === 'light' || (!data.variant && brand.theme === 'light');
  const bgColor = isBg ? tokens.surface : tokens.bg;

  // ── BENTO GRID layout — asymmetric cards, one featured ────────────────────
  if (layout === 'brutalist' || layout === 'maximalist' || layout === 'tech') {
    const featured = services[0] ?? '';
    const rest = services.slice(1);
    return `
<section id="services" style="padding:${sp.section};background:${bgColor};position:relative;overflow:hidden;">
  <div style="max-width:1200px;margin:0 auto;">
    ${reveal(`<div style="display:flex;align-items:flex-end;justify-content:space-between;gap:2rem;margin-bottom:clamp(2.5rem,5vw,4rem);flex-wrap:wrap;">
      <div>
        ${sectionLabel(tokens, t('label.what_we_offer', brand.language))}
        ${displayHeading(tokens, copy.heroLine)}
      </div>
      <p style="font-size:0.95rem;color:${tokens.muted};max-width:36ch;line-height:1.8;">${copy.description}</p>
    </div>`, 'fadeUp', 0)}
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;grid-template-rows:auto auto;gap:1rem;">
      ${reveal(`<div style="grid-column:span 2;padding:clamp(2rem,4vw,3rem);background:${tokens.accent};border-radius:${r};position:relative;overflow:hidden;min-height:220px;display:flex;flex-direction:column;justify-content:flex-end;">
        <div style="position:absolute;top:-1rem;right:-1rem;font-family:'${tokens.displayFont}',serif;font-size:8rem;font-weight:900;line-height:1;color:rgba(255,255,255,0.1);pointer-events:none;">${NUMS[0]}</div>
        <div style="position:absolute;inset:0;background:linear-gradient(135deg,transparent 50%,rgba(255,255,255,0.06));pointer-events:none;"></div>
        <div style="font-size:0.7rem;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.7);margin-bottom:0.75rem;">${t('label.services', brand.language)}</div>
        <div style="font-family:'${tokens.displayFont}',serif;font-size:clamp(1.5rem,3vw,2.25rem);font-weight:700;color:#fff;line-height:1.15;letter-spacing:-0.03em;">${featured}</div>
      </div>`, 'scaleIn', 100)}
      ${reveal(`<div class="hover-lift" style="padding:clamp(1.5rem,3vw,2rem);background:${tokens.surface};border:1px solid ${tokens.muted}15;border-radius:${r};display:flex;flex-direction:column;justify-content:space-between;min-height:220px;backdrop-filter:blur(8px);">
        <span style="font-size:0.7rem;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:${tokens.accent};">${NUMS[1]}</span>
        <div>
          <div style="font-size:1rem;font-weight:600;color:${tokens.text};margin-bottom:0.5rem;">${services[1] ?? ''}</div>
          <p style="font-size:0.8rem;color:${tokens.muted};line-height:1.65;">${t('services.desc', brand.language)}</p>
        </div>
      </div>`, 'fadeUp', 200)}
      ${revealStagger(rest.slice(1).map((svc, i) => `
      <div class="hover-lift hover-glow" style="padding:clamp(1.5rem,3vw,2rem);background:${tokens.surface}cc;border:1px solid ${tokens.muted}15;border-radius:${r};backdrop-filter:blur(8px);">
        <span style="font-size:0.7rem;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:${tokens.accent};display:block;margin-bottom:1rem;">${NUMS[i + 2] ?? ''}</span>
        <div style="font-size:0.95rem;font-weight:600;color:${tokens.text};margin-bottom:0.4rem;">${svc}</div>
        <p style="font-size:0.8rem;color:${tokens.muted};line-height:1.65;">${t('services.desc', brand.language)}</p>
      </div>`), 'fadeUp', 250, 80)}
    </div>
  </div>
</section>`;
  }

  // ── EDITORIAL LIST layout — numbered, large type, horizontal rules ─────────
  if (layout === 'editorial' || layout === 'deco' || layout === 'minimal') {
    return `
<section id="services" style="padding:${sp.section};background:${bgColor};position:relative;">
  <div style="max-width:1100px;margin:0 auto;">
    ${reveal(`<div style="display:grid;grid-template-columns:1fr 2fr;gap:clamp(3rem,6vw,7rem);align-items:start;margin-bottom:clamp(3rem,6vw,5rem);flex-wrap:wrap;">
      <div>
        ${sectionLabel(tokens, t('label.what_we_offer', brand.language))}
        ${displayHeading(tokens, copy.heroLine)}
      </div>
      <p style="font-size:1rem;color:${tokens.muted};line-height:1.85;align-self:flex-end;">${copy.description}</p>
    </div>`, 'fadeUp', 0)}
    <div style="border-top:1px solid ${tokens.muted}20;">
      ${services.map((svc, i) => reveal(`
      <div style="display:grid;grid-template-columns:4rem 1fr auto;align-items:center;gap:2rem;padding:1.75rem 0;border-bottom:1px solid ${tokens.muted}15;transition:color 0.2s,padding-left 0.3s;" onmouseover="this.querySelector('.svc-name').style.color='${tokens.accent}';this.style.paddingLeft='1rem'" onmouseout="this.querySelector('.svc-name').style.color='${tokens.text}';this.style.paddingLeft='0'">
        <span style="font-family:'${tokens.displayFont}',serif;font-size:0.85rem;color:${tokens.muted};font-weight:400;letter-spacing:0.06em;">${String(i + 1).padStart(2, '0')}</span>
        <span class="svc-name" style="font-family:'${tokens.displayFont}',serif;font-size:clamp(1.1rem,2.5vw,1.6rem);font-weight:600;color:${tokens.text};letter-spacing:-0.02em;transition:color 0.2s;">${svc}</span>
        <span style="font-size:0.7rem;color:${tokens.muted};letter-spacing:0.1em;text-transform:uppercase;transition:transform 0.3s;" onmouseover="this.style.transform='translateX(4px)'" onmouseout="this.style.transform=''">→</span>
      </div>`, 'fadeLeft', i * 80)).join('')}
    </div>
  </div>
</section>`;
  }

  // ── FEATURE layout — large image + list, organic/warm feel ────────────────
  if (layout === 'organic') {
    return `
<section id="services" style="padding:${sp.section};background:${bgColor};position:relative;overflow:hidden;">
  <div style="position:absolute;bottom:10%;right:5%;width:300px;height:300px;border-radius:50%;background:${tokens.accent}08;filter:blur(80px);animation:float 12s ease-in-out infinite;pointer-events:none;"></div>
  <div style="max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1.1fr;gap:clamp(3rem,7vw,8rem);align-items:start;flex-wrap:wrap;">
    <div>
      ${reveal(sectionLabel(tokens, t('label.what_we_offer', brand.language)), 'fadeUp', 0)}
      ${reveal(displayHeading(tokens, copy.heroLine), 'fadeUp', 80)}
      ${reveal(`<p style="font-size:0.95rem;color:${tokens.muted};line-height:1.85;margin:1.5rem 0 2.5rem;">${copy.description}</p>`, 'fadeUp', 160)}
      <div style="display:flex;flex-direction:column;gap:0.5rem;">
        ${services.map((svc, i) => reveal(`
        <div class="hover-glow" style="display:flex;align-items:center;gap:1rem;padding:1rem 1.25rem;border-radius:${r};border:1px solid transparent;transition:background 0.2s,border-color 0.3s;" onmouseover="this.style.background='${tokens.surface}'" onmouseout="this.style.background='transparent'">
          <span style="width:1.75rem;height:1.75rem;border-radius:50%;background:${tokens.accent}20;display:flex;align-items:center;justify-content:center;font-size:0.65rem;font-weight:700;color:${tokens.accent};flex-shrink:0;">${i + 1}</span>
          <span style="font-size:0.95rem;font-weight:500;color:${tokens.text};">${svc}</span>
        </div>`, 'fadeLeft', 200 + i * 80)).join('')}
      </div>
    </div>
    ${reveal(`<div style="background:${tokens.surface};border-radius:${r};overflow:hidden;aspect-ratio:4/5;display:flex;align-items:center;justify-content:center;position:relative;">
      <div style="position:absolute;inset:0;background:radial-gradient(ellipse 80% 80% at 50% 40%,${tokens.accent}25 0%,transparent 70%);"></div>
      <span style="font-family:'${tokens.displayFont}',serif;font-size:clamp(5rem,14vw,12rem);font-weight:700;color:${tokens.accent}15;letter-spacing:-0.06em;position:relative;z-index:1;">${brand.name.slice(0, 2).toUpperCase()}</span>
    </div>`, 'scaleIn', 200)}
  </div>
</section>`;
  }

  // ── DEFAULT: card grid (cinematic) ─────────────────────────────────────────
  const cards = services.map((svc, i) => `
    <div class="hover-lift hover-glow" style="padding:clamp(1.5rem,3vw,2.5rem);background:${tokens.surface}cc;border:1px solid ${tokens.muted}18;border-radius:${r};backdrop-filter:blur(8px);cursor:default;">
      <div style="width:2.75rem;height:2.75rem;border-radius:${r};background:linear-gradient(135deg,${tokens.accent}20,${tokens.accent}08);display:flex;align-items:center;justify-content:center;font-size:1rem;color:${tokens.accent};margin-bottom:1.25rem;">${GLYPHS[i % GLYPHS.length]}</div>
      <div style="font-size:1rem;font-weight:600;color:${tokens.text};margin-bottom:0.5rem;letter-spacing:-0.02em;">${svc}</div>
      <div style="width:2rem;height:2px;background:${tokens.accent}50;border-radius:2px;margin-bottom:1rem;"></div>
      <p style="font-size:0.85rem;color:${tokens.muted};line-height:1.7;">${t('services.desc', brand.language)}</p>
    </div>`);

  return `
<section id="services" style="padding:${sp.section};background:${bgColor};position:relative;overflow:hidden;">
  <div style="position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,${tokens.accent}35,transparent);pointer-events:none;"></div>
  ${tokens.accentGlow ? `<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:60%;height:60%;background:radial-gradient(ellipse,${tokens.accent}08 0%,transparent 70%);pointer-events:none;"></div>` : ''}
  <div style="max-width:1200px;margin:0 auto;">
    ${reveal(`<div style="display:flex;align-items:flex-end;justify-content:space-between;gap:2rem;margin-bottom:clamp(2.5rem,5vw,4rem);flex-wrap:wrap;">
      <div>
        ${sectionLabel(tokens, t('label.what_we_offer', brand.language))}
        ${displayHeading(tokens, copy.heroLine)}
      </div>
      <p style="font-size:1rem;color:${tokens.muted};max-width:38ch;line-height:1.8;">${copy.description}</p>
    </div>`, 'fadeUp', 0)}
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.25rem;">
      ${revealStagger(cards, 'fadeUp', 100, 80)}
    </div>
  </div>
</section>`;
}
