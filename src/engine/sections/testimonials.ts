import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { sectionLabel, SPACING_MAP, RADIUS_MAP, t, pickVariant, reveal, revealStagger, glassCard, gradientText } from './utils.js';

const DEFAULT_TESTIMONIALS_EN = [
  { text: 'An exceptional team that delivered beyond our expectations. The quality and attention to detail is unmatched.', name: 'Alex Martinez', role: 'CEO, Venture Group' },
  { text: 'Working with them transformed our brand presence completely. Professional, creative, and results-driven.', name: 'Sarah Chen', role: 'Marketing Director' },
  { text: 'The most seamless collaboration I\'ve ever had. They understood our vision instantly and executed flawlessly.', name: 'David Kim', role: 'Product Lead' },
];

const DEFAULT_TESTIMONIALS_ES = [
  { text: 'Un equipo excepcional que superó nuestras expectativas. La calidad y atención al detalle son incomparables.', name: 'Alex Martínez', role: 'CEO, Venture Group' },
  { text: 'Trabajar con ellos transformó completamente la presencia de nuestra marca. Profesionales, creativos y orientados a resultados.', name: 'Sara Chen', role: 'Directora de Marketing' },
  { text: 'La colaboración más fluida que he tenido. Entendieron nuestra visión al instante y ejecutaron a la perfección.', name: 'David Kim', role: 'Líder de Producto' },
];

