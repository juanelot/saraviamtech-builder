import { config as dotenvConfig } from 'dotenv';
dotenvConfig({ override: true });
import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './web/routes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env['PORT'] ?? '3000');
const ACCESS_TOKEN = process.env['ACCESS_TOKEN'] ?? '';

const app = express();

app.use(cors());
app.use(express.json());

// ── Auth helpers ────────────────────────────────────────────────────────────

function parseCookies(req: Request): Record<string, string> {
  const out: Record<string, string> = {};
  const header = req.headers.cookie ?? '';
  for (const pair of header.split(';')) {
    const [k, ...rest] = pair.trim().split('=');
    if (k) out[k.trim()] = decodeURIComponent(rest.join('='));
  }
  return out;
}

function isAuthenticated(req: Request): boolean {
  if (!ACCESS_TOKEN) return true; // no token configured → open
  const cookies = parseCookies(req);
  return cookies['st_access'] === ACCESS_TOKEN;
}

// POST /api/auth/verify — validates token and sets cookie
app.post('/api/auth/verify', (req: Request, res: Response) => {
  const { token } = req.body ?? {};
  if (!ACCESS_TOKEN || token === ACCESS_TOKEN) {
    res.setHeader('Set-Cookie', `st_access=${ACCESS_TOKEN}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${60 * 60 * 24 * 30}`);
    res.json({ ok: true });
  } else {
    res.status(401).json({ ok: false });
  }
});

// POST /api/auth/logout — clears the access cookie
app.post('/api/auth/logout', (_req: Request, res: Response) => {
  res.setHeader('Set-Cookie', 'st_access=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0');
  res.json({ ok: true });
});

// ── Auth guard — protects frontend HTML + API (except /api/auth/) ────────────

app.use((req: Request, res: Response, next: NextFunction) => {
  // Public paths: login page, its assets, generated sites, verify endpoint already handled above
  const pub = ['/login.html', '/favicon.png', '/sites/', '/api/auth/'];
  if (pub.some(p => req.path.startsWith(p))) return next();

  if (!isAuthenticated(req)) {
    if (req.path.startsWith('/api/')) {
      res.status(401).json({ error: 'Unauthorized' });
    } else {
      res.redirect(`/login.html?next=${encodeURIComponent(req.path)}`);
    }
    return;
  }
  next();
});

// ── Routes ──────────────────────────────────────────────────────────────────

// API routes
app.use('/api', apiRouter);

// Serve generated sites (always public — end clients visit these)
app.use('/sites', express.static(join(__dirname, '../public/sites')));

// Serve AI-generated assets (images, videos)
app.use('/generations', express.static(join(__dirname, '../data/generations')));

// Serve user-uploaded assets
app.use('/uploads', express.static(join(__dirname, '../data/uploads')));

// Serve module HTML files for iframe previews (authenticated — inside auth guard)
app.use('/modules-preview', express.static(join(__dirname, '../modules')));

// Serve frontend app — no-cache on HTML so browsers always get the latest version
app.use('/', express.static(join(__dirname, '../public/app'), {
  setHeaders(res, filePath) {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-store');
    }
  },
}));

app.listen(PORT, () => {
  console.log(`SaraviamTech Builder running at http://localhost:${PORT}`);
  console.log(`  Dashboard:      http://localhost:${PORT}/`);
  console.log(`  Builder:        http://localhost:${PORT}/builder.html`);
  console.log(`  Gallery:        http://localhost:${PORT}/gallery.html`);
  console.log(`  Generations:    http://localhost:${PORT}/generations.html`);
  console.log(`  Settings:       http://localhost:${PORT}/settings.html`);
  console.log(`  API:            http://localhost:${PORT}/api`);
  if (ACCESS_TOKEN) {
    console.log(`  Auth:           TOKEN PROTEGIDO ✓`);
  } else {
    console.log(`  Auth:           SIN PROTECCIÓN — agrega ACCESS_TOKEN en .env`);
  }
});

export default app;
