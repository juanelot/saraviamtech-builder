/**
 * social-scraper.ts — Extrae datos de marca desde redes sociales y sitios web.
 *
 * Detecta automáticamente la plataforma (Instagram, Facebook, LinkedIn, TikTok,
 * Twitter/X, o sitio web genérico) y aplica el scraper apropiado.
 * Usa fetch + Cheerio sobre el HTML público — no requiere autenticación ni APIs.
 * Limitación conocida: las SPAs con JS pesado exponen solo los meta tags OG/JSON-LD.
 */

import { load } from 'cheerio';
import type { SocialScrapeResult } from '../types/index.js';
import { scrapeUrl } from './scraper.js';

// ─── Platform detection ───────────────────────────────────────────────────────

export type SocialPlatform = SocialScrapeResult['platform'];

export function detectPlatform(url: string): SocialPlatform {
  try {
    const { hostname } = new URL(url);
    const h = hostname.replace(/^www\./, '');
    if (h.includes('instagram.com')) return 'instagram';
    if (h.includes('facebook.com') || h.includes('fb.com')) return 'facebook';
    if (h.includes('linkedin.com')) return 'linkedin';
    if (h.includes('tiktok.com')) return 'tiktok';
    if (h.includes('twitter.com') || h.includes('x.com')) return 'twitter';
    return 'website';
  } catch {
    return 'unknown';
  }
}

// ─── HTTP fetch helper ────────────────────────────────────────────────────────

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Upgrade-Insecure-Requests': '1',
    },
    signal: AbortSignal.timeout(15000),
    redirect: 'follow',
  });
  // Facebook y otras redes pueden responder 400/302 pero aun así devolver HTML con meta tags útiles
  const text = await res.text();
  if (!res.ok && text.length < 500) {
    throw new Error(`HTTP ${res.status} para ${url}`);
  }
  return text;
}

function toAbsolute(src: string, base: string): string {
  try { return new URL(src, base).href; } catch { return src; }
}

function extractHexColors(text: string): string[] {
  const matches = text.match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g) ?? [];
  return [...new Set(matches)].filter(
    c => !['#ffffff', '#000000', '#fff', '#000', '#FFFFFF', '#000000'].includes(c),
  );
}

function extractEmails(text: string): string[] {
  return [...new Set(text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g) ?? [])];
}

function extractPhones(text: string): string[] {
  return [...new Set(text.match(/(?:\+\d{1,3}[\s\-]?)?\(?\d{2,4}\)?[\s\-]?\d{3,4}[\s\-]?\d{4}/g) ?? [])];
}

// ─── Instagram ────────────────────────────────────────────────────────────────

function scrapeInstagram(html: string, url: string): Omit<SocialScrapeResult, 'platform'> {
  const $ = load(html);

  // Instagram carga en JSON embebido en <script> o usa og: meta tags
  const profileName =
    $('meta[property="og:title"]').attr('content')?.replace(/ \(@.*?\).*$/, '').trim() ||
    $('title').text().split('•')[0]?.trim();

  const description = $('meta[property="og:description"]').attr('content') || '';
  const avatarUrl = $('meta[property="og:image"]').attr('content');

  // Intentar extraer bio + follower count del description
  // Formato típico: "123K Followers, 456 Following, 789 Posts - See Instagram..."
  const bio = description.replace(/\d[\d.,KMB]* Followers.*?- See Instagram.*$/, '').trim() || undefined;
  const followerMatch = description.match(/([\d.,KMB]+)\s*[Ff]ollowers/);
  const followerCount = followerMatch?.[1];

  // Extraer posibles imágenes de posts (si aparecen en og o scripts JSON)
  const images: string[] = [];
  if (avatarUrl) images.push(avatarUrl);

  // Buscar imágenes en scripts JSON embebidos
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html() ?? '');
      const imgUrl = data?.image?.url || data?.thumbnailUrl;
      if (imgUrl && !images.includes(imgUrl)) images.push(imgUrl);
    } catch { /* ignore */ }
  });

  const headlines = profileName ? [profileName] : [];
  const colors: string[] = [];

  return {
    profileName,
    bio,
    avatarUrl,
    followerCount,
    images: images.slice(0, 10),
    colors,
    headlines,
    links: [url],
  };
}

