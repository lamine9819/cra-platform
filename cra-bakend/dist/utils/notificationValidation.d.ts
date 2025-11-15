import { z } from 'zod';
import { NotificationType } from '../types/notification.types';
export declare const createNotificationSchema: z.ZodObject<{
    title: z.ZodString;
    message: z.ZodString;
    type: z.ZodEnum<typeof NotificationType>;
    receiverId: z.ZodString;
    senderId: z.ZodOptional<z.ZodString>;
    actionUrl: z.ZodOptional<z.ZodString>;
    entityType: z.ZodOptional<z.ZodString>;
    entityId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const notificationListQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    limit: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    isRead: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<boolean, string>>>;
    type: z.ZodOptional<z.ZodEnum<typeof NotificationType>>;
}, z.core.$strip>;
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type NotificationListQuery = z.infer<typeof notificationListQuerySchema>;
//# sourceMappingURL=notificationValidation.d.ts.map