import { Request, Response, NextFunction } from 'express';
/**
 * Middleware pour capturer automatiquement les actions HTTP
 */
export declare const auditLogMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware pour logger les erreurs
 */
export declare const auditErrorMiddleware: (err: Error, req: Request, res: Response, next: NextFunction) => void;
export default auditLogMiddleware;
//# sourceMappingURL=auditLog.middleware.d.ts.map