import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { sectionLabel, t, pickVariant, RADIUS_MAP, reveal } from './utils.js';

export function renderGlitchEffect(
  brand: BrandCard,
  tokens: DesignTokens,
  data: { personality?: string } & Record<string, any> = {},
): string {
  const { copy } = brand;
  const services = copy.services ?? [];

  const layout = data.personality ? pickVariant(data.personality) : 'cinematic';
  const isBrutalist = layout === 'brutalist' || layout === 'tech';
  const isEditorial = layout === 'editorial' || layout === 'deco';

  const radius = RADIUS_MAP[tokens.radius] ?? '0.875rem';
  const sectionBg = tokens.bg;

  // Cyan-like secondary for glitch effect
  const glitchCyan = tokens.surface2 ?? '#00f0ff';
  const glitchRed = tokens.accent;

  // Big glitch word = brand name or tagline first word
  const glitchWord = (brand.name ?? 'STUDIO').toUpperCase().split(' ')[0];

  const items = services.slice(0, 4);

  const cards = items.map((s) => `
<div class="glitch-card" style="background:${tokens.bg};border:1px solid ${tokens.muted}22;border-radius:${radius};padding:2rem 1.5rem;position:relative;overflow:hidden;transition:border-color .3s;cursor:default;">
  <h3 data-glitch-hover="${s}" style="font-size:1rem;font-weight:600;margin-bottom:0.5rem;color:${tokens.text};">${s}</h3>
  <p style="font-size:0.85rem;color:${tokens.muted};line-height:1.5;">${copy.description ?? ''}</p>
  <div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 2px,${glitchCyan}04 2px,${glitchCyan}04 4px);pointer-events:none;opacity:0;transition:opacity .3s;" class="scanline"></div>
</div>`).join('');

  const styleId = `glitch_${Math.random().toString(36).slice(2, 7)}`;

  return `
<section style="padding:5rem 2rem;background:${sectionBg};" id="services">
  <div style="max-width:52rem;margin:0 auto;">
    ${reveal(sectionLabel(tokens, t('services.label', brand.language)), 'fadeUp', 0)}

    <!-- Big glitch headline -->
    <div style="text-align:center;margin-bottom:3rem;overflow:hidden;">
      ${reveal(`<div class="${styleId}-glitch" data-text="${glitchWord}" style="position:relative;display:inline-block;font-size:clamp(4rem,12vw,10rem);font-weight:900;letter-spacing:-0.04em;text-transform:uppercase;font-family:'${tokens.displayFont}',serif;color:${tokens.text};cursor:default;user-select:none;">${glitchWord}</div>`, 'scaleIn', 0)}
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;" id="${styleId}-cards">
      ${cards}
    </div>
  </div>
</section>
<style>
.${styleId}-glitch::before,
.${styleId}-glitch::after {
  content: attr(data-text);
  position: absolute; top: 0; left: 0;
  width: 100%; height: 100%; overflow: hidden;
}
.${styleId}-glitch::before {
  color: ${glitchCyan};
  clip-path: inset(0 0 70% 0);
  animation: none; transform: translate(0);
}
.${styleId}-glitch::after {
  color: ${glitchRed};
  clip-path: inset(70% 0 0 0);
  animation: none; transform: translate(0);
}
.${styleId}-glitch:hover::before { animation: ${styleId}GlitchTop .4s steps(2) infinite; }
.${styleId}-glitch:hover::after  { animation: ${styleId}GlitchBot .4s steps(3) infinite; }
@keyframes ${styleId}GlitchTop {
  0%  { clip-path:inset(0 0 80% 0);transform:translate(-3px,-2px); }
  25% { clip-path:inset(20% 0 50% 0);transform:translate(3px,1px); }
  50% { clip-path:inset(40% 0 30% 0);transform:translate(-2px,2px); }
  75% { clip-path:inset(60% 0 10% 0);transform:translate(2px,-1px); }
  100%{ clip-path:inset(0 0 80% 0);transform:translate(0); }
}
@keyframes ${styleId}GlitchBot {
  0%  { clip-path:inset(80% 0 0 0);transform:translate(3px,1px); }
  33% { clip-path:inset(50% 0 20% 0);transform:translate(-3px,-2px); }
  66% { clip-path:inset(30% 0 40% 0);transform:translate(2px,2px); }
  100%{ clip-path:inset(80% 0 0 0);transform:translate(0); }
}
#${styleId}-cards .glitch-card:hover { border-color: ${tokens.accent} !important; }
#${styleId}-cards .glitch-card:hover .scanline { opacity: 1 !important; }
#${styleId}-cards .glitch-card:hover h3 { animation: ${styleId}TextGlitch .15s steps(2) 3; }
@keyframes ${styleId}TextGlitch {
  0%  { transform:translate(0); }
  25% { transform:translate(-2px,1px); }
  50% { transform:translate(2px,-1px); }
  75% { transform:translate(-1px,-1px); }
  100%{ transform:translate(0); }
}
</style>`;
}
