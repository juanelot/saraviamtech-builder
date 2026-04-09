# SaraviamTech Builder

AI-powered cinematic website generator. Analyzes a business, scrapes brand data, and produces a unique, production-ready HTML site with dynamic layouts, animations, AI-generated images, and videos — all in one request.

---

## What it does

1. **Brand Analysis** — Takes business name, type, mood, theme, and optional description or social URLs. Uses GPT-4o to generate copywriting (headlines, taglines, descriptions, CTAs) in Spanish or English.
2. **Social & Web Scraping** — Scrapes Instagram, Facebook, LinkedIn, TikTok, Twitter, and websites to extract brand colors, bio, images, and headlines automatically.
3. **Layout Direction** — An AI layout director selects a unique section pipeline (hero + 8–12 sections) based on the business personality, with 40+ available section types.
4. **Cinematic Modules** — Injects interactive animation modules (scroll-driven, cursor/hover, click/tap, ambient) selected by the AI based on industry and mood.
5. **AI Image Generation** — Generates hero and gallery images via **nano-banana (kie.ai / Flux)** with LLM-crafted prompts specific to the business industry, mood, and visual style.
6. **AI Video Generation** — Generates a cinematic hero video via **Kling 3.0 (kie.ai)** with LLM-crafted prompts tailored to the industry, subject, and mood — no generic templates.
7. **Site Output** — Produces a standalone HTML file served at `/sites/:slug`, registered in a live site registry.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js + TypeScript |
| Server | Express.js |
| AI Copy | OpenAI GPT-4o / GPT-4o-mini |
| AI Images | kie.ai — `google/nano-banana` (Flux) |
| AI Video | kie.ai — `kling-3.0/video` (Kling AI) |
| Scraping | Cheerio + native fetch |
| Protocol | MCP (Model Context Protocol) server |
| Build | TypeScript compiler (tsc) |

---

## Project Structure

```
src/
├── engine/
│   ├── brand-analyzer.ts       # Brand card generation + OpenAI copy enrichment
│   ├── layout-director.ts      # AI layout planner — selects section pipeline
│   ├── site-builder.ts         # Assembles final HTML from layout plan
│   ├── image-generator.ts      # AI image generation via nano-banana (kie.ai)
│   ├── video-generator.ts      # AI video generation via Kling 3.0 (kie.ai)
│   ├── scraper.ts              # Web scraping (images, colors, copy, meta)
│   ├── social-scraper.ts       # Social media profile scraping
│   ├── module-picker.ts        # Cinematic module selector
│   ├── publisher.ts            # Site file writing + registry management
│   └── sections/               # 40+ HTML section renderers
│       ├── hero-fullbleed.ts
│       ├── hero-split.ts
│       ├── hero-editorial.ts
│       ├── typewriter-hero.ts
│       ├── mesh-hero.ts
│       ├── gallery-grid.ts
│       ├── gallery-masonry.ts
│       ├── carousel.ts
│       ├── services-grid.ts
│       ├── services-sticky.ts
│       ├── stats-band.ts
│       ├── testimonials.ts
│       ├── faq-accordion.ts
│       ├── contact-form.ts
│       ├── cta-banner.ts
│       ├── footer.ts
│       ├── story-narrative.ts
│       ├── quote-feature.ts
│       ├── kinetic-marquee.ts
│       ├── spotlight-services.ts
│       ├── accordion-slider.ts
│       ├── sticky-cards.ts
│       ├── flip-cards.ts
│       ├── horizontal-scroll.ts
│       ├── sticky-stack.ts
│       ├── zoom-parallax.ts
│       ├── curtain-reveal.ts   # Video-capable hero
│       ├── text-mask.ts
│       ├── split-scroll.ts
│       ├── color-shift.ts
│       ├── cursor-reactive.ts
│       ├── cursor-reveal.ts
│       ├── image-trail.ts
│       ├── magnetic-grid.ts
│       ├── coverflow.ts
│       ├── glitch-effect.ts
│       ├── text-scramble.ts
│       ├── mesh-gradient.ts
│       ├── circular-text.ts
│       ├── odometer.ts
│       ├── svg-draw.ts
│       ├── typewriter.ts
│       ├── spotlight-border.ts
│       ├── gradient-stroke.ts
│       ├── particle-button.ts
│       ├── view-transitions.ts
│       ├── dock-nav.ts
│       ├── drag-pan.ts
│       └── dynamic-island.ts
├── web/
│   └── routes.ts               # Express REST API endpoints
├── mcp/
│   ├── server.ts               # MCP server entry
│   └── tools.ts                # MCP tool definitions
├── lib/
│   └── openai.ts               # OpenAI client (miniChat + creativeChat)
├── types/
│   └── index.ts                # TypeScript interfaces
└── server.ts                   # Express app entry point

public/
├── app/                        # Frontend UI
└── sites/                      # Generated site HTML files

data/
└── generations/
    ├── images/                 # AI-generated images (nano-banana)
    └── videos/                 # AI-generated videos (Kling)
```

