"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const client_1 = require("@prisma/client");
const errors_1 = require("../utils/errors");
const prisma = new client_1.PrismaClient();
class NotificationService {
    // Lister les notifications de l'utilisateur connecté
    async listUserNotifications(userId, query) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;
        const where = { receiverId: userId };
        if (query.isRead !== undefined) {
            where.isRead = query.isRead;
        }
        if (query.type) {
            where.type = query.type;
        }
        const [notifications, total, unreadCount] = await Promise.all([
            prisma.notification.findMany({
                where,
                skip,
                take: limit,
                include: {
                    sender: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true
                        }
                    },
                    receiver: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.notification.count({ where }),
            prisma.notification.count({
                where: { receiverId: userId, isRead: false }
            })
        ]);
        return {
            notifications: notifications.map(n => this.formatResponse(n)),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrev: page > 1,
            },
            unreadCount
        };
    }
    // Obtenir une notification spécifique
    async getNotificationById(notificationId, userId) {
        const notification = await prisma.notification.findUnique({
            where: { id: notificationId },
            include: {
                sender: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                },
                receiver: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });
        if (!notification) {
            throw new errors_1.ValidationError('Notification non trouvée');
        }
        // Seul le destinataire peut voir sa notification
        if (notification.receiverId !== userId) {
            throw new errors_1.AuthError('Accès refusé à cette notification');
        }
        return this.formatResponse(notification);
    }
    // Marquer une notification comme lue
    async markAsRead(notificationId, userId) {
        const notification = await prisma.notification.findUnique({
            where: { id: notificationId }
        });
        if (!notification) {
            throw new errors_1.ValidationError('Notification non trouvée');
        }
        if (notification.receiverId !== userId) {
            throw new errors_1.AuthError('Accès refusé');
        }
        const updated = await prisma.notification.update({
            where: { id: notificationId },
            data: {
                isRead: true,
                readAt: new Date()
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                },
                receiver: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });
        return this.formatResponse(updated);
    }
    // Marquer toutes les notifications comme lues
    async markAllAsRead(userId) {
        await prisma.notification.updateMany({
            where: {
                receiverId: userId,
                isRead: false
            },
            data: {
                isRead: true,
                readAt: new Date()
            }
        });
        return { message: 'Toutes les notifications ont été marquées comme lues' };
    }
    // Supprimer une notification
    async deleteNotification(notificationId, userId) {
        const notification = await prisma.notification.findUnique({
            where: { id: notificationId }
        });
        if (!notification) {
            throw new errors_1.ValidationError('Notification non trouvée');
        }
        if (notification.receiverId !== userId) {
            throw new errors_1.AuthError('Accès refusé');
        }
        await prisma.notification.delete({
            where: { id: notificationId }
        });
    }
    // Obtenir le nombre de notifications non lues
    async getUnreadCount(userId) {
        return await prisma.notification.count({
            where: {
                receiverId: userId,
                isRead: false
            }
        });
    }
    formatResponse(notification) {
        return {
            id: notification.id,
            title: notification.title,
            message: notification.message,
            type: notification.type,
            isRead: notification.isRead,
            readAt: notification.readAt || undefined,
            actionUrl: notification.actionUrl || undefined,
            entityType: notification.entityType || undefined,
            entityId: notification.entityId || undefined,
            createdAt: notification.createdAt,
            updatedAt: notification.updatedAt,
            sender: notification.sender || undefined,
            receiver: notification.receiver
        };
    }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=notification.service.js.map