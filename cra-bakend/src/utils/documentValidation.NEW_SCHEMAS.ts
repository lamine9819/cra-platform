// src/utils/documentValidation.NEW_SCHEMAS.ts
// NOUVEAUX SCHÉMAS ZOD À AJOUTER À documentValidation.ts

import { z } from 'zod';
import { DocumentType } from '../types/document.types';

// =============================================
// PHASE 1 - SCHÉMAS CRITIQUES
// =============================================

/**
 * Schéma pour la mise à jour des métadonnées
 * PATCH /documents/:id
 */
export const updateDocumentMetadataSchema = z.object({
  title: z.string().min(1, 'Le titre est requis').max(255).optional(),
  description: z.string().max(1000).optional().nullable(),
  type: z.nativeEnum(DocumentType).optional(),
  tags: z.array(z.string()).max(20, 'Maximum 20 tags').optional(),
  isPublic: z.boolean().optional()
}).refine(
  data => Object.keys(data).length > 0,
  { message: 'Au moins un champ doit être fourni pour la mise à jour' }
);

/**
 * Schéma pour la liaison d'un document
 * POST /documents/:id/link
 */
export const linkDocumentSchema = z.object({
  entityType: z.enum([
    'project',
    'activity',
    'task',
    'seminar',
    'training',
    'internship',
    'supervision',
    'knowledgeTransfer',
    'event'
  ], {
    errorMap: () => ({ message: 'Type d\'entité invalide' })
  }),
  entityId: z.string().cuid('ID d\'entité invalide')
});

/**
 * Schéma pour la déliaison d'un document
 * DELETE /documents/:id/link
 */
export const unlinkDocumentSchema = z.object({
  entityType: z.enum([
    'project',
    'activity',
    'task',
    'seminar',
    'training',
    'internship',
    'supervision',
    'knowledgeTransfer',
    'event'
  ]).optional(),
  entityId: z.string().cuid().optional()
}).refine(
  data => {
    // Si entityType est fourni, entityId doit l'être aussi
    if (data.entityType && !data.entityId) {
      return false;
    }
    return true;
  },
  { message: 'Si entityType est fourni, entityId est requis' }
);

// =============================================
// PHASE 3 - SCHÉMAS PARTAGES AVANCÉS
// =============================================

/**
 * Schéma pour la mise à jour des permissions de partage
 * PATCH /documents/:id/shares/:shareId
 */
export const updateSharePermissionsSchema = z.object({
  canEdit: z.boolean().optional(),
  canDelete: z.boolean().optional()
}).refine(
  data => data.canEdit !== undefined || data.canDelete !== undefined,
  { message: 'Au moins une permission doit être spécifiée' }
);

/**
 * Schéma pour le partage avec expiration
 * Extension du schéma shareDocument existant
 */
export const shareDocumentWithExpirationSchema = z.object({
  userIds: z.array(z.string().cuid()).min(1, 'Au moins un utilisateur requis').max(50, 'Maximum 50 utilisateurs'),
  canEdit: z.boolean().optional().default(false),
  canDelete: z.boolean().optional().default(false),
  expiresAt: z.string().datetime().optional() // ISO 8601 date string
}).refine(
  data => {
    // Si expiresAt est fourni, vérifier qu'il est dans le futur
    if (data.expiresAt) {
      const expirationDate = new Date(data.expiresAt);
      return expirationDate > new Date();
    }
    return true;
  },
  { message: 'La date d\'expiration doit être dans le futur' }
);

// =============================================
// SCHÉMAS POUR LES QUERY PARAMS
// =============================================

/**
 * Extension du schéma documentListQuery pour inclure les favoris
 */
export const documentListQueryExtendedSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),

  // Filtres existants
  type: z.nativeEnum(DocumentType).optional(),
  ownerId: z.string().cuid().optional(),
  projectId: z.string().cuid().optional(),
  activityId: z.string().cuid().optional(),
  taskId: z.string().cuid().optional(),
  seminarId: z.string().cuid().optional(),
  trainingId: z.string().cuid().optional(),
  internshipId: z.string().cuid().optional(),
  supervisionId: z.string().cuid().optional(),
  knowledgeTransferId: z.string().cuid().optional(),
  eventId: z.string().cuid().optional(),
  isPublic: z.coerce.boolean().optional(),
  search: z.string().max(100).optional(),
  tags: z.array(z.string()).or(z.string()).optional(),
  mimeType: z.string().optional(),

  // Nouveaux filtres
  favoritesOnly: z.coerce.boolean().optional(), // Filtrer seulement les favoris
  includeDeleted: z.coerce.boolean().optional().default(false), // Inclure les supprimés (admin seulement)

  // Tri
  sortBy: z.enum(['title', 'createdAt', 'updatedAt', 'size', 'viewCount', 'downloadCount']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

// =============================================
// TYPES TYPESCRIPT DÉRIVÉS
// =============================================

export type UpdateDocumentMetadataRequest = z.infer<typeof updateDocumentMetadataSchema>;
export type LinkDocumentRequest = z.infer<typeof linkDocumentSchema>;
export type UnlinkDocumentRequest = z.infer<typeof unlinkDocumentSchema>;
export type UpdateSharePermissionsRequest = z.infer<typeof updateSharePermissionsSchema>;
export type ShareDocumentWithExpirationRequest = z.infer<typeof shareDocumentWithExpirationSchema>;
export type DocumentListQueryExtended = z.infer<typeof documentListQueryExtendedSchema>;

// =============================================
// MIDDLEWARE DE VALIDATION
// =============================================

/**
 * Middleware pour valider les paramètres d'ID
 */
export const validateDocumentIdParam = z.object({
  id: z.string().cuid('ID de document invalide')
});

export const validateShareIdParam = z.object({
  id: z.string().cuid('ID de document invalide'),
  shareId: z.string().cuid('ID de partage invalide')
});

// =============================================
// FONCTIONS UTILITAIRES DE VALIDATION
// =============================================

/**
 * Valide si une date d'expiration est valide
 */
export function validateExpirationDate(date: string | Date): boolean {
  const expirationDate = typeof date === 'string' ? new Date(date) : date;
  return expirationDate > new Date();
}

/**
 * Valide si un type d'entité est valide
 */
export function validateEntityType(entityType: string): boolean {
  const validTypes = [
    'project',
    'activity',
    'task',
    'seminar',
    'training',
    'internship',
    'supervision',
    'knowledgeTransfer',
    'event'
  ];
  return validTypes.includes(entityType);
}

/**
 * Valide si les tags sont valides
 */
export function validateTags(tags: string[]): { valid: boolean; error?: string } {
  if (tags.length > 20) {
    return { valid: false, error: 'Maximum 20 tags autorisés' };
  }

  for (const tag of tags) {
    if (tag.length > 50) {
      return { valid: false, error: 'Chaque tag ne peut dépasser 50 caractères' };
    }

    if (!/^[a-zA-Z0-9\s\-_]+$/.test(tag)) {
      return { valid: false, error: 'Les tags ne peuvent contenir que des lettres, chiffres, espaces, tirets et underscores' };
    }
  }

  return { valid: true };
}

// =============================================
// EXPORT PAR DÉFAUT
// =============================================

export default {
  updateDocumentMetadataSchema,
  linkDocumentSchema,
  unlinkDocumentSchema,
  updateSharePermissionsSchema,
  shareDocumentWithExpirationSchema,
  documentListQueryExtendedSchema,
  validateDocumentIdParam,
  validateShareIdParam,
  validateExpirationDate,
  validateEntityType,
  validateTags
};
