"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanOldLogs = exports.exportAuditLogs = exports.getAuditLogById = exports.getEntityHistory = exports.getAuditLogStats = exports.getAuditLogs = void 0;
const tslib_1 = require("tslib");
const auditLog_service_1 = tslib_1.__importDefault(require("../services/auditLog.service"));
/**
 * Récupérer les logs d'audit avec filtres et pagination
 */
const getAuditLogs = async (req, res) => {
    try {
        const { page = '1', limit = '50', userId, action, entityType, level, startDate, endDate, } = req.query;
        const params = {
            page: parseInt(page),
            limit: parseInt(limit),
            userId: userId,
            action: action,
            entityType: entityType,
            level: level,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
        };
        const result = await auditLog_service_1.default.getLogs(params);
        res.json({
            success: true,
            data: result.logs,
            pagination: {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages,
            },
        });
    }
    catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des logs d\'audit',
            error: error.message,
        });
    }
};
exports.getAuditLogs = getAuditLogs;
/**
 * Récupérer les statistiques des logs d'audit
 */
const getAuditLogStats = async (req, res) => {
    try {
        const { userId, startDate, endDate } = req.query;
        const params = {
            userId: userId,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
        };
        const stats = await auditLog_service_1.default.getStats(params);
        res.json({
            success: true,
            data: stats,
        });
    }
    catch (error) {
        console.error('Error fetching audit log stats:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des statistiques',
            error: error.message,
        });
    }
};
exports.getAuditLogStats = getAuditLogStats;
/**
 * Récupérer l'historique d'une entité spécifique
 */
const getEntityHistory = async (req, res) => {
    try {
        const { entityType, entityId } = req.params;
        if (!entityType || !entityId) {
            return res.status(400).json({
                success: false,
                message: 'Le type d\'entité et l\'ID sont requis',
            });
        }
        const history = await auditLog_service_1.default.getEntityHistory(entityType, entityId);
        res.json({
            success: true,
            data: history,
        });
    }
    catch (error) {
        console.error('Error fetching entity history:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de l\'historique',
            error: error.message,
        });
    }
};
exports.getEntityHistory = getEntityHistory;
/**
 * Récupérer un log d'audit spécifique
 */
const getAuditLogById = async (req, res) => {
    try {
        const { id } = req.params;
        const log = await auditLog_service_1.default.getLogs({
            page: 1,
            limit: 1,
        });
        if (!log.logs || log.logs.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Log d\'audit non trouvé',
            });
        }
        res.json({
            success: true,
            data: log.logs[0],
        });
    }
    catch (error) {
        console.error('Error fetching audit log:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du log',
            error: error.message,
        });
    }
};
exports.getAuditLogById = getAuditLogById;
/**
 * Exporter les logs d'audit au format CSV
 */
const exportAuditLogs = async (req, res) => {
    try {
        const { userId, action, entityType, level, startDate, endDate, } = req.query;
        const params = {
            page: 1,
            limit: 10000, // Limite élevée pour l'export
            userId: userId,
            action: action,
            entityType: entityType,
            level: level,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
        };
        const result = await auditLog_service_1.default.getLogs(params);
        // Créer le contenu CSV
        const headers = [
            'ID',
            'Date',
            'Action',
            'Niveau',
            'Utilisateur',
            'Type d\'entité',
            'ID entité',
            'Détails',
            'IP',
        ];
        const rows = result.logs.map((log) => [
            log.id,
            new Date(log.createdAt).toISOString(),
            log.action,
            log.level,
            log.user ? `${log.user.firstName} ${log.user.lastName}` : 'Système',
            log.entityType || '',
            log.entityId || '',
            JSON.stringify(log.details),
            log.metadata?.ip || '',
        ]);
        const csv = [headers, ...rows]
            .map((row) => row.map((cell) => `"${cell}"`).join(','))
            .join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=audit-logs-${new Date().toISOString()}.csv`);
        res.send(csv);
    }
    catch (error) {
        console.error('Error exporting audit logs:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'export des logs',
            error: error.message,
        });
    }
};
exports.exportAuditLogs = exportAuditLogs;
/**
 * Nettoyer les anciens logs (réservé aux super admins)
 */
const cleanOldLogs = async (req, res) => {
    try {
        const { daysToKeep = '90' } = req.body;
        const result = await auditLog_service_1.default.cleanOldLogs(parseInt(daysToKeep));
        res.json({
            success: true,
            data: result,
            message: `${result.deletedCount} logs supprimés (plus anciens que ${daysToKeep} jours)`,
        });
    }
    catch (error) {
        console.error('Error cleaning old logs:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du nettoyage des logs',
            error: error.message,
        });
    }
};
exports.cleanOldLogs = cleanOldLogs;
//# sourceMappingURL=auditLog.controller.js.map