"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentListQuerySchema = exports.updateCommentSchema = exports.createCommentSchema = void 0;
// src/utils/commentValidation.ts
const zod_1 = require("zod");
// Validation personnalisée pour les dates
const dateValidation = zod_1.z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
}, {
    message: "Date invalide"
});
exports.createCommentSchema = zod_1.z.object({
    content: zod_1.z.string()
        .min(1, 'Le contenu du commentaire ne peut pas être vide')
        .max(2000, 'Le commentaire ne peut pas dépasser 2000 caractères')
        .refine(content => content.trim().length > 0, {
        message: 'Le commentaire ne peut pas être composé uniquement d\'espaces'
    }),
    targetType: zod_1.z.enum(['project', 'activity', 'task'], {
        message: 'Le type de cible doit être project, activity ou task'
    }),
    targetId: zod_1.z.cuid('ID de cible invalide'),
});
exports.updateCommentSchema = zod_1.z.object({
    content: zod_1.z.string()
        .min(1, 'Le contenu du commentaire ne peut pas être vide')
        .max(2000, 'Le commentaire ne peut pas dépasser 2000 caractères')
        .refine(content => content.trim().length > 0, {
        message: 'Le commentaire ne peut pas être composé uniquement d\'espaces'
    }),
});
exports.commentListQuerySchema = zod_1.z.object({
    page: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(1)).optional(),
    limit: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(1).max(100)).optional(),
    targetType: zod_1.z.enum(['project', 'activity', 'task']).optional(),
    targetId: zod_1.z.cuid().optional(),
    authorId: zod_1.z.cuid().optional(),
    search: zod_1.z.string().optional(),
    startDate: dateValidation.optional(),
    endDate: dateValidation.optional(),
});
//# sourceMappingURL=commentValidation.js.map