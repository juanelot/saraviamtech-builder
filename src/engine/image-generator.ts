import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { hasOpenAI, miniChat, parseJSON } from '../lib/openai.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const IMAGES_DIR = path.join(ROOT, 'data/generations/images');

// Industry-specific image prompt seeds for fallback variety
const IMAGE_PROMPT_SEEDS: Record<string, string[]> = {
  'restaurant-food':      ['steaming gourmet dish on rustic wood, macro, candlelight bokeh', 'artisan bread and fresh herbs on marble, overhead, warm natural light', 'chef-crafted dessert plated with precision, dark moody background, side light', 'colorful fresh ingredients arranged flat-lay on slate, golden hour', 'cocktail glass with citrus garnish, dark bar background, dramatic backlight'],
  'luxury-jewelry':       ['diamond ring on black velvet, macro, studio spotlight, reflections', 'gold bracelet on polished obsidian, prism light refraction, dark background', 'gemstone necklace draped on white marble, soft diffused light, close-up', 'luxury watch face detail, macro lens, metallic sheen, dark moody studio', 'pearl earrings on velvet cushion, soft warm light, elegant minimal setup'],
  'saas-tech':            ['glowing circuit patterns on dark surface, neon blue highlights, macro', 'abstract data visualization, floating geometric nodes, dark gradient background', 'holographic UI interface elements, purple-blue palette, dark space background', 'server rack with LED lights, dramatic angle, cool tones, depth of field', 'code flowing on dark screen, green glow, shallow depth of field, macro'],
  'agency-studio':        ['designer workspace with tools and sketches, overhead, warm natural light', 'bold color swatches and typography printed samples, flat-lay, clean studio', 'abstract paint splashes on canvas, artistic studio, dramatic side light', 'creative mood board with magazine cutouts, warm light, editorial feel', 'modern workspace with plants and design books, soft window light'],
  'portfolio-creative':   ['artistic sketchbook with vibrant illustrations, overhead, morning light', 'photography print on textured paper, dark moody room, single spotlight', 'watercolor artwork detail, macro, wet brush technique, natural light', 'creative tools arranged geometrically, flat-lay, pastel background', 'canvas with abstract expressionist marks, dramatic side light, studio'],
  'ecommerce':            ['premium product on reflective white surface, studio gradient light, clean', 'luxury unboxing with tissue paper and ribbons, editorial top-down, white', 'product flatlay with lifestyle elements, natural morning light, minimal', 'branded packaging on marble, warm ambient light, elegant minimal setup', 'product collection arranged artfully, clean background, soft shadows'],
  'fitness-health':       ['athletic equipment on dark gym floor, dramatic side light, raw texture', 'fresh smoothie bowl with superfoods, overhead, vibrant colors, white surface', 'yoga mat with green plants, soft morning window light, zen minimal', 'protein-rich meal prep containers, clean studio, editorial flat-lay', 'kettlebell on dark concrete, dramatic uplighting, fitness editorial'],
  'real-estate':          ['luxury interior living room, floor-to-ceiling windows, golden hour light flooding in', 'modern kitchen with marble countertops, clean natural daylight, wide angle', 'aerial view of manicured garden, golden hour, architectural photography', 'bedroom with designer furniture, soft morning light, minimal editorial', 'pool and terrace at sunset, warm glow, luxury property editorial'],
  'auto-detailing':       ['car paint surface with water beads, macro lens, studio lighting perfection', 'polished wheel rim detail, reflection of studio lights, dark background', 'interior leather seat stitching, warm amber light, macro close-up', 'wax application on paint, soft bokeh background, detail editorial', 'car silhouette in garage with dramatic backlight, moody atmosphere'],
  'beauty-salon':         ['luxury skincare products on marble, soft pastel light, editorial flat-lay', 'makeup palette with pigment detail, macro, warm peach tones, soft light', 'perfume bottle with water splash, slow motion, clean white background', 'nail art close-up with intricate design, macro lens, pastel studio', 'hair care products surrounded by flowers, editorial, bright natural light'],
  'music-events':         ['concert light beams in fog, dark dramatic atmosphere, editorial', 'vinyl record on turntable, warm amber light, macro label detail', 'musical instrument detail — guitar strings, macro, moody dark background', 'neon stage lights reflected on rain-wet surface, bokeh, cinematic', 'sound mixing board with glowing LEDs, dark studio, dramatic uplighting'],
  'construction':         ['architectural steel structure at golden hour, dramatic sky, wide angle', 'construction materials — concrete and rebar, industrial editorial, side light', 'blueprint detail on tracing paper, warm desk light, top-down macro', 'power tools arranged on workbench, industrial texture, dramatic light', 'finished building facade detail, morning light, architectural photography'],
  'education':            ['open book with warm reading light, shallow depth of field, cozy editorial', 'school supplies arranged on clean desk, top-down, bright natural light', 'globe and educational items, warm library light, editorial still life', 'notebook with handwritten equations, macro, soft window light, minimal', 'laptop with learning interface, clean workspace, soft natural daylight'],
  'legal-finance':        ['law books stacked on mahogany desk, dramatic desk lamp, dark editorial', 'scales of justice on dark surface, dramatic backlight, dark background', 'financial documents with pen, macro, warm desk light, editorial', 'luxury briefcase on conference table, window light, professional editorial', 'coins and financial symbols, dark moody background, macro detail'],
  'photography':          ['camera lens on textured surface, macro, dramatic side light, editorial', 'film strips on light table, warm amber glow, macro cinematic detail', 'vintage camera body detail, macro, dark background, museum-quality light', 'darkroom development tray, red safelight, moody atmosphere, editorial', 'contact sheet prints on clean surface, editorial, natural light'],
  'travel-tourism':       ['exotic landscape at golden hour, dramatic sky, wide cinematic composition', 'vintage travel map and compass, warm overhead light, editorial flat-lay', 'tropical beach with turquoise water, aerial perspective, golden light', 'local artisan crafts and spices on market, vibrant editorial, natural light', 'passport and travel accessories, clean editorial, soft natural light'],
  'gaming-esports':       ['gaming setup with RGB lighting, dark room, neon atmosphere editorial', 'controller detail, macro lens, neon lights reflection, dark background', 'gaming headset on desk, ambient neon glow, dark moody editorial', 'retro gaming cartridge, macro, warm lamp light, nostalgia editorial', 'esports trophy on dark surface, dramatic spotlighting, championship editorial'],
  'pet-services':         ['adorable pet product flat-lay, soft pastel tones, editorial clean studio', 'premium pet food bowl, natural wood surface, warm morning light', 'pet accessories arranged artfully, clean white background, minimal editorial', 'cozy pet bed with plush texture, warm soft light, lifestyle editorial', 'veterinary care items, clean white studio, professional editorial'],
  'nonprofit':            ['hands holding seedling in soil, warm natural light, hopeful editorial', 'community gathering items — candles and flowers, warm light, editorial', 'volunteer materials and supplies, clean editorial, bright natural light', 'charitable goods and donations, overhead warm light, impactful editorial', 'nature scene with conservation focus, golden hour, inspiring composition'],
  'other':                ['premium product on dark surface, dramatic studio light, editorial minimal', 'elegant object on marble surface, soft ambient light, clean minimal setup', 'abstract texture with beautiful light play, macro, editorial atmosphere', 'branded items on natural materials, warm editorial, lifestyle photography', 'sophisticated still life composition, professional studio light, minimal'],
};

