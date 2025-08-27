// src/routes/notification.routes.ts
import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/authorization';

const router = Router();
const notificationController = new NotificationController();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Routes spécialisées - DOIVENT être avant /:id
router.get('/stats', notificationController.getNotificationStats);
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/mark-all-read', notificationController.markAllAsRead);
router.delete('/cleanup', notificationController.deleteOldNotifications);

// Créer une notification (Admin uniquement)
router.post(
  '/',
  authorize(['ADMINISTRATEUR']),
  notificationController.createNotification
);

// Créer des notifications en masse (Admin uniquement)
router.post(
  '/bulk',
  authorize(['ADMINISTRATEUR']),
  notificationController.createBulkNotifications
);

// Obtenir mes notifications
router.get('/', notificationController.getMyNotifications);

// Marquer une notification comme lue
router.patch('/:id/read', notificationController.markAsRead);

// Supprimer une notification
router.delete('/:id', notificationController.deleteNotification);

export default router;