# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar source
COPY src ./src
COPY tsconfig.json ./

# Compilar TypeScript
RUN npm run build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production

# Copiar compilado desde builder
COPY --from=builder /app/dist ./dist

# Copiar archivos estáticos
COPY public ./public

# Crear directorios de datos
RUN mkdir -p data/generations/images data/generations/videos data/uploads public/sites

# Exponer puerto
EXPOSE 3000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Iniciar aplicación
CMD ["node", "dist/server.js"]
