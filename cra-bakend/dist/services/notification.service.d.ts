import { NotificationListQuery, NotificationResponse } from '../types/notification.types';
export declare class NotificationService {
    listUserNotifications(userId: string, query: NotificationListQuery): Promise<{
        notifications: NotificationResponse[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
        unreadCount: number;
    }>;
    getNotificationById(notificationId: string, userId: string): Promise<NotificationResponse>;
    markAsRead(notificationId: string, userId: string): Promise<NotificationResponse>;
    markAllAsRead(userId: string): Promise<{
        message: string;
    }>;
    deleteNotification(notificationId: string, userId: string): Promise<void>;
    getUnreadCount(userId: string): Promise<number>;
    private formatResponse;
}
//# sourceMappingURL=notification.service.d.ts.map