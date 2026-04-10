import { writeFileSync, mkdirSync, existsSync, readFileSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { GeneratedSite, SiteRegistry } from '../types/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, '../../public/sites');
const REGISTRY_PATH = join(__dirname, '../../data/sites-registry.json');

function ensureDir(dir: string) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

export function loadRegistry(): SiteRegistry {
  if (!existsSync(REGISTRY_PATH)) {
    return { sites: [], updatedAt: new Date().toISOString() };
  }
  return JSON.parse(readFileSync(REGISTRY_PATH, 'utf-8'));
}

export function saveRegistry(registry: SiteRegistry) {
  ensureDir(dirname(REGISTRY_PATH));
  registry.updatedAt = new Date().toISOString();
  writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2));
}

export function publishSite(site: GeneratedSite, baseUrl: string): GeneratedSite {
  const siteDir = join(PUBLIC_DIR, site.slug);
  ensureDir(siteDir);
  writeFileSync(join(siteDir, 'index.html'), site.html);

  const published: GeneratedSite = {
    ...site,
    url: `${baseUrl}/sites/${site.slug}/`,
    status: 'ready',
  };

  const registry = loadRegistry();
  const existingIdx = registry.sites.findIndex(s => s.slug === site.slug);
  if (existingIdx >= 0) {
    registry.sites[existingIdx] = published;
  } else {
    registry.sites.unshift(published);
  }
  saveRegistry(registry);

  return published;
}

export function deleteSite(slug: string): boolean {
  const registry = loadRegistry();
  const idx = registry.sites.findIndex(s => s.slug === slug);
  if (idx < 0) return false;
  registry.sites.splice(idx, 1);
  saveRegistry(registry);

  const siteDir = join(PUBLIC_DIR, slug);
  if (existsSync(siteDir)) {
    rmSync(siteDir, { recursive: true });
  }
  return true;
}
