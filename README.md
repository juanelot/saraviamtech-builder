# SaraviamTech Builder

Generador de sitios web cinematográficos impulsado por IA. Analiza un negocio, extrae datos de marca, y produce un sitio HTML único y listo para producción con layouts dinámicos, animaciones, imágenes y videos generados por IA — todo en una sola solicitud.

---

## Qué hace

1. **Análisis de Marca** — Recibe nombre del negocio, tipo, mood, tema e descripción opcional o URLs sociales. Usa GPT-4o para generar copywriting (titulares, taglines, descripciones, CTAs) en español o inglés.
2. **Scraping Social y Web** — Raspa Instagram, Facebook, LinkedIn, TikTok, Twitter y sitios web para extraer colores de marca, bio, imágenes y titulares automáticamente.
3. **Director de Layout** — Un director de layout con IA selecciona un pipeline de secciones único (hero + 8–12 secciones) basado en la personalidad del negocio, con más de 40 tipos de secciones disponibles.
4. **Módulos Cinematográficos** — Inyecta módulos de animación interactivos (scroll-driven, cursor/hover, click/tap, ambiente) seleccionados por la IA según industria y mood.
5. **Generación de Imágenes con IA** — Genera imágenes hero y de galería via **nano-banana (kie.ai / Flux)** con prompts elaborados por LLM específicos a la industria, mood y estilo visual del negocio.
6. **Generación de Video con IA** — Genera un video hero cinematográfico via **Kling 3.0 (kie.ai)** con prompts elaborados por LLM adaptados a la industria, sujeto y mood — sin plantillas genéricas.
7. **Salida del Sitio** — Produce un archivo HTML standalone servido en `/sites/:slug`, registrado en un registro de sitios en vivo.

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
│   └── sections/               # Más de 40 renderizadores de secciones HTML
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
  "customSections": ["hero-fullbleed", "gallery-masonry", "contact-form"]
}
```

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
PORT=3000                      # Opcional, por defecto 3000
```

Ambas claves son opcionales — el builder usa plantillas determinísticas si las APIs de IA no están disponibles.

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

## Decisiones Técnicas Clave

### Generación de Prompts con IA para Imágenes y Videos

En lugar de plantillas fijas, cuando OpenAI está disponible el sistema llama a `miniChat` (GPT-4o-mini) para generar prompts ricos y contextuales específicos al nombre del negocio, industria, mood y paleta de colores antes de enviar a kie.ai. Si OpenAI no está disponible, se usa una librería curada de prompts seed por industria con selección aleatoria para garantizar variedad.

### Forzado de Hero Compatible con Video

Cuando el usuario proporciona un video hero, el director de layout es sobreescrito post-selección para garantizar que el tipo de sección hero siempre sea uno que soporte renderizado de video (`hero-fullbleed`, `hero-split`, `mesh-hero`, `typewriter-hero`). Esto previene que el video sea ignorado silenciosamente por otros tipos de hero que no lo soportan.

### Renderizado de Imágenes con Proporciones Naturales

Las secciones de galería, masonry y carrusel renderizan imágenes en sus proporciones naturales usando `height:auto` y layout CSS `columns` para masonry real, en lugar de `grid-auto-rows` fijo con proporciones forzadas. Esto previene la distorsión de imágenes verticales, cuadradas y altas. `object-position:center top` asegura que los sujetos (rostros, comida, productos) se mantengan visibles en el encuadre.

### Scraping Social

El scraper extrae nombre de perfil, bio, cantidad de seguidores, imágenes, colores, titulares, enlaces e información de contacto de Instagram, Facebook, LinkedIn, TikTok, Twitter y sitios web arbitrarios. Los colores de marca scrapeados se usan para sobreescribir el color de acento en la paleta generada.

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

```json
{
  "mcpServers": {
    "saraviamtech-builder": {
      "command": "node",
      "args": ["/ruta/al/proyecto/dist/mcp/server.js"],
      "env": {
        "OPENAI_API_KEY": "sk-...",
        "KIEAI_API_KEY": "...",
        "BASE_URL": "http://localhost:3000",
        "MCP_TOKEN": "tu-token-secreto-aqui"
      }
    }
  }
}
```

O usando `tsx` en desarrollo (sin compilar):

```json
{
  "mcpServers": {
    "saraviamtech-builder": {
      "command": "npx",
      "args": ["tsx", "/ruta/al/proyecto/src/mcp/server.ts"],
      "env": {
        "OPENAI_API_KEY": "sk-...",
        "KIEAI_API_KEY": "...",
        "BASE_URL": "http://localhost:3000",
        "MCP_TOKEN": "tu-token-secreto-aqui"
      }
    }
  }
}
```

### Configurar en Claude Code (CLI)

```bash
claude mcp add saraviamtech-builder \
  --command "node /ruta/al/proyecto/dist/mcp/server.js" \
  --env OPENAI_API_KEY=sk-... \
  --env KIEAI_API_KEY=... \
  --env BASE_URL=http://localhost:3000 \
  --env MCP_TOKEN=tu-token-secreto-aqui
```

### Flujo de trabajo típico con Claude

Una vez integrado, Claude puede ejecutar un flujo completo:

```
1. scrape_brand(url) → extrae colores, bio, imágenes
2. generate_images(businessName, businessType, mood) → genera imágenes hero
3. generate_video(imageUrl, businessName, ...) → inicia video (retorna taskId)
4. check_video_status(taskId) → espera hasta "completed"
5. create_site(... heroImageUrl, heroVideoUrl) → genera el sitio final
6. get_site(slug) → devuelve la URL pública del sitio
```

---

## Licencia

Privado — SaraviamTech © 2025
