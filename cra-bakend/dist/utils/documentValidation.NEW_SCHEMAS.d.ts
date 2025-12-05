import { z } from 'zod';
/**
 * Schéma pour la mise à jour des métadonnées
 * PATCH /documents/:id
 */
export declare const updateDocumentMetadataSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    type: z.ZodOptional<z.ZodEnum<any>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
    isPublic: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
/**
 * Schéma pour la liaison d'un document
 * POST /documents/:id/link
 */
export declare const linkDocumentSchema: z.ZodObject<{
    entityType: z.ZodEnum<{
        project: "project";
        activity: "activity";
        task: "task";
        event: "event";
        seminar: "seminar";
        training: "training";
        internship: "internship";
        supervision: "supervision";
        knowledgeTransfer: "knowledgeTransfer";
    }>;
    entityId: z.ZodString;
}, z.core.$strip>;
/**
 * Schéma pour la déliaison d'un document
 * DELETE /documents/:id/link
 */
export declare const unlinkDocumentSchema: z.ZodObject<{
    entityType: z.ZodOptional<z.ZodEnum<{
        project: "project";
        activity: "activity";
        task: "task";
        event: "event";
        seminar: "seminar";
        training: "training";
        internship: "internship";
        supervision: "supervision";
        knowledgeTransfer: "knowledgeTransfer";
    }>>;
    entityId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Schéma pour la mise à jour des permissions de partage
 * PATCH /documents/:id/shares/:shareId
 */
export declare const updateSharePermissionsSchema: z.ZodObject<{
    canEdit: z.ZodOptional<z.ZodBoolean>;
    canDelete: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
/**
 * Schéma pour le partage avec expiration
 * Extension du schéma shareDocument existant
 */
export declare const shareDocumentWithExpirationSchema: z.ZodObject<{
    userIds: z.ZodArray<z.ZodString>;
    canEdit: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    canDelete: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    expiresAt: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Extension du schéma documentListQuery pour inclure les favoris
 */
export declare const documentListQueryExtendedSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
    type: z.ZodOptional<z.ZodEnum<any>>;
    ownerId: z.ZodOptional<z.ZodString>;
    projectId: z.ZodOptional<z.ZodString>;
    activityId: z.ZodOptional<z.ZodString>;
    taskId: z.ZodOptional<z.ZodString>;
    seminarId: z.ZodOptional<z.ZodString>;
    trainingId: z.ZodOptional<z.ZodString>;
    internshipId: z.ZodOptional<z.ZodString>;
    supervisionId: z.ZodOptional<z.ZodString>;
    knowledgeTransferId: z.ZodOptional<z.ZodString>;
    eventId: z.ZodOptional<z.ZodString>;
    isPublic: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
    search: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodString>, z.ZodString]>>;
    mimeType: z.ZodOptional<z.ZodString>;
    favoritesOnly: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
    includeDeleted: z.ZodDefault<z.ZodOptional<z.ZodCoercedBoolean<unknown>>>;
    sortBy: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        createdAt: "createdAt";
        updatedAt: "updatedAt";
        title: "title";
        size: "size";
        downloadCount: "downloadCount";
        viewCount: "viewCount";
    }>>>;
    sortOrder: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>>;
}, z.core.$strip>;
export type UpdateDocumentMetadataRequest = z.infer<typeof updateDocumentMetadataSchema>;
export type LinkDocumentRequest = z.infer<typeof linkDocumentSchema>;
export type UnlinkDocumentRequest = z.infer<typeof unlinkDocumentSchema>;
export type UpdateSharePermissionsRequest = z.infer<typeof updateSharePermissionsSchema>;
export type ShareDocumentWithExpirationRequest = z.infer<typeof shareDocumentWithExpirationSchema>;
export type DocumentListQueryExtended = z.infer<typeof documentListQueryExtendedSchema>;
/**
 * Middleware pour valider les paramètres d'ID
 */
export declare const validateDocumentIdParam: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const validateShareIdParam: z.ZodObject<{
    id: z.ZodString;
    shareId: z.ZodString;
}, z.core.$strip>;
/**
 * Valide si une date d'expiration est valide
 */
export declare function validateExpirationDate(date: string | Date): boolean;
/**
 * Valide si un type d'entité est valide
 */
export declare function validateEntityType(entityType: string): boolean;
/**
 * Valide si les tags sont valides
 */
export declare function validateTags(tags: string[]): {
    valid: boolean;
    error?: string;
};
declare const _default: {
    updateDocumentMetadataSchema: z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
        description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        type: z.ZodOptional<z.ZodEnum<any>>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
        isPublic: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>;
    linkDocumentSchema: z.ZodObject<{
        entityType: z.ZodEnum<{
            project: "project";
            activity: "activity";
            task: "task";
            event: "event";
            seminar: "seminar";
            training: "training";
            internship: "internship";
            supervision: "supervision";
            knowledgeTransfer: "knowledgeTransfer";
        }>;
        entityId: z.ZodString;
    }, z.core.$strip>;
    unlinkDocumentSchema: z.ZodObject<{
        entityType: z.ZodOptional<z.ZodEnum<{
            project: "project";
            activity: "activity";
            task: "task";
            event: "event";
            seminar: "seminar";
            training: "training";
            internship: "internship";
            supervision: "supervision";
            knowledgeTransfer: "knowledgeTransfer";
        }>>;
        entityId: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    updateSharePermissionsSchema: z.ZodObject<{
        canEdit: z.ZodOptional<z.ZodBoolean>;
        canDelete: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>;
    shareDocumentWithExpirationSchema: z.ZodObject<{
        userIds: z.ZodArray<z.ZodString>;
        canEdit: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        canDelete: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        expiresAt: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    documentListQueryExtendedSchema: z.ZodObject<{
        page: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
        limit: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
        type: z.ZodOptional<z.ZodEnum<any>>;
        ownerId: z.ZodOptional<z.ZodString>;
        projectId: z.ZodOptional<z.ZodString>;
        activityId: z.ZodOptional<z.ZodString>;
        taskId: z.ZodOptional<z.ZodString>;
        seminarId: z.ZodOptional<z.ZodString>;
        trainingId: z.ZodOptional<z.ZodString>;
        internshipId: z.ZodOptional<z.ZodString>;
        supervisionId: z.ZodOptional<z.ZodString>;
        knowledgeTransferId: z.ZodOptional<z.ZodString>;
        eventId: z.ZodOptional<z.ZodString>;
        isPublic: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
        search: z.ZodOptional<z.ZodString>;
        tags: z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodString>, z.ZodString]>>;
        mimeType: z.ZodOptional<z.ZodString>;
        favoritesOnly: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
        includeDeleted: z.ZodDefault<z.ZodOptional<z.ZodCoercedBoolean<unknown>>>;
        sortBy: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
            createdAt: "createdAt";
            updatedAt: "updatedAt";
            title: "title";
            size: "size";
            downloadCount: "downloadCount";
            viewCount: "viewCount";
        }>>>;
        sortOrder: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
            asc: "asc";
            desc: "desc";
        }>>>;
    }, z.core.$strip>;
    validateDocumentIdParam: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    validateShareIdParam: z.ZodObject<{
        id: z.ZodString;
        shareId: z.ZodString;
    }, z.core.$strip>;
    validateExpirationDate: typeof validateExpirationDate;
    validateEntityType: typeof validateEntityType;
    validateTags: typeof validateTags;
};
export default _default;
//# sourceMappingURL=documentValidation.NEW_SCHEMAS.d.ts.map