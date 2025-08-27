// src/types/notification.types.ts
export interface CreateNotificationRequest {
  title: string;
  message: string;
  type: NotificationType;
  receiverId: string;
  senderId?: string;
  entityType?: EntityType;
  entityId?: string;
  priority?: NotificationPriority;
  actionUrl?: string;
}

export type NotificationType = 
  | 'task_assigned' 
  | 'task_completed' 
  | 'task_overdue'
  | 'project_created' 
  | 'project_updated' 
  | 'project_participant_added'
  | 'activity_created' 
  | 'activity_updated'
  | 'seminar_created' 
  | 'seminar_reminder' 
  | 'seminar_registration'
  | 'comment_added'
  | 'document_shared'
  | 'form_response_submitted'
  | 'user_mentioned'
  | 'system_maintenance'
  | 'general';

export type EntityType = 'project' | 'activity' | 'task' | 'seminar' | 'document' | 'form' | 'user' | 'comment';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface NotificationListQuery {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: NotificationType;
  entityType?: EntityType;
  priority?: NotificationPriority;
  senderId?: string;
  startDate?: string; // Changé de Date à string pour correspondre à la validation Zod
  endDate?: string;   // Changé de Date à string pour correspondre à la validation Zod
}

export interface NotificationResponse {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  actionUrl?: string | null; // Accepte null de Prisma
  createdAt: Date;
  readAt?: Date | null;      // Accepte null de Prisma
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    profileImage?: string | null; // Accepte null de Prisma
  } | null; // Accepte null de Prisma
  entity?: {
    type: EntityType;
    id: string;
    title?: string;
    url?: string;
  } | null; // Accepte null
}

export interface NotificationStatsResponse {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
  byPriority: Record<NotificationPriority, number>;
  recentCount: number; // Dernières 24h
}

export interface BulkNotificationRequest {
  notifications: Array<{
    receiverId: string;
    title: string;
    message: string;
    type: NotificationType;
    entityType?: EntityType;
    entityId?: string;
  }>;
}