// ─── Facebook ─────────────────────────────────────────────────────────────────

function scrapeFacebook(html: string, url: string): Omit<SocialScrapeResult, 'platform'> {
  const $ = load(html);

  const profileName =
    $('meta[property="og:title"]').attr('content')?.trim() ||
    $('title').text().split('|')[0]?.trim();

  const description =
    $('meta[property="og:description"]').attr('content')?.trim() ||
    $('meta[name="description"]').attr('content')?.trim();

  const avatarUrl = $('meta[property="og:image"]').attr('content');

  // Intentar extraer categoría de Facebook
  const category = $('meta[property="business:contact_data:locality"]').attr('content') ||
    $('meta[name="al:android:app_name"]').attr('content');

  // Extraer email/phone de meta tags de Facebook
  const email = $('meta[property="business:contact_data:email"]').attr('content');
  const phone = $('meta[property="business:contact_data:phone_number"]').attr('content');
  const address = $('meta[property="business:contact_data:street_address"]').attr('content');
  const website = $('meta[property="business:contact_data:website"]').attr('content');

  const images: string[] = [];
  if (avatarUrl) images.push(avatarUrl);

  const headlines: string[] = [];
  if (profileName) headlines.push(profileName);
  if (description) headlines.push(description.substring(0, 100));

  return {
    profileName,
    bio: description,
    avatarUrl,
    category,
    images,
    colors: [],
    headlines,
    links: [url],
    contactInfo: {
      email,
      phone,
      address,
      website,
    },
  };
}

// ─── LinkedIn ─────────────────────────────────────────────────────────────────

function scrapeLinkedIn(html: string, url: string): Omit<SocialScrapeResult, 'platform'> {
  const $ = load(html);

  const profileName =
    $('meta[property="og:title"]').attr('content')?.replace('| LinkedIn', '').trim() ||
    $('title').text().replace('| LinkedIn', '').trim();

  const description =
    $('meta[property="og:description"]').attr('content')?.trim() ||
    $('meta[name="description"]').attr('content')?.trim();

  const avatarUrl = $('meta[property="og:image"]').attr('content');

  // LinkedIn expone industry y specialties a veces en el description
  const category = $('meta[name="keywords"]').attr('content')?.split(',')[0]?.trim();

  const images: string[] = [];
  if (avatarUrl) images.push(avatarUrl);

  const headlines: string[] = [];
  if (profileName) headlines.push(profileName);

  // Intentar extraer datos JSON-LD
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html() ?? '');
      if (data?.description && !description) headlines.push(data.description.substring(0, 150));
    } catch { /* ignore */ }
  });

  return {
    profileName,
    bio: description,
    avatarUrl,
    category,
    images,
    colors: [],
    headlines,
    links: [url],
  };
}

// ─── TikTok ───────────────────────────────────────────────────────────────────

function scrapeTikTok(html: string, url: string): Omit<SocialScrapeResult, 'platform'> {
  const $ = load(html);

  const profileName =
    $('meta[property="og:title"]').attr('content')?.trim() ||
    $('title').text().split('|')[0]?.trim();

  const description = $('meta[property="og:description"]').attr('content')?.trim();
  const avatarUrl = $('meta[property="og:image"]').attr('content');

  const followerMatch = description?.match(/([\d.,KMB]+)\s*[Ff]ollowers/);
  const followerCount = followerMatch?.[1];
  const bio = description?.replace(/\d[\d.,KMB]* Followers.*$/, '').trim();

  const images: string[] = [];
  if (avatarUrl) images.push(avatarUrl);

  return {
    profileName,
    bio,
    avatarUrl,
    followerCount,
    images,
    colors: [],
    headlines: profileName ? [profileName] : [],
    links: [url],
  };
}

