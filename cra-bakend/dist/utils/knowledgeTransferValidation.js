"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.knowledgeTransferListQuerySchema = exports.updateKnowledgeTransferSchema = exports.createKnowledgeTransferSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const dateValidation = zod_1.z.union([
    zod_1.z.string().refine((val) => {
        if (val === '')
            return true;
        const date = new Date(val);
        return !isNaN(date.getTime());
    }),
    zod_1.z.literal('')
]);
exports.createKnowledgeTransferSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(200),
    description: zod_1.z.string().max(2000).optional(),
    type: zod_1.z.nativeEnum(client_1.TransferType, { message: "Type de transfert requis" }),
    targetAudience: zod_1.z.array(zod_1.z.string().min(1)).default([]),
    location: zod_1.z.string().max(200).optional(),
    date: zod_1.z.string().refine((val) => {
        const date = new Date(val);
        return !isNaN(date.getTime());
    }, { message: "Date valide requise" }),
    participants: zod_1.z.number().int().positive().optional(),
    impact: zod_1.z.string().max(2000).optional(),
    feedback: zod_1.z.string().max(2000).optional(),
    activityId: zod_1.z.string().cuid().optional(),
});
exports.updateKnowledgeTransferSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).max(200).optional(),
    description: zod_1.z.string().max(2000).optional(),
    type: zod_1.z.nativeEnum(client_1.TransferType).optional(),
    targetAudience: zod_1.z.array(zod_1.z.string().min(1)).optional(),
    location: zod_1.z.string().max(200).optional(),
    date: dateValidation.optional(),
    participants: zod_1.z.number().int().positive().optional(),
    impact: zod_1.z.string().max(2000).optional(),
    feedback: zod_1.z.string().max(2000).optional(),
    activityId: zod_1.z.string().cuid().optional(),
});
exports.knowledgeTransferListQuerySchema = zod_1.z.object({
    page: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(1)).optional(),
    limit: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(1).max(100)).optional(),
    search: zod_1.z.string().optional(),
    type: zod_1.z.nativeEnum(client_1.TransferType).optional(),
    organizerId: zod_1.z.string().cuid().optional(),
    activityId: zod_1.z.string().cuid().optional(),
    startDate: dateValidation.optional(),
    endDate: dateValidation.optional(),
});
//# sourceMappingURL=knowledgeTransferValidation.js.map