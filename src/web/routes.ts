import { Router } from 'express';
import { randomUUID } from 'crypto';
import fs from 'node:fs';
import path from 'node:path';
import archiver from 'archiver';
import unzipper from 'unzipper';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import type { CreateSiteRequest, ApiResponse, GeneratedSite } from '../types/index.js';
import { analyzeBrand } from '../engine/brand-analyzer.js';
import { pickModules, MODULES } from '../engine/module-picker.js';
import { buildSite } from '../engine/site-builder.js';
import { publishSite, loadRegistry, saveRegistry, deleteSite } from '../engine/publisher.js';
import { scrapeUrl } from '../engine/scraper.js';
import { scrapeSocialProfile, mergeSocialSources } from '../engine/social-scraper.js';
import { hasOpenAI, miniChat, creativeChat, parseJSON } from '../lib/openai.js';
import { hasImageGen, generateHeroImages } from '../engine/image-generator.js';
import { hasVideoGen, submitVideoTask, pollVideoTask } from '../engine/video-generator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const IMAGES_DIR = path.join(ROOT, 'data/generations/images');
const VIDEOS_DIR = path.join(ROOT, 'data/generations/videos');
const UPLOAD_IMAGES_DIR = path.join(ROOT, 'data/uploads/images');
const UPLOAD_VIDEOS_DIR = path.join(ROOT, 'data/uploads/videos');

// Ensure upload dirs exist
fs.mkdirSync(UPLOAD_IMAGES_DIR, { recursive: true });
fs.mkdirSync(UPLOAD_VIDEOS_DIR, { recursive: true });

// Multer storage — keeps original extension, unique name
const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isVideo = file.mimetype.startsWith('video/');
    cb(null, isVideo ? UPLOAD_VIDEOS_DIR : UPLOAD_IMAGES_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `upload-${Date.now()}-${randomUUID().slice(0, 8)}${ext}`);
  },
});

const upload = multer({
  storage: uploadStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB max
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|webp|gif|mp4|webm|mov)$/i;
    if (allowed.test(path.extname(file.originalname))) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Use jpg, png, webp, mp4, webm.'));
    }
  },
});

// Multer for ZIP imports — memory storage, single file
const uploadZip = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/zip' || file.originalname.endsWith('.zip')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se aceptan archivos .zip'));
    }
  },
});

export const apiRouter = Router();

function getBaseUrl(req: any): string {
  return `${req.protocol}://${req.get('host')}`;
}

// POST /api/sites - create a new cinematic site
apiRouter.post('/sites', async (req, res) => {
  try {
    const body: CreateSiteRequest = req.body;

    if (!body.businessName || !body.businessType || !body.mood || !body.theme) {
      return res.status(400).json({ success: false, error: 'Missing required fields: businessName, businessType, mood, theme' } as ApiResponse<null>);
    }

    // Generate a variation seed — each request gets unique output even for same business type
    const variationSeed = (body as any).seed ?? (Date.now() ^ Math.floor(Math.random() * 0xffff));

    const brandCard = await analyzeBrand(
      body.businessName,
      body.businessType,
      body.mood,
      body.theme,
      body.description,
      body.sourceUrl,
      body.language ?? 'es',
      body.socialUrls,
      variationSeed,
    );

    // If rebuilding an existing site, carry over media that isn't re-supplied
    const existingRegistry = loadRegistry();
    const existingSite = existingRegistry.sites.find(s => s.slug === brandCard.slug);
    const heroImageUrl = body.heroImageUrl ?? existingSite?.heroImageUrl;
    const heroVideoUrl = body.heroVideoUrl ?? existingSite?.heroVideoUrl;
    // Merge gallery: user-supplied > existing > scraped social images
    const socialGalleryUrls = brandCard.socialData?.images ?? [];
    const galleryImageUrls =
      body.galleryImageUrls ??
      existingSite?.galleryImageUrls ??
      (socialGalleryUrls.length ? socialGalleryUrls : undefined);

    const modules = pickModules(body.businessType, body.preferredModules);
    const html = await buildSite(brandCard, modules, heroImageUrl, heroVideoUrl, galleryImageUrls, body.customSections, undefined, variationSeed, body.siteType, body.landingConfig);

    const site: GeneratedSite = {
      id: existingSite?.id ?? randomUUID(),
      slug: brandCard.slug,
      brandCard,
      modules,
      html,
      createdAt: existingSite?.createdAt ?? new Date().toISOString(),
      url: '',
      status: 'generating',
      heroImageUrl,
      heroVideoUrl,
      galleryImageUrls,
      siteType: body.siteType ?? 'full',
    };

    const published = publishSite(site, getBaseUrl(req));

    return res.json({ success: true, data: published } as ApiResponse<GeneratedSite>);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message } as ApiResponse<null>);
  }
});

// GET /api/sites - list all sites
apiRouter.get('/sites', (_req, res) => {
  const registry = loadRegistry();
  res.json({ success: true, data: registry.sites } as ApiResponse<GeneratedSite[]>);
});

