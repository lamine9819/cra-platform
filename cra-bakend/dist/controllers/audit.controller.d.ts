import { Request, Response, NextFunction } from 'express';
export declare class AuditController {
    getAuditLogs: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAuditLogById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAuditStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    exportAuditLogs: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
    cleanupOldLogs: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
    getUserAuditLogs: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getEntityAuditLogs: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getSecurityEvents: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
    getFailedLoginAttempts: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
    getUserActivity: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
    getRecentChanges: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
    searchAuditLogs: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
    generateAuditReport: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=audit.controller.d.ts.map