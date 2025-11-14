// src/types/formation.types.ts

// Enums pour les formations
export enum DiplomaStatus {
  OUI = 'OUI',
  NON = 'NON',
  EN_COURS = 'EN_COURS',
}

export enum TrainingGivenType {
  FORMATION_COURTE = 'FORMATION_COURTE',
  FORMATION_DIPLOMANTE = 'FORMATION_DIPLOMANTE',
  STAGE_ADAPTATION = 'STAGE_ADAPTATION',
  STAGE_RECHERCHE = 'STAGE_RECHERCHE',
  ATELIER_TECHNIQUE = 'ATELIER_TECHNIQUE',
  SEMINAIRE_FORMATION = 'SEMINAIRE_FORMATION',
}

export enum SupervisionType {
  DOCTORAT = 'DOCTORAT',
  MASTER = 'MASTER',
  LICENCE = 'LICENCE',
  INGENIEUR = 'INGENIEUR',
}

export enum SupervisionStatus {
  EN_COURS = 'EN_COURS',
  SOUTENU = 'SOUTENU',
  ABANDONNE = 'ABANDONNE',
}

// Labels pour affichage
export const DiplomaStatusLabels: Record<DiplomaStatus, string> = {
  [DiplomaStatus.OUI]: 'Diplôme obtenu',
  [DiplomaStatus.NON]: 'Diplôme non obtenu',
  [DiplomaStatus.EN_COURS]: 'En cours',
};

export const TrainingGivenTypeLabels: Record<TrainingGivenType, string> = {
  [TrainingGivenType.FORMATION_COURTE]: 'Formation courte',
  [TrainingGivenType.FORMATION_DIPLOMANTE]: 'Formation diplômante',
  [TrainingGivenType.STAGE_ADAPTATION]: 'Stage d\'adaptation',
  [TrainingGivenType.STAGE_RECHERCHE]: 'Stage de recherche',
  [TrainingGivenType.ATELIER_TECHNIQUE]: 'Atelier technique',
  [TrainingGivenType.SEMINAIRE_FORMATION]: 'Séminaire de formation',
};

export const SupervisionTypeLabels: Record<SupervisionType, string> = {
  [SupervisionType.DOCTORAT]: 'Doctorat',
  [SupervisionType.MASTER]: 'Master',
  [SupervisionType.LICENCE]: 'Licence',
  [SupervisionType.INGENIEUR]: 'Ingénieur',
};

export const SupervisionStatusLabels: Record<SupervisionStatus, string> = {
  [SupervisionStatus.EN_COURS]: 'En cours',
  [SupervisionStatus.SOUTENU]: 'Soutenu',
  [SupervisionStatus.ABANDONNE]: 'Abandonné',
};

// Couleurs pour affichage
export const DiplomaStatusColors: Record<DiplomaStatus, string> = {
  [DiplomaStatus.OUI]: 'bg-green-100 text-green-800',
  [DiplomaStatus.NON]: 'bg-red-100 text-red-800',
  [DiplomaStatus.EN_COURS]: 'bg-blue-100 text-blue-800',
};

export const SupervisionStatusColors: Record<SupervisionStatus, string> = {
  [SupervisionStatus.EN_COURS]: 'bg-blue-100 text-blue-800',
  [SupervisionStatus.SOUTENU]: 'bg-green-100 text-green-800',
  [SupervisionStatus.ABANDONNE]: 'bg-red-100 text-red-800',
};

// Types de réponses API
export interface ShortTrainingReceived {
  id: string;
  title: string;
  objectives: string[];
  location: string;
  startDate: string;
  endDate: string | null;
  duration: number | null;
  period?: string;
  beneficiaries: string[];
  organizer: string | null;
  createdAt: string;
  updatedAt: string;
  activity: {
    id: string;
    title: string;
  } | null;
}

export interface DiplomaticTrainingReceived {
  id: string;
  studentName: string;
  level: string;
  specialty: string;
  university: string;
  startDate: string;
  endDate: string | null;
  period: string;
  diplomaObtained: DiplomaStatus;
  createdAt: string;
  updatedAt: string;
  activity: {
    id: string;
    title: string;
  } | null;
}

export interface TrainingGiven {
  id: string;
  title: string;
  description: string | null;
  type: TrainingGivenType;
  institution: string;
  level: string;
  department: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
  duration: number | null;
  objectives: string[];
  maxParticipants: number | null;
  createdAt: string;
  updatedAt: string;
  activity: {
    id: string;
    title: string;
  } | null;
}

export interface Supervision {
  id: string;
  title: string;
  studentName: string;
  type: SupervisionType;
  specialty: string;
  university: string;
  startDate: string;
  endDate: string | null;
  expectedDefenseDate?: string;
  status: SupervisionStatus;
  abstract: string | null;
  coSupervisors: string[];
  createdAt: string;
  updatedAt: string;
  activity: {
    id: string;
    title: string;
  } | null;
}

// Types pour les requêtes de création
export interface CreateShortTrainingReceivedRequest {
  title: string;
  objectives: string[];
  location: string;
  startDate: string;
  endDate?: string;
  duration?: number;
  beneficiaries?: string[];
  organizer?: string;
  activityId?: string;
}

export interface CreateDiplomaticTrainingReceivedRequest {
  studentName: string;
  level: string;
  specialty: string;
  university: string;
  startDate: string;
  endDate?: string;
  period: string;
  diplomaObtained?: DiplomaStatus;
  activityId?: string;
}

export interface CreateTrainingGivenRequest {
  title: string;
  description?: string;
  type: TrainingGivenType;
  institution: string;
  level: string;
  department: string;
  location?: string;
  startDate: string;
  endDate?: string;
  duration?: number;
  objectives?: string[];
  maxParticipants?: number;
  activityId?: string;
}

export interface CreateSupervisionRequest {
  title: string;
  studentName: string;
  type: SupervisionType;
  specialty: string;
  university: string;
  startDate: string;
  endDate?: string;
  expectedDefenseDate?: string;
  status?: SupervisionStatus;
  abstract?: string;
  coSupervisors?: string[];
  activityId?: string;
}

// Type pour le rapport de formation
export interface FormationReport {
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  shortTrainingsReceived: ShortTrainingReceived[];
  diplomaticTrainingsReceived: DiplomaticTrainingReceived[];
  trainingsGiven: TrainingGiven[];
  supervisions: Supervision[];
}
