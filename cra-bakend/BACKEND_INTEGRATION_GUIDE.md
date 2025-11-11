# 📘 Guide d'intégration Backend - Nouveaux endpoints Documents

Ce guide explique comment intégrer les nouveaux endpoints dans le backend existant.

---

## 🔧 Étape 1 : Migration Prisma

### 1.1 Appliquer le SQL

```bash
# Se connecter à PostgreSQL
psql -U votre_user -d votre_database

# Exécuter le fichier de migration
\i prisma/migrations/MANUAL_add_document_features.sql

# OU via commande directe
psql -U votre_user -d votre_database -f prisma/migrations/MANUAL_add_document_features.sql
```

### 1.2 Mettre à jour schema.prisma

Ouvrir `prisma/schema.prisma` et appliquer les modifications décrites dans `PRISMA_SCHEMA_UPDATES.md` :

1. **Modèle Document** (ligne ~1307) : Ajouter les nouveaux champs
2. **Modèle DocumentShare** (ligne ~1363) : Ajouter expiresAt, revokedAt, revokedBy
3. **Nouveau modèle DocumentActivity** : Ajouter après DocumentShare
4. **Modèle User** : Ajouter relation `documentActivities`

### 1.3 Générer le client Prisma

```bash
npx prisma generate
```

### 1.4 Vérifier dans Prisma Studio

```bash
npx prisma studio
```

---

## 🔧 Étape 2 : Intégrer les validations Zod

### 2.1 Ouvrir src/utils/documentValidation.ts

### 2.2 Ajouter les imports

En haut du fichier, après les imports existants :

```typescript
// Nouveaux schémas pour les endpoints avancés
export {
  updateDocumentMetadataSchema,
  linkDocumentSchema,
  unlinkDocumentSchema,
  updateSharePermissionsSchema,
  shareDocumentWithExpirationSchema,
  documentListQueryExtendedSchema,
  validateDocumentIdParam,
  validateShareIdParam
} from './documentValidation.NEW_SCHEMAS';
```

### 2.3 Copier le contenu de documentValidation.NEW_SCHEMAS.ts

Copier tout le contenu de `src/utils/documentValidation.NEW_SCHEMAS.ts` et l'ajouter à la fin de `documentValidation.ts`.

---

## 🔧 Étape 3 : Intégrer les méthodes du Service

### 3.1 Ouvrir src/services/document.service.ts

### 3.2 Ajouter les imports nécessaires

```typescript
import { deleteFile } from '../utils/fileHelpers';
import { NotFoundError } from '../utils/errors';
```

### 3.3 Copier les méthodes

À la fin de la classe `DocumentService`, avant le dernier `}`, copier toutes les méthodes de `document.service.NEW_METHODS.ts`.

**IMPORTANT :** Les méthodes privées `canEditDocument`, `canDeleteDocument`, `logActivity`, `getEntityModel`, `formatDocumentResponse` doivent être ajoutées en tant que méthodes de classe.

### 3.4 Modifier la méthode existante `listDocuments`

Dans la méthode `listDocuments` existante, trouver la construction du `where` et ajouter :

```typescript
async listDocuments(userId: string, userRole: string, queryParams: DocumentListQuery) {
  // ... code existant ...

  const where: any = {
    deletedAt: null,  // ← AJOUTER CETTE LIGNE (soft delete)
    // ... reste des filtres existants
  };

  // ... reste du code
}
```

### 3.5 Remplacer la méthode `deleteDocument`

Renommer l'ancienne méthode `deleteDocument` en `deleteDocumentOld` (backup), puis ajouter la nouvelle qui fait du soft delete :

```typescript
// ANCIENNE VERSION (backup)
async deleteDocumentOld(documentId: string, userId: string, userRole: string) {
  // ... ancien code hard delete ...
}

// NOUVELLE VERSION avec soft delete
async deleteDocument(documentId: string, userId: string, userRole: string) {
  // Appeler la méthode softDeleteDocument
  return await this.softDeleteDocument(documentId, userId, userRole);
}
```

---

## 🔧 Étape 4 : Intégrer les méthodes du Controller

### 4.1 Option A : Fichier séparé (recommandé pour test)

Créer `src/controllers/document.controller.extended.ts` :

```typescript
import { DocumentController } from './document.controller';
import { DocumentControllerNewMethods } from './document.controller.NEW_METHODS';

// Combiner les deux classes
export class DocumentControllerExtended extends DocumentController {
  private newMethods = new DocumentControllerNewMethods();

  // Exposer les nouvelles méthodes
  updateDocumentMetadata = this.newMethods.updateDocumentMetadata;
  linkDocument = this.newMethods.linkDocument;
  unlinkDocument = this.newMethods.unlinkDocument;
  getTrashDocuments = this.newMethods.getTrashDocuments;
  restoreDocument = this.newMethods.restoreDocument;
  permanentDeleteDocument = this.newMethods.permanentDeleteDocument;
  emptyTrash = this.newMethods.emptyTrash;
  getDocumentShares = this.newMethods.getDocumentShares;
  revokeShare = this.newMethods.revokeShare;
  updateSharePermissions = this.newMethods.updateSharePermissions;
  addToFavorites = this.newMethods.addToFavorites;
  removeFromFavorites = this.newMethods.removeFromFavorites;
  getFavoriteDocuments = this.newMethods.getFavoriteDocuments;
  previewDocument = this.newMethods.previewDocument;
}
```

