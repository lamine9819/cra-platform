import { Request, Response, NextFunction } from 'express';
export declare class NotificationController {
    listNotifications: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getNotificationById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    markAsRead: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    markAllAsRead: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteNotification: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getUnreadCount: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=notification.controller.d.ts.map