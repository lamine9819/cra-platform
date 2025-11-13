// src/utils/commentValidation.ts
import { z } from 'zod';

// Schéma pour la création d'un commentaire
export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Le contenu du commentaire est requis')
    .max(2000, 'Le commentaire ne peut pas dépasser 2000 caractères')
    .refine(
      (content) => content.trim().length > 0,
      'Le commentaire ne peut pas être vide'
    ),
  targetType: z.enum(['project', 'activity', 'task']),
  targetId: z
    .string()
    .min(1, 'L\'ID de la cible est requis')
    .regex(/^[a-zA-Z0-9_-]+$/, 'L\'ID de la cible doit être valide')
});

// Schéma pour la mise à jour d'un commentaire
export const updateCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Le contenu du commentaire est requis')
    .max(2000, 'Le commentaire ne peut pas dépasser 2000 caractères')
    .refine(
      (content) => content.trim().length > 0,
      'Le commentaire ne peut pas être vide'
    )
});

// Schéma pour les paramètres de requête de liste des commentaires
export const commentListQuerySchema = z.object({
  page: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      if (val === undefined || val === null || val === '') return 1;
      const parsed = typeof val === 'string' ? parseInt(val, 10) : val;
      return isNaN(parsed) ? 1 : parsed;
    })
    .refine((val) => val > 0, 'Le numéro de page doit être positif'),
  
  limit: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      if (val === undefined || val === null || val === '') return 20;
      const parsed = typeof val === 'string' ? parseInt(val, 10) : val;
      return isNaN(parsed) ? 20 : parsed;
    })
    .refine((val) => val > 0 && val <= 100, 'La limite doit être entre 1 et 100'),
  
  targetType: z.enum(['project', 'activity', 'task']).optional().nullable(),
  
  targetId: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => !val || (typeof val === 'string' && val.length > 0 && /^[a-zA-Z0-9_-]+$/.test(val)),
      'L\'ID de la cible doit être valide'
    ),
  
  authorId: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => !val || (typeof val === 'string' && val.length > 0 && /^[a-zA-Z0-9_-]+$/.test(val)),
      'L\'ID de l\'auteur doit être valide'
    ),
  
  search: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val?.trim() || undefined)
    .refine(
      (val) => !val || val.length >= 2,
      'La recherche doit contenir au moins 2 caractères'
    ),
  
  startDate: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => {
        if (!val) return true;
        const date = new Date(val);
        return !isNaN(date.getTime());
      },
      'La date de début doit être valide'
    ),
  
  endDate: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => {
        if (!val) return true;
        const date = new Date(val);
        return !isNaN(date.getTime());
      },
      'La date de fin doit être valide'
    )
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return start <= end;
    }
    return true;
  },
  {
    message: 'La date de début doit être antérieure à la date de fin',
    path: ['endDate']
  }
);

// Type dérivé pour la validation côté client
export type CreateCommentData = z.infer<typeof createCommentSchema>;
export type UpdateCommentData = z.infer<typeof updateCommentSchema>;
export type CommentListQueryData = z.infer<typeof commentListQuerySchema>;