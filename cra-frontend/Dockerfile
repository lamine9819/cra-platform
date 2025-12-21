# ============================================
# Stage 1: Builder - Build de l'application
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --legacy-peer-deps

# Copier le code source
COPY . .

# Build arguments pour les variables d'environnement
ARG VITE_API_URL
ARG VITE_API_BASE_URL

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build de l'application
RUN npm run build

# ============================================
# Stage 2: Runtime - Nginx pour servir le build
# ============================================
FROM nginx:alpine AS runtime

# Copier la configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers buildés
COPY --from=builder /app/dist /usr/share/nginx/html

# --- LES CHANGEMENTS SONT ICI ---

# 1. On expose le port 80 au lieu de 8080
EXPOSE 80

# 2. Health check mis à jour pour le port 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/health || exit 1

# 3. On ne met PAS de "USER nginx", on laisse Nginx tourner normalement
CMD ["nginx", "-g", "daemon off;"]