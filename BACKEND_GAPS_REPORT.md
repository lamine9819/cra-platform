# 📊 Rapport d'Analyse Backend - Système de Gestion de Documents

## ✅ Endpoints disponibles

### CRUD de base
- ✅ `POST /documents/upload` - Upload fichier unique
- ✅ `POST /documents/upload/multiple` - Upload multiple (jusqu'à 10 fichiers)
- ✅ `GET /documents` - Liste avec filtres (pagination, type, owner, isPublic, entityIds)
- ✅ `GET /documents/:id` - Détails document
- ✅ `GET /documents/:id/download` - Téléchargement
- ✅ `POST /documents/:id/share` - Partage avec utilisateurs
- ✅ `DELETE /documents/:id` - Suppression
- ✅ `GET /documents/stats/overview` - Statistiques utilisateur

### Récupération par entité
- ✅ `GET /documents/project/:projectId` - Documents d'un projet
- ✅ `GET /documents/activity/:activityId` - Documents d'une activité
- ✅ `GET /documents/task/:taskId` - Documents d'une tâche
- ✅ `GET /documents/seminar/:seminarId` - Documents d'un séminaire
- ✅ `GET /documents/training/:trainingId` - Documents d'une formation
- ✅ `GET /documents/internship/:internshipId` - Documents d'un stage
- ✅ `GET /documents/supervision/:supervisionId` - Documents d'un encadrement
- ✅ `GET /documents/knowledge-transfer/:knowledgeTransferId` - Documents d'un transfert
- ✅ `GET /documents/event/:eventId` - Documents d'un événement

---

## ❌ Endpoints manquants (à ajouter au backend)

### 1. Mise à jour de métadonnées
```typescript
PATCH /documents/:id
Body: {
  title?: string;
  description?: string;
  type?: DocumentType;
  tags?: string[];
  isPublic?: boolean;
}
```
**Impact:** CRITIQUE - Nécessaire pour éditer les métadonnées sans re-upload

### 2. Système de corbeille (Soft Delete)
```typescript
// Marquer comme supprimé (soft delete)
DELETE /documents/:id → Devrait soft delete au lieu de hard delete

// Obtenir les documents supprimés
GET /documents/trash
Response: { documents: DocumentResponse[], count: number }

// Restaurer un document
POST /documents/:id/restore
Response: { success: true, document: DocumentResponse }

// Suppression définitive
DELETE /documents/:id/permanent
Response: { success: true, message: string }

// Vider la corbeille
DELETE /documents/trash/empty
Response: { success: true, deletedCount: number }
```
**Impact:** HAUTE - Fonctionnalité de sécurité importante pour éviter pertes de données

### 3. Gestion avancée des partages
```typescript
// Obtenir les partages d'un document
GET /documents/:id/shares
Response: { shares: DocumentShare[] }

// Révoquer un partage spécifique
DELETE /documents/:id/shares/:shareId
Response: { success: true, message: string }

// Mettre à jour les permissions d'un partage
PATCH /documents/:id/shares/:shareId
Body: { canEdit?: boolean, canDelete?: boolean }
Response: { share: DocumentShare }
```
**Impact:** MOYENNE - Améliore la gestion granulaire des permissions

### 4. Liaison/Déliaison post-upload
```typescript
// Lier un document existant à une entité
POST /documents/:id/link
Body: {
  entityType: 'project' | 'activity' | 'task' | 'seminar' | 'training' | etc.
  entityId: string
}
Response: { success: true, document: DocumentResponse }

// Délier un document d'une entité
DELETE /documents/:id/link
Body: { entityType: string, entityId: string }
// OU délier de toutes les entités si pas de body
Response: { success: true, document: DocumentResponse }
```
**Impact:** HAUTE - Essentiel pour le workflow "Lier document existant"

### 5. Système de favoris
```typescript
// Ajouter aux favoris
POST /documents/:id/favorite
Response: { success: true, isFavorite: true }

// Retirer des favoris
DELETE /documents/:id/favorite
Response: { success: true, isFavorite: false }

// Obtenir les favoris
GET /documents/favorites
Response: { documents: DocumentResponse[] }
```
**Impact:** BASSE - Nice to have, améliore UX

### 6. Preview URL séparée du download
```typescript
// Obtenir URL de preview (sans trigger de téléchargement)
GET /documents/:id/preview
Response: Fichier avec Content-Disposition: inline au lieu de attachment
```
**Impact:** MOYENNE - Meilleure UX pour preview dans browser

### 7. Recherche full-text avancée
```typescript
// Recherche dans le contenu des documents (si faisable)
GET /documents/search
Query: {
  q: string (terme de recherche)
  searchInContent?: boolean (chercher dans le contenu du fichier)
  searchInMetadata?: boolean (titre, description, tags)
  filters?: { ... }
}
```
**Impact:** BASSE - Dépend de la complexité d'implémentation

### 8. Duplication de document
```typescript
// Dupliquer un document
POST /documents/:id/duplicate
Body: { title?: string, preserveLinks?: boolean }
Response: { success: true, document: DocumentResponse }
```
**Impact:** BASSE - Nice to have

### 9. Statistiques avancées
```typescript
// Stats avec plus de détails
GET /documents/stats/detailed
Response: {
  ...stats actuels,
  storageUsed: number, // Octets utilisés
  storageLimit: number, // Limite utilisateur
  downloadCount: number, // Total téléchargements
  viewCount: number, // Total vues
  recentActivity: ActivityLog[]
}
```
**Impact:** BASSE - Améliore le dashboard

---

## ⚠️ Modifications du schéma Prisma nécessaires

### Ajout de champs au modèle Document

```prisma
model Document {
  id          String   @id @default(cuid())

  // Champs existants...

  // NOUVEAUX CHAMPS À AJOUTER :

  // Pour soft delete
  deletedAt   DateTime? // null = actif, date = supprimé
  deletedBy   String?   // ID de l'utilisateur qui a supprimé

  // Pour favoris
  favoritedBy String[]  // Array d'IDs utilisateurs

  // Pour tracking
  viewCount     Int      @default(0)
  downloadCount Int      @default(0)
  lastViewedAt  DateTime?

  // Pour versioning (optionnel)
  version       Int      @default(1)
  previousVersionId String? // ID de la version précédente

  // Pour expiration de partages (optionnel)
  shareExpiresAt DateTime? // Date d'expiration des partages

  @@map("documents")
}

// Nouveau modèle pour audit/tracking
model DocumentActivity {
  id         String   @id @default(cuid())
  documentId String
  userId     String
  action     String   // 'view', 'download', 'share', 'edit', 'delete', etc.
  metadata   Json?    // Données additionnelles
  createdAt  DateTime @default(now())

  document   Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  user       User     @relation(fields: [userId], references: [id])

  @@map("document_activities")
  @@index([documentId])
  @@index([userId])
}
```

---

## 🔧 Modifications du modèle DocumentShare

```prisma
model DocumentShare {
  id          String   @id @default(cuid())

  // Champs existants...

  // NOUVEAUX CHAMPS :
  expiresAt   DateTime? // Date d'expiration du partage
  revokedAt   DateTime? // Date de révocation
  revokedBy   String?   // ID de qui a révoqué

  @@map("document_shares")
}
```

---

## 🎯 Priorités d'implémentation Backend

### Phase 1 - CRITIQUE (bloque le frontend)
1. ✅ Upload multiple → **DÉJÀ FAIT**
2. ❌ `PATCH /documents/:id` → **Édition métadonnées**
3. ❌ `POST /documents/:id/link` → **Liaison post-upload**
4. ❌ `DELETE /documents/:id/link` → **Déliaison**

### Phase 2 - HAUTE (fonctionnalités importantes)
5. ❌ Soft delete + corbeille (`deletedAt` field + endpoints trash)
6. ❌ `GET /documents/:id/shares` + `DELETE /shares/:id` → **Gestion partages**

### Phase 3 - MOYENNE (améliore UX)
7. ❌ `GET /documents/:id/preview` → **Preview séparée**
8. ❌ Système de favoris

### Phase 4 - BASSE (optionnel)
9. ❌ Recherche full-text dans contenu
10. ❌ Duplication de documents
11. ❌ Stats avancées avec tracking

---

## 💡 Recommandations d'implémentation

### 1. Soft Delete (Corbeille)
```typescript
// Dans document.service.ts
async deleteDocument(id: string, userId: string, userRole: string) {
  // Au lieu de supprimer, marquer deletedAt
  return await prisma.document.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      deletedBy: userId
    }
  });
}

// Filtrer les documents supprimés par défaut
async listDocuments(userId: string, userRole: string, query: DocumentListQuery) {
  const where = {
    deletedAt: null, // ← IMPORTANT
    // ... autres filtres
  };
  // ...
}

// Nouveau: endpoint corbeille
async getTrashDocuments(userId: string) {
  return await prisma.document.findMany({
    where: {
      deletedAt: { not: null },
      OR: [
        { ownerId: userId },
        { deletedBy: userId } // Si admin a supprimé
      ]
    },
    orderBy: { deletedAt: 'desc' }
  });
}
```

### 2. Liaison dynamique post-upload
```typescript
// Nouveau controller method
async linkDocument(req: Request, res: Response) {
  const { id } = req.params;
  const { entityType, entityId } = req.body;

  // Valider que l'entité existe
  // Valider les permissions

  const data: any = {};
  data[`${entityType}Id`] = entityId;

  const document = await prisma.document.update({
    where: { id },
    data
  });

  res.json({ success: true, data: document });
}
```

### 3. Gestion des permissions
Actuellement, les permissions semblent bien gérées dans `document.service.ts`. Vérifier que :
- ✅ Owner peut tout faire
- ✅ Admin peut tout faire
- ✅ Shared users avec `canEdit` peuvent éditer
- ✅ Shared users avec `canDelete` peuvent supprimer
- ⚠️ **À ajouter :** Responsables d'entité peuvent délier les documents

---

## 📝 Checklist pour développeur backend

```markdown
### Modifications Prisma
- [ ] Ajouter champ `deletedAt: DateTime?` au modèle Document
- [ ] Ajouter champ `deletedBy: String?` au modèle Document
- [ ] Ajouter champ `favoritedBy: String[]` au modèle Document
- [ ] (Optionnel) Ajouter champs tracking (viewCount, downloadCount, lastViewedAt)
- [ ] Exécuter `npx prisma migrate dev --name add_document_features`

### Nouveaux endpoints
- [ ] `PATCH /documents/:id` - Édition métadonnées
- [ ] `POST /documents/:id/link` - Lier à entité
- [ ] `DELETE /documents/:id/link` - Délier d'entité
- [ ] `GET /documents/trash` - Documents supprimés
- [ ] `POST /documents/:id/restore` - Restaurer
- [ ] `DELETE /documents/:id/permanent` - Suppression définitive
- [ ] `GET /documents/:id/shares` - Liste partages
- [ ] `DELETE /documents/:id/shares/:shareId` - Révoquer partage
- [ ] `POST /documents/:id/favorite` - Ajouter aux favoris
- [ ] `DELETE /documents/:id/favorite` - Retirer des favoris
- [ ] `GET /documents/favorites` - Liste favoris

### Modifications endpoints existants
- [ ] `DELETE /documents/:id` → Soft delete au lieu de hard delete
- [ ] `GET /documents` → Filtrer `deletedAt: null` par défaut
- [ ] `GET /documents/:id/download` → Ajouter tracking (downloadCount++)
- [ ] `GET /documents/:id/preview` → Nouveau endpoint avec `Content-Disposition: inline`

### Validation et sécurité
- [ ] Valider que entityType est valide lors du link
- [ ] Vérifier que entityId existe avant de lier
- [ ] Vérifier permissions sur entity avant de lier/délier
- [ ] Ajouter rate limiting sur upload multiple
- [ ] Ajouter validation file size totale sur upload multiple

### Tests
- [ ] Tests unitaires pour tous les nouveaux endpoints
- [ ] Tests d'intégration pour le workflow complet
- [ ] Tests de permissions pour link/unlink
- [ ] Tests de soft delete et restore
```

---

## 📌 Workarounds Frontend (en attendant backend)

En attendant que le backend soit complété, le frontend peut :

1. **Édition métadonnées** : Re-upload avec nouvelles métadonnées (sous-optimal)
2. **Corbeille** : Cacher les documents "supprimés" côté client uniquement
3. **Liaison post-upload** : Forcer à lier lors de l'upload initial
4. **Favoris** : Stocker dans localStorage (limité)
5. **Preview** : Utiliser endpoint download avec ouverture dans nouvel onglet

Ces workarounds fonctionnent mais limitent l'expérience utilisateur.

---

## ✅ Conclusion

**Backend actuel : 60% complet**

Endpoints disponibles couvrent les fonctionnalités de base, mais il manque :
- Édition métadonnées (critique)
- Liaison/Déliaison post-upload (critique)
- Système de corbeille (haute priorité)
- Gestion avancée partages (moyenne priorité)
- Favoris et tracking (basse priorité)

**Recommandation : Implémenter Phase 1 et Phase 2 avant déploiement production.**
