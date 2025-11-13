// src/controllers/comment.controller.ts
import { Request, Response, NextFunction } from 'express';
import { CommentService } from '../services/comment.service';
import { AuthenticatedRequest } from '../types/auth.types';
import {
  createCommentSchema,
  updateCommentSchema,
  commentListQuerySchema
} from  '../utils/commentValidation';

const commentService = new CommentService();

export class CommentController {

  // Créer un commentaire
  createComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const validatedData = createCommentSchema.parse(req.body);
      const authorId = authenticatedReq.user.userId;
      const authorRole = authenticatedReq.user.role;

      const comment = await commentService.createComment(validatedData, authorId, authorRole);

      res.status(201).json({
        success: true,
        message: 'Commentaire ajouté avec succès',
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  };

  // Lister les commentaires
  listComments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const queryParams = commentListQuerySchema.parse(req.query);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const result = await commentService.listComments(userId, userRole, queryParams);

      res.status(200).json({
        success: true,
        data: result.comments,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  // Obtenir un commentaire par ID
  getCommentById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const comment = await commentService.getCommentById(id, userId, userRole);

      res.status(200).json({
        success: true,
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  };

  // Mettre à jour un commentaire
  updateComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const validatedData = updateCommentSchema.parse(req.body);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const comment = await commentService.updateComment(id, validatedData, userId, userRole);

      res.status(200).json({
        success: true,
        message: 'Commentaire mis à jour avec succès',
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  };

  // Supprimer un commentaire
  deleteComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      await commentService.deleteComment(id, userId, userRole);

      res.status(200).json({
        success: true,
        message: 'Commentaire supprimé avec succès',
      });
    } catch (error) {
      next(error);
    }
  };

  // Obtenir les statistiques des commentaires
  getCommentStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { targetType, targetId } = req.query;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const stats = await commentService.getCommentStats(
        userId, 
        userRole, 
        targetType as string, 
        targetId as string
      );

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };

  // Obtenir les commentaires d'un projet spécifique
  getProjectComments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { projectId } = req.params;
      const queryParams = commentListQuerySchema.parse({
        ...req.query,
        targetType: 'project',
        targetId: projectId
      });
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const result = await commentService.listComments(userId, userRole, queryParams);

      res.status(200).json({
        success: true,
        data: result.comments,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  // Obtenir les commentaires d'une activité spécifique
  getActivityComments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { activityId } = req.params;
      const queryParams = commentListQuerySchema.parse({
        ...req.query,
        targetType: 'activity',
        targetId: activityId
      });
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const result = await commentService.listComments(userId, userRole, queryParams);

      res.status(200).json({
        success: true,
        data: result.comments,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  // Obtenir les commentaires d'une tâche spécifique
  getTaskComments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { taskId } = req.params;
      const queryParams = commentListQuerySchema.parse({
        ...req.query,
        targetType: 'task',
        targetId: taskId
      });
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const result = await commentService.listComments(userId, userRole, queryParams);

      res.status(200).json({
        success: true,
        data: result.comments,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };
}