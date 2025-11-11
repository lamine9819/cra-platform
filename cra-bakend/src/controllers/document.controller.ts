// src/controllers/document.controller.ts - Version mise à jour
import { Request, Response, NextFunction } from 'express';
import path from 'path';
import { DocumentService } from '../services/document.service';
import { AuthenticatedRequest } from '../types/auth.types';
import { ValidationError } from '../utils/errors';
import { deleteFile } from '../utils/fileHelpers';
import {
  uploadFileSchema,
  shareDocumentSchema,
  documentListQuerySchema
} from '../utils/documentValidation';

const documentService = new DocumentService();

export class DocumentController {

  // Upload de fichier unique
  uploadFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      
      if (!req.file) {
        throw new ValidationError('Aucun fichier fourni');
      }

      // Validation
      let documentData;
      try {
        documentData = uploadFileSchema.parse(req.body);
      } catch (validationError: any) {
        console.error('Erreur de validation:', {
          body: req.body,
          error: validationError.errors || validationError.message
        });
        throw new ValidationError(`Données invalides: ${JSON.stringify(validationError.errors || validationError.message)}`);
      }

      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const document = await documentService.createDocument(
        req.file,
        documentData,
        userId,
        userRole
      );

      res.status(201).json({
        success: true,
        message: 'Fichier uploadé avec succès',
        data: document,
      });
    } catch (error) {
      // Nettoyer le fichier en cas d'erreur
      if (req.file) {
        try {
          await deleteFile(req.file.path);
        } catch (cleanupError) {
          console.error('Erreur lors du nettoyage:', cleanupError);
        }
      }
      next(error);
    }
  };

  // Upload multiple
  uploadMultipleFiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        throw new ValidationError('Aucun fichier fourni');
      }

      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const uploadedDocuments = await Promise.all(
        files.map(async (file, index) => {
          try {
            const fileData = {
              title: req.body.titles?.[index] || req.body[`title[${index}]`] || file.originalname,
              description: req.body.descriptions?.[index] || req.body[`description[${index}]`] || '',
              type: req.body.types?.[index] || req.body[`type[${index}]`] || 'AUTRE',
              tags: req.body.tags?.[index] || req.body[`tags[${index}]`] || '[]',
              isPublic: req.body.isPublic?.[index] || req.body[`isPublic[${index}]`] || 'false',
              projectId: req.body.projectId,
              activityId: req.body.activityId,
              taskId: req.body.taskId,
              seminarId: req.body.seminarId,
              trainingId: req.body.trainingId,
              internshipId: req.body.internshipId,
              supervisionId: req.body.supervisionId,
              knowledgeTransferId: req.body.knowledgeTransferId,
              eventId: req.body.eventId,
            };

            const documentData = uploadFileSchema.parse(fileData);
            return await documentService.createDocument(file, documentData, userId, userRole);
          } catch (error) {
            await deleteFile(file.path).catch(console.error);
            throw error;
          }
        })
      );

      res.status(201).json({
        success: true,
        message: `${uploadedDocuments.length} fichier(s) uploadé(s) avec succès`,
        data: uploadedDocuments,
      });
    } catch (error) {
      if (req.files) {
        const files = req.files as Express.Multer.File[];
        await Promise.all(
          files.map(file => deleteFile(file.path).catch(console.error))
        );
      }
      next(error);
    }
  };

  // Lister les documents
  listDocuments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const queryParams = documentListQuerySchema.parse(req.query);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const result = await documentService.listDocuments(userId, userRole, queryParams);

      res.status(200).json({
        success: true,
        data: result.documents,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  // Obtenir un document par ID
  getDocumentById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const document = await documentService.getDocumentById(id, userId, userRole);

      res.status(200).json({
        success: true,
        data: document,
      });
    } catch (error) {
      next(error);
    }
  };

  // Télécharger un document
  downloadDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const fileInfo = await documentService.getDocumentFilePath(id, userId, userRole);

      res.setHeader('Content-Type', fileInfo.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileInfo.filename}"`);

      res.sendFile(path.resolve(fileInfo.filepath));
    } catch (error) {
      next(error);
    }
  };

  // Partager un document
  shareDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const shareData = shareDocumentSchema.parse(req.body);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const result = await documentService.shareDocument(id, shareData, userId, userRole);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.shares,
      });
    } catch (error) {
      next(error);
    }
  };

  // Supprimer un document
  deleteDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      await documentService.deleteDocument(id, userId, userRole);

      res.status(200).json({
        success: true,
        message: 'Document supprimé avec succès',
      });
    } catch (error) {
      next(error);
    }
  };

  // =============================================
  // ROUTES PAR ENTITÉ - RÉCUPÉRATION DES DOCUMENTS
  // =============================================

  // Documents d'un projet
  getProjectDocuments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { projectId } = req.params;
      const queryParams = documentListQuerySchema.parse(req.query);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      queryParams.projectId = projectId;

      const result = await documentService.listDocuments(userId, userRole, queryParams);

      res.status(200).json({
        success: true,
        data: result.documents,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  // Documents d'une activité
  getActivityDocuments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { activityId } = req.params;
      const queryParams = documentListQuerySchema.parse(req.query);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      queryParams.activityId = activityId;

      const result = await documentService.listDocuments(userId, userRole, queryParams);

      res.status(200).json({
        success: true,
        data: result.documents,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  // Documents d'une tâche
  getTaskDocuments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { taskId } = req.params;
      const queryParams = documentListQuerySchema.parse(req.query);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      queryParams.taskId = taskId;

      const result = await documentService.listDocuments(userId, userRole, queryParams);

      res.status(200).json({
        success: true,
        data: result.documents,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  // Documents d'un séminaire
  getSeminarDocuments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { seminarId } = req.params;
      const queryParams = documentListQuerySchema.parse(req.query);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      queryParams.seminarId = seminarId;

      const result = await documentService.listDocuments(userId, userRole, queryParams);

      res.status(200).json({
        success: true,
        data: result.documents,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  // Documents d'une formation
  getTrainingDocuments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { trainingId } = req.params;
      const queryParams = documentListQuerySchema.parse(req.query);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      queryParams.trainingId = trainingId;

      const result = await documentService.listDocuments(userId, userRole, queryParams);

      res.status(200).json({
        success: true,
        data: result.documents,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  // Documents d'un stage
  getInternshipDocuments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { internshipId } = req.params;
      const queryParams = documentListQuerySchema.parse(req.query);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      queryParams.internshipId = internshipId;

      const result = await documentService.listDocuments(userId, userRole, queryParams);

      res.status(200).json({
        success: true,
        data: result.documents,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  // Documents d'un encadrement
  getSupervisionDocuments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { supervisionId } = req.params;
      const queryParams = documentListQuerySchema.parse(req.query);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      queryParams.supervisionId = supervisionId;

      const result = await documentService.listDocuments(userId, userRole, queryParams);

      res.status(200).json({
        success: true,
        data: result.documents,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  // Documents d'un transfert d'acquis
  getKnowledgeTransferDocuments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { knowledgeTransferId } = req.params;
      const queryParams = documentListQuerySchema.parse(req.query);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      queryParams.knowledgeTransferId = knowledgeTransferId;

      const result = await documentService.listDocuments(userId, userRole, queryParams);

      res.status(200).json({
        success: true,
        data: result.documents,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  // Documents d'un événement
  getEventDocuments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { eventId } = req.params;
      const queryParams = documentListQuerySchema.parse(req.query);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      queryParams.eventId = eventId;

      const result = await documentService.listDocuments(userId, userRole, queryParams);

      res.status(200).json({
        success: true,
        data: result.documents,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  // Statistiques des documents
  getDocumentStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const result = await documentService.listDocuments(userId, userRole, { limit: 1000 });
      const documents = result.documents;

      const stats = {
        total: documents.length,
        byType: documents.reduce((acc, doc) => {
          acc[doc.type] = (acc[doc.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byOwnership: {
          owned: documents.filter(d => d.owner.id === userId).length,
          shared: documents.filter(d => d.shares && d.shares.length > 0).length,
          public: documents.filter(d => d.isPublic).length,
        },
        byContext: {
          projects: documents.filter(d => d.project).length,
          activities: documents.filter(d => d.activity).length,
          tasks: documents.filter(d => d.task).length,
          seminars: documents.filter(d => d.seminar).length,
          trainings: documents.filter(d => d.training).length,
          internships: documents.filter(d => d.internship).length,
          supervisions: documents.filter(d => d.supervision).length,
          knowledgeTransfers: documents.filter(d => d.knowledgeTransfer).length,
          events: documents.filter(d => d.event).length,
          standalone: documents.filter(d => 
            !d.project && !d.activity && !d.task && !d.seminar && 
            !d.training && !d.internship && !d.supervision && 
            !d.knowledgeTransfer && !d.event
          ).length,
        },
        totalSize: documents.reduce((acc, doc) => acc + doc.size, 0),
        recent: documents
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)
      };

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };

  // =============================================
  // NOUVELLES MÉTHODES - GESTION AVANCÉE DOCUMENTS
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
      const updateData = req.body;

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

      const linkData = req.body;

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
  // CORBEILLE (SOFT DELETE)
  // =============================================

  /**
   * GET /documents/trash
   * Obtenir les documents supprimés (corbeille)
   */
  getTrashDocuments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const queryParams = req.query;
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
  // GESTION AVANCÉE DES PARTAGES
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
  // FAVORIS
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
      const queryParams = req.query;
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

      const path = require('path');
      res.sendFile(path.resolve(fileInfo.filepath));
    } catch (error) {
      next(error);
    }
  };
}