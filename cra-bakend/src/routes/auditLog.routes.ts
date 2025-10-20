// src/routes/auditLog.routes.ts
import { Router } from 'express';
import {
  getAuditLogs,
  getAuditLogStats,
  getEntityHistory,
  getAuditLogById,
  exportAuditLogs,
  cleanOldLogs,
} from '../controllers/auditLog.controller';
import { authenticate } from '../middlewares/auth';
import { requireAdmin } from '../middlewares/adminAuth';

const router = Router();

// Toutes les routes d'audit logs nécessitent une authentification admin
router.use(authenticate);
router.use(requireAdmin);

/**
 * @route   GET /api/audit-logs
 * @desc    Récupérer tous les logs d'audit avec filtres et pagination
 * @access  Admin
 * @query   page, limit, userId, action, entityType, level, startDate, endDate
 */
router.get('/', getAuditLogs);

/**
 * @route   GET /api/audit-logs/stats
 * @desc    Récupérer les statistiques des logs d'audit
 * @access  Admin
 * @query   userId, startDate, endDate
 */
router.get('/stats', getAuditLogStats);

/**
 * @route   GET /api/audit-logs/export
 * @desc    Exporter les logs d'audit au format CSV
 * @access  Admin
 * @query   userId, action, entityType, level, startDate, endDate
 */
router.get('/export', exportAuditLogs);

/**
 * @route   GET /api/audit-logs/entity/:entityType/:entityId
 * @desc    Récupérer l'historique d'une entité spécifique
 * @access  Admin
 * @params  entityType, entityId
 */
router.get('/entity/:entityType/:entityId', getEntityHistory);

/**
 * @route   GET /api/audit-logs/:id
 * @desc    Récupérer un log d'audit spécifique
 * @access  Admin
 * @params  id
 */
router.get('/:id', getAuditLogById);

/**
 * @route   POST /api/audit-logs/clean
 * @desc    Nettoyer les anciens logs (réservé aux super admins)
 * @access  Admin
 * @body    daysToKeep (nombre de jours à conserver)
 */
router.post('/clean', cleanOldLogs);

export default router;
