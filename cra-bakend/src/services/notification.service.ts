// src/services/notification.service.ts
import { PrismaClient } from '@prisma/client';
import { ValidationError, AuthError } from '../utils/errors';
import { 
  CreateNotificationRequest, 
  NotificationListQuery, 
  NotificationResponse, 
  NotificationStatsResponse,
  BulkNotificationRequest,
  NotificationType,
  EntityType 
} from '../types/notification.types';

const prisma = new PrismaClient();

// Type pour les notifications avec relations incluses
type NotificationWithRelations = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  actionUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
  readAt?: Date | null;
  receiverId: string;
  senderId?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    profileImage?: string | null;
  } | null;
  entityInfo?: any;
};

export class NotificationService {

  // Créer une notification
  async createNotification(notificationData: CreateNotificationRequest): Promise<NotificationResponse> {
    // Vérifier que le destinataire existe
    const receiver = await prisma.user.findUnique({
      where: { id: notificationData.receiverId }
    });

    if (!receiver || !receiver.isActive) {
      throw new ValidationError('Destinataire non trouvé ou inactif');
    }

    // Vérifier l'expéditeur s'il est fourni
    if (notificationData.senderId) {
      const sender = await prisma.user.findUnique({
        where: { id: notificationData.senderId }
      });

      if (!sender || !sender.isActive) {
        throw new ValidationError('Expéditeur non trouvé ou inactif');
      }
    }

    // Vérifier l'entité liée si fournie
    if (notificationData.entityType && notificationData.entityId) {
      await this.validateEntity(notificationData.entityType, notificationData.entityId);
    }

    // Créer la notification
    const notification = await prisma.notification.create({
      data: {
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type,
        receiverId: notificationData.receiverId,
        senderId: notificationData.senderId,
        entityType: notificationData.entityType,
        entityId: notificationData.entityId,
        actionUrl: notificationData.actionUrl,
      },
      include: this.getNotificationIncludes()
    });

    return this.formatNotificationResponse(notification);
  }

  // Créer des notifications en masse
  async createBulkNotifications(bulkData: BulkNotificationRequest, senderId?: string): Promise<{ created: number; errors: string[] }> {
    const errors: string[] = [];
    let created = 0;

    for (const notificationData of bulkData.notifications) {
      try {
        await this.createNotification({
          ...notificationData,
          senderId,
          priority: 'normal'
        });
        created++;
      } catch (error: any) {
        errors.push(`Erreur pour ${notificationData.receiverId}: ${error.message}`);
      }
    }

    return { created, errors };
  }

  // Lister les notifications d'un utilisateur
  async getUserNotifications(userId: string, query: NotificationListQuery) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    // Construire les filtres
    const where: any = {
      receiverId: userId
    };

    if (query.isRead !== undefined) {
      where.isRead = query.isRead;
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.entityType) {
      where.entityType = query.entityType;
    }

    if (query.senderId) {
      where.senderId = query.senderId;
    }

    if (query.startDate) {
      where.createdAt = { gte: new Date(query.startDate) };
    }

    if (query.endDate) {
      where.createdAt = {
        ...where.createdAt,
        lte: new Date(query.endDate)
      };
    }