// ─── Twitter/X ────────────────────────────────────────────────────────────────

function scrapeTwitter(html: string, url: string): Omit<SocialScrapeResult, 'platform'> {
  const $ = load(html);

  const profileName =
    $('meta[property="og:title"]').attr('content')?.replace(' / X', '').replace(' / Twitter', '').trim() ||
    $('meta[name="twitter:title"]').attr('content')?.trim();

  const bio =
    $('meta[property="og:description"]').attr('content')?.trim() ||
    $('meta[name="twitter:description"]').attr('content')?.trim();

  const avatarUrl =
    $('meta[property="og:image"]').attr('content') ||
    $('meta[name="twitter:image"]').attr('content');

  const images: string[] = [];
  if (avatarUrl) images.push(avatarUrl);

  return {
    profileName,
    bio,
    avatarUrl,
    images,
    colors: [],
    headlines: profileName ? [profileName] : [],
    links: [url],
  };
}

// ─── Generic website ──────────────────────────────────────────────────────────

async function scrapeGenericWebsite(html: string, url: string): Promise<Omit<SocialScrapeResult, 'platform'>> {
  const $ = load(html);

  // Reutilizar el scraper genérico existente para obtener datos base
  let baseData;
  try {
    baseData = await scrapeUrl(url);
  } catch {
    baseData = { images: [], colors: [], headlines: [], paragraphs: [] };
  }

  const profileName =
    $('meta[property="og:site_name"]').attr('content')?.trim() ||
    $('meta[property="og:title"]').attr('content')?.trim() ||
    $('title').text().trim();

  const bio =
    $('meta[property="og:description"]').attr('content')?.trim() ||
    $('meta[name="description"]').attr('content')?.trim();

  const avatarUrl =
    $('link[rel="apple-touch-icon"]').attr('href') ?
      toAbsolute($('link[rel="apple-touch-icon"]').attr('href')!, url) :
    $('link[rel="icon"][sizes]').attr('href') ?
      toAbsolute($('link[rel="icon"][sizes]').attr('href')!, url) :
    baseData.favicon;

  // Extraer links a redes sociales del footer/header
  const socialLinks: string[] = [];
  const socialPatterns = /instagram\.com|facebook\.com|linkedin\.com|tiktok\.com|twitter\.com|x\.com|youtube\.com/i;
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') ?? '';
    if (socialPatterns.test(href) && !socialLinks.includes(href)) {
      socialLinks.push(href);
    }
  });

  // Extraer contacto del texto completo
  const pageText = $('body').text();
  const emails = extractEmails(pageText);
  const phones = extractPhones(pageText);
  const address = $('[itemprop="address"]').text().trim() ||
    $('address').text().trim().substring(0, 200) || undefined;

  // Colores CSS del sitio
  const styleBlocks: string[] = [];
  $('style').each((_, el) => { styleBlocks.push($(el).html() ?? ''); });
  $('[style]').each((_, el) => { styleBlocks.push($(el).attr('style') ?? ''); });
  const colors = extractHexColors(styleBlocks.join(' ')).slice(0, 10);

  return {
    profileName,
    bio,
    avatarUrl,
    images: baseData.images.slice(0, 15),
    colors: colors.length ? colors : baseData.colors,
    headlines: baseData.headlines,
    links: [url, ...socialLinks].slice(0, 8),
    contactInfo: {
      email: emails[0],
      phone: phones[0],
      address,
    },
  };
}

// ─── Main dispatcher ──────────────────────────────────────────────────────────

/** Extrae un nombre de perfil aproximado desde la URL (fallback cuando el scraping falla) */
function profileNameFromUrl(url: string): string | undefined {
  try {
    const { pathname } = new URL(url);
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length > 0) {
      return parts[parts.length - 1]!
        .replace(/[._-]+/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())
        .trim();
    }
  } catch { /* ignore */ }
  return undefined;
}

