#!/bin/bash

set -e

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "❌ Usage: ./restore.sh <backup-file>"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Fichier de backup introuvable: $BACKUP_FILE"
    exit 1
fi

echo "⚠️  ATTENTION: Cette opération va écraser la base de données actuelle!"
read -p "Continuer? (yes/no) " -n 3 -r
echo

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "❌ Restauration annulée"
    exit 1
fi

echo "🔄 Restauration de la base de données..."
pg_restore -d $PGDATABASE -c -F c "$BACKUP_FILE"

echo "✅ Restauration terminée!"
