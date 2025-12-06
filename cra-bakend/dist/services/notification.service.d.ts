import { NotificationListQuery, NotificationResponse } from '../types/notification.types';
export declare enum NotificationType {
    PROJECT_ADDED = "PROJECT_ADDED",
    ACTIVITY_ADDED = "ACTIVITY_ADDED",
    CHAT_MESSAGE = "CHAT_MESSAGE",
    CHAT_MENTION = "CHAT_MENTION",
    DOCUMENT_SHARED = "DOCUMENT_SHARED",
    TASK_ASSIGNED = "TASK_ASSIGNED",
    ACTIVITY_UPDATED = "ACTIVITY_UPDATED",
    SYSTEM = "SYSTEM"
}
interface CreateNotificationParams {
    receiverId: string;
    senderId?: string;
    title: string;
    message: string;
    type: string;
    actionUrl?: string;
    entityType?: string;
    entityId?: string;
}
export declare class NotificationService {
    /**
     * Créer une notification et l'envoyer via WebSocket
     */
    createNotification(params: CreateNotificationParams): Promise<{
        sender: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
            profileImage: string;
        };
    } & {
        id: string;
        type: string;
        createdAt: Date;
        updatedAt: Date;
        message: string;
        title: string;
        isRead: boolean;
        readAt: Date | null;
        actionUrl: string | null;
        senderId: string | null;
        receiverId: string;
        entityType: string | null;
        entityId: string | null;
    }>;
    /**
     * Notification quand un chercheur est ajouté à un projet
     */
    notifyProjectAddition(projectId: string, projectTitle: string, addedUserId: string, addedByUserId: string): Promise<void>;
    /**
     * Notification pour un nouveau message dans un canal
     */
    notifyNewChatMessage(channelId: string, channelName: string, messageId: string, authorId: string, mentionedUserIds?: string[]): Promise<void>;
    /**
     * Notification pour un document partagé
     */
    notifyDocumentShare(documentId: string, documentTitle: string, sharedWithUserId: string, sharedByUserId: string, canEdit: boolean): Promise<void>;
    /**
     * Notification quand un chercheur est ajouté à une activité
     */
    notifyActivityAddition(activityId: string, activityTitle: string, addedUserId: string, addedByUserId: string): Promise<void>;
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
export declare const getNotificationService: () => NotificationService;
export {};
//# sourceMappingURL=notification.service.d.ts.map