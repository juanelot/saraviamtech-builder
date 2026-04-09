import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { hasOpenAI, miniChat } from '../lib/openai.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const VIDEOS_DIR = path.join(ROOT, 'data/generations/videos');

// Industry-specific cinematic video prompt templates for fallback variety
const VIDEO_PROMPT_TEMPLATES: Record<string, string[]> = {
  'restaurant-food':      ['Steaming gourmet dish on rustic wood table, macro lens, candle bokeh, slow drift', 'Chef hands delicately plating an artistic dish, warm amber light, cinematic tilt', 'Fresh ingredients arranged on marble surface, top-down drone pull, golden hour glow'],
  'luxury-jewelry':       ['Diamond ring slowly rotating on black velvet, water droplets falling in slow motion, macro', 'Gold necklace catching light in a dark studio, particle shimmer, cinematic depth of field', 'Gemstone bracelet on polished obsidian surface, light prism refraction, slow orbit camera'],
  'saas-tech':            ['Abstract glowing data streams flowing through a dark void, neon blue and purple, slow zoom', 'Holographic UI panels materializing in space, particle effects, cinematic pull-back', 'Digital code cascading over geometric shapes, emerald green on black, slow camera drift'],
  'agency-studio':        ['Bold graphic shapes morphing with fluid motion, vibrant palette, slow rotation reveal', 'Designer workspace with floating creative elements, soft light, cinematic pan', 'Abstract ink drops expanding in slow motion, dynamic colors on white, macro lens'],
  'portfolio-creative':   ['Artistic canvas with paint strokes appearing, overhead camera, time-lapse light shift', 'Creative tools and sketches floating in a soft-lit space, slow drift, film grain', 'Abstract geometric forms assembling into composition, soft gradients, slow pan'],
  'ecommerce':            ['Premium product on reflective surface, dramatic side light, slow 360 orbit', 'Luxury unboxing moment, tissue paper unfurling in slow motion, clean white background', 'Curated products arranged artfully, overhead slow drift, warm morning light'],
  'fitness-health':       ['Athletic motion blur on dark background, dramatic light rays, cinematic freeze frame', 'Weights and equipment in moody gym, fog machine, slow-motion sweat drop macro', 'Healthy food bowl spinning slowly, vibrant colors, clean studio light, top-down'],
  'real-estate':          ['Luxury interior with natural light pouring through floor-to-ceiling windows, slow drift', 'Aerial drone glide over manicured property at golden hour, long shadows', 'Modern kitchen with reflective surfaces, soft morning light, slow pan across'],
  'auto-detailing':       ['Car paint surface with water beading in slow motion, macro lens, studio lights', 'Vehicle silhouette emerging from fog with dramatic backlighting, slow reveal', 'Detail brush on leather interior, macro cinematic, warm amber studio'],
  'beauty-salon':         ['Skincare product with water splash in slow motion, pastel background, macro lens', 'Makeup brush strokes on clean surface, pigment dust floating, soft pink light', 'Hair flowing in slow motion, backlit glow, cinematic depth of field'],
  'music-events':         ['Concert light beams cutting through fog, crowd silhouettes, cinematic slow motion', 'Vinyl record spinning with reflected neon lights, macro lens, slow zoom', 'Sound waves visualized as glowing particles in dark space, slow camera drift'],
  'construction':         ['Steel beams and architectural lines at golden hour, dramatic sky, slow pull-back', 'Construction materials with dramatic side lighting, industrial textures, slow pan', 'Blueprint glowing on dark surface with tools, cinematic top-down drift'],
  'education':            ['Open book with glowing pages, particles rising like knowledge, soft light', 'Chalkboard equations assembling themselves, time-lapse, soft studio light', 'Learning materials arranged on clean desk, warm morning light, top-down slow pan'],
  'legal-finance':        ['Law books and scales on dark mahogany, dramatic side light, slow drift', 'Financial data visualized as golden streams in dark space, slow camera orbit', 'Pen signing document, macro lens, warm desk lamp, cinematic shallow depth'],
  'photography':          ['Camera lens reflecting a dramatic landscape, macro, slow rotation', 'Film strips illuminated by light table, macro cinematic, slow pan', 'Photography equipment in moody dark studio, dramatic spotlighting, slow reveal'],
  'travel-tourism':       ['Aerial view of exotic landscape at golden hour, slow drone drift over terrain', 'Vintage map and travel essentials on textured surface, top-down, warm light', 'Ocean waves in ultra slow motion, shallow depth of field, cinematic blue tones'],
  'gaming-esports':       ['Gaming setup with RGB lights pulsing in dark room, cinematic slow pan', 'Controller floating in particle field, neon glow, dark background, slow rotation', 'Digital game world landscape emerging from screen light, cinematic depth'],
  'pet-services':         ['Playful paw prints forming on soft surface, macro, warm pastel tones, slow', 'Pet accessories arranged artfully, clean studio, top-down slow drift, warm light', 'Bubbles floating in soft light, pet-friendly colors, macro lens, slow motion'],
  'nonprofit':            ['Hands joining together in warm light, slow motion, emotional cinematic', 'Community mural detail with vibrant colors, slow pan, natural outdoor light', 'Seeds sprouting from rich soil, macro, natural light, slow time-lapse'],
  'other':                ['Premium product emerging from dramatic fog, moody dark studio, slow reveal', 'Abstract light shapes moving through space, cinematic particle effect, slow drift', 'Elegant object rotating on dark surface, soft spotlight, cinematic depth of field'],
};

/**
 * Generate a rich, industry-specific video prompt using LLM if available,
 * falling back to curated templates for variety.
 */
