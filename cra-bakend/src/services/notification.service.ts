import { PrismaClient } from '@prisma/client';
import { ValidationError, AuthError } from '../utils/errors';
import {
  CreateNotificationRequest,
  NotificationListQuery,
  NotificationResponse
} from '../types/notification.types';
import { getWebSocketService } from './websocketNotification.service';

const prisma = new PrismaClient();

export enum NotificationType {
  PROJECT_ADDED = 'PROJECT_ADDED',
  ACTIVITY_ADDED = 'ACTIVITY_ADDED',
  CHAT_MESSAGE = 'CHAT_MESSAGE',
  CHAT_MENTION = 'CHAT_MENTION',
  DOCUMENT_SHARED = 'DOCUMENT_SHARED',
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  ACTIVITY_UPDATED = 'ACTIVITY_UPDATED',
  SYSTEM = 'SYSTEM'
}

interface CreateNotificationParams {
  receiverId: string;
  senderId?: string;
  title: string;
  message: string;
  type: string;
  actionUrl?: string;
  entityType?: string;
  entityId?: string;
}

export class NotificationService {

  /**
   * Créer une notification et l'envoyer via WebSocket
   */
  async createNotification(params: CreateNotificationParams) {
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
      const wsService = getWebSocketService();
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
    } catch (error) {
      console.error('Erreur lors de la création de la notification:', error);
      throw error;
    }
  }

  /**
   * Notification quand un chercheur est ajouté à un projet
   */
  async notifyProjectAddition(
    projectId: string,
    projectTitle: string,
    addedUserId: string,
    addedByUserId: string
  ) {
    try {
      const addedBy = await prisma.user.findUnique({
        where: { id: addedByUserId },
        select: { firstName: true, lastName: true }
      });

      if (!addedBy) return;

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
    } catch (error) {
      console.error('Erreur lors de la notification d\'ajout au projet:', error);
    }
  }


  /**
   * Notification pour un document partagé
   */
  async notifyDocumentShare(
    documentId: string,
    documentTitle: string,
    sharedWithUserId: string,
    sharedByUserId: string,
    canEdit: boolean
  ) {
    try {
      const sharedBy = await prisma.user.findUnique({
        where: { id: sharedByUserId },
        select: { firstName: true, lastName: true }
      });

      if (!sharedBy) return;

      const permission = canEdit ? 'avec permission de modification' : 'en lecture seule';

      await this.createNotification({
        receiverId: sharedWithUserId,
        senderId: sharedByUserId,
        title: 'Document partagé',
        message: `${sharedBy.firstName} ${sharedBy.lastName} a partagé le document "${documentTitle}" avec vous ${permission}`,
        type: NotificationType.DOCUMENT_SHARED,
        actionUrl: `/documents?highlight=${documentId}`,
        entityType: 'document',
        entityId: documentId
      });
    } catch (error) {
      console.error('Erreur lors de la notification de partage de document:', error);
    }
  }

  /**
   * Notification quand un chercheur est ajouté à une activité
   */
  async notifyActivityAddition(
    activityId: string,
    activityTitle: string,
    addedUserId: string,
    addedByUserId: string
  ) {
    try {
      const addedBy = await prisma.user.findUnique({
        where: { id: addedByUserId },
        select: { firstName: true, lastName: true }
      });

      if (!addedBy) return;

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
    } catch (error) {
      console.error('Erreur lors de la notification d\'ajout à l\'activité:', error);
    }
  }

  /**
   * Notification pour un nouveau message dans le chat
   */
  async notifyChatMessage(
    messageId: string,
    messageContent: string,
    senderId: string,
    hasFile: boolean = false
  ) {
    try {
      // Récupérer l'expéditeur
      const sender = await prisma.user.findUnique({
        where: { id: senderId },
        select: {
          firstName: true,
          lastName: true,
          role: true
        }
      });

      if (!sender) return;

      // Récupérer tous les utilisateurs actifs sauf l'expéditeur
      const allUsers = await prisma.user.findMany({
        where: {
          id: { not: senderId },
          isActive: true
        },
        select: { id: true }
      });

      // Tronquer le message s'il est trop long
      const truncatedContent = messageContent.length > 100
        ? messageContent.substring(0, 100) + '...'
        : messageContent;

      // Déterminer le message de notification
      let notificationMessage: string;
      if (hasFile && !messageContent.trim()) {
        notificationMessage = `${sender.firstName} ${sender.lastName} a partagé un fichier`;
      } else if (hasFile && messageContent.trim()) {
        notificationMessage = `${sender.firstName} ${sender.lastName} a envoyé un fichier: ${truncatedContent}`;
      } else {
        notificationMessage = `${sender.firstName} ${sender.lastName}: ${truncatedContent}`;
      }

      // Créer une notification pour chaque utilisateur
      const notificationPromises = allUsers.map(user =>
        this.createNotification({
          receiverId: user.id,
          senderId: senderId,
          title: 'Nouveau message',
          message: notificationMessage,
          type: NotificationType.CHAT_MESSAGE,
          actionUrl: '/chat',
          entityType: 'chat_message',
          entityId: messageId
        }).catch(error => {
          console.error(`Erreur lors de la création de notification pour l'utilisateur ${user.id}:`, error);
        })
      );

      await Promise.all(notificationPromises);

      console.log(`✅ Notifications envoyées à ${allUsers.length} utilisateurs pour le message ${messageId}`);
    } catch (error) {
      console.error('Erreur lors de la notification de message chat:', error);
    }
  }

  // Lister les notifications de l'utilisateur connecté
  async listUserNotifications(
    userId: string,
    query: NotificationListQuery
  ) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { receiverId: userId };

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
  async getNotificationById(
    notificationId: string,
    userId: string
  ): Promise<NotificationResponse> {
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
      throw new ValidationError('Notification non trouvée');
    }

    // Seul le destinataire peut voir sa notification
    if (notification.receiverId !== userId) {
      throw new AuthError('Accès refusé à cette notification');
    }

    return this.formatResponse(notification);
  }

  // Marquer une notification comme lue
  async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    });

    if (!notification) {
      throw new ValidationError('Notification non trouvée');
    }

    if (notification.receiverId !== userId) {
      throw new AuthError('Accès refusé');
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
  async markAllAsRead(userId: string) {
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
  async deleteNotification(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    });

    if (!notification) {
      throw new ValidationError('Notification non trouvée');
    }

    if (notification.receiverId !== userId) {
      throw new AuthError('Accès refusé');
    }

    await prisma.notification.delete({
      where: { id: notificationId }
    });
  }

  // Obtenir le nombre de notifications non lues
  async getUnreadCount(userId: string): Promise<number> {
    return await prisma.notification.count({
      where: { 
        receiverId: userId,
        isRead: false
      }
    });
  }

  private formatResponse(notification: any): NotificationResponse {
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

// Instance singleton
let notificationServiceInstance: NotificationService | null = null;

export const getNotificationService = (): NotificationService => {
  if (!notificationServiceInstance) {
    notificationServiceInstance = new NotificationService();
  }
  return notificationServiceInstance;
};