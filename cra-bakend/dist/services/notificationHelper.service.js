"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationHelper = void 0;
const client_1 = require("@prisma/client");
const notification_types_1 = require("../types/notification.types");
const prisma = new client_1.PrismaClient();
class NotificationHelper {
    // Créer une notification générique
    static async createNotification(data) {
        try {
            await prisma.notification.create({
                data: {
                    title: data.title,
                    message: data.message,
                    type: data.type,
                    receiverId: data.receiverId,
                    senderId: data.senderId,
                    actionUrl: data.actionUrl,
                    entityType: data.entityType,
                    entityId: data.entityId
                }
            });
        }
        catch (error) {
            console.error('Erreur lors de la création de la notification:', error);
            // Ne pas bloquer l'opération principale si la notification échoue
        }
    }
    // Notifications spécifiques pour les activités
    static async notifyActivityCreated(activityId, activityTitle, responsibleId, creatorId) {
        if (responsibleId === creatorId)
            return; // Pas de notification à soi-même
        await this.createNotification({
            title: 'Nouvelle activité assignée',
            message: `Vous avez été désigné responsable de l'activité "${activityTitle}"`,
            type: notification_types_1.NotificationType.ACTIVITY_CREATED,
            receiverId: responsibleId,
            senderId: creatorId,
            actionUrl: `/activities/${activityId}`,
            entityType: 'activity',
            entityId: activityId
        });
    }
    static async notifyParticipantAdded(activityId, activityTitle, participantId, addedById) {
        await this.createNotification({
            title: 'Ajouté comme participant',
            message: `Vous avez été ajouté comme participant à l'activité "${activityTitle}"`,
            type: notification_types_1.NotificationType.PARTICIPANT_ADDED,
            receiverId: participantId,
            senderId: addedById,
            actionUrl: `/activities/${activityId}`,
            entityType: 'activity',
            entityId: activityId
        });
    }
    static async notifyTaskAssigned(taskId, taskTitle, assigneeId, assignedById, activityId) {
        await this.createNotification({
            title: 'Nouvelle tâche assignée',
            message: `Une nouvelle tâche vous a été assignée : "${taskTitle}"`,
            type: notification_types_1.NotificationType.TASK_ASSIGNED,
            receiverId: assigneeId,
            senderId: assignedById,
            actionUrl: activityId ? `/activities/${activityId}/tasks/${taskId}` : `/tasks/${taskId}`,
            entityType: 'task',
            entityId: taskId
        });
    }
    static async notifyCommentAdded(entityId, entityType, entityTitle, commentAuthorId, recipientIds) {
        for (const recipientId of recipientIds) {
            if (recipientId === commentAuthorId)
                continue;
            await this.createNotification({
                title: 'Nouveau commentaire',
                message: `Un nouveau commentaire a été ajouté sur "${entityTitle}"`,
                type: notification_types_1.NotificationType.COMMENT_ADDED,
                receiverId: recipientId,
                senderId: commentAuthorId,
                actionUrl: `/${entityType}s/${entityId}`,
                entityType,
                entityId
            });
        }
    }
    static async notifyFundingApproved(activityId, activityTitle, fundingSource, responsibleId) {
        await this.createNotification({
            title: 'Financement approuvé',
            message: `Le financement de ${fundingSource} pour "${activityTitle}" a été approuvé`,
            type: notification_types_1.NotificationType.FUNDING_APPROVED,
            receiverId: responsibleId,
            actionUrl: `/activities/${activityId}`,
            entityType: 'activity',
            entityId: activityId
        });
    }
    static async notifyDeadlineApproaching(activityId, activityTitle, daysRemaining, responsibleId) {
        await this.createNotification({
            title: 'Échéance proche',
            message: `L'activité "${activityTitle}" arrive à échéance dans ${daysRemaining} jours`,
            type: notification_types_1.NotificationType.DEADLINE_APPROACHING,
            receiverId: responsibleId,
            actionUrl: `/activities/${activityId}`,
            entityType: 'activity',
            entityId: activityId
        });
    }
}
exports.NotificationHelper = NotificationHelper;
//# sourceMappingURL=notificationHelper.service.js.map