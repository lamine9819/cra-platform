// =============================================
// 2. VALIDATION SCHEMAS
// =============================================

// src/utils/userValidation.ts
import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  role: z.enum(['CHERCHEUR', 'ASSISTANT_CHERCHEUR', 'TECHNICIEN_SUPERIEUR', 'ADMINISTRATEUR']),
  phoneNumber: z.string().optional(),
  specialization: z.string().optional(),
  department: z.string().optional(),
  supervisorId: z.cuid().optional(),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phoneNumber: z.string().optional(),
  specialization: z.string().optional(),
  department: z.string().optional(),
  supervisorId: z.cuid().optional(),
  isActive: z.boolean().optional(),
});

export const assignSupervisorSchema = z.object({
  supervisorId: z.cuid('ID de superviseur invalide'),
});

export const userListQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
  role: z.enum(['CHERCHEUR', 'ASSISTANT_CHERCHEUR', 'TECHNICIEN_SUPERIEUR', 'ADMINISTRATEUR']).optional(),
  department: z.string().optional(),
  isActive: z.string().transform(val => val === 'true').optional(),
  search: z.string().optional(),
});