/**
 * Generate N varied, industry-specific image prompts using LLM if available,
 * falling back to curated templates with random selection for variety.
 */
async function buildImagePrompts(
  businessName: string,
  businessType: string,
  mood: string,
  palette: string,
  count: number,
): Promise<string[]> {
  // Try LLM batch generation for maximum relevance and variety
  if (hasOpenAI()) {
    try {
      const result = await miniChat(
        `You are a commercial photography art director writing prompts for an AI image generator (nano-banana/Flux). Write ${count} distinct image prompts for hero/gallery photos. Each prompt should be specific, cinematic, and visually rich. Focus on: subject, lighting style, camera angle, background, color palette, mood. No people, no text, no watermarks. Return ONLY a JSON array of ${count} strings.`,
        `Business: "${businessName}" | Industry: ${businessType} | Mood: ${mood} | Color palette: ${palette}. Generate ${count} varied prompts — different angles, lighting styles, and subjects within this industry. Each prompt max 80 words.`,
      );
      const parsed = parseJSON<string[]>(result);
      if (Array.isArray(parsed) && parsed.length >= count && parsed.every(p => typeof p === 'string' && p.length > 20)) {
        return parsed.slice(0, count);
      }
    } catch { /* fall through to templates */ }
  }

  // Fallback: shuffle and pick from industry seed templates
  const seeds = IMAGE_PROMPT_SEEDS[businessType] ?? IMAGE_PROMPT_SEEDS['other']!;
  const shuffled = [...seeds].sort(() => Math.random() - 0.5);
  const base = `Ultra-realistic commercial photography, 8K, no people, no text, no watermarks. Color palette: ${palette}. ${mood} mood. `;
  return Array.from({ length: count }, (_, i) =>
    base + (shuffled[i % shuffled.length] ?? shuffled[0]!),
  );
}

