// src/types/activity.types.ts

// =============================================
// ENUMS
// =============================================

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
  AUTRE = 'AUTRE',
}

export const ActivityTypeLabels: Record<ActivityType, string> = {
  [ActivityType.RECHERCHE_EXPERIMENTALE]: 'Recherche Expérimentale',
  [ActivityType.RECHERCHE_DEVELOPPEMENT]: 'Recherche & Développement',
  [ActivityType.PRODUCTION_SEMENCES]: 'Production de Semences',
  [ActivityType.FORMATION_DISPENSEE]: 'Formation Dispensée',
  [ActivityType.FORMATION_RECUE]: 'Formation Reçue',
  [ActivityType.STAGE]: 'Stage',
  [ActivityType.ENCADREMENT]: 'Encadrement',
  [ActivityType.TRANSFERT_ACQUIS]: 'Transfert d\'Acquis',
  [ActivityType.SEMINAIRE]: 'Séminaire',
  [ActivityType.ATELIER]: 'Atelier',
  [ActivityType.CONFERENCE]: 'Conférence',
  [ActivityType.DEMONSTRATION]: 'Démonstration',
  [ActivityType.AUTRE]: 'Autre',
};

export const ActivityTypeColors: Record<ActivityType, string> = {
  [ActivityType.RECHERCHE_EXPERIMENTALE]: 'bg-blue-100 text-blue-800',
  [ActivityType.RECHERCHE_DEVELOPPEMENT]: 'bg-indigo-100 text-indigo-800',
  [ActivityType.PRODUCTION_SEMENCES]: 'bg-green-100 text-green-800',
  [ActivityType.FORMATION_DISPENSEE]: 'bg-yellow-100 text-yellow-800',
  [ActivityType.FORMATION_RECUE]: 'bg-orange-100 text-orange-800',
  [ActivityType.STAGE]: 'bg-purple-100 text-purple-800',
  [ActivityType.ENCADREMENT]: 'bg-pink-100 text-pink-800',
  [ActivityType.TRANSFERT_ACQUIS]: 'bg-teal-100 text-teal-800',
  [ActivityType.SEMINAIRE]: 'bg-cyan-100 text-cyan-800',
  [ActivityType.ATELIER]: 'bg-lime-100 text-lime-800',
  [ActivityType.CONFERENCE]: 'bg-violet-100 text-violet-800',
  [ActivityType.DEMONSTRATION]: 'bg-emerald-100 text-emerald-800',
  [ActivityType.AUTRE]: 'bg-gray-100 text-gray-800',
};

export enum ActivityStatus {
  PLANIFIEE = 'PLANIFIEE',
  EN_COURS = 'EN_COURS',
  SUSPENDUE = 'SUSPENDUE',
  ANNULEE = 'ANNULEE',
  CLOTUREE = 'CLOTUREE',
}

export const ActivityStatusLabels: Record<ActivityStatus, string> = {
  [ActivityStatus.PLANIFIEE]: 'Planifiée',
  [ActivityStatus.EN_COURS]: 'En Cours',
  [ActivityStatus.SUSPENDUE]: 'Suspendue',
  [ActivityStatus.ANNULEE]: 'Annulée',
  [ActivityStatus.CLOTUREE]: 'Clôturée',
};

export const ActivityStatusColors: Record<ActivityStatus, string> = {
  [ActivityStatus.PLANIFIEE]: 'bg-blue-100 text-blue-800',
  [ActivityStatus.EN_COURS]: 'bg-green-100 text-green-800',
  [ActivityStatus.SUSPENDUE]: 'bg-yellow-100 text-yellow-800',
  [ActivityStatus.ANNULEE]: 'bg-red-100 text-red-800',
  [ActivityStatus.CLOTUREE]: 'bg-gray-100 text-gray-800',
};

export enum ActivityLifecycleStatus {
  NOUVELLE = 'NOUVELLE',
  RECONDUITE = 'RECONDUITE',
  CLOTUREE = 'CLOTUREE',
}

export const ActivityLifecycleStatusLabels: Record<ActivityLifecycleStatus, string> = {
  [ActivityLifecycleStatus.NOUVELLE]: 'Nouvelle',
  [ActivityLifecycleStatus.RECONDUITE]: 'Reconduite',
  [ActivityLifecycleStatus.CLOTUREE]: 'Clôturée',
};

