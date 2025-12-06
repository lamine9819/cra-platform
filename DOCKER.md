# 🐳 Guide Docker CI/CD - Plateforme CRA

Ce guide complet vous explique comment déployer la plateforme CRA en utilisant Docker et le pipeline CI/CD.

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Architecture](#architecture)
3. [Développement Local](#développement-local)
4. [Production](#production)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Scripts Utilitaires](#scripts-utilitaires)
7. [Monitoring](#monitoring)
8. [Dépannage](#dépannage)

---

## 🔧 Prérequis

### Installation locale

- **Docker Desktop** 20.10+
- **Docker Compose** 2.0+
- **Git**
- **Node.js** 20+ (pour développement local sans Docker)

### Serveur de production

- **Ubuntu 22.04 LTS** (recommandé)
- **Docker Engine** 20.10+
- **Docker Compose** 2.0+
- **2 CPU** minimum
- **4 GB RAM** minimum
- **20 GB** d'espace disque

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│          Internet / Users               │
└────────────────┬────────────────────────┘
                 │
                 ▼
        ┌────────────────┐
        │  Nginx Proxy   │
        │  (Port 80/443) │
        └───────┬────────┘
                │
        ┌───────┴────────┐
        │                │
        ▼                ▼
   ┌─────────┐     ┌──────────┐
   │Frontend │     │ Backend  │
   │ (Nginx) │     │(Express) │
   └─────────┘     └────┬─────┘
                        │
                ┌───────┼───────┐
                ▼       ▼       ▼
           ┌────────┐ ┌─────┐ ┌──────┐
           │Postgres│ │Redis│ │Volumes│
           └────────┘ └─────┘ └──────┘
```

### Composants

- **Nginx Reverse Proxy**: Point d'entrée, gestion SSL, rate limiting
- **Frontend**: Application React servie par Nginx
- **Backend**: API Express.js avec WebSocket
- **PostgreSQL**: Base de données principale
- **Redis**: Cache et sessions (optionnel)

---

## 💻 Développement Local

### 1. Cloner le projet

```bash
git clone <votre-repo>
cd cra-platform
```

### 2. Configuration

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer .env avec vos valeurs de développement
nano .env
```

Exemple de configuration dev dans `.env`:

```bash
DB_PASSWORD=Bathily
JWT_SECRET=dev-secret-key-change-in-production
REDIS_PASSWORD=dev-redis-password
FRONTEND_URL=http://localhost:5173
```

### 3. Démarrer l'environnement de développement

```bash
# Construire et démarrer tous les services
docker compose -f docker-compose.dev.yml up -d

# Voir les logs
docker compose -f docker-compose.dev.yml logs -f

# Logs d'un service spécifique
docker compose -f docker-compose.dev.yml logs -f backend
```

### 4. Accéder à l'application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### 5. Commandes utiles en développement

```bash
# Arrêter les services
docker compose -f docker-compose.dev.yml down

# Reconstruire les images
docker compose -f docker-compose.dev.yml build

# Reconstruire et redémarrer
docker compose -f docker-compose.dev.yml up -d --build

# Exécuter les migrations Prisma
docker compose -f docker-compose.dev.yml exec backend npx prisma migrate dev

# Ouvrir Prisma Studio
docker compose -f docker-compose.dev.yml exec backend npx prisma studio

# Accéder au shell du backend
docker compose -f docker-compose.dev.yml exec backend sh

# Voir les conteneurs en cours
docker compose -f docker-compose.dev.yml ps

# Nettoyer tout
docker compose -f docker-compose.dev.yml down -v
docker system prune -af
```

---

## 🚀 Production

### Préparation du serveur

#### 1. Initialiser le serveur

```bash
# Se connecter au serveur
ssh user@your-server

# Exécuter le script d'initialisation
wget https://raw.githubusercontent.com/<votre-repo>/master/scripts/init-server.sh
chmod +x init-server.sh
./init-server.sh
```

#### 2. Cloner le projet

```bash
cd /opt/cra-platform
git clone <votre-repo> .
```

#### 3. Configuration de production

```bash
# Copier et éditer le fichier .env
cp .env.example .env
nano .env
```

**IMPORTANT**: Utilisez des mots de passe forts en production!

```bash
DB_PASSWORD=<générer-mot-de-passe-fort>
JWT_SECRET=<générer-clé-secrète-64-caractères>
REDIS_PASSWORD=<générer-mot-de-passe-fort>
FRONTEND_URL=https://votre-domaine.com
VITE_API_URL=https://votre-domaine.com
VITE_API_BASE_URL=https://votre-domaine.com/api
```

Pour générer des mots de passe forts:
```bash
openssl rand -base64 32
```

#### 4. Configurer SSL avec Certbot

```bash
# Obtenir un certificat SSL
sudo certbot certonly --standalone -d votre-domaine.com

# Les certificats seront dans /etc/letsencrypt/live/votre-domaine.com/
# Créer un lien symbolique
mkdir -p nginx/ssl
ln -s /etc/letsencrypt/live/votre-domaine.com/fullchain.pem nginx/ssl/
ln -s /etc/letsencrypt/live/votre-domaine.com/privkey.pem nginx/ssl/
```

#### 5. Déployer l'application

```bash
# Donner les permissions d'exécution
chmod +x scripts/deploy.sh

# Déployer
./scripts/deploy.sh
```

### Déploiement manuel

```bash
# Pull des images (si vous utilisez un registry)
docker compose -f docker-compose.prod.yml pull

# Démarrer tous les services
docker compose -f docker-compose.prod.yml up -d

# Vérifier les logs
docker compose -f docker-compose.prod.yml logs -f

# Exécuter les migrations
docker compose -f docker-compose.prod.yml exec -T backend npx prisma migrate deploy

# Vérifier la santé des services
docker compose -f docker-compose.prod.yml ps
```

### Mise à jour de l'application

```bash
# 1. Pull des derniers changements
cd /opt/cra-platform
git pull origin master

# 2. Déployer
./scripts/deploy.sh
```

---

## 🔄 CI/CD Pipeline

### Configuration GitHub Actions

Le pipeline CI/CD est défini dans `.github/workflows/ci-cd.yml` et s'exécute automatiquement sur:

- **Push** sur les branches `master`, `develop`, `staging`
- **Pull Request** vers `master` ou `develop`

### Étapes du pipeline

1. **Tests Backend**
   - Linting (ESLint)
   - Tests unitaires (Jest)
   - Compilation TypeScript
   - Migrations Prisma

2. **Tests Frontend**
   - Linting (ESLint)
   - Build de production (Vite)

3. **Scan de sécurité**
   - Scan des vulnérabilités avec Trivy
   - Upload des résultats vers GitHub Security

4. **Build des images Docker**
   - Construction multi-stage
   - Push vers GitHub Container Registry
   - Tagging automatique

5. **Déploiement automatique**
   - `develop` → Staging
   - `master` → Production

### Configuration des secrets GitHub

Aller dans **Settings** → **Secrets and variables** → **Actions** et ajouter:

```
# Production
PROD_HOST=<ip-ou-domaine-serveur-prod>
PROD_USER=<utilisateur-ssh>
PROD_SSH_KEY=<clé-privée-ssh>
PROD_URL=https://votre-domaine.com

# Staging (optionnel)
STAGING_HOST=<ip-serveur-staging>
STAGING_USER=<utilisateur-ssh>
STAGING_SSH_KEY=<clé-privée-ssh>

# Variables d'environnement
DB_PASSWORD=<mot-de-passe-db>
JWT_SECRET=<clé-secrète-jwt>
REDIS_PASSWORD=<mot-de-passe-redis>

# Frontend
VITE_API_URL=https://votre-domaine.com
VITE_API_BASE_URL=https://votre-domaine.com/api

# Notifications (optionnel)
SLACK_WEBHOOK=<webhook-slack>
```

### Génération de la clé SSH

```bash
# Sur votre machine locale
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions

# Copier la clé publique sur le serveur
ssh-copy-id -i ~/.ssh/github_actions.pub user@serveur

# Afficher la clé privée pour la copier dans GitHub Secrets
cat ~/.ssh/github_actions
```

---

## 🛠️ Scripts Utilitaires

### deploy.sh - Déploiement

```bash
# Déployer en production
./scripts/deploy.sh production

# Le script effectue:
# - Pull des images
# - Arrêt des anciens conteneurs
# - Démarrage des nouveaux
# - Migrations de la base de données
# - Nettoyage
```

### backup.sh - Backup de la base de données

```bash
# Créer un backup manuel
docker compose -f docker-compose.prod.yml exec postgres /bin/sh -c "
  pg_dump -U postgres -Fc cra-db > /backups/manual-backup-$(date +%Y%m%d-%H%M%S).dump
"

# Les backups automatiques sont créés quotidiennement par le service 'backup'
# et conservés pendant 7 jours
```

### restore.sh - Restauration

```bash
# Lister les backups disponibles
docker compose -f docker-compose.prod.yml exec postgres ls -lah /backups

# Restaurer un backup
docker compose -f docker-compose.prod.yml exec postgres /bin/sh -c "
  pg_restore -U postgres -d cra-db -c /backups/backup-20250101-120000.dump
"
```

---

## 📊 Monitoring

### Health Checks

Tous les services ont des health checks configurés:

```bash
# Vérifier la santé de tous les services
docker compose -f docker-compose.prod.yml ps

# Tester les endpoints de santé
curl http://localhost/health          # Nginx
curl http://localhost/api/health      # Backend
```

### Logs

```bash
# Tous les logs
docker compose -f docker-compose.prod.yml logs -f

# Logs d'un service spécifique
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs -f nginx

# Logs avec timestamp
docker compose -f docker-compose.prod.yml logs -f --timestamps

# 100 dernières lignes
docker compose -f docker-compose.prod.yml logs --tail=100 backend
```

### Métriques

```bash
# Statistiques en temps réel
docker stats

# Utilisation des ressources
docker compose -f docker-compose.prod.yml top
```

### Monitoring avec Prometheus et Grafana (optionnel)

Décommenter les services `prometheus` et `grafana` dans `docker-compose.prod.yml`:

```bash
# Démarrer avec monitoring
docker compose -f docker-compose.prod.yml up -d

# Accéder à Grafana
http://votre-serveur:3000
# Login: admin / <GRAFANA_PASSWORD depuis .env>
```

---

## 🔍 Dépannage

### Les conteneurs ne démarrent pas

```bash
# Vérifier les logs
docker compose -f docker-compose.prod.yml logs

# Vérifier l'état des services
docker compose -f docker-compose.prod.yml ps -a

# Vérifier les ressources
docker system df
free -h
df -h
```

### Problèmes de connexion à la base de données

```bash
# Vérifier que PostgreSQL est prêt
docker compose -f docker-compose.prod.yml exec postgres pg_isready

# Tester la connexion
docker compose -f docker-compose.prod.yml exec backend npx prisma db push --skip-generate
```

### Erreurs de permissions

```bash
# Vérifier les permissions des volumes
docker compose -f docker-compose.prod.yml exec backend ls -la /app/uploads

# Réparer les permissions
docker compose -f docker-compose.prod.yml exec backend chown -R nodejs:nodejs /app/uploads
```

### Le frontend affiche une page blanche

```bash
# Vérifier les variables d'environnement
docker compose -f docker-compose.prod.yml exec frontend env | grep VITE

# Reconstruire avec les bonnes variables
docker compose -f docker-compose.prod.yml build --no-cache frontend
docker compose -f docker-compose.prod.yml up -d frontend
```

### Problèmes de WebSocket

```bash
# Vérifier la configuration Nginx
docker compose -f docker-compose.prod.yml exec nginx cat /etc/nginx/conf.d/default.conf

# Tester le WebSocket
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
  http://localhost/socket.io/
```

### Nettoyer complètement Docker

```bash
# ATTENTION: Supprime TOUS les conteneurs, images, et volumes
docker compose -f docker-compose.prod.yml down -v
docker system prune -af --volumes

# Redémarrer proprement
docker compose -f docker-compose.prod.yml up -d
```

### Espace disque plein

```bash
# Nettoyer les images inutilisées
docker image prune -af

# Nettoyer les volumes inutilisés
docker volume prune -f

# Nettoyer tout (sauf les volumes nommés)
docker system prune -af

# Vérifier l'espace utilisé
docker system df
```

---

## 📚 Commandes de référence rapide

### Développement

```bash
# Démarrer
docker compose -f docker-compose.dev.yml up -d

# Arrêter
docker compose -f docker-compose.dev.yml down

# Logs
docker compose -f docker-compose.dev.yml logs -f

# Rebuild
docker compose -f docker-compose.dev.yml up -d --build

# Shell backend
docker compose -f docker-compose.dev.yml exec backend sh
```

### Production

```bash
# Démarrer
docker compose -f docker-compose.prod.yml up -d

# Arrêter
docker compose -f docker-compose.prod.yml down

# Logs
docker compose -f docker-compose.prod.yml logs -f

# Mise à jour
git pull && ./scripts/deploy.sh

# Migrations
docker compose -f docker-compose.prod.yml exec -T backend npx prisma migrate deploy

# Backup
docker compose -f docker-compose.prod.yml exec postgres pg_dump...

# Status
docker compose -f docker-compose.prod.yml ps
```

### Docker général

```bash
# Voir tous les conteneurs
docker ps -a

# Voir toutes les images
docker images

# Voir tous les volumes
docker volume ls

# Nettoyer
docker system prune -af

# Stats en temps réel
docker stats
```

---

## 🔒 Sécurité

### Checklist de sécurité en production

- [ ] Utiliser des mots de passe forts et uniques
- [ ] Activer SSL/TLS (HTTPS)
- [ ] Configurer le firewall (UFW)
- [ ] Limiter l'accès SSH (clés uniquement, pas de root)
- [ ] Mettre à jour régulièrement les images Docker
- [ ] Sauvegarder la base de données quotidiennement
- [ ] Activer les health checks
- [ ] Configurer le rate limiting dans Nginx
- [ ] Surveiller les logs pour détecter les intrusions
- [ ] Désactiver le mode debug en production

### Renouvellement SSL

```bash
# Le certificat Let's Encrypt expire tous les 90 jours
# Configurer le renouvellement automatique:
sudo certbot renew --dry-run

# Ajouter au crontab pour renouvellement automatique:
sudo crontab -e
# Ajouter:
0 0 1 * * certbot renew --quiet && docker compose -f /opt/cra-platform/docker-compose.prod.yml restart nginx
```

---

## 📞 Support

Pour toute question ou problème:

1. Consulter ce guide
2. Vérifier les logs: `docker compose logs -f`
3. Consulter les issues GitHub
4. Contacter l'équipe de développement

---

## 📝 Licence

Copyright © 2025 CRA Platform