    // Exécuter la requête
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        include: this.getNotificationIncludes(),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.notification.count({ where })
    ]);

    // Enrichir avec les informations d'entité
    const enrichedNotifications = await Promise.all(
      notifications.map((notification: any) => this.enrichNotificationWithEntity(notification))
    );

    return {
      notifications: enrichedNotifications.map((n: NotificationWithRelations) => this.formatNotificationResponse(n)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      }
    };
  }

  // Marquer une notification comme lue
  async markAsRead(notificationId: string, userId: string): Promise<NotificationResponse> {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      include: this.getNotificationIncludes()
    });

    if (!notification) {
      throw new ValidationError('Notification non trouvée');
    }

    // Vérifier que l'utilisateur est bien le destinataire
    if (notification.receiverId !== userId) {
      throw new AuthError('Vous ne pouvez marquer comme lue que vos propres notifications');
    }

    if (notification.isRead) {
      throw new ValidationError('Cette notification est déjà marquée comme lue');
    }

    // Marquer comme lue
    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: { 
        isRead: true,
        readAt: new Date(),
      },
      include: this.getNotificationIncludes()
    });

    const enrichedNotification = await this.enrichNotificationWithEntity(updatedNotification);
    return this.formatNotificationResponse(enrichedNotification);
  }

  // Marquer toutes les notifications comme lues
  async markAllAsRead(userId: string): Promise<{ updated: number }> {
    const result = await prisma.notification.updateMany({
      where: {
        receiverId: userId,
        isRead: false
      },
      data: { 
        isRead: true,
        readAt: new Date()
      }
    });

    return { updated: result.count };
  }

  // Supprimer une notification
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    });

    if (!notification) {
      throw new ValidationError('Notification non trouvée');
    }

    // Vérifier que l'utilisateur est bien le destinataire
    if (notification.receiverId !== userId) {
      throw new AuthError('Vous ne pouvez supprimer que vos propres notifications');
    }

    await prisma.notification.delete({
      where: { id: notificationId }
    });
  }

  // Supprimer les anciennes notifications
  async deleteOldNotifications(userId: string, daysOld: number = 30): Promise<{ deleted: number }> {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

    const result = await prisma.notification.deleteMany({
      where: {
        receiverId: userId,
        createdAt: { lt: cutoffDate },
        isRead: true
      }
    });

    return { deleted: result.count };
  }

  // Obtenir les statistiques des notifications
  async getNotificationStats(userId: string): Promise<NotificationStatsResponse> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [
      total,
      unread,
      byType,
      recentCount
    ] = await Promise.all([
      prisma.notification.count({
        where: { receiverId: userId }
      }),
      
      prisma.notification.count({
        where: { receiverId: userId, isRead: false }
      }),
      
      prisma.notification.groupBy({
        by: ['type'],
        where: { receiverId: userId },
        _count: true,
      }),
      
      prisma.notification.count({
        where: {
          receiverId: userId,
          createdAt: { gte: twentyFourHoursAgo }
        }
      })
    ]);

    // Formater les statistiques par type
    const typeStats = byType.reduce((acc: Record<string, number>, item: any) => {
      acc[item.type as NotificationType] = item._count;
      return acc;
    }, {} as Record<NotificationType, number>);

    // Priorités fictives pour l'exemple (à adapter selon votre modèle)
    const priorityStats = {
      low: Math.floor(total * 0.3),
      normal: Math.floor(total * 0.5),
      high: Math.floor(total * 0.15),
      urgent: Math.floor(total * 0.05),
    };

    return {
      total,
      unread,
      byType: typeStats,
      byPriority: priorityStats,
      recentCount,
    };
  }

  // Valider qu'une entité existe
  private async validateEntity(entityType: EntityType, entityId: string): Promise<void> {
    let entity;

    switch (entityType) {
      case 'project':
        entity = await prisma.project.findUnique({ where: { id: entityId } });
        break;
      case 'activity':
        entity = await prisma.activity.findUnique({ where: { id: entityId } });
        break;
      case 'task':
        entity = await prisma.task.findUnique({ where: { id: entityId } });
        break;
      case 'seminar':
        entity = await prisma.seminar.findUnique({ where: { id: entityId } });
        break;
      case 'document':
        entity = await prisma.document.findUnique({ where: { id: entityId } });
        break;
      case 'form':
        entity = await prisma.form.findUnique({ where: { id: entityId } });
        break;
      case 'user':
        entity = await prisma.user.findUnique({ where: { id: entityId } });
        break;
      case 'comment':
        entity = await prisma.comment.findUnique({ where: { id: entityId } });
        break;
      default:
        throw new ValidationError(`Type d'entité non supporté: ${entityType}`);
    }

    if (!entity) {
      throw new ValidationError(`${entityType} avec l'ID ${entityId} non trouvé(e)`);
    }
  }

  // Enrichir une notification avec les informations de l'entité liée
  private async enrichNotificationWithEntity(notification: any): Promise<NotificationWithRelations> {
    if (!notification.entityType || !notification.entityId) {
      return notification;
    }

    let entityInfo = null;

    try {
      switch (notification.entityType) {
        case 'project':
          const project = await prisma.project.findUnique({
            where: { id: notification.entityId },
            select: { id: true, title: true }
          });
          if (project) {
            entityInfo = {
              type: 'project',
              id: project.id,
              title: project.title,
              url: `/projects/${project.id}`
            };
          }
          break;

        case 'task':
          const task = await prisma.task.findUnique({
            where: { id: notification.entityId },
            select: { id: true, title: true }
          });
          if (task) {
            entityInfo = {
              type: 'task',
              id: task.id,
              title: task.title,
              url: `/tasks/${task.id}`
            };
          }
          break;

        case 'seminar':
          const seminar = await prisma.seminar.findUnique({
            where: { id: notification.entityId },
            select: { id: true, title: true }
          });
          if (seminar) {
            entityInfo = {
              type: 'seminar',
              id: seminar.id,
              title: seminar.title,
              url: `/seminars/${seminar.id}`
            };
          }
          break;

        case 'activity':
          const activity = await prisma.activity.findUnique({
            where: { id: notification.entityId },
            select: { id: true, title: true }
          });
          if (activity) {
            entityInfo = {
              type: 'activity',
              id: activity.id,
              title: activity.title,
              url: `/activities/${activity.id}`
            };
          }
          break;

        case 'document':
          const document = await prisma.document.findUnique({
            where: { id: notification.entityId },
            select: { id: true, title: true }
          });
          if (document) {
            entityInfo = {
              type: 'document',
              id: document.id,
              title: document.title,
              url: `/documents/${document.id}`
            };
          }
          break;
      }
    } catch (error) {
      // Si l'entité n'existe plus, on garde la notification sans enrichissement
      console.warn(`Entité ${notification.entityType}:${notification.entityId} non trouvée`);
    }

    return {
      ...notification,
      entityInfo
    };
  }

  // Inclusions pour les requêtes
  private getNotificationIncludes() {
    return {
      sender: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          profileImage: true,
        }
      }
    };
  }

  // Formater la réponse notification
  private formatNotificationResponse(notification: NotificationWithRelations): NotificationResponse {
    return {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type as NotificationType,
      priority: 'normal', // À adapter selon votre modèle
      isRead: notification.isRead,
      actionUrl: notification.actionUrl || undefined,
      createdAt: notification.createdAt,
      readAt: notification.readAt || undefined,
      sender: notification.sender || undefined,
      entity: notification.entityInfo || (notification.entityType && notification.entityId ? {
        type: notification.entityType as EntityType,
        id: notification.entityId,
      } : undefined),
    };
  }
}