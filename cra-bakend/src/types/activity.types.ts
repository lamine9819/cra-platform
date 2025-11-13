// src/types/activity.types.ts - Version CRA adaptée
import { TaskStatus, TaskPriority } from "@prisma/client";
export interface CreateActivityRequest {
  title: string;
  description?: string;
  objectives: string[];
  methodology?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  
  // Champs CRA spécifiques
  code?: string;
  type: ActivityType;
  lifecycleStatus?: ActivityLifecycleStatus;
  interventionRegion?: string;
  strategicPlan?: string;
  strategicAxis?: string;
  subAxis?: string;
  
  // Relations CRA - thème et responsable OBLIGATOIRES
  themeId: string;
  responsibleId: string;
  stationId?: string;
  conventionId?: string;
  
  // Le projet devient optionnel
  projectId?: string;
}

export interface UpdateActivityRequest {
  title?: string;
  description?: string;
  objectives?: string[];
  methodology?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  results?: string;
  conclusions?: string;
  
  // Champs CRA modifiables
  code?: string;
  type?: ActivityType;
  lifecycleStatus?: ActivityLifecycleStatus;
  interventionRegion?: string;
  strategicPlan?: string;
  strategicAxis?: string;
  subAxis?: string;
  
  // Relations modifiables
  themeId?: string;
  responsibleId?: string;
  stationId?: string;
  conventionId?: string;
  projectId?: string;
}

export interface ActivityListQuery {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  hasResults?: boolean;

  // Filtres CRA spécifiques
  themeId?: string;
  stationId?: string;
  responsibleId?: string;
  type?: ActivityType;
  lifecycleStatus?: ActivityLifecycleStatus;
  status?: ActivityStatus;
  interventionRegion?: string;
  withoutProject?: boolean;
  isRecurrent?: boolean;
  conventionId?: string;

  // Projet devient optionnel
  projectId?: string;
}

export interface ActivityRecurrenceRequest {
  reason: string;
  modifications?: string[];
  budgetChanges?: string;
  teamChanges?: string;
  scopeChanges?: string;
  newTitle?: string;
  newStartDate?: string;
  newEndDate?: string;
}

export interface LinkFormRequest {
  formId: string;
}

export interface LinkDocumentRequest {
  documentId: string;
}
// Ajouter ces interfaces pour les participants
export interface AddParticipantInput {
  userId: string;
  role: ParticipantRole;
  timeAllocation?: number;
  responsibilities?: string;
  expertise?: string;
}

export interface UpdateParticipantInput {
  role?: ParticipantRole;
  timeAllocation?: number;
  responsibilities?: string | null;
  expertise?: string | null;
  isActive?: boolean;
}

// Ajouter l'énumération ParticipantRole si elle n'existe pas déjà
export enum ParticipantRole {
  RESPONSABLE = 'RESPONSABLE',
  CO_RESPONSABLE = 'CO_RESPONSABLE',
  CHERCHEUR_PRINCIPAL = 'CHERCHEUR_PRINCIPAL',
  CHERCHEUR_ASSOCIE = 'CHERCHEUR_ASSOCIE',
  TECHNICIEN = 'TECHNICIEN',
  STAGIAIRE = 'STAGIAIRE',
  PARTENAIRE_EXTERNE = 'PARTENAIRE_EXTERNE',
  CONSULTANT = 'CONSULTANT'
}

export interface ActivityResponse {
  id: string;
  title: string;
  description?: string;
  objectives: string[];
  methodology?: string;
  location?: string;
  startDate?: Date;
  endDate?: Date;
  results?: string;
  conclusions?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Champs CRA
  code?: string;
  type: string;
  lifecycleStatus: string;
  interventionRegion?: string;
  strategicPlan?: string;
  strategicAxis?: string;
  subAxis?: string;
  isRecurrent: boolean;
  recurrenceCount: number;
  
  // Relations CRA
  theme: {
    id: string;
    name: string;
    code?: string;
    description?: string;
  };
  
  responsible: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  
  station?: {
    id: string;
    name: string;
    location: string;
  };
  
  convention?: {
    id: string;
    title: string;
    type: string;
    status: string;
  };
  
