// src/services/auditLog.service.ts
import { PrismaClient, AuditLevel } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuditLogMetadata {
  ip?: string;
  userAgent?: string;
  source?: string;
  [key: string]: any;
}

export interface AuditLogChanges {
  before?: any;
  after?: any;
  fields?: string[];
}

export interface CreateAuditLogParams {
  action: string;
  level?: AuditLevel;
  userId?: string;
  entityType?: string;
  entityId?: string;
  details?: any;
  metadata?: AuditLogMetadata;
  changes?: AuditLogChanges;
}

export class AuditLogService {
  /**
   * Créer un log d'audit
   */
  static async createLog(params: CreateAuditLogParams) {
    try {
      return await prisma.auditLog.create({
        data: {
          action: params.action,
          level: params.level || AuditLevel.INFO,
          userId: params.userId,
          entityType: params.entityType,
          entityId: params.entityId,
          details: params.details || {},
          metadata: params.metadata || {},
          changes: params.changes || {},
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });
    } catch (error) {
      console.error('Error creating audit log:', error);
      // Ne pas bloquer l'opération principale si le log échoue
      return null;
    }
  }

  /**
   * Log pour une création d'entité
   */
  static async logCreate(
    entityType: string,
    entityId: string,
    data: any,
    userId?: string,
    metadata?: AuditLogMetadata
  ) {
    return this.createLog({
      action: 'CREATE',
      level: AuditLevel.INFO,
      userId,
      entityType,
      entityId,
      details: {
        title: data.title || data.name || `${entityType} créé(e)`,
        description: `Nouvelle entité ${entityType} créée`,
      },
      metadata,
      changes: {
        after: data,
        fields: Object.keys(data),
      },
    });
  }

  /**
   * Log pour une mise à jour d'entité
   */
  static async logUpdate(
    entityType: string,
    entityId: string,
    before: any,
    after: any,
    userId?: string,
    metadata?: AuditLogMetadata
  ) {
    // Déterminer les champs modifiés
    const changedFields = Object.keys(after).filter(
      (key) => JSON.stringify(before[key]) !== JSON.stringify(after[key])
    );

    return this.createLog({
      action: 'UPDATE',
      level: AuditLevel.INFO,
      userId,
      entityType,
      entityId,
      details: {
        title: after.title || after.name || `${entityType} modifié(e)`,
        description: `Entité ${entityType} mise à jour`,
        fieldsChanged: changedFields.length,
      },
      metadata,
      changes: {
        before,
        after,
        fields: changedFields,
      },
    });
  }

  /**
   * Log pour une suppression d'entité
   */
  static async logDelete(
    entityType: string,
    entityId: string,
    data: any,
    userId?: string,
    metadata?: AuditLogMetadata
  ) {
    return this.createLog({
      action: 'DELETE',
      level: AuditLevel.WARNING,
      userId,
      entityType,
      entityId,
      details: {
        title: data.title || data.name || `${entityType} supprimé(e)`,
        description: `Entité ${entityType} supprimée`,
      },
      metadata,
      changes: {
        before: data,
      },
    });
  }

  /**
   * Log pour une connexion utilisateur
   */
  static async logLogin(userId: string, success: boolean, metadata?: AuditLogMetadata) {
    return this.createLog({
      action: success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED',
      level: success ? AuditLevel.INFO : AuditLevel.WARNING,
      userId: success ? userId : undefined,
      details: {
        title: success ? 'Connexion réussie' : 'Tentative de connexion échouée',
        description: success
          ? 'Utilisateur connecté avec succès'
          : 'Échec de connexion utilisateur',
      },
      metadata,
    });
  }

  /**
   * Log pour une déconnexion utilisateur
   */
  static async logLogout(userId: string, metadata?: AuditLogMetadata) {
    return this.createLog({
      action: 'LOGOUT',
      level: AuditLevel.INFO,
      userId,
      details: {
        title: 'Déconnexion',
        description: 'Utilisateur déconnecté',
      },
      metadata,
    });
  }

  /**
   * Log pour une consultation/vue d'entité
   */
  static async logView(
    entityType: string,
    entityId: string,
    userId?: string,
    metadata?: AuditLogMetadata
  ) {
    return this.createLog({
      action: 'VIEW',
      level: AuditLevel.INFO,
      userId,
      entityType,
      entityId,
      details: {
        title: `${entityType} consulté(e)`,
        description: `Consultation de l'entité ${entityType}`,
      },
      metadata,
    });
  }

  /**
   * Log pour une erreur
   */
  static async logError(
    error: Error,
    userId?: string,
    entityType?: string,
    entityId?: string,
    metadata?: AuditLogMetadata
  ) {
    return this.createLog({
      action: 'ERROR',
      level: AuditLevel.ERROR,
      userId,
      entityType,
      entityId,
      details: {
        title: 'Erreur système',
        description: error.message,
        stack: error.stack,
      },
      metadata,
    });
  }

  /**
   * Log critique pour des actions sensibles
   */
  static async logCritical(
    action: string,
    details: any,
    userId?: string,
    metadata?: AuditLogMetadata
  ) {
    return this.createLog({
      action,
      level: AuditLevel.CRITICAL,
      userId,
      details,
      metadata,
    });
  }

  /**
   * Récupérer les logs avec filtres et pagination
   */
  static async getLogs(params: {
    page?: number;
    limit?: number;
    userId?: string;
    action?: string;
    entityType?: string;
    level?: AuditLevel;
    startDate?: Date;
    endDate?: Date;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.userId) where.userId = params.userId;
    if (params.action) where.action = params.action;
    if (params.entityType) where.entityType = params.entityType;
    if (params.level) where.level = params.level;

    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) where.createdAt.gte = params.startDate;
      if (params.endDate) where.createdAt.lte = params.endDate;
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
    };
  }

  /**
   * Récupérer les statistiques des logs
   */
  static async getStats(params?: {
    userId?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: any = {};

    if (params?.userId) where.userId = params.userId;
    if (params?.startDate || params?.endDate) {
      where.createdAt = {};
      if (params.startDate) where.createdAt.gte = params.startDate;
      if (params.endDate) where.createdAt.lte = params.endDate;
    }

    const [
      totalLogs,
      logsByLevel,
      logsByAction,
      logsByEntityType,
    ] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.groupBy({
        by: ['level'],
        where,
        _count: true,
      }),
      prisma.auditLog.groupBy({
        by: ['action'],
        where,
        _count: true,
        orderBy: { _count: { action: 'desc' } },
        take: 10,
      }),
      prisma.auditLog.groupBy({
        by: ['entityType'],
        where: { ...where, entityType: { not: null } },
        _count: true,
        orderBy: { _count: { entityType: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      totalLogs,
      byLevel: logsByLevel.reduce((acc, item) => {
        acc[item.level] = item._count;
        return acc;
      }, {} as Record<string, number>),
      byAction: logsByAction.map((item) => ({
        action: item.action,
        count: item._count,
      })),
      byEntityType: logsByEntityType.map((item) => ({
        entityType: item.entityType,
        count: item._count,
      })),
    };
  }

  /**
   * Récupérer l'historique d'une entité spécifique
   */
  static async getEntityHistory(entityType: string, entityId: string) {
    return await prisma.auditLog.findMany({
      where: {
        entityType,
        entityId,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Nettoyer les anciens logs (à exécuter périodiquement)
   */
  static async cleanOldLogs(daysToKeep: number = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
        level: {
          in: [AuditLevel.INFO], // Garder les WARNING, ERROR, CRITICAL plus longtemps
        },
      },
    });

    return {
      deletedCount: result.count,
      cutoffDate,
    };
  }
}

export default AuditLogService;
