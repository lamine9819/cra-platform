"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationListQuerySchema = exports.createNotificationSchema = void 0;
const zod_1 = require("zod");
const notification_types_1 = require("../types/notification.types");
exports.createNotificationSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(200),
    message: zod_1.z.string().min(1).max(500),
    type: zod_1.z.nativeEnum(notification_types_1.NotificationType), // ⬅️ Modifier ici
    receiverId: zod_1.z.string().cuid(),
    senderId: zod_1.z.string().cuid().optional(),
    actionUrl: zod_1.z.string().max(500).optional(),
    entityType: zod_1.z.string().optional(),
    entityId: zod_1.z.string().cuid().optional(),
});
exports.notificationListQuerySchema = zod_1.z.object({
    page: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(1)).optional(),
    limit: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(1).max(100)).optional(),
    isRead: zod_1.z.string().transform(val => val === 'true').optional(),
    type: zod_1.z.nativeEnum(notification_types_1.NotificationType).optional(), // ⬅️ Modifier ici aussi
});
//# sourceMappingURL=notificationValidation.js.map