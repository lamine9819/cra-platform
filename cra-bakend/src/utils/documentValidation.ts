// src/utils/documentValidation.ts - Validation complète mise à jour

import { z } from 'zod';

// Énumération complète des types de documents selon le schéma Prisma
export const DocumentTypeEnum = z.enum([
  'RAPPORT',
  'FICHE_ACTIVITE',
  'FICHE_TECHNIQUE',
  'FICHE_INDIVIDUELLE',
  'DONNEES_EXPERIMENTALES',
  'FORMULAIRE',
  'PUBLICATION_SCIENTIFIQUE',
  'MEMOIRE',
  'THESE',
  'IMAGE',
  'PRESENTATION',
  'AUTRE'
]);

// Schéma pour l'upload de fichier unique
export const uploadFileSchema = z.object({
  title: z.string().min(1, 'Le titre est requis').max(255, 'Le titre est trop long'),
  description: z.string().optional(),
  type: DocumentTypeEnum.optional().default('AUTRE'),
  
  // Transformation des tags : string JSON -> array
  tags: z.union([
    z.string().transform((str) => {
      try {
        const parsed = JSON.parse(str);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }),
    z.array(z.string())
  ]).optional().default([]),
  
  // Transformation de isPublic : string -> boolean
  isPublic: z.union([
    z.string().transform((str) => str === 'true'),
    z.boolean()
  ]).optional().default(false),
  
  // Relations existantes
  projectId: z.string().cuid().optional(),
  activityId: z.string().cuid().optional(),
  taskId: z.string().cuid().optional(),
  seminarId: z.string().cuid().optional(),
  
  // Nouvelles relations selon le schéma Prisma
  trainingId: z.string().cuid().optional(),
  internshipId: z.string().cuid().optional(),
  supervisionId: z.string().cuid().optional(),
  knowledgeTransferId: z.string().cuid().optional(),
  eventId: z.string().cuid().optional()
});

// Schéma pour le partage de document
export const shareDocumentSchema = z.object({
  userIds: z.array(z.string().cuid()).min(1, 'Au moins un utilisateur doit être spécifié'),
  canEdit: z.boolean().optional().default(false),
  canDelete: z.boolean().optional().default(false)
});

// Schéma pour les requêtes de liste de documents
export const documentListQuerySchema = z.object({
  page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform((val) => val ? Math.min(parseInt(val, 10), 100) : 10),
  type: DocumentTypeEnum.optional(),
  ownerId: z.string().cuid().optional(),
  
  // Relations existantes
  projectId: z.string().cuid().optional(),
  activityId: z.string().cuid().optional(),
  taskId: z.string().cuid().optional(),
  seminarId: z.string().cuid().optional(),
  
  // Nouvelles relations
  trainingId: z.string().cuid().optional(),
  internshipId: z.string().cuid().optional(),
  supervisionId: z.string().cuid().optional(),
  knowledgeTransferId: z.string().cuid().optional(),
  eventId: z.string().cuid().optional(),
  
  // Autres filtres
  mimeType: z.string().optional(),
  isPublic: z.union([
    z.string().transform((str) => str === 'true'),
    z.boolean()
  ]).optional(),
  tags: z.union([
    z.string().transform((str) => [str]),
    z.array(z.string())
  ]).optional(),
  search: z.string().optional()
});

// Types TypeScript générés à partir des schémas Zod
export type UploadFileRequest = z.infer<typeof uploadFileSchema>;
export type ShareDocumentRequest = z.infer<typeof shareDocumentSchema>;
export type DocumentListQuery = z.infer<typeof documentListQuerySchema>;