// src/utils/formValidation.ts - Version corrigée sans doublons
import { z } from 'zod';

// =============================================
// VALIDATIONS DE BASE ADAPTÉES
// =============================================

// Validation pour les données de photo
const photoDataSchema = z.object({
  type: z.literal('photo'),
  base64: z.string().min(1, 'Données photo requises'),
  filename: z.string().optional(),
  mimeType: z.string().regex(/^image\/(jpeg|jpg|png|webp)$/, 'Type de fichier non supporté').optional(),
  caption: z.string().max(200, 'Légende trop longue').optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  takenAt: z.string().datetime().optional(),
}).refine((data) => {
  try {
    const buffer = Buffer.from(data.base64, 'base64');
    const isJPEG = buffer[0] === 0xFF && buffer[1] === 0xD8;
    const isPNG = buffer[0] === 0x89 && buffer[1] === 0x50;
    const isWebP = buffer.slice(8, 12).toString() === 'WEBP';
    return isJPEG || isPNG || isWebP;
  } catch {
    return false;
  }
}, {
  message: "Données d'image invalides"
});

// Schema pour valider un champ de formulaire avec photos
const formFieldSchema = z.object({
  id: z.string().min(1, 'ID de champ requis'),
  type: z.enum(['text', 'number', 'email', 'textarea', 'select', 'checkbox', 'radio', 'date', 'time', 'file', 'photo']),
  label: z.string().min(1, 'Label requis'),
  placeholder: z.string().optional(),
  required: z.boolean().default(false),
  validation: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
    message: z.string().optional(),
    maxFileSize: z.number().positive().optional(),
    acceptedTypes: z.array(z.string()).optional(),
  }).optional(),
  options: z.array(z.object({
    value: z.union([z.string(), z.number()]),
    label: z.string(),
  })).optional(),
  defaultValue: z.any().optional(),
  description: z.string().optional(),
  photoConfig: z.object({
    maxSize: z.number().positive().default(5 * 1024 * 1024),
    quality: z.number().min(0.1).max(1).default(0.8),
    enableGPS: z.boolean().default(true),
    enableCaption: z.boolean().default(true),
    maxPhotos: z.number().positive().default(5),
  }).optional(),
});

// Schema pour le schéma complet du formulaire
const formSchemaSchema = z.object({
  title: z.string().min(1, 'Titre du schéma requis'),
  description: z.string().optional(),
  version: z.string().default('1.0.0'),
  fields: z.array(formFieldSchema).min(1, 'Au moins un champ est requis'),
  settings: z.object({
    allowMultipleSubmissions: z.boolean().default(true),
    showProgress: z.boolean().default(false),
    submitButtonText: z.string().default('Soumettre'),
    successMessage: z.string().default('Formulaire soumis avec succès'),
    enableOfflineMode: z.boolean().default(true),
    maxSubmissionsPerUser: z.number().positive().optional(),
  }).optional(),
});

// =============================================
// SCHEMAS POUR LES FORMULAIRES
// =============================================

export const createFormSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(200),
  description: z.string().max(2000).optional(),
  schema: formSchemaSchema,
  activityId: z.string().cuid().optional(),
  isActive: z.boolean().default(true),
  enablePublicAccess: z.boolean().default(false),
});

export const updateFormSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(2000).optional(),
  schema: formSchemaSchema.optional(),
  isActive: z.boolean().optional(),
  enablePublicAccess: z.boolean().optional(),
});

// =============================================
// SCHEMAS POUR LES RÉPONSES AVEC PHOTOS
// =============================================

export const submitFormResponseSchema = z.object({
  data: z.record(z.string(), z.any()).refine(
    (data) => Object.keys(data).length > 0,
    { message: "Au moins un champ doit être rempli" }
  ),
  collectorName: z.string().min(1).max(100).optional(),
  collectorEmail: z.string().email().optional(),
  photos: z.array(photoDataSchema).optional(),
  isOffline: z.boolean().default(false),
  deviceId: z.string().optional(),
});

// =============================================
// SCHEMAS POUR LE PARTAGE
// =============================================