### 4.2 Option B : Intégration directe

Ouvrir `src/controllers/document.controller.ts` et copier toutes les méthodes de `document.controller.NEW_METHODS.ts` à la fin de la classe `DocumentController`.

---

## 🔧 Étape 5 : Mettre à jour les routes

### 5.1 Ouvrir src/routes/document.routes.ts

### 5.2 Importer les nouvelles méthodes

```typescript
import { DocumentController } from '../controllers/document.controller';
// OU si vous utilisez l'option A :
// import { DocumentControllerExtended as DocumentController } from '../controllers/document.controller.extended';

const router = Router();
const documentController = new DocumentController();

router.use(authenticate);
```

### 5.3 Ajouter les nouvelles routes

**IMPORTANT :** L'ordre des routes est crucial. Les routes spécifiques doivent être avant les routes avec paramètres dynamiques.

```typescript
// =============================================
// ROUTES SPÉCIFIQUES (AVANT /:id)
// =============================================

// Stats (existant) - GARDER EN PREMIER
router.get('/stats/overview', documentController.getDocumentStats);

// Favoris - AJOUTER APRÈS STATS
router.get('/favorites', documentController.getFavoriteDocuments);

// Corbeille - AJOUTER APRÈS FAVORIS
router.get('/trash', documentController.getTrashDocuments);
router.delete('/trash/empty', documentController.emptyTrash);

// Upload (existant) - GARDER
router.post('/upload', uploadSingle, documentController.uploadFile);
router.post('/upload/multiple', uploadMultiple, documentController.uploadMultipleFiles);

// Liste (existant) - GARDER
router.get('/', documentController.listDocuments);

// =============================================
// ROUTES PAR ENTITÉ (existantes) - GARDER
// =============================================

router.get('/project/:projectId', documentController.getProjectDocuments);
router.get('/activity/:activityId', documentController.getActivityDocuments);
router.get('/task/:taskId', documentController.getTaskDocuments);
// ... autres routes existantes ...

// =============================================
// ROUTES AVEC :id (DOIVENT ÊTRE À LA FIN)
// =============================================

// Document spécifique (existant) - GARDER
router.get('/:id', documentController.getDocumentById);

// Preview - NOUVEAU
router.get('/:id/preview', documentController.previewDocument);

// Download (existant) - GARDER
router.get('/:id/download', documentController.downloadDocument);

// Partage (existant) - GARDER
router.post('/:id/share', documentController.shareDocument);

// Gestion partages - NOUVEAU
router.get('/:id/shares', documentController.getDocumentShares);
router.delete('/:id/shares/:shareId', documentController.revokeShare);
router.patch('/:id/shares/:shareId', documentController.updateSharePermissions);

// Liaison/Déliaison - NOUVEAU
router.post('/:id/link', documentController.linkDocument);
router.delete('/:id/link', documentController.unlinkDocument);

// Favoris - NOUVEAU
router.post('/:id/favorite', documentController.addToFavorites);
router.delete('/:id/favorite', documentController.removeFromFavorites);

// Corbeille - NOUVEAU
router.post('/:id/restore', documentController.restoreDocument);
router.delete('/:id/permanent', documentController.permanentDeleteDocument);

// Mise à jour métadonnées - NOUVEAU
router.patch('/:id', documentController.updateDocumentMetadata);

// Suppression (existant) - GARDER (maintenant soft delete)
router.delete('/:id', documentController.deleteDocument);

export default router;
```

---

## 🧪 Étape 6 : Tests

### 6.1 Tester avec Postman/Thunder Client

Créer une collection avec les requêtes suivantes :

#### 1. Upload un document
```http
POST http://localhost:5000/api/documents/upload
Content-Type: multipart/form-data
Authorization: Bearer YOUR_TOKEN

file: [fichier]
title: "Test Document"
type: "RAPPORT"
description: "Description test"
```

#### 2. Mettre à jour les métadonnées
```http
PATCH http://localhost:5000/api/documents/:id
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "title": "Nouveau titre",
  "description": "Nouvelle description",
  "tags": ["tag1", "tag2"]
}
```

#### 3. Lier à un projet
```http
POST http://localhost:5000/api/documents/:id/link
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "entityType": "project",
  "entityId": "PROJECT_ID"
}
```

#### 4. Soft delete
```http
DELETE http://localhost:5000/api/documents/:id
Authorization: Bearer YOUR_TOKEN
```

#### 5. Voir la corbeille
```http
GET http://localhost:5000/api/documents/trash
Authorization: Bearer YOUR_TOKEN
```

