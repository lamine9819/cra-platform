export declare class DocumentServiceNewMethods {
    private canEditDocument;
    private canDeleteDocument;
    /**
     * Mettre à jour les métadonnées d'un document
     */
    updateDocumentMetadata(documentId: string, updateData: {
        title?: string;
        description?: string;
        type?: string;
        tags?: string[];
        isPublic?: boolean;
    }, userId: string, userRole: string): Promise<any>;
    /**
     * Lier un document à une entité
     */
    linkDocument(documentId: string, linkData: {
        entityType: 'project' | 'activity' | 'task' | 'seminar' | 'training' | 'internship' | 'supervision' | 'knowledgeTransfer' | 'event';
        entityId: string;
    }, userId: string, userRole: string): Promise<any>;
    /**
     * Délier un document d'une ou plusieurs entités
     */
    unlinkDocument(documentId: string, unlinkData: {
        entityType?: string;
        entityId?: string;
    }, userId: string, userRole: string): Promise<any>;
    /**
     * Soft delete - Marquer un document comme supprimé
     * IMPORTANT: Remplacer la méthode deleteDocument existante
     */
    softDeleteDocument(documentId: string, userId: string, userRole: string): Promise<void>;
    /**
     * Obtenir les documents supprimés (corbeille)
     */
    getTrashDocuments(userId: string, userRole: string, query: any): Promise<{
        documents: any[];
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
    restoreDocument(documentId: string, userId: string, userRole: string): Promise<any>;
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
        canEdit: boolean;
        canDelete: boolean;
        sharedAt: Date;
        sharedWithId: string;
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
        canEdit: boolean;
        canDelete: boolean;
        sharedAt: Date;
        sharedWithId: string;
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
        documents: any[];
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
    private getEntityModel;
    private formatDocumentResponse;
}
export default DocumentServiceNewMethods;
//# sourceMappingURL=document.service.NEW_METHODS.d.ts.map