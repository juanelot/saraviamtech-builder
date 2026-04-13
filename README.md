# SaraviamTech Builder

Generador de sitios web cinematográficos impulsado por IA. Analiza un negocio, extrae datos de marca y produce una **base HTML lista para producción** con diseños dinámicos, animaciones, imágenes y videos generados por IA — todo en una sola solicitud. El resultado es un punto de partida sólido y personalizado que puede refinarse y adaptarse antes del despliegue final.

---

## Capturas de Pantalla

### Builder — Paso 1: Brief del negocio
Configura nombre, tipo de negocio, mood, tema, idioma y tipo de sitio (Completo o Landing Page). Opcionalmente agrega descripción y URLs de redes sociales para enriquecer la marca con scraping automático.

![Builder - Brief](capturas%20de%20aplicacion%20de%20plantillas%20web/builder1.png)
![Builder - Brief con datos](capturas%20de%20aplicacion%20de%20plantillas%20web/builder2.png)

### Builder — Paso 2: Marca generada por IA
GPT-4o genera automáticamente paleta de colores, tipografía y copywriting (headline, tagline, descripción, CTA, servicios). También selecciona los módulos cinematográficos ideales para la industria y mood.

![Builder - Paleta y copy](capturas%20de%20aplicacion%20de%20plantillas%20web/builder3.png)
![Builder - Módulos cinematográficos](capturas%20de%20aplicacion%20de%20plantillas%20web/builder4.png)

### Builder — Paso 3: Imágenes generadas por IA
Genera imágenes hero y de galería via **nano-banana (kie.ai / Flux)**. Soporta generación de múltiples imágenes o subida de imágenes propias.

![Builder - Imágenes IA](capturas%20de%20aplicacion%20de%20plantillas%20web/builder5.png)
![Builder - Subida de imágenes](capturas%20de%20aplicacion%20de%20plantillas%20web/builder6.png)
![Builder - Galería generada](capturas%20de%20aplicacion%20de%20plantillas%20web/builder7.png)
![Builder - Selección de imagen hero](capturas%20de%20aplicacion%20de%20plantillas%20web/builder8.png)

### Builder — Paso 4: Video hero con Kling 3.0
Genera video cinematográfico a partir de la imagen hero via **Kling 3.0 (kie.ai)**. Soporta generación automática o subida de video propio.

![Builder - Generar video](capturas%20de%20aplicacion%20de%20plantillas%20web/builder9.png)
![Builder - Subida de video](capturas%20de%20aplicacion%20de%20plantillas%20web/builder10.png)

### Builder — Paso 5: Construir sitio
Resumen completo del sitio antes de construir: negocio, tipo, módulos seleccionados, imagen hero, galería, video y paleta de color.

![Builder - Resumen del sitio](capturas%20de%20aplicacion%20de%20plantillas%20web/builder11.png)
![Builder - Construyendo...](capturas%20de%20aplicacion%20de%20plantillas%20web/builder12.png)
![Builder - Sitio generado](capturas%20de%20aplicacion%20de%20plantillas%20web/builder13.png)

### Sitio generado — Resultado final
Ejemplo de sitio completo generado para `coffee_lite` (restaurante-food, dark, premium). Incluye hero con video, story narrative, carrusel de imágenes, coverflow, formulario de contacto y footer cinematográfico.

![Sitio - Hero con video](capturas%20de%20aplicacion%20de%20plantillas%20web/builder14.png)
![Sitio - Story narrative con stats](capturas%20de%20aplicacion%20de%20plantillas%20web/builder15.png)
![Sitio - Carrusel de imágenes](capturas%20de%20aplicacion%20de%20plantillas%20web/builder16.png)
![Sitio - Coverflow gallery](capturas%20de%20aplicacion%20de%20plantillas%20web/builder17.png)
![Sitio - Formulario de contacto](capturas%20de%20aplicacion%20de%20plantillas%20web/builder18.png)

### Dashboard y Galería
Vista principal con sitios recientes, conteo total y acceso rápido. La galería muestra todos los sitios con sus módulos, tipo (badge Landing), acciones y URL en vivo.

