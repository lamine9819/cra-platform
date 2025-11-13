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
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Couleur invalide (format: #RRGGBB)').optional(),
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
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
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
    startDate: z.string().datetime().transform(val => new Date(val)).optional(),
    endDate: z.string().datetime().transform(val => new Date(val)).optional(),
    type: z.nativeEnum(EventType).optional(),
    status: z.nativeEnum(EventStatus).optional(),
    creatorId: z.string().cuid().optional(),
    stationId: z.string().cuid().optional(),
    projectId: z.string().cuid().optional(),
    activityId: z.string().cuid().optional(),
  })
});

export const seminarFilterSchema = z.object({
  query: z.object({
    status: z.nativeEnum(SeminarStatus).optional(),
    organizerId: z.string().cuid().optional(),
    startDate: z.string().datetime().transform(val => new Date(val)).optional(),
    endDate: z.string().datetime().transform(val => new Date(val)).optional(),
  })
});

export const eventReportSchema = z.object({
  query: z.object({
    format: z.enum(['pdf', 'docx'], {
      message: 'Format invalide. Utilisez "pdf" ou "docx"'
    }),
    startDate: z.string().datetime().transform(val => new Date(val)).optional(),
    endDate: z.string().datetime().transform(val => new Date(val)).optional(),
    type: z.nativeEnum(EventType).optional(),
    creatorId: z.string().cuid().optional(),
  })
});

export const eventIdParamSchema = z.object({
  params: z.object({
    id: z.string().cuid('ID d\'événement invalide')
  })
});

export const seminarIdParamSchema = z.object({
  params: z.object({
    id: z.string().cuid('ID de séminaire invalide')
  })
});