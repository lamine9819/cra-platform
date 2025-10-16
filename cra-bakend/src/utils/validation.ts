// src/utils/validation.ts
import { z } from 'zod';



export const registerSchema = z.object({
  email: z.string().refine((val) => z.email().safeParse(val).success, {
    message: 'Email invalide'
  }),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  role: z.enum(['CHERCHEUR', 'COORDONATEUR_PROJET', 'ADMINISTRATEUR']),
  phoneNumber: z.string().regex(/^[+]?[\d\s\-()]+$/, 'Format de téléphone invalide').optional().or(z.literal('')),
  specialization: z.string().max(100, 'La spécialisation ne peut pas dépasser 100 caractères').optional(),
  department: z.string().max(100, 'Le département ne peut pas dépasser 100 caractères').optional(),
});

export const loginSchema = z.object({
  email: z.string().refine((val) => z.email().safeParse(val).success, {
    message: 'Email invalide'
  }),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

// Schemas de validation supplémentaires
export const updateProfileSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères').optional(),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').optional(),
  phoneNumber: z.string().optional(),
  specialization: z.string().optional(),
  department: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Le mot de passe actuel est requis'),
  newPassword: z.string().min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string().min(1, 'La confirmation du mot de passe est requise'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});