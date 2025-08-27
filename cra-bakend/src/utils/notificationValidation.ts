// src/utils/notificationValidation.ts
import { z } from 'zod';

// Validation personnalisée pour les dates
const dateValidation = z.string().refine((val) => {
  const date = new Date(val);
  return !isNaN(date.getTime());
}, {
  message: "Date invalide"
});

const notificationTypeEnum = z.enum([
  'task_assigned', 'task_completed', 'task_overdue',
  'project_created', 'project_updated', 'project_participant_added',
  'activity_created', 'activity_updated',
  'seminar_created', 'seminar_reminder', 'seminar_registration',
  'comment_added', 'document_shared', 'form_response_submitted',
  'user_mentioned', 'system_maintenance', 'general'
]);

const entityTypeEnum = z.enum(['project', 'activity', 'task', 'seminar', 'document', 'form', 'user', 'comment']);

const priorityEnum = z.enum(['low', 'normal', 'high', 'urgent']);

export const createNotificationSchema = z.object({
  title: z.string().min(1, 'Le titre est requis').max(200),
  message: z.string().min(1, 'Le message est requis').max(1000),
  type: notificationTypeEnum,
  receiverId: z.cuid('ID de destinataire invalide'),
  senderId: z.cuid().optional(),
  entityType: entityTypeEnum.optional(),
  entityId: z.cuid().optional(),
  priority: priorityEnum.default('normal'),
  actionUrl: z.url().optional(),
});

export const notificationListQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
  isRead: z.string().transform(val => val === 'true').optional(),
  type: notificationTypeEnum.optional(),
  entityType: entityTypeEnum.optional(),
  priority: priorityEnum.optional(),
  senderId: z.cuid().optional(),
  startDate: dateValidation.optional(),
  endDate: dateValidation.optional(),
});

export const bulkNotificationSchema = z.object({
  notifications: z.array(z.object({
    receiverId: z.cuid(),
    title: z.string().min(1).max(200),
    message: z.string().min(1).max(1000),
    type: notificationTypeEnum,
    entityType: entityTypeEnum.optional(),
    entityId: z.cuid().optional(),
  })).min(1).max(100),
});