![Dashboard](capturas%20de%20aplicacion%20de%20plantillas%20web/builder19.png)
![Galería de sitios](capturas%20de%20aplicacion%20de%20plantillas%20web/builder20.png)

### Recursos — Generaciones de IA
Biblioteca de imágenes y videos generados con IA, organizados y reutilizables en cualquier sitio.

![Recursos - Generaciones](capturas%20de%20aplicacion%20de%20plantillas%20web/builder21.png)

### Configuración
Panel para gestionar claves API (OpenAI, Kie.ai), Token MCP, URL base del servidor y estado del sistema en tiempo real — sin editar archivos manualmente.

![Configuración - API Keys](capturas%20de%20aplicacion%20de%20plantillas%20web/builder22.png)
![Configuración - MCP Token](capturas%20de%20aplicacion%20de%20plantillas%20web/builder23.png)
![Configuración - URL del servidor](capturas%20de%20aplicacion%20de%20plantillas%20web/builder24.png)

---

## Qué hace

1. **Análisis de Marca** — Recibe nombre del negocio, tipo, mood, tema e descripción opcional o URLs sociales. Usa GPT-4o para generar copywriting (titulares, taglines, descripciones, CTAs) en español o inglés.
2. **Scraping Social y Web** — Raspa Instagram, Facebook, LinkedIn, TikTok, Twitter y sitios web para extraer colores de marca, bio, imágenes y titulares automáticamente.
3. **Director de Layout** — Un director de layout con IA selecciona un pipeline de secciones único (hero + 8–12 secciones) basado en la personalidad del negocio, con más de 40 tipos de secciones disponibles.
4. **Módulos Cinematográficos** — Inyecta módulos de animación interactivos (scroll-driven, cursor/hover, click/tap, ambiente) seleccionados por la IA según industria y mood.
5. **Generación de Imágenes con IA** — Genera imágenes hero y de galería via **nano-banana (kie.ai / Flux)** con prompts elaborados por LLM específicos a la industria, mood y estilo visual del negocio.
6. **Generación de Video con IA** — Genera un video hero cinematográfico via **Kling 3.0 (kie.ai)** con prompts elaborados por LLM adaptados a la industria, sujeto y mood — sin plantillas genéricas.
7. **Landing Pages** — Genera sitios de conversión optimizados (landing pages) con secciones especializadas: hero con CTA doble, beneficios, prueba social, precios, FAQ, formulario de captación y footer minimalista. Seleccionable desde el builder o vía MCP.
8. **Salida del Sitio** — Produce un archivo HTML standalone servido en `/sites/:slug`, registrado en un registro de sitios en vivo.

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Runtime | Node.js + TypeScript |
| Servidor | Express.js |
| Copy con IA | OpenAI GPT-4o / GPT-4o-mini |
| Imágenes con IA | kie.ai — `google/nano-banana` (Flux) |
| Video con IA | kie.ai — `kling-3.0/video` (Kling AI) |
| Scraping | Cheerio + fetch nativo |
| Protocolo | Servidor MCP (Model Context Protocol) |
| Build | TypeScript compiler (tsc) |

---

## Estructura del Proyecto