export enum ActivityParticipantRole {
  RESPONSABLE = 'RESPONSABLE',
  CO_RESPONSABLE = 'CO_RESPONSABLE',
  CHERCHEUR_PRINCIPAL = 'CHERCHEUR_PRINCIPAL',
  CHERCHEUR_ASSOCIE = 'CHERCHEUR_ASSOCIE',
  TECHNICIEN = 'TECHNICIEN',
  STAGIAIRE = 'STAGIAIRE',
  PARTENAIRE_EXTERNE = 'PARTENAIRE_EXTERNE',
  CONSULTANT = 'CONSULTANT',
}

export enum PartnerType {
  UNIVERSITE = 'UNIVERSITE',
  INSTITUT_RECHERCHE = 'INSTITUT_RECHERCHE',
  ENTREPRISE_PRIVEE = 'ENTREPRISE_PRIVEE',
  ONG = 'ONG',
  ORGANISME_PUBLIC = 'ORGANISME_PUBLIC',
  ORGANISATION_INTERNATIONALE = 'ORGANISATION_INTERNATIONALE',
  COOPERATIVE = 'COOPERATIVE',
  ASSOCIATION = 'ASSOCIATION',
}

export const PartnerTypeLabels: Record<PartnerType, string> = {
  [PartnerType.UNIVERSITE]: 'Université',
  [PartnerType.INSTITUT_RECHERCHE]: 'Institut de Recherche',
  [PartnerType.ENTREPRISE_PRIVEE]: 'Entreprise Privée',
  [PartnerType.ONG]: 'ONG',
  [PartnerType.ORGANISME_PUBLIC]: 'Organisme Public',
  [PartnerType.ORGANISATION_INTERNATIONALE]: 'Organisation Internationale',
  [PartnerType.COOPERATIVE]: 'Coopérative',
  [PartnerType.ASSOCIATION]: 'Association',
};

export const ActivityParticipantRoleLabels: Record<ActivityParticipantRole, string> = {
  [ActivityParticipantRole.RESPONSABLE]: 'Responsable',
  [ActivityParticipantRole.CO_RESPONSABLE]: 'Co-responsable',
  [ActivityParticipantRole.CHERCHEUR_PRINCIPAL]: 'Chercheur Principal',
  [ActivityParticipantRole.CHERCHEUR_ASSOCIE]: 'Chercheur Associé',
  [ActivityParticipantRole.TECHNICIEN]: 'Technicien',
  [ActivityParticipantRole.STAGIAIRE]: 'Stagiaire',
  [ActivityParticipantRole.PARTENAIRE_EXTERNE]: 'Partenaire Externe',
  [ActivityParticipantRole.CONSULTANT]: 'Consultant',
};

export enum TaskPriority {
  BASSE = 'BASSE',
  NORMALE = 'NORMALE',
  HAUTE = 'HAUTE',
  URGENTE = 'URGENTE',
}

export const TaskPriorityLabels: Record<TaskPriority, string> = {
  [TaskPriority.BASSE]: 'Basse',
  [TaskPriority.NORMALE]: 'Normale',
  [TaskPriority.HAUTE]: 'Haute',
  [TaskPriority.URGENTE]: 'Urgente',
};

export enum TaskStatus {
  A_FAIRE = 'A_FAIRE',
  EN_COURS = 'EN_COURS',
  EN_REVISION = 'EN_REVISION',
  TERMINEE = 'TERMINEE',
  ANNULEE = 'ANNULEE',
}

export const TaskStatusLabels: Record<TaskStatus, string> = {
  [TaskStatus.A_FAIRE]: 'À Faire',
  [TaskStatus.EN_COURS]: 'En Cours',
  [TaskStatus.EN_REVISION]: 'En Révision',
  [TaskStatus.TERMINEE]: 'Terminée',
  [TaskStatus.ANNULEE]: 'Annulée',
};

export enum FundingType {
  SUBVENTION = 'SUBVENTION',
  CONTRAT = 'CONTRAT',
  PARTENARIAT = 'PARTENARIAT',
  BUDGET_INTERNE = 'BUDGET_INTERNE',
  COOPERATION_INTERNATIONALE = 'COOPERATION_INTERNATIONALE',
  SECTEUR_PRIVE = 'SECTEUR_PRIVE',
}

