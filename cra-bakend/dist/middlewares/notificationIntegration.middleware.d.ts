import { Request, Response, NextFunction } from 'express';
export declare const triggerNotifications: (actionType: string) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const notifyTaskAssigned: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const notifyTaskCompleted: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const notifyProjectCreated: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const notifyParticipantAdded: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const notifyEventCreated: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const notifySeminarCreated: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const notifySeminarRegistration: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const notifyCommentAdded: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const notifyDocumentShared: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const notifyFormResponseSubmitted: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=notificationIntegration.middleware.d.ts.map