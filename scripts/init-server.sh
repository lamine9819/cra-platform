#!/bin/bash

# Script d'initialisation du serveur de production
# À exécuter une seule fois sur le serveur

set -e

echo "🔧 Initialisation du serveur de production..."

# Mettre à jour le système
echo "📦 Mise à jour du système..."
sudo apt update && sudo apt upgrade -y

# Installer Docker
echo "🐳 Installation de Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
else
    echo "✅ Docker déjà installé"
fi

# Installer Docker Compose
echo "🐳 Installation de Docker Compose..."
if ! command -v docker compose &> /dev/null; then
    sudo apt install docker-compose-plugin -y
else
    echo "✅ Docker Compose déjà installé"
fi

# Créer le dossier de l'application
echo "📁 Création du dossier de l'application..."
sudo mkdir -p /opt/cra-platform
sudo chown $USER:$USER /opt/cra-platform

# Installer Git
echo "📦 Installation de Git..."
if ! command -v git &> /dev/null; then
    sudo apt install git -y
else
    echo "✅ Git déjà installé"
fi

# Configurer le firewall
echo "🔥 Configuration du firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Installer certbot pour SSL
echo "🔒 Installation de Certbot..."
if ! command -v certbot &> /dev/null; then
    sudo apt install certbot -y
else
    echo "✅ Certbot déjà installé"
fi

echo "✅ Initialisation du serveur terminée!"
echo ""
echo "Prochaines étapes:"
echo "1. Cloner le repository dans /opt/cra-platform"
echo "2. Copier .env.example vers .env et configurer les variables"
echo "3. Générer les certificats SSL avec certbot"
echo "4. Lancer le déploiement avec ./scripts/deploy.sh"
