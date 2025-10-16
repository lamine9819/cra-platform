import { z } from 'zod';
import { NotificationType } from '../types/notification.types';

export const createNotificationSchema = z.object({
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(500),
  type: z.nativeEnum(NotificationType),  // ⬅️ Modifier ici
  receiverId: z.string().cuid(),
  senderId: z.string().cuid().optional(),
  actionUrl: z.string().max(500).optional(),
  entityType: z.string().optional(),
  entityId: z.string().cuid().optional(),
});

export const notificationListQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
  isRead: z.string().transform(val => val === 'true').optional(),
  type: z.nativeEnum(NotificationType).optional(),  // ⬅️ Modifier ici aussi
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type NotificationListQuery = z.infer<typeof notificationListQuerySchema>;