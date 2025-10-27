-- CreateTable
CREATE TABLE "project_fundings" (
    "id" TEXT NOT NULL,
    "fundingSource" TEXT NOT NULL,
    "fundingType" "FundingType" NOT NULL,
    "status" "FundingStatus" NOT NULL DEFAULT 'DEMANDE',
    "requestedAmount" DOUBLE PRECISION NOT NULL,
    "approvedAmount" DOUBLE PRECISION,
    "receivedAmount" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'XOF',
    "applicationDate" TIMESTAMP(3),
    "approvalDate" TIMESTAMP(3),
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "conditions" TEXT,
    "contractNumber" TEXT,
    "notes" TEXT,
    "projectId" TEXT NOT NULL,
    "conventionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_fundings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "project_fundings" ADD CONSTRAINT "project_fundings_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_fundings" ADD CONSTRAINT "project_fundings_conventionId_fkey" FOREIGN KEY ("conventionId") REFERENCES "conventions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
