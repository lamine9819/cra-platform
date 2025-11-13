// src/types/user.types.ts
import { UserRole } from '@prisma/client';

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole; // CHERCHEUR, COORDONATEUR_PROJET, ADMINISTRATEUR
  phoneNumber?: string;
  dateOfBirth?: Date;
  dateOfHire?: Date;
  diploma?: string; // DOCTORAT, MASTER, INGENIEUR, etc.
  specialization?: string; // Spécialité scientifique
  discipline?: string; // Discipline de recherche
  department?: string;
  supervisorId?: string;
  
  // Nouveaux champs spécifiques au CRA
  orcidId?: string;
  researchGateId?: string;
  googleScholarId?: string;
  linkedinId?: string;
  
  // Configuration du profil individuel si c'est un chercheur
  individualProfile?: CreateIndividualProfileRequest;
}

export interface CreateIndividualProfileRequest {
  matricule: string;
  grade: string; // "7", "CR", "CST"
  classe?: string; // "1", "6.3"
  dateNaissance: Date;
  dateRecrutement: Date;
  localite: string; // Lieu d'affectation
  diplome: string; // DOCTORAT, MASTER, etc.
  
  // Répartition du temps par activité (en pourcentage, total = 100%)
  tempsRecherche?: number;
  tempsEnseignement?: number;
  tempsFormation?: number;
  tempsConsultation?: number;
  tempsGestionScientifique?: number;
  tempsAdministration?: number;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  specialization?: string;
  discipline?: string;
  department?: string;
  diploma?: string;
  dateOfBirth?: Date;
  dateOfHire?: Date;
  supervisorId?: string;
  isActive?: boolean;
  
  // IDs réseaux sociaux/académiques
  orcidId?: string;
  researchGateId?: string;
  googleScholarId?: string;
  linkedinId?: string;
  
  // Préférences
  notificationPrefs?: Record<string, any>;
  dashboardConfig?: Record<string, any>;
}

export interface UpdateIndividualProfileRequest {
  matricule?: string;
  grade?: string;
  classe?: string;
  localite?: string;
  diplome?: string;
  
  // Répartition du temps
  tempsRecherche?: number;
  tempsEnseignement?: number;
  tempsFormation?: number;
  tempsConsultation?: number;
  tempsGestionScientifique?: number;
  tempsAdministration?: number;
}

export interface UserListQuery {
  page?: number;
  limit?: number;
  role?: UserRole;
  department?: string;
  discipline?: string;
  grade?: string; // Pour filtrer par grade (si chercheur)
  localite?: string; // Pour filtrer par lieu d'affectation
  isActive?: boolean;
  search?: string;
  supervisorId?: string; // Pour les utilisateurs d'un superviseur spécifique
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phoneNumber?: string;
  dateOfBirth?: Date;
  dateOfHire?: Date;
  diploma?: string;
  specialization?: string;
  discipline?: string;
  department?: string;
  supervisorId?: string;
  isActive: boolean;
  profileImage?: string;
  
  // IDs académiques
  orcidId?: string;
  researchGateId?: string;
  googleScholarId?: string;
  linkedinId?: string;
  
  // Préférences
  notificationPrefs?: Record<string, any>;
  dashboardConfig?: Record<string, any>;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  supervisor?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  
  supervisedUsers?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    discipline?: string;
  }[];
  
  // Profil individuel pour les chercheurs
  individualProfile?: IndividualProfileResponse;
  
  // Statistiques
  stats?: UserStatsResponse;
}

export interface IndividualProfileResponse {
  id: string;
  matricule: string;
  grade: string;
  classe?: string;
  dateNaissance: Date;
  dateRecrutement: Date;
  localite: string;
  diplome: string;
  
  // Répartition du temps
  tempsRecherche: number;
  tempsEnseignement: number;
  tempsFormation: number;
  tempsConsultation: number;
  tempsGestionScientifique: number;
  tempsAdministration: number;
  
  // Validation
  isValidated: boolean;
  validatedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Historique des répartitions
  timeAllocations?: TimeAllocationResponse[];
}

export interface TimeAllocationResponse {
  id: string;
  year: number;
  tempsRecherche: number;
  tempsEnseignement: number;
  tempsFormation: number;
  tempsConsultation: number;
  tempsGestionScientifique: number;
  tempsAdministration: number;
  isValidated: boolean;
  validatedAt?: Date;
  validatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserStatsResponse {
  // Statistiques d'activité
  totalProjects: number;
  activeProjects: number;
  totalActivities: number;
  activeActivities: number;
  
  // Encadrements
  supervisedUsers: number;
  ongoingSupervisions: number; // Thèses, mémoires
  
  // Publications (si disponibles)
  publications: number;
  
  // Formations
  trainingsGiven: number;
  trainingsReceived: number;
  
  // Dernière activité
  lastActivityDate?: Date;
}