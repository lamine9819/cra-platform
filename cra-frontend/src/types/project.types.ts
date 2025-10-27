// src/types/project.types.ts

// =============================================
// ENUMS
// =============================================

export enum ProjectStatus {
  PLANIFIE = 'PLANIFIE',
  EN_COURS = 'EN_COURS',
  SUSPENDU = 'SUSPENDU',
  TERMINE = 'TERMINE',
  ARCHIVE = 'ARCHIVE',
}

export enum ResearchType {
  RECHERCHE_FONDAMENTALE = 'RECHERCHE_FONDAMENTALE',
  RECHERCHE_APPLIQUEE = 'RECHERCHE_APPLIQUEE',
  RECHERCHE_DEVELOPPEMENT = 'RECHERCHE_DEVELOPPEMENT',
  PRODUCTION_SEMENCES = 'PRODUCTION_SEMENCES',
}

export enum ParticipantRole {
  RESPONSABLE = 'RESPONSABLE',
  CO_RESPONSABLE = 'CO_RESPONSABLE',
  CHERCHEUR_PRINCIPAL = 'CHERCHEUR_PRINCIPAL',
  CHERCHEUR_ASSOCIE = 'CHERCHEUR_ASSOCIE',
  TECHNICIEN = 'TECHNICIEN',
  STAGIAIRE = 'STAGIAIRE',
  PARTENAIRE_EXTERNE = 'PARTENAIRE_EXTERNE',
  CONSULTANT = 'CONSULTANT',
}

export enum FundingType {
  SUBVENTION = 'SUBVENTION',
  CONTRAT = 'CONTRAT',
  PARTENARIAT = 'PARTENARIAT',
  BUDGET_INTERNE = 'BUDGET_INTERNE',
  COOPERATION_INTERNATIONALE = 'COOPERATION_INTERNATIONALE',
  SECTEUR_PRIVE = 'SECTEUR_PRIVE',
}

export enum FundingStatus {
  DEMANDE = 'DEMANDE',
  APPROUVE = 'APPROUVE',
  REJETE = 'REJETE',
  EN_COURS = 'EN_COURS',
  TERMINE = 'TERMINE',
  SUSPENDU = 'SUSPENDU',
}

// =============================================
// LABELS
// =============================================

export const ProjectStatusLabels: Record<ProjectStatus, string> = {
  [ProjectStatus.PLANIFIE]: 'Planifié',
  [ProjectStatus.EN_COURS]: 'En cours',
  [ProjectStatus.SUSPENDU]: 'Suspendu',
  [ProjectStatus.TERMINE]: 'Terminé',
  [ProjectStatus.ARCHIVE]: 'Archivé',
};

export const ProjectStatusColors: Record<ProjectStatus, string> = {
  [ProjectStatus.PLANIFIE]: 'bg-blue-100 text-blue-800',
  [ProjectStatus.EN_COURS]: 'bg-green-100 text-green-800',
  [ProjectStatus.SUSPENDU]: 'bg-orange-100 text-orange-800',
  [ProjectStatus.TERMINE]: 'bg-purple-100 text-purple-800',
  [ProjectStatus.ARCHIVE]: 'bg-gray-100 text-gray-800',
};

export const ResearchTypeLabels: Record<ResearchType, string> = {
  [ResearchType.RECHERCHE_FONDAMENTALE]: 'Recherche fondamentale',
  [ResearchType.RECHERCHE_APPLIQUEE]: 'Recherche appliquée',
  [ResearchType.RECHERCHE_DEVELOPPEMENT]: 'Recherche & développement',
  [ResearchType.PRODUCTION_SEMENCES]: 'Production de semences',
};

export const ParticipantRoleLabels: Record<ParticipantRole, string> = {
  [ParticipantRole.RESPONSABLE]: 'Responsable',
  [ParticipantRole.CO_RESPONSABLE]: 'Co-responsable',
  [ParticipantRole.CHERCHEUR_PRINCIPAL]: 'Chercheur principal',
  [ParticipantRole.CHERCHEUR_ASSOCIE]: 'Chercheur associé',
  [ParticipantRole.TECHNICIEN]: 'Technicien',
  [ParticipantRole.STAGIAIRE]: 'Stagiaire',
  [ParticipantRole.PARTENAIRE_EXTERNE]: 'Partenaire externe',
  [ParticipantRole.CONSULTANT]: 'Consultant',
};

export const FundingTypeLabels: Record<FundingType, string> = {
  [FundingType.SUBVENTION]: 'Subvention',
  [FundingType.CONTRAT]: 'Contrat',
  [FundingType.PARTENARIAT]: 'Partenariat',
  [FundingType.BUDGET_INTERNE]: 'Budget interne',
  [FundingType.COOPERATION_INTERNATIONALE]: 'Coopération internationale',
  [FundingType.SECTEUR_PRIVE]: 'Secteur privé',
};

export const FundingStatusLabels: Record<FundingStatus, string> = {
  [FundingStatus.DEMANDE]: 'En demande',
  [FundingStatus.APPROUVE]: 'Approuvé',
  [FundingStatus.REJETE]: 'Rejeté',
  [FundingStatus.EN_COURS]: 'En cours',
  [FundingStatus.TERMINE]: 'Terminé',
  [FundingStatus.SUSPENDU]: 'Suspendu',
};

