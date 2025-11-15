"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/auditLog.routes.ts
const express_1 = require("express");
const auditLog_controller_1 = require("../controllers/auditLog.controller");
const auth_1 = require("../middlewares/auth");
const adminAuth_1 = require("../middlewares/adminAuth");
const router = (0, express_1.Router)();
// Toutes les routes d'audit logs nécessitent une authentification admin
router.use(auth_1.authenticate);
router.use(adminAuth_1.requireAdmin);
/**
 * @route   GET /api/audit-logs
 * @desc    Récupérer tous les logs d'audit avec filtres et pagination
 * @access  Admin
 * @query   page, limit, userId, action, entityType, level, startDate, endDate
 */
router.get('/', auditLog_controller_1.getAuditLogs);
/**
 * @route   GET /api/audit-logs/stats
 * @desc    Récupérer les statistiques des logs d'audit
 * @access  Admin
 * @query   userId, startDate, endDate
 */
router.get('/stats', auditLog_controller_1.getAuditLogStats);
/**
 * @route   GET /api/audit-logs/export
 * @desc    Exporter les logs d'audit au format CSV
 * @access  Admin
 * @query   userId, action, entityType, level, startDate, endDate
 */
router.get('/export', auditLog_controller_1.exportAuditLogs);
/**
 * @route   GET /api/audit-logs/entity/:entityType/:entityId
 * @desc    Récupérer l'historique d'une entité spécifique
 * @access  Admin
 * @params  entityType, entityId
 */
router.get('/entity/:entityType/:entityId', auditLog_controller_1.getEntityHistory);
/**
 * @route   GET /api/audit-logs/:id
 * @desc    Récupérer un log d'audit spécifique
 * @access  Admin
 * @params  id
 */
router.get('/:id', auditLog_controller_1.getAuditLogById);
/**
 * @route   POST /api/audit-logs/clean
 * @desc    Nettoyer les anciens logs (réservé aux super admins)
 * @access  Admin
 * @body    daysToKeep (nombre de jours à conserver)
 */
router.post('/clean', auditLog_controller_1.cleanOldLogs);
exports.default = router;
//# sourceMappingURL=auditLog.routes.js.map