export const FundingTypeLabels: Record<FundingType, string> = {
  [FundingType.SUBVENTION]: 'Subvention',
  [FundingType.CONTRAT]: 'Contrat',
  [FundingType.PARTENARIAT]: 'Partenariat',
  [FundingType.BUDGET_INTERNE]: 'Budget Interne',
  [FundingType.COOPERATION_INTERNATIONALE]: 'Coopération Internationale',
  [FundingType.SECTEUR_PRIVE]: 'Secteur Privé',
};

export enum FundingStatus {
  DEMANDE = 'DEMANDE',
  APPROUVE = 'APPROUVE',
  REJETE = 'REJETE',
  EN_COURS = 'EN_COURS',
  TERMINE = 'TERMINE',
  SUSPENDU = 'SUSPENDU',
}

export const FundingStatusLabels: Record<FundingStatus, string> = {
  [FundingStatus.DEMANDE]: 'Demandé',
  [FundingStatus.APPROUVE]: 'Approuvé',
  [FundingStatus.REJETE]: 'Rejeté',
  [FundingStatus.EN_COURS]: 'En Cours',
  [FundingStatus.TERMINE]: 'Terminé',
  [FundingStatus.SUSPENDU]: 'Suspendu',
};

export const FundingStatusColors: Record<FundingStatus, string> = {
  [FundingStatus.DEMANDE]: 'bg-yellow-100 text-yellow-800',
  [FundingStatus.APPROUVE]: 'bg-green-100 text-green-800',
  [FundingStatus.REJETE]: 'bg-red-100 text-red-800',
  [FundingStatus.EN_COURS]: 'bg-blue-100 text-blue-800',
  [FundingStatus.TERMINE]: 'bg-gray-100 text-gray-800',
  [FundingStatus.SUSPENDU]: 'bg-orange-100 text-orange-800',
};

export const TaskPriorityColors: Record<TaskPriority, string> = {
  [TaskPriority.BASSE]: 'bg-gray-100 text-gray-800',
  [TaskPriority.NORMALE]: 'bg-blue-100 text-blue-800',
  [TaskPriority.HAUTE]: 'bg-orange-100 text-orange-800',
  [TaskPriority.URGENTE]: 'bg-red-100 text-red-800',
};

export const TaskStatusColors: Record<TaskStatus, string> = {
  [TaskStatus.A_FAIRE]: 'bg-gray-100 text-gray-800',
  [TaskStatus.EN_COURS]: 'bg-blue-100 text-blue-800',
  [TaskStatus.EN_REVISION]: 'bg-yellow-100 text-yellow-800',
  [TaskStatus.TERMINEE]: 'bg-green-100 text-green-800',
  [TaskStatus.ANNULEE]: 'bg-red-100 text-red-800',
};

// =============================================
// INTERFACES - ACTIVITY
// =============================================

export interface Activity {
  id: string;
  code?: string;
  title: string;
  description?: string;
  type: ActivityType;
  objectives: string[];
  methodology?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  results?: string;
  conclusions?: string;

  // Strategic Framing
  interventionRegion?: string;
  strategicPlan?: string;
  strategicAxis?: string;
  subAxis?: string;

  // Lifecycle
  lifecycleStatus: ActivityLifecycleStatus;
  isRecurrent: boolean;
  parentActivityId?: string;
  recurrenceReason?: string;
  recurrenceNotes?: string;
  recurrenceCount: number;
  originalStartDate?: string;

  // Status
  status: ActivityStatus;
  priority: TaskPriority;

  // Business Logic
  justifications?: string;
  constraints: string[];
  expectedResults: string[];
  transferMethods: string[];

  // Relations
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
    grade?: string;
    discipline?: string;
  };

  project?: {
    id: string;
    title: string;
    code?: string;
    status: string;
  };

  station?: {
    id: string;
    name: string;
    location?: string;
  };

  convention?: {
    id: string;
    title: string;
    type: string;
    status: string;
  };

  parentActivity?: {
    id: string;
    title: string;
    code?: string;
  };

  childActivities?: {
    id: string;
    title: string;
    code?: string;
  }[];

  participants?: ActivityParticipant[];
  partners?: ActivityPartnership[];
  fundings?: ActivityFunding[];
  tasks?: ActivityTask[];

  _count?: {
    participants: number;
    tasks: number;
    documents: number;
    comments: number;
  };

  createdAt: string;
  updatedAt: string;
}

