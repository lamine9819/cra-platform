# 🐳 Solutions Docker pour la plateforme CRA

## ⚠️ Problème rencontré

Le frontend contient des erreurs TypeScript qui empêchent la compilation dans Docker.
Le backend fonctionne parfaitement!

## ✅ Solutions disponibles

### **Solution 1: Backend Docker + Frontend local** (RECOMMANDÉ)

Cette solution utilise Docker uniquement pour le backend, la base de données et Redis,
tandis que le frontend tourne en mode développement local (qui ignore certaines erreurs TypeScript).

#### Étapes:

**1. Démarrer le backend avec Docker:**

```powershell
cd "C:\Users\lamin\Desktop\plateforme CRA\cra-platform"

# Démarrer Backend, PostgreSQL et Redis en Docker
docker compose -f docker-compose.backend-only.yml up -d

# Voir les logs
docker compose -f docker-compose.backend-only.yml logs -f backend
```

**2. Démarrer le frontend en local:**

```powershell
# Ouvrir un nouveau terminal
cd "C:\Users\lamin\Desktop\plateforme CRA\cra-platform\cra-frontend"

# Installer les dépendances (si pas déjà fait)
npm install

# Démarrer le frontend
npm run dev
```

**3. Accéder à l'application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api
- Backend Health: http://localhost:3001/health

#### Avantages:
- ✅ Fonctionne immédiatement
- ✅ Meilleure expérience de développement (HMR ultra-rapide)
- ✅ Facile à debugger
- ✅ Base de données et Redis isolés dans Docker

---

### **Solution 2: Corriger les erreurs TypeScript** (POUR PLUS TARD)

Pour que le frontend puisse être conteneurisé, il faut corriger les erreurs TypeScript.

#### Principales erreurs à corriger:

1. **Types d'export incorrects:**
   ```typescript
   // ❌ Mauvais
   export interface Project { ... }

   // ✅ Correct pour export named
   export type { Project };
   export interface Project { ... }
   ```

2. **Propriétés manquantes:**
   - `Activity.themeId` n'existe pas → utiliser `Activity.theme?.id`
   - `Project.contractNumber` n'existe pas sur `Convention`
   - Etc.

3. **Types any implicites:**
   - Ajouter des types explicites aux paramètres de fonctions

#### Pour corriger rapidement (temporaire):

Modifier `cra-frontend/tsconfig.json`:

```json
{
  "compilerOptions": {
    // ... autres options ...
    "strict": false,  // Désactiver le mode strict
    "noImplicitAny": false,  // Autoriser les types any implicites
    "skipLibCheck": true  // Skip la vérification des types dans node_modules
  }
}
```

Ensuite tester:
```powershell
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.dev.yml up -d --build
```

---

### **Solution 3: Build frontend sans vérification TypeScript stricte**

Modifier `cra-frontend/Dockerfile` pour skip la vérification TypeScript:

```dockerfile
# Dans le Dockerfile frontend, ligne du build
RUN SKIP_TYPE_CHECK=1 npm run build
# ou
RUN npm run build -- --mode development
```

Et dans `cra-frontend/vite.config.ts`, ajouter:

```typescript
export default defineConfig({
  plugins: [react()],
  build: {
    // Ignorer les erreurs TypeScript pendant le build
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;
        warn(warning);
      }
    }
  }
});
```

---

## 🎯 Recommandation

**Utilisez la Solution 1** pour tester Docker dès maintenant:

```powershell
# 1. Démarrer backend + DB avec Docker
docker compose -f docker-compose.backend-only.yml up -d

# 2. Dans un autre terminal: Démarrer le frontend en local
cd cra-frontend
npm run dev

# 3. Ouvrir http://localhost:5173
```

## ✨ Commandes utiles

### Backend Docker

```powershell
# Démarrer
docker compose -f docker-compose.backend-only.yml up -d

# Logs
docker compose -f docker-compose.backend-only.yml logs -f backend

# Arrêter
docker compose -f docker-compose.backend-only.yml down

# Migrations Prisma
docker compose -f docker-compose.backend-only.yml exec backend npx prisma migrate dev

# Seed la DB
docker compose -f docker-compose.backend-only.yml exec backend npx prisma db seed

# Prisma Studio
docker compose -f docker-compose.backend-only.yml exec backend npx prisma studio
```

### Frontend local

```powershell
cd cra-frontend

# Démarrer
npm run dev

# Build (ignore certaines erreurs TypeScript en dev)
npm run build

# Preview du build
npm run preview
```

## 📊 Vérifier que tout fonctionne

1. **Backend:**
   ```powershell
   curl http://localhost:3001/health
   ```

   Devrait retourner: `{"status":"ok"}`

2. **Database:**
   ```powershell
   docker compose -f docker-compose.backend-only.yml exec postgres psql -U postgres -d cra-db -c "SELECT COUNT(*) FROM \"User\";"
   ```

3. **Frontend:**
   - Ouvrir http://localhost:5173
   - La page devrait s'afficher

## 🔧 Troubleshooting

### Le backend ne démarre pas

```powershell
# Voir les logs détaillés
docker compose -f docker-compose.backend-only.yml logs backend

# Redémarrer
docker compose -f docker-compose.backend-only.yml restart backend
```

### Erreur "Database does not exist"

```powershell
# Créer la DB et migrer
docker compose -f docker-compose.backend-only.yml exec backend npx prisma migrate dev
```

### Port déjà utilisé

```powershell
# Trouver ce qui utilise le port 3001
netstat -ano | findstr :3001

# Tuer le processus (remplacer PID)
taskkill /PID <PID> /F
```

---

## 📝 Résumé

| Solution | Complexité | Fonctionne? | Idéal pour |
|----------|------------|-------------|------------|
| **Solution 1 (Backend Docker + Frontend local)** | ⭐ Facile | ✅ Oui immédiatement | Développement |
| Solution 2 (Corriger TypeScript) | ⭐⭐⭐ Difficile | ✅ Oui après corrections | Production |
| Solution 3 (Skip TypeScript check) | ⭐⭐ Moyen | ⚠️ Peut masquer des bugs | Test rapide |

**Recommandation:** Commencez avec la Solution 1 pour tester Docker maintenant,
et corrigez les erreurs TypeScript progressivement pour la production.
