import { NotificationType } from '../types/notification.types';
export declare class NotificationHelper {
    static createNotification(data: {
        title: string;
        message: string;
        type: NotificationType;
        receiverId: string;
        senderId?: string;
        actionUrl?: string;
        entityType?: string;
        entityId?: string;
    }): Promise<void>;
    static notifyActivityCreated(activityId: string, activityTitle: string, responsibleId: string, creatorId: string): Promise<void>;
    static notifyParticipantAdded(activityId: string, activityTitle: string, participantId: string, addedById: string): Promise<void>;
    static notifyTaskAssigned(taskId: string, taskTitle: string, assigneeId: string, assignedById: string, activityId?: string): Promise<void>;
    static notifyCommentAdded(entityId: string, entityType: 'activity' | 'task' | 'project', entityTitle: string, commentAuthorId: string, recipientIds: string[]): Promise<void>;
    static notifyFundingApproved(activityId: string, activityTitle: string, fundingSource: string, responsibleId: string): Promise<void>;
    static notifyDeadlineApproaching(activityId: string, activityTitle: string, daysRemaining: number, responsibleId: string): Promise<void>;
}
//# sourceMappingURL=notificationHelper.service.d.ts.map