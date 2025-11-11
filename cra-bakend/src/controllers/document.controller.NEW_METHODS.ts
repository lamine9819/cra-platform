// src/controllers/document.controller.NEW_METHODS.ts
// NOUVELLES MÉTHODES À AJOUTER À document.controller.ts

import { Request, Response, NextFunction } from 'express';
import { DocumentService } from '../services/document.service';
import { AuthenticatedRequest } from '../types/auth.types';
import { ValidationError } from '../utils/errors';
import {
  updateDocumentMetadataSchema,
  linkDocumentSchema,
  documentListQuerySchema
} from '../utils/documentValidation';

const documentService = new DocumentService();

export class DocumentControllerNewMethods {

  // =============================================
  // PHASE 1 - ENDPOINTS CRITIQUES
  // =============================================

  /**
   * PATCH /documents/:id
   * Mettre à jour les métadonnées d'un document
   */
  updateDocumentMetadata = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      // Validation des données
      const updateData = updateDocumentMetadataSchema.parse(req.body);

      const document = await documentService.updateDocumentMetadata(
        id,
        updateData,
        userId,
        userRole
      );

      res.status(200).json({
        success: true,
        message: 'Document mis à jour avec succès',
        data: document,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /documents/:id/link
   * Lier un document existant à une entité
   */
  linkDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      // Validation
      const linkData = linkDocumentSchema.parse(req.body);

      const document = await documentService.linkDocument(
        id,
        linkData,
        userId,
        userRole
      );

      res.status(200).json({
        success: true,
        message: 'Document lié avec succès',
        data: document,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /documents/:id/link
   * Délier un document d'une ou plusieurs entités
   */
  unlinkDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      // Body optionnel pour délier d'une entité spécifique
      const { entityType, entityId } = req.body || {};

      const document = await documentService.unlinkDocument(
        id,
        { entityType, entityId },
        userId,
        userRole
      );

      res.status(200).json({
        success: true,
        message: entityType
          ? `Document délié de ${entityType}`
          : 'Document délié de toutes les entités',
        data: document,
      });
    } catch (error) {
      next(error);
    }
  };

  // =============================================
  // PHASE 2 - CORBEILLE (SOFT DELETE)
  // =============================================

  /**
   * GET /documents/trash
   * Obtenir les documents supprimés (corbeille)
   */
  getTrashDocuments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const queryParams = documentListQuerySchema.parse(req.query);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const result = await documentService.getTrashDocuments(userId, userRole, queryParams);

      res.status(200).json({
        success: true,
        data: result.documents,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /documents/:id/restore
   * Restaurer un document supprimé
   */
  restoreDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const document = await documentService.restoreDocument(id, userId, userRole);

      res.status(200).json({
        success: true,
        message: 'Document restauré avec succès',
        data: document,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /documents/:id/permanent
   * Supprimer définitivement un document
   */
  permanentDeleteDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      await documentService.permanentDeleteDocument(id, userId, userRole);

      res.status(200).json({
        success: true,
        message: 'Document supprimé définitivement',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /documents/trash/empty
   * Vider la corbeille (supprimer tous les documents supprimés depuis > 30 jours)
   */
  emptyTrash = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const deletedCount = await documentService.emptyTrash(userId, userRole);

      res.status(200).json({
        success: true,
        message: `${deletedCount} document(s) supprimé(s) définitivement`,
        data: { deletedCount },
      });
    } catch (error) {
      next(error);
    }
  };

  // =============================================
  // PHASE 3 - GESTION AVANCÉE DES PARTAGES
  // =============================================

  /**
   * GET /documents/:id/shares
   * Obtenir la liste des partages d'un document
   */
  getDocumentShares = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const shares = await documentService.getDocumentShares(id, userId, userRole);

      res.status(200).json({
        success: true,
        data: shares,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /documents/:id/shares/:shareId
   * Révoquer un partage spécifique
   */
  revokeShare = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id, shareId } = req.params;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      await documentService.revokeShare(id, shareId, userId, userRole);

      res.status(200).json({
        success: true,
        message: 'Partage révoqué avec succès',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /documents/:id/shares/:shareId
   * Mettre à jour les permissions d'un partage
   */
  updateSharePermissions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id, shareId } = req.params;
      const { canEdit, canDelete } = req.body;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const share = await documentService.updateSharePermissions(
        id,
        shareId,
        { canEdit, canDelete },
        userId,
        userRole
      );

      res.status(200).json({
        success: true,
        message: 'Permissions mises à jour',
        data: share,
      });
    } catch (error) {
      next(error);
    }
  };

  // =============================================
  // PHASE 4 - FAVORIS
  // =============================================

  /**
   * POST /documents/:id/favorite
   * Ajouter un document aux favoris
   */
  addToFavorites = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const userId = authenticatedReq.user.userId;

      await documentService.addToFavorites(id, userId);

      res.status(200).json({
        success: true,
        message: 'Document ajouté aux favoris',
        data: { isFavorite: true },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /documents/:id/favorite
   * Retirer un document des favoris
   */
  removeFromFavorites = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const userId = authenticatedReq.user.userId;

      await documentService.removeFromFavorites(id, userId);

      res.status(200).json({
        success: true,
        message: 'Document retiré des favoris',
        data: { isFavorite: false },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /documents/favorites
   * Obtenir les documents favoris de l'utilisateur
   */
  getFavoriteDocuments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const queryParams = documentListQuerySchema.parse(req.query);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const result = await documentService.getFavoriteDocuments(userId, userRole, queryParams);

      res.status(200).json({
        success: true,
        data: result.documents,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  // =============================================
  // BONUS - PREVIEW URL SÉPARÉE
  // =============================================

  /**
   * GET /documents/:id/preview
   * Obtenir le document pour preview (Content-Disposition: inline)
   */
  previewDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const fileInfo = await documentService.getDocumentFilePath(id, userId, userRole);

      // Utiliser 'inline' au lieu de 'attachment' pour preview dans le browser
      res.setHeader('Content-Type', fileInfo.mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${fileInfo.filename}"`);

      // Incrémenter le compteur de vues
      await documentService.incrementViewCount(id);

      res.sendFile(path.resolve(fileInfo.filepath));
    } catch (error) {
      next(error);
    }
  };
}

// =============================================
// ROUTES À AJOUTER À document.routes.ts
// =============================================

/*

import { DocumentControllerNewMethods } from '../controllers/document.controller.NEW_METHODS';

const router = Router();
const documentController = new DocumentController();
const documentControllerNew = new DocumentControllerNewMethods();

router.use(authenticate);

// =============================================
// PHASE 1 - ENDPOINTS CRITIQUES
// =============================================

// Édition métadonnées
router.patch('/:id', documentControllerNew.updateDocumentMetadata);

// Liaison/Déliaison
router.post('/:id/link', documentControllerNew.linkDocument);
router.delete('/:id/link', documentControllerNew.unlinkDocument);

// =============================================
// PHASE 2 - CORBEILLE
// =============================================

// IMPORTANT: Ces routes doivent être AVANT /:id pour éviter les conflits
router.get('/trash', documentControllerNew.getTrashDocuments);
router.delete('/trash/empty', documentControllerNew.emptyTrash);
router.post('/:id/restore', documentControllerNew.restoreDocument);
router.delete('/:id/permanent', documentControllerNew.permanentDeleteDocument);

// =============================================
// PHASE 3 - GESTION PARTAGES
// =============================================

router.get('/:id/shares', documentControllerNew.getDocumentShares);
router.delete('/:id/shares/:shareId', documentControllerNew.revokeShare);
router.patch('/:id/shares/:shareId', documentControllerNew.updateSharePermissions);

// =============================================
// PHASE 4 - FAVORIS
// =============================================

router.get('/favorites', documentControllerNew.getFavoriteDocuments);
router.post('/:id/favorite', documentControllerNew.addToFavorites);
router.delete('/:id/favorite', documentControllerNew.removeFromFavorites);

// =============================================
// BONUS - PREVIEW
// =============================================

router.get('/:id/preview', documentControllerNew.previewDocument);

// ... routes existantes ...

export default router;

*/