  // Le projet devient optionnel
  project?: {
    id: string;
    title: string;
    status: string;
    creator: {
      id: string;
      firstName: string;
      lastName: string;
    };
  };
  
  // Relations existantes
  tasks?: {
    id: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    dueDate?: Date;
    progress?: number;
    assignee?: {
      id: string;
      firstName: string;
      lastName: string;
    };
    createdBy?: {
      id: string;
      firstName: string;
      lastName: string;
    };
    createdAt: Date;
    updatedAt: Date;
  }[];
  
  documents?: {
    id: string;
    title: string;
    filename: string;
    type: string;
    size: bigint;
    createdAt: Date;
    owner: {
      id: string;
      firstName: string;
      lastName: string;
    };
  }[];
  
  forms?: {
    id: string;
    title: string;
    description?: string;
    isActive: boolean;
    createdAt: Date;
    creator: {
      id: string;
      firstName: string;
      lastName: string;
    };
    _count: {
      responses: number;
    };
  }[];
  
  participants?: {
    id: string;
    role: string;
    isActive: boolean;
    user: {
      id: string;
      firstName: string;
      lastName: string;
    };
  }[];

  partners?: {
    id: string;
    partnerType: string;
    contribution?: string;
    benefits?: string;
    isActive: boolean;
    partner: {
      id: string;
      name: string;
      type: string;
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
    applicationDate?: Date;
    approvalDate?: Date;
    startDate?: Date;
    endDate?: Date;
    conditions?: string;
    contractNumber?: string;
  }[];

  // Historique des reconductions
  parentActivity?: {
    id: string;
    title: string;
    code?: string;
  };

  childActivities?: {
    id: string;
    title: string;
    code?: string;
    createdAt: Date;
  }[];

  _count?: {
    tasks: number;
    documents: number;
    forms: number;
    comments: number;
    participants: number;
  };
}

// Types pour les statistiques CRA
export interface CRAActivityStats {
  total: number;
  byType: Record<string, number>;
  byLifecycleStatus: Record<string, number>;
  byTheme: Record<string, number>;
  byStation: Record<string, number>;
  byResponsible: Record<string, { count: number; name: string }>;
  withoutProject: number;
  withResults: number;
  recurrent: number;
  recent: ActivityResponse[];
  byInterventionRegion: Record<string, number>;
}

// Énumérations CRA
export enum ActivityType {
  RECHERCHE_EXPERIMENTALE = 'RECHERCHE_EXPERIMENTALE',
  RECHERCHE_DEVELOPPEMENT = 'RECHERCHE_DEVELOPPEMENT',
  PRODUCTION_SEMENCES = 'PRODUCTION_SEMENCES',
  FORMATION_DISPENSEE = 'FORMATION_DISPENSEE',
  FORMATION_RECUE = 'FORMATION_RECUE',
  STAGE = 'STAGE',
  ENCADREMENT = 'ENCADREMENT',
  TRANSFERT_ACQUIS = 'TRANSFERT_ACQUIS',
  SEMINAIRE = 'SEMINAIRE',
  ATELIER = 'ATELIER',
  CONFERENCE = 'CONFERENCE',
  DEMONSTRATION = 'DEMONSTRATION',
  AUTRE = 'AUTRE'
}

export enum ActivityLifecycleStatus {
  NOUVELLE = 'NOUVELLE',
  RECONDUITE = 'RECONDUITE',
  CLOTUREE = 'CLOTUREE'
}

export enum ActivityStatus {
  PLANIFIEE = 'PLANIFIEE',
  EN_COURS = 'EN_COURS',
  SUSPENDUE = 'SUSPENDUE',
  ANNULEE = 'ANNULEE',
  CLOTUREE = 'CLOTUREE'
}
export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  assigneeId?: string;
  // Le supervisorId sera automatiquement le créateur
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  assigneeId?: string;
  progress?: number;
}

// Ajouter une interface pour la réponse de tâche enrichie
export interface TaskResponse {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: Date;
  completedAt?: Date;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Créateur/Superviseur
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  
  // Assigné (exécutant)
  assignee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  
  // Contexte
  activity?: {
    id: string;
    title: string;
    code?: string;
  };
}