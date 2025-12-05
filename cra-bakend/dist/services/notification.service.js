"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotificationService = exports.NotificationService = exports.NotificationType = void 0;
const client_1 = require("@prisma/client");
const errors_1 = require("../utils/errors");
const websocketNotification_service_1 = require("./websocketNotification.service");
const prisma = new client_1.PrismaClient();
var NotificationType;
(function (NotificationType) {
    NotificationType["PROJECT_ADDED"] = "PROJECT_ADDED";
    NotificationType["ACTIVITY_ADDED"] = "ACTIVITY_ADDED";
    NotificationType["CHAT_MESSAGE"] = "CHAT_MESSAGE";
    NotificationType["CHAT_MENTION"] = "CHAT_MENTION";
    NotificationType["DOCUMENT_SHARED"] = "DOCUMENT_SHARED";
    NotificationType["TASK_ASSIGNED"] = "TASK_ASSIGNED";
    NotificationType["ACTIVITY_UPDATED"] = "ACTIVITY_UPDATED";
    NotificationType["SYSTEM"] = "SYSTEM";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
class NotificationService {
    /**
     * Créer une notification et l'envoyer via WebSocket
     */
    async createNotification(params) {
        try {
            // Créer la notification dans la base de données
            const notification = await prisma.notification.create({
                data: {
                    receiverId: params.receiverId,
                    senderId: params.senderId,
                    title: params.title,
                    message: params.message,
                    type: params.type,
                    actionUrl: params.actionUrl,
                    entityType: params.entityType,
                    entityId: params.entityId,
                    isRead: false,
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            profileImage: true
                        }
                    }
                }
            });
            // Envoyer la notification via WebSocket
            const wsService = (0, websocketNotification_service_1.getWebSocketService)();
            if (wsService) {
                await wsService.sendNotificationToUser(params.receiverId, {
                    id: notification.id,
                    title: notification.title,
                    message: notification.message,
                    type: notification.type,
                    actionUrl: notification.actionUrl,
                    sender: notification.sender,
                    createdAt: notification.createdAt,
                    isRead: notification.isRead
                });
            }
            return notification;
        }
        catch (error) {
            console.error('Erreur lors de la création de la notification:', error);
            throw error;
        }
    }
    /**
     * Notification quand un chercheur est ajouté à un projet
     */
    async notifyProjectAddition(projectId, projectTitle, addedUserId, addedByUserId) {
        try {
            const addedBy = await prisma.user.findUnique({
                where: { id: addedByUserId },
                select: { firstName: true, lastName: true }
            });
            if (!addedBy)
                return;
            await this.createNotification({
                receiverId: addedUserId,
                senderId: addedByUserId,
                title: 'Ajouté à un projet',
                message: `${addedBy.firstName} ${addedBy.lastName} vous a ajouté au projet "${projectTitle}"`,
                type: NotificationType.PROJECT_ADDED,
                actionUrl: `/chercheur/projects/${projectId}`,
                entityType: 'project',
                entityId: projectId
            });
        }
        catch (error) {
            console.error('Erreur lors de la notification d\'ajout au projet:', error);
        }
    }
    /**
     * Notification pour un nouveau message dans un canal
     */
    async notifyNewChatMessage(channelId, channelName, messageId, authorId, mentionedUserIds) {
        try {
            const author = await prisma.user.findUnique({
                where: { id: authorId },
                select: { firstName: true, lastName: true }
            });
            if (!author)
                return;
            // Obtenir tous les membres du canal sauf l'auteur
            const channelMembers = await prisma.channelMember.findMany({
                where: {
                    channelId,
                    userId: { not: authorId },
                    leftAt: null,
                    notificationsEnabled: true
                },
                select: { userId: true }
            });
            // Créer des notifications pour tous les membres
            const notificationPromises = channelMembers.map(member => this.createNotification({
                receiverId: member.userId,
                senderId: authorId,
                title: 'Nouveau message',
                message: `${author.firstName} ${author.lastName} a envoyé un message dans #${channelName}`,
                type: NotificationType.CHAT_MESSAGE,
                actionUrl: `/chercheur/chat?channel=${channelId}`,
                entityType: 'chat_message',
                entityId: messageId
            }));
            // Créer des notifications spéciales pour les mentions
            if (mentionedUserIds && mentionedUserIds.length > 0) {
                const mentionPromises = mentionedUserIds.map(userId => this.createNotification({
                    receiverId: userId,
                    senderId: authorId,
                    title: 'Vous avez été mentionné',
                    message: `${author.firstName} ${author.lastName} vous a mentionné dans #${channelName}`,
                    type: NotificationType.CHAT_MENTION,
                    actionUrl: `/chercheur/chat?channel=${channelId}&message=${messageId}`,
                    entityType: 'chat_message',
                    entityId: messageId
                }));
                notificationPromises.push(...mentionPromises);
            }
            await Promise.allSettled(notificationPromises);
        }
        catch (error) {
            console.error('Erreur lors de la notification de nouveau message:', error);
        }
    }
    /**
     * Notification pour un document partagé
     */
    async notifyDocumentShare(documentId, documentTitle, sharedWithUserId, sharedByUserId, canEdit) {
        try {
            const sharedBy = await prisma.user.findUnique({
                where: { id: sharedByUserId },
                select: { firstName: true, lastName: true }
            });
            if (!sharedBy)
                return;
            const permission = canEdit ? 'avec permission de modification' : 'en lecture seule';
            await this.createNotification({
                receiverId: sharedWithUserId,
                senderId: sharedByUserId,
                title: 'Document partagé',
                message: `${sharedBy.firstName} ${sharedBy.lastName} a partagé le document "${documentTitle}" avec vous ${permission}`,
                type: NotificationType.DOCUMENT_SHARED,
                actionUrl: `/chercheur/documents/${documentId}`,
                entityType: 'document',
                entityId: documentId
            });
        }
        catch (error) {
            console.error('Erreur lors de la notification de partage de document:', error);
        }
    }
    /**
     * Notification quand un chercheur est ajouté à une activité
     */
    async notifyActivityAddition(activityId, activityTitle, addedUserId, addedByUserId) {
        try {
            const addedBy = await prisma.user.findUnique({
                where: { id: addedByUserId },
                select: { firstName: true, lastName: true }
            });
            if (!addedBy)
                return;
            await this.createNotification({
                receiverId: addedUserId,
                senderId: addedByUserId,
                title: 'Ajouté à une activité',
                message: `${addedBy.firstName} ${addedBy.lastName} vous a ajouté à l'activité "${activityTitle}"`,
                type: NotificationType.ACTIVITY_ADDED,
                actionUrl: `/chercheur/activities/${activityId}`,
                entityType: 'activity',
                entityId: activityId
            });
        }
        catch (error) {
            console.error('Erreur lors de la notification d\'ajout à l\'activité:', error);
        }
    }
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
// Instance singleton
let notificationServiceInstance = null;
const getNotificationService = () => {
    if (!notificationServiceInstance) {
        notificationServiceInstance = new NotificationService();
    }
    return notificationServiceInstance;
};
exports.getNotificationService = getNotificationService;
//# sourceMappingURL=notification.service.js.map