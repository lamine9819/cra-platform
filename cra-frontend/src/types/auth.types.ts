// =============================================
// 1. TYPES ET INTERFACES
// =============================================

// src/types/auth.types.ts
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
  ASSISTANT_CHERCHEUR = 'ASSISTANT_CHERCHEUR',
  TECHNICIEN_SUPERIEUR = 'TECHNICIEN_SUPERIEUR',
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