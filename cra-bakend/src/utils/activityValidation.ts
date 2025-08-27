// src/utils/activityValidation.ts - Version corrigée
import { z } from 'zod';

// ✅ CORRECTION - Validation personnalisée pour les dates qui accepte YYYY-MM-DD et chaînes vides
const dateValidation = z.union([
  z.string().refine((val) => {
    // Accepter les chaînes vides
    if (val === '') return true;
    
    // Vérifier le format YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
      const date = new Date(val);
      return !isNaN(date.getTime());
    }
    
    // Vérifier le format datetime ISO
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, {
    message: "Date invalide - Format attendu: YYYY-MM-DD"
  }),
  z.literal('') // Accepter explicitement les chaînes vides
]);

export const createActivitySchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(200),
  description: z.string().max(2000).optional(),
  objectives: z.array(z.string().min(1)).min(1, 'Au moins un objectif est requis'),
  methodology: z.string().max(2000).optional(),
  location: z.string().max(200).optional(),
  startDate: dateValidation.optional(),
  endDate: dateValidation.optional(),
  projectId: z.string().cuid('ID de projet invalide'),
}).refine(data => {
  if (data.startDate && data.endDate && data.startDate !== '' && data.endDate !== '') {
    return new Date(data.startDate) < new Date(data.endDate);
  }
  return true;
}, {
  message: "La date de fin doit être postérieure à la date de début",
  path: ["endDate"]
});

// ✅ CORRECTION PRINCIPALE - Schema pour la mise à jour avec dates flexibles
export const updateActivitySchema = z.object({
  title: z.string().min(1, 'Le titre est obligatoire').max(255).optional(),
  description: z.string().max(1000).optional().or(z.literal('')),
  objectives: z.array(z.string().min(1, 'Les objectifs ne peuvent pas être vides')).optional(),
  methodology: z.string().max(1000).optional().or(z.literal('')),
  location: z.string().max(255).optional().or(z.literal('')),
  // ✅ CORRECTION - Utiliser dateValidation au lieu de datetime()
  startDate: dateValidation.optional(),
  endDate: dateValidation.optional(),
  results: z.string().max(2000).optional().or(z.literal('')),
  conclusions: z.string().max(2000).optional().or(z.literal('')),
  projectId: z.string().cuid('ID de projet invalide').optional() // ✅ MAINTENANT INCLUS
}).refine(data => {
  if (data.startDate && data.endDate && 
      data.startDate !== '' && data.endDate !== '' &&
      data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate);
  }
  return true;
}, {
  message: 'La date de fin doit être postérieure à la date de début',
  path: ['endDate']
});

export const activityListQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
  projectId: z.string().cuid().optional(),
  search: z.string().optional(),
  startDate: dateValidation.optional(),
  endDate: dateValidation.optional(),
  hasResults: z.string().transform(val => val === 'true').optional(),
});

export const linkFormSchema = z.object({
  formId: z.string().cuid('ID de formulaire invalide'),
});

export const linkDocumentSchema = z.object({
  documentId: z.string().cuid('ID de document invalide'),
});

// ✅ AJOUT - Schema pour la duplication
export const duplicateActivitySchema = z.object({
  title: z.string().max(255).optional()
});

// Types TypeScript extraits des schemas
export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;
export type ActivityListQuery = z.infer<typeof activityListQuerySchema>;
export type LinkFormInput = z.infer<typeof linkFormSchema>;
export type LinkDocumentInput = z.infer<typeof linkDocumentSchema>;
export type DuplicateActivityInput = z.infer<typeof duplicateActivitySchema>;