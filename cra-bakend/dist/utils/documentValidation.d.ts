import { z } from 'zod';
export declare const DocumentTypeEnum: z.ZodEnum<{
    AUTRE: "AUTRE";
    RAPPORT: "RAPPORT";
    FICHE_ACTIVITE: "FICHE_ACTIVITE";
    FICHE_TECHNIQUE: "FICHE_TECHNIQUE";
    FICHE_INDIVIDUELLE: "FICHE_INDIVIDUELLE";
    DONNEES_EXPERIMENTALES: "DONNEES_EXPERIMENTALES";
    FORMULAIRE: "FORMULAIRE";
    PUBLICATION_SCIENTIFIQUE: "PUBLICATION_SCIENTIFIQUE";
    MEMOIRE: "MEMOIRE";
    THESE: "THESE";
    IMAGE: "IMAGE";
    PRESENTATION: "PRESENTATION";
}>;
export declare const uploadFileSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    type: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        AUTRE: "AUTRE";
        RAPPORT: "RAPPORT";
        FICHE_ACTIVITE: "FICHE_ACTIVITE";
        FICHE_TECHNIQUE: "FICHE_TECHNIQUE";
        FICHE_INDIVIDUELLE: "FICHE_INDIVIDUELLE";
        DONNEES_EXPERIMENTALES: "DONNEES_EXPERIMENTALES";
        FORMULAIRE: "FORMULAIRE";
        PUBLICATION_SCIENTIFIQUE: "PUBLICATION_SCIENTIFIQUE";
        MEMOIRE: "MEMOIRE";
        THESE: "THESE";
        IMAGE: "IMAGE";
        PRESENTATION: "PRESENTATION";
    }>>>;
    tags: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodPipe<z.ZodString, z.ZodTransform<any[], string>>, z.ZodArray<z.ZodString>]>>>;
    isPublic: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodPipe<z.ZodString, z.ZodTransform<boolean, string>>, z.ZodBoolean]>>>;
    projectId: z.ZodOptional<z.ZodString>;
    activityId: z.ZodOptional<z.ZodString>;
    taskId: z.ZodOptional<z.ZodString>;
    seminarId: z.ZodOptional<z.ZodString>;
    trainingId: z.ZodOptional<z.ZodString>;
    internshipId: z.ZodOptional<z.ZodString>;
    supervisionId: z.ZodOptional<z.ZodString>;
    knowledgeTransferId: z.ZodOptional<z.ZodString>;
    eventId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const shareDocumentSchema: z.ZodObject<{
    userIds: z.ZodArray<z.ZodString>;
    canEdit: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    canDelete: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
export declare const documentListQuerySchema: z.ZodObject<{
    page: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<number, string | undefined>>;
    limit: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<number, string | undefined>>;
    type: z.ZodOptional<z.ZodEnum<{
        AUTRE: "AUTRE";
        RAPPORT: "RAPPORT";
        FICHE_ACTIVITE: "FICHE_ACTIVITE";
        FICHE_TECHNIQUE: "FICHE_TECHNIQUE";
        FICHE_INDIVIDUELLE: "FICHE_INDIVIDUELLE";
        DONNEES_EXPERIMENTALES: "DONNEES_EXPERIMENTALES";
        FORMULAIRE: "FORMULAIRE";
        PUBLICATION_SCIENTIFIQUE: "PUBLICATION_SCIENTIFIQUE";
        MEMOIRE: "MEMOIRE";
        THESE: "THESE";
        IMAGE: "IMAGE";
        PRESENTATION: "PRESENTATION";
    }>>;
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
    mimeType: z.ZodOptional<z.ZodString>;
    isPublic: z.ZodOptional<z.ZodUnion<readonly [z.ZodPipe<z.ZodString, z.ZodTransform<boolean, string>>, z.ZodBoolean]>>;
    tags: z.ZodOptional<z.ZodUnion<readonly [z.ZodPipe<z.ZodString, z.ZodTransform<string[], string>>, z.ZodArray<z.ZodString>]>>;
    search: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type UploadFileRequest = z.infer<typeof uploadFileSchema>;
export type ShareDocumentRequest = z.infer<typeof shareDocumentSchema>;
export type DocumentListQuery = z.infer<typeof documentListQuerySchema>;
/**
 * Schéma pour la mise à jour des métadonnées
 * PATCH /documents/:id
 */
export declare const updateDocumentMetadataSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    type: z.ZodEnum<{
        AUTRE: "AUTRE";
        RAPPORT: "RAPPORT";
        FICHE_ACTIVITE: "FICHE_ACTIVITE";
        FICHE_TECHNIQUE: "FICHE_TECHNIQUE";
        FICHE_INDIVIDUELLE: "FICHE_INDIVIDUELLE";
        DONNEES_EXPERIMENTALES: "DONNEES_EXPERIMENTALES";
        FORMULAIRE: "FORMULAIRE";
        PUBLICATION_SCIENTIFIQUE: "PUBLICATION_SCIENTIFIQUE";
        MEMOIRE: "MEMOIRE";
        THESE: "THESE";
        IMAGE: "IMAGE";
        PRESENTATION: "PRESENTATION";
    }>;
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
        training: "training";
        internship: "internship";
        supervision: "supervision";
        knowledgeTransfer: "knowledgeTransfer";
        seminar: "seminar";
        event: "event";
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
        training: "training";
        internship: "internship";
        supervision: "supervision";
        knowledgeTransfer: "knowledgeTransfer";
        seminar: "seminar";
        event: "event";
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
    type: z.ZodOptional<z.ZodEnum<{
        AUTRE: "AUTRE";
        RAPPORT: "RAPPORT";
        FICHE_ACTIVITE: "FICHE_ACTIVITE";
        FICHE_TECHNIQUE: "FICHE_TECHNIQUE";
        FICHE_INDIVIDUELLE: "FICHE_INDIVIDUELLE";
        DONNEES_EXPERIMENTALES: "DONNEES_EXPERIMENTALES";
        FORMULAIRE: "FORMULAIRE";
        PUBLICATION_SCIENTIFIQUE: "PUBLICATION_SCIENTIFIQUE";
        MEMOIRE: "MEMOIRE";
        THESE: "THESE";
        IMAGE: "IMAGE";
        PRESENTATION: "PRESENTATION";
    }>>;
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
        viewCount: "viewCount";
        downloadCount: "downloadCount";
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
//# sourceMappingURL=documentValidation.d.ts.map