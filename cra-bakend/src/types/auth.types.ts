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
  role: 'CHERCHEUR' | 'ASSISTANT_CHERCHEUR' | 'TECHNICIEN_SUPERIEUR' | 'ADMINISTRATEUR';
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