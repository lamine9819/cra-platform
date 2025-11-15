"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectChanges = exports.createAuditLog = exports.AuditService = void 0;
// src/services/audit.service.ts - Version corrigée
const client_1 = require("@prisma/client"); // ← AJOUT de AuditLevel
const prisma = new client_1.PrismaClient();
class AuditService {
    // Créer une entrée d'audit - VERSION CORRIGÉE
    async createAuditLog(request, req) {
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
                    level: request.level || client_1.AuditLevel.INFO, // ← CORRECTION : utiliser l'enum
                    userId: request.userId,
                    entityType: request.entityType,
                    entityId: request.entityId,
                    details: request.details || {},
                    metadata: metadata,
                    changes: request.changes,
                }
            });
            console.log(`📋 Audit Log: ${request.action} by ${request.userId || 'SYSTEM'}`);
            // ← CORRECTION : conversion de type sécurisée
            return this.convertToAuditLogEntry(auditLog, metadata);
        }
        catch (error) {
            console.error('❌ Erreur création audit log:', error);
            throw error;
        }
    }
    // Lister les logs d'audit avec filtres
    async getAuditLogs(query, requesterId, requesterRole) {
        // Vérifier les permissions
        if (requesterRole !== 'ADMINISTRATEUR') {
            throw new Error('Accès refusé : seuls les administrateurs peuvent consulter les logs d\'audit');
        }
        const page = query.page || 1;
        const limit = Math.min(query.limit || 50, 100); // Limiter à 100 max
        const skip = (page - 1) * limit;
        // Construire les filtres
        const where = {};
        if (query.action)
            where.action = query.action;
        if (query.level)
            where.level = query.level;
        if (query.userId)
            where.userId = query.userId;
        if (query.entityType)
            where.entityType = query.entityType;
        if (query.entityId)
            where.entityId = query.entityId;
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
        const enrichedLogs = await Promise.all(logs.map((log) => this.enrichLogWithEntityInfo(log)));
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
    async getAuditStats(requesterId, requesterRole, days = 30) {
        // Vérifier les permissions
        if (requesterRole !== 'ADMINISTRATEUR') {
            throw new Error('Accès refusé : seuls les administrateurs peuvent consulter les statistiques d\'audit');
        }
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const [totalLogs, actionStats, levelStats, entityTypeStats, userStats, dailyActivity, topActions, securityMetrics] = await Promise.all([
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
            prisma.$queryRaw `
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
            recentActivity: dailyActivity.map((day) => ({
                date: day.date,
                count: Number(day.count)
            })),
            topActions: topActions.map((item) => ({
                action: item.action,
                count: item._count
            })),
            securityEvents: securityMetrics
        };
    }
    // Obtenir un log d'audit par ID
    async getAuditLogById(id, requesterId, requesterRole) {
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
    async exportAuditLogs(query, requesterId, requesterRole, format = 'csv') {
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
    async cleanupOldLogs(daysToKeep = 365) {
        const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
        const result = await prisma.auditLog.deleteMany({
            where: {
                createdAt: { lt: cutoffDate },
                level: { not: client_1.AuditLevel.CRITICAL } // ← CORRECTION : utiliser l'enum
            }
        });
        return { deleted: result.count };
    }
    // =============================================
    // MÉTHODES UTILITAIRES PRIVÉES - NOUVELLES
    // =============================================
    // ← NOUVELLE MÉTHODE : Conversion sécurisée vers AuditLogEntry
    convertToAuditLogEntry(auditLog, metadata) {
        return {
            id: auditLog.id,
            action: auditLog.action,
            level: auditLog.level,
            userId: auditLog.userId,
            entityType: auditLog.entityType,
            entityId: auditLog.entityId,
            details: auditLog.details,
            metadata: {
                userAgent: metadata.userAgent,
                ip: metadata.ip,
                source: metadata.source,
                timestamp: metadata.timestamp,
                requestId: metadata.requestId,
                sessionId: metadata.sessionId,
            },
            changes: auditLog.changes,
            createdAt: auditLog.createdAt,
        };
    }
    // ← NOUVELLE MÉTHODE : Parser les metadata depuis la DB
    parseMetadata(metadata) {
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
    getClientIP(req) {
        if (!req)
            return 'unknown';
        return (req.ip ||
            req.connection?.remoteAddress ||
            req.socket?.remoteAddress ||
            req.headers['x-forwarded-for']?.split(',')[0] ||
            req.headers['x-real-ip'] ||
            'unknown');
    }
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    extractSessionId(req) {
        // Extraire l'ID de session depuis les cookies ou headers
        return req?.cookies?.sessionId || req?.headers['x-session-id'];
    }
    async enrichLogWithEntityInfo(log) {
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
        }
        catch (error) {
            console.warn(`Entité ${log.entityType}:${log.entityId} non trouvée pour l'audit log ${log.id}`);
        }
        return { ...log, entityInfo };
    }
    formatAuditLogResponse(log) {
        return {
            id: log.id,
            action: log.action,
            level: log.level,
            userId: log.userId,
            entityType: log.entityType,
            entityId: log.entityId,
            details: log.details,
            metadata: this.parseMetadata(log.metadata), // ← CORRECTION : parser les metadata
            changes: log.changes,
            createdAt: log.createdAt,
            user: log.user,
            entity: log.entityInfo
        };
    }
    formatGroupByStats(stats) {
        return stats.reduce((acc, item) => {
            const key = Object.keys(item).find(k => k !== '_count') || 'unknown';
            const value = item[key];
            acc[String(value)] = item._count;
            return acc;
        }, {});
    }
    formatLevelStats(stats) {
        const result = {
            INFO: 0,
            WARNING: 0,
            ERROR: 0,
            CRITICAL: 0
        };
        stats.forEach((item) => {
            const level = item.level;
            if (level && level in result) {
                result[level] = item._count;
            }
        });
        return result;
    }
    async enrichUserStats(userStats) {
        const userIds = userStats.map(stat => stat.userId);
        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, firstName: true, lastName: true }
        });
        return userStats.map((stat) => {
            const user = users.find((u) => u.id === stat.userId);
            return {
                userId: stat.userId,
                userName: user ? `${user.firstName} ${user.lastName}` : 'Utilisateur supprimé',
                count: stat._count
            };
        });
    }
    async getSecurityMetrics(startDate) {
        const [failedLogins, suspiciousActivity, adminActions] = await Promise.all([
            prisma.auditLog.count({
                where: {
                    action: 'AUTH_LOGIN_FAILED',
                    createdAt: { gte: startDate }
                }
            }),
            prisma.auditLog.count({
                where: {
                    level: { in: [client_1.AuditLevel.WARNING, client_1.AuditLevel.ERROR] }, // ← CORRECTION : utiliser l'enum
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
exports.AuditService = AuditService;
// =============================================
// FONCTIONS UTILITAIRES D'AUDIT - CORRIGÉES
// =============================================
// Fonction helper pour créer rapidement un log d'audit
const createAuditLog = async (action, options = {}, req) => {
    const auditService = new AuditService();
    return auditService.createAuditLog({
        action,
        level: options.level || client_1.AuditLevel.INFO, // ← CORRECTION : utiliser l'enum
        userId: options.userId,
        entityType: options.entityType,
        entityId: options.entityId,
        details: options.details,
        changes: options.changes
    }, req);
};
exports.createAuditLog = createAuditLog;
// Fonction pour detecter les changements entre deux objets
const detectChanges = (before, after) => {
    const changes = {
        before: {},
        after: {},
        fields: []
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
exports.detectChanges = detectChanges;
//# sourceMappingURL=audit.service.js.map