import type { BrandCard } from '../../types/index.js';
import type { DesignTokens } from '../layout-director.js';
import { sectionLabel, SPACING_MAP, RADIUS_MAP, t, pickVariant, reveal, glassCard, gradientText } from './utils.js';

type Faq = { q: string; a: string };

export function renderFaqAccordion(
  brand: BrandCard,
  tokens: DesignTokens,
  data: { faqs?: Faq[]; personality?: string } = {},
): string {
  const sp = SPACING_MAP[tokens.spacing];
  const r = RADIUS_MAP[tokens.radius];
  const lang = brand.language ?? 'es';
  const layout = data.personality ? pickVariant(data.personality) : 'cinematic';
  const defaultFaqs: Faq[] = [
    { q: t('faq.q1', lang), a: t('faq.a1', lang) },
    { q: t('faq.q2', lang), a: t('faq.a2', lang) },
    { q: t('faq.q3', lang), a: t('faq.a3', lang) },
    { q: t('faq.q4', lang), a: t('faq.a4', lang) },
  ];
  const faqs = data.faqs ?? defaultFaqs;
  const id = `faq-${Math.random().toString(36).slice(2, 7)}`;

  const iconStyle = `flex-shrink:0;width:1.75rem;height:1.75rem;border-radius:${r};display:flex;align-items:center;justify-content:center;font-size:1rem;transition:transform 0.3s,background 0.3s;`;

  // ── BRUTALIST — bordered panels, accent numbers ──────────────────────────
  if (layout === 'brutalist' || layout === 'tech') {
    const items = faqs.map((faq, i) => reveal(`
    <div class="${id}-item" style="border:1px solid ${tokens.muted}20;border-radius:${r};overflow:hidden;margin-bottom:0.5rem;transition:border-color 0.3s;" onmouseover="this.style.borderColor='${tokens.accent}40'" onmouseout="this.style.borderColor='${tokens.muted}20'">
      <button onclick="toggleFaq('${id}', ${i})" style="width:100%;display:flex;align-items:center;gap:1.25rem;padding:1.25rem 1.5rem;background:${tokens.surface};border:none;cursor:pointer;text-align:left;">
        <span style="font-family:'${tokens.displayFont}',serif;font-size:0.8rem;font-weight:700;color:${tokens.accent};letter-spacing:0.06em;">${String(i + 1).padStart(2, '0')}</span>
        <span style="font-size:0.95rem;font-weight:700;color:${tokens.text};flex:1;text-transform:uppercase;letter-spacing:0.02em;">${faq.q}</span>
        <span id="${id}-icon-${i}" style="${iconStyle}background:${tokens.accent}15;color:${tokens.accent};">+</span>
      </button>
      <div id="${id}-body-${i}" style="overflow:hidden;max-height:0;transition:max-height 0.4s cubic-bezier(.16,1,.3,1);">
        <p style="padding:0 1.5rem 1.5rem 4rem;font-size:0.9rem;color:${tokens.muted};line-height:1.8;">${faq.a}</p>
      </div>
    </div>`, 'fadeLeft', i * 80)).join('');

    return `
<section style="padding:${sp.section};background:${tokens.bg};border-top:2px solid ${tokens.accent}30;">
  <div style="max-width:860px;margin:0 auto;">
    ${reveal(`<h2 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(2rem,5vw,3rem);font-weight:900;color:${tokens.text};letter-spacing:-0.04em;text-transform:uppercase;margin-bottom:3rem;">${t('faq.heading', lang)}</h2>`, 'fadeUp', 0)}
    <div>${items}</div>
  </div>
</section>
${faqScript(id)}`;
  }

  // ── EDITORIAL / MINIMAL — clean, thin borders ───────────────────────────
  if (layout === 'editorial' || layout === 'minimal' || layout === 'deco') {
    const items = faqs.map((faq, i) => reveal(`
    <div class="${id}-item" style="border-bottom:1px solid ${tokens.muted}18;">
      <button onclick="toggleFaq('${id}', ${i})" style="width:100%;display:flex;align-items:center;justify-content:space-between;padding:1.75rem 0;background:transparent;border:none;cursor:pointer;text-align:left;gap:1.5rem;transition:padding-left 0.3s;" onmouseover="this.style.paddingLeft='0.5rem'" onmouseout="this.style.paddingLeft='0'">
        <span style="font-family:'${tokens.displayFont}',serif;font-size:1.05rem;font-weight:500;color:${tokens.text};line-height:1.4;font-style:italic;">${faq.q}</span>
        <span id="${id}-icon-${i}" style="${iconStyle}background:transparent;border:1px solid ${tokens.muted}25;color:${tokens.accent};font-size:0.85rem;">+</span>
      </button>
      <div id="${id}-body-${i}" style="overflow:hidden;max-height:0;transition:max-height 0.4s cubic-bezier(.16,1,.3,1);">
        <p style="padding:0 0 1.75rem;font-size:0.9rem;color:${tokens.muted};line-height:1.85;max-width:55ch;">${faq.a}</p>
      </div>
    </div>`, 'fadeUp', i * 80)).join('');

    return `
<section style="padding:${sp.section};background:${tokens.bg};">
  <div style="max-width:780px;margin:0 auto;">
    ${reveal(`<div style="text-align:center;margin-bottom:3.5rem;">
      ${sectionLabel(tokens, t('label.faq', lang))}
      <h2 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(1.75rem,4vw,2.75rem);font-weight:400;font-style:italic;color:${tokens.text};letter-spacing:-0.03em;">${t('faq.heading', lang)}</h2>
    </div>`, 'fadeUp', 0)}
    <div>${items}</div>
  </div>
</section>
${faqScript(id)}`;
  }

  // ── ORGANIC — glass card panels ─────────────────────────────────────────
  if (layout === 'organic') {
    const items = faqs.map((faq, i) => reveal(`
    <div class="${id}-item" style="margin-bottom:0.75rem;">
      ${glassCard(tokens, `
        <button onclick="toggleFaq('${id}', ${i})" style="width:100%;display:flex;align-items:center;justify-content:space-between;background:transparent;border:none;cursor:pointer;text-align:left;gap:1rem;">
          <span style="font-size:1rem;font-weight:600;color:${tokens.text};line-height:1.4;">${faq.q}</span>
          <span id="${id}-icon-${i}" style="${iconStyle}background:linear-gradient(135deg,${tokens.accent}20,${tokens.accent}08);color:${tokens.accent};">+</span>
        </button>
        <div id="${id}-body-${i}" style="overflow:hidden;max-height:0;transition:max-height 0.4s cubic-bezier(.16,1,.3,1);">
          <p style="padding-top:1rem;font-size:0.9rem;color:${tokens.muted};line-height:1.8;">${faq.a}</p>
        </div>
      `, { padding: '1.5rem' })}
    </div>`, 'fadeUp', i * 80)).join('');

    return `
<section style="padding:${sp.section};background:${tokens.surface};position:relative;overflow:hidden;">
  <div style="position:absolute;bottom:10%;right:8%;width:200px;height:200px;border-radius:50%;background:${tokens.accent}05;filter:blur(60px);animation:float 10s ease-in-out infinite;pointer-events:none;"></div>
  <div style="max-width:860px;margin:0 auto;">
    ${reveal(sectionLabel(tokens, t('label.faq', lang)), 'fadeUp', 0)}
    ${reveal(`<h2 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(1.75rem,4vw,2.75rem);font-weight:700;color:${tokens.text};letter-spacing:-0.03em;margin-bottom:3rem;">${t('faq.heading', lang)}</h2>`, 'fadeUp', 60)}
    <div>${items}</div>
  </div>
</section>
${faqScript(id)}`;
  }

  // ── DEFAULT (cinematic/maximalist) — subtle glass ─────────────────────────
  const items = faqs.map((faq, i) => reveal(`
  <div class="${id}-item" style="border-bottom:1px solid ${tokens.muted}18;">
    <button onclick="toggleFaq('${id}', ${i})" style="width:100%;display:flex;align-items:center;justify-content:space-between;padding:1.5rem 0;background:transparent;border:none;cursor:pointer;text-align:left;gap:1rem;">
      <span style="font-size:1rem;font-weight:600;color:${tokens.text};line-height:1.4;">${faq.q}</span>
      <span id="${id}-icon-${i}" style="${iconStyle}background:${tokens.surface};border:1px solid ${tokens.muted}20;color:${tokens.accent};">+</span>
    </button>
    <div id="${id}-body-${i}" style="overflow:hidden;max-height:0;transition:max-height 0.4s cubic-bezier(.16,1,.3,1);">
      <p style="padding:0 0 1.5rem;font-size:0.95rem;color:${tokens.muted};line-height:1.8;">${faq.a}</p>
    </div>
  </div>`, 'fadeUp', i * 80)).join('');

  return `
<section style="padding:${sp.section};background:${tokens.surface};">
  <div style="max-width:860px;margin:0 auto;">
    ${reveal(sectionLabel(tokens, t('label.faq', lang)), 'fadeUp', 0)}
    ${reveal(`<h2 style="font-family:'${tokens.displayFont}',serif;font-size:clamp(1.75rem,4vw,2.75rem);font-weight:700;color:${tokens.text};letter-spacing:-0.03em;margin-bottom:3rem;">${t('faq.heading', lang)}</h2>`, 'fadeUp', 60)}
    <div>${items}</div>
  </div>
</section>
${faqScript(id)}`;
}

function faqScript(id: string): string {
  return `
<script>
(function(){
  var open = null;
  window.toggleFaq = window.toggleFaq || function(id, i) {
    var body = document.getElementById(id+'-body-'+i);
    var icon = document.getElementById(id+'-icon-'+i);
    if (!body || !icon) return;
    var isOpen = body.style.maxHeight !== '0px' && body.style.maxHeight !== '';
    if (open !== null && open !== i) {
      var prevBody = document.getElementById(id+'-body-'+open);
      var prevIcon = document.getElementById(id+'-icon-'+open);
      if (prevBody) prevBody.style.maxHeight = '0';
      if (prevIcon) { prevIcon.textContent = '+'; prevIcon.style.transform = ''; }
    }
    if (isOpen) {
      body.style.maxHeight = '0';
      icon.textContent = '+';
      icon.style.transform = '';
      open = null;
    } else {
      body.style.maxHeight = body.scrollHeight + 'px';
      icon.textContent = '×';
      icon.style.transform = 'rotate(90deg)';
      open = i;
    }
  };
})();
</script>`;
}
