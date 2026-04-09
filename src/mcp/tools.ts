import { z } from 'zod';
import { randomUUID } from 'crypto';
import { analyzeBrand } from '../engine/brand-analyzer.js';
import { pickModules, MODULES } from '../engine/module-picker.js';
import { buildSite } from '../engine/site-builder.js';
import { publishSite, loadRegistry, deleteSite } from '../engine/publisher.js';
import type { GeneratedSite } from '../types/index.js';

const BASE_URL = process.env['BASE_URL'] ?? 'http://localhost:3000';

export const mcpTools = [
  {
    name: 'list_modules',
    description: 'List all 30 cinematic modules available for building websites, organized by category.',
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
      businessType: z.enum(['saas-tech', 'agency-studio', 'ecommerce', 'restaurant-food', 'portfolio-creative', 'luxury-jewelry', 'real-estate', 'fitness-health', 'auto-detailing', 'professional-services', 'other']),
      mood: z.enum(['premium', 'playful', 'technical', 'warm', 'minimal', 'bold']),
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
      businessType: z.enum(['saas-tech', 'agency-studio', 'ecommerce', 'restaurant-food', 'portfolio-creative', 'luxury-jewelry', 'real-estate', 'fitness-health', 'auto-detailing', 'professional-services', 'other']),
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
      businessType: z.enum(['saas-tech', 'agency-studio', 'ecommerce', 'restaurant-food', 'portfolio-creative', 'luxury-jewelry', 'real-estate', 'fitness-health', 'auto-detailing', 'professional-services', 'other']),
      mood: z.enum(['premium', 'playful', 'technical', 'warm', 'minimal', 'bold']),
      theme: z.enum(['dark', 'light']),
      description: z.string().optional().describe('Business description for more accurate copy generation'),
      sourceUrl: z.string().optional().describe('Existing website URL to extract brand context from'),
      socialUrls: z.array(z.string()).optional().describe('URLs of the business social media profiles or website (Instagram, Facebook, LinkedIn, TikTok, Twitter, or any website). Used to extract brand colors, images, bio, and contact info.'),
      preferredModules: z.array(z.string()).optional().describe('Module IDs to prefer, e.g. ["07", "25"]'),
    }),
    handler: async (args: any) => {
      const brand = await analyzeBrand(args.businessName, args.businessType, args.mood, args.theme, args.description, args.sourceUrl, 'es', args.socialUrls);
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
];
