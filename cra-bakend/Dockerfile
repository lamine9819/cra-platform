# ============================================
# Stage 1: Builder - Compilation TypeScript
# ============================================
FROM node:20-alpine AS builder

# Installer les dépendances système pour Prisma, Sharp et Puppeteer
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Variables d'environnement pour Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY prisma ./prisma/

# Installer les dépendances (y compris dev pour la compilation)
RUN npm ci --legacy-peer-deps

# Copier le code source
COPY . .

# Générer le client Prisma
RUN npx prisma generate

# Compiler TypeScript
RUN npm run build

# ============================================
# Stage 2: Runtime - Image de production
# ============================================
FROM node:20-alpine AS runtime

# Installer uniquement les dépendances runtime nécessaires
RUN apk add --no-cache \
    dumb-init \
    curl \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Variables d'environnement pour Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copier les fichiers nécessaires depuis le builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Créer les dossiers pour les uploads et logs
RUN mkdir -p uploads public logs && \
    chown -R nodejs:nodejs uploads public logs

# Passer à l'utilisateur non-root
USER nodejs

# Exposer le port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Utiliser dumb-init pour gérer les signaux correctement
ENTRYPOINT ["dumb-init", "--"]

# Commande de démarrage
CMD ["node", "dist/server.js"]
