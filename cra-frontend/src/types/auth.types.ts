// =============================================
// 1. TYPES ET INTERFACES
// =============================================

// src/types/auth.types.ts

export interface IndividualProfile {
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
  isActive: boolean;
  profileImage?: string;
  phoneNumber?: string;
  specialization?: string;
  department?: string;
  diploma?: string;
  discipline?: string;
  individualProfile?: IndividualProfile;
  supervisor?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  CHERCHEUR = 'CHERCHEUR',
  COORDONATEUR_PROJET = 'COORDONATEUR_PROJET',
  ADMINISTRATEUR = 'ADMINISTRATEUR'
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    refreshToken?: string;
  };
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}