const KIEAI_BASE = 'https://api.kie.ai/api/v1/jobs';

export interface ImageTask {
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  imageUrl?: string;   // remote URL from kie.ia
  localPath?: string;  // downloaded file
  publicUrl?: string;  // served URL  /generations/images/xxx.png
  prompt: string;
  createdAt: string;
}

export function hasImageGen(): boolean {
  return !!process.env.KIEAI_API_KEY;
}

// Legacy single-prompt builder (kept for reference, no longer used directly)
function buildPrompt(businessName: string, businessType: string, mood: string, accent: string): string {
  const type = businessType.replace(/-/g, ' ');
  return (
    `Cinematic hero photograph for a ${type} brand called ${businessName}. ` +
    `${mood} atmosphere, color palette inspired by ${accent}, dark background. ` +
    `Ultra-realistic, 8K, shallow depth of field, no text, no people, no watermarks.`
  );
}

/** Extract image URL from any kie.ai response payload */
function extractImageUrl(data: any): string | null {
  if (!data) return null;
  // Direct URL fields at top level
  const direct =
    data?.image_url ??
    data?.imageUrl ??
    data?.url ??
    data?.images?.[0] ??
    data?.image_urls?.[0] ??
    data?.result ??
    null;
  if (direct) return direct;
  // Nested under output
  const out = data?.output;
  if (!out) return null;
  return (
    out?.image_url ??
    out?.imageUrl ??
    out?.url ??
    out?.images?.[0] ??
    out?.image_urls?.[0] ??
    out?.result ??
    null
  );
}

/**
 * Submit a nano-banana task. nano-banana is synchronous on kie.ai —
 * the result (image URL) comes back directly in the createTask response.
 * Falls back to polling if for some reason it's async.
 */
async function submitImageTask(prompt: string): Promise<{ taskId: string; imageUrl: string | null }> {
  const url = `${KIEAI_BASE}/createTask`;
  const reqBody = JSON.stringify({
    model: 'google/nano-banana',
    input: { prompt, output_format: 'jpeg', image_size: '16:9' },
  });
  console.log('[image-gen] POST', url);

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.KIEAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: reqBody,
    });
  } catch (err: any) {
    console.error('[image-gen] fetch threw:', err?.cause ?? err);
    throw new Error(`nano-banana network error: ${err?.cause?.message ?? err?.message}`);
  }

  console.log('[image-gen] response status:', res.status);

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`nano-banana submit error ${res.status}: ${err}`);
  }

  const raw = await res.text();
  console.log('[image-gen] createTask response:', raw.slice(0, 800));

  let json: any;
  try { json = JSON.parse(raw); } catch { throw new Error('createTask response is not JSON: ' + raw.slice(0, 200)); }

  const data = json?.data ?? json;
  const taskId = data?.taskId ?? data?.task_id ?? data?.id ?? data?.recordId ?? null;
  if (!taskId) throw new Error('createTask: no taskId found: ' + raw.slice(0, 300));

  console.log('[image-gen] taskId:', taskId);

  // nano-banana may return the image URL synchronously
  const imageUrl = extractImageUrl(data);
  if (imageUrl) console.log('[image-gen] got image URL synchronously:', imageUrl.slice(0, 80));

  return { taskId, imageUrl };
}

