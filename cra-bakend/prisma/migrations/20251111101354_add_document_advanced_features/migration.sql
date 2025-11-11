-- AlterTable
ALTER TABLE "document_shares" ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "revokedAt" TIMESTAMP(3),
ADD COLUMN     "revokedBy" TEXT;

-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" TEXT,
ADD COLUMN     "downloadCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "favoritedBy" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "lastViewedAt" TIMESTAMP(3),
ADD COLUMN     "previousVersionId" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "document_activities" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "document_activities_documentId_idx" ON "document_activities"("documentId");

-- CreateIndex
CREATE INDEX "document_activities_userId_idx" ON "document_activities"("userId");

-- CreateIndex
CREATE INDEX "document_activities_action_idx" ON "document_activities"("action");

-- CreateIndex
CREATE INDEX "document_activities_createdAt_idx" ON "document_activities"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "document_shares_revokedAt_expiresAt_idx" ON "document_shares"("revokedAt", "expiresAt");

-- CreateIndex
CREATE INDEX "documents_deletedAt_idx" ON "documents"("deletedAt");

-- CreateIndex
CREATE INDEX "documents_favoritedBy_idx" ON "documents"("favoritedBy");

-- AddForeignKey
ALTER TABLE "document_activities" ADD CONSTRAINT "document_activities_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_activities" ADD CONSTRAINT "document_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