// GET /api/sites/:slug - get a specific site
apiRouter.get('/sites/:slug', (req, res) => {
  const registry = loadRegistry();
  const site = registry.sites.find(s => s.slug === req.params.slug);
  if (!site) return res.status(404).json({ success: false, error: 'Site not found' } as ApiResponse<null>);
  return res.json({ success: true, data: site } as ApiResponse<GeneratedSite>);
});

// DELETE /api/sites/:slug
apiRouter.delete('/sites/:slug', (req, res) => {
  const ok = deleteSite(req.params.slug);
  if (!ok) return res.status(404).json({ success: false, error: 'Site not found' } as ApiResponse<null>);
  return res.json({ success: true } as ApiResponse<null>);
});

// PATCH /api/sites/:slug/colors — update palette and re-render site HTML
apiRouter.patch('/sites/:slug/colors', async (req, res) => {
  try {
    const registry = loadRegistry();
    const idx = registry.sites.findIndex(s => s.slug === req.params.slug);
    if (idx < 0) return res.status(404).json({ success: false, error: 'Site not found' } as ApiResponse<null>);

    const { bg, surface, accent, text, muted } = req.body as Record<string, string>;
    if (!bg || !surface || !accent || !text || !muted) {
      return res.status(400).json({ success: false, error: 'Missing color fields: bg, surface, accent, text, muted' } as ApiResponse<null>);
    }

    const site = registry.sites[idx]!;
    const updatedBrandCard = {
      ...site.brandCard,
      colors: { bg, surface, accent, text, muted },
    };

    const html = await buildSite(
      updatedBrandCard,
      site.modules,
      site.heroImageUrl,
      site.heroVideoUrl,
      site.galleryImageUrls,
      undefined,
      true, // noAI — just re-render with new colors
    );

    const updatedSite: GeneratedSite = { ...site, brandCard: updatedBrandCard, html };
    const published = publishSite(updatedSite, getBaseUrl(req));
    return res.json({ success: true, data: published } as ApiResponse<GeneratedSite>);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message } as ApiResponse<null>);
  }
});

// POST /api/scrape - scrape a URL and return extracted brand data
apiRouter.post('/scrape', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ success: false, error: 'Missing url' });
    const data = await scrapeUrl(url);
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/scrape-social - detecta plataforma y extrae datos de marca
// Acepta una o varias URLs (redes sociales o sitio web)
apiRouter.post('/scrape-social', async (req, res) => {
  try {
    const { urls } = req.body as { urls: string[] };
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ success: false, error: 'Missing urls array' });
    }
    const results = await Promise.allSettled(
      urls.slice(0, 5).map(u => scrapeSocialProfile(u)),
    );
    const successful = results
      .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof scrapeSocialProfile>>> => r.status === 'fulfilled')
      .map(r => r.value);
    const errors = results
      .filter(r => r.status === 'rejected')
      .map(r => (r as PromiseRejectedResult).reason?.message ?? 'Error desconocido');

    if (successful.length === 0) {
      return res.status(422).json({ success: false, error: errors.join('; ') });
    }

    const merged = mergeSocialSources(successful);
    return res.json({ success: true, data: merged, warnings: errors.length ? errors : undefined });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/modules - list all modules
apiRouter.get('/modules', (_req, res) => {
  res.json({ success: true, data: MODULES } as ApiResponse<typeof MODULES>);
});

