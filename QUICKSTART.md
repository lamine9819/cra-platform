# 🚀 Guide de démarrage rapide - Test Docker Local

Ce guide vous permet de tester rapidement votre application avec Docker sur votre machine locale.

## ⚡ Démarrage en 3 étapes

### Étape 1: Vérification

Votre système est prêt:
- ✅ Docker Desktop installé (version 28.5.2)
- ✅ Docker Compose installé (version 2.40.3)

### Étape 2: Démarrer l'environnement

```bash
# Ouvrir un terminal dans le dossier du projet
cd "C:\Users\lamin\Desktop\plateforme CRA\cra-platform"

# Démarrer tous les services
docker compose -f docker-compose.dev.yml up -d

# Voir les logs en temps réel
docker compose -f docker-compose.dev.yml logs -f
```

### Étape 3: Accéder à l'application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api
- **Backend Health**: http://localhost:3001/health

## 📊 Vérifier que tout fonctionne

```bash
# Voir l'état de tous les services
docker compose -f docker-compose.dev.yml ps

# Vous devriez voir:
# ✅ cra-postgres-dev - healthy
# ✅ cra-redis-dev - healthy
# ✅ cra-backend-dev - running
# ✅ cra-frontend-dev - running
```

## 🔍 Commandes utiles

### Voir les logs

```bash
# Tous les services
docker compose -f docker-compose.dev.yml logs -f

# Backend seulement
docker compose -f docker-compose.dev.yml logs -f backend

# Frontend seulement
docker compose -f docker-compose.dev.yml logs -f frontend

# PostgreSQL seulement
docker compose -f docker-compose.dev.yml logs -f postgres
```

### Arrêter les services

```bash
# Arrêter sans supprimer les données
docker compose -f docker-compose.dev.yml stop

# Arrêter et supprimer les conteneurs (garde les données)
docker compose -f docker-compose.dev.yml down

# Arrêter et TOUT supprimer (données incluses)
docker compose -f docker-compose.dev.yml down -v
```

### Redémarrer après modification du code

```bash
# Reconstruire et redémarrer
docker compose -f docker-compose.dev.yml up -d --build

# Ou pour un service spécifique
docker compose -f docker-compose.dev.yml up -d --build backend
```

### Exécuter des commandes dans les conteneurs

```bash
# Accéder au shell du backend
docker compose -f docker-compose.dev.yml exec backend sh

# Exécuter les migrations Prisma
docker compose -f docker-compose.dev.yml exec backend npx prisma migrate dev

# Générer le client Prisma
docker compose -f docker-compose.dev.yml exec backend npx prisma generate

# Ouvrir Prisma Studio (interface graphique DB)
docker compose -f docker-compose.dev.yml exec backend npx prisma studio

# Seed la base de données
docker compose -f docker-compose.dev.yml exec backend npx prisma db seed
```

### Accéder à la base de données

```bash
# Via psql dans le conteneur
docker compose -f docker-compose.dev.yml exec postgres psql -U postgres -d cra-db

# Ou depuis votre machine (si vous avez psql installé)
psql postgresql://postgres:Bathily@localhost:5432/cra-db
```

## 🐛 Résolution des problèmes courants

### Le backend ne démarre pas

```bash
# Vérifier les logs du backend
docker compose -f docker-compose.dev.yml logs backend

# Problème courant: le backend démarre avant que PostgreSQL soit prêt
# Solution: redémarrer le backend
docker compose -f docker-compose.dev.yml restart backend
```

### Erreur "port already in use"

```bash
# Vérifier ce qui utilise le port
netstat -ano | findstr :5173  # Frontend
netstat -ano | findstr :3001  # Backend
netstat -ano | findstr :5432  # PostgreSQL

# Arrêter le processus qui utilise le port
# Ou modifier le port dans docker-compose.dev.yml
```

### Le frontend ne se connecte pas au backend

