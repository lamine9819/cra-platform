"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const notification_service_1 = require("../services/notification.service");
const notificationValidation_1 = require("../utils/notificationValidation");
const notificationService = new notification_service_1.NotificationService();
class NotificationController {
    constructor() {
        this.listNotifications = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const userId = authenticatedReq.user.userId;
                const queryParams = notificationValidation_1.notificationListQuerySchema.parse(req.query);
                const result = await notificationService.listUserNotifications(userId, queryParams);
                res.status(200).json({
                    success: true,
                    notifications: result.notifications,
                    pagination: result.pagination,
                    unreadCount: result.unreadCount
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.getNotificationById = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const userId = authenticatedReq.user.userId;
                const notification = await notificationService.getNotificationById(id, userId);
                res.status(200).json({
                    success: true,
                    data: notification
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.markAsRead = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const userId = authenticatedReq.user.userId;
                const notification = await notificationService.markAsRead(id, userId);
                res.status(200).json({
                    success: true,
                    message: 'Notification marquée comme lue',
                    data: notification
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.markAllAsRead = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const userId = authenticatedReq.user.userId;
                const result = await notificationService.markAllAsRead(userId);
                res.status(200).json({
                    success: true,
                    message: result.message
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteNotification = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const userId = authenticatedReq.user.userId;
                await notificationService.deleteNotification(id, userId);
                res.status(200).json({
                    success: true,
                    message: 'Notification supprimée'
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.getUnreadCount = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const userId = authenticatedReq.user.userId;
                const count = await notificationService.getUnreadCount(userId);
                res.status(200).json({
                    success: true,
                    count: count
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.NotificationController = NotificationController;
//# sourceMappingURL=notification.controller.js.map