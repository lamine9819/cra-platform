# CLI CRA - Documentation

CLI pour simplifier la gestion Docker de la plateforme CRA.

## Installation

Le CLI est déjà configuré. Aucune installation supplémentaire n'est nécessaire.

### Prérequis
- Docker et Docker Compose installés
- Git Bash (pour Windows) ou un terminal bash
- Les fichiers `docker-compose.dev.yml` et `docker-compose.prod.yml`

## Utilisation

### Windows
```bash
# Utiliser le wrapper batch
cra [commande] [options]

# Ou directement avec bash
./cra [commande] [options]
```

### Linux/Mac
```bash
./cra [commande] [options]
```

## Commandes principales

### Démarrage rapide
```bash
# Démarrer tous les services en dev
cra up

# Démarrer tous les services en dev + seed de la DB
cra up:seed

# Démarrer tous les services en prod
cra up prod

# Voir tous les services en cours
cra ps
```

### Gestion des services

| Commande | Description |
|----------|-------------|
| `cra up [ENV]` | Démarrer tous les services (dev par défaut) |
| `cra up:seed` | Démarrer tous les services en dev + migrations + seed |
| `cra down [ENV]` | Arrêter et supprimer tous les conteneurs |
| `cra restart [ENV]` | Redémarrer tous les services |
| `cra stop [ENV]` | Arrêter les services sans les supprimer |
| `cra start [ENV]` | Démarrer les services existants |
| `cra ps [ENV]` | Lister les conteneurs actifs |

### Services individuels

```bash
# Démarrer un service spécifique
cra up:backend     # Démarrer le backend
cra up:frontend    # Démarrer le frontend
cra up:db          # Démarrer PostgreSQL
cra up:redis       # Démarrer Redis
```

### Logs

```bash
# Voir les 100 dernières lignes de logs
cra logs              # Tous les services
cra logs backend      # Backend seulement
cra logs frontend     # Frontend seulement

# Suivre les logs en temps réel
cra logs:f            # Tous les services
cra logs:f backend    # Backend seulement
```

### Build et déploiement

```bash
# Build des images
cra build              # Build tous les services
cra build:backend      # Build le backend seulement
cra build:frontend     # Build le frontend seulement

# Rebuild complet
cra rebuild            # Arrête, rebuild et redémarre tout
```

### Base de données

```bash
# Migrations Prisma
cra db:migrate         # Exécuter les migrations
cra db:reset           # Reset la base de données (avec confirmation)
cra db:seed            # Seed la base de données
cra db:studio          # Ouvrir Prisma Studio

# Shell PostgreSQL
cra db:shell           # Ouvrir psql
```

### Utilitaires

```bash
# Exécuter des commandes dans les conteneurs
cra exec backend npm test              # Lancer les tests
cra exec backend npx prisma generate   # Générer Prisma Client
cra exec frontend npm run build        # Build le frontend

# Ouvrir un shell
cra shell              # Shell dans backend (par défaut)
cra shell frontend     # Shell dans frontend
cra shell postgres     # Shell dans postgres

# Nettoyage
cra clean              # Supprimer volumes et conteneurs
cra clean:all          # Nettoyage complet (avec confirmation)

# Santé des services
cra health             # Vérifier le statut de santé
```

### Changement d'environnement

```bash
# Basculer entre dev et prod
cra env:dev            # Utiliser l'environnement dev
cra env:prod           # Utiliser l'environnement prod

# Ou spécifier directement
cra up dev             # Démarrer en dev
cra up prod            # Démarrer en prod
```

## Exemples d'utilisation

### Workflow de développement typique

```bash
# Option 1: Démarrage rapide avec seed
cra up:seed             # Démarre tout + migrations + seed en une commande

# Option 2: Démarrage manuel
cra up                  # Démarrer l'environnement de dev
cra db:migrate          # Exécuter les migrations
cra db:seed             # Seed la base de données

# Voir les logs
cra logs:f backend

# Redémarrer un service après modification
cra restart backend

# Arrêter tout
cra down
```

### Workflow de déploiement en production

```bash
# 1. Build et démarrer en prod
cra rebuild prod

# 2. Vérifier la santé
cra health prod

# 3. Voir les logs
cra logs prod

# 4. Si nécessaire, accéder au shell
cra shell backend prod
```

### Gestion de la base de données

```bash
# Créer une migration
cra exec backend npx prisma migrate dev --name add_users_table

# Appliquer les migrations
cra db:migrate

# Ouvrir Prisma Studio
cra db:studio

# Backup manuel (en prod)
cra exec postgres pg_dump -U postgres cra-db > backup.sql
```

### Debugging

```bash
# Voir les logs en temps réel
cra logs:f backend

# Voir les processus
cra ps

# Accéder au shell pour debugging
cra shell backend

# Exécuter une commande spécifique
cra exec backend node --version
```

## Variables d'environnement

Vous pouvez forcer un environnement via la variable `ENV` :

```bash
ENV=prod cra up
ENV=dev cra logs
```

## Raccourcis recommandés

Ajoutez ces alias dans votre `.bashrc` ou `.zshrc` pour aller encore plus vite :

```bash
alias cra-up='./cra up'
alias cra-down='./cra down'
alias cra-logs='./cra logs:f'
alias cra-ps='./cra ps'
```

## Aide

Pour voir toutes les commandes disponibles :

```bash
cra help
```

## Structure des fichiers

```
.
├── cra                      # Script CLI principal (bash)
├── cra.bat                  # Wrapper pour Windows
├── CLI.md                   # Cette documentation
├── docker-compose.dev.yml   # Configuration dev
└── docker-compose.prod.yml  # Configuration prod
```

## Dépannage

### Le script ne s'exécute pas sur Windows
Assurez-vous que Git Bash est installé et que `bash` est dans votre PATH.

### Permission denied
Sur Linux/Mac, rendez le script exécutable :
```bash
chmod +x cra
```

### Commande non reconnue
Assurez-vous d'être dans le bon répertoire (racine du projet).

### Les conteneurs ne démarrent pas
Vérifiez que Docker est bien lancé et que les ports ne sont pas déjà utilisés :
```bash
docker ps
cra health
```