---

## API Endpoints

### Site Generation

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/sites` | Generate a complete site |
| `GET` | `/api/sites` | List all generated sites |
| `GET` | `/api/sites/:slug` | Get site metadata |
| `DELETE` | `/api/sites/:slug` | Delete a site |

**POST `/api/sites` body:**
```json
{
  "businessName": "Restaurante El Rincón",
  "businessType": "restaurant-food",
  "mood": "premium",
  "theme": "dark",
  "language": "es",
  "description": "Cocina mexicana de autor con ingredientes locales",
  "sourceUrl": "https://example.com",
  "socialUrls": ["https://instagram.com/example"],
  "heroImageUrl": "/generations/images/abc.jpg",
  "heroVideoUrl": "/generations/videos/xyz.mp4",
  "galleryImageUrls": ["/generations/images/1.jpg", "/generations/images/2.jpg"],
  "customSections": ["hero-fullbleed", "gallery-masonry", "contact-form"]
}
```

### Image Generation

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/generate-images` | Generate hero/gallery images via nano-banana |
| `GET` | `/api/generations/images` | List saved generated images |

**POST `/api/generate-images` body:**
```json
{
  "businessName": "Restaurante El Rincón",
  "businessType": "restaurant-food",
  "mood": "premium",
  "palette": "warm",
  "count": 4
}
```

### Video Generation

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/generate-video` | Submit image-to-video task (Kling 3.0) |
| `GET` | `/api/video-status/:taskId` | Poll video task status |

**POST `/api/generate-video` body:**
```json
{
  "imageUrl": "/generations/images/abc.jpg",
  "businessName": "Restaurante El Rincón",
  "businessType": "restaurant-food",
  "subject": "steaming gourmet dish",
  "action": "slowly revealed",
  "mood": "premium warm"
}
```

### Upload

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/upload-image` | Upload user image |
| `POST` | `/api/upload-video` | Upload user video |

---

## Business Types

`saas-tech` · `agency-studio` · `ecommerce` · `restaurant-food` · `portfolio-creative` · `luxury-jewelry` · `real-estate` · `fitness-health` · `auto-detailing` · `professional-services` · `music-events` · `education` · `beauty-salon` · `legal-finance` · `construction` · `pet-services` · `nonprofit` · `photography` · `travel-tourism` · `gaming-esports` · `other`

---

## Environment Variables

Create a `.env` file in the project root:

```env
OPENAI_API_KEY=sk-...         # GPT-4o for copy + prompt generation
KIEAI_API_KEY=...              # kie.ai for image (nano-banana) and video (Kling) generation
PORT=3000                      # Optional, defaults to 3000
```

Both keys are optional — the builder falls back to deterministic templates if AI APIs are unavailable.

---

## Setup & Run

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Development (hot reload)
npm run dev

# Production
npm start

# MCP server
npm run mcp
```

---

## Key Features & Design Decisions

### AI Prompt Generation for Images & Videos

Rather than using fixed templates, when OpenAI is available the system calls `miniChat` (GPT-4o-mini) to generate rich, contextual prompts specific to the business name, industry, mood, and color palette before sending to kie.ai. If OpenAI is unavailable, a curated library of industry-specific seed prompts is used with random selection to ensure variety.

### Video-Capable Hero Enforcement

When a user provides a hero video, the layout director is overridden post-selection to ensure the hero section type is always one that supports video rendering (`hero-fullbleed`, `hero-split`, `mesh-hero`, `typewriter-hero`). This prevents silent video drops where other hero types (e.g. `curtain-reveal`, `text-mask`) would ignore the video asset.

### Image Rendering — Natural Aspect Ratios

Gallery, masonry, and carousel sections render images at their natural aspect ratios using `height:auto` and CSS `columns` masonry layout instead of fixed `grid-auto-rows` with forced aspect ratios. This prevents distortion of portrait, square, and tall images. `object-position:center top` ensures subjects (faces, food, products) are kept in frame.

### Social Scraping

The scraper extracts profile name, bio, follower count, images, colors, headlines, links, and contact info from Instagram, Facebook, LinkedIn, TikTok, Twitter, and arbitrary websites. Scraped brand colors are used to override the accent color in the generated palette.

### MCP Integration

The builder exposes a full Model Context Protocol (MCP) server, allowing Claude and other AI assistants to generate sites, images, and videos as tools within agentic workflows.

---

## License

Private — SaraviamTech © 2025