export const shareFormSchema = z.object({
  targetUserId: z.string().cuid().optional(),
  canCollect: z.boolean().default(true),
  canExport: z.boolean().default(false),
  maxSubmissions: z.number().positive().optional(),
  expiresAt: z.string().datetime().optional(),
  shareType: z.enum(['INTERNAL', 'EXTERNAL']),
});

export const publicShareSchema = z.object({
  maxSubmissions: z.number().positive().optional(),
  expiresAt: z.string().datetime().optional(),
});

// =============================================
// SCHEMAS POUR L'UPLOAD DE PHOTOS
// =============================================

export const uploadPhotoSchema = z.object({
  fieldId: z.string().min(1, 'ID de champ requis'),
  photoData: photoDataSchema,
  formId: z.string().cuid(),
});

// =============================================
// SCHEMAS POUR LA SYNCHRONISATION OFFLINE
// =============================================

export const offlineDataSchema = z.object({
  formId: z.string().cuid(),
  deviceId: z.string().min(1, 'ID de périphérique requis'),
  data: z.record(z.string(), z.any()),
  photos: z.array(photoDataSchema).optional(),
  submittedAt: z.string().datetime().optional(),
});

export const syncOfflineSchema = z.object({
  deviceId: z.string().min(1, 'ID de périphérique requis'),
  responses: z.array(offlineDataSchema),
});

// =============================================
// SCHEMAS POUR L'EXPORT
// =============================================

export const exportQuerySchema = z.object({
  format: z.enum(['xlsx', 'csv', 'json']).default('xlsx'),
  includePhotos: z.string().transform((val) => val === 'true').default(false),
  includeMetadata: z.string().transform((val) => val === 'true').default(false),
  includeCollectorInfo: z.string().transform((val) => val === 'true').default(true),
  dateRange: z.object({
    start: z.string().datetime().optional(),
    end: z.string().datetime().optional(),
  }).optional(),
  collectorTypes: z.array(z.enum(['USER', 'SHARED_USER', 'PUBLIC'])).optional(),
});

// =============================================
// SCHEMAS POUR LES COMMENTAIRES
// =============================================

export const addCommentSchema = z.object({
  content: z.string()
    .min(1, 'Le contenu du commentaire est requis')
    .max(2000, 'Le commentaire ne peut pas dépasser 2000 caractères')
    .transform((val) => val.trim()),
});

export const updateCommentSchema = z.object({
  content: z.string()
    .min(1, 'Le contenu du commentaire est requis')
    .max(2000, 'Le commentaire ne peut pas dépasser 2000 caractères')
    .transform((val) => val.trim()),
});

// =============================================
// SCHEMAS POUR LES REQUÊTES DE RECHERCHE
// =============================================

export const formSearchQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
  search: z.string().max(200).optional(),
  activityId: z.string().cuid().optional(),
  creatorId: z.string().cuid().optional(),
  isActive: z.string().transform((val) => val === 'true').optional(),
  includeShared: z.string().transform((val) => val === 'true').default(true),
  includePublic: z.string().transform((val) => val === 'true').default(false),
  collectorType: z.enum(['USER', 'SHARED_USER', 'PUBLIC', 'ALL']).default('ALL'),
});

// =============================================
// SCHEMAS POUR LES STATISTIQUES
// =============================================

export const statsQuerySchema = z.object({
  period: z.string().transform(Number).pipe(z.number().min(1).max(365)).optional(),
  type: z.enum(['overview', 'detailed', 'responses', 'photos', 'collection']).default('overview'),
  includePhotos: z.boolean().default(true),
  groupBy: z.enum(['day', 'week', 'month']).default('day'),
});

// =============================================
// SERVICE DE VALIDATION DES PHOTOS
// =============================================

export class PhotoValidationService {
  
