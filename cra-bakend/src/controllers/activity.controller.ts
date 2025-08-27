// src/controllers/activity.controller.ts
import { Request, Response, NextFunction } from 'express';
import { ActivityService } from '../services/activity.service';
import { AuthenticatedRequest } from '../types/auth.types';
import {
  createActivitySchema,
  updateActivitySchema,
  activityListQuerySchema,
  linkFormSchema,
  linkDocumentSchema
} from '../utils/activityValidation';

const activityService = new ActivityService();

export class ActivityController {

  // Créer une activité
  createActivity = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const validatedData = createActivitySchema.parse(req.body);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const activity = await activityService.createActivity(validatedData, userId, userRole);

      res.status(201).json({
        success: true,
        message: 'Activité créée avec succès',
        data: activity,
      });
    } catch (error) {
      next(error);
    }
  };

  // Lister les activités
  listActivities = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const queryParams = activityListQuerySchema.parse(req.query);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const result = await activityService.listActivities(userId, userRole, queryParams);

      res.status(200).json({
        success: true,
        data: result.activities,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  // Obtenir une activité par ID
  getActivityById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const activity = await activityService.getActivityById(id, userId, userRole);

      res.status(200).json({
        success: true,
        data: activity,
      });
    } catch (error) {
      next(error);
    }
  };

  // Mettre à jour une activité
  updateActivity = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const validatedData = updateActivitySchema.parse(req.body);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const activity = await activityService.updateActivity(id, validatedData, userId, userRole);

      res.status(200).json({
        success: true,
        message: 'Activité mise à jour avec succès',
        data: activity,
      });
    } catch (error) {
      next(error);
    }
  };

  // Supprimer une activité
  deleteActivity = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      await activityService.deleteActivity(id, userId, userRole);

      res.status(200).json({
        success: true,
        message: 'Activité supprimée avec succès',
      });
    } catch (error) {
      next(error);
    }
  };

  // Lier un formulaire
  linkForm = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const { formId } = linkFormSchema.parse(req.body);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const result = await activityService.linkForm(id, formId, userId, userRole);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  // Délier un formulaire
  unlinkForm = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id, formId } = req.params;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const result = await activityService.unlinkForm(id, formId, userId, userRole);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  // Lier un document
  linkDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const { documentId } = linkDocumentSchema.parse(req.body);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const result = await activityService.linkDocument(id, documentId, userId, userRole);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };
  // ✅ NOUVELLE MÉTHODE - Obtenir les statistiques des activités
export const getActivityStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const userId = authenticatedReq.user.userId;
    const userRole = authenticatedReq.user.role;

    const stats = await activityService.getActivityStats(userId, userRole);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

// ✅ NOUVELLE MÉTHODE - Dupliquer une activité
export const duplicateActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const { id } = req.params;
    const { title } = req.body;
    const userId = authenticatedReq.user.userId;
    const userRole = authenticatedReq.user.role;

    const duplicatedActivity = await activityService.duplicateActivity(
      id, 
      userId, 
      userRole, 
      title
    );

    res.status(201).json({
      success: true,
      message: 'Activité dupliquée avec succès',
      data: duplicatedActivity,
    });
  } catch (error) {
    next(error);
  }
};

}