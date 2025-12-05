"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seminarIdParamSchema = exports.eventIdParamSchema = exports.eventReportSchema = exports.seminarFilterSchema = exports.eventFilterSchema = exports.updateSeminarSchema = exports.createSeminarSchema = exports.updateEventSchema = exports.createEventSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createEventSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
        description: zod_1.z.string().optional(),
        type: zod_1.z.nativeEnum(client_1.EventType, {
            message: 'Type d\'événement invalide'
        }),
        startDate: zod_1.z.string().datetime('Date de début invalide').transform(val => new Date(val)),
        endDate: zod_1.z.string().datetime('Date de fin invalide').transform(val => new Date(val)).optional(),
        location: zod_1.z.string().optional(),
        isAllDay: zod_1.z.boolean().optional().default(false),
        isRecurring: zod_1.z.boolean().optional().default(false),
        recurrenceRule: zod_1.z.string().optional(),
        color: zod_1.z.string().optional().transform(val => val === '' ? undefined : val).refine(val => !val || /^#[0-9A-Fa-f]{6}$/.test(val), {
            message: 'Couleur invalide (format: #RRGGBB)'
        }),
        stationId: zod_1.z.string().cuid().optional(),
        projectId: zod_1.z.string().cuid().optional(),
        activityId: zod_1.z.string().cuid().optional(),
    }).refine(data => {
        if (data.endDate && data.startDate) {
            return data.endDate >= data.startDate;
        }
        return true;
    }, {
        message: 'La date de fin doit être postérieure ou égale à la date de début',
        path: ['endDate']
    })
});
exports.updateEventSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(3).optional(),
        description: zod_1.z.string().optional(),
        type: zod_1.z.nativeEnum(client_1.EventType).optional(),
        status: zod_1.z.nativeEnum(client_1.EventStatus).optional(),
        startDate: zod_1.z.string().datetime().transform(val => new Date(val)).optional(),
        endDate: zod_1.z.string().datetime().transform(val => new Date(val)).optional(),
        location: zod_1.z.string().optional(),
        isAllDay: zod_1.z.boolean().optional(),
        isRecurring: zod_1.z.boolean().optional(),
        recurrenceRule: zod_1.z.string().optional(),
        color: zod_1.z.string().optional().transform(val => val === '' ? undefined : val).refine(val => !val || /^#[0-9A-Fa-f]{6}$/.test(val), {
            message: 'Couleur invalide (format: #RRGGBB)'
        }),
        stationId: zod_1.z.string().cuid().optional(),
        projectId: zod_1.z.string().cuid().optional(),
        activityId: zod_1.z.string().cuid().optional(),
    }).refine(data => {
        if (data.endDate && data.startDate) {
            return data.endDate >= data.startDate;
        }
        return true;
    }, {
        message: 'La date de fin doit être postérieure ou égale à la date de début',
        path: ['endDate']
    })
});
exports.createSeminarSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
        description: zod_1.z.string().optional(),
        location: zod_1.z.string().optional(),
        startDate: zod_1.z.string().datetime('Date de début invalide').transform(val => new Date(val)),
        endDate: zod_1.z.string().datetime('Date de fin invalide').transform(val => new Date(val)).optional(),
        agenda: zod_1.z.string().optional(),
        maxParticipants: zod_1.z.number().int().positive().optional(),
        calendarEventId: zod_1.z.string().cuid().optional(),
    }).refine(data => {
        if (data.endDate && data.startDate) {
            return data.endDate >= data.startDate;
        }
        return true;
    }, {
        message: 'La date de fin doit être postérieure ou égale à la date de début',
        path: ['endDate']
    })
});
exports.updateSeminarSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(3).optional(),
        description: zod_1.z.string().optional(),
        location: zod_1.z.string().optional(),
        startDate: zod_1.z.string().datetime().transform(val => new Date(val)).optional(),
        endDate: zod_1.z.string().datetime().transform(val => new Date(val)).optional(),
        status: zod_1.z.nativeEnum(client_1.SeminarStatus).optional(),
        agenda: zod_1.z.string().optional(),
        maxParticipants: zod_1.z.number().int().positive().optional(),
    }).refine(data => {
        if (data.endDate && data.startDate) {
            return data.endDate >= data.startDate;
        }
        return true;
    }, {
        message: 'La date de fin doit être postérieure ou égale à la date de début',
        path: ['endDate']
    })
});
exports.eventFilterSchema = zod_1.z.object({
    query: zod_1.z.object({
        startDate: zod_1.z.string().optional().transform(val => val ? new Date(val) : undefined).catch(undefined),
        endDate: zod_1.z.string().optional().transform(val => val ? new Date(val) : undefined).catch(undefined),
        type: zod_1.z.nativeEnum(client_1.EventType).optional().catch(undefined),
        status: zod_1.z.nativeEnum(client_1.EventStatus).optional().catch(undefined),
        creatorId: zod_1.z.string().optional().catch(undefined),
        stationId: zod_1.z.string().optional().catch(undefined),
        projectId: zod_1.z.string().optional().catch(undefined),
        activityId: zod_1.z.string().optional().catch(undefined),
    }).passthrough(),
    params: zod_1.z.object({}).optional(),
    body: zod_1.z.object({}).optional()
}).passthrough();
exports.seminarFilterSchema = zod_1.z.object({
    query: zod_1.z.object({
        status: zod_1.z.string().optional().catch(undefined),
        organizerId: zod_1.z.string().optional().catch(undefined),
        startDate: zod_1.z.string().optional().catch(undefined),
        endDate: zod_1.z.string().optional().catch(undefined),
    }).passthrough(),
    params: zod_1.z.object({}).optional(),
    body: zod_1.z.object({}).optional()
}).passthrough();
exports.eventReportSchema = zod_1.z.object({
    query: zod_1.z.object({
        format: zod_1.z.enum(['pdf', 'docx'], {
            message: 'Format invalide. Utilisez "pdf" ou "docx"'
        }),
        startDate: zod_1.z.string().optional().transform(val => val ? new Date(val) : undefined),
        endDate: zod_1.z.string().optional().transform(val => val ? new Date(val) : undefined),
        type: zod_1.z.nativeEnum(client_1.EventType).optional(),
        creatorId: zod_1.z.string().optional(),
    }).passthrough(),
    params: zod_1.z.object({}).optional(),
    body: zod_1.z.object({}).optional()
}).passthrough();
exports.eventIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().cuid('ID d\'événement invalide')
    }),
    query: zod_1.z.object({}).optional(),
    body: zod_1.z.object({}).optional()
}).passthrough();
exports.seminarIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().cuid('ID de séminaire invalide')
    }),
    query: zod_1.z.object({}).optional(),
    body: zod_1.z.object({}).optional()
}).passthrough();
//# sourceMappingURL=event.validation.js.map