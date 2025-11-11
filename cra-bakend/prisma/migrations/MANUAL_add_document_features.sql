-- Migration: Ajout des fonctionnalités avancées pour les documents
-- Date: 2025-01-10
-- Description: Ajout du soft delete, favoris, tracking et expiration des partages

-- =============================================
-- 1. AJOUT DES CHAMPS AU MODÈLE DOCUMENT
-- =============================================

-- Soft delete
ALTER TABLE "documents" ADD COLUMN "deletedAt" TIMESTAMP;
ALTER TABLE "documents" ADD COLUMN "deletedBy" TEXT;

-- Favoris (array d'IDs utilisateurs)
ALTER TABLE "documents" ADD COLUMN "favoritedBy" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Tracking
ALTER TABLE "documents" ADD COLUMN "viewCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "documents" ADD COLUMN "downloadCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "documents" ADD COLUMN "lastViewedAt" TIMESTAMP;

-- Versioning (optionnel pour future feature)
ALTER TABLE "documents" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "documents" ADD COLUMN "previousVersionId" TEXT;

-- Créer un index pour les documents non supprimés (performance)
CREATE INDEX "documents_deletedAt_idx" ON "documents"("deletedAt");

-- Créer un index pour les favoris
CREATE INDEX "documents_favoritedBy_idx" ON "documents" USING GIN("favoritedBy");

-- =============================================
-- 2. AJOUT DES CHAMPS AU MODÈLE DOCUMENTSHARE
-- =============================================

-- Expiration et révocation des partages
ALTER TABLE "document_shares" ADD COLUMN "expiresAt" TIMESTAMP;
ALTER TABLE "document_shares" ADD COLUMN "revokedAt" TIMESTAMP;
ALTER TABLE "document_shares" ADD COLUMN "revokedBy" TEXT;

-- Index pour les partages actifs
CREATE INDEX "document_shares_active_idx" ON "document_shares"("revokedAt", "expiresAt");

-- =============================================
-- 3. CRÉATION TABLE DOCUMENT_ACTIVITIES (AUDIT)
-- =============================================

CREATE TABLE "document_activities" (
  "id" TEXT PRIMARY KEY,
  "documentId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "action" TEXT NOT NULL, -- 'view', 'download', 'share', 'edit', 'delete', 'restore', 'link', 'unlink'
  "metadata" JSONB, -- Données additionnelles sur l'action
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Foreign keys
  CONSTRAINT "document_activities_documentId_fkey"
    FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE,
  CONSTRAINT "document_activities_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Index pour les activités
CREATE INDEX "document_activities_documentId_idx" ON "document_activities"("documentId");
CREATE INDEX "document_activities_userId_idx" ON "document_activities"("userId");
CREATE INDEX "document_activities_action_idx" ON "document_activities"("action");
CREATE INDEX "document_activities_createdAt_idx" ON "document_activities"("createdAt" DESC);

-- =============================================
-- 4. CONTRAINTES ET VALIDATIONS
-- =============================================

-- Ajouter une contrainte pour s'assurer que la somme des pourcentages = 100
-- (Note: Ceci est juste un commentaire, la validation se fera côté application)

-- =============================================
-- 5. DONNÉES DE TEST (OPTIONNEL)
-- =============================================

-- Commenter ou supprimer en production
-- UPDATE "documents" SET "viewCount" = FLOOR(RANDOM() * 100) WHERE "deletedAt" IS NULL;
-- UPDATE "documents" SET "downloadCount" = FLOOR(RANDOM() * 50) WHERE "deletedAt" IS NULL;

-- =============================================
-- 6. MISE À JOUR DU SCHÉMA PRISMA
-- =============================================

-- Après avoir exécuté ce SQL, mettre à jour schema.prisma avec:
/*

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

  // NOUVEAUX CHAMPS - Soft delete
  deletedAt   DateTime?
  deletedBy   String?

  // NOUVEAUX CHAMPS - Favoris
  favoritedBy String[]     @default([])

  // NOUVEAUX CHAMPS - Tracking
  viewCount     Int        @default(0)
  downloadCount Int        @default(0)
  lastViewedAt  DateTime?

  // NOUVEAUX CHAMPS - Versioning (optionnel)
  version       Int        @default(1)
  previousVersionId String?

  // Relations existantes...
  owner       User         @relation(fields: [ownerId], references: [id])
  ownerId     String

  // ... (garder toutes les relations existantes)

  shares      DocumentShare[]
  activities  DocumentActivity[]

  @@index([deletedAt])
  @@index([favoritedBy])
  @@map("documents")
}

model DocumentShare {
  id         String   @id @default(cuid())
  canEdit    Boolean  @default(false)
  canDelete  Boolean  @default(false)
  sharedAt   DateTime @default(now())

  // NOUVEAUX CHAMPS
  expiresAt  DateTime?
  revokedAt  DateTime?
  revokedBy  String?

  // Relations
  document   Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  documentId String

  sharedWith User     @relation(fields: [sharedWithId], references: [id], onDelete: Cascade)
  sharedWithId String

  @@unique([documentId, sharedWithId])
  @@index([revokedAt, expiresAt])
  @@map("document_shares")
}

model DocumentActivity {
  id         String   @id @default(cuid())
  documentId String
  userId     String
  action     String   // 'view', 'download', 'share', 'edit', 'delete', 'restore', 'link', 'unlink'
  metadata   Json?
  createdAt  DateTime @default(now())

  document   Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([documentId])
  @@index([userId])
  @@index([action])
  @@index([createdAt(sort: Desc)])
  @@map("document_activities")
}

*/

-- =============================================
-- FIN DE LA MIGRATION
-- =============================================

-- Pour appliquer:
-- 1. Exécuter ce SQL sur la base de données
-- 2. Mettre à jour le schema.prisma avec les modifications ci-dessus
-- 3. Exécuter: npx prisma generate
-- 4. Vérifier: npx prisma studio
