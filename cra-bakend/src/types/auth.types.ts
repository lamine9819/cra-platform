// =============================================
// 1. TYPES & INTERFACES
// =============================================

// src/types/auth.types.ts
import { Request } from 'express';

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'CHERCHEUR' | 'COORDONATEUR_PROJET' | 'ADMINISTRATEUR';
  phoneNumber?: string;
  specialization?: string;
  department?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Type amélioré qui étend correctement Request d'Express
export interface AuthenticatedRequest extends Request {
  user: JWTPayload;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Vous pouvez également ajouter ce type pour la réponse
export interface ChangePasswordResponse {
  message: string;
}