async function buildVideoPrompt(
  businessName: string,
  businessType: string,
  subject: string,
  action: string,
  mood: string,
): Promise<string> {
  // Try LLM-generated prompt first
  if (hasOpenAI()) {
    try {
      const result = await miniChat(
        'You are a cinematic video director writing prompts for Kling AI (image-to-video). Write a single vivid, specific video motion prompt. Focus on: subject motion, camera movement, lighting style, depth of field, and mood. No text, no people, no watermarks. Under 120 words. Return ONLY the prompt, no quotes, no explanation.',
        `Business: "${businessName}" | Industry: ${businessType} | Mood: ${mood} | Hero subject: ${subject} | Desired motion: ${action}. Make it cinematic, rich in visual detail, and specific to this industry. Vary camera angles and motion styles.`,
      );
      if (result && result.trim().length > 20) {
        return result.trim();
      }
    } catch { /* fall through to template */ }
  }

  // Fallback: pick a random template from the industry pool
  const templates = VIDEO_PROMPT_TEMPLATES[businessType] ?? VIDEO_PROMPT_TEMPLATES['other']!;
  const base = templates[Math.floor(Math.random() * templates.length)]!;
  return `${base}. ${mood} mood. No text, no people, no watermarks.`;
}

export interface VideoTask {
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;      // remote URL from kie.ai
  localPath?: string;     // downloaded file
  publicUrl?: string;     // served URL /generations/videos/xxx.mp4
  prompt: string;
  createdAt: string;
}

export function hasVideoGen(): boolean {
  return !!process.env.KIEAI_API_KEY;
}

/** Submit an image-to-video task via Kling 3.0 std. Returns VideoTask with taskId. */
export async function submitVideoTask(
  imageUrl: string,
  subject: string,
  action: string,
  mood: string,
  businessName?: string,
  businessType?: string,
): Promise<VideoTask> {
  if (!process.env.KIEAI_API_KEY) throw new Error('KIEAI_API_KEY not set');

  fs.mkdirSync(VIDEOS_DIR, { recursive: true });

  const prompt = await buildVideoPrompt(
    businessName ?? subject,
    businessType ?? 'other',
    subject,
    action,
    mood,
  );
  console.log('[video-gen] generated prompt:', prompt);

  const response = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.KIEAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'kling-3.0/video',
      input: {
        prompt,
        image_urls: [imageUrl],
        sound: false,
        duration: '5',
        aspect_ratio: '16:9',
        mode: 'std',
        multi_shots: false,
      },
    }),
  });

  const raw = await response.text();
  console.log('[video-gen] createTask status:', response.status, 'body:', raw.slice(0, 300));

  if (!response.ok) throw new Error(`Kling API error ${response.status}: ${raw}`);

  let json: any;
  try { json = JSON.parse(raw); } catch { throw new Error('Kling createTask not JSON: ' + raw.slice(0, 200)); }

  const taskId = json?.data?.taskId ?? json?.data?.task_id ?? json?.taskId ?? null;
  if (!taskId) throw new Error('Kling createTask: no taskId in response: ' + raw.slice(0, 300));

  console.log('[video-gen] taskId:', taskId);

  return {
    taskId,
    status: 'pending',
    prompt,
    createdAt: new Date().toISOString(),
  };
}

/** Poll a video task via /api/v1/jobs/recordInfo. Downloads video when completed. */
export async function pollVideoTask(taskId: string): Promise<VideoTask> {
  if (!process.env.KIEAI_API_KEY) throw new Error('KIEAI_API_KEY not set');

  const response = await fetch(
    `https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`,
    { headers: { 'Authorization': `Bearer ${process.env.KIEAI_API_KEY}`, 'Accept': 'application/json' } },
  );

  const raw = await response.text();
  console.log('[video-gen] poll status:', response.status, 'body:', raw.slice(0, 400));

  if (!response.ok) throw new Error(`Kling poll error ${response.status}: ${raw}`);

  let json: any;
  try { json = JSON.parse(raw); } catch { throw new Error('Kling poll not JSON: ' + raw.slice(0, 200)); }

  const data = json?.data ?? json;
  const state: string = data?.state ?? '';

  // Parse resultJson (double-serialized string)
  let videoUrl: string | undefined;
  if (state === 'success') {
    try {
      const rj = data.resultJson;
      const parsed = typeof rj === 'string' ? JSON.parse(rj) : rj;
      videoUrl = parsed?.resultUrls?.[0] ?? parsed?.video_url ?? parsed?.url ?? undefined;
    } catch { /* ignore */ }
  }

  const task: VideoTask = {
    taskId,
    status: mapState(state),
    prompt: '',
    createdAt: data?.createTime ? new Date(data.createTime).toISOString() : new Date().toISOString(),
    videoUrl,
  };

  // Download video when completed
  if (task.status === 'completed' && task.videoUrl) {
    const fileName = `${taskId}.mp4`;
    const filePath = path.join(VIDEOS_DIR, fileName);

    if (!fs.existsSync(filePath)) {
      console.log('[video-gen] downloading video...');
      const videoRes = await fetch(task.videoUrl);
      if (videoRes.ok) {
        const buffer = Buffer.from(await videoRes.arrayBuffer());
        fs.writeFileSync(filePath, buffer);
        console.log('[video-gen] saved to', filePath);
      }
    }

    task.localPath = filePath;
    task.publicUrl = `/generations/videos/${fileName}`;
  }

  return task;
}

function mapState(state: string): VideoTask['status'] {
  if (state === 'success') return 'completed';
  if (state === 'fail' || state === 'failed' || state === 'error') return 'failed';
  if (state === 'generating' || state === 'processing' || state === 'running') return 'processing';
  return 'pending'; // waiting, queuing
}
