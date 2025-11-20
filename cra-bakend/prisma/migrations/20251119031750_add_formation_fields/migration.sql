-- AlterTable
ALTER TABLE "trainings" ADD COLUMN     "beneficiaries" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "diplomaObtained" TEXT,
ADD COLUMN     "level" TEXT,
ADD COLUMN     "period" TEXT,
ADD COLUMN     "specialty" TEXT,
ADD COLUMN     "studentName" TEXT;
