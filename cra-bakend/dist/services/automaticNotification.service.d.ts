export declare class AutomaticNotificationService {
    private static notificationService;
    static notifyTaskAssigned(taskId: string, assigneeId: string, assignerId: string): Promise<void>;
    static notifyTaskCompleted(taskId: string, assigneeId: string): Promise<void>;
    static notifyOverdueTasks(): Promise<void>;
    static notifyProjectCreated(projectId: string, creatorId: string): Promise<void>;
    static notifyParticipantAdded(projectId: string, participantId: string, adderId: string): Promise<void>;
    static notifySeminarCreated(seminarId: string, organizerId: string): Promise<void>;
    static notifySeminarReminder(seminarId: string): Promise<void>;
    static notifySeminarRegistration(seminarId: string, participantId: string): Promise<void>;
    static notifyCommentAdded(commentId: string, authorId: string, targetType: string, targetId: string): Promise<void>;
    static notifyDocumentShared(documentId: string, sharedWithIds: string[], sharerId: string): Promise<void>;
    static notifyFormResponseSubmitted(formId: string, respondentId: string): Promise<void>;
    static scheduleRecurringNotifications(): void;
    static notifySystemMaintenance(message: string, scheduledTime: Date): Promise<void>;
}
//# sourceMappingURL=automaticNotification.service.d.ts.map