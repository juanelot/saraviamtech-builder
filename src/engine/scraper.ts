/**
 * scraper.ts — Extract brand assets and copy from a source URL.
 * Uses cheerio for HTML parsing + fetch for remote content.
 */
import { load } from 'cheerio';

export interface ScrapeResult {
  title?: string;
  description?: string;
  images: string[];           // absolute image URLs found (src/og)
  colors: string[];           // hex colors found in inline styles / meta
  headlines: string[];        // h1/h2 text
  paragraphs: string[];       // first few <p> texts
  ogImage?: string;           // og:image meta
  favicon?: string;
  canonical?: string;
}

function toAbsolute(url: string, base: string): string {
  try {
    return new URL(url, base).href;
  } catch {
    return url;
  }
}

function extractHexColors(text: string): string[] {
  const matches = text.match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g) ?? [];
  const unique = [...new Set(matches)];
  // Filter out very common filler colors
  return unique.filter(c => !['#ffffff', '#000000', '#fff', '#000'].includes(c.toLowerCase()));
}

export async function scrapeUrl(url: string): Promise<ScrapeResult> {
  let html: string;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SaraviamBot/1.0)' },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    html = await res.text();
  } catch (err: any) {
    throw new Error(`scrapeUrl failed for ${url}: ${err.message}`);
  }

  const $ = load(html);

  // Title
  const title =
    $('meta[property="og:title"]').attr('content') ||
    $('title').text().trim() ||
    undefined;

  // Description
  const description =
    $('meta[property="og:description"]').attr('content') ||
    $('meta[name="description"]').attr('content') ||
    undefined;

  // OG image
  const ogImage = $('meta[property="og:image"]').attr('content')
    ? toAbsolute($('meta[property="og:image"]').attr('content')!, url)
    : undefined;

  // Favicon
  const faviconHref =
    $('link[rel="icon"]').attr('href') ||
    $('link[rel="shortcut icon"]').attr('href') ||
    undefined;
  const favicon = faviconHref ? toAbsolute(faviconHref, url) : undefined;

  // Canonical
  const canonical = $('link[rel="canonical"]').attr('href');

  // Images — collect up to 12 meaningful ones
  const images: string[] = [];
  $('img').each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src');
    if (!src || src.startsWith('data:') || src.includes('pixel') || src.includes('beacon')) return;
    const abs = toAbsolute(src, url);
    if (!images.includes(abs)) images.push(abs);
  });
  if (ogImage && !images.includes(ogImage)) images.unshift(ogImage);

  // Headlines
  const headlines: string[] = [];
  $('h1, h2').each((_, el) => {
    const text = $(el).text().trim();
    if (text && text.length > 2 && text.length < 120) headlines.push(text);
  });

  // Paragraphs
  const paragraphs: string[] = [];
  $('p').each((_, el) => {
    const text = $(el).text().trim();
    if (text && text.length > 40) paragraphs.push(text);
    if (paragraphs.length >= 5) return; // stop
  });

  // Colors from inline styles & <style> blocks
  const styleBlocks: string[] = [];
  $('style').each((_, el) => { styleBlocks.push($(el).html() ?? ''); });
  $('[style]').each((_, el) => { styleBlocks.push($(el).attr('style') ?? ''); });
  const colors = extractHexColors(styleBlocks.join(' ')).slice(0, 10);

  return {
    title,
    description,
    images: images.slice(0, 12),
    colors,
    headlines: headlines.slice(0, 8),
    paragraphs,
    ogImage,
    favicon,
    canonical,
  };
}
