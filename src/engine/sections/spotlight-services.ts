import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { sectionLabel, displayHeading, SPACING_MAP, RADIUS_MAP, t, pickVariant, reveal, revealStagger } from './utils.js';

const GLYPHS = ['◆', '▲', '●', '■', '◈', '◉'];

export function renderSpotlightServices(
  brand: BrandCard,
  tokens: DesignTokens,
  data: { personality?: string } & Record<string, any> = {},
): string {
  const { copy } = brand;
  const services = (copy.services ?? []).slice(0, 6);
  if (services.length === 0) return '';

  const sp = SPACING_MAP[tokens.spacing];
  const r = RADIUS_MAP[tokens.radius];
  const layout = data.personality ? pickVariant(data.personality) : 'cinematic';

  const isBrutalist = layout === 'brutalist';
  const isEditorial = layout === 'editorial' || layout === 'deco';
  const isTech = layout === 'tech';

  const cardBg = layout === 'cinematic' || layout === 'maximalist' ? tokens.surface : tokens.bg;
  const headingSize = isBrutalist ? 'clamp(1rem,2.5vw,1.4rem)' : 'clamp(1rem,2vw,1.25rem)';
  const fontWeight = isBrutalist ? '700' : '600';
  const textTransform = isBrutalist ? 'uppercase' : 'none';
  const letterSpacing = isBrutalist ? '-0.01em' : '-0.02em';

  const cards = services.map((svc, i) => {
    const glyph = GLYPHS[i % GLYPHS.length];
    const glyphColor = isBrutalist ? tokens.text : tokens.accent;
    const borderStyle = isBrutalist
      ? `border:2px solid ${tokens.muted}25;`
      : isTech
      ? `border:1px solid ${tokens.accent}20;`
      : `border:1px solid ${tokens.muted}20;`;

    return `
    <div
      style="position:relative;overflow:hidden;padding:clamp(2rem,4vw,3rem) clamp(1.5rem,3vw,2.5rem);background:${cardBg};${borderStyle}border-radius:${r};cursor:default;transition:border-color 0.3s;"
      onmouseenter="this.querySelector('.spot-overlay').style.opacity='1'"
      onmouseleave="this.querySelector('.spot-overlay').style.opacity='0'"
      onmousemove="var r=this.getBoundingClientRect();this.querySelector('.spot-overlay').style.setProperty('--mx',(((event.clientX-r.left)/r.width)*100)+'%');this.querySelector('.spot-overlay').style.setProperty('--my',(((event.clientY-r.top)/r.height)*100)+'%')">
      <div class="spot-overlay" style="position:absolute;inset:0;background:radial-gradient(circle 200px at var(--mx,50%) var(--my,50%),${tokens.accent}15,transparent);opacity:0;transition:opacity 0.3s;pointer-events:none;z-index:0;"></div>
      <div style="position:relative;z-index:1;">
        <div style="width:2.75rem;height:2.75rem;border-radius:${r};background:linear-gradient(135deg,${tokens.accent}20,${tokens.accent}06);display:flex;align-items:center;justify-content:center;font-size:1rem;color:${glyphColor};margin-bottom:1.25rem;">${glyph}</div>
        <div style="font-size:${headingSize};font-weight:${fontWeight};color:${tokens.text};margin-bottom:0.5rem;letter-spacing:${letterSpacing};text-transform:${textTransform};line-height:1.2;">${svc}</div>
        <div style="width:1.75rem;height:2px;background:${tokens.accent}60;border-radius:2px;margin-bottom:0.875rem;"></div>
        <p style="font-size:0.85rem;color:${tokens.muted};line-height:1.7;">${t('services.desc', brand.language)}</p>
      </div>
    </div>`;
  });

  const sectionBg = layout === 'cinematic' || layout === 'maximalist' ? tokens.bg : tokens.surface;

  // Heading block varies by personality
  const headingBlock = isEditorial
    ? reveal(`<div style="display:grid;grid-template-columns:1fr 2fr;gap:clamp(3rem,6vw,7rem);align-items:end;margin-bottom:clamp(2.5rem,5vw,4rem);flex-wrap:wrap;">
        <div>
          ${sectionLabel(tokens, t('label.what_we_offer', brand.language))}
          ${displayHeading(tokens, copy.heroLine)}
        </div>
        <p style="font-size:1rem;color:${tokens.muted};line-height:1.85;align-self:flex-end;">${copy.description}</p>
      </div>`, 'fadeUp', 0)
    : reveal(`<div style="display:flex;align-items:flex-end;justify-content:space-between;gap:2rem;margin-bottom:clamp(2.5rem,5vw,4rem);flex-wrap:wrap;">
        <div>
          ${sectionLabel(tokens, t('label.what_we_offer', brand.language))}
          ${displayHeading(tokens, copy.heroLine)}
        </div>
        <p style="font-size:1rem;color:${tokens.muted};max-width:38ch;line-height:1.8;">${copy.description}</p>
      </div>`, 'fadeUp', 0);

  return `
<section id="services" style="padding:${sp.section};background:${sectionBg};position:relative;overflow:hidden;">
  ${tokens.accentGlow ? `<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:60%;height:60%;background:radial-gradient(ellipse,${tokens.accent}06 0%,transparent 70%);pointer-events:none;"></div>` : ''}
  <div style="max-width:1200px;margin:0 auto;">
    ${headingBlock}
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.25rem;">
      ${revealStagger(cards, 'fadeUp', 100, 80)}
    </div>
  </div>
</section>`;
}