  static validatePhotoUpload(photoData: any, maxSize: number = 5 * 1024 * 1024): {
    isValid: boolean;
    error?: string;
    processedPhoto?: any;
    sizeReduced?: boolean;
  } {
    try {
      const validatedData = photoDataSchema.parse(photoData);
      
      const buffer = Buffer.from(validatedData.base64, 'base64');
      const sizeInBytes = buffer.length;
      
      if (sizeInBytes > maxSize) {
        return {
          isValid: false,
          error: `La photo est trop volumineusse. Taille max: ${Math.round(maxSize / (1024 * 1024))}MB`
        };
      }
      
      const mimeType = this.detectMimeType(buffer);
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) {
        return {
          isValid: false,
          error: 'Type de fichier non supporté. Utilisez JPEG, PNG ou WebP.'
        };
      }
      
      return {
        isValid: true,
        processedPhoto: {
          ...validatedData,
          mimeType,
          sizeInBytes
        }
      };
      
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Données photo invalides'
      };
    }
  }
  
  private static detectMimeType(buffer: Buffer): string {
    if (buffer[0] === 0xFF && buffer[1] === 0xD8) return 'image/jpeg';
    if (buffer[0] === 0x89 && buffer[1] === 0x50) return 'image/png';
    if (buffer.slice(8, 12).toString() === 'WEBP') return 'image/webp';
    return 'unknown';
  }
}

// =============================================
// SERVICE DE VALIDATION MÉTIER
// =============================================

export class FormBusinessValidation {
  
  static validateSubmissionAccess(
    formData: any, 
    userId: string | null, 
    userRole: string | null, 
    collectorType: 'USER' | 'SHARED_USER' | 'PUBLIC'
  ): { canSubmit: boolean; reason?: string } {
    
    if (collectorType === 'PUBLIC') {
      if (!formData.isPublic || !formData.shareToken) {
        return { canSubmit: false, reason: 'Ce formulaire n\'est pas accessible publiquement' };
      }
      return { canSubmit: true };
    }
    
    if (!userId || !userRole) {
      return { canSubmit: false, reason: 'Authentification requise' };
    }
    
    if (formData.creatorId === userId) {
      return { canSubmit: true };
    }
    
    if (formData.activity?.project?.participants?.some(
      (p: any) => p.userId === userId && p.isActive
    )) {
      return { canSubmit: true };
    }
    
    if (collectorType === 'SHARED_USER') {
      return { canSubmit: true };
    }
    
    return { canSubmit: false, reason: 'Accès refusé à ce formulaire' };
  }
  
  static validateViewResponsesAccess(
    formData: any,
    userId: string,
    userRole: string
  ): { canView: boolean; reason?: string } {
    
    if (userRole === 'ADMINISTRATEUR') {
      return { canView: true };
    }
    
    if (formData.creatorId === userId) {
      return { canView: true };
    }
    
    if (formData.activity?.project?.participants?.some(
      (p: any) => p.userId === userId && p.isActive
    )) {
      if (formData.activity.project.creatorId === userId) {
        return { canView: true };
      }
      
      if (['CHERCHEUR', 'TECHNICIEN_SUPERIEUR'].includes(userRole)) {
        return { canView: true };
      }
    }
    
    return { canView: false, reason: 'Permissions insuffisantes pour voir les réponses' };
  }
  
  static validateFormSharing(
    formData: any,
    userId: string,
    userRole: string,
    shareData: any
  ): { canShare: boolean; reason?: string } {
    
    if (formData.creatorId !== userId && userRole !== 'ADMINISTRATEUR') {
      return { canShare: false, reason: 'Seul le créateur peut partager ce formulaire' };
    }
    
    if (shareData.maxSubmissions && shareData.maxSubmissions > 1000) {
      return { canShare: false, reason: 'Limite de soumissions trop élevée (max 1000)' };
    }
    
    return { canShare: true };
  }
}

// =============================================
// UTILITAIRES DE VALIDATION
// =============================================

export const validateShareToken = (token: string): boolean => {
  return /^[a-zA-Z0-9]{32}$/.test(token);
};

export const validateDeviceId = (deviceId: string): boolean => {
  return /^[a-zA-Z0-9-_]{8,64}$/.test(deviceId);
};

// =============================================
// EXPORTS
// =============================================

export {
  photoDataSchema,
  formFieldSchema,
  formSchemaSchema,
};