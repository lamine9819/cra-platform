import { Request, Response } from 'express';
/**
 * Récupérer les logs d'audit avec filtres et pagination
 */
export declare const getAuditLogs: (req: Request, res: Response) => Promise<void>;
/**
 * Récupérer les statistiques des logs d'audit
 */
export declare const getAuditLogStats: (req: Request, res: Response) => Promise<void>;
/**
 * Récupérer l'historique d'une entité spécifique
 */
export declare const getEntityHistory: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Récupérer un log d'audit spécifique
 */
export declare const getAuditLogById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Exporter les logs d'audit au format CSV
 */
export declare const exportAuditLogs: (req: Request, res: Response) => Promise<void>;
/**
 * Nettoyer les anciens logs (réservé aux super admins)
 */
export declare const cleanOldLogs: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=auditLog.controller.d.ts.map