---
name: webcraft
description: Cinematic module picker + combiner from the Cinematic Sites Framework. Describe what kind of site you want → recommends 2-3 cinematic modules → generates a single HTML file combining them. 31 modules included. Triggers on "webcraft", "cinematic site", "build me a site", "combine modules", "pick modules for".
---

# Webcraft — Cinematic Sites Framework

Turn a description into a premium single-file website by picking and combining interaction modules from the built-in library.

## How to Invoke

```
/webcraft dark SaaS landing page with scroll animation and feature section
```

```
/webcraft bakery website, warm palette, hero video feel
```

```
/webcraft portfolio for a photographer, lots of images, playful
```

With specific modules:

```
/webcraft --modules "text-mask, sticky-stack, marquee" --theme dark --name "Acme Corp"
```

---

## Process

### Step 1: Understand the Brief

Parse the user's description for:
- **Business type** (SaaS, bakery, agency, portfolio, e-commerce, etc.)
- **Mood** (premium, playful, technical, warm, minimal, bold)
- **Theme preference** (dark / light / auto)
- **Any specific modules requested** (via `--modules` flag)
- **Business name** (via `--name` flag, or infer from context)

### Step 2: Recommend Modules

If no `--modules` flag, recommend **2-3 modules** from the library below. Pick based on:

| Business Type | Strong Module Combos |
|---|---|
| SaaS / Tech | Sticky Stack + Text Scramble + Spotlight Borders |
| Agency / Studio | Horizontal Scroll + Image Trail + Kinetic Marquee |
| E-commerce | View Transitions + Accordion Slider + Odometer |
| Restaurant / Food | Text Mask + Scroll Color Shift + Curtain Reveal |
| Portfolio / Creative | Drag-to-Pan + Hover Image Trail + Glitch Effect |
| Luxury / Jeweler | Zoom Parallax + Mesh Gradient + Circular Text |
| Real Estate / Renovation | Cursor Image Reveal + Sticky Cards + Split Scroll |
| Fitness / Health | Scroll Color Shift + Particle Button + Typewriter |
| Auto / Detailing | Curtain Reveal + Cursor Reactive + Odometer |
| Professional Services | Sticky Stack + SVG Draw + Flip Cards |

