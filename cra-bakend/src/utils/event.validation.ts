import { z } from 'zod';
import { EventType, EventStatus, SeminarStatus } from '@prisma/client';

export const createEventSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
    description: z.string().optional(),
    type: z.nativeEnum(EventType, {
      message: 'Type d\'événement invalide'
    }),
    startDate: z.string().datetime('Date de début invalide').transform(val => new Date(val)),
    endDate: z.string().datetime('Date de fin invalide').transform(val => new Date(val)).optional(),
    location: z.string().optional(),
    isAllDay: z.boolean().optional().default(false),
    isRecurring: z.boolean().optional().default(false),
    recurrenceRule: z.string().optional(),
    color: z.string().optional().transform(val => val === '' ? undefined : val).refine(val => !val || /^#[0-9A-Fa-f]{6}$/.test(val), {
      message: 'Couleur invalide (format: #RRGGBB)'
    }),
    stationId: z.string().cuid().optional(),
    projectId: z.string().cuid().optional(),
    activityId: z.string().cuid().optional(),
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

export const updateEventSchema = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().optional(),
    type: z.nativeEnum(EventType).optional(),
    status: z.nativeEnum(EventStatus).optional(),
    startDate: z.string().datetime().transform(val => new Date(val)).optional(),
    endDate: z.string().datetime().transform(val => new Date(val)).optional(),
    location: z.string().optional(),
    isAllDay: z.boolean().optional(),
    isRecurring: z.boolean().optional(),
    recurrenceRule: z.string().optional(),
    color: z.string().optional().transform(val => val === '' ? undefined : val).refine(val => !val || /^#[0-9A-Fa-f]{6}$/.test(val), {
      message: 'Couleur invalide (format: #RRGGBB)'
    }),
    stationId: z.string().cuid().optional(),
    projectId: z.string().cuid().optional(),
    activityId: z.string().cuid().optional(),
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

export const createSeminarSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
    description: z.string().optional(),
    location: z.string().optional(),
    startDate: z.string().datetime('Date de début invalide').transform(val => new Date(val)),
    endDate: z.string().datetime('Date de fin invalide').transform(val => new Date(val)).optional(),
    agenda: z.string().optional(),
    maxParticipants: z.number().int().positive().optional(),
    calendarEventId: z.string().cuid().optional(),
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

export const updateSeminarSchema = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().optional(),
    location: z.string().optional(),
    startDate: z.string().datetime().transform(val => new Date(val)).optional(),
    endDate: z.string().datetime().transform(val => new Date(val)).optional(),
    status: z.nativeEnum(SeminarStatus).optional(),
    agenda: z.string().optional(),
    maxParticipants: z.number().int().positive().optional(),
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

export const eventFilterSchema = z.object({
  query: z.object({
    startDate: z.string().optional().transform(val => val ? new Date(val) : undefined).catch(undefined),
    endDate: z.string().optional().transform(val => val ? new Date(val) : undefined).catch(undefined),
    type: z.nativeEnum(EventType).optional().catch(undefined),
    status: z.nativeEnum(EventStatus).optional().catch(undefined),
    creatorId: z.string().optional().catch(undefined),
    stationId: z.string().optional().catch(undefined),
    projectId: z.string().optional().catch(undefined),
    activityId: z.string().optional().catch(undefined),
  }).passthrough(),
  params: z.object({}).optional(),
  body: z.object({}).optional()
}).passthrough();

export const seminarFilterSchema = z.object({
  query: z.object({
    status: z.string().optional().catch(undefined),
    organizerId: z.string().optional().catch(undefined),
    startDate: z.string().optional().catch(undefined),
    endDate: z.string().optional().catch(undefined),
  }).passthrough(),
  params: z.object({}).optional(),
  body: z.object({}).optional()
}).passthrough();

export const eventReportSchema = z.object({
  query: z.object({
    format: z.enum(['pdf', 'docx'], {
      message: 'Format invalide. Utilisez "pdf" ou "docx"'
    }),
    startDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
    endDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
    type: z.nativeEnum(EventType).optional(),
    creatorId: z.string().optional(),
  }).passthrough(),
  params: z.object({}).optional(),
  body: z.object({}).optional()
}).passthrough();

export const eventIdParamSchema = z.object({
  params: z.object({
    id: z.string().cuid('ID d\'événement invalide')
  }),
  query: z.object({}).optional(),
  body: z.object({}).optional()
}).passthrough();

export const seminarIdParamSchema = z.object({
  params: z.object({
    id: z.string().cuid('ID de séminaire invalide')
  }),
  query: z.object({}).optional(),
  body: z.object({}).optional()
}).passthrough();