export const FundingStatusColors: Record<FundingStatus, string> = {
  [FundingStatus.DEMANDE]: 'bg-yellow-100 text-yellow-800',
  [FundingStatus.APPROUVE]: 'bg-green-100 text-green-800',
  [FundingStatus.REJETE]: 'bg-red-100 text-red-800',
  [FundingStatus.EN_COURS]: 'bg-blue-100 text-blue-800',
  [FundingStatus.TERMINE]: 'bg-purple-100 text-purple-800',
  [FundingStatus.SUSPENDU]: 'bg-orange-100 text-orange-800',
};

// =============================================
// INTERFACES
// =============================================

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
}

export interface Theme {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export interface ResearchProgram {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export interface Convention {
  id: string;
  title: string;
  type: string;
  status: string;
}

export interface ProjectParticipant {
  id: string;
  role: ParticipantRole;
  timeAllocation?: number;
  responsibilities?: string;
  expertise?: string;
  isActive: boolean;
  joinedAt: string;
  user: User;
}

export interface Partner {
  id: string;
  name: string;
  type: string;
  expertise: string[];
  contactPerson?: string;
  email?: string;
  phone?: string;
}

export interface ProjectPartnership {
  id: string;
  partnerId: string;
  partnerType: string;
  contribution?: string;
  benefits?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  partner: Partner;
}

export interface ProjectFunding {
  id: string;
  fundingSource: string;
  fundingType: FundingType;
  status: FundingStatus;
  requestedAmount: number;
  approvedAmount?: number;
  receivedAmount?: number;
  currency: string;
  applicationDate?: string;
  approvalDate?: string;
  startDate?: string;
  endDate?: string;
  conditions?: string;
  contractNumber?: string;
  conventionId?: string;
}

export interface Project {
  id: string;
  code?: string;
  title: string;
  description?: string;
  objectives: string[];
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
  budget?: number;
  keywords: string[];

  // Champs CRA
  themeId: string;
  researchProgramId?: string;
  conventionId?: string;
  strategicPlan?: string;
  strategicAxis?: string;
  subAxis?: string;
  program?: string;
  researchType?: ResearchType;
  interventionRegion?: string;

  // Relations
  creator: User;
  theme: Theme;
  researchProgram?: ResearchProgram;
  convention?: Convention;
  participants?: ProjectParticipant[];
  partnerships?: ProjectPartnership[];
  fundings?: ProjectFunding[];

  // Métadonnées
  createdAt: string;
  updatedAt: string;

  // Compteurs
  _count?: {
    participants: number;
    activities: number;
    documents: number;
    partnerships: number;
    fundings: number;
  };
}

// =============================================
// REQUEST/RESPONSE TYPES
// =============================================

export interface CreateProjectRequest {
  title: string;
  description?: string;
  objectives: string[];
  status?: ProjectStatus;
  startDate?: string;
  endDate?: string;
  budget?: number;
  keywords?: string[];

  code?: string;
  themeId: string;
  researchProgramId?: string;
  conventionId?: string;
  strategicPlan?: string;
  strategicAxis?: string;
  subAxis?: string;
  program?: string;
  researchType?: ResearchType;
  interventionRegion?: string;
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
  status?: ProjectStatus;
}

export interface ProjectListQuery {
  page?: number;
  limit?: number;
  status?: ProjectStatus;
  search?: string;
  themeId?: string;
  researchProgramId?: string;
  conventionId?: string;
  researchType?: ResearchType;
  interventionRegion?: string;
  strategicAxis?: string;
  startDate?: string;
  endDate?: string;
}

export interface ProjectListResponse {
  projects: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AddParticipantRequest {
  userId: string;
  role: ParticipantRole;
  timeAllocation?: number;
  responsibilities?: string;
  expertise?: string;
}

export interface UpdateParticipantRequest {
  participantId: string;
  role?: ParticipantRole;
  timeAllocation?: number;
  responsibilities?: string;
  expertise?: string;
  isActive?: boolean;
}

export interface AddPartnershipRequest {
  partnerId: string;
  partnerType: string;
  contribution?: string;
  benefits?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdatePartnershipRequest {
  partnershipId: string;
  partnerType?: string;
  contribution?: string;
  benefits?: string;
  endDate?: string;
  isActive?: boolean;
}

export interface AddFundingRequest {
  fundingSource: string;
  fundingType: FundingType;
  requestedAmount: number;
  currency?: string;
  applicationDate?: string;
  startDate?: string;
  endDate?: string;
  conditions?: string;
  contractNumber?: string;
  conventionId?: string;
}

export interface UpdateFundingRequest {
  fundingId: string;
  status?: FundingStatus;
  approvedAmount?: number;
  receivedAmount?: number;
  approvalDate?: string;
  conditions?: string;
  notes?: string;
}

// =============================================
// STATISTICS & REPORTS
// =============================================

export interface ProjectStatistics {
  participants: {
    total: number;
    byRole: Record<string, number>;
    activeCount: number;
  };
  activities: {
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    completion: number;
  };
  budget: {
    allocated: number;
    approved: number;
    received: number;
    remaining: number;
  };
  timeline: {
    startDate: string | null;
    endDate: string | null;
    duration: number;
    progress: number;
  };
}

export interface ProjectReport {
  projectId: string;
  format: 'pdf' | 'word';
  sections: string[];
  downloadUrl: string;
}
