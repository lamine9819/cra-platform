# 🧪 Test Local Docker - Guide Rapide

## 📌 État actuel

Le téléchargement des images Docker est en cours en arrière-plan.

## ✅ Commandes pour vérifier l'état

### 1. Vérifier si le téléchargement est terminé

```powershell
# Ouvrir PowerShell et naviguer vers le projet
cd "C:\Users\lamin\Desktop\plateforme CRA\cra-platform"

# Vérifier l'état des conteneurs
docker compose -f docker-compose.dev.yml ps
```

### 2. Voir les logs en temps réel

```powershell
# Tous les logs
docker compose -f docker-compose.dev.yml logs -f

# Backend seulement
docker compose -f docker-compose.dev.yml logs -f backend

# Appuyez sur Ctrl+C pour arrêter l'affichage des logs
```

### 3. Vérifier que tous les services sont démarrés

```powershell
docker ps
```

Vous devriez voir 4 conteneurs:
- ✅ `cra-postgres-dev` (status: Up, healthy)
- ✅ `cra-redis-dev` (status: Up, healthy)
- ✅ `cra-backend-dev` (status: Up)
- ✅ `cra-frontend-dev` (status: Up)

## 🌐 Accéder à l'application

### URLs de l'application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api
- **Backend Health**: http://localhost:3001/health
- **Backend Detailed Health**: http://localhost:3001/health/detailed

### Tester avec curl

```powershell
# Tester le health check backend
curl http://localhost:3001/health

# Tester le health check détaillé
curl http://localhost:3001/health/detailed
```

Ou ouvrez simplement dans votre navigateur: http://localhost:5173

## 🔧 Si quelque chose ne fonctionne pas

### Le backend ne démarre pas

```powershell
# Vérifier les logs du backend
docker compose -f docker-compose.dev.yml logs backend

# Redémarrer le backend
docker compose -f docker-compose.dev.yml restart backend
```

### Erreur "database does not exist"

```powershell
# Exécuter les migrations Prisma
docker compose -f docker-compose.dev.yml exec backend npx prisma migrate dev

# Ou créer la base de données
docker compose -f docker-compose.dev.yml exec backend npx prisma db push
```

### Le frontend affiche une page blanche

```powershell
# Vérifier les logs du frontend
docker compose -f docker-compose.dev.yml logs frontend

# Reconstruire le frontend
docker compose -f docker-compose.dev.yml up -d --build frontend
```

### Redémarrer tout proprement

```powershell
# Arrêter tous les services
docker compose -f docker-compose.dev.yml down

# Redémarrer
docker compose -f docker-compose.dev.yml up -d

# Voir les logs
docker compose -f docker-compose.dev.yml logs -f
```

## 📊 Commandes utiles

### Voir l'utilisation des ressources

```powershell
docker stats
```

### Accéder au shell d'un conteneur

```powershell
# Backend
docker compose -f docker-compose.dev.yml exec backend sh

# PostgreSQL
docker compose -f docker-compose.dev.yml exec postgres psql -U postgres -d cra-db
```

### Seed la base de données

```powershell
docker compose -f docker-compose.dev.yml exec backend npx prisma db seed
```

### Ouvrir Prisma Studio

```powershell
docker compose -f docker-compose.dev.yml exec backend npx prisma studio
```

Puis ouvrez http://localhost:5555

## 🛑 Arrêter l'environnement

```powershell
# Arrêter sans supprimer les données
docker compose -f docker-compose.dev.yml stop

# Arrêter et supprimer les conteneurs (garde les données)
docker compose -f docker-compose.dev.yml down

# Tout supprimer (conteneurs + données)
docker compose -f docker-compose.dev.yml down -v
```

## ✨ Premiers pas après le démarrage

1. **Vérifier que tout tourne:**
   ```powershell
   docker compose -f docker-compose.dev.yml ps
   ```

2. **Créer la base de données:**
   ```powershell
   docker compose -f docker-compose.dev.yml exec backend npx prisma migrate dev
   ```

3. **Seed avec des données de test:**
   ```powershell
   docker compose -f docker-compose.dev.yml exec backend npx prisma db seed
   ```

4. **Ouvrir l'application:**
   - Frontend: http://localhost:5173
   - Prisma Studio: Exécutez `npx prisma studio` puis http://localhost:5555

## 🎯 Checklist de test

- [ ] Le frontend s'affiche sur http://localhost:5173
- [ ] L'API répond sur http://localhost:3001/health
- [ ] La base de données contient des données de seed
- [ ] Vous pouvez vous connecter avec un compte de test
- [ ] Les notifications en temps réel fonctionnent
- [ ] L'upload de fichiers fonctionne

## 📞 Besoin d'aide?

Consultez:
- `QUICKSTART.md` - Guide de démarrage rapide
- `DOCKER.md` - Documentation complète Docker
- Les logs: `docker compose -f docker-compose.dev.yml logs -f`
