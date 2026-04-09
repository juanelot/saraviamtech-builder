import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './web/routes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env['PORT'] ?? '3000');

const app = express();

app.use(cors());
app.use(express.json());

// API routes
app.use('/api', apiRouter);

// Serve generated sites
app.use('/sites', express.static(join(__dirname, '../public/sites')));

// Serve AI-generated assets (images, videos)
app.use('/generations', express.static(join(__dirname, '../data/generations')));

// Serve user-uploaded assets
app.use('/uploads', express.static(join(__dirname, '../data/uploads')));

// Serve frontend app
app.use('/', express.static(join(__dirname, '../public/app')));

app.listen(PORT, () => {
  console.log(`SaraviamTech Builder running at http://localhost:${PORT}`);
  console.log(`  Dashboard:   http://localhost:${PORT}/`);
  console.log(`  Builder:     http://localhost:${PORT}/builder.html`);
  console.log(`  Gallery:     http://localhost:${PORT}/gallery.html`);
  console.log(`  Generations: http://localhost:${PORT}/generations.html`);
  console.log(`  API:         http://localhost:${PORT}/api`);
});

export default app;
