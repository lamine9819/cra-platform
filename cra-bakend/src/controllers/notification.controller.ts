import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';
import { AuthenticatedRequest } from '../types/auth.types';
import { notificationListQuerySchema } from '../utils/notificationValidation';

const notificationService = new NotificationService();

export class NotificationController {

  listNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const userId = authenticatedReq.user.userId;
      const queryParams = notificationListQuerySchema.parse(req.query);

      const result = await notificationService.listUserNotifications(userId, queryParams);

      res.status(200).json({
        success: true,
        data: result.notifications,
        pagination: result.pagination,
        unreadCount: result.unreadCount
      });
    } catch (error) {
      next(error);
    }
  };

  getNotificationById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const userId = authenticatedReq.user.userId;

      const notification = await notificationService.getNotificationById(id, userId);

      res.status(200).json({
        success: true,
        data: notification
      });
    } catch (error) {
      next(error);
    }
  };

  markAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const userId = authenticatedReq.user.userId;

      const notification = await notificationService.markAsRead(id, userId);

      res.status(200).json({
        success: true,
        message: 'Notification marquée comme lue',
        data: notification
      });
    } catch (error) {
      next(error);
    }
  };

  markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const userId = authenticatedReq.user.userId;

      const result = await notificationService.markAllAsRead(userId);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  };

  deleteNotification = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const userId = authenticatedReq.user.userId;

      await notificationService.deleteNotification(id, userId);

      res.status(200).json({
        success: true,
        message: 'Notification supprimée'
      });
    } catch (error) {
      next(error);
    }
  };

  getUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const userId = authenticatedReq.user.userId;

      const count = await notificationService.getUnreadCount(userId);

      res.status(200).json({
        success: true,
        data: { unreadCount: count }
      });
    } catch (error) {
      next(error);
    }
  };
}