export function renderTestimonials(
  brand: BrandCard,
  tokens: DesignTokens,
  data: { testimonials?: typeof DEFAULT_TESTIMONIALS_EN; personality?: string } = {},
): string {
  const sp = SPACING_MAP[tokens.spacing];
  const r = RADIUS_MAP[tokens.radius];
  const DEFAULT_TESTIMONIALS = brand.language === 'es' ? DEFAULT_TESTIMONIALS_ES : DEFAULT_TESTIMONIALS_EN;
  const items = (data.testimonials ?? DEFAULT_TESTIMONIALS);
  const layout = data.personality ? pickVariant(data.personality) : 'cinematic';

  const stars = '★'.repeat(5).split('').map(s => `<span style="color:${tokens.accent};font-size:0.9rem;">${s}</span>`).join('');

  // ── BRUTALIST — stark, bordered, uppercase labels ────────────────────────
  if (layout === 'brutalist' || layout === 'tech') {
    return `
<section style="padding:${sp.section};background:${tokens.bg};border-top:2px solid ${tokens.accent}30;">
  <div style="max-width:1200px;margin:0 auto;">
    ${reveal(`<div style="display:flex;align-items:flex-end;justify-content:space-between;gap:2rem;margin-bottom:3rem;flex-wrap:wrap;">
      <h2 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(2rem,5vw,3.5rem);font-weight:900;color:${tokens.text};letter-spacing:-0.04em;text-transform:uppercase;">${t('test.heading', brand.language)}</h2>
      <span style="font-size:0.7rem;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:${tokens.accent};">★ 5.0</span>
    </div>`, 'fadeUp', 0)}
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:0;border-top:1px solid ${tokens.muted}20;">
      ${items.map((item, i) => reveal(`
      <div style="padding:2.5rem 2rem;${i < items.length - 1 ? `border-right:1px solid ${tokens.muted}15;` : ''}border-bottom:1px solid ${tokens.muted}15;position:relative;overflow:hidden;">
        <div style="position:absolute;top:1rem;right:1rem;font-family:'${tokens.displayFont}',serif;font-size:4rem;font-weight:900;color:${tokens.accent}08;line-height:1;pointer-events:none;">"</div>
        <p style="font-size:0.95rem;color:${tokens.text};line-height:1.75;margin-bottom:1.5rem;position:relative;z-index:1;">"${item.text}"</p>
        <div style="display:flex;align-items:center;gap:0.75rem;">
          <div style="width:2px;height:2rem;background:${tokens.accent};"></div>
          <div>
            <div style="font-size:0.8rem;font-weight:700;color:${tokens.text};text-transform:uppercase;letter-spacing:0.04em;">${item.name}</div>
            <div style="font-size:0.7rem;color:${tokens.muted};letter-spacing:0.08em;">${item.role}</div>
          </div>
        </div>
      </div>`, 'fadeUp', i * 100)).join('')}
    </div>
  </div>
</section>`;
  }

  // ── EDITORIAL / MINIMAL — single featured + small sidebar ────────────────
  if (layout === 'editorial' || layout === 'minimal' || layout === 'deco') {
    const featured = items[0];
    const rest = items.slice(1);
    return `
<section style="padding:${sp.section};background:${tokens.surface};">
  <div style="max-width:1100px;margin:0 auto;">
    ${reveal(sectionLabel(tokens, t('label.testimonials', brand.language)), 'fadeUp', 0)}
    <div style="display:grid;grid-template-columns:1.5fr 1fr;gap:clamp(3rem,6vw,6rem);align-items:start;flex-wrap:wrap;">
      ${reveal(`<div>
        <div style="font-family:'${tokens.displayFont}',serif;font-size:5rem;line-height:0.8;color:${tokens.accent};margin-bottom:1rem;">"</div>
        <blockquote style="font-family:'${tokens.displayFont}',serif;font-size:clamp(1.5rem,3vw,2.25rem);font-weight:400;font-style:italic;line-height:1.45;color:${tokens.text};margin-bottom:2rem;">${featured?.text ?? ''}</blockquote>
        <div style="font-size:0.85rem;font-weight:600;color:${tokens.text};">${featured?.name ?? ''}</div>
        <div style="font-size:0.72rem;color:${tokens.muted};letter-spacing:0.08em;text-transform:uppercase;margin-top:0.2rem;">${featured?.role ?? ''}</div>
      </div>`, 'fadeLeft', 100)}
      <div style="display:flex;flex-direction:column;gap:1.5rem;padding-top:1rem;">
        ${rest.map((item, i) => reveal(`
        <div style="padding:1.5rem;border-left:2px solid ${tokens.accent}30;transition:border-color 0.3s;" onmouseover="this.style.borderColor='${tokens.accent}'" onmouseout="this.style.borderColor='${tokens.accent}30'">
          <p style="font-size:0.9rem;color:${tokens.muted};line-height:1.7;font-style:italic;margin-bottom:0.75rem;">"${item.text}"</p>
          <div style="font-size:0.8rem;font-weight:600;color:${tokens.text};">${item.name}</div>
          <div style="font-size:0.68rem;color:${tokens.muted};">${item.role}</div>
        </div>`, 'fadeRight', 200 + i * 100)).join('')}
      </div>
    </div>
  </div>
</section>`;
  }

  // ── ORGANIC — glass cards with avatar initials ───────────────────────────
  if (layout === 'organic') {
    return `
<section style="padding:${sp.section};background:${tokens.bg};position:relative;overflow:hidden;">
  <div style="position:absolute;bottom:10%;left:8%;width:250px;height:250px;border-radius:50%;background:${tokens.accent}06;filter:blur(80px);animation:float 12s ease-in-out infinite;pointer-events:none;"></div>
  <div style="max-width:1200px;margin:0 auto;">
    ${reveal(sectionLabel(tokens, t('label.testimonials', brand.language)), 'fadeUp', 0)}
    ${reveal(`<h2 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(1.75rem,4vw,3rem);font-weight:700;color:${tokens.text};letter-spacing:-0.03em;margin-bottom:3rem;max-width:22ch;">${t('test.heading', brand.language)}</h2>`, 'fadeUp', 80)}
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.25rem;">
      ${revealStagger(items.map(item => glassCard(tokens, `
        <div style="display:flex;gap:0.25rem;margin-bottom:1rem;">${stars}</div>
        <p style="font-size:0.95rem;color:${tokens.text};line-height:1.75;font-style:italic;flex:1;margin-bottom:1.5rem;">"${item.text}"</p>
        <div style="display:flex;align-items:center;gap:0.75rem;padding-top:1rem;border-top:1px solid ${tokens.muted}12;">
          <div style="width:2.5rem;height:2.5rem;border-radius:50%;background:linear-gradient(135deg,${tokens.accent}30,${tokens.accent}10);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.9rem;color:${tokens.accent};">${item.name.charAt(0)}</div>
          <div>
            <div style="font-size:0.85rem;font-weight:600;color:${tokens.text};">${item.name}</div>
            <div style="font-size:0.75rem;color:${tokens.muted};">${item.role}</div>
          </div>
        </div>
      `, { hover: true })), 'fadeUp', 100, 100)}
    </div>
  </div>
</section>`;
  }

  // ── DEFAULT (cinematic/maximalist) — glass cards with glow ──────────────
  return `
<section style="padding:${sp.section};background:${tokens.surface};position:relative;overflow:hidden;">
  ${tokens.accentGlow ? `<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:50%;height:50%;background:radial-gradient(ellipse,${tokens.accent}06,transparent 70%);pointer-events:none;"></div>` : ''}
  <div style="max-width:1200px;margin:0 auto;">
    ${reveal(sectionLabel(tokens, t('label.testimonials', brand.language)), 'fadeUp', 0)}
    ${reveal(`<h2 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(1.75rem,4vw,3rem);font-weight:700;color:${tokens.text};letter-spacing:-0.03em;margin-bottom:3rem;max-width:22ch;">${t('test.heading', brand.language)}</h2>`, 'fadeUp', 80)}
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.25rem;">
      ${revealStagger(items.map(item => glassCard(tokens, `
        <div style="display:flex;gap:0.25rem;margin-bottom:1rem;">${stars}</div>
        <p style="font-size:0.95rem;color:${tokens.text};line-height:1.75;font-style:italic;flex:1;margin-bottom:1.5rem;">"${item.text}"</p>
        <div style="display:flex;align-items:center;gap:0.75rem;padding-top:1rem;border-top:1px solid ${tokens.muted}15;">
          <div style="width:2.25rem;height:2.25rem;border-radius:50%;background:linear-gradient(135deg,${tokens.accent}25,${tokens.accent}08);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.85rem;color:${tokens.accent};">${item.name.charAt(0)}</div>
          <div>
            <div style="font-size:0.85rem;font-weight:600;color:${tokens.text};">${item.name}</div>
            <div style="font-size:0.75rem;color:${tokens.muted};">${item.role}</div>
          </div>
        </div>
      `, { hover: true })), 'fadeUp', 100, 100)}
    </div>
  </div>
</section>`;
}
