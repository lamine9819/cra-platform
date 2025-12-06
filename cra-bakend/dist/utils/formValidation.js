"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formSchemaSchema = exports.formFieldSchema = exports.photoDataSchema = exports.validateDeviceId = exports.validateShareToken = exports.FormBusinessValidation = exports.PhotoValidationService = exports.statsQuerySchema = exports.formSearchQuerySchema = exports.updateCommentSchema = exports.addCommentSchema = exports.exportQuerySchema = exports.syncOfflineSchema = exports.offlineDataSchema = exports.uploadPhotoSchema = exports.publicShareSchema = exports.shareFormSchema = exports.submitFormResponseSchema = exports.updateFormSchema = exports.createFormSchema = void 0;
// src/utils/formValidation.ts - Version corrigée sans doublons
const zod_1 = require("zod");
// =============================================
// VALIDATIONS DE BASE ADAPTÉES
// =============================================
// Validation pour les données de photo
const photoDataSchema = zod_1.z.object({
    type: zod_1.z.literal('photo'),
    base64: zod_1.z.string().min(1, 'Données photo requises'),
    filename: zod_1.z.string().optional(),
    mimeType: zod_1.z.string().regex(/^image\/(jpeg|jpg|png|webp)$/, 'Type de fichier non supporté').optional(),
    caption: zod_1.z.string().max(200, 'Légende trop longue').optional(),
    latitude: zod_1.z.number().min(-90).max(90).optional(),
    longitude: zod_1.z.number().min(-180).max(180).optional(),
    takenAt: zod_1.z.string().datetime().optional(),
}).refine((data) => {
    try {
        const buffer = Buffer.from(data.base64, 'base64');
        const isJPEG = buffer[0] === 0xFF && buffer[1] === 0xD8;
        const isPNG = buffer[0] === 0x89 && buffer[1] === 0x50;
        const isWebP = buffer.slice(8, 12).toString() === 'WEBP';
        return isJPEG || isPNG || isWebP;
    }
    catch {
        return false;
    }
}, {
    message: "Données d'image invalides"
});
exports.photoDataSchema = photoDataSchema;
// Schema pour valider un champ de formulaire avec photos
const formFieldSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, 'ID de champ requis'),
    type: zod_1.z.enum(['text', 'number', 'email', 'textarea', 'select', 'checkbox', 'radio', 'date', 'time', 'file', 'photo']),
    label: zod_1.z.string().min(1, 'Label requis'),
    placeholder: zod_1.z.string().optional(),
    required: zod_1.z.boolean().default(false),
    validation: zod_1.z.object({
        min: zod_1.z.number().optional(),
        max: zod_1.z.number().optional(),
        pattern: zod_1.z.string().optional(),
        message: zod_1.z.string().optional(),
        maxFileSize: zod_1.z.number().positive().optional(),
        acceptedTypes: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional(),
    options: zod_1.z.array(zod_1.z.object({
        value: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
        label: zod_1.z.string(),
    })).optional(),
    defaultValue: zod_1.z.any().optional(),
    description: zod_1.z.string().optional(),
    photoConfig: zod_1.z.object({
        maxSize: zod_1.z.number().positive().default(5 * 1024 * 1024),
        quality: zod_1.z.number().min(0.1).max(1).default(0.8),
        enableGPS: zod_1.z.boolean().default(true),
        enableCaption: zod_1.z.boolean().default(true),
        maxPhotos: zod_1.z.number().positive().default(5),
    }).optional(),
});
exports.formFieldSchema = formFieldSchema;
// Schema pour le schéma complet du formulaire
const formSchemaSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Titre du schéma requis'),
    description: zod_1.z.string().optional(),
    version: zod_1.z.string().default('1.0.0'),
    fields: zod_1.z.array(formFieldSchema).min(1, 'Au moins un champ est requis'),
    settings: zod_1.z.object({
        allowMultipleSubmissions: zod_1.z.boolean().default(true),
        showProgress: zod_1.z.boolean().default(false),
        submitButtonText: zod_1.z.string().default('Soumettre'),
        successMessage: zod_1.z.string().default('Formulaire soumis avec succès'),
        enableOfflineMode: zod_1.z.boolean().default(true),
        maxSubmissionsPerUser: zod_1.z.number().positive().optional(),
    }).optional(),
});
exports.formSchemaSchema = formSchemaSchema;
// =============================================
// SCHEMAS POUR LES FORMULAIRES
// =============================================
exports.createFormSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(200),
    description: zod_1.z.string().max(2000).optional(),
    schema: formSchemaSchema,
    activityId: zod_1.z.string().cuid().optional(),
    isActive: zod_1.z.boolean().default(true),
    enablePublicAccess: zod_1.z.boolean().default(false),
});
exports.updateFormSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).max(200).optional(),
    description: zod_1.z.string().max(2000).optional(),
    schema: formSchemaSchema.optional(),
    isActive: zod_1.z.boolean().optional(),
    enablePublicAccess: zod_1.z.boolean().optional(),
});
// =============================================
// SCHEMAS POUR LES RÉPONSES AVEC PHOTOS
// =============================================
exports.submitFormResponseSchema = zod_1.z.object({
    data: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).refine((data) => Object.keys(data).length > 0, { message: "Au moins un champ doit être rempli" }),
    collectorName: zod_1.z.string().min(1).max(100).optional(),
    collectorEmail: zod_1.z.string().email().optional(),
    photos: zod_1.z.array(photoDataSchema).optional(),
    isOffline: zod_1.z.boolean().default(false),
    deviceId: zod_1.z.string().optional(),
});
// =============================================
// SCHEMAS POUR LE PARTAGE
// =============================================
exports.shareFormSchema = zod_1.z.object({
    targetUserId: zod_1.z.string().cuid().optional(),
    canCollect: zod_1.z.boolean().default(true),
    canExport: zod_1.z.boolean().default(false),
    maxSubmissions: zod_1.z.number().positive().optional(),
    expiresAt: zod_1.z.string().datetime().optional(),
    shareType: zod_1.z.enum(['INTERNAL', 'EXTERNAL']),
});
exports.publicShareSchema = zod_1.z.object({
    maxSubmissions: zod_1.z.number().positive().optional(),
    expiresAt: zod_1.z.string().datetime().optional(),
});
// =============================================
// SCHEMAS POUR L'UPLOAD DE PHOTOS
// =============================================
exports.uploadPhotoSchema = zod_1.z.object({
    fieldId: zod_1.z.string().min(1, 'ID de champ requis'),
    photoData: photoDataSchema,
    formId: zod_1.z.string().cuid(),
});
// =============================================
// SCHEMAS POUR LA SYNCHRONISATION OFFLINE
// =============================================
exports.offlineDataSchema = zod_1.z.object({
    formId: zod_1.z.string().cuid(),
    deviceId: zod_1.z.string().min(1, 'ID de périphérique requis'),
    data: zod_1.z.record(zod_1.z.string(), zod_1.z.any()),
    photos: zod_1.z.array(photoDataSchema).optional(),
    submittedAt: zod_1.z.string().datetime().optional(),
});
exports.syncOfflineSchema = zod_1.z.object({
    deviceId: zod_1.z.string().min(1, 'ID de périphérique requis'),
    responses: zod_1.z.array(exports.offlineDataSchema),
});
// =============================================
// SCHEMAS POUR L'EXPORT
// =============================================
exports.exportQuerySchema = zod_1.z.object({
    format: zod_1.z.enum(['xlsx', 'csv', 'json']).default('xlsx'),
    includePhotos: zod_1.z.string().transform((val) => val === 'true').default(false),
    includeMetadata: zod_1.z.string().transform((val) => val === 'true').default(false),
    includeCollectorInfo: zod_1.z.string().transform((val) => val === 'true').default(true),
    dateRange: zod_1.z.object({
        start: zod_1.z.string().datetime().optional(),
        end: zod_1.z.string().datetime().optional(),
    }).optional(),
    collectorTypes: zod_1.z.array(zod_1.z.enum(['USER', 'SHARED_USER', 'PUBLIC'])).optional(),
});
// =============================================
// SCHEMAS POUR LES COMMENTAIRES
// =============================================
exports.addCommentSchema = zod_1.z.object({
    content: zod_1.z.string()
        .min(1, 'Le contenu du commentaire est requis')
        .max(2000, 'Le commentaire ne peut pas dépasser 2000 caractères')
        .transform((val) => val.trim()),
});
exports.updateCommentSchema = zod_1.z.object({
    content: zod_1.z.string()
        .min(1, 'Le contenu du commentaire est requis')
        .max(2000, 'Le commentaire ne peut pas dépasser 2000 caractères')
        .transform((val) => val.trim()),
});
// =============================================
// SCHEMAS POUR LES REQUÊTES DE RECHERCHE
// =============================================
exports.formSearchQuerySchema = zod_1.z.object({
    page: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(1)).optional(),
    limit: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(1).max(100)).optional(),
    search: zod_1.z.string().max(200).optional(),
    activityId: zod_1.z.string().cuid().optional(),
    creatorId: zod_1.z.string().cuid().optional(),
    isActive: zod_1.z.string().transform((val) => val === 'true').optional(),
    includeShared: zod_1.z.string().transform((val) => val === 'true').default(true),
    includePublic: zod_1.z.string().transform((val) => val === 'true').default(false),
    collectorType: zod_1.z.enum(['USER', 'SHARED_USER', 'PUBLIC', 'ALL']).default('ALL'),
});
// =============================================
// SCHEMAS POUR LES STATISTIQUES
// =============================================
exports.statsQuerySchema = zod_1.z.object({
    period: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(1).max(365)).optional(),
    type: zod_1.z.enum(['overview', 'detailed', 'responses', 'photos', 'collection']).default('overview'),
    includePhotos: zod_1.z.boolean().default(true),
    groupBy: zod_1.z.enum(['day', 'week', 'month']).default('day'),
});
// =============================================
// SERVICE DE VALIDATION DES PHOTOS
// =============================================
class PhotoValidationService {
    static validatePhotoUpload(photoData, maxSize = 5 * 1024 * 1024) {
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
        }
        catch (error) {
            return {
                isValid: false,
                error: error instanceof Error ? error.message : 'Données photo invalides'
            };
        }
    }
    static detectMimeType(buffer) {
        if (buffer[0] === 0xFF && buffer[1] === 0xD8)
            return 'image/jpeg';
        if (buffer[0] === 0x89 && buffer[1] === 0x50)
            return 'image/png';
        if (buffer.slice(8, 12).toString() === 'WEBP')
            return 'image/webp';
        return 'unknown';
    }
}
exports.PhotoValidationService = PhotoValidationService;
// =============================================
// SERVICE DE VALIDATION MÉTIER
// =============================================
class FormBusinessValidation {
    static validateSubmissionAccess(formData, userId, userRole, collectorType) {
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
        if (formData.activity?.project?.participants?.some((p) => p.userId === userId && p.isActive)) {
            return { canSubmit: true };
        }
        if (collectorType === 'SHARED_USER') {
            return { canSubmit: true };
        }
        return { canSubmit: false, reason: 'Accès refusé à ce formulaire' };
    }
    static validateViewResponsesAccess(formData, userId, userRole) {
        if (userRole === 'ADMINISTRATEUR') {
            return { canView: true };
        }
        if (formData.creatorId === userId) {
            return { canView: true };
        }
        if (formData.activity?.project?.participants?.some((p) => p.userId === userId && p.isActive)) {
            if (formData.activity.project.creatorId === userId) {
                return { canView: true };
            }
            if (['CHERCHEUR', 'TECHNICIEN_SUPERIEUR'].includes(userRole)) {
                return { canView: true };
            }
        }
        return { canView: false, reason: 'Permissions insuffisantes pour voir les réponses' };
    }
    static validateFormSharing(formData, userId, userRole, shareData) {
        if (formData.creatorId !== userId && userRole !== 'ADMINISTRATEUR') {
            return { canShare: false, reason: 'Seul le créateur peut partager ce formulaire' };
        }
        if (shareData.maxSubmissions && shareData.maxSubmissions > 1000) {
            return { canShare: false, reason: 'Limite de soumissions trop élevée (max 1000)' };
        }
        return { canShare: true };
    }
}
exports.FormBusinessValidation = FormBusinessValidation;
// =============================================
// UTILITAIRES DE VALIDATION
// =============================================
const validateShareToken = (token) => {
    return /^[a-zA-Z0-9]{32}$/.test(token);
};
exports.validateShareToken = validateShareToken;
const validateDeviceId = (deviceId) => {
    return /^[a-zA-Z0-9-_]{8,64}$/.test(deviceId);
};
exports.validateDeviceId = validateDeviceId;
//# sourceMappingURL=formValidation.js.map