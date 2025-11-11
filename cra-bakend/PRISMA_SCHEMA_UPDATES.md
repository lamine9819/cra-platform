# Modifications du schéma Prisma pour les Documents

## Instructions

Après avoir exécuté la migration SQL (`migrations/MANUAL_add_document_features.sql`), remplacer les modèles Document et DocumentShare dans `schema.prisma` par ceux ci-dessous :

## 1. Modèle Document (ligne ~1307)

```prisma
model Document {
  id          String       @id @default(cuid())
  title       String
  filename    String
  filepath    String
  mimeType    String
  size        BigInt
  type        DocumentType
  description String?
  tags        String[]
  isPublic    Boolean      @default(false)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  // =============================================
  // NOUVEAUX CHAMPS - Soft delete
  // =============================================
  deletedAt   DateTime?    // null = actif, date = supprimé
  deletedBy   String?      // ID de l'utilisateur qui a supprimé

  // =============================================
  // NOUVEAUX CHAMPS - Favoris
  // =============================================
  favoritedBy String[]     @default([])  // Array d'IDs utilisateurs

  // =============================================
  // NOUVEAUX CHAMPS - Tracking
  // =============================================
  viewCount     Int        @default(0)
  downloadCount Int        @default(0)
  lastViewedAt  DateTime?

  // =============================================
  // NOUVEAUX CHAMPS - Versioning (optionnel)
  // =============================================
  version       Int        @default(1)
  previousVersionId String?

  // =============================================
  // RELATIONS EXISTANTES (NE PAS MODIFIER)
  // =============================================
  owner       User         @relation(fields: [ownerId], references: [id])
  ownerId     String

  project     Project?     @relation(fields: [projectId], references: [id], onDelete: Cascade)
  projectId   String?

  activity    Activity?    @relation(fields: [activityId], references: [id], onDelete: Cascade)
  activityId  String?

  task        Task?        @relation(fields: [taskId], references: [id], onDelete: Cascade)
  taskId      String?

  seminar     Seminar?     @relation(fields: [seminarId], references: [id], onDelete: Cascade)
  seminarId   String?

  training    Training?    @relation(fields: [trainingId], references: [id], onDelete: Cascade)
  trainingId  String?

  internship  Internship?  @relation(fields: [internshipId], references: [id], onDelete: Cascade)
  internshipId String?

  supervision Supervision? @relation(fields: [supervisionId], references: [id], onDelete: Cascade)
  supervisionId String?

  knowledgeTransfer KnowledgeTransfer? @relation(fields: [knowledgeTransferId], references: [id], onDelete: Cascade)
  knowledgeTransferId String?

  event       CalendarEvent? @relation(fields: [eventId], references: [id], onDelete: Cascade)
  eventId     String?

  publication Publication?

  // =============================================
  // NOUVELLES RELATIONS
  // =============================================
  shares      DocumentShare[]
  activities  DocumentActivity[]  // NOUVELLE RELATION

  // =============================================
  // INDEX
  // =============================================
  @@index([deletedAt])
  @@index([favoritedBy])
  @@map("documents")
}
```

## 2. Modèle DocumentShare (ligne ~1363)

```prisma
model DocumentShare {
  id         String   @id @default(cuid())
  canEdit    Boolean  @default(false)
  canDelete  Boolean  @default(false)
  sharedAt   DateTime @default(now())

  // =============================================
  // NOUVEAUX CHAMPS
  // =============================================
  expiresAt  DateTime?  // Date d'expiration du partage
  revokedAt  DateTime?  // Date de révocation (si révoqué)
  revokedBy  String?    // ID de qui a révoqué

  // Relations
  document   Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  documentId String

  sharedWith User     @relation(fields: [sharedWithId], references: [id], onDelete: Cascade)
  sharedWithId String

  @@unique([documentId, sharedWithId])
  @@index([revokedAt, expiresAt])
  @@map("document_shares")
}
```

## 3. NOUVEAU Modèle DocumentActivity (ajouter après DocumentShare)

```prisma
// =============================================
// AUDIT / TRACKING DES DOCUMENTS
// =============================================

model DocumentActivity {
  id         String   @id @default(cuid())
  documentId String
  userId     String
  action     String   // 'view', 'download', 'share', 'edit', 'delete', 'restore', 'link', 'unlink'
  metadata   Json?    // Données additionnelles sur l'action
  createdAt  DateTime @default(now())

  // Relations
  document   Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([documentId])
  @@index([userId])
  @@index([action])
  @@index([createdAt(sort: Desc)])
  @@map("document_activities")
}
```

## 4. Mise à jour du modèle User

Dans le modèle User, ajouter la relation avec DocumentActivity :

```prisma
model User {
  // ... champs existants ...

  // Relations existantes
  documents        Document[]
  documentShares   DocumentShare[]

  // NOUVELLE RELATION
  documentActivities DocumentActivity[]

  // ... autres relations ...
}
```

## Commandes à exécuter

```bash
# 1. Appliquer le SQL manuellement
psql -d votre_database -f prisma/migrations/MANUAL_add_document_features.sql

# 2. Mettre à jour schema.prisma avec les modifications ci-dessus

# 3. Générer le client Prisma
npx prisma generate

# 4. (Optionnel) Créer une vraie migration Prisma
npx prisma migrate dev --name add_document_advanced_features

# 5. Vérifier dans Prisma Studio
npx prisma studio
```

## Notes importantes

1. **Backup** : Faire un backup de la base de données avant d'appliquer la migration
2. **Tests** : Tester sur environnement de dev avant la production
3. **Index** : Les index ont été ajoutés pour optimiser les performances
4. **Tracking** : Le tracking est optionnel, peut être désactivé si non nécessaire
5. **Favoris** : Utilise un array PostgreSQL pour stocker les IDs utilisateurs

## Rollback

Si besoin de revenir en arrière :

```sql
-- Supprimer la table d'activités
DROP TABLE IF EXISTS "document_activities";

-- Supprimer les colonnes ajoutées
ALTER TABLE "documents" DROP COLUMN IF EXISTS "deletedAt";
ALTER TABLE "documents" DROP COLUMN IF EXISTS "deletedBy";
ALTER TABLE "documents" DROP COLUMN IF EXISTS "favoritedBy";
ALTER TABLE "documents" DROP COLUMN IF EXISTS "viewCount";
ALTER TABLE "documents" DROP COLUMN IF EXISTS "downloadCount";
ALTER TABLE "documents" DROP COLUMN IF EXISTS "lastViewedAt";
ALTER TABLE "documents" DROP COLUMN IF EXISTS "version";
ALTER TABLE "documents" DROP COLUMN IF EXISTS "previousVersionId";

ALTER TABLE "document_shares" DROP COLUMN IF EXISTS "expiresAt";
ALTER TABLE "document_shares" DROP COLUMN IF EXISTS "revokedAt";
ALTER TABLE "document_shares" DROP COLUMN IF EXISTS "revokedBy";
```
