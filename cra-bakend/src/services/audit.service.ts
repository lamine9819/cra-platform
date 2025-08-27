// src/services/audit.service.ts - Version corrigée
import { PrismaClient, AuditLevel } from '@prisma/client'; // ← AJOUT de AuditLevel
import { Request } from 'express';
import { 
  CreateAuditLogRequest, 
  AuditLogEntry, 
  AuditLogQuery, 
  AuditLogResponse, 
  AuditLogStats,
  AuditAction,
  EntityType 
} from '../types/audit.types';

const prisma = new PrismaClient();

export class AuditService {

  // Créer une entrée d'audit - VERSION CORRIGÉE
  async createAuditLog(request: CreateAuditLogRequest, req?: Request): Promise<AuditLogEntry> {
    try {
      // Enrichir les métadonnées avec les informations de la requête
      const metadata = {
        userAgent: req?.get('User-Agent'),
        ip: this.getClientIP(req),
        source: req?.get('Origin') || req?.get('Referer'),
        timestamp: new Date(),
        requestId: this.generateRequestId(),
        sessionId: this.extractSessionId(req),
        ...request.metadata
      };

      // Créer l'entrée d'audit
      const auditLog = await prisma.auditLog.create({
        data: {
          action: request.action,
          level: request.level || AuditLevel.INFO, // ← CORRECTION : utiliser l'enum
          userId: request.userId,
          entityType: request.entityType as EntityType,
          entityId: request.entityId,
          details: request.details || {},
          metadata: metadata as any,
          changes: request.changes as any,
        }
      });

      console.log(`📋 Audit Log: ${request.action} by ${request.userId || 'SYSTEM'}`);
      
      // ← CORRECTION : conversion de type sécurisée
      return this.convertToAuditLogEntry(auditLog, metadata);
    } catch (error) {
      console.error('❌ Erreur création audit log:', error);
      throw error;
    }
  }

