"use strict";
// src/utils/documentValidation.ts - Validation complète mise à jour
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateShareIdParam = exports.validateDocumentIdParam = exports.documentListQueryExtendedSchema = exports.shareDocumentWithExpirationSchema = exports.updateSharePermissionsSchema = exports.unlinkDocumentSchema = exports.linkDocumentSchema = exports.updateDocumentMetadataSchema = exports.documentListQuerySchema = exports.shareDocumentSchema = exports.uploadFileSchema = exports.DocumentTypeEnum = void 0;
exports.validateExpirationDate = validateExpirationDate;
exports.validateEntityType = validateEntityType;
exports.validateTags = validateTags;
const zod_1 = require("zod");
// Énumération complète des types de documents selon le schéma Prisma
exports.DocumentTypeEnum = zod_1.z.enum([
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
exports.uploadFileSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Le titre est requis').max(255, 'Le titre est trop long'),
    description: zod_1.z.string().optional(),
    type: exports.DocumentTypeEnum.optional().default('AUTRE'),
    // Transformation des tags : string JSON -> array
    tags: zod_1.z.union([
        zod_1.z.string().transform((str) => {
            try {
                const parsed = JSON.parse(str);
                return Array.isArray(parsed) ? parsed : [];
            }
            catch {
                return [];
            }
        }),
        zod_1.z.array(zod_1.z.string())
    ]).optional().default([]),
    // Transformation de isPublic : string -> boolean
    isPublic: zod_1.z.union([
        zod_1.z.string().transform((str) => str === 'true'),
        zod_1.z.boolean()
    ]).optional().default(false),
    // Relations existantes
    projectId: zod_1.z.string().cuid().optional(),
    activityId: zod_1.z.string().cuid().optional(),
    taskId: zod_1.z.string().cuid().optional(),
    seminarId: zod_1.z.string().cuid().optional(),
    // Nouvelles relations selon le schéma Prisma
    trainingId: zod_1.z.string().cuid().optional(),
    internshipId: zod_1.z.string().cuid().optional(),
    supervisionId: zod_1.z.string().cuid().optional(),
    knowledgeTransferId: zod_1.z.string().cuid().optional(),
    eventId: zod_1.z.string().cuid().optional()
});
// Schéma pour le partage de document
exports.shareDocumentSchema = zod_1.z.object({
    userIds: zod_1.z.array(zod_1.z.string().cuid()).min(1, 'Au moins un utilisateur doit être spécifié'),
    canEdit: zod_1.z.boolean().optional().default(false),
    canDelete: zod_1.z.boolean().optional().default(false)
});
// Schéma pour les requêtes de liste de documents
exports.documentListQuerySchema = zod_1.z.object({
    page: zod_1.z.string().optional().transform((val) => val ? parseInt(val, 10) : 1),
    limit: zod_1.z.string().optional().transform((val) => val ? Math.min(parseInt(val, 10), 100) : 10),
    type: exports.DocumentTypeEnum.optional(),
    ownerId: zod_1.z.string().cuid().optional(),
    // Relations existantes
    projectId: zod_1.z.string().cuid().optional(),
    activityId: zod_1.z.string().cuid().optional(),
    taskId: zod_1.z.string().cuid().optional(),
    seminarId: zod_1.z.string().cuid().optional(),
    // Nouvelles relations
    trainingId: zod_1.z.string().cuid().optional(),
    internshipId: zod_1.z.string().cuid().optional(),
    supervisionId: zod_1.z.string().cuid().optional(),
    knowledgeTransferId: zod_1.z.string().cuid().optional(),
    eventId: zod_1.z.string().cuid().optional(),
    // Autres filtres
    mimeType: zod_1.z.string().optional(),
    isPublic: zod_1.z.union([
        zod_1.z.string().transform((str) => str === 'true'),
        zod_1.z.boolean()
    ]).optional(),
    tags: zod_1.z.union([
        zod_1.z.string().transform((str) => [str]),
        zod_1.z.array(zod_1.z.string())
    ]).optional(),
    search: zod_1.z.string().optional()
});
// =============================================
// PHASE 1 - SCHÉMAS CRITIQUES (NOUVEAUX)
// =============================================
/**
 * Schéma pour la mise à jour des métadonnées
 * PATCH /documents/:id
 */
exports.updateDocumentMetadataSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Le titre est requis').max(255).optional(),
    description: zod_1.z.string().max(1000).optional().nullable(),
    type: exports.DocumentTypeEnum,
    tags: zod_1.z.array(zod_1.z.string()).max(20, 'Maximum 20 tags').optional(),
    isPublic: zod_1.z.boolean().optional()
}).refine(data => Object.keys(data).length > 0, { message: 'Au moins un champ doit être fourni pour la mise à jour' });
/**
 * Schéma pour la liaison d'un document
 * POST /documents/:id/link
 */
