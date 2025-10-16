import { PrismaClient } from '@prisma/client';
import { NotificationType } from '../types/notification.types';

const prisma = new PrismaClient();

export class NotificationHelper {

  // Créer une notification générique
  static async createNotification(data: {
    title: string;
    message: string;
    type: NotificationType;
    receiverId: string;
    senderId?: string;
    actionUrl?: string;
    entityType?: string;
    entityId?: string;
  }) {
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
    } catch (error) {
      console.error('Erreur lors de la création de la notification:', error);
      // Ne pas bloquer l'opération principale si la notification échoue
    }
  }

  // Notifications spécifiques pour les activités
  static async notifyActivityCreated(
    activityId: string,
    activityTitle: string,
    responsibleId: string,
    creatorId: string
  ) {
    if (responsibleId === creatorId) return; // Pas de notification à soi-même

    await this.createNotification({
      title: 'Nouvelle activité assignée',
      message: `Vous avez été désigné responsable de l'activité "${activityTitle}"`,
      type: NotificationType.ACTIVITY_CREATED,
      receiverId: responsibleId,
      senderId: creatorId,
      actionUrl: `/activities/${activityId}`,
      entityType: 'activity',
      entityId: activityId
    });
  }

  static async notifyParticipantAdded(
    activityId: string,
    activityTitle: string,
    participantId: string,
    addedById: string
  ) {
    await this.createNotification({
      title: 'Ajouté comme participant',
      message: `Vous avez été ajouté comme participant à l'activité "${activityTitle}"`,
      type: NotificationType.PARTICIPANT_ADDED,
      receiverId: participantId,
      senderId: addedById,
      actionUrl: `/activities/${activityId}`,
      entityType: 'activity',
      entityId: activityId
    });
  }

  static async notifyTaskAssigned(
    taskId: string,
    taskTitle: string,
    assigneeId: string,
    assignedById: string,
    activityId?: string
  ) {
    await this.createNotification({
      title: 'Nouvelle tâche assignée',
      message: `Une nouvelle tâche vous a été assignée : "${taskTitle}"`,
      type: NotificationType.TASK_ASSIGNED,
      receiverId: assigneeId,
      senderId: assignedById,
      actionUrl: activityId ? `/activities/${activityId}/tasks/${taskId}` : `/tasks/${taskId}`,
      entityType: 'task',
      entityId: taskId
    });
  }

  static async notifyCommentAdded(
    entityId: string,
    entityType: 'activity' | 'task' | 'project',
    entityTitle: string,
    commentAuthorId: string,
    recipientIds: string[]
  ) {
    for (const recipientId of recipientIds) {
      if (recipientId === commentAuthorId) continue;

      await this.createNotification({
        title: 'Nouveau commentaire',
        message: `Un nouveau commentaire a été ajouté sur "${entityTitle}"`,
        type: NotificationType.COMMENT_ADDED,
        receiverId: recipientId,
        senderId: commentAuthorId,
        actionUrl: `/${entityType}s/${entityId}`,
        entityType,
        entityId
      });
    }
  }

  static async notifyFundingApproved(
    activityId: string,
    activityTitle: string,
    fundingSource: string,
    responsibleId: string
  ) {
    await this.createNotification({
      title: 'Financement approuvé',
      message: `Le financement de ${fundingSource} pour "${activityTitle}" a été approuvé`,
      type: NotificationType.FUNDING_APPROVED,
      receiverId: responsibleId,
      actionUrl: `/activities/${activityId}`,
      entityType: 'activity',
      entityId: activityId
    });
  }

  static async notifyDeadlineApproaching(
    activityId: string,
    activityTitle: string,
    daysRemaining: number,
    responsibleId: string
  ) {
    await this.createNotification({
      title: 'Échéance proche',
      message: `L'activité "${activityTitle}" arrive à échéance dans ${daysRemaining} jours`,
      type: NotificationType.DEADLINE_APPROACHING,
      receiverId: responsibleId,
      actionUrl: `/activities/${activityId}`,
      entityType: 'activity',
      entityId: activityId
    });
  }
}