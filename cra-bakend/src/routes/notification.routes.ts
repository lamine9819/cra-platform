import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();
const notificationController = new NotificationController();

router.use(authenticate);

// Toutes les routes de notifications
router.get('/', notificationController.listNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.get('/:id', notificationController.getNotificationById);
router.patch('/:id/read', notificationController.markAsRead);
router.patch('/mark-all-read', notificationController.markAllAsRead);
router.delete('/:id', notificationController.deleteNotification);

export default router;