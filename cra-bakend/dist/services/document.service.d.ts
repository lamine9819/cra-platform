import { UploadFileRequest, ShareDocumentRequest, DocumentListQuery, DocumentResponse } from '../types/document.types';
export declare class DocumentService {
    createDocument(file: Express.Multer.File, documentData: UploadFileRequest, ownerId: string, userRole: string): Promise<DocumentResponse>;
    listDocuments(userId: string, userRole: string, query: DocumentListQuery): Promise<{
        documents: DocumentResponse[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    getDocumentById(documentId: string, userId: string, userRole: string): Promise<DocumentResponse>;
    shareDocument(documentId: string, shareData: ShareDocumentRequest, userId: string, userRole: string): Promise<{
        message: string;
        shares: {
            id: any;
            canEdit: any;
            canDelete: any;
            sharedAt: any;
            sharedWith: any;
        }[];
    }>;
    deleteDocument(documentId: string, userId: string, userRole: string): Promise<void>;
    getDocumentFilePath(documentId: string, userId: string, userRole: string): Promise<{
        filepath: string;
        filename: string;
        mimeType: string;
    }>;
    private validateEntityAccess;
    private validateSpecificEntityAccess;
    private checkDocumentAccess;
    private canShareDocument;
    private canDeleteDocument;
    private getDocumentIncludes;
    private formatDocumentResponse;
    private canEditDocument;
    /**
     * Mettre à jour les métadonnées d'un document
     */
    updateDocumentMetadata(documentId: string, updateData: {
        title?: string;
        description?: string;
        type?: string;
        tags?: string[];
        isPublic?: boolean;
    }, userId: string, userRole: string): Promise<DocumentResponse>;
    /**
     * Lier un document à une entité
     */
    linkDocument(documentId: string, linkData: {
        entityType: 'project' | 'activity' | 'task' | 'seminar' | 'training' | 'internship' | 'supervision' | 'knowledgeTransfer' | 'event';
        entityId: string;
    }, userId: string, userRole: string): Promise<DocumentResponse>;
    /**
     * Délier un document d'une ou plusieurs entités
     */
    unlinkDocument(documentId: string, unlinkData: {
        entityType?: string;
        entityId?: string;
    }, userId: string, userRole: string): Promise<DocumentResponse>;
    /**
     * Obtenir les documents supprimés (corbeille)
     */
    getTrashDocuments(userId: string, userRole: string, query: any): Promise<{
        documents: DocumentResponse[];
        pagination: {
            page: any;
            limit: any;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    /**
     * Restaurer un document supprimé
     */
    restoreDocument(documentId: string, userId: string, userRole: string): Promise<DocumentResponse>;
    /**
     * Suppression définitive d'un document
     */
    permanentDeleteDocument(documentId: string, userId: string, userRole: string): Promise<void>;
    /**
     * Vider la corbeille (supprimer les documents > 30 jours)
     */
    emptyTrash(userId: string, userRole: string): Promise<number>;
    /**
     * Obtenir la liste des partages d'un document
     */
    getDocumentShares(documentId: string, userId: string, userRole: string): Promise<({
        sharedWith: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        documentId: string;
        sharedWithId: string;
        canEdit: boolean;
        canDelete: boolean;
        sharedAt: Date;
        expiresAt: Date | null;
        revokedAt: Date | null;
        revokedBy: string | null;
    })[]>;
    /**
     * Révoquer un partage
     */
    revokeShare(documentId: string, shareId: string, userId: string, userRole: string): Promise<void>;
    /**
     * Mettre à jour les permissions d'un partage
     */
    updateSharePermissions(documentId: string, shareId: string, permissions: {
        canEdit?: boolean;
        canDelete?: boolean;
    }, userId: string, userRole: string): Promise<{
        sharedWith: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        documentId: string;
        sharedWithId: string;
        canEdit: boolean;
        canDelete: boolean;
        sharedAt: Date;
        expiresAt: Date | null;
        revokedAt: Date | null;
        revokedBy: string | null;
    }>;
    /**
     * Ajouter aux favoris
     */
    addToFavorites(documentId: string, userId: string): Promise<void>;
    /**
     * Retirer des favoris
     */
    removeFromFavorites(documentId: string, userId: string): Promise<void>;
    /**
     * Obtenir les documents favoris
     */
    getFavoriteDocuments(userId: string, userRole: string, query: any): Promise<{
        documents: DocumentResponse[];
        pagination: {
            page: any;
            limit: any;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    /**
     * Incrémenter le compteur de vues
     */
    incrementViewCount(documentId: string): Promise<void>;
    /**
     * Logger une activité
     */
    private logActivity;
    /**
     * Helper pour obtenir le nom du modèle Prisma à partir du type d'entité
     */
    private getEntityModel;
}
//# sourceMappingURL=document.service.d.ts.map