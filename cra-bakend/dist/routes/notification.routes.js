"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notification.controller");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
const notificationController = new notification_controller_1.NotificationController();
router.use(auth_1.authenticate);
// Toutes les routes de notifications
router.get('/', notificationController.listNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/read-all', notificationController.markAllAsRead);
router.get('/:id', notificationController.getNotificationById);
router.patch('/:id/read', notificationController.markAsRead);
router.delete('/:id', notificationController.deleteNotification);
exports.default = router;
//# sourceMappingURL=notification.routes.js.map