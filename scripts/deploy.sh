#!/bin/bash

set -e

ENV=${1:-production}
COMPOSE_FILE="docker-compose.prod.yml"

echo "🚀 Déploiement sur l'environnement: $ENV"

# Vérifier que le fichier .env existe
if [ ! -f ".env" ]; then
    echo "❌ Fichier .env manquant!"
    exit 1
fi

# Pull des dernières images
echo "📥 Récupération des images Docker..."
docker compose -f $COMPOSE_FILE pull

# Arrêt des anciens conteneurs
echo "🛑 Arrêt des anciens conteneurs..."
docker compose -f $COMPOSE_FILE down

# Démarrage des nouveaux conteneurs
echo "▶️  Démarrage des nouveaux conteneurs..."
docker compose -f $COMPOSE_FILE up -d

# Attendre que le backend soit prêt
echo "⏳ Attente du backend..."
sleep 10

# Migration de la base de données
echo "🗄️  Migration de la base de données..."
docker compose -f $COMPOSE_FILE exec -T backend npx prisma migrate deploy

# Nettoyage
echo "🧹 Nettoyage des images non utilisées..."
docker system prune -af

echo "✅ Déploiement terminé avec succès!"
echo "🌐 Application disponible sur: http://localhost"
