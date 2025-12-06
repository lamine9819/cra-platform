// src/types/user.types.ts

// =============================================
// ENUMS
// =============================================

export enum UserRole {
  ADMINISTRATEUR = 'ADMINISTRATEUR',
  CHERCHEUR = 'CHERCHEUR',
  TECHNICIEN = 'TECHNICIEN',
  GESTIONNAIRE = 'GESTIONNAIRE',
}

export enum UserStatus {
  ACTIF = 'ACTIF',
  INACTIF = 'INACTIF',
  SUSPENDU = 'SUSPENDU',
}

// =============================================
// INTERFACES
// =============================================

export interface IndividualProfile {
  matricule?: string;
  grade?: string;
  classe?: string;
  dateNaissance?: string;
  dateRecrutement?: string;
  localite?: string;
  diplome?: string;
  tempsRecherche?: number;
  tempsEnseignement?: number;
  tempsFormation?: number;
  tempsConsultation?: number;
  tempsGestionScientifique?: number;
  tempsAdministration?: number;
  birthDate?: string;
  birthPlace?: string;
  nationality?: string;
  gender?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  bio?: string;
  linkedin?: string;
  researchGate?: string;
  orcid?: string;
  googleScholar?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;

  // Profil académique
  grade?: string;
  discipline?: string;
  diploma?: string;
  specialization?: string;
  institution?: string;
  department?: string;

  // Profil individuel
  individualProfile?: IndividualProfile;

  // Métadonnées
  avatar?: string;
  profileImage?: string;
  phoneNumber?: string;
  isEmailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;

  // Compteurs
  _count?: {
    projects: number;
    activities: number;
    publications: number;
    documents: number;
  };
}

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: UserRole;
  grade?: string;
  discipline?: string;
  diploma?: string;
  institution?: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
  grade?: string;
  discipline?: string;
  diploma?: string;
  specialization?: string;
  institution?: string;
  department?: string;
  individualProfile?: IndividualProfile;
  avatar?: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  grade?: string;
  discipline?: string;
  diploma?: string;
  specialization?: string;
  institution?: string;
  department?: string;
  individualProfile?: IndividualProfile;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserListQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  grade?: string;
  discipline?: string;
  institution?: string;
}

export interface UserListResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
