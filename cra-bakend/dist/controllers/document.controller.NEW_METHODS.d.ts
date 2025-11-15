import { Request, Response, NextFunction } from 'express';
export declare class DocumentControllerNewMethods {
    /**
     * PATCH /documents/:id
     * Mettre à jour les métadonnées d'un document
     */
    updateDocumentMetadata: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * POST /documents/:id/link
     * Lier un document existant à une entité
     */
    linkDocument: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * DELETE /documents/:id/link
     * Délier un document d'une ou plusieurs entités
     */
    unlinkDocument: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * GET /documents/trash
     * Obtenir les documents supprimés (corbeille)
     */
    getTrashDocuments: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * POST /documents/:id/restore
     * Restaurer un document supprimé
     */
    restoreDocument: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * DELETE /documents/:id/permanent
     * Supprimer définitivement un document
     */
    permanentDeleteDocument: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * DELETE /documents/trash/empty
     * Vider la corbeille (supprimer tous les documents supprimés depuis > 30 jours)
     */
    emptyTrash: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * GET /documents/:id/shares
     * Obtenir la liste des partages d'un document
     */
    getDocumentShares: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * DELETE /documents/:id/shares/:shareId
     * Révoquer un partage spécifique
     */
    revokeShare: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * PATCH /documents/:id/shares/:shareId
     * Mettre à jour les permissions d'un partage
     */
    updateSharePermissions: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * POST /documents/:id/favorite
     * Ajouter un document aux favoris
     */
    addToFavorites: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * DELETE /documents/:id/favorite
     * Retirer un document des favoris
     */
    removeFromFavorites: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * GET /documents/favorites
     * Obtenir les documents favoris de l'utilisateur
     */
    getFavoriteDocuments: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * GET /documents/:id/preview
     * Obtenir le document pour preview (Content-Disposition: inline)
     */
    previewDocument: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=document.controller.NEW_METHODS.d.ts.map