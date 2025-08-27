// src/controllers/document.controller.ts - Version améliorée
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

  // Upload de fichier(s)
  uploadFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      
      if (!req.file) {
        throw new ValidationError('Aucun fichier fourni');
      }

      // Validation avec gestion des erreurs détaillées
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

      // Créer le document
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

  // Upload multiple avec gestion améliorée
  uploadMultipleFiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        throw new ValidationError('Aucun fichier fourni');
      }

      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      // Pour l'upload multiple, nous devons traiter les données différemment
      const uploadedDocuments = await Promise.all(
        files.map(async (file, index) => {
          try {
            // Construire les données pour chaque fichier
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
            };

            // Valider les données pour ce fichier
            const documentData = uploadFileSchema.parse(fileData);

            return await documentService.createDocument(file, documentData, userId, userRole);
          } catch (error) {
            // Nettoyer le fichier en cas d'erreur
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
      // Nettoyer tous les fichiers en cas d'erreur
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

      // Définir les headers pour le téléchargement
      res.setHeader('Content-Type', fileInfo.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileInfo.filename}"`);

      // Envoyer le fichier
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
  // NOUVELLES FONCTIONNALITÉS - LIAISON
  // =============================================

  // Lier un document à un projet
  linkToProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const { projectId } = req.body;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      if (!projectId) {
        throw new ValidationError('ID du projet requis');
      }

      const document = await documentService.linkToProject(id, projectId, userId, userRole);

      res.status(200).json({
        success: true,
        message: 'Document lié au projet avec succès',
        data: document,
      });
    } catch (error) {
      next(error);
    }
  };

  // Lier un document à une activité
  linkToActivity = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const { activityId } = req.body;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      if (!activityId) {
        throw new ValidationError('ID de l\'activité requis');
      }

      const document = await documentService.linkToActivity(id, activityId, userId, userRole);

      res.status(200).json({
        success: true,
        message: 'Document lié à l\'activité avec succès',
        data: document,
      });
    } catch (error) {
      next(error);
    }
  };

  // Délier un document
  unlinkDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const document = await documentService.unlinkDocument(id, userId, userRole);

      res.status(200).json({
        success: true,
        message: 'Document délié avec succès',
        data: document,
      });
    } catch (error) {
      next(error);
    }
  };

  // Obtenir les documents d'un projet
  getProjectDocuments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { projectId } = req.params;
      const queryParams = documentListQuerySchema.parse(req.query);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      // Forcer le filtre par projet
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

  // Obtenir les documents d'une activité
  getActivityDocuments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { activityId } = req.params;
      const queryParams = documentListQuerySchema.parse(req.query);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      // Forcer le filtre par activité
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

  // Obtenir les statistiques des documents
  getDocumentStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      // Obtenir tous les documents accessibles pour calculer les stats
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
          standalone: documents.filter(d => !d.project && !d.activity && !d.task && !d.seminar).length,
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
}