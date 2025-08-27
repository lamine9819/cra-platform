// src/controllers/notification.controller.ts
import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';
import { AuthenticatedRequest } from '../types/auth.types';
import {
  createNotificationSchema,
  notificationListQuerySchema,
  bulkNotificationSchema
} from '../utils/notificationValidation';

const notificationService = new NotificationService();

export class NotificationController {

  // Créer une notification (Admin uniquement)
  createNotification = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const validatedData = createNotificationSchema.parse(req.body);
      
      // Ajouter l'expéditeur automatiquement
      validatedData.senderId = authenticatedReq.user.userId;

      const notification = await notificationService.createNotification(validatedData);

      res.status(201).json({
        success: true,
        message: 'Notification créée avec succès',
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  };

  // Créer des notifications en masse (Admin uniquement)
  createBulkNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const validatedData = bulkNotificationSchema.parse(req.body);
      const senderId = authenticatedReq.user.userId;

      const result = await notificationService.createBulkNotifications(validatedData, senderId);

      res.status(201).json({
        success: true,
        message: `${result.created} notification(s) créée(s) avec succès`,
        data: {
          created: result.created,
          errors: result.errors
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Obtenir mes notifications
  getMyNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const queryParams = notificationListQuerySchema.parse(req.query);
      const userId = authenticatedReq.user.userId;

      const result = await notificationService.getUserNotifications(userId, queryParams);

      res.status(200).json({
        success: true,
        data: result.notifications,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  // Marquer une notification comme lue
  markAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const userId = authenticatedReq.user.userId;

      const notification = await notificationService.markAsRead(id, userId);

      res.status(200).json({
        success: true,
        message: 'Notification marquée comme lue',
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  };

  // Marquer toutes les notifications comme lues
  markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const userId = authenticatedReq.user.userId;

      const result = await notificationService.markAllAsRead(userId);

      res.status(200).json({
        success: true,
        message: `${result.updated} notification(s) marquée(s) comme lue(s)`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  // Supprimer une notification
  deleteNotification = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const userId = authenticatedReq.user.userId;

      await notificationService.deleteNotification(id, userId);

      res.status(200).json({
        success: true,
        message: 'Notification supprimée avec succès',
      });
    } catch (error) {
      next(error);
    }
  };

  // Supprimer les anciennes notifications
  deleteOldNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const userId = authenticatedReq.user.userId;
      const daysOld = parseInt(req.query.days as string) || 30;

      const result = await notificationService.deleteOldNotifications(userId, daysOld);

      res.status(200).json({
        success: true,
        message: `${result.deleted} ancienne(s) notification(s) supprimée(s)`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  // Obtenir les statistiques des notifications
  getNotificationStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const userId = authenticatedReq.user.userId;

      const stats = await notificationService.getNotificationStats(userId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };

  // Obtenir le nombre de notifications non lues (pour le badge)
  getUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const userId = authenticatedReq.user.userId;

      const stats = await notificationService.getNotificationStats(userId);

      res.status(200).json({
        success: true,
        data: {
          unreadCount: stats.unread,
          recentCount: stats.recentCount
        },
      });
    } catch (error) {
      next(error);
    }
  };
}