// GET /api/sections - list all available section types with metadata
apiRouter.get('/sections', (_req, res) => {
  const sections = [
    { type: 'hero-fullbleed',     label: 'Hero Pantalla Completa',    group: 'Hero',     description: 'Hero de pantalla completa con imagen/video de fondo' },
    { type: 'hero-split',         label: 'Hero Dividido',             group: 'Hero',     description: 'Hero 50/50 imagen y texto' },
    { type: 'hero-editorial',     label: 'Hero Editorial',            group: 'Hero',     description: 'Hero tipográfico, minimalista' },
    { type: 'typewriter-hero',    label: 'Hero Máquina de Escribir',  group: 'Hero',     description: 'Hero con texto animado en bucle' },
    { type: 'mesh-hero',          label: 'Hero Malla Animada',        group: 'Hero',     description: 'Hero con fondo de gradiente en malla animado' },
    { type: 'story-narrative',    label: 'Historia Narrativa',        group: 'Contenido', description: 'Bloque editorial de texto largo' },
    { type: 'quote-feature',      label: 'Cita Destacada',            group: 'Contenido', description: 'Pull-quote grande con autor' },
    { type: 'testimonials',       label: 'Testimonios',               group: 'Contenido', description: 'Carrusel de testimonios de clientes' },
    { type: 'stats-band',         label: 'Banda de Estadísticas',     group: 'Contenido', description: 'Números y métricas horizontales' },
    { type: 'gallery-masonry',    label: 'Galería Masonry',           group: 'Galería',  description: 'Cuadrícula irregular de imágenes' },
    { type: 'gallery-grid',       label: 'Galería Cuadrícula',        group: 'Galería',  description: 'Cuadrícula uniforme de imágenes' },
    { type: 'carousel',           label: 'Carrusel',                  group: 'Galería',  description: 'Showcase horizontal desplazable' },
    { type: 'services-grid',      label: 'Servicios en Cuadrícula',   group: 'Servicios', description: 'Tarjetas de servicios con icono y texto' },
    { type: 'services-sticky',    label: 'Servicios Sticky',          group: 'Servicios', description: 'Narrativa sticky para servicios' },
    { type: 'accordion-slider',   label: 'Slider Acordeón',           group: 'Servicios', description: 'Paneles de imagen que se expanden al hover' },
    { type: 'flip-cards',         label: 'Tarjetas Flip',             group: 'Servicios', description: 'Tarjetas 3D que revelan detalle al hover' },
    { type: 'spotlight-services', label: 'Servicios Spotlight',       group: 'Servicios', description: 'Cuadrícula de servicios con efecto spotlight' },
    { type: 'horizontal-scroll',  label: 'Scroll Horizontal',         group: 'Servicios', description: 'Galería de tarjetas con pan horizontal' },
    { type: 'sticky-cards',       label: 'Tarjetas Sticky',           group: 'Interactivo', description: 'Tarjetas que se apilan al hacer scroll' },
    { type: 'kinetic-marquee',    label: 'Marquesina Cinética',       group: 'Interactivo', description: 'Marquesina CSS infinita de servicios' },
    { type: 'spotlight-border',   label: 'Borde Spotlight',           group: 'Interactivo', description: 'Tarjetas con borde iluminado al mover el cursor' },
    { type: 'glitch-effect',      label: 'Efecto Glitch',             group: 'Interactivo', description: 'Separación de canales RGB al hover' },
    { type: 'text-scramble',      label: 'Texto Scramble',            group: 'Interactivo', description: 'Texto que revela caracteres como Matrix' },
    { type: 'mesh-gradient',      label: 'Gradiente Malla Canvas',    group: 'Decorativo', description: 'Fondo animado con blobs de gradiente en canvas' },
    { type: 'odometer',           label: 'Odómetro',                  group: 'Decorativo', description: 'Contador mecánico de dígitos rodantes' },
    { type: 'svg-draw',           label: 'Trazo SVG',                 group: 'Decorativo', description: 'Ruta SVG que se dibuja al hacer scroll' },
    { type: 'zoom-parallax',      label: 'Zoom Parallax',             group: 'Decorativo', description: 'Sección de 5 alturas con capas en parallax' },
    { type: 'typewriter',         label: 'Máquina de Escribir (CTA)',  group: 'Decorativo', description: 'Bloque CTA con texto ciclante animado' },
    { type: 'circular-text',      label: 'Texto Circular',            group: 'Decorativo', description: 'Badge SVG rotante con texto en círculo' },
    { type: 'sticky-stack',       label: 'Stack Sticky',              group: 'Decorativo', description: 'Panel izquierdo fijo, tarjetas derechas en scroll' },
    { type: 'cta-banner',         label: 'Banner CTA',                group: 'Conversión', description: 'Llamada a la acción de ancho completo' },
    { type: 'contact-form',       label: 'Formulario de Contacto',    group: 'Conversión', description: 'Bloque de contacto con email y teléfono' },
    { type: 'faq-accordion',      label: 'FAQ Acordeón',              group: 'Conversión', description: 'Preguntas frecuentes colapsables' },
    { type: 'footer',             label: 'Pie de Página',             group: 'Estructura', description: 'Pie de página del sitio (siempre al final)' },
  ];
  res.json({ success: true, data: sections });
});

