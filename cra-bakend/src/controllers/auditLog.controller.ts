// src/controllers/auditLog.controller.ts
import { Request, Response } from 'express';
import AuditLogService from '../services/auditLog.service';
import { AuditLevel } from '@prisma/client';

/**
 * Récupérer les logs d'audit avec filtres et pagination
 */
export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '50',
      userId,
      action,
      entityType,
      level,
      startDate,
      endDate,
    } = req.query;

    const params = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      userId: userId as string | undefined,
      action: action as string | undefined,
      entityType: entityType as string | undefined,
      level: level as AuditLevel | undefined,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    };

    const result = await AuditLogService.getLogs(params);

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
  } catch (error: any) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des logs d\'audit',
      error: error.message,
    });
  }
};

/**
 * Récupérer les statistiques des logs d'audit
 */
export const getAuditLogStats = async (req: Request, res: Response) => {
  try {
    const { userId, startDate, endDate } = req.query;

    const params = {
      userId: userId as string | undefined,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    };

    const stats = await AuditLogService.getStats(params);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('Error fetching audit log stats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message,
    });
  }
};

/**
 * Récupérer l'historique d'une entité spécifique
 */
export const getEntityHistory = async (req: Request, res: Response) => {
  try {
    const { entityType, entityId } = req.params;

    if (!entityType || !entityId) {
      return res.status(400).json({
        success: false,
        message: 'Le type d\'entité et l\'ID sont requis',
      });
    }

    const history = await AuditLogService.getEntityHistory(entityType, entityId);

    res.json({
      success: true,
      data: history,
    });
  } catch (error: any) {
    console.error('Error fetching entity history:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'historique',
      error: error.message,
    });
  }
};

/**
 * Récupérer un log d'audit spécifique
 */
export const getAuditLogById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const log = await AuditLogService.getLogs({
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
  } catch (error: any) {
    console.error('Error fetching audit log:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du log',
      error: error.message,
    });
  }
};

/**
 * Exporter les logs d'audit au format CSV
 */
export const exportAuditLogs = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      action,
      entityType,
      level,
      startDate,
      endDate,
    } = req.query;

    const params = {
      page: 1,
      limit: 10000, // Limite élevée pour l'export
      userId: userId as string | undefined,
      action: action as string | undefined,
      entityType: entityType as string | undefined,
      level: level as AuditLevel | undefined,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    };

    const result = await AuditLogService.getLogs(params);

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
      (log.metadata as any)?.ip || '',
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=audit-logs-${new Date().toISOString()}.csv`
    );
    res.send(csv);
  } catch (error: any) {
    console.error('Error exporting audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'export des logs',
      error: error.message,
    });
  }
};

/**
 * Nettoyer les anciens logs (réservé aux super admins)
 */
export const cleanOldLogs = async (req: Request, res: Response) => {
  try {
    const { daysToKeep = '90' } = req.body;

    const result = await AuditLogService.cleanOldLogs(parseInt(daysToKeep));

    res.json({
      success: true,
      data: result,
      message: `${result.deletedCount} logs supprimés (plus anciens que ${daysToKeep} jours)`,
    });
  } catch (error: any) {
    console.error('Error cleaning old logs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du nettoyage des logs',
      error: error.message,
    });
  }
};