  // Lister les logs d'audit avec filtres
  async getAuditLogs(query: AuditLogQuery, requesterId: string, requesterRole: string) {
    // Vérifier les permissions
    if (requesterRole !== 'ADMINISTRATEUR') {
      throw new Error('Accès refusé : seuls les administrateurs peuvent consulter les logs d\'audit');
    }

    const page = query.page || 1;
    const limit = Math.min(query.limit || 50, 100); // Limiter à 100 max
    const skip = (page - 1) * limit;

    // Construire les filtres
    const where: any = {};

    if (query.action) where.action = query.action;
    if (query.level) where.level = query.level;
    if (query.userId) where.userId = query.userId;
    if (query.entityType) where.entityType = query.entityType;
    if (query.entityId) where.entityId = query.entityId;

    if (query.startDate) {
      where.createdAt = { gte: new Date(query.startDate) };
    }
    if (query.endDate) {
      where.createdAt = {
        ...where.createdAt,
        lte: new Date(query.endDate)
      };
    }

    if (query.search) {
      where.OR = [
        { action: { contains: query.search, mode: 'insensitive' } },
        { 
          details: {
            path: ['title'],
            string_contains: query.search
          }
        },
        {
          details: {
            path: ['description'],
            string_contains: query.search
          }
        }
      ];
    }

    if (query.source) {
      where.metadata = {
        path: ['source'],
        string_contains: query.source
      };
    }

    if (query.ip) {
      where.metadata = {
        path: ['ip'],
        equals: query.ip
      };
    }

    // Exécuter la requête
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
              role: true,
            }
          }
        }
      }),
      prisma.auditLog.count({ where })
    ]);

    // Enrichir avec les informations d'entité
    const enrichedLogs = await Promise.all(
      logs.map((log: any) => this.enrichLogWithEntityInfo(log))
    );

    return {
      logs: enrichedLogs.map(log => this.formatAuditLogResponse(log)),
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

  // Obtenir les statistiques d'audit
  async getAuditStats(requesterId: string, requesterRole: string, days: number = 30): Promise<AuditLogStats> {
    // Vérifier les permissions
    if (requesterRole !== 'ADMINISTRATEUR') {
      throw new Error('Accès refusé : seuls les administrateurs peuvent consulter les statistiques d\'audit');
    }

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
      totalLogs,
      actionStats,
      levelStats,
      entityTypeStats,
      userStats,
      dailyActivity,
      topActions,
      securityMetrics
    ] = await Promise.all([
      // Total des logs
      prisma.auditLog.count({
        where: { createdAt: { gte: startDate } }
      }),

      // Statistiques par action
      prisma.auditLog.groupBy({
        by: ['action'],
        _count: true,
        where: { createdAt: { gte: startDate } },
        orderBy: { _count: { action: 'desc' } },
        take: 20
      }),

      // Statistiques par niveau
      prisma.auditLog.groupBy({
        by: ['level'],
        _count: true,
        where: { createdAt: { gte: startDate } }
      }),

      // Statistiques par type d'entité
      prisma.auditLog.groupBy({
        by: ['entityType'],
        _count: true,
        where: { 
          createdAt: { gte: startDate },
          entityType: { not: null }
        },
        orderBy: { _count: { entityType: 'desc' } }
      }),

      // Statistiques par utilisateur
      prisma.auditLog.groupBy({
        by: ['userId'],
        _count: true,
        where: { 
          createdAt: { gte: startDate },
          userId: { not: null }
        },
        orderBy: { _count: { userId: 'desc' } },
        take: 10
      }),

      // Activité quotidienne
      prisma.$queryRaw`
        SELECT DATE(createdAt) as date, COUNT(*) as count
        FROM AuditLog 
        WHERE createdAt >= ${startDate}
        GROUP BY DATE(createdAt)
        ORDER BY date DESC
        LIMIT 30
      `,

      // Top actions
      prisma.auditLog.groupBy({
        by: ['action'],
        _count: true,
        where: { createdAt: { gte: startDate } },
        orderBy: { _count: { action: 'desc' } },
        take: 10
      }),

      // Métriques de sécurité
      this.getSecurityMetrics(startDate)
    ]);

    // Enrichir les statistiques utilisateur avec les noms
    const enrichedUserStats = await this.enrichUserStats(userStats);

    return {
      totalLogs,
      byAction: this.formatGroupByStats(actionStats),
      byLevel: this.formatLevelStats(levelStats),
      byEntityType: this.formatGroupByStats(entityTypeStats),
      byUser: enrichedUserStats,
      recentActivity: (dailyActivity as any[]).map((day: any) => ({
        date: day.date,
        count: Number(day.count)
      })),
      topActions: topActions.map((item: any) => ({
        action: item.action as AuditAction,
        count: item._count
      })),
      securityEvents: securityMetrics
    };
  }

  // Obtenir un log d'audit par ID
  async getAuditLogById(id: string, requesterId: string, requesterRole: string): Promise<AuditLogResponse> {
    // Vérifier les permissions
    if (requesterRole !== 'ADMINISTRATEUR') {
      throw new Error('Accès refusé : seuls les administrateurs peuvent consulter les logs d\'audit');
    }

    const log = await prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          }
        }
      }
    });

    if (!log) {
      throw new Error('Log d\'audit non trouvé');
    }

    const enrichedLog = await this.enrichLogWithEntityInfo(log);
    return this.formatAuditLogResponse(enrichedLog);
  }

  // Exporter les logs d'audit
  async exportAuditLogs(query: AuditLogQuery, requesterId: string, requesterRole: string, format: 'csv' | 'json' = 'csv') {
    // Vérifier les permissions
    if (requesterRole !== 'ADMINISTRATEUR') {
      throw new Error('Accès refusé : seuls les administrateurs peuvent exporter les logs d\'audit');
    }

    // Récupérer tous les logs selon les filtres (limité à 10000)
    const result = await this.getAuditLogs({ ...query, limit: 10000 }, requesterId, requesterRole);

    if (format === 'json') {
      return JSON.stringify(result.logs, null, 2);
    }

    // Format CSV
    const headers = [
      'ID', 'Action', 'Niveau', 'Utilisateur', 'Type Entité', 'ID Entité',
      'IP', 'User Agent', 'Date', 'Détails'
    ];

    const rows = result.logs.map(log => [
      log.id,
      log.action,
      log.level,
      log.user ? `${log.user.firstName} ${log.user.lastName}` : 'SYSTÈME',
      log.entityType || '',
      log.entityId || '',
      log.metadata.ip || '',
      log.metadata.userAgent || '',
      log.createdAt.toISOString(),
      JSON.stringify(log.details)
    ]);

    return [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
  }

  // Nettoyer les anciens logs
  async cleanupOldLogs(daysToKeep: number = 365): Promise<{ deleted: number }> {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

    const result = await prisma.auditLog.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
        level: { not: AuditLevel.CRITICAL } // ← CORRECTION : utiliser l'enum
      }
    });

    return { deleted: result.count };
  }

  // =============================================
  // MÉTHODES UTILITAIRES PRIVÉES - NOUVELLES
  // =============================================

  // ← NOUVELLE MÉTHODE : Conversion sécurisée vers AuditLogEntry
  private convertToAuditLogEntry(auditLog: any, metadata: any): AuditLogEntry {
    return {
      id: auditLog.id,
      action: auditLog.action as AuditAction,
      level: auditLog.level,
      userId: auditLog.userId,
      entityType: auditLog.entityType as EntityType,
      entityId: auditLog.entityId,
      details: auditLog.details as Record<string, any>,
      metadata: {
        userAgent: metadata.userAgent,
        ip: metadata.ip,
        source: metadata.source,
        timestamp: metadata.timestamp,
        requestId: metadata.requestId,
        sessionId: metadata.sessionId,
      },
      changes: auditLog.changes as {
        before?: Record<string, any>;
        after?: Record<string, any>;
        fields?: string[];
      },
      createdAt: auditLog.createdAt,
    };
  }

  // ← NOUVELLE MÉTHODE : Parser les metadata depuis la DB
  private parseMetadata(metadata: any): {
    userAgent?: string;
    ip?: string;
    source?: string;
    timestamp: Date;
    requestId?: string;
    sessionId?: string;
  } {
    if (!metadata || typeof metadata !== 'object') {
      return {
        timestamp: new Date()
      };
    }

    return {
      userAgent: metadata.userAgent,
      ip: metadata.ip,
      source: metadata.source,
      timestamp: metadata.timestamp ? new Date(metadata.timestamp) : new Date(),
      requestId: metadata.requestId,
      sessionId: metadata.sessionId,
    };
  }

  private getClientIP(req?: Request): string {
    if (!req) return 'unknown';
    
    return (
      req.ip ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      (req.headers['x-real-ip'] as string) ||
      'unknown'
    );
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private extractSessionId(req?: Request): string | undefined {
    // Extraire l'ID de session depuis les cookies ou headers
    return req?.cookies?.sessionId || req?.headers['x-session-id'] as string;
  }

  private async enrichLogWithEntityInfo(log: any) {
    if (!log.entityType || !log.entityId) {
      return log;
    }

    let entityInfo = null;

    try {
      switch (log.entityType) {
        case 'project':
          const project = await prisma.project.findUnique({
            where: { id: log.entityId },
            select: { id: true, title: true }
          });
          if (project) {
            entityInfo = { type: 'project', id: project.id, title: project.title };
          }
          break;

        case 'task':
          const task = await prisma.task.findUnique({
            where: { id: log.entityId },
            select: { id: true, title: true }
          });
          if (task) {
            entityInfo = { type: 'task', id: task.id, title: task.title };
          }
          break;

        case 'user':
          const user = await prisma.user.findUnique({
            where: { id: log.entityId },
            select: { id: true, firstName: true, lastName: true }
          });
          if (user) {
            entityInfo = { 
              type: 'user', 
              id: user.id, 
              title: `${user.firstName} ${user.lastName}` 
            };
          }
          break;

        case 'document':
          const document = await prisma.document.findUnique({
            where: { id: log.entityId },
            select: { id: true, title: true }
          });
          if (document) {
            entityInfo = { type: 'document', id: document.id, title: document.title };
          }
          break;

        case 'seminar':
          const seminar = await prisma.seminar.findUnique({
            where: { id: log.entityId },
            select: { id: true, title: true }
          });
          if (seminar) {
            entityInfo = { type: 'seminar', id: seminar.id, title: seminar.title };
          }
          break;
      }
    } catch (error) {
      console.warn(`Entité ${log.entityType}:${log.entityId} non trouvée pour l'audit log ${log.id}`);
    }

    return { ...log, entityInfo };
  }

  private formatAuditLogResponse(log: any): AuditLogResponse {
    return {
      id: log.id,
      action: log.action as AuditAction,
      level: log.level as AuditLevel,
      userId: log.userId,
      entityType: log.entityType as EntityType,
      entityId: log.entityId,
      details: log.details as Record<string, any>,
      metadata: this.parseMetadata(log.metadata), // ← CORRECTION : parser les metadata
      changes: log.changes as any,
      createdAt: log.createdAt,
      user: log.user,
      entity: log.entityInfo
    };
  }

  private formatGroupByStats(stats: any[]): Record<string, number> {
    return stats.reduce((acc: Record<string, number>, item: any) => {
      const key = Object.keys(item).find(k => k !== '_count') || 'unknown';
      const value = item[key as keyof typeof item];
      acc[String(value)] = item._count;
      return acc;
    }, {});
  }

  private formatLevelStats(stats: any[]): Record<AuditLevel, number> {
    const result: Record<AuditLevel, number> = {
      INFO: 0,
      WARNING: 0,
      ERROR: 0,
      CRITICAL: 0
    };

    stats.forEach((item: any) => {
      const level = item.level as AuditLevel;
      if (level && level in result) {
        result[level] = item._count;
      }
    });

    return result;
  }

  private async enrichUserStats(userStats: any[]): Promise<Array<{ userId: string; userName: string; count: number }>> {
    const userIds = userStats.map(stat => stat.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, lastName: true }
    });

    return userStats.map((stat: any) => {
      const user = users.find((u: any) => u.id === stat.userId);
      return {
        userId: stat.userId,
        userName: user ? `${user.firstName} ${user.lastName}` : 'Utilisateur supprimé',
        count: stat._count
      };
    });
  }

  private async getSecurityMetrics(startDate: Date) {
    const [failedLogins, suspiciousActivity, adminActions] = await Promise.all([
      prisma.auditLog.count({
        where: {
          action: 'AUTH_LOGIN_FAILED',
          createdAt: { gte: startDate }
        }
      }),

      prisma.auditLog.count({
        where: {
          level: { in: [AuditLevel.WARNING, AuditLevel.ERROR] }, // ← CORRECTION : utiliser l'enum
          createdAt: { gte: startDate }
        }
      }),

      prisma.auditLog.count({
        where: {
          createdAt: { gte: startDate },
          user: {
            role: 'ADMINISTRATEUR'
          }
        }
      })
    ]);

    return {
      failedLogins,
      suspiciousActivity,
      adminActions
    };
  }
}

