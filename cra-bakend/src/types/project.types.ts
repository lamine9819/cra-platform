// =============================================
// TYPES POUR LA GESTION DES PROJETS - CRA ADAPTÉ
// =============================================

// src/types/project.types.ts

export interface CreateProjectRequest {
  title: string;
  description?: string;
  objectives: string[];
  status?: 'PLANIFIE' | 'EN_COURS' | 'SUSPENDU' | 'TERMINE' | 'ARCHIVE';
  startDate?: string;
  endDate?: string;
  budget?: number;
  keywords: string[];

  // NOUVEAUX CHAMPS SPÉCIFIQUES CRA
  code?: string; // Code unique du projet
  themeId: string; // OBLIGATOIRE - Lien avec thème de recherche
  researchProgramId?: string; // Lien avec programme de recherche
  conventionId?: string; // Lien avec convention si applicable

  // Cadrage stratégique (optionnel mais recommandé)
  strategicPlan?: string;
  strategicAxis?: string;
  subAxis?: string;
  program?: string;

  // Classification du projet
  researchType?: 'RECHERCHE_FONDAMENTALE' | 'RECHERCHE_APPLIQUEE' | 'RECHERCHE_DEVELOPPEMENT' | 'PRODUCTION_SEMENCES';
  interventionRegion?: string; // Région d'intervention
}

export interface UpdateProjectRequest {
  title?: string;
  description?: string;
  objectives?: string[];
  status?: 'PLANIFIE' | 'EN_COURS' | 'SUSPENDU' | 'TERMINE' | 'ARCHIVE';
  startDate?: string;
  endDate?: string;
  budget?: number;
  keywords?: string[];
  
  // NOUVEAUX CHAMPS CRA
  themeId?: string;
  researchProgramId?: string;
  conventionId?: string;
  strategicPlan?: string;
  strategicAxis?: string;
  subAxis?: string;
  program?: string;
  researchType?: 'RECHERCHE_FONDAMENTALE' | 'RECHERCHE_APPLIQUEE' | 'RECHERCHE_DEVELOPPEMENT' | 'PRODUCTION_SEMENCES';
  interventionRegion?: string;
}

export interface ProjectListQuery {
  page?: number;
  limit?: number;
  status?: 'PLANIFIE' | 'EN_COURS' | 'SUSPENDU' | 'TERMINE' | 'ARCHIVE';
  creatorId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  
  // NOUVEAUX FILTRES CRA
  themeId?: string; // Filtrer par thème
  researchProgramId?: string; // Filtrer par programme
  conventionId?: string; // Filtrer par convention
  researchType?: string; // Filtrer par type de recherche
  interventionRegion?: string; // Filtrer par région
  strategicAxis?: string; // Filtrer par axe stratégique
}

export interface AddParticipantRequest {
  userId: string;
  role: 'RESPONSABLE' | 'CO_RESPONSABLE' | 'CHERCHEUR_PRINCIPAL' | 'CHERCHEUR_ASSOCIE' | 'TECHNICIEN' | 'STAGIAIRE' | 'PARTENAIRE_EXTERNE' | 'CONSULTANT';
  timeAllocation?: number; // Pourcentage de temps alloué (0-100)
  responsibilities?: string; // Responsabilités spécifiques
  expertise?: string; // Domaine d'expertise apporté
}

export interface UpdateParticipantRequest {
  participantId: string;
  role?: 'RESPONSABLE' | 'CO_RESPONSABLE' | 'CHERCHEUR_PRINCIPAL' | 'CHERCHEUR_ASSOCIE' | 'TECHNICIEN' | 'STAGIAIRE' | 'PARTENAIRE_EXTERNE' | 'CONSULTANT';
  timeAllocation?: number;
  responsibilities?: string;
  expertise?: string;
  isActive?: boolean;
}

export interface ProjectResponse {
  id: string;
  code?: string;
  title: string;
  description?: string;
  objectives: string[];
  status: string;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  keywords: string[];
  createdAt: Date;
  updatedAt: Date;
  
  // NOUVEAUX CHAMPS CRA
  researchType?: string;
  interventionRegion?: string;
  strategicPlan?: string;
  strategicAxis?: string;
  subAxis?: string;
  program?: string;
  
  // Relations enrichies
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    specialization?: string;
  };
  
  theme: {
    id: string;
    name: string;
    code?: string;
    description?: string;
  };
  
  researchProgram?: {
    id: string;
    name: string;
    code?: string;
    description?: string;
  };
  
  convention?: {
    id: string;
    title: string;
    type: string;
    status: string;
    contractNumber?: string;
  };
  
  participants?: {
    id: string;
    role: string;
    timeAllocation?: number;
    responsibilities?: string;
    expertise?: string;
    joinedAt: Date;
    isActive: boolean;
    userId: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
      specialization?: string;
      discipline?: string;
    };
  }[];
  
  activities?: {
    id: string;
    code?: string;
    title: string;
    description?: string;
    type: string;
    status: string;
    startDate?: Date;
    endDate?: Date;
    createdAt: Date;
  }[];
  
  partnerships?: {
    id: string;
    partnerType: string;
    contribution?: string;
    isActive: boolean;
    partner: {
      id: string;
      name: string;
      type: string;
      category?: string;
    };
  }[];
  
  fundings?: {
    id: string;
    fundingSource: string;
    fundingType: string;
    status: string;
    requestedAmount: number;
    approvedAmount?: number;
    receivedAmount?: number;
    currency: string;
    contractNumber?: string;
    conditions?: string;
  }[];
  
  _count?: {
    participants: number;
    activities: number;
    tasks: number;
    documents: number;
    partnerships: number;
  };
}

// NOUVELLES INTERFACES POUR LES PARTENARIATS
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

// NOUVELLES INTERFACES POUR LE FINANCEMENT
export interface AddFundingRequest {
  fundingSource: string;
  fundingType: 'SUBVENTION' | 'CONTRAT' | 'PARTENARIAT' | 'BUDGET_INTERNE' | 'COOPERATION_INTERNATIONALE' | 'SECTEUR_PRIVE';
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
  status?: 'DEMANDE' | 'APPROUVE' | 'REJETE' | 'EN_COURS' | 'TERMINE' | 'SUSPENDU';
  approvedAmount?: number;
  receivedAmount?: number;
  approvalDate?: string;
  conditions?: string;
  notes?: string;
}

// =============================================
// STATISTIQUES DE PROJET
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
    startDate: Date | null;
    endDate: Date | null;
    duration: number;
    progress: number;
  };
}