export async function scrapeSocialProfile(url: string): Promise<SocialScrapeResult> {
  const platform = detectPlatform(url);

  let html: string;
  try {
    html = await fetchHtml(url);
  } catch (err: any) {
    // Facebook y algunas redes bloquean scrapers. Devolver resultado mínimo con datos de la URL.
    console.warn(`[social-scraper] No se pudo acceder a ${url}: ${err.message}. Usando fallback.`);
    return {
      platform,
      profileName: profileNameFromUrl(url),
      images: [],
      colors: [],
      headlines: [],
      links: [url],
    };
  }

  let partial: Omit<SocialScrapeResult, 'platform'>;

  switch (platform) {
    case 'instagram':
      partial = scrapeInstagram(html, url);
      break;
    case 'facebook':
      partial = scrapeFacebook(html, url);
      break;
    case 'linkedin':
      partial = scrapeLinkedIn(html, url);
      break;
    case 'tiktok':
      partial = scrapeTikTok(html, url);
      break;
    case 'twitter':
      partial = scrapeTwitter(html, url);
      break;
    case 'website':
    default:
      partial = await scrapeGenericWebsite(html, url);
      break;
  }

  return { ...partial, platform };
}

// ─── Merge múltiples fuentes ──────────────────────────────────────────────────

export function mergeSocialSources(results: SocialScrapeResult[]): SocialScrapeResult {
  if (results.length === 0) {
    return { platform: 'unknown', images: [], colors: [], headlines: [], links: [] };
  }
  if (results.length === 1) return results[0]!;

  // Prioridad de plataformas para datos de perfil: website > linkedin > instagram > facebook > twitter > tiktok
  const priority: SocialPlatform[] = ['website', 'linkedin', 'instagram', 'facebook', 'twitter', 'tiktok'];
  const sorted = [...results].sort((a, b) => {
    return priority.indexOf(a.platform) - priority.indexOf(b.platform);
  });

  const primary = sorted[0]!;

  // Combinar imágenes únicas de todas las fuentes
  const allImages = [...new Set(results.flatMap(r => r.images))].slice(0, 25);

  // Combinar colores únicos (prioridad: website tiene mejor extracción CSS)
  const allColors = [...new Set(results.flatMap(r => r.colors))].slice(0, 10);

  // Combinar headlines
  const allHeadlines = [...new Set(results.flatMap(r => r.headlines))].slice(0, 8);

  // Combinar links
  const allLinks = [...new Set(results.flatMap(r => r.links))].slice(0, 10);

  // Combinar contactInfo: tomar el primer valor no vacío de cada campo
  const contactInfo: SocialScrapeResult['contactInfo'] = {};
  for (const r of results) {
    if (r.contactInfo?.email && !contactInfo.email) contactInfo.email = r.contactInfo.email;
    if (r.contactInfo?.phone && !contactInfo.phone) contactInfo.phone = r.contactInfo.phone;
    if (r.contactInfo?.address && !contactInfo.address) contactInfo.address = r.contactInfo.address;
    if (r.contactInfo?.website && !contactInfo.website) contactInfo.website = r.contactInfo.website;
  }

  return {
    platform: primary.platform,
    profileName: primary.profileName || results.find(r => r.profileName)?.profileName,
    bio: primary.bio || results.find(r => r.bio)?.bio,
    avatarUrl: primary.avatarUrl || results.find(r => r.avatarUrl)?.avatarUrl,
    followerCount: results.find(r => r.followerCount)?.followerCount,
    images: allImages,
    colors: allColors,
    headlines: allHeadlines,
    links: allLinks,
    category: primary.category || results.find(r => r.category)?.category,
    contactInfo: Object.keys(contactInfo).length ? contactInfo : undefined,
  };
}
