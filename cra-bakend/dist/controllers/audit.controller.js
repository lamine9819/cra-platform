"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditController = void 0;
const audit_service_1 = require("../services/audit.service");
const zod_1 = require("zod");
const auditQuerySchema = zod_1.z.object({
    page: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(1)).optional(),
    limit: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(1).max(100)).optional(),
    action: zod_1.z.string().optional(),
    level: zod_1.z.enum(['INFO', 'WARNING', 'ERROR', 'CRITICAL']).optional(),
    userId: zod_1.z.cuid().optional(),
    entityType: zod_1.z.enum(['user', 'project', 'activity', 'task', 'document', 'form', 'seminar', 'comment', 'notification', 'system']).optional(),
    entityId: zod_1.z.cuid().optional(),
    startDate: zod_1.z.string().refine((val) => {
        const date = new Date(val);
        return !isNaN(date.getTime());
    }, { message: "Date invalide" }).optional(),
    endDate: zod_1.z.string().refine((val) => {
        const date = new Date(val);
        return !isNaN(date.getTime());
    }, { message: "Date invalide" }).optional(),
    search: zod_1.z.string().optional(),
    source: zod_1.z.string().optional(),
    ip: zod_1.z.string().optional(),
});
const auditService = new audit_service_1.AuditService();
class AuditController {
    constructor() {
        // Lister les logs d'audit
        this.getAuditLogs = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const queryParams = auditQuerySchema.parse(req.query);
                const requesterId = authenticatedReq.user.userId;
                const requesterRole = authenticatedReq.user.role;
                const result = await auditService.getAuditLogs(queryParams, requesterId, requesterRole);
                res.status(200).json({
                    success: true,
                    data: result.logs,
                    pagination: result.pagination,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Obtenir un log d'audit par ID
        this.getAuditLogById = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { id } = req.params;
                const requesterId = authenticatedReq.user.userId;
                const requesterRole = authenticatedReq.user.role;
                const log = await auditService.getAuditLogById(id, requesterId, requesterRole);
                res.status(200).json({
                    success: true,
                    data: log,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Obtenir les statistiques d'audit
        this.getAuditStats = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const days = parseInt(req.query.days) || 30;
                const requesterId = authenticatedReq.user.userId;
                const requesterRole = authenticatedReq.user.role;
                const stats = await auditService.getAuditStats(requesterId, requesterRole, days);
                res.status(200).json({
                    success: true,
                    data: stats,
                    period: `${days} derniers jours`,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Exporter les logs d'audit
        this.exportAuditLogs = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const queryParams = auditQuerySchema.parse(req.query);
                const format = req.query.format || 'csv';
                const requesterId = authenticatedReq.user.userId;
                const requesterRole = authenticatedReq.user.role;
                if (!['csv', 'json'].includes(format)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Format non supporté. Utilisez csv ou json.'
                    });
                }
                const exportData = await auditService.exportAuditLogs(queryParams, requesterId, requesterRole, format);
                const filename = `audit-logs-${new Date().toISOString().split('T')[0]}.${format}`;
                res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/json');
                res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                res.send(exportData);
            }
            catch (error) {
                next(error);
            }
        };
        // Nettoyer les anciens logs (Admin uniquement)
        this.cleanupOldLogs = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const daysToKeep = parseInt(req.body.daysToKeep) || 365;
                const requesterRole = authenticatedReq.user.role;
                if (requesterRole !== 'ADMINISTRATEUR') {
                    return res.status(403).json({
                        success: false,
                        message: 'Accès refusé : seuls les administrateurs peuvent nettoyer les logs'
                    });
                }
                const result = await auditService.cleanupOldLogs(daysToKeep);
                res.status(200).json({
                    success: true,
                    message: `${result.deleted} logs supprimés`,
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Obtenir les logs d'audit pour un utilisateur spécifique
        this.getUserAuditLogs = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { userId } = req.params;
                const queryParams = auditQuerySchema.parse({
                    ...req.query,
                    userId: userId
                });
                const requesterId = authenticatedReq.user.userId;
                const requesterRole = authenticatedReq.user.role;
                const result = await auditService.getAuditLogs(queryParams, requesterId, requesterRole);
                res.status(200).json({
                    success: true,
                    data: result.logs,
                    pagination: result.pagination,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Obtenir les logs d'audit pour une entité spécifique
        this.getEntityAuditLogs = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { entityType, entityId } = req.params;
                const queryParams = auditQuerySchema.parse({
                    ...req.query,
                    entityType: entityType,
                    entityId: entityId
                });
                const requesterId = authenticatedReq.user.userId;
                const requesterRole = authenticatedReq.user.role;
                const result = await auditService.getAuditLogs(queryParams, requesterId, requesterRole);
                res.status(200).json({
                    success: true,
                    data: result.logs,
                    pagination: result.pagination,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Obtenir les événements de sécurité récents
        this.getSecurityEvents = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const days = parseInt(req.query.days) || 7;
                const requesterId = authenticatedReq.user.userId;
                const requesterRole = authenticatedReq.user.role;
                if (requesterRole !== 'ADMINISTRATEUR') {
                    return res.status(403).json({
                        success: false,
                        message: 'Accès refusé : seuls les administrateurs peuvent consulter les événements de sécurité'
                    });
                }
                // Rechercher les événements de sécurité suspects
                const securityQueryParams = {
                    level: 'WARNING',
                    startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
                    limit: 50
                };
                const result = await auditService.getAuditLogs(securityQueryParams, requesterId, requesterRole);
                // Filtrer les événements de sécurité
                const securityEvents = result.logs.filter(log => log.action.includes('AUTH_') ||
                    log.level === 'ERROR' ||
                    log.level === 'CRITICAL' ||
                    log.action.includes('DELETED') ||
                    log.action.includes('ROLE_CHANGED'));
                res.status(200).json({
                    success: true,
                    data: securityEvents,
                    period: `${days} derniers jours`,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Obtenir les tentatives de connexion échouées
        this.getFailedLoginAttempts = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const hours = parseInt(req.query.hours) || 24;
                const requesterId = authenticatedReq.user.userId;
                const requesterRole = authenticatedReq.user.role;
                if (requesterRole !== 'ADMINISTRATEUR') {
                    return res.status(403).json({
                        success: false,
                        message: 'Accès refusé'
                    });
                }
                const queryParams = {
                    action: 'AUTH_LOGIN_FAILED',
                    startDate: new Date(Date.now() - hours * 60 * 60 * 1000).toISOString(),
                    limit: 100
                };
                const result = await auditService.getAuditLogs(queryParams, requesterId, requesterRole);
                // Grouper par IP pour détecter les attaques
                const ipGroups = result.logs.reduce((acc, log) => {
                    const ip = log.metadata.ip || 'unknown';
                    if (!acc[ip])
                        acc[ip] = [];
                    acc[ip].push(log);
                    return acc;
                }, {});
                const suspiciousIPs = Object.entries(ipGroups)
                    .filter(([ip, logs]) => logs.length >= 5)
                    .map(([ip, logs]) => ({
                    ip,
                    attempts: logs.length,
                    lastAttempt: logs[0].createdAt,
                    emails: [...new Set(logs.map((log) => log.details.email))]
                }));
                res.status(200).json({
                    success: true,
                    data: {
                        totalAttempts: result.logs.length,
                        suspiciousIPs,
                        recentAttempts: result.logs.slice(0, 20)
                    },
                    period: `${hours} dernières heures`,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Obtenir l'activité d'un utilisateur spécifique
        this.getUserActivity = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const { userId } = req.params;
                const days = parseInt(req.query.days) || 7;
                const requesterId = authenticatedReq.user.userId;
                const requesterRole = authenticatedReq.user.role;
                // Vérifier les permissions
                if (requesterRole !== 'ADMINISTRATEUR' && requesterId !== userId) {
                    return res.status(403).json({
                        success: false,
                        message: 'Accès refusé'
                    });
                }
                const queryParams = {
                    userId,
                    startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
                    limit: 100
                };
                const result = await auditService.getAuditLogs(queryParams, requesterId, requesterRole);
                // Analyser l'activité
                const activitySummary = {
                    totalActions: result.logs.length,
                    actionTypes: result.logs.reduce((acc, log) => {
                        acc[log.action] = (acc[log.action] || 0) + 1;
                        return acc;
                    }, {}),
                    dailyActivity: result.logs.reduce((acc, log) => {
                        const date = log.createdAt.toISOString().split('T')[0];
                        acc[date] = (acc[date] || 0) + 1;
                        return acc;
                    }, {}),
                    recentActions: result.logs.slice(0, 20)
                };
                res.status(200).json({
                    success: true,
                    data: activitySummary,
                    period: `${days} derniers jours`,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Obtenir les modifications récentes
        this.getRecentChanges = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const hours = parseInt(req.query.hours) || 24;
                const requesterId = authenticatedReq.user.userId;
                const requesterRole = authenticatedReq.user.role;
                if (requesterRole !== 'ADMINISTRATEUR') {
                    return res.status(403).json({
                        success: false,
                        message: 'Accès refusé'
                    });
                }
                const queryParams = {
                    startDate: new Date(Date.now() - hours * 60 * 60 * 1000).toISOString(),
                    limit: 50
                };
                const result = await auditService.getAuditLogs(queryParams, requesterId, requesterRole);
                // Filtrer les logs avec des changements
                const changesLogs = result.logs.filter(log => log.changes &&
                    log.changes.fields &&
                    log.changes.fields.length > 0);
                res.status(200).json({
                    success: true,
                    data: changesLogs,
                    period: `${hours} dernières heures`,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Recherche avancée dans les logs
        this.searchAuditLogs = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const searchSchema = zod_1.z.object({
                    query: zod_1.z.string().min(1, 'Terme de recherche requis'),
                    filters: zod_1.z.object({
                        actions: zod_1.z.array(zod_1.z.string()).optional(),
                        levels: zod_1.z.array(zod_1.z.enum(['INFO', 'WARNING', 'ERROR', 'CRITICAL'])).optional(),
                        users: zod_1.z.array(zod_1.z.string()).optional(),
                        entities: zod_1.z.array(zod_1.z.string()).optional(),
                        dateRange: zod_1.z.object({
                            start: zod_1.z.string(),
                            end: zod_1.z.string()
                        }).optional()
                    }).optional(),
                    page: zod_1.z.number().min(1).default(1),
                    limit: zod_1.z.number().min(1).max(100).default(20)
                });
                const searchParams = searchSchema.parse(req.body);
                const requesterId = authenticatedReq.user.userId;
                const requesterRole = authenticatedReq.user.role;
                if (requesterRole !== 'ADMINISTRATEUR') {
                    return res.status(403).json({
                        success: false,
                        message: 'Accès refusé'
                    });
                }
                // Construire les paramètres de recherche
                const queryParams = {
                    search: searchParams.query,
                    page: searchParams.page,
                    limit: searchParams.limit
                };
                if (searchParams.filters?.dateRange) {
                    queryParams.startDate = searchParams.filters.dateRange.start;
                    queryParams.endDate = searchParams.filters.dateRange.end;
                }
                const result = await auditService.getAuditLogs(queryParams, requesterId, requesterRole);
                // Appliquer les filtres additionnels
                let filteredLogs = result.logs;
                if (searchParams.filters?.actions?.length) {
                    filteredLogs = filteredLogs.filter(log => searchParams.filters.actions.includes(log.action));
                }
                if (searchParams.filters?.levels?.length) {
                    filteredLogs = filteredLogs.filter(log => searchParams.filters.levels.includes(log.level));
                }
                if (searchParams.filters?.users?.length) {
                    filteredLogs = filteredLogs.filter(log => log.userId && searchParams.filters.users.includes(log.userId));
                }
                res.status(200).json({
                    success: true,
                    data: filteredLogs,
                    total: filteredLogs.length,
                    query: searchParams.query,
                    filters: searchParams.filters
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Créer un rapport d'audit personnalisé
        this.generateAuditReport = async (req, res, next) => {
            try {
                const authenticatedReq = req;
                const reportSchema = zod_1.z.object({
                    title: zod_1.z.string().min(1, 'Titre requis'),
                    description: zod_1.z.string().optional(),
                    dateRange: zod_1.z.object({
                        start: zod_1.z.string(),
                        end: zod_1.z.string()
                    }),
                    filters: zod_1.z.object({
                        actions: zod_1.z.array(zod_1.z.string()).optional(),
                        levels: zod_1.z.array(zod_1.z.enum(['INFO', 'WARNING', 'ERROR', 'CRITICAL'])).optional(),
                        users: zod_1.z.array(zod_1.z.string()).optional(),
                        entities: zod_1.z.array(zod_1.z.string()).optional()
                    }).optional(),
                    includeStats: zod_1.z.boolean().default(true),
                    format: zod_1.z.enum(['json', 'csv']).default('json')
                });
                const reportParams = reportSchema.parse(req.body);
                const requesterId = authenticatedReq.user.userId;
                const requesterRole = authenticatedReq.user.role;
                if (requesterRole !== 'ADMINISTRATEUR') {
                    return res.status(403).json({
                        success: false,
                        message: 'Accès refusé'
                    });
                }
                // Récupérer les logs selon les filtres
                const queryParams = {
                    startDate: reportParams.dateRange.start,
                    endDate: reportParams.dateRange.end,
                    limit: 1000 // Limite pour les rapports
                };
                const result = await auditService.getAuditLogs(queryParams, requesterId, requesterRole);
                // Appliquer les filtres
                let reportLogs = result.logs;
                if (reportParams.filters?.actions?.length) {
                    reportLogs = reportLogs.filter(log => reportParams.filters.actions.includes(log.action));
                }
                if (reportParams.filters?.levels?.length) {
                    reportLogs = reportLogs.filter(log => reportParams.filters.levels.includes(log.level));
                }
                if (reportParams.filters?.users?.length) {
                    reportLogs = reportLogs.filter(log => log.userId && reportParams.filters.users.includes(log.userId));
                }
                // Générer les statistiques si demandées
                let stats = null;
                if (reportParams.includeStats) {
                    stats = {
                        totalLogs: reportLogs.length,
                        byLevel: reportLogs.reduce((acc, log) => {
                            acc[log.level] = (acc[log.level] || 0) + 1;
                            return acc;
                        }, {}),
                        byAction: reportLogs.reduce((acc, log) => {
                            acc[log.action] = (acc[log.action] || 0) + 1;
                            return acc;
                        }, {}),
                        byUser: reportLogs.reduce((acc, log) => {
                            if (log.userId) {
                                const userName = log.user ? `${log.user.firstName} ${log.user.lastName}` : log.userId;
                                acc[userName] = (acc[userName] || 0) + 1;
                            }
                            return acc;
                        }, {}),
                        dateRange: reportParams.dateRange
                    };
                }
                const report = {
                    title: reportParams.title,
                    description: reportParams.description,
                    generatedAt: new Date().toISOString(),
                    generatedBy: requesterId,
                    stats,
                    logs: reportLogs,
                    filters: reportParams.filters
                };
                if (reportParams.format === 'csv') {
                    // Générer un CSV simplifié
                    const csvData = await auditService.exportAuditLogs(queryParams, requesterId, requesterRole, 'csv');
                    const filename = `audit-report-${new Date().toISOString().split('T')[0]}.csv`;
                    res.setHeader('Content-Type', 'text/csv');
                    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                    res.send(csvData);
                }
                else {
                    res.status(200).json({
                        success: true,
                        data: report
                    });
                }
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.AuditController = AuditController;
//# sourceMappingURL=audit.controller.js.map