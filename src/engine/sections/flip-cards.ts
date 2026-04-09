import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { sectionLabel, RADIUS_MAP, t, pickVariant, reveal } from './utils.js';

/**
 * Flip Cards — 3D cards that rotate on hover to reveal back content.
 * Great for services, team bios, or process steps.
 * Adapted from modules/flip-cards.html.
 */
export function renderFlipCards(
  brand: BrandCard,
  tokens: DesignTokens,
  data: { personality?: string } & Record<string, any> = {},
): string {
  const { copy } = brand;
  const services = copy.services ?? [];
  if (services.length < 2) return '';

  const r = RADIUS_MAP[tokens.radius];
  const layout = data.personality ? pickVariant(data.personality) : 'cinematic';
  const items = services.slice(0, 6);

  // Icons as SVG-like unicode symbols
  const icons = ['◈', '◉', '▣', '◆', '★', '⬡'];

  // ── BRUTALIST — bold borders, uppercase, no radius ──────────────────────────
  if (layout === 'brutalist' || layout === 'tech') {
    const cards = items.map((svc, i) => `
      <div style="perspective:800px;height:280px;cursor:pointer;" onclick="this.querySelector('.fci').classList.toggle('flipped')">
        <div class="fci" style="
          position:relative;width:100%;height:100%;
          transition:transform 0.6s cubic-bezier(.16,1,.3,1);
          transform-style:preserve-3d;
        ">
          <div style="
            position:absolute;inset:0;backface-visibility:hidden;
            border-radius:0;
            background:${tokens.surface};
            border:2px solid ${tokens.muted}30;
            border-top:3px solid ${i === 0 ? tokens.accent : tokens.muted + '40'};
            display:flex;flex-direction:column;justify-content:flex-end;padding:1.75rem;
          ">
            <span style="font-size:1.5rem;color:${tokens.accent};margin-bottom:auto;padding-top:0.5rem;display:block;">${icons[i % icons.length]}</span>
            <h3 style="font-family:'${tokens.displayFont}',serif;font-size:1.15rem;font-weight:900;text-transform:uppercase;letter-spacing:0.04em;color:${tokens.text};margin-bottom:0.25rem;">${svc}</h3>
            <p style="font-size:0.75rem;color:${tokens.muted};letter-spacing:0.06em;text-transform:uppercase;">${t('services.desc', brand.language)}</p>
          </div>
          <div style="
            position:absolute;inset:0;backface-visibility:hidden;
            border-radius:0;
            background:${tokens.accent};
            transform:rotateY(180deg);
            display:flex;flex-direction:column;justify-content:flex-end;padding:1.75rem;
          ">
            <h3 style="font-family:'${tokens.displayFont}',serif;font-size:1.15rem;font-weight:900;text-transform:uppercase;letter-spacing:0.04em;color:#fff;margin-bottom:0.5rem;">${svc}</h3>
            <p style="font-size:0.85rem;color:rgba(255,255,255,0.85);line-height:1.6;">${copy.description}</p>
          </div>
        </div>
      </div>`).join('');

    return `
<section id="services" style="padding:clamp(4rem,8vw,7rem) 0;background:${tokens.bg};border-top:4px solid ${tokens.accent};">
  <div style="max-width:1100px;margin:0 auto;padding:0 clamp(1.5rem,4vw,3.5rem);">
    ${reveal(`<h2 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(2rem,5vw,3.5rem);font-weight:900;text-transform:uppercase;letter-spacing:-0.04em;color:${tokens.text};margin-bottom:3rem;">${copy.heroLine}</h2>`, 'fadeUp', 0)}
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;">${cards}</div>
  </div>
</section>
${flipScript()}`;
  }

  // ── EDITORIAL / MINIMAL — clean, italic, refined ────────────────────────────
  if (layout === 'editorial' || layout === 'minimal' || layout === 'deco') {
    const cards = items.map((svc, i) => `
      <div style="perspective:800px;height:300px;cursor:pointer;" onclick="this.querySelector('.fci').classList.toggle('flipped')">
        <div class="fci" style="
          position:relative;width:100%;height:100%;
          transition:transform 0.6s cubic-bezier(.16,1,.3,1);
          transform-style:preserve-3d;
        ">
          <div style="
            position:absolute;inset:0;backface-visibility:hidden;
            border-radius:${r};
            background:${tokens.surface};
            border:1px solid ${tokens.muted}18;
            display:flex;flex-direction:column;justify-content:flex-end;padding:2rem;
          ">
            <span style="font-size:2rem;color:${tokens.accent};margin-bottom:auto;padding-top:0.5rem;display:block;opacity:0.6;">${String(i + 1).padStart(2, '0')}</span>
            <h3 style="font-family:'${tokens.displayFont}',serif;font-size:1.2rem;font-weight:400;font-style:italic;color:${tokens.text};margin-bottom:0.25rem;">${svc}</h3>
            <p style="font-size:0.8rem;color:${tokens.muted};">${t('services.desc', brand.language)}</p>
          </div>
          <div style="
            position:absolute;inset:0;backface-visibility:hidden;
            border-radius:${r};
            background:${tokens.text};
            color:${tokens.bg};
            transform:rotateY(180deg);
            display:flex;flex-direction:column;justify-content:flex-end;padding:2rem;
          ">
            <h3 style="font-family:'${tokens.displayFont}',serif;font-size:1.2rem;font-weight:400;font-style:italic;margin-bottom:0.5rem;">${svc}</h3>
            <p style="font-size:0.85rem;opacity:0.75;line-height:1.65;">${copy.description}</p>
          </div>
        </div>
      </div>`).join('');

    return `
<section id="services" style="padding:clamp(4rem,8vw,7rem) 0;background:${tokens.bg};">
  <div style="max-width:1100px;margin:0 auto;padding:0 clamp(1.5rem,4vw,3.5rem);">
    ${reveal(`<div style="text-align:center;margin-bottom:3.5rem;">
      ${sectionLabel(tokens, t('label.services', brand.language))}
      <h2 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(1.75rem,4vw,2.75rem);font-weight:400;font-style:italic;color:${tokens.text};margin-top:0.5rem;">${copy.tagline}</h2>
    </div>`, 'fadeUp', 0)}
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;">${cards}</div>
  </div>
</section>
${flipScript()}`;
  }

  // ── CINEMATIC (default) — dark, gradient backs, premium feel ─────────────────
  const cards = items.map((svc, i) => `
    <div style="perspective:800px;height:300px;cursor:pointer;" onclick="this.querySelector('.fci').classList.toggle('flipped')">
      <div class="fci" style="
        position:relative;width:100%;height:100%;
        transition:transform 0.6s cubic-bezier(.16,1,.3,1);
        transform-style:preserve-3d;
      ">
        <div style="
          position:absolute;inset:0;backface-visibility:hidden;
          border-radius:${r};
          background:${tokens.surface};
          border:1px solid ${tokens.muted}20;
          box-shadow:0 8px 30px rgba(0,0,0,0.12);
          display:flex;flex-direction:column;justify-content:flex-end;padding:2rem;
        ">
          <span style="font-size:1.75rem;color:${tokens.accent};margin-bottom:auto;padding-top:0.5rem;display:block;">${icons[i % icons.length]}</span>
          <h3 style="font-family:'${tokens.displayFont}',serif;font-size:1.2rem;font-weight:700;letter-spacing:-0.02em;color:${tokens.text};margin-bottom:0.25rem;">${svc}</h3>
          <p style="font-size:0.8rem;color:${tokens.muted};">${t('services.desc', brand.language)}</p>
        </div>
        <div style="
          position:absolute;inset:0;backface-visibility:hidden;
          border-radius:${r};
          background:linear-gradient(135deg,${tokens.accent},${tokens.highlight ?? tokens.accent + 'cc'});
          transform:rotateY(180deg);
          display:flex;flex-direction:column;justify-content:flex-end;padding:2rem;
          box-shadow:0 8px 40px rgba(0,0,0,0.25);
        ">
          <h3 style="font-family:'${tokens.displayFont}',serif;font-size:1.2rem;font-weight:700;letter-spacing:-0.02em;color:#fff;margin-bottom:0.5rem;">${svc}</h3>
          <p style="font-size:0.85rem;color:rgba(255,255,255,0.85);line-height:1.65;">${copy.description}</p>
          <span style="margin-top:1rem;font-size:0.75rem;color:rgba(255,255,255,0.6);letter-spacing:0.08em;text-transform:uppercase;">${t('footer.contact', brand.language)} →</span>
        </div>
      </div>
    </div>`).join('');

  return `
<section id="services" style="padding:clamp(4rem,8vw,7rem) 0;background:${tokens.bg};">
  <div style="max-width:1200px;margin:0 auto;padding:0 clamp(1.5rem,4vw,3.5rem);">
    ${reveal(`<div style="display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:1.5rem;margin-bottom:3rem;">
      <div>
        ${sectionLabel(tokens, t('label.services', brand.language))}
        <h2 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(1.75rem,4vw,2.75rem);font-weight:700;letter-spacing:-0.04em;color:${tokens.text};margin-top:0.5rem;">${copy.tagline}</h2>
      </div>
      <p style="font-size:0.85rem;color:${tokens.muted};max-width:32ch;line-height:1.6;">${copy.description}</p>
    </div>`, 'fadeUp', 0)}
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;">${cards}</div>
  </div>
</section>
${flipScript()}`;
}

function flipScript(): string {
  return `
<style>
.fci.flipped { transform: rotateY(180deg); }
</style>`;
}
