import { PrismaClient } from '@prisma/client';
import { ValidationError, AuthError } from '../utils/errors';
import { 
  CreateNotificationRequest,
  NotificationListQuery,
  NotificationResponse
} from '../types/notification.types';

const prisma = new PrismaClient();

export class NotificationService {

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