// =============================================
// FONCTIONS UTILITAIRES D'AUDIT - CORRIGÉES
// =============================================

// Fonction helper pour créer rapidement un log d'audit
export const createAuditLog = async (
  action: AuditAction,
  options: {
    level?: AuditLevel;
    userId?: string;
    entityType?: EntityType;
    entityId?: string;
    details?: Record<string, any>;
    changes?: {
      before?: Record<string, any>;
      after?: Record<string, any>;
      fields?: string[];
    };
  } = {},
  req?: Request
) => {
  const auditService = new AuditService();
  return auditService.createAuditLog({
    action,
    level: options.level || AuditLevel.INFO, // ← CORRECTION : utiliser l'enum
    userId: options.userId,
    entityType: options.entityType,
    entityId: options.entityId,
    details: options.details,
    changes: options.changes
  }, req);
};

// Fonction pour detecter les changements entre deux objets
export const detectChanges = (before: any, after: any): { before: any; after: any; fields: string[] } => {
  const changes = { 
    before: {} as Record<string, any>, 
    after: {} as Record<string, any>, 
    fields: [] as string[] 
  };
  
  const allKeys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);
  
  for (const key of allKeys) {
    if (JSON.stringify(before?.[key]) !== JSON.stringify(after?.[key])) {
      changes.before[key] = before?.[key];
      changes.after[key] = after?.[key];
      changes.fields.push(key);
    }
  }
  
  return changes;
};