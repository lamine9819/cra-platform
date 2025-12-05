export { EntityType } from './audit.types';

export interface CreateNotificationRequest {
  title: string;
  message: string;
  type: NotificationType;
  receiverId: string;
  senderId?: string;
  actionUrl?: string;
  entityType?: string;
  entityId?: string;
}

export interface NotificationListQuery {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: NotificationType;
}

export interface NotificationResponse {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  readAt?: Date;
  actionUrl?: string;
  entityType?: string;
  entityId?: string;
  createdAt: Date;
  updatedAt: Date;
  
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  
  receiver: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export enum NotificationType {
  TASK_ASSIGNED = 'task_assigned',
  TASK_COMPLETED = 'task_completed',
  ACTIVITY_CREATED = 'activity_created',
  ACTIVITY_UPDATED = 'activity_updated',
  PARTICIPANT_ADDED = 'participant_added',
  COMMENT_ADDED = 'comment_added',
  DOCUMENT_SHARED = 'document_shared',
  FORM_SUBMITTED = 'form_submitted',
  FUNDING_APPROVED = 'funding_approved',
  DEADLINE_APPROACHING = 'deadline_approaching',
  PROJECT_UPDATE = 'project_update',
  SYSTEM_ALERT = 'system_alert',
  EVENT_CREATED = 'event_created',
  SEMINAR_CREATED = 'seminar_created'
}