/** Poll a task via /api/v1/jobs/recordInfo until completed or failed */
async function waitForImageTask(taskId: string): Promise<string> {
  const maxAttempts = 38; // 38 × 8s ≈ 5 min
  const pollUrl = `https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskId}`;

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, i === 0 ? 5000 : 8000));

    let res: Response;
    try {
      res = await fetch(pollUrl, {
        headers: {
          'Authorization': `Bearer ${process.env.KIEAI_API_KEY}`,
          'Accept': 'application/json',
        },
      });
    } catch (e: any) {
      console.warn(`[image-gen] poll network error (attempt ${i+1}):`, e?.message);
      continue;
    }

    const raw = await res.text();
    console.log(`[image-gen] poll ${i+1} status=${res.status} body=`, raw.slice(0, 400));

    if (!res.ok) continue;

    let json: any;
    try { json = JSON.parse(raw); } catch { continue; }

    const data = json?.data ?? json;
    const state: string = data?.state ?? '';

    console.log(`[image-gen] state="${state}"`);

    if (state === 'success') {
      // resultJson is a double-serialized JSON string: "{\"resultUrls\":[...]}"
      let url: string | null = null;
      try {
        const rj = data.resultJson;
        const parsed = typeof rj === 'string' ? JSON.parse(rj) : rj;
        url = parsed?.resultUrls?.[0] ?? null;
      } catch { /* ignore */ }

      url = url ?? extractImageUrl(data);
      if (url) return url;
      console.error('[image-gen] success but no URL. data:', JSON.stringify(data));
      throw new Error('Task succeeded but no image URL found.');
    }

    if (state === 'fail') {
      throw new Error(`Image task ${taskId} failed: ${data?.failMsg ?? data?.failCode ?? 'unknown'}`);
    }
    // states: waiting, queuing, generating — keep polling
  }
  throw new Error(`Image task ${taskId} timed out after 5 minutes`);
}

/** Download a remote image URL to disk, return local path + public URL */
async function downloadImage(remoteUrl: string, suffix: string): Promise<{ filePath: string; publicUrl: string }> {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
  const id = `${Date.now()}-${suffix}`;
  const fileName = `${id}.jpg`;
  const filePath = path.join(IMAGES_DIR, fileName);

  const res = await fetch(remoteUrl);
  if (!res.ok) throw new Error(`Failed to download image: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  return { filePath, publicUrl: `/generations/images/${fileName}` };
}

/**
 * Generate hero images via google/nano-banana on kie.ia.
 * Submits `count` tasks in parallel, polls all, downloads results.
 */
export async function generateHeroImages(
  businessName: string,
  businessType: string,
  mood: string,
  palette: string,
  count: number = 2,
): Promise<ImageTask[]> {
  if (!process.env.KIEAI_API_KEY) throw new Error('KIEAI_API_KEY not set');
  const n = Math.max(1, Math.min(count, 6)); // clamp 1-6

  // Build N varied, industry-specific prompts (LLM-generated or template fallback)
  const prompts = await buildImagePrompts(businessName, businessType, mood, palette, n);
  console.log('[image-gen] generated prompts:', prompts.map(p => p.slice(0, 60) + '...'));

  const submitted = await Promise.all(prompts.map(p => submitImageTask(p)));

  // Resolve image URLs — use sync result if available, else poll
  const remoteUrls = await Promise.all(submitted.map(({ taskId, imageUrl }) =>
    imageUrl ? Promise.resolve(imageUrl) : waitForImageTask(taskId),
  ));

  // Download both
  const results: ImageTask[] = await Promise.all(
    remoteUrls.map(async (url, i) => {
      const { filePath, publicUrl } = await downloadImage(url, String(i));
      return {
        taskId: submitted[i]!.taskId,
        status: 'completed' as const,
        imageUrl: url,
        localPath: filePath,
        publicUrl,
        prompt: prompts[i]!,
        createdAt: new Date().toISOString(),
      };
    }),
  );

  return results;
}