```
src/
├── engine/
│   ├── brand-analyzer.ts       # Generación de brand card + enriquecimiento de copy con OpenAI
│   ├── layout-director.ts      # Planificador de layout con IA — selecciona pipeline de secciones
│   ├── site-builder.ts         # Ensambla el HTML final desde el plan de layout
│   ├── image-generator.ts      # Generación de imágenes con IA via nano-banana (kie.ai)
│   ├── video-generator.ts      # Generación de video con IA via Kling 3.0 (kie.ai)
│   ├── scraper.ts              # Scraping web (imágenes, colores, copy, meta)
│   ├── social-scraper.ts       # Scraping de perfiles de redes sociales
│   ├── module-picker.ts        # Selector de módulos cinematográficos
│   ├── publisher.ts            # Escritura de archivos de sitio + gestión del registro
│   └── sections/               # Más de 47 renderizadores de secciones HTML
│       ├── landing-hero.ts             # (Landing) Hero conversión con CTA doble + prueba social
│       ├── landing-benefits.ts         # (Landing) Grid de beneficios con iconos SVG
│       ├── landing-social-proof.ts     # (Landing) Logos de empresas + stats de impacto
│       ├── landing-pricing.ts          # (Landing) 3 planes de precios con plan destacado
│       ├── landing-cta-final.ts        # (Landing) Banda de cierre con CTA de conversión
│       ├── landing-lead-form.ts        # (Landing) Formulario de captación (nombre, email, mensaje)
│       ├── landing-footer.ts           # (Landing) Footer minimalista marca + copyright
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
│       ├── curtain-reveal.ts
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
│   └── routes.ts               # Endpoints de la API REST con Express
├── mcp/
│   ├── server.ts               # Entrada del servidor MCP
│   └── tools.ts                # Definiciones de herramientas MCP
├── lib/
│   └── openai.ts               # Cliente OpenAI (miniChat + creativeChat)
├── types/
│   └── index.ts                # Interfaces TypeScript
└── server.ts                   # Entrada de la aplicación Express

public/
├── app/                        # UI del frontend (builder, galería, generaciones)
└── sites/                      # Archivos HTML de sitios generados

data/
└── generations/
    ├── images/                 # Imágenes generadas por IA (nano-banana)
    └── videos/                 # Videos generados por IA (Kling)
```

---

## Endpoints de la API

### Generación de Sitios

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/api/sites` | Generar un sitio completo |
| `GET` | `/api/sites` | Listar todos los sitios generados |
| `GET` | `/api/sites/:slug` | Obtener metadata de un sitio |
| `DELETE` | `/api/sites/:slug` | Eliminar un sitio |

**Body de POST `/api/sites`:**
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
  "customSections": ["hero-fullbleed", "gallery-masonry", "contact-form"],
  "siteType": "landing",
  "landingConfig": {
    "goal": "Captar leads para consulta gratuita",
    "ctaText": "Reservar Mesa Ahora",
    "showPricing": true,
    "showFaq": true,
    "showLeadForm": true
  }
}
```

> `siteType`: `"full"` (por defecto) | `"landing"` — determina si se genera un sitio cinematográfico completo o una landing page de conversión.
>
> `landingConfig` solo aplica cuando `siteType: "landing"`. Todos sus campos son opcionales; por defecto todos los módulos están activos (`true`).

### Generación de Imágenes

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/api/generate-images` | Generar imágenes hero/galería via nano-banana |
| `GET` | `/api/generations/images` | Listar imágenes generadas guardadas |

**Body de POST `/api/generate-images`:**
```json
{
  "businessName": "Restaurante El Rincón",
  "businessType": "restaurant-food",
  "mood": "premium",
  "palette": "warm",
  "count": 4
}
```

### Generación de Video

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/api/generate-video` | Enviar tarea de imagen-a-video (Kling 3.0) |
| `GET` | `/api/video-status/:taskId` | Consultar estado de la tarea de video |

**Body de POST `/api/generate-video`:**
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

### Subida de Archivos

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/api/upload-image` | Subir imagen del usuario |
| `POST` | `/api/upload-video` | Subir video del usuario |

---

## Tipos de Negocio

`saas-tech` · `agency-studio` · `ecommerce` · `restaurant-food` · `portfolio-creative` · `luxury-jewelry` · `real-estate` · `fitness-health` · `auto-detailing` · `professional-services` · `music-events` · `education` · `beauty-salon` · `legal-finance` · `construction` · `pet-services` · `nonprofit` · `photography` · `travel-tourism` · `gaming-esports` · `other`

---

## Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
OPENAI_API_KEY=sk-...         # GPT-4o para copy y generación de prompts
KIEAI_API_KEY=...              # kie.ai para imágenes (nano-banana) y video (Kling)
BASE_URL=https://tudominio.com # URL pública del servidor (requerida para videos)
PORT=3000                      # Opcional, por defecto 3000
MCP_TOKEN=tu-token-secreto    # Opcional — protege el servidor MCP con Bearer token
```

