import { Request, Response, NextFunction } from 'express';
export declare class AuditController {
    getAuditLogs: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAuditLogById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAuditStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    exportAuditLogs: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    cleanupOldLogs: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    getUserAuditLogs: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getEntityAuditLogs: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getSecurityEvents: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    getFailedLoginAttempts: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    getUserActivity: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    getRecentChanges: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    searchAuditLogs: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    generateAuditReport: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=audit.controller.d.ts.map