import { z } from 'zod';
import { randomUUID } from 'crypto';
import { analyzeBrand } from '../engine/brand-analyzer.js';
import { pickModules, MODULES } from '../engine/module-picker.js';
import { buildSite } from '../engine/site-builder.js';
import { publishSite, loadRegistry, deleteSite } from '../engine/publisher.js';
import { generateHeroImages } from '../engine/image-generator.js';
import { submitVideoTask, pollVideoTask } from '../engine/video-generator.js';
import { scrapeUrl } from '../engine/scraper.js';
import type { GeneratedSite } from '../types/index.js';

const BASE_URL = process.env['BASE_URL'] ?? 'http://localhost:3000';

// Business type enum shared across tools
const BUSINESS_TYPES = ['saas-tech', 'agency-studio', 'ecommerce', 'restaurant-food', 'portfolio-creative', 'luxury-jewelry', 'real-estate', 'fitness-health', 'auto-detailing', 'professional-services', 'music-events', 'education', 'beauty-salon', 'legal-finance', 'construction', 'pet-services', 'nonprofit', 'photography', 'travel-tourism', 'gaming-esports', 'other'] as const;
const MOODS = ['premium', 'playful', 'technical', 'warm', 'minimal', 'bold'] as const;

export const mcpTools = [
  // ─── Existing tools ──────────────────────────────────────────────────────────

  {
    name: 'list_modules',
    description: 'List all cinematic animation modules available for building websites, organized by category.',
    inputSchema: z.object({
      category: z.enum(['scroll-driven', 'cursor-hover', 'click-tap', 'ambient-auto', 'all']).optional().default('all'),
    }),
    handler: async ({ category }: { category: string }) => {
      const modules = category === 'all' ? MODULES : MODULES.filter(m => m.category === category);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ modules, total: modules.length }, null, 2),
        }],
      };
    },
  },

  {
    name: 'analyze_brand',
    description: 'Analyze a business and generate a brand card with color palette, typography, and copy recommendations.',
    inputSchema: z.object({
      businessName: z.string(),
      businessType: z.enum(BUSINESS_TYPES),
      mood: z.enum(MOODS),
      theme: z.enum(['dark', 'light']),
      description: z.string().optional(),
      sourceUrl: z.string().optional(),
      socialUrls: z.array(z.string()).optional().describe('URLs of the business social media profiles or website to scrape for brand data'),
    }),
    handler: async (args: any) => {
      const brand = await analyzeBrand(args.businessName, args.businessType, args.mood, args.theme, args.description, args.sourceUrl, 'es', args.socialUrls);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(brand, null, 2),
        }],
      };
    },
  },

  {
    name: 'recommend_modules',
    description: 'Get cinematic module recommendations for a specific business type.',
    inputSchema: z.object({
      businessType: z.enum(BUSINESS_TYPES),
      preferredModuleIds: z.array(z.string()).optional(),
    }),
    handler: async (args: any) => {
      const selection = pickModules(args.businessType, args.preferredModuleIds);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(selection, null, 2),
        }],
      };
    },
  },

  {
    name: 'create_site',
    description: 'Generate a complete cinematic HTML website for a business. Runs brand analysis, module selection, and site build in one step.',
    inputSchema: z.object({
      businessName: z.string().describe('Name of the business'),
      businessType: z.enum(BUSINESS_TYPES),
      mood: z.enum(MOODS),
      theme: z.enum(['dark', 'light']),
      language: z.enum(['es', 'en']).optional().default('es').describe('Language for generated copy'),
      description: z.string().optional().describe('Business description for more accurate copy generation'),
      sourceUrl: z.string().optional().describe('Existing website URL to extract brand context from'),
      socialUrls: z.array(z.string()).optional().describe('URLs of the business social media profiles (Instagram, Facebook, LinkedIn, TikTok, Twitter, or any website)'),
      heroImageUrl: z.string().optional().describe('Public URL of a hero image to embed in the site (e.g. /generations/images/abc.jpg)'),
      heroVideoUrl: z.string().optional().describe('Public URL of a hero video to embed in the site (e.g. /generations/videos/abc.mp4)'),
      galleryImageUrls: z.array(z.string()).optional().describe('Public URLs of gallery images to embed'),
      preferredModules: z.array(z.string()).optional().describe('Module IDs to prefer, e.g. ["07", "25"]'),
    }),
    handler: async (args: any) => {
      const brand = await analyzeBrand(
        args.businessName, args.businessType, args.mood, args.theme,
        args.description, args.sourceUrl, args.language ?? 'es', args.socialUrls,
      );

      // Inject media URLs into brand card if provided
      if (args.heroImageUrl) brand.heroImageUrl = args.heroImageUrl;
      if (args.heroVideoUrl) brand.heroVideoUrl = args.heroVideoUrl;
      if (args.galleryImageUrls?.length) brand.galleryImageUrls = args.galleryImageUrls;

      const modules = pickModules(args.businessType, args.preferredModules);
      const html = await buildSite(brand, modules);

      const site: GeneratedSite = {
        id: randomUUID(),
        slug: brand.slug,
        brandCard: brand,
        modules,
        html,
        createdAt: new Date().toISOString(),
        url: '',
        status: 'generating',
      };

      const published = publishSite(site, BASE_URL);

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            message: `Site created successfully for ${args.businessName}`,
            slug: published.slug,
            url: published.url,
            modules: {
              primary: modules.primary.name,
              secondary: modules.secondary?.name,
              tertiary: modules.tertiary?.name,
            },
            reasoning: modules.reasoning,
          }, null, 2),
        }],
      };
    },
  },

  {
    name: 'list_sites',
    description: 'List all generated cinematic sites with their URLs and metadata.',
    inputSchema: z.object({}),
    handler: async () => {
      const registry = loadRegistry();
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            total: registry.sites.length,
            sites: registry.sites.map(s => ({
              slug: s.slug,
              name: s.brandCard.name,
              url: s.url,
              businessType: s.brandCard.businessType,
              createdAt: s.createdAt,
              modules: [s.modules.primary.name, s.modules.secondary?.name, s.modules.tertiary?.name].filter(Boolean),
            })),
          }, null, 2),
        }],
      };
    },
  },

  {
    name: 'get_site',
    description: 'Get full details and HTML of a specific generated site by slug.',
    inputSchema: z.object({
      slug: z.string(),
      includeHtml: z.boolean().optional().default(false),
    }),
    handler: async ({ slug, includeHtml }: { slug: string; includeHtml: boolean }) => {
      const registry = loadRegistry();
      const site = registry.sites.find(s => s.slug === slug);
      if (!site) {
        return { content: [{ type: 'text', text: `Site "${slug}" not found` }], isError: true };
      }
      const result = includeHtml ? site : { ...site, html: `[HTML omitted — ${site.html.length} chars. Set includeHtml: true to get full HTML]` };
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  },

  {
    name: 'delete_site',
    description: 'Delete a generated site by slug.',
    inputSchema: z.object({ slug: z.string() }),
    handler: async ({ slug }: { slug: string }) => {
      const ok = deleteSite(slug);
      return {
        content: [{
          type: 'text',
          text: ok ? `Site "${slug}" deleted successfully.` : `Site "${slug}" not found.`,
        }],
      };
    },
  },

  // ─── New: Media generation tools ─────────────────────────────────────────────

  {
    name: 'generate_images',
    description: 'Generate AI hero/gallery images via nano-banana (Flux) on kie.ai. Returns local public URLs usable in create_site. Requires KIEAI_API_KEY.',
    inputSchema: z.object({
      businessName: z.string().describe('Name of the business — used to craft the image prompt'),
      businessType: z.enum(BUSINESS_TYPES),
      mood: z.enum(MOODS),
      palette: z.string().optional().default('neutral').describe('Color palette hint, e.g. "warm amber", "cool blue", "earth tones"'),
      count: z.number().min(1).max(6).optional().default(2).describe('Number of images to generate (1–6)'),
    }),
    handler: async (args: any) => {
      try {
        const tasks = await generateHeroImages(
          args.businessName,
          args.businessType,
          args.mood,
          args.palette ?? 'neutral',
          args.count ?? 2,
        );
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              message: `Generated ${tasks.length} image(s) successfully`,
              images: tasks.map(t => ({
                publicUrl: t.publicUrl,
                prompt: t.prompt,
                taskId: t.taskId,
              })),
            }, null, 2),
          }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Image generation failed: ${err.message}` }], isError: true };
      }
    },
  },

  {
    name: 'generate_video',
    description: 'Submit an image-to-video task via Kling 3.0 on kie.ai. Returns a taskId to poll with check_video_status. Requires KIEAI_API_KEY.',
    inputSchema: z.object({
      imageUrl: z.string().describe('Full URL of the source image (must be accessible from the internet, e.g. https://... or the server BASE_URL + /generations/images/xxx.jpg)'),
      businessName: z.string().describe('Name of the business — used to craft the video motion prompt'),
      businessType: z.enum(BUSINESS_TYPES),
      subject: z.string().optional().default('cinematic scene').describe('What is in the image, e.g. "steaming gourmet dish"'),
      action: z.string().optional().default('slowly revealed').describe('Desired motion, e.g. "slow orbit", "drift forward", "steam rising"'),
      mood: z.string().optional().default('cinematic atmospheric').describe('Visual mood, e.g. "premium warm", "dark moody", "bright playful"'),
    }),
    handler: async (args: any) => {
      try {
        const task = await submitVideoTask(
          args.imageUrl,
          args.subject ?? 'cinematic scene',
          args.action ?? 'slowly revealed',
          args.mood ?? 'cinematic atmospheric',
          args.businessName,
          args.businessType,
        );
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              message: 'Video task submitted. Poll with check_video_status using the taskId.',
              taskId: task.taskId,
              prompt: task.prompt,
              status: task.status,
              note: 'Kling 3.0 videos take ~2–5 minutes to generate. Poll every 30 seconds.',
            }, null, 2),
          }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Video submission failed: ${err.message}` }], isError: true };
      }
    },
  },

  {
    name: 'check_video_status',
    description: 'Poll the status of a Kling video generation task. Returns status and publicUrl when completed.',
    inputSchema: z.object({
      taskId: z.string().describe('The taskId returned by generate_video'),
    }),
    handler: async ({ taskId }: { taskId: string }) => {
      try {
        const task = await pollVideoTask(taskId);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              taskId: task.taskId,
              status: task.status,
              publicUrl: task.publicUrl ?? null,
              videoUrl: task.videoUrl ?? null,
              note: task.status === 'completed'
                ? 'Video ready. Use publicUrl in create_site as heroVideoUrl.'
                : task.status === 'failed'
                  ? 'Task failed. Try submitting again with generate_video.'
                  : 'Still processing. Poll again in 30 seconds.',
            }, null, 2),
          }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Status check failed: ${err.message}` }], isError: true };
      }
    },
  },

  {
    name: 'scrape_brand',
    description: 'Scrape a website or social media URL to extract brand data: colors, images, headlines, description, and contact info. Useful before calling create_site.',
    inputSchema: z.object({
      url: z.string().describe('Website or social media URL to scrape (e.g. https://mybrand.com, https://instagram.com/mybrand)'),
    }),
    handler: async ({ url }: { url: string }) => {
      try {
        const result = await scrapeUrl(url);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              message: 'Brand data scraped successfully',
              data: result,
            }, null, 2),
          }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text', text: `Scrape failed: ${err.message}` }], isError: true };
      }
    },
  },

  {
    name: 'list_generations',
    description: 'List all AI-generated images and videos stored on the server.',
    inputSchema: z.object({
      type: z.enum(['images', 'videos', 'all']).optional().default('all'),
    }),
    handler: async ({ type }: { type: string }) => {
      const { readdirSync, existsSync } = await import('node:fs');
      const { join } = await import('node:path');

      const imagesDir = join(process.cwd(), 'data/generations/images');
      const videosDir = join(process.cwd(), 'data/generations/videos');

      const images = (type === 'images' || type === 'all') && existsSync(imagesDir)
        ? readdirSync(imagesDir)
            .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
            .map(f => ({ filename: f, publicUrl: `/generations/images/${f}` }))
        : [];

      const videos = (type === 'videos' || type === 'all') && existsSync(videosDir)
        ? readdirSync(videosDir)
            .filter(f => /\.(mp4|webm)$/i.test(f))
            .map(f => ({ filename: f, publicUrl: `/generations/videos/${f}` }))
        : [];

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ images, videos, total: images.length + videos.length }, null, 2),
        }],
      };
    },
  },
];