```bash
# Vérifier que le backend est accessible
curl http://localhost:3001/health

# Vérifier les variables d'environnement du frontend
docker compose -f docker-compose.dev.yml exec frontend env | grep VITE
```

### Erreur de migration Prisma

```bash
# Réinitialiser la base de données (ATTENTION: supprime les données)
docker compose -f docker-compose.dev.yml exec backend npx prisma migrate reset

# Ou pousser le schéma sans migrations
docker compose -f docker-compose.dev.yml exec backend npx prisma db push
```

### Besoin de repartir de zéro

```bash
# Tout arrêter et supprimer
docker compose -f docker-compose.dev.yml down -v

# Nettoyer Docker
docker system prune -af

# Redémarrer
docker compose -f docker-compose.dev.yml up -d
```

## 📝 Mode développement avec hot reload

Le mode développement est configuré avec hot reload:

- **Frontend**: Les changements dans `cra-frontend/src` sont détectés automatiquement
- **Backend**: Les changements dans `cra-bakend/src` redémarrent le serveur (nodemon)

Les volumes sont montés pour permettre le développement en temps réel:

```yaml
volumes:
  - ./cra-bakend/src:/app/src       # Code backend
  - ./cra-frontend/src:/app/src     # Code frontend
  - ./cra-bakend/uploads:/app/uploads  # Fichiers uploadés
  - ./cra-bakend/logs:/app/logs     # Logs
```

## 🔧 Personnalisation

### Modifier les ports

Éditez `docker-compose.dev.yml`:

```yaml
services:
  frontend:
    ports:
      - "8080:5173"  # Changer 5173 en 8080 localement

  backend:
    ports:
      - "4000:3001"  # Changer 3001 en 4000 localement
```

### Ajouter des variables d'environnement

Éditez `docker-compose.dev.yml` sous la section `environment`:

```yaml
services:
  backend:
    environment:
      - MA_NOUVELLE_VAR=valeur
```

## 📊 Monitoring

### Voir l'utilisation des ressources

```bash
# Statistiques en temps réel
docker stats

# Espace disque utilisé par Docker
docker system df
```

### Inspecter les conteneurs

```bash
# Détails d'un conteneur
docker inspect cra-backend-dev

# Processus dans un conteneur
docker compose -f docker-compose.dev.yml top backend
```

## 🎯 Prochaines étapes

Une fois que tout fonctionne localement:

1. ✅ Tester toutes les fonctionnalités de l'application
2. ✅ Vérifier les logs pour détecter les erreurs
3. ✅ Tester le WebSocket (chat, notifications)
4. ✅ Tester l'upload de fichiers
5. 🚀 Passer en production avec `docker-compose.prod.yml`

## 💡 Astuces

### Alias pratiques (PowerShell)

Ajoutez dans votre profil PowerShell:

```powershell
# $PROFILE
function dcu { docker compose -f docker-compose.dev.yml up -d }
function dcd { docker compose -f docker-compose.dev.yml down }
function dcl { docker compose -f docker-compose.dev.yml logs -f $args }
function dcp { docker compose -f docker-compose.dev.yml ps }
function dcr { docker compose -f docker-compose.dev.yml restart $args }
```

Utilisation:
```powershell
dcu          # Démarrer
dcl backend  # Logs du backend
dcp          # Status
dcr backend  # Redémarrer le backend
dcd          # Arrêter
```

### Alias pratiques (Git Bash / Linux)

Ajoutez dans votre `.bashrc` ou `.bash_profile`:

```bash
alias dcu='docker compose -f docker-compose.dev.yml up -d'
alias dcd='docker compose -f docker-compose.dev.yml down'
alias dcl='docker compose -f docker-compose.dev.yml logs -f'
alias dcp='docker compose -f docker-compose.dev.yml ps'
alias dcr='docker compose -f docker-compose.dev.yml restart'
```

---

🎉 **Bon développement avec Docker!**
