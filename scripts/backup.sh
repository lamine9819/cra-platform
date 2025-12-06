#!/bin/bash

set -e

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d-%H%M%S)
DB_NAME=${PGDATABASE:-cra-db}
BACKUP_FILE="$BACKUP_DIR/backup-$DATE.dump"

echo "📦 Création du backup de la base de données..."
pg_dump -Fc -f "$BACKUP_FILE"

echo "✅ Backup créé: $BACKUP_FILE"

# Garder seulement les 7 derniers backups
echo "🧹 Nettoyage des anciens backups..."
find $BACKUP_DIR -name "backup-*.dump" -mtime +7 -delete

echo "✅ Backup terminé!"