#### 6. Restaurer
```http
POST http://localhost:5000/api/documents/:id/restore
Authorization: Bearer YOUR_TOKEN
```

#### 7. Ajouter aux favoris
```http
POST http://localhost:5000/api/documents/:id/favorite
Authorization: Bearer YOUR_TOKEN
```

#### 8. Voir les favoris
```http
GET http://localhost:5000/api/documents/favorites
Authorization: Bearer YOUR_TOKEN
```

### 6.2 Tester via CLI

```bash
# Upload
curl -X POST http://localhost:5000/api/documents/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test.pdf" \
  -F "title=Test Document" \
  -F "type=RAPPORT"

# Mettre à jour
curl -X PATCH http://localhost:5000/api/documents/DOC_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Nouveau titre"}'

# Lier
curl -X POST http://localhost:5000/api/documents/DOC_ID/link \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"entityType":"project","entityId":"PROJECT_ID"}'

# Soft delete
curl -X DELETE http://localhost:5000/api/documents/DOC_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# Corbeille
curl http://localhost:5000/api/documents/trash \
  -H "Authorization: Bearer YOUR_TOKEN"

# Restaurer
curl -X POST http://localhost:5000/api/documents/DOC_ID/restore \
  -H "Authorization: Bearer YOUR_TOKEN"

# Favoris
curl -X POST http://localhost:5000/api/documents/DOC_ID/favorite \
  -H "Authorization: Bearer YOUR_TOKEN"

curl http://localhost:5000/api/documents/favorites \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ⚠️ Points d'attention

### 1. Ordre des routes

L'ordre est CRUCIAL. Les routes spécifiques (`/trash`, `/favorites`, `/stats`) doivent être AVANT `/:id`.

**Mauvais ordre :**
```typescript
router.get('/:id', ...);           // ← Ceci va capturer /trash et /favorites !
router.get('/trash', ...);          // ← Ne sera jamais atteint
router.get('/favorites', ...);      // ← Ne sera jamais atteint
```

**Bon ordre :**
```typescript
router.get('/trash', ...);          // ← Routes spécifiques en premier
router.get('/favorites', ...);      // ← Routes spécifiques en premier
router.get('/:id', ...);            // ← Route dynamique à la fin
```

### 2. Soft delete vs Hard delete

Après l'intégration, le `DELETE /documents/:id` fera un **soft delete** (marque comme supprimé).

Pour la suppression définitive, utiliser `DELETE /documents/:id/permanent`.

### 3. Filtrage des documents supprimés

Tous les endpoints de liste filtrent automatiquement `deletedAt: null`.

Pour inclure les supprimés (admin uniquement), ajouter `?includeDeleted=true`.

### 4. Migration des données existantes

Les documents existants n'ont pas les nouveaux champs. Ils auront des valeurs par défaut :
- `deletedAt`: `null` (actif)
- `favoritedBy`: `[]` (vide)
- `viewCount`: `0`
- `downloadCount`: `0`

Pas besoin de migration de données.

---

## 🐛 Dépannage

### Erreur : "Unknown field deletedAt"

**Solution :** Exécuter `npx prisma generate` après avoir mis à jour le schema.prisma.

### Erreur : Route /trash retourne un document au lieu de la liste

**Problème :** Route `/:id` est avant `/trash`.

**Solution :** Réorganiser les routes (voir section Ordre des routes ci-dessus).

### Erreur : "documentActivity is not a relation"

**Solution :** Vérifier que la relation `documentActivities` est bien ajoutée au modèle User dans schema.prisma.

### Les fichiers ne sont pas supprimés physiquement

**Normal :** Le soft delete ne supprime pas le fichier physique.

Pour supprimer physiquement :
1. Soft delete : `DELETE /documents/:id`
2. Puis suppression permanente : `DELETE /documents/:id/permanent`

OU utiliser l'endpoint `DELETE /documents/trash/empty` qui supprime définitivement les documents > 30 jours.

---

## ✅ Checklist finale

- [ ] Migration SQL exécutée
- [ ] Schema Prisma mis à jour
- [ ] `npx prisma generate` exécuté
- [ ] Schémas Zod ajoutés
- [ ] Méthodes du service ajoutées
- [ ] Méthodes du controller ajoutées
- [ ] Routes ajoutées dans le bon ordre
- [ ] Tests Postman/curl passent
- [ ] Soft delete fonctionne
- [ ] Corbeille fonctionne
- [ ] Favoris fonctionnent
- [ ] Liaison/Déliaison fonctionne
- [ ] Métadonnées modifiables

---

## 📚 Prochaines étapes

Une fois le backend intégré et testé, passer à l'intégration frontend :

1. Mettre à jour `src/services/api/documentService.ts` (frontend)
2. Créer les composants manquants (modals, sections contextuelles)
3. Mettre à jour DocumentsList avec les nouvelles fonctionnalités

Voir `FRONTEND_INTEGRATION_GUIDE.md` pour la suite.
