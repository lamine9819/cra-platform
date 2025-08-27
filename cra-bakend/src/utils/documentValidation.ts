// src/utils/documentValidation.ts
import { z } from 'zod';

// Énumération des types de documents (doit correspondre au schéma Prisma)
export const DocumentTypeEnum = z.enum([
  'RAPPORT',
  'FICHE_ACTIVITE', 
  'FICHE_TECHNIQUE',
  'DONNEES_EXPERIMENTALES',
  'FORMULAIRE',
  'IMAGE',
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
  projectId: z.string().cuid().optional(),
  activityId: z.string().cuid().optional(), 
  taskId: z.string().cuid().optional(),
  seminarId: z.string().cuid().optional()
});

// Schéma pour le partage de document
export const shareDocumentSchema = z.object({
  userIds: z.array(z.string().cuid(), {
  }).min(1, 'Au moins un utilisateur doit être spécifié'),
  canEdit: z.boolean().optional().default(false),
  canDelete: z.boolean().optional().default(false)
});

// Schéma pour les requêtes de liste de documents
export const documentListQuerySchema = z.object({
  page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform((val) => val ? Math.min(parseInt(val, 10), 100) : 10),
  type: DocumentTypeEnum.optional(),
  ownerId: z.string().cuid().optional(),
  projectId: z.string().cuid().optional(),
  activityId: z.string().cuid().optional(),
  taskId: z.string().cuid().optional(),
  seminarId: z.string().cuid().optional(),
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
