import { Request, Response, NextFunction } from 'express';
import { AuditAction, AuditLevel, EntityType } from '../types/audit.types';
export declare const auditAction: (action: AuditAction, options?: {
    level?: AuditLevel;
    entityType?: EntityType;
    extractEntityId?: (req: Request, res: Response) => string | undefined;
    extractDetails?: (req: Request, res: Response) => Record<string, any>;
    trackChanges?: boolean;
}) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const auditAuthAttempt: (_action: "AUTH_LOGIN" | "AUTH_LOGIN_FAILED") => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const auditAdminAction: (action: AuditAction, entityType?: EntityType) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const auditDocumentAccess: (action: AuditAction) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const auditCriticalDataChange: (entityType: EntityType) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const auditSystemError: (error: Error, req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const auditMiddlewares: {
    login: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    logout: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    userCreated: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    userUpdated: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    userDeleted: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    projectCreated: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    projectUpdated: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    projectDeleted: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    documentUploaded: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    documentDownloaded: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    documentShared: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    documentDeleted: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    taskCreated: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    taskAssigned: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    taskCompleted: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    seminarCreated: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    seminarRegistered: (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
//# sourceMappingURL=auditMiddleware.d.ts.map