Ambas claves de API son opcionales — el builder usa plantillas determinísticas si las APIs de IA no están disponibles.

> **Página de Configuración:** Puedes gestionar todas las variables de entorno directamente desde la interfaz web en `/settings.html` sin necesidad de editar archivos manualmente.

---

## Generación de Video en Local (ngrok)

La generación de video usa **kie.ai / Kling 3.0**, que necesita descargar la imagen fuente y entregar el video terminado a través de una **URL pública accesible desde internet**. Si corres el servidor en `localhost`, kie.ai no puede alcanzarlo.

### Solución: ngrok

```bash
# 1. Instalar ngrok
npm install -g ngrok
# o descarga el binario desde https://ngrok.com/download

# 2. En una terminal separada, expón el puerto 3000
ngrok http 3000

# Ngrok mostrará algo como:
# Forwarding  https://abc123.ngrok-free.app -> http://localhost:3000

# 3. Copia la URL HTTPS y configúrala en tu .env
BASE_URL=https://abc123.ngrok-free.app

# 4. Reinicia el servidor
npm run build && node dist/server.js
```

También puedes configurar `BASE_URL` desde la página de Configuración del dashboard sin reiniciar.

> **En VPS / producción** con dominio propio no necesitas ngrok. Configura `BASE_URL=https://tudominio.com` y listo.

---

## Instalación y Ejecución

### Desarrollo Local (Windows, Mac, Linux)

```bash
# Instalar dependencias
npm install

# Compilar TypeScript
npm run build

# Desarrollo (hot reload con cambios automáticos)
npm run dev

# Producción (compilado, sin hot reload)
npm start

# Servidor MCP (para integración con Claude)
npm run mcp
```

Accede a `http://localhost:3000` en tu navegador.

---

### Instalación VPS Linux (DigitalOcean, Linode, AWS, etc.)

**1. Conectarse al servidor via SSH**
```bash
ssh user@tu-ip-vps
```