// GET /api/sections/:type/preview — renders a single section with dummy data for preview
apiRouter.get('/sections/:type/preview', async (req, res) => {
  try {
    const { type } = req.params;
    const dummyBrand: import('../types/index.js').BrandCard = {
      name: 'Acme Studio',
      slug: 'acme-studio',
      industry: 'Agencia Creativa',
      businessType: 'agency-studio',
      mood: 'bold',
      theme: 'dark',
      language: 'es',
      colors: { bg: '#0f0f13', surface: '#1a1a24', accent: '#6366f1', text: '#eae7e2', muted: '#5a5a5e' },
      font: { display: 'Outfit', body: 'Outfit', googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;900&display=swap' },
      copy: {
        headline: 'Diseño que mueve al mundo',
        tagline: 'Creatividad sin límites',
        heroLine: 'Transformamos ideas en experiencias digitales memorables',
        description: 'Somos un equipo apasionado que transforma ideas en experiencias digitales memorables para marcas con visión.',
        cta: 'Comenzar proyecto',
        services: ['Branding', 'Web Design', 'Motion', 'Strategy', 'Copywriting'],
      },
    };
    // Provide dummy gallery images so gallery/carousel sections render in preview
    const dummyImages = [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80',
      'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80',
      'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=800&q=80',
      'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&q=80',
    ];
    const isGalleryType = ['gallery-masonry', 'gallery-grid', 'carousel'].includes(type);
    const html = await buildSite(dummyBrand, {} as any, dummyImages[0], undefined, isGalleryType ? dummyImages.slice(1) : undefined, [type], true);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err: any) {
    console.error(`[preview:${req.params.type}]`, err);
    res.status(500).send(`<html><body style="font-family:sans-serif;padding:2rem;color:#f00;"><b>Error:</b> ${err.message}</body></html>`);
  }
});

// POST /api/analyze - analyze brand + optionally enrich copy with OpenAI
apiRouter.post('/analyze', async (req, res) => {
  try {
    const { businessName, businessType, mood, theme, description, sourceUrl, language, socialUrls, seed: reqSeed } = req.body;
    console.log('[analyze]', JSON.stringify({ businessName, businessType, mood, theme, language }));
    if (!businessName || !businessType) {
      return res.status(400).json({ success: false, error: 'Missing businessName or businessType' });
    }
    const analysisSeed = reqSeed ?? (Date.now() ^ Math.floor(Math.random() * 0xffff));
    const brand = await analyzeBrand(businessName, businessType, mood ?? 'bold', theme ?? 'dark', description, sourceUrl, language ?? 'es', socialUrls, analysisSeed);

    // Copy enrichment already handled inside analyzeBrand — skip duplicate call here

    // Suggest modules with gpt-4o-mini if available
    let moduleSuggestion = pickModules(businessType, undefined);
    if (hasOpenAI()) {
      try {
        const moduleIds = MODULES.map(m => `${m.id}:${m.name}(${m.category})`).join(', ');
        const raw = await miniChat(
          'You are a web design expert. Return ONLY valid JSON: {"primary":"ID","secondary":"ID","tertiary":"ID","reasoning":["reason1","reason2","reason3"]}',
          `Business: "${businessName}", type: ${businessType}, mood: ${mood}.\nAvailable modules: ${moduleIds}\nPick 3 modules following rules: 1 scroll-driven (primary), 1 cursor/hover or click/tap (secondary), 1 ambient/auto (tertiary). Avoid incompatible pairs.`,
        );
        const picked = parseJSON<{ primary: string; secondary: string; tertiary: string; reasoning: string[] }>(raw);
        const allMap = new Map(MODULES.map(m => [m.id, m]));
        const p = allMap.get(picked.primary);
        const s = allMap.get(picked.secondary);
        const t = allMap.get(picked.tertiary);
        if (p) {
          moduleSuggestion = { primary: p, secondary: s, tertiary: t, reasoning: picked.reasoning };
        }
      } catch {
        // keep deterministic suggestion
      }
    }

    return res.json({ success: true, data: { brand, modules: moduleSuggestion, aiEnriched: hasOpenAI() } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message } as ApiResponse<null>);
  }
});

// GET /api/capabilities - which AI features are active
apiRouter.get('/capabilities', (_req, res) => {
  res.json({
    success: true,
    data: {
      openai: hasOpenAI(),
      google: !!process.env.GOOGLE_API_KEY,
      imageGen: hasImageGen(),
      videoGen: hasVideoGen(),
    },
  });
});

// POST /api/generate-images - generate 2 hero images via Imagen 3
apiRouter.post('/generate-images', async (req, res) => {
  try {
    if (!hasImageGen()) {
      return res.status(400).json({ success: false, error: 'KIEAI_API_KEY not configured' });
    }
    const { businessName, businessType, mood, palette } = req.body;
    if (!businessName || !businessType) {
      return res.status(400).json({ success: false, error: 'Missing businessName or businessType' });
    }
    const count = typeof req.body.count === 'number' ? req.body.count : 2;
    const images = await generateHeroImages(businessName, businessType, mood ?? 'cinematic', palette ?? 'warm', count);
    return res.json({ success: true, data: images });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/generate-video - submit image-to-video task
apiRouter.post('/generate-video', async (req, res) => {
  try {
    if (!hasVideoGen()) {
      return res.status(400).json({ success: false, error: 'KIEAI_API_KEY not configured' });
    }
    const { imageUrl, subject, action, mood, businessName, businessType } = req.body;
    if (!imageUrl) return res.status(400).json({ success: false, error: 'Missing imageUrl' });
    const task = await submitVideoTask(
      imageUrl,
      subject ?? 'cinematic scene',
      action ?? 'reveals itself',
      mood ?? 'atmospheric',
      businessName,
      businessType,
    );
    return res.json({ success: true, data: task });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/video-status/:taskId - poll video generation status
apiRouter.get('/video-status/:taskId', async (req, res) => {
  try {
    if (!hasVideoGen()) {
      return res.status(400).json({ success: false, error: 'KIEAI_API_KEY not configured' });
    }
    const task = await pollVideoTask(req.params.taskId);
    return res.json({ success: true, data: task });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/generations/images - list saved generated images
apiRouter.get('/generations/images', (_req, res) => {
  try {
    if (!fs.existsSync(IMAGES_DIR)) return res.json({ success: true, data: [] });
    const files = fs.readdirSync(IMAGES_DIR)
      .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
      .sort((a, b) => {
        const ta = fs.statSync(path.join(IMAGES_DIR, a)).mtimeMs;
        const tb = fs.statSync(path.join(IMAGES_DIR, b)).mtimeMs;
        return tb - ta; // newest first
      })
      .map(f => ({ name: f, publicUrl: `/generations/images/${f}` }));
    return res.json({ success: true, data: files });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/generations/videos - list saved generated videos
apiRouter.get('/generations/videos', (_req, res) => {
  try {
    if (!fs.existsSync(VIDEOS_DIR)) return res.json({ success: true, data: [] });
    const files = fs.readdirSync(VIDEOS_DIR)
      .filter(f => /\.mp4$/i.test(f))
      .sort((a, b) => {
        const ta = fs.statSync(path.join(VIDEOS_DIR, a)).mtimeMs;
        const tb = fs.statSync(path.join(VIDEOS_DIR, b)).mtimeMs;
        return tb - ta; // newest first
      })
      .map(f => ({ name: f, publicUrl: `/generations/videos/${f}` }));
    return res.json({ success: true, data: files });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/generations/:type/:filename - delete a generated asset
apiRouter.delete('/generations/:type/:filename', (req, res) => {
  try {
    const { type, filename } = req.params;
    if (!['images', 'videos'].includes(type)) {
      return res.status(400).json({ success: false, error: 'Tipo inválido' });
    }
    if (!/^[\w\-\.]+$/.test(filename)) {
      return res.status(400).json({ success: false, error: 'Nombre de archivo inválido' });
    }
    const dir = type === 'images' ? IMAGES_DIR : VIDEOS_DIR;
    const filePath = path.join(dir, filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Archivo no encontrado' });
    }
    fs.unlinkSync(filePath);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/upload/media - upload user images and videos
apiRouter.post('/upload/media', upload.array('files', 20), (req, res) => {
  try {
    const files = (req.files as Express.Multer.File[]) ?? [];
    if (!files.length) {
      return res.status(400).json({ success: false, error: 'No se recibieron archivos.' });
    }
    const data = files.map(f => {
      const isVideo = f.mimetype.startsWith('video/');
      const publicUrl = isVideo
        ? `/uploads/videos/${f.filename}`
        : `/uploads/images/${f.filename}`;
      return { name: f.originalname, filename: f.filename, publicUrl, type: isVideo ? 'video' : 'image', size: f.size };
    });
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/uploads/images - list user-uploaded images
apiRouter.get('/uploads/images', (_req, res) => {
  try {
    if (!fs.existsSync(UPLOAD_IMAGES_DIR)) return res.json({ success: true, data: [] });
    const files = fs.readdirSync(UPLOAD_IMAGES_DIR)
      .filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f))
      .sort((a, b) => {
        const ta = fs.statSync(path.join(UPLOAD_IMAGES_DIR, a)).mtimeMs;
        const tb = fs.statSync(path.join(UPLOAD_IMAGES_DIR, b)).mtimeMs;
        return tb - ta;
      })
      .map(f => ({ name: f, publicUrl: `/uploads/images/${f}`, source: 'upload' }));
    return res.json({ success: true, data: files });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/uploads/videos - list user-uploaded videos
apiRouter.get('/uploads/videos', (_req, res) => {
  try {
    if (!fs.existsSync(UPLOAD_VIDEOS_DIR)) return res.json({ success: true, data: [] });
    const files = fs.readdirSync(UPLOAD_VIDEOS_DIR)
      .filter(f => /\.(mp4|webm|mov)$/i.test(f))
      .sort((a, b) => {
        const ta = fs.statSync(path.join(UPLOAD_VIDEOS_DIR, a)).mtimeMs;
        const tb = fs.statSync(path.join(UPLOAD_VIDEOS_DIR, b)).mtimeMs;
        return tb - ta;
      })
      .map(f => ({ name: f, publicUrl: `/uploads/videos/${f}`, source: 'upload' }));
    return res.json({ success: true, data: files });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ── Settings / env vars ───────────────────────────────────────────────────────
// Keys allowed to be read/written via the UI (never expose arbitrary env)
const ALLOWED_ENV_KEYS = ['OPENAI_API_KEY', 'KIEAI_API_KEY', 'GOOGLE_API_KEY', 'MCP_TOKEN', 'BASE_URL', 'PORT'] as const;
type AllowedKey = typeof ALLOWED_ENV_KEYS[number];

const ENV_FILE = path.join(ROOT, '.env');

function parseEnvFile(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    // Strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

function serializeEnvFile(vars: Record<string, string>): string {
  return Object.entries(vars)
    .map(([k, v]) => `${k}=${v.includes(' ') || v.includes('#') ? `"${v}"` : v}`)
    .join('\n') + '\n';
}

// GET /api/settings/env — return current values of allowed env keys (masked secrets)
apiRouter.get('/settings/env', (_req, res) => {
  const result: Record<string, string> = {};
  let fileVars: Record<string, string> = {};

  try {
    if (fs.existsSync(ENV_FILE)) {
      fileVars = parseEnvFile(fs.readFileSync(ENV_FILE, 'utf8'));
    }
  } catch { /* ignore */ }

  for (const key of ALLOWED_ENV_KEYS) {
    // Prefer file value so the UI shows what's actually stored
    result[key] = fileVars[key] ?? process.env[key] ?? '';
  }

  return res.json({ success: true, data: result });
});

// PATCH /api/settings/env — update one or more env vars in the .env file
apiRouter.patch('/settings/env', (req, res) => {
  const updates = req.body as Partial<Record<AllowedKey, string>>;
  if (!updates || typeof updates !== 'object') {
    return res.status(400).json({ success: false, error: 'Invalid body' });
  }

  // Only allow whitelisted keys
  for (const key of Object.keys(updates)) {
    if (!(ALLOWED_ENV_KEYS as readonly string[]).includes(key)) {
      return res.status(400).json({ success: false, error: `Key "${key}" is not allowed` });
    }
  }

  try {
    let fileVars: Record<string, string> = {};
    if (fs.existsSync(ENV_FILE)) {
      fileVars = parseEnvFile(fs.readFileSync(ENV_FILE, 'utf8'));
    }

    for (const [key, value] of Object.entries(updates)) {
      if (value === '' || value === undefined) {
        delete fileVars[key]; // remove empty entries
      } else {
        fileVars[key] = value as string;
        // Also update the live process.env so capabilities endpoint reflects immediately
        process.env[key] = value as string;
      }
    }

    fs.writeFileSync(ENV_FILE, serializeEnvFile(fileVars), 'utf8');
    return res.json({ success: true, message: 'Saved. Restart the server to apply all changes.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/sites/:slug/export - export site as ZIP with assets
apiRouter.get('/sites/:slug/export', async (req, res) => {
  try {
    const { slug } = req.params;

    // Security: only allow simple slugs
    if (!/^[\w\-]+$/.test(slug)) {
      return res.status(400).json({ success: false, error: 'Slug inválido' });
    }

    const siteDir = path.join(ROOT, 'public/sites', slug);
    const htmlPath = path.join(siteDir, 'index.html');

    if (!fs.existsSync(htmlPath)) {
      return res.status(404).json({ success: false, error: 'Sitio no encontrado' });
    }

    let html = fs.readFileSync(htmlPath, 'utf8');

    // Find all local asset references: /generations/... and /uploads/...
    const assetPattern = /(?:src|href)=["'](\/(?:generations|uploads)\/[^"']+)["']/g;
    const cssUrlPattern = /url\(["']?(\/(?:generations|uploads)\/[^"')]+)["']?\)/g;

    const assetMap = new Map<string, string>(); // originalPath -> localPath in zip

    const collectAsset = (originalUrl: string) => {
      if (assetMap.has(originalUrl)) return;
      const parts = originalUrl.split('/').filter(Boolean); // ['generations','images','file.jpg']
      const localPath = parts.slice(1).join('/'); // 'images/file.jpg' or 'videos/file.mp4'
      assetMap.set(originalUrl, localPath);
    };

    let match: RegExpExecArray | null;
    while ((match = assetPattern.exec(html)) !== null) collectAsset(match[1]!);
    while ((match = cssUrlPattern.exec(html)) !== null) collectAsset(match[1]!);

    // Replace paths in HTML: /generations/images/x.jpg → images/x.jpg
    html = html.replace(assetPattern, (full, url) => {
      const local = assetMap.get(url);
      return local ? full.replace(url, local) : full;
    });
    html = html.replace(cssUrlPattern, (full, url) => {
      const local = assetMap.get(url);
      return local ? full.replace(url, local) : full;
    });

    // Stream ZIP response
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${slug}.zip"`);

    const archive = archiver('zip', { zlib: { level: 6 } });
    archive.pipe(res);

    // Add modified HTML
    archive.append(html, { name: 'index.html' });

    // Add each referenced asset file
    for (const [originalUrl, localPath] of assetMap.entries()) {
      const parts = originalUrl.split('/').filter(Boolean);
      // parts[0] = 'generations' or 'uploads', parts[1] = 'images'|'videos', parts[2] = filename
      const dataPath = path.join(ROOT, 'data', ...parts);
      if (fs.existsSync(dataPath)) {
        archive.file(dataPath, { name: localPath });
      }
    }

    // Add site metadata for import restoration
    const siteRegistry = loadRegistry();
    const siteEntry = siteRegistry.sites.find(s => s.slug === slug);
    if (siteEntry) {
      archive.append(JSON.stringify(siteEntry, null, 2), { name: 'site.json' });
    }

    // Add a simple README inside the ZIP
    const readmeContent = [
      `# ${slug}`,
      '',
      'Sitio exportado desde SaraviamTech Builder.',
      '',
      '## Estructura',
      '```',
      'index.html     ← Página principal',
      'images/        ← Imágenes generadas por IA',
      'videos/        ← Videos generados por IA',
      'uploads/       ← Assets subidos por el usuario',
      '```',
      '',
      '## Cómo usar',
      '- Abre `index.html` en tu navegador para previsualizar.',
      '- Sube todos los archivos a tu hosting manteniendo la misma estructura.',
      '- Edita `index.html` con cualquier editor de código (VS Code, etc.).',
      '',
      '## Fuentes',
      'Las fuentes se cargan desde Google Fonts (requiere conexión a internet).',
      'Para uso offline, descarga las fuentes e impórtalas manualmente en el CSS.',
    ].join('\n');

    archive.append(readmeContent, { name: 'README.md' });

    await archive.finalize();
  } catch (err: any) {
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
});

// DELETE /api/uploads/:type/:filename - delete a user upload
apiRouter.delete('/uploads/:type/:filename', (req, res) => {
  try {
    const { type, filename } = req.params;
    if (!['images', 'videos'].includes(type)) {
      return res.status(400).json({ success: false, error: 'Tipo inválido' });
    }
    // Security: only allow simple filenames (no path traversal)
    if (!/^[\w\-\.]+$/.test(filename)) {
      return res.status(400).json({ success: false, error: 'Nombre de archivo inválido' });
    }
    const dir = type === 'images' ? UPLOAD_IMAGES_DIR : UPLOAD_VIDEOS_DIR;
    const filePath = path.join(dir, filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Archivo no encontrado' });
    }
    fs.unlinkSync(filePath);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/sites/import — restore a site from an exported ZIP backup
apiRouter.post('/sites/import', uploadZip.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No se recibió ningún archivo ZIP' } as ApiResponse<null>);
    }

    const zipBuffer = req.file.buffer;
    const directory = await unzipper.Open.buffer(zipBuffer);

    // Extract site.json (required for metadata restoration)
    const siteJsonFile = directory.files.find((f: any) => f.path === 'site.json');
    if (!siteJsonFile) {
      return res.status(400).json({ success: false, error: 'ZIP inválido: falta site.json. Solo se pueden importar backups exportados desde este builder.' } as ApiResponse<null>);
    }
    const siteJsonContent = await siteJsonFile.buffer();
    const siteEntry: GeneratedSite = JSON.parse(siteJsonContent.toString('utf8'));
    const slug = siteEntry.slug;

    if (!slug || !/^[\w\-]+$/.test(slug)) {
      return res.status(400).json({ success: false, error: 'Slug inválido en site.json' } as ApiResponse<null>);
    }

    // Extract index.html (required)
    const htmlFile = directory.files.find((f: any) => f.path === 'index.html');
    if (!htmlFile) {
      return res.status(400).json({ success: false, error: 'ZIP inválido: falta index.html' } as ApiResponse<null>);
    }
    let html = (await htmlFile.buffer()).toString('utf8');

    // Determine which filenames originally came from /generations/ vs /uploads/
    // using the URLs stored in site.json metadata
    const generationsFilenames = new Set<string>();
    const uploadsFilenames = new Set<string>();
    const allSiteUrls = [
      siteEntry.heroImageUrl,
      siteEntry.heroVideoUrl,
      ...(siteEntry.galleryImageUrls ?? []),
    ].filter(Boolean) as string[];
    for (const u of allSiteUrls) {
      const fname = path.basename(u);
      if (u.startsWith('/generations/')) generationsFilenames.add(fname);
      else if (u.startsWith('/uploads/')) uploadsFilenames.add(fname);
    }

    // Restore asset files from ZIP → correct data/ subfolder
    const assetRestoreMap = new Map<string, string>(); // zip relative path → public URL

    for (const file of directory.files as any[]) {
      const p: string = file.path;
      const isImage = p.startsWith('images/') && !p.endsWith('/');
      const isVideo = p.startsWith('videos/') && !p.endsWith('/');
      if (!isImage && !isVideo) continue;

      const filename = path.basename(p);
      if (!/^[\w\-\.]+$/.test(filename)) continue; // security

      // Restore to generations/ if that's where it came from, otherwise uploads/
      const fromGenerations = generationsFilenames.has(filename);
      const destDir = fromGenerations
        ? (isVideo ? VIDEOS_DIR : IMAGES_DIR)
        : (isVideo ? UPLOAD_VIDEOS_DIR : UPLOAD_IMAGES_DIR);
      const urlPrefix = fromGenerations
        ? (isVideo ? '/generations/videos' : '/generations/images')
        : (isVideo ? '/uploads/videos' : '/uploads/images');

      const destPath = path.join(destDir, filename);
      const publicUrl = urlPrefix + '/' + filename;

      // Only write if not already present — no duplicates
      if (!fs.existsSync(destPath)) {
        const buf = await file.buffer();
        fs.mkdirSync(destDir, { recursive: true });
        fs.writeFileSync(destPath, buf);
      }

      assetRestoreMap.set(p, publicUrl);
    }

    // Rewrite relative asset paths in HTML back to absolute server paths
    for (const [zipPath, publicUrl] of assetRestoreMap.entries()) {
      const escaped = zipPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      html = html.replace(new RegExp('(src|href)=["\']' + escaped + '["\']', 'g'), '$1="' + publicUrl + '"');
      html = html.replace(new RegExp('url\\(["\']?' + escaped + '["\']?\\)', 'g'), 'url("' + publicUrl + '")');
    }

    // Write restored HTML to disk
    const siteDir = path.join(ROOT, 'public/sites', slug);
    fs.mkdirSync(siteDir, { recursive: true });
    fs.writeFileSync(path.join(siteDir, 'index.html'), html, 'utf8');

    // Upsert into registry
    const baseUrl = getBaseUrl(req);
    const restoredSite: GeneratedSite = {
      ...siteEntry,
      html,
      url: `${baseUrl}/sites/${slug}/`,
      status: 'ready',
    };

    const registry = loadRegistry();
    const existingIdx = registry.sites.findIndex(s => s.slug === slug);
    if (existingIdx >= 0) {
      registry.sites[existingIdx] = restoredSite;
    } else {
      registry.sites.unshift(restoredSite);
    }
    saveRegistry(registry);

    return res.json({ success: true, data: restoredSite } as ApiResponse<GeneratedSite>);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message } as ApiResponse<null>);
  }
});

// POST /api/sites/import-raw — import a legacy ZIP without site.json
// Reads colors and title from index.html, creates a minimal brandCard
apiRouter.post('/sites/import-raw', uploadZip.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No se recibió ningún archivo ZIP' } as ApiResponse<null>);
    }

    const directory = await unzipper.Open.buffer(req.file.buffer);

    const htmlFile = directory.files.find((f: any) => f.path === 'index.html');
    if (!htmlFile) {
      return res.status(400).json({ success: false, error: 'ZIP inválido: falta index.html' } as ApiResponse<null>);
    }
    let html = (await htmlFile.buffer()).toString('utf8');

    // Extract title from <title> tag
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const rawName = titleMatch ? titleMatch[1].replace(/\s*[—\-|].*$/, '').trim() : 'Sitio importado';

    // Derive slug from original filename or title
    const zipName = req.file.originalname.replace(/\.zip$/i, '');
    const slugBase = zipName && zipName !== 'file'
      ? zipName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      : rawName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    // Make slug unique if already in registry
    const registry = loadRegistry();
    let slug = slugBase;
    let counter = 1;
    while (registry.sites.some(s => s.slug === slug)) {
      slug = slugBase + '-' + counter++;
    }

    // Extract CSS variables from :root block
    const extractVar = (name: string, fallback: string) => {
      const m = html.match(new RegExp('--' + name + ':\s*([^;]+)'));
      return m ? m[1].trim() : fallback;
    };
    const colors = {
      bg:      extractVar('bg',      '#0a0a0a'),
      surface: extractVar('surface', '#111111'),
      accent:  extractVar('accent',  '#6366f1'),
      text:    extractVar('text',    '#ffffff'),
      muted:   extractVar('muted',   '#888888'),
    };

    // Restore asset files from ZIP → uploads/ (no site.json so origin unknown, uploads is safest)
    const assetRestoreMap = new Map<string, string>();
    for (const file of directory.files as any[]) {
      const p: string = file.path;
      const isImage = p.startsWith('images/') && !p.endsWith('/');
      const isVideo = p.startsWith('videos/') && !p.endsWith('/');
      if (!isImage && !isVideo) continue;

      const filename = path.basename(p);
      if (!/^[\w\-\.]+$/.test(filename)) continue;

      const destDir = isVideo ? UPLOAD_VIDEOS_DIR : UPLOAD_IMAGES_DIR;
      const urlPrefix = isVideo ? '/uploads/videos' : '/uploads/images';
      const destPath = path.join(destDir, filename);
      const publicUrl = urlPrefix + '/' + filename;

      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destDir, { recursive: true });
        fs.writeFileSync(destPath, await file.buffer());
      }
      assetRestoreMap.set(p, publicUrl);
    }

    // Rewrite relative paths in HTML back to absolute server paths
    for (const [zipPath, publicUrl] of assetRestoreMap.entries()) {
      const escaped = zipPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      html = html.replace(new RegExp('(src|href)=["\']' + escaped + '["\']', 'g'), '$1="' + publicUrl + '"');
      html = html.replace(new RegExp('url\\(["\']?' + escaped + '["\']?\\)', 'g'), 'url("' + publicUrl + '")');
    }

    // Detect heroImageUrl from HTML (first /generations/images reference)
    const heroMatch = html.match(/\/generations\/images\/[\w\-\.]+/);
    const heroImageUrl = heroMatch ? heroMatch[0] : undefined;

    // Write HTML to disk
    const siteDir = path.join(ROOT, 'public/sites', slug);
    fs.mkdirSync(siteDir, { recursive: true });
    fs.writeFileSync(path.join(siteDir, 'index.html'), html, 'utf8');

    const baseUrl = getBaseUrl(req);
    const restoredSite: GeneratedSite = {
      id: randomUUID(),
      slug,
      brandCard: {
        name: rawName,
        slug,
        industry: 'other',
        businessType: 'other',
        mood: 'minimal',
        theme: colors.bg.toLowerCase() < '#888888' ? 'dark' : 'light',
        language: 'es',
        colors,
        font: { display: 'Inter', body: 'Inter', googleFontsUrl: '' },
        copy: {
          headline: rawName,
          tagline: '',
          heroLine: '',
          description: '',
          services: [],
          cta: '',
        },
      },
      modules: { primary: MODULES[0]!, reasoning: ['Importado desde ZIP legado'] },
      html,
      createdAt: new Date().toISOString(),
      url: baseUrl + '/sites/' + slug + '/',
      status: 'ready',
      heroImageUrl,
    };

    const existingIdx = registry.sites.findIndex(s => s.slug === slug);
    if (existingIdx >= 0) {
      registry.sites[existingIdx] = restoredSite;
    } else {
      registry.sites.unshift(restoredSite);
    }
    saveRegistry(registry);

    return res.json({ success: true, data: restoredSite } as ApiResponse<GeneratedSite>);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message } as ApiResponse<null>);
  }
});
