-- DropForeignKey
ALTER TABLE "publication_authors" DROP CONSTRAINT "publication_authors_userId_fkey";

-- DropIndex
DROP INDEX "publication_authors_publicationId_userId_key";

-- AlterTable
ALTER TABLE "publication_authors" ADD COLUMN     "externalEmail" TEXT,
ADD COLUMN     "externalName" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "publication_authors" ADD CONSTRAINT "publication_authors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
