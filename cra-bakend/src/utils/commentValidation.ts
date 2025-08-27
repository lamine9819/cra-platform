// src/utils/commentValidation.ts
import { z } from 'zod';

// Validation personnalisée pour les dates
const dateValidation = z.string().refine((val) => {
  const date = new Date(val);
  return !isNaN(date.getTime());
}, {
  message: "Date invalide"
});

export const createCommentSchema = z.object({
  content: z.string()
    .min(1, 'Le contenu du commentaire ne peut pas être vide')
    .max(2000, 'Le commentaire ne peut pas dépasser 2000 caractères')
    .refine(content => content.trim().length > 0, {
      message: 'Le commentaire ne peut pas être composé uniquement d\'espaces'
    }),
  targetType: z.enum(['project', 'activity', 'task'], {
    message: 'Le type de cible doit être project, activity ou task'
  }),
  targetId: z.cuid('ID de cible invalide'),
});

export const updateCommentSchema = z.object({
  content: z.string()
    .min(1, 'Le contenu du commentaire ne peut pas être vide')
    .max(2000, 'Le commentaire ne peut pas dépasser 2000 caractères')
    .refine(content => content.trim().length > 0, {
      message: 'Le commentaire ne peut pas être composé uniquement d\'espaces'
    }),
});

export const commentListQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
  targetType: z.enum(['project', 'activity', 'task']).optional(),
  targetId: z.cuid().optional(),
  authorId: z.cuid().optional(),
  search: z.string().optional(),
  startDate: dateValidation.optional(),
  endDate: dateValidation.optional(),
});