**Rules:**
- Never combine more than 3 modules (cognitive overload)
- Always include exactly 1 scroll-driven module (it's the backbone)
- The second module should be cursor/hover OR click/tap
- The third (optional) should be ambient/typography
- Tell the user which modules you picked and why, in one line each

### Step 2.5: Generate Hero Image (Optional — requires GOOGLE_API_KEY)

If `GOOGLE_API_KEY` is set, generate a cinematic hero image for the site using Imagen 3 (Nano Banana).

**How to call the API:**

```bash
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=YOUR_GOOGLE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "instances": [{ "prompt": "YOUR_PROMPT_HERE" }],
    "parameters": { "sampleCount": 2, "aspectRatio": "16:9" }
  }'
```

**Prompt formula:**
```
Cinematic product photography of [KEY_OBJECT] for a [BUSINESS_TYPE] brand.
[MOOD_DESCRIPTOR] lighting, [PALETTE_COLOR] tones, dark [MATERIAL] surface.
Ultra-realistic, 8K, shallow depth of field, no text, no people.
```

**Rules:**
- Generate 2 options (sampleCount: 2) — give the user both to choose from
- Pause here and show the images before continuing to Step 2.7
- If the API call fails or key is missing, skip to Step 3 and use CSS-only hero

---

### Step 2.7: Animate Hero to Video (Optional — requires KIEAI_API_KEY)

If the user approves an image AND `KIEAI_API_KEY` is set, animate it using **Kling 3.0 via kie.ia**.

**Step 1 — Submit the task:**

```bash
curl -X POST "https://api.kieai.com/api/v1/jobs/createTask" \
  -H "Authorization: Bearer YOUR_KIEAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "kling-3.0/video",
    "input": {
      "prompt": "YOUR_ANIMATION_PROMPT",
      "image_urls": ["URL_OR_BASE64_OF_APPROVED_IMAGE"],
      "sound": false,
      "duration": "5",
      "aspect_ratio": "16:9",
      "mode": "pro",
      "multi_shots": false
    }
  }'
```

Response returns a `taskId`. Use it to poll status:

**Step 2 — Poll for result:**

```bash
curl "https://api.kieai.com/api/v1/jobs/getTask?taskId=TASK_ID" \
  -H "Authorization: Bearer YOUR_KIEAI_API_KEY"
```

Poll every 5 seconds until status is `completed`. Then extract the video URL from the response.

**Animation prompt formula:**
```
[SUBJECT] [ACTION]. Camera slowly [MOVEMENT]. Cinematic, [MOOD], no text, no people.
```

**Rules:**
- Use `mode: "pro"` for final output (1920×1080), `mode: "std"` for faster iterations
- Generate 2 videos for optionality — submit both tasks, poll both, show results to user
- `sound: false` — no audio needed for website hero backgrounds
- Pause and show videos before continuing to Step 3
- The approved video becomes the hero asset used in the Scroll Frame Sequence module (ID: 00)
- If API call fails or key is missing, use the static image as hero background instead
- Extract frames from the approved video for the scroll-driven animation in Step 3

---

### Step 3: Build the Combined Site

Generate a **single `index.html`** file that combines the selected modules into a complete website.

#### Architecture Rules (NEVER BREAK)

- **Single HTML file** — all CSS in `<style>`, all JS in `<script>`
- **No frameworks** — no React, Vue, npm, build step
- **CDN only** — GSAP + ScrollTrigger, Google Fonts, Lucide Icons (optional)
- **Responsive** — 375px mobile to 1440px+ desktop
- **No placeholder text** — generate realistic copy that matches the business type
- **No emojis** — ever

#### Required CDN

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
```

#### Site Structure

```
1. HERO — Uses module 1 (scroll-driven) as the main hero effect
2. FEATURES / SERVICES — Uses module 2 (interaction-based)
3. SOCIAL PROOF / STATS — Optional module 3 (ambient/typography)
4. ABOUT — Simple fade-up section
5. CONTACT / CTA — Final call to action
6. FOOTER — Minimal
```

#### Font Pairings (pick one that matches the mood)

| Sans (Body) | Display Use | Mood |
|---|---|---|
| Outfit 300-700 | Display headlines | Modern, versatile |
| Geist 300-700 | Technical, SaaS | Developer/tech |
| Cabinet Grotesk 400-700 | Creative, agency | Bold, editorial |
| Satoshi 400-700 | Premium, clean | Sophisticated |

**BANNED fonts:** Inter (generic), Comic Sans, Papyrus. Use only the fonts above.

#### Color Palettes

**Dark palettes:**
| Name | `--bg` | `--surface` | `--accent` | `--text` | `--muted` |
|---|---|---|---|---|---|
| Warm Night | `#09090b` | `#111114` | `#c8a97e` | `#eae7e2` | `#5a5a5e` |
| Deep Teal | `#0a0a0b` | `#111114` | `#5eadb5` | `#eae7e2` | `#5a5a5e` |
| Ember | `#09090b` | `#111114` | `#e85d3a` | `#eae7e2` | `#5a5a5e` |
| Indigo | `#09090b` | `#111114` | `#4f46e5` | `#eae7e2` | `#5a5a5e` |
| Forest | `#09090b` | `#111114` | `#4ca879` | `#eae7e2` | `#5a5a5e` |

**Light palettes:**
| Name | `--bg` | `--surface` | `--accent` | `--text` | `--muted` |
|---|---|---|---|---|---|
| Cream | `#f5f3ef` | `#ffffff` | `#4f46e5` | `#1a1a1f` | `#6b6b73` |
| Warm Ivory | `#fafaf8` | `#ffffff` | `#e85d3a` | `#1a1a1f` | `#6b6b73` |
| Cool Gray | `#fafafa` | `#ffffff` | `#5eadb5` | `#1a1a1f` | `#6b6b73` |

**NEVER use pure `#000000` for backgrounds.** Off-black only.

#### Quality Standards (from taste-skill)

- **Typography:** `tracking-tighter` on headlines, `leading-relaxed` on body, max `65ch` paragraph width
- **No centered hero text** unless the module requires it (e.g., zoom parallax)
- **Shadows:** Tint to the background hue, never default gray `box-shadow`
- **Buttons:** Tactile feedback — `scale(0.97)` on `:active`, `translateY(-1px)` on hover
- **Loading states:** Shimmer bar if the site has heavy assets, not a spinner
- **Noise texture:** SVG grain on a fixed pseudo-element, `opacity: 0.035`, `pointer-events: none`
- **Hardware acceleration:** Only animate `transform` and `opacity`. Never `top`, `left`, `width`, `height`
- **Viewport:** Use `min-h-[100dvh]` pattern, never `100vh` (breaks on iOS Safari)

### Step 4: Output

Save the generated file to the current working directory as `index.html`.

Tell the user:
1. Which modules were combined and why
2. The file path
3. How to preview it (`npx serve .` or open in browser)

---

## Module Library Reference

### Scroll-Driven
| ID | Name | File | What It Does |
|---|---|---|---|
| 01 | Text Mask Reveal | `text-mask.html` | Giant headline fills with colour/video via scroll clip-path |
| 02 | Sticky Stack Narrative | `sticky-stack.html` | Product pins left, feature cards scroll right |
| 03 | Layered Zoom Parallax | `zoom-parallax.html` | Depth layers at different speeds, product reveals at center |
| 06 | Horizontal Scroll Hijack | `horizontal-scroll.html` | Vertical scroll drives horizontal card gallery |
| 07 | Sticky Card Stack | `sticky-cards.html` | Cards pin and stack on top of each other |
| 12 | Scroll SVG Draw | `svg-draw.html` | SVG paths draw with stroke-dashoffset on scroll |
| 13 | Curtain Reveal | `curtain-reveal.html` | Hero splits open like a curtain |
| 16 | Split Screen Scroll | `split-scroll.html` | Two columns scroll opposite directions |
| 20 | Scroll Color Shift | `color-shift.html` | Background palette transitions per section |

### Cursor & Hover
| ID | Name | File | What It Does |
|---|---|---|---|
| 04 | Cursor-Reactive | `cursor-reactive.html` | Glow follows cursor, 3D tilt cards, magnetic buttons, ripples |
| 09 | Accordion Slider | `accordion-slider.html` | Narrow strips expand on hover, horizontal + vertical |
| 11 | Cursor Image Reveal | `cursor-reveal.html` | Before/after wipe, circular spotlight, vertical split |
| 14 | Hover Image Trail | `image-trail.html` | Mouse leaves trail of fading images |
| 18 | 3D Flip Cards | `flip-cards.html` | Cards rotate 180deg on hover |
| 22 | Magnetic Repel Grid | `magnetic-grid.html` | Grid tiles push away from cursor |
| 25 | Spotlight Border Cards | `spotlight-border.html` | Grid borders illuminate under cursor |
| 29 | Drag-to-Pan Grid | `drag-pan.html` | Infinite canvas draggable in any direction |

### Click & Tap
| ID | Name | File | What It Does |
|---|---|---|---|
| 05 | View Transition Morphing | `view-transitions.html` | Cards expand into overlays, pills morph into panels |
| 21 | Odometer Counter | `odometer.html` | Mechanical digit wheels roll to target numbers |
| 23 | Particle Explosion Button | `particle-button.html` | CTAs burst into particles/confetti/rings on click |
| 27 | 3D Coverflow Carousel | `coverflow.html` | Center-focused carousel, edges angled in perspective |
| 28 | Dynamic Island Nav | `dynamic-island.html` | Pill morphs to show notifications and status |
| 30 | macOS Dock Nav | `dock-nav.html` | Icons magnify as cursor approaches |

### Ambient & Auto
| ID | Name | File | What It Does |
|---|---|---|---|
| 08 | Text Scramble Decode | `text-scramble.html` | Matrix-style character cycling resolving to real text |
| 10 | Kinetic Marquee | `kinetic-marquee.html` | Infinite text bands, scroll-reactive speed |
| 15 | Mesh Gradient Background | `mesh-gradient.html` | Animated lava-lamp colour blobs |
| 17 | Circular Text Path | `circular-text.html` | Text on spinning SVG circle |
| 19 | Glitch Effect | `glitch-effect.html` | RGB channel split on hover |
| 24 | Typewriter Effect | `typewriter.html` | Text types letter by letter, cycling/code/chat variants |
| 26 | Gradient Stroke Text | `gradient-stroke.html` | Animated gradient along outlined text |

### Special
| ID | Name | What It Does |
|---|---|---|
| 00 | Scroll Frame Sequence | Video frames tied to scroll position (requires frame extraction) |

---

## API Keys Setup

### Where to add your keys

The agent reads these from environment variables. Set them once and all webcraft runs will use them automatically.

**Option 1 — `.env` file in the project root** (recommended):
```
# saraviamtech-builder/.env
GOOGLE_API_KEY=your_google_api_key_here
KIEAI_API_KEY=your_kieai_api_key_here
```

**Option 2 — Shell environment** (for Claude Code / terminal sessions):
```bash
export GOOGLE_API_KEY=your_google_api_key_here
export KIEAI_API_KEY=your_kieai_api_key_here
```

### Where to get each key

| Key | Where to get it | Cost |
|---|---|---|
| `GOOGLE_API_KEY` | Google AI Studio → API Keys | $300 USD welcome credit per Gmail account |
| `KIEAI_API_KEY` | kie.ia → Account → API Keys | Pay per use, no subscription |

### Which model each key unlocks

| Key | Model | What it generates |
|---|---|---|
| `GOOGLE_API_KEY` | Imagen 3 (`imagen-3.0-generate-002`) | Hero images — photorealistic, 16:9 |
| `KIEAI_API_KEY` | Kling 3.0 Pro (`kling-3.0/video`) | Hero videos — 5s cinematic, 1920×1080 |

---

## Combination Anti-Patterns (NEVER DO)

- **Two scroll-driven modules competing** — only one should control the scroll narrative
- **Cursor glow + spotlight borders** — conflicting cursor effects
- **Marquee + typewriter in the same section** — competing for text attention
- **More than 3 modules** — the site becomes a demo, not a website
- **Glitch effect on a luxury brand** — wrong tone
- **Image trail on mobile** — no cursor, doesn't work
- **Horizontal scroll + sticky cards** — both hijack scroll, conflict

## Iteration

After the first build, the user may ask for tweaks. Common requests:

| Request | Fix |
|---|---|
| "Too busy" | Remove the weakest module, simplify to 2 |
| "Not enough wow" | Add a stronger ambient element (mesh gradient, marquee) |
| "Text is hard to read" | Increase gradient mask, add backdrop-filter behind text |
| "Laggy on mobile" | Reduce frame count, simplify cursor effects (they don't exist on mobile anyway) |
| "Wrong vibe" | Swap the accent colour and font pairing first — that fixes 80% of vibe issues |