export interface ActivityParticipant {
  id: string;
  role: ActivityParticipantRole;
  timeAllocation?: number;
  responsibilities?: string;
  expertise?: string;
  joinedAt: string;
  isActive: boolean;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    grade?: string;
    discipline?: string;
  };
}

export interface ActivityPartnership {
  id: string;
  partnerName?: string;
  partnerType: string;
  contactPerson?: string;
  contactEmail?: string;
  contribution?: string;
  benefits?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  partner?: {
    id: string;
    name: string;
    type: string;
  };
}

export interface ActivityFunding {
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
}

export interface ActivityTask {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  completedAt?: string;
  progress?: number;
  assignee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

// =============================================
// REQUEST TYPES
// =============================================

export interface CreateActivityRequest {
  title: string;
  description?: string;
  objectives: string[];
  type: ActivityType;
  themeId: string;
  responsibleId: string;
  projectId?: string;
  stationId?: string;
  conventionId?: string;
  methodology?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  interventionRegion?: string;
  strategicPlan?: string;
  strategicAxis?: string;
  subAxis?: string;
  lifecycleStatus?: ActivityLifecycleStatus;
  priority?: TaskPriority;
  justifications?: string;
  constraints?: string[];
  expectedResults?: string[];
  transferMethods?: string[];
}

export interface UpdateActivityRequest {
  title?: string;
  description?: string;
  objectives?: string[];
  type?: ActivityType;
  methodology?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  results?: string;
  conclusions?: string;
  interventionRegion?: string;
  strategicPlan?: string;
  strategicAxis?: string;
  subAxis?: string;
  status?: ActivityStatus;
  lifecycleStatus?: ActivityLifecycleStatus;
  priority?: TaskPriority;
  justifications?: string;
  constraints?: string[];
  expectedResults?: string[];
  transferMethods?: string[];
  projectId?: string;
  stationId?: string;
  conventionId?: string;
}

export interface AddActivityParticipantRequest {
  userId: string;
  role: ActivityParticipantRole;
  timeAllocation?: number;
  responsibilities?: string;
  expertise?: string;
}

export interface UpdateActivityParticipantRequest {
  userId: string;
  role?: ActivityParticipantRole;
  timeAllocation?: number;
  responsibilities?: string;
  expertise?: string;
  isActive?: boolean;
}

export interface AddActivityPartnershipRequest {
  partnerName: string;
  partnerType: string;
  contactPerson?: string;
  contactEmail?: string;
  contribution?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateActivityPartnershipRequest {
  partnerId: string;
  contactPerson?: string;
  contactEmail?: string;
  contribution?: string;
  endDate?: string;
  isActive?: boolean;
}

export interface AddActivityFundingRequest {
  fundingSource: string;
  fundingType: FundingType;
  requestedAmount: number;
  currency?: string;
  applicationDate?: string;
  startDate?: string;
  endDate?: string;
  conditions?: string;
  contractNumber?: string;
}

export interface UpdateActivityFundingRequest {
  fundingId: string;
  status?: FundingStatus;
  approvedAmount?: number;
  receivedAmount?: number;
  approvalDate?: string;
  conditions?: string;
}

export interface CreateActivityTaskRequest {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
  assigneeId?: string;
}

export interface UpdateActivityTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  progress?: number;
  assigneeId?: string;
}

export interface ReconductActivityRequest {
  reason: string;
  modifications?: string;
  budgetChanges?: string;
  teamChanges?: string;
  scopeChanges?: string;
  newStartDate?: string;
  newEndDate?: string;
}

// =============================================
// QUERY & RESPONSE TYPES
// =============================================

export interface ActivityListQuery {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  hasResults?: boolean;
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
  projectId?: string;
}

export interface ActivityListResponse {
  activities: Activity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ActivityStatistics {
  total: number;
  byType: Record<string, number>;
  byLifecycleStatus: Record<string, number>;
  byTheme: Record<string, number>;
  byStation: Record<string, number>;
  byResponsible: Record<string, { count: number; name: string }>;
  withoutProject: number;
  withResults: number;
  recurrent: number;
  recent: Activity[];
  byInterventionRegion: Record<string, number>;
}