**2. Instalar Node.js 20+ (si no está)**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt update && sudo apt install nodejs
node --version  # Verificar
```

**3. Clonar el repositorio**
```bash
cd /home/user
git clone https://github.com/juanelot/saraviamtech-builder.git
cd saraviamtech-builder
```

**4. Crear archivo `.env` con credenciales**
```bash
nano .env
```
Agregar:
```env
OPENAI_API_KEY=sk-...
KIEAI_API_KEY=...
PORT=3000
NODE_ENV=production
```
Guardar: `Ctrl+O` → Enter → `Ctrl+X`

**5. Instalar dependencias y compilar**
```bash
npm install
npm run build
```

**6. Instalar PM2 (mantiene el proceso vivo)**
```bash
sudo npm install -g pm2
pm2 start npm --name "saraviam-builder" -- start
pm2 startup
pm2 save
```

**7. (Opcional) Configurar Nginx como reverse proxy**
```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/default
```

Reemplazar el contenido con:
```nginx
server {
  listen 80;
  server_name tu-dominio.com;

  location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

Reiniciar Nginx:
```bash
sudo systemctl restart nginx
```

**8. (Opcional) SSL con Let's Encrypt (HTTPS)**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com
```

---

### Instalación con Docker

**Requisitos:** Docker y Docker Compose instalados.

**1. Clonar repo**
```bash
git clone https://github.com/juanelot/saraviamtech-builder.git
cd saraviamtech-builder
```

**2. Crear archivo `.env`**
```bash
nano .env
```
```env
OPENAI_API_KEY=sk-...
KIEAI_API_KEY=...
PORT=3000
NODE_ENV=production
```

**3. Ejecutar con Docker Compose**
```bash
docker-compose up -d
```

El contenedor correrá en `http://localhost:3000`

**Ver logs:**
```bash
docker-compose logs -f
```

**Detener:**
```bash
docker-compose down
```

**Archivo `Dockerfile` incluido** — se usa automáticamente con `docker-compose`.

---

### Despliegue con Portainer

**1. En Portainer, ir a `Stacks` → `Add Stack`**

**2. Seleccionar `Repository`**

**3. Llenar:**
- **Repository URL:** `https://github.com/juanelot/saraviamtech-builder.git`
- **Repository reference:** `main`
- **Compose file path:** `docker-compose.yml`

**4. En `Environment variables`, agregar:**
```
OPENAI_API_KEY=sk-...
KIEAI_API_KEY=...
PORT=3000
NODE_ENV=production
```

**5. Deploy**

Portainer detectará y desplegará automáticamente desde Docker Compose.

---

### Despliegue con Dockploy

**1. Crear proyecto en Dockploy**

**2. Conectar repositorio GitHub:** `https://github.com/juanelot/saraviamtech-builder`

**3. Seleccionar rama:** `main`

**4. Agregar variables de entorno:**
```
OPENAI_API_KEY=sk-...
KIEAI_API_KEY=...
PORT=3000
NODE_ENV=production
```

**5. Deploy** — Dockploy usará automáticamente `docker-compose.yml`

---

### Resumen de Métodos

| Método | Caso de uso | Facilidad |
|---|---|---|
| **npm local** | Desarrollo, máquina personal | ⭐⭐⭐ |
| **VPS manual** | Producción en servidor propio | ⭐⭐ |
| **Docker** | Producción consistente, portátil | ⭐⭐⭐ |
| **Portainer** | UI visual, múltiples contenedores | ⭐⭐⭐⭐ |
| **Dockploy** | Despliegue automático desde GitHub | ⭐⭐⭐⭐⭐ |

---

## Landing Pages

El builder soporta dos modos de generación de sitios, seleccionable desde la UI o vía API/MCP:

| Modo | `siteType` | Descripción |
|---|---|---|
| **Sitio Completo** | `"full"` | Sitio cinematográfico con 8–12 secciones seleccionadas por IA, animaciones avanzadas, video hero |
| **Landing Page** | `"landing"` | Página de conversión enfocada en captación de leads, con estructura fija optimizada para CTA |

### Estructura de una Landing Page

```
landing-hero          → Hero con headline, subtítulo, CTA doble (primario → #lead-form, ghost → #benefits)
                         + prueba social de avatares (pill animado)
landing-benefits      → Grid 4 columnas con iconos SVG inline + hover lift
landing-social-proof  → Logos de empresas (8 tiles) + stats de impacto (500+, 98%, 4.9★)
carousel              → (solo si hay imágenes disponibles)
flip-cards / services-grid → Servicios del negocio
testimonials          → Reseñas de clientes
landing-pricing       → 3 planes con card central destacada (opcional, activado por defecto)
faq-accordion         → Preguntas frecuentes (opcional, activado por defecto)
landing-cta-final     → Banda completa con CTA de cierre + nota de privacidad
landing-lead-form     → Formulario 3 campos (nombre, email, mensaje) con action mailto
landing-footer        → Footer minimalista: marca + tagline + copyright
```

### Nav de Landing

Las landing pages usan `renderLandingNav()` — una barra de navegación minimalista con:
- Logo del negocio (texto)
- Links: Beneficios → `#benefits` | Precios → `#pricing`
- Un único botón CTA anclado a `#lead-form`
- Hamburger para móvil

### Configuración desde el Builder

En la UI del builder (`/app/builder.html`), el selector de tipo de sitio está disponible como toggle de pills:

- **Sitio Completo** — activa el pipeline IA completo
- **Landing Page** — muestra opciones adicionales: ✅ Precios, ✅ FAQ, ✅ Formulario corto

### Badge en la Galería

Los sitios generados como landing page muestran el badge `🎯 Landing` en las tarjetas de la galería (`/app/gallery.html`) y en el listado de sitios (`/app/index.html`).

---

## Decisiones Técnicas Clave

### Generación de Prompts con IA para Imágenes y Videos

En lugar de plantillas fijas, cuando OpenAI está disponible el sistema llama a `miniChat` (GPT-4o-mini) para generar prompts ricos y contextuales específicos al nombre del negocio, industria, mood y paleta de colores antes de enviar a kie.ai. Si OpenAI no está disponible, se usa una librería curada de prompts seed por industria con selección aleatoria para garantizar variedad.

### Forzado de Hero Compatible con Video

Cuando el usuario proporciona un video hero, el director de layout es sobreescrito post-selección para garantizar que el tipo de sección hero siempre sea uno que soporte renderizado de video (`hero-fullbleed`, `hero-split`, `mesh-hero`, `typewriter-hero`). Esto previene que el video sea ignorado silenciosamente por otros tipos de hero que no lo soportan.

### Renderizado de Imágenes con Proporciones Naturales

Las secciones de galería, masonry y carrusel renderizan imágenes en sus proporciones naturales usando `height:auto` y layout CSS `columns` para masonry real, en lugar de `grid-auto-rows` fijo con proporciones forzadas. Esto previene la distorsión de imágenes verticales, cuadradas y altas. `object-position:center top` asegura que los sujetos (rostros, comida, productos) se mantengan visibles en el encuadre.

### Scraping Social

El scraper extrae nombre de perfil, bio, cantidad de seguidores, imágenes, colores, titulares, enlaces e información de contacto de Instagram, Facebook, LinkedIn, TikTok, Twitter y sitios web arbitrarios. Los colores de marca scrapeados se usan para sobreescribir el color de acento en la paleta generada.

### Landing Pages — Reutilización del Sistema de Tokens

En lugar de construir un sistema visual separado para landing pages, `buildLandingPlan()` llama internamente a `buildFallbackPlan()` para extraer los tokens visuales del negocio (paleta, tipografía, personalidad) y luego los aplica sobre una secuencia de secciones fija optimizada para conversión. Esto garantiza que la landing page tenga la misma identidad visual que tendría el sitio completo del mismo negocio, sin duplicar lógica de derivación de tokens.

### Integración MCP

El builder expone un servidor completo de Model Context Protocol (MCP), permitiendo que Claude y otros asistentes de IA generen sitios, imágenes y videos como herramientas dentro de flujos de trabajo agénticos.

---

## Integración MCP

El servidor MCP permite que Claude u otros LLMs consuman el builder como herramientas nativas dentro de sus flujos agénticos.

### Herramientas disponibles

| Herramienta | Descripción |
|---|---|
| `list_modules` | Lista todos los módulos de animación disponibles |
| `analyze_brand` | Analiza un negocio y genera brand card completa |
| `recommend_modules` | Sugiere módulos cinematográficos por industria |
| `create_site` | Genera un sitio HTML completo en un solo paso |
| `list_sites` | Lista todos los sitios generados |
| `get_site` | Obtiene detalles y HTML de un sitio por slug |
| `delete_site` | Elimina un sitio generado |
| `generate_images` | Genera imágenes hero/galería via nano-banana (Flux) |
| `generate_video` | Envía tarea de imagen-a-video via Kling 3.0 |
| `check_video_status` | Consulta el estado de una tarea de video por taskId |
| `scrape_brand` | Raspa datos de marca desde una URL o red social |
| `list_generations` | Lista imágenes y videos generados almacenados |
| `generate_site_auto` | **Pipeline completo automático**: scrape → brand → imágenes → video → sitio publicado |

### Parámetros principales por herramienta

#### `analyze_brand`
```json
{
  "businessName": "Mi Restaurante",
  "businessType": "restaurant-food",
  "mood": "warm",
  "theme": "dark",
  "language": "es",
  "description": "Descripción opcional del negocio",
  "sourceUrl": "https://mirestaurante.com",
  "socialUrls": ["https://instagram.com/mirestaurante"]
}
```
> **businessType**: `saas-tech` | `agency-studio` | `ecommerce` | `restaurant-food` | `portfolio-creative` | `luxury-jewelry` | `real-estate` | `fitness-health` | `auto-detailing` | `professional-services` | `music-events` | `education` | `beauty-salon` | `legal-finance` | `construction` | `pet-services` | `nonprofit` | `photography` | `travel-tourism` | `gaming-esports` | `other`
>
> **mood**: `premium` | `playful` | `technical` | `warm` | `minimal` | `bold`

#### `generate_images`
```json
{
  "businessName": "Mi Restaurante",
  "businessType": "restaurant-food",
  "mood": "warm",
  "palette": "warm amber",
  "count": 2
}
```
> Requiere `KIEAI_API_KEY`. Devuelve URLs públicas usables en `create_site`.

#### `generate_video`
```json
{
  "imageUrl": "https://tudominio.com/generations/images/abc.jpg",
  "businessName": "Mi Restaurante",
  "businessType": "restaurant-food",
  "subject": "plato gourmet con vapor",
  "action": "vapor rising slowly",
  "mood": "warm cinematic"
}
```
> Requiere `KIEAI_API_KEY` y que `imageUrl` sea accesible desde internet (ngrok o VPS).
> Devuelve un `taskId`. Usa `check_video_status` para esperar el resultado.

#### `check_video_status`
```json
{
  "taskId": "abc123"
}
```
> Devuelve `status`: `pending` | `processing` | `completed` | `failed`.
> Cuando `completed`, incluye `publicUrl` para usar en `create_site`.

#### `create_site`
```json
{
  "businessName": "Mi Restaurante",
  "businessType": "restaurant-food",
  "mood": "warm",
  "theme": "dark",
  "language": "es",
  "sourceUrl": "https://mirestaurante.com",
  "heroImageUrl": "/generations/images/abc.jpg",
  "heroVideoUrl": "/generations/videos/xyz.mp4",
  "galleryImageUrls": ["/generations/images/def.jpg"],
  "preferredModules": [],
  "siteType": "landing",
  "landingConfig": {
    "goal": "Captar reservas online",
    "ctaText": "Reservar Ahora",
    "showPricing": true,
    "showFaq": false,
    "showLeadForm": true
  }
}
```

> Cuando `siteType: "landing"` se bypasea el director de layout IA y se usa `buildLandingPlan()` — una secuencia fija optimizada para conversión que reutiliza el sistema de tokens visuales del negocio (paleta, tipografía, personalidad).

#### `generate_site_auto` ⚡ Pipeline completo
```json
{
  "businessName": "Mi Restaurante",
  "businessType": "restaurant-food",
  "mood": "warm",
  "theme": "dark",
  "language": "es",
  "sourceUrl": "https://mirestaurante.com",
  "socialUrls": ["https://instagram.com/mirestaurante"],
  "generateImages": true,
  "generateVideo": true,
  "imageCount": 2
}
```
> Ejecuta todo el pipeline automáticamente en una sola llamada.
> Si `KIEAI_API_KEY` no está configurado, genera el sitio sin imágenes/video de IA.
> Puedes deshabilitar pasos: `"generateImages": false` o `"generateVideo": false`.

### Autenticación

El servidor MCP soporta autenticación opcional por token Bearer. Agrega `MCP_TOKEN` a tu `.env`:

```env
MCP_TOKEN=tu-token-secreto-aqui
```

- Si `MCP_TOKEN` **está configurado**: todos los clientes deben enviar `Authorization: Bearer tu-token-secreto-aqui`
- Si `MCP_TOKEN` **no está configurado**: el servidor corre sin autenticación (recomendado solo en entornos locales o de confianza)

### Iniciar el servidor MCP

```bash
# Desarrollo
npm run mcp

# Producción (compilado)
node dist/mcp/server.js
```

### Configurar en Claude Desktop

Edita el archivo de configuración de Claude Desktop:

**Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

#### 1. Desarrollo Local (con ngrok)

```json
{
  "mcpServers": {
    "saraviamtech-builder": {
      "command": "node",
      "args": ["/ruta/al/proyecto/dist/mcp/server.js"],
      "env": {
        "OPENAI_API_KEY": "sk-...",
        "KIEAI_API_KEY": "...",
        "BASE_URL": "https://abc123.ngrok-free.app",
        "MCP_TOKEN": "tu-token-secreto-aqui"
      }
    }
  }
}
```

**Pasos:**
1. Instala ngrok: `npm install -g ngrok`
2. En una terminal: `ngrok http 3000` (copia la URL HTTPS)
3. Reemplaza `abc123.ngrok-free.app` con tu URL de ngrok
4. Compila: `npm run build`
5. Reinicia Claude Desktop

#### 2. VPS / Producción

```json
{
  "mcpServers": {
    "saraviamtech-builder": {
      "command": "node",
      "args": ["/home/usuario/saraviamtech-builder/dist/mcp/server.js"],
      "cwd": "/home/usuario/saraviamtech-builder",
      "env": {
        "OPENAI_API_KEY": "sk-...",
        "KIEAI_API_KEY": "...",
        "BASE_URL": "https://tudominio.com",
        "MCP_TOKEN": "tu-token-secreto-fuerte"
      }
    }
  }
}
```

**Pasos:**
1. En el VPS, clona el proyecto: `git clone https://github.com/tuuser/saraviamtech-builder.git`
2. Instala dependencias: `cd saraviamtech-builder && npm install`
3. Compila: `npm run build`
4. Inicia con PM2:
   ```bash
   pm2 start dist/mcp/server.js --name saraviamtech-mcp \
     --env "OPENAI_API_KEY=sk-..." \
     --env "KIEAI_API_KEY=..." \
     --env "BASE_URL=https://tudominio.com" \
     --env "MCP_TOKEN=tu-token-secreto-fuerte"
   pm2 save
   ```
5. Reemplaza `/home/usuario` y `tudominio.com` con tus valores reales
6. Reinicia Claude Desktop

#### 3. Desarrollo Local (sin compilar con tsx)

```json
{
  "mcpServers": {
    "saraviamtech-builder": {
      "command": "npx",
      "args": ["tsx", "/ruta/al/proyecto/src/mcp/server.ts"],
      "env": {
        "OPENAI_API_KEY": "sk-...",
        "KIEAI_API_KEY": "...",
        "BASE_URL": "https://abc123.ngrok-free.app",
        "MCP_TOKEN": "tu-token-secreto-aqui"
      }
    }
  }
}
```

### Configurar en Claude Code (CLI)

**Local con ngrok:**
```bash
claude mcp add saraviamtech-builder \
  --command "node /ruta/al/proyecto/dist/mcp/server.js" \
  --env OPENAI_API_KEY=sk-... \
  --env KIEAI_API_KEY=... \
  --env BASE_URL=https://abc123.ngrok-free.app \
  --env MCP_TOKEN=tu-token-secreto-aqui
```

**VPS / Producción:**
```bash
claude mcp add saraviamtech-builder \
  --command "node /home/usuario/saraviamtech-builder/dist/mcp/server.js" \
  --env OPENAI_API_KEY=sk-... \
  --env KIEAI_API_KEY=... \
  --env BASE_URL=https://tudominio.com \
  --env MCP_TOKEN=tu-token-secreto-fuerte
```

### Flujo de trabajo con Claude

#### Modo automático (una sola llamada) ⚡

```
generate_site_auto(businessName, businessType, mood, theme, sourceUrl, socialUrls)
  → scrape + brand + imágenes + video + sitio publicado
  → retorna: { url, slug, assets: { heroImage, heroVideo, galleryImages } }
```

#### Modo paso a paso (control total) 🎛️

```
1. scrape_brand(url)            → extrae colores, bio, imágenes del sitio real
2. analyze_brand(...)           → genera brand card con paleta, tipografía y copy
3. recommend_modules(...)       → sugiere módulos de animación para la industria
4. generate_images(...)         → genera imágenes hero via IA (retorna publicUrls)
5. generate_video(imageUrl)     → inicia generación de video (retorna taskId)
6. check_video_status(taskId)   → espera hasta status "completed"
7. create_site(... heroImageUrl, heroVideoUrl) → construye y publica el sitio
8. get_site(slug)               → devuelve URL pública + HTML completo
```

> Ambos modos están disponibles. El modo paso a paso permite validar cada etapa,
> reusar assets generados o saltear pasos (ej. el cliente ya tiene sus propias imágenes).

---

## Licencia

Privado — SaraviamTech © 2025
