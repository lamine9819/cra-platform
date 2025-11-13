-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CHERCHEUR', 'COORDONATEUR_PROJET', 'ADMINISTRATEUR');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PLANIFIE', 'EN_COURS', 'SUSPENDU', 'TERMINE', 'ARCHIVE');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('RECHERCHE_EXPERIMENTALE', 'RECHERCHE_DEVELOPPEMENT', 'PRODUCTION_SEMENCES', 'FORMATION_DISPENSEE', 'FORMATION_RECUE', 'STAGE', 'ENCADREMENT', 'TRANSFERT_ACQUIS', 'SEMINAIRE', 'ATELIER', 'CONFERENCE', 'DEMONSTRATION', 'AUTRE');

-- CreateEnum
CREATE TYPE "ActivityStatus" AS ENUM ('PLANIFIEE', 'EN_COURS', 'SUSPENDUE', 'ANNULEE', 'RECONDUITE', 'CLOTUREE');

-- CreateEnum
CREATE TYPE "ActivityLifecycleStatus" AS ENUM ('NOUVELLE', 'RECONDUITE', 'CLOTUREE');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('A_FAIRE', 'EN_COURS', 'EN_REVISION', 'TERMINEE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('BASSE', 'NORMALE', 'HAUTE', 'URGENTE');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('RAPPORT', 'FICHE_ACTIVITE', 'FICHE_TECHNIQUE', 'FICHE_INDIVIDUELLE', 'DONNEES_EXPERIMENTALES', 'FORMULAIRE', 'PUBLICATION_SCIENTIFIQUE', 'MEMOIRE', 'THESE', 'IMAGE', 'PRESENTATION', 'AUTRE');

-- CreateEnum
CREATE TYPE "SeminarStatus" AS ENUM ('PLANIFIE', 'EN_COURS', 'TERMINE', 'ANNULE');

-- CreateEnum
CREATE TYPE "TrainingType" AS ENUM ('FORMATION_COURTE', 'FORMATION_DIPLOMANTE', 'STAGE_ADAPTATION', 'STAGE_RECHERCHE', 'ATELIER_TECHNIQUE', 'SEMINAIRE_FORMATION');

-- CreateEnum
CREATE TYPE "TransferType" AS ENUM ('FICHE_TECHNIQUE', 'DEMONSTRATION', 'FORMATION_PRODUCTEUR', 'VISITE_GUIDEE', 'EMISSION_RADIO', 'REPORTAGE_TV', 'PUBLICATION_VULGARISATION', 'SITE_WEB', 'RESEAUX_SOCIAUX');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('REUNION', 'SEMINAIRE', 'FORMATION', 'MISSION_TERRAIN', 'CONFERENCE', 'ATELIER', 'DEMONSTRATION', 'VISITE', 'SOUTENANCE', 'AUTRE');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('PLANIFIE', 'EN_COURS', 'TERMINE', 'ANNULE', 'REPORTE');

-- CreateEnum
CREATE TYPE "AuditLevel" AS ENUM ('INFO', 'WARNING', 'ERROR', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ParticipantRole" AS ENUM ('RESPONSABLE', 'CO_RESPONSABLE', 'CHERCHEUR_PRINCIPAL', 'CHERCHEUR_ASSOCIE', 'TECHNICIEN', 'STAGIAIRE', 'PARTENAIRE_EXTERNE', 'CONSULTANT');

-- CreateEnum
CREATE TYPE "FundingType" AS ENUM ('SUBVENTION', 'CONTRAT', 'PARTENARIAT', 'BUDGET_INTERNE', 'COOPERATION_INTERNATIONALE', 'SECTEUR_PRIVE');

-- CreateEnum
CREATE TYPE "FundingStatus" AS ENUM ('DEMANDE', 'APPROUVE', 'REJETE', 'EN_COURS', 'TERMINE', 'SUSPENDU');

-- CreateEnum
CREATE TYPE "PartnerType" AS ENUM ('UNIVERSITE', 'INSTITUT_RECHERCHE', 'ENTREPRISE_PRIVEE', 'ONG', 'ORGANISME_PUBLIC', 'ORGANISATION_INTERNATIONALE', 'COOPERATIVE', 'ASSOCIATION');

-- CreateEnum
CREATE TYPE "ConventionStatus" AS ENUM ('EN_NEGOCIATION', 'SIGNEE', 'EN_COURS', 'CLOTUREE', 'SUSPENDUE', 'RESILIEE');

-- CreateEnum
CREATE TYPE "ConventionType" AS ENUM ('BILATERALE', 'MULTILATERALE', 'PARTENARIAT_PUBLIC_PRIVE', 'COOPERATION_INTERNATIONALE', 'SOUS_TRAITANCE');

-- CreateEnum
CREATE TYPE "ShareType" AS ENUM ('INTERNAL', 'EXTERNAL');

-- CreateEnum
CREATE TYPE "CollectorType" AS ENUM ('USER', 'SHARED_USER', 'PUBLIC');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('PENDING', 'SYNCING', 'SYNCED', 'ERROR', 'RETRY');

-- CreateEnum
CREATE TYPE "PublicationType" AS ENUM ('ARTICLE_SCIENTIFIQUE', 'COMMUNICATION_CONFERENCE', 'CHAPITRE_LIVRE', 'LIVRE', 'RAPPORT_TECHNIQUE', 'FICHE_TECHNIQUE', 'MEMOIRE', 'THESE');

-- CreateEnum
CREATE TYPE "ObjectiveStatus" AS ENUM ('EN_ATTENTE', 'EN_COURS', 'TERMINE', 'ANNULE', 'REPORTE');

-- CreateTable
CREATE TABLE "strategic_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startYear" INTEGER NOT NULL,
    "endYear" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "strategic_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strategic_axes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "code" TEXT,
    "order" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "strategicPlanId" TEXT NOT NULL,

    CONSTRAINT "strategic_axes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strategic_sub_axes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "code" TEXT,
    "order" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "strategicAxisId" TEXT NOT NULL,

    CONSTRAINT "strategic_sub_axes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "research_programs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "code" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "strategicSubAxisId" TEXT NOT NULL,
    "coordinatorId" TEXT NOT NULL,

    CONSTRAINT "research_programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "research_themes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "objectives" TEXT[],
    "code" TEXT,
    "order" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "programId" TEXT NOT NULL,

    CONSTRAINT "research_themes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "research_stations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "surface" DOUBLE PRECISION,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "research_stations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conventions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "ConventionType" NOT NULL,
    "status" "ConventionStatus" NOT NULL DEFAULT 'EN_NEGOCIATION',
    "contractNumber" TEXT,
    "signatureDate" TIMESTAMP(3),
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "totalBudget" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'XOF',
    "documentPath" TEXT,
    "mainPartner" TEXT NOT NULL,
    "otherPartners" TEXT[],
    "responsibleUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conventions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "individual_profiles" (
    "id" TEXT NOT NULL,
    "matricule" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "classe" TEXT,
    "dateNaissance" TIMESTAMP(3) NOT NULL,
    "dateRecrutement" TIMESTAMP(3) NOT NULL,
    "localite" TEXT NOT NULL,
    "diplome" TEXT NOT NULL,
    "tempsRecherche" INTEGER NOT NULL DEFAULT 0,
    "tempsEnseignement" INTEGER NOT NULL DEFAULT 0,
    "tempsFormation" INTEGER NOT NULL DEFAULT 0,
    "tempsConsultation" INTEGER NOT NULL DEFAULT 0,
    "tempsGestionScientifique" INTEGER NOT NULL DEFAULT 0,
    "tempsAdministration" INTEGER NOT NULL DEFAULT 0,
    "isValidated" BOOLEAN NOT NULL DEFAULT false,
    "validatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "individual_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "individual_time_allocations" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "tempsRecherche" INTEGER NOT NULL DEFAULT 0,
    "tempsEnseignement" INTEGER NOT NULL DEFAULT 0,
    "tempsFormation" INTEGER NOT NULL DEFAULT 0,
    "tempsConsultation" INTEGER NOT NULL DEFAULT 0,
    "tempsGestionScientifique" INTEGER NOT NULL DEFAULT 0,
    "tempsAdministration" INTEGER NOT NULL DEFAULT 0,
    "isValidated" BOOLEAN NOT NULL DEFAULT false,
    "validatedAt" TIMESTAMP(3),
    "validatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "profileId" TEXT NOT NULL,

    CONSTRAINT "individual_time_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personnel_requests" (
    "id" TEXT NOT NULL,
    "postType" TEXT NOT NULL,
    "discipline" TEXT NOT NULL,
    "profile" TEXT NOT NULL,
    "diploma" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "competencies" TEXT[],
    "activities" TEXT[],
    "contractType" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "estimatedCost" DOUBLE PRECISION,
    "fundingSource" TEXT,
    "requestedDate" TIMESTAMP(3),
    "justification" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "comments" TEXT,
    "decidedAt" TIMESTAMP(3),
    "decidedBy" TEXT,
    "requestedById" TEXT NOT NULL,
    "center" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personnel_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scientific_indicators" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "publicationsCount" INTEGER NOT NULL DEFAULT 0,
    "articlesCount" INTEGER NOT NULL DEFAULT 0,
    "conferencesCount" INTEGER NOT NULL DEFAULT 0,
    "technicalReportsCount" INTEGER NOT NULL DEFAULT 0,
    "projectsLeadCount" INTEGER NOT NULL DEFAULT 0,
    "projectsParticipantCount" INTEGER NOT NULL DEFAULT 0,
    "totalFundingAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "masterSupervisionsCount" INTEGER NOT NULL DEFAULT 0,
    "phdSupervisionsCount" INTEGER NOT NULL DEFAULT 0,
    "trainingsGivenCount" INTEGER NOT NULL DEFAULT 0,
    "trainingsReceivedCount" INTEGER NOT NULL DEFAULT 0,
    "knowledgeTransfersCount" INTEGER NOT NULL DEFAULT 0,
    "demonstrationsCount" INTEGER NOT NULL DEFAULT 0,
    "mediaAppearancesCount" INTEGER NOT NULL DEFAULT 0,
    "partnershipsCount" INTEGER NOT NULL DEFAULT 0,
    "internationalCollabCount" INTEGER NOT NULL DEFAULT 0,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isValidated" BOOLEAN NOT NULL DEFAULT false,
    "validatedAt" TIMESTAMP(3),
    "validatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "scientific_indicators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publications" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "PublicationType" NOT NULL,
    "journal" TEXT,
    "isbn" TEXT,
    "doi" TEXT,
    "url" TEXT,
    "volume" TEXT,
    "issue" TEXT,
    "pages" TEXT,
    "publisher" TEXT,
    "impactFactor" DOUBLE PRECISION,
    "quartile" TEXT,
    "citationsCount" INTEGER NOT NULL DEFAULT 0,
    "isOpenAccess" BOOLEAN NOT NULL DEFAULT false,
    "submissionDate" TIMESTAMP(3),
    "acceptanceDate" TIMESTAMP(3),
    "publicationDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PUBLIE',
    "isInternational" BOOLEAN NOT NULL DEFAULT false,
    "language" TEXT NOT NULL DEFAULT 'fr',
    "abstract" TEXT,
    "keywords" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "documentId" TEXT,

    CONSTRAINT "publications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publication_authors" (
    "id" TEXT NOT NULL,
    "authorOrder" INTEGER NOT NULL,
    "isCorresponding" BOOLEAN NOT NULL DEFAULT false,
    "affiliation" TEXT,
    "publicationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "publication_authors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "research_objectives" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "startDate" TIMESTAMP(3),
    "deadline" TIMESTAMP(3),
    "status" "ObjectiveStatus" NOT NULL DEFAULT 'EN_COURS',
    "priority" "TaskPriority" NOT NULL DEFAULT 'NORMALE',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "targetValue" DOUBLE PRECISION,
    "currentValue" DOUBLE PRECISION,
    "unit" TEXT,
    "notes" TEXT,
    "milestones" TEXT[],
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "research_objectives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_evaluations" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "evaluationType" TEXT NOT NULL,
    "researchScore" DOUBLE PRECISION,
    "publicationScore" DOUBLE PRECISION,
    "collaborationScore" DOUBLE PRECISION,
    "innovationScore" DOUBLE PRECISION,
    "transferScore" DOUBLE PRECISION,
    "leadershipScore" DOUBLE PRECISION,
    "strengths" TEXT[],
    "areasForImprovement" TEXT[],
    "evaluatorComments" TEXT,
    "selfAssessmentComments" TEXT,
    "nextPeriodGoals" TEXT[],
    "isFinalized" BOOLEAN NOT NULL DEFAULT false,
    "finalizedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "evaluatedUserId" TEXT NOT NULL,
    "evaluatorId" TEXT,

    CONSTRAINT "performance_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "profileImage" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "dateOfHire" TIMESTAMP(3),
    "phoneNumber" TEXT,
    "diploma" TEXT,
    "specialization" TEXT,
    "department" TEXT,
    "discipline" TEXT,
    "orcidId" TEXT,
    "researchGateId" TEXT,
    "googleScholarId" TEXT,
    "linkedinId" TEXT,
    "notificationPrefs" JSONB,
    "dashboardConfig" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "supervisorId" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partners" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PartnerType" NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "contactPerson" TEXT,
    "contactTitle" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "expertise" TEXT[],
    "services" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "objectives" TEXT[],
    "status" "ProjectStatus" NOT NULL DEFAULT 'PLANIFIE',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "budget" DOUBLE PRECISION,
    "keywords" TEXT[],
    "strategicPlan" TEXT,
    "strategicAxis" TEXT,
    "subAxis" TEXT,
    "program" TEXT,
    "researchProgramId" TEXT,
    "conventionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creatorId" TEXT NOT NULL,
    "themeId" TEXT NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_participants" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "project_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_partners" (
    "id" TEXT NOT NULL,
    "partnerType" TEXT NOT NULL,
    "contribution" TEXT,
    "benefits" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "projectId" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "code" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "ActivityType" NOT NULL DEFAULT 'RECHERCHE_EXPERIMENTALE',
    "objectives" TEXT[],
    "methodology" TEXT,
    "location" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "results" TEXT,
    "conclusions" TEXT,
    "interventionRegion" TEXT,
    "strategicPlan" TEXT,
    "strategicAxis" TEXT,
    "subAxis" TEXT,
    "lifecycleStatus" "ActivityLifecycleStatus" NOT NULL DEFAULT 'NOUVELLE',
    "researchType" TEXT,
    "status" "ActivityStatus" NOT NULL DEFAULT 'PLANIFIEE',
    "priority" "TaskPriority" NOT NULL DEFAULT 'NORMALE',
    "isRecurrent" BOOLEAN NOT NULL DEFAULT false,
    "parentActivityId" TEXT,
    "recurrenceReason" TEXT,
    "recurrenceNotes" TEXT,
    "recurrenceCount" INTEGER NOT NULL DEFAULT 0,
    "originalStartDate" TIMESTAMP(3),
    "justifications" TEXT,
    "constraints" TEXT[],
    "expectedResults" TEXT[],
    "transferMethods" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT,
    "themeId" TEXT NOT NULL,
    "stationId" TEXT,
    "conventionId" TEXT,
    "responsibleId" TEXT NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_participants" (
    "id" TEXT NOT NULL,
    "role" "ParticipantRole" NOT NULL,
    "timeAllocation" INTEGER,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "responsibilities" TEXT,
    "expertise" TEXT,
    "activityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activity_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_partners" (
    "id" TEXT NOT NULL,
    "partnerType" TEXT NOT NULL,
    "contribution" TEXT,
    "benefits" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "activityId" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activity_partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_fundings" (
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
    "reportingReqs" TEXT[],
    "restrictions" TEXT[],
    "contractNumber" TEXT,
    "contactPerson" TEXT,
    "contactEmail" TEXT,
    "notes" TEXT,
    "activityId" TEXT NOT NULL,
    "conventionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activity_fundings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_recurrences" (
    "id" TEXT NOT NULL,
    "sourceActivityId" TEXT NOT NULL,
    "newActivityId" TEXT NOT NULL,
    "recurrenceType" TEXT NOT NULL,
    "reason" TEXT,
    "modifications" TEXT[],
    "budgetChanges" TEXT,
    "teamChanges" TEXT,
    "scopeChanges" TEXT,
    "decisionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvalDate" TIMESTAMP(3),
    "approvedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activity_recurrences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'A_FAIRE',
    "priority" "TaskPriority" NOT NULL DEFAULT 'NORMALE',
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "progress" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creatorId" TEXT NOT NULL,
    "assigneeId" TEXT,
    "projectId" TEXT,
    "activityId" TEXT,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "filepath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" BIGINT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "description" TEXT,
    "tags" TEXT[],
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,
    "projectId" TEXT,
    "activityId" TEXT,
    "taskId" TEXT,
    "seminarId" TEXT,
    "trainingId" TEXT,
    "internshipId" TEXT,
    "supervisionId" TEXT,
    "knowledgeTransferId" TEXT,
    "eventId" TEXT,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_shares" (
    "id" TEXT NOT NULL,
    "canEdit" BOOLEAN NOT NULL DEFAULT false,
    "canDelete" BOOLEAN NOT NULL DEFAULT false,
    "sharedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "documentId" TEXT NOT NULL,
    "sharedWithId" TEXT NOT NULL,

    CONSTRAINT "document_shares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forms" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "schema" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "shareToken" TEXT,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "allowMultipleSubmissions" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creatorId" TEXT NOT NULL,
    "activityId" TEXT,

    CONSTRAINT "forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_shares" (
    "id" TEXT NOT NULL,
    "shareType" "ShareType" NOT NULL,
    "shareToken" TEXT,
    "canCollect" BOOLEAN NOT NULL DEFAULT true,
    "canExport" BOOLEAN NOT NULL DEFAULT false,
    "maxSubmissions" INTEGER,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastAccessed" TIMESTAMP(3),
    "formId" TEXT NOT NULL,
    "sharedWithId" TEXT,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "form_shares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_responses" (
    "id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isOffline" BOOLEAN NOT NULL DEFAULT false,
    "syncedAt" TIMESTAMP(3),
    "collectorType" "CollectorType" NOT NULL DEFAULT 'USER',
    "collectorInfo" JSONB,
    "formId" TEXT NOT NULL,
    "respondentId" TEXT,

    CONSTRAINT "form_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "response_photos" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT,
    "filepath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" BIGINT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "fieldId" TEXT NOT NULL,
    "caption" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "takenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responseId" TEXT NOT NULL,

    CONSTRAINT "response_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offline_sync" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "status" "SyncStatus" NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "syncedAt" TIMESTAMP(3),

    CONSTRAINT "offline_sync_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trainings" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "TrainingType" NOT NULL,
    "location" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "duration" INTEGER,
    "objectives" TEXT[],
    "maxParticipants" INTEGER,
    "isInternal" BOOLEAN NOT NULL DEFAULT true,
    "organizer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "activityId" TEXT,

    CONSTRAINT "trainings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_participants" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attendedAt" TIMESTAMP(3),
    "certificate" BOOLEAN NOT NULL DEFAULT false,
    "evaluation" DOUBLE PRECISION,
    "trainingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "training_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "internships" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "institution" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "objectives" TEXT[],
    "results" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "activityId" TEXT,
    "supervisorId" TEXT NOT NULL,
    "internId" TEXT NOT NULL,

    CONSTRAINT "internships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supervisions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "university" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "abstract" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "activityId" TEXT,
    "supervisorId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,

    CONSTRAINT "supervisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_transfers" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "TransferType" NOT NULL,
    "targetAudience" TEXT[],
    "location" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "participants" INTEGER,
    "impact" TEXT,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "activityId" TEXT,
    "organizerId" TEXT NOT NULL,

    CONSTRAINT "knowledge_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendar_events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "EventType" NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'PLANIFIE',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "location" TEXT,
    "isAllDay" BOOLEAN NOT NULL DEFAULT false,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrenceRule" TEXT,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creatorId" TEXT NOT NULL,
    "stationId" TEXT,
    "projectId" TEXT,
    "activityId" TEXT,

    CONSTRAINT "calendar_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_participants" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'INVITED',
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "eventId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,

    CONSTRAINT "event_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seminars" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" "SeminarStatus" NOT NULL DEFAULT 'PLANIFIE',
    "agenda" TEXT,
    "maxParticipants" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizerId" TEXT NOT NULL,
    "calendarEventId" TEXT,

    CONSTRAINT "seminars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seminar_participants" (
    "id" TEXT NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attendedAt" TIMESTAMP(3),
    "seminarId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,

    CONSTRAINT "seminar_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT NOT NULL,
    "projectId" TEXT,
    "activityId" TEXT,
    "taskId" TEXT,
    "formId" TEXT,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "readAt" TIMESTAMP(3),
    "actionUrl" TEXT,
    "senderId" TEXT,
    "receiverId" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "level" "AuditLevel" NOT NULL DEFAULT 'INFO',
    "userId" TEXT,
    "entityType" TEXT,
    "entityId" TEXT,
    "details" JSONB,
    "metadata" JSONB,
    "changes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProjectPublications" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProjectPublications_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ProjectObjectives" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProjectObjectives_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ActivityPublications" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ActivityPublications_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ActivityObjectives" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ActivityObjectives_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "strategic_plans_name_key" ON "strategic_plans"("name");

-- CreateIndex
CREATE UNIQUE INDEX "strategic_axes_strategicPlanId_name_key" ON "strategic_axes"("strategicPlanId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "strategic_sub_axes_strategicAxisId_name_key" ON "strategic_sub_axes"("strategicAxisId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "research_programs_code_key" ON "research_programs"("code");

-- CreateIndex
CREATE UNIQUE INDEX "research_themes_code_key" ON "research_themes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "research_themes_programId_name_key" ON "research_themes"("programId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "research_stations_name_key" ON "research_stations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "conventions_contractNumber_key" ON "conventions"("contractNumber");

-- CreateIndex
CREATE UNIQUE INDEX "individual_profiles_matricule_key" ON "individual_profiles"("matricule");

-- CreateIndex
CREATE UNIQUE INDEX "individual_profiles_userId_key" ON "individual_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "individual_time_allocations_profileId_year_key" ON "individual_time_allocations"("profileId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "scientific_indicators_userId_year_key" ON "scientific_indicators"("userId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "publications_documentId_key" ON "publications"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "publication_authors_publicationId_userId_key" ON "publication_authors"("publicationId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "performance_evaluations_evaluatedUserId_year_evaluationType_key" ON "performance_evaluations"("evaluatedUserId", "year", "evaluationType");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "projects_code_key" ON "projects"("code");

-- CreateIndex
CREATE UNIQUE INDEX "project_participants_projectId_userId_key" ON "project_participants"("projectId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "project_partners_projectId_partnerId_key" ON "project_partners"("projectId", "partnerId");

-- CreateIndex
CREATE UNIQUE INDEX "activities_code_key" ON "activities"("code");

-- CreateIndex
CREATE UNIQUE INDEX "activity_participants_activityId_userId_key" ON "activity_participants"("activityId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "activity_partners_activityId_partnerId_key" ON "activity_partners"("activityId", "partnerId");

-- CreateIndex
CREATE UNIQUE INDEX "activity_recurrences_sourceActivityId_newActivityId_key" ON "activity_recurrences"("sourceActivityId", "newActivityId");

-- CreateIndex
CREATE UNIQUE INDEX "document_shares_documentId_sharedWithId_key" ON "document_shares"("documentId", "sharedWithId");

-- CreateIndex
CREATE UNIQUE INDEX "forms_shareToken_key" ON "forms"("shareToken");

-- CreateIndex
CREATE UNIQUE INDEX "form_shares_shareToken_key" ON "form_shares"("shareToken");

-- CreateIndex
CREATE UNIQUE INDEX "training_participants_trainingId_userId_key" ON "training_participants"("trainingId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "event_participants_eventId_participantId_key" ON "event_participants"("eventId", "participantId");

-- CreateIndex
CREATE UNIQUE INDEX "seminars_calendarEventId_key" ON "seminars"("calendarEventId");

-- CreateIndex
CREATE UNIQUE INDEX "seminar_participants_seminarId_participantId_key" ON "seminar_participants"("seminarId", "participantId");

-- CreateIndex
CREATE INDEX "_ProjectPublications_B_index" ON "_ProjectPublications"("B");

-- CreateIndex
CREATE INDEX "_ProjectObjectives_B_index" ON "_ProjectObjectives"("B");

-- CreateIndex
CREATE INDEX "_ActivityPublications_B_index" ON "_ActivityPublications"("B");

-- CreateIndex
CREATE INDEX "_ActivityObjectives_B_index" ON "_ActivityObjectives"("B");

-- AddForeignKey
ALTER TABLE "strategic_axes" ADD CONSTRAINT "strategic_axes_strategicPlanId_fkey" FOREIGN KEY ("strategicPlanId") REFERENCES "strategic_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strategic_sub_axes" ADD CONSTRAINT "strategic_sub_axes_strategicAxisId_fkey" FOREIGN KEY ("strategicAxisId") REFERENCES "strategic_axes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_programs" ADD CONSTRAINT "research_programs_strategicSubAxisId_fkey" FOREIGN KEY ("strategicSubAxisId") REFERENCES "strategic_sub_axes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_programs" ADD CONSTRAINT "research_programs_coordinatorId_fkey" FOREIGN KEY ("coordinatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_themes" ADD CONSTRAINT "research_themes_programId_fkey" FOREIGN KEY ("programId") REFERENCES "research_programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conventions" ADD CONSTRAINT "conventions_responsibleUserId_fkey" FOREIGN KEY ("responsibleUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "individual_profiles" ADD CONSTRAINT "individual_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "individual_time_allocations" ADD CONSTRAINT "individual_time_allocations_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "individual_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personnel_requests" ADD CONSTRAINT "personnel_requests_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scientific_indicators" ADD CONSTRAINT "scientific_indicators_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publications" ADD CONSTRAINT "publications_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publication_authors" ADD CONSTRAINT "publication_authors_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "publications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publication_authors" ADD CONSTRAINT "publication_authors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_objectives" ADD CONSTRAINT "research_objectives_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_evaluations" ADD CONSTRAINT "performance_evaluations_evaluatedUserId_fkey" FOREIGN KEY ("evaluatedUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_evaluations" ADD CONSTRAINT "performance_evaluations_evaluatorId_fkey" FOREIGN KEY ("evaluatorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_researchProgramId_fkey" FOREIGN KEY ("researchProgramId") REFERENCES "research_programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_conventionId_fkey" FOREIGN KEY ("conventionId") REFERENCES "conventions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "research_themes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_participants" ADD CONSTRAINT "project_participants_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_participants" ADD CONSTRAINT "project_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_partners" ADD CONSTRAINT "project_partners_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_partners" ADD CONSTRAINT "project_partners_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_parentActivityId_fkey" FOREIGN KEY ("parentActivityId") REFERENCES "activities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "research_themes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "research_stations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_conventionId_fkey" FOREIGN KEY ("conventionId") REFERENCES "conventions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_participants" ADD CONSTRAINT "activity_participants_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_participants" ADD CONSTRAINT "activity_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_partners" ADD CONSTRAINT "activity_partners_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_partners" ADD CONSTRAINT "activity_partners_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_fundings" ADD CONSTRAINT "activity_fundings_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_fundings" ADD CONSTRAINT "activity_fundings_conventionId_fkey" FOREIGN KEY ("conventionId") REFERENCES "conventions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_recurrences" ADD CONSTRAINT "activity_recurrences_sourceActivityId_fkey" FOREIGN KEY ("sourceActivityId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_recurrences" ADD CONSTRAINT "activity_recurrences_newActivityId_fkey" FOREIGN KEY ("newActivityId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_seminarId_fkey" FOREIGN KEY ("seminarId") REFERENCES "seminars"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_trainingId_fkey" FOREIGN KEY ("trainingId") REFERENCES "trainings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_internshipId_fkey" FOREIGN KEY ("internshipId") REFERENCES "internships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_supervisionId_fkey" FOREIGN KEY ("supervisionId") REFERENCES "supervisions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_knowledgeTransferId_fkey" FOREIGN KEY ("knowledgeTransferId") REFERENCES "knowledge_transfers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "calendar_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_shares" ADD CONSTRAINT "document_shares_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_shares" ADD CONSTRAINT "document_shares_sharedWithId_fkey" FOREIGN KEY ("sharedWithId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forms" ADD CONSTRAINT "forms_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forms" ADD CONSTRAINT "forms_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_shares" ADD CONSTRAINT "form_shares_formId_fkey" FOREIGN KEY ("formId") REFERENCES "forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_shares" ADD CONSTRAINT "form_shares_sharedWithId_fkey" FOREIGN KEY ("sharedWithId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_shares" ADD CONSTRAINT "form_shares_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_responses" ADD CONSTRAINT "form_responses_formId_fkey" FOREIGN KEY ("formId") REFERENCES "forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_responses" ADD CONSTRAINT "form_responses_respondentId_fkey" FOREIGN KEY ("respondentId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response_photos" ADD CONSTRAINT "response_photos_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "form_responses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainings" ADD CONSTRAINT "trainings_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_participants" ADD CONSTRAINT "training_participants_trainingId_fkey" FOREIGN KEY ("trainingId") REFERENCES "trainings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_participants" ADD CONSTRAINT "training_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internships" ADD CONSTRAINT "internships_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internships" ADD CONSTRAINT "internships_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internships" ADD CONSTRAINT "internships_internId_fkey" FOREIGN KEY ("internId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supervisions" ADD CONSTRAINT "supervisions_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supervisions" ADD CONSTRAINT "supervisions_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supervisions" ADD CONSTRAINT "supervisions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_transfers" ADD CONSTRAINT "knowledge_transfers_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_transfers" ADD CONSTRAINT "knowledge_transfers_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "research_stations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "calendar_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seminars" ADD CONSTRAINT "seminars_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seminars" ADD CONSTRAINT "seminars_calendarEventId_fkey" FOREIGN KEY ("calendarEventId") REFERENCES "calendar_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seminar_participants" ADD CONSTRAINT "seminar_participants_seminarId_fkey" FOREIGN KEY ("seminarId") REFERENCES "seminars"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seminar_participants" ADD CONSTRAINT "seminar_participants_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_formId_fkey" FOREIGN KEY ("formId") REFERENCES "forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectPublications" ADD CONSTRAINT "_ProjectPublications_A_fkey" FOREIGN KEY ("A") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectPublications" ADD CONSTRAINT "_ProjectPublications_B_fkey" FOREIGN KEY ("B") REFERENCES "publications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectObjectives" ADD CONSTRAINT "_ProjectObjectives_A_fkey" FOREIGN KEY ("A") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectObjectives" ADD CONSTRAINT "_ProjectObjectives_B_fkey" FOREIGN KEY ("B") REFERENCES "research_objectives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActivityPublications" ADD CONSTRAINT "_ActivityPublications_A_fkey" FOREIGN KEY ("A") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActivityPublications" ADD CONSTRAINT "_ActivityPublications_B_fkey" FOREIGN KEY ("B") REFERENCES "publications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActivityObjectives" ADD CONSTRAINT "_ActivityObjectives_A_fkey" FOREIGN KEY ("A") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActivityObjectives" ADD CONSTRAINT "_ActivityObjectives_B_fkey" FOREIGN KEY ("B") REFERENCES "research_objectives"("id") ON DELETE CASCADE ON UPDATE CASCADE;