exports.linkDocumentSchema = zod_1.z.object({
    entityType: zod_1.z.enum([
        'project',
        'activity',
        'task',
        'seminar',
        'training',
        'internship',
        'supervision',
        'knowledgeTransfer',
        'event'
    ], { message: 'Type d\'entité invalide' }),
    entityId: zod_1.z.string().cuid('ID d\'entité invalide')
});
/**
 * Schéma pour la déliaison d'un document
 * DELETE /documents/:id/link
 */
exports.unlinkDocumentSchema = zod_1.z.object({
    entityType: zod_1.z.enum([
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
    entityId: zod_1.z.string().cuid().optional()
}).refine(data => {
    // Si entityType est fourni, entityId doit l'être aussi
    if (data.entityType && !data.entityId) {
        return false;
    }
    return true;
}, { message: 'Si entityType est fourni, entityId est requis' });
// =============================================
// PHASE 3 - SCHÉMAS PARTAGES AVANCÉS
// =============================================
/**
 * Schéma pour la mise à jour des permissions de partage
 * PATCH /documents/:id/shares/:shareId
 */
exports.updateSharePermissionsSchema = zod_1.z.object({
    canEdit: zod_1.z.boolean().optional(),
    canDelete: zod_1.z.boolean().optional()
}).refine(data => data.canEdit !== undefined || data.canDelete !== undefined, { message: 'Au moins une permission doit être spécifiée' });
/**
 * Schéma pour le partage avec expiration
 * Extension du schéma shareDocument existant
 */
exports.shareDocumentWithExpirationSchema = zod_1.z.object({
    userIds: zod_1.z.array(zod_1.z.string().cuid()).min(1, 'Au moins un utilisateur requis').max(50, 'Maximum 50 utilisateurs'),
    canEdit: zod_1.z.boolean().optional().default(false),
    canDelete: zod_1.z.boolean().optional().default(false),
    expiresAt: zod_1.z.string().datetime().optional() // ISO 8601 date string
}).refine(data => {
    // Si expiresAt est fourni, vérifier qu'il est dans le futur
    if (data.expiresAt) {
        const expirationDate = new Date(data.expiresAt);
        return expirationDate > new Date();
    }
    return true;
}, { message: 'La date d\'expiration doit être dans le futur' });
// =============================================
// SCHÉMAS POUR LES QUERY PARAMS
// =============================================
/**
 * Extension du schéma documentListQuery pour inclure les favoris
 */
exports.documentListQueryExtendedSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().optional().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).optional().default(20),
    // Filtres existants
    type: exports.DocumentTypeEnum.optional(),
    ownerId: zod_1.z.string().cuid().optional(),
    projectId: zod_1.z.string().cuid().optional(),
    activityId: zod_1.z.string().cuid().optional(),
    taskId: zod_1.z.string().cuid().optional(),
    seminarId: zod_1.z.string().cuid().optional(),
    trainingId: zod_1.z.string().cuid().optional(),
    internshipId: zod_1.z.string().cuid().optional(),
    supervisionId: zod_1.z.string().cuid().optional(),
    knowledgeTransferId: zod_1.z.string().cuid().optional(),
    eventId: zod_1.z.string().cuid().optional(),
    isPublic: zod_1.z.coerce.boolean().optional(),
    search: zod_1.z.string().max(100).optional(),
    tags: zod_1.z.array(zod_1.z.string()).or(zod_1.z.string()).optional(),
    mimeType: zod_1.z.string().optional(),
    // Nouveaux filtres
    favoritesOnly: zod_1.z.coerce.boolean().optional(), // Filtrer seulement les favoris
    includeDeleted: zod_1.z.coerce.boolean().optional().default(false), // Inclure les supprimés (admin seulement)
    // Tri
    sortBy: zod_1.z.enum(['title', 'createdAt', 'updatedAt', 'size', 'viewCount', 'downloadCount']).optional().default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional().default('desc')
});
// =============================================
// MIDDLEWARE DE VALIDATION
// =============================================
/**
 * Middleware pour valider les paramètres d'ID
 */
exports.validateDocumentIdParam = zod_1.z.object({
    id: zod_1.z.string().cuid('ID de document invalide')
});
exports.validateShareIdParam = zod_1.z.object({
    id: zod_1.z.string().cuid('ID de document invalide'),
    shareId: zod_1.z.string().cuid('ID de partage invalide')
});
// =============================================
// FONCTIONS UTILITAIRES DE VALIDATION
// =============================================
/**
 * Valide si une date d'expiration est valide
 */
function validateExpirationDate(date) {
    const expirationDate = typeof date === 'string' ? new Date(date) : date;
    return expirationDate > new Date();
}
/**
 * Valide si un type d'entité est valide
 */
function validateEntityType(entityType) {
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
function validateTags(tags) {
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
//# sourceMappingURL=documentValidation.js.map