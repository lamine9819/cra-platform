// src/utils/taskValidation.ts
import { z } from 'zod';

// Validation personnalisée pour les dates
const dateValidation = z.string().refine((val) => {
  const date = new Date(val);
  return !isNaN(date.getTime());
}, {
  message: "Date invalide"
});

export const createTaskSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(200),
  description: z.string().max(2000).optional(),
  priority: z.enum(['BASSE', 'NORMALE', 'HAUTE', 'URGENTE']).default('NORMALE'),
  dueDate: dateValidation.optional(),
  assigneeId: z.cuid().optional(),
  projectId: z.cuid().optional(),
  activityId: z.cuid().optional(),
}).refine(data => {
  // Au moins un des deux (projet ou activité) doit être fourni
  return data.projectId || data.activityId;
}, {
  message: "La tâche doit être liée à un projet ou une activité",
  path: ["projectId"]
}).refine(data => {
  if (data.dueDate) {
    return new Date(data.dueDate) > new Date();
  }
  return true;
}, {
  message: "La date d'échéance doit être dans le futur",
  path: ["dueDate"]
});

export const updateTaskSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(2000).optional(),
  status: z.enum(['A_FAIRE', 'EN_COURS', 'EN_REVISION', 'TERMINEE', 'ANNULEE']).optional(),
  priority: z.enum(['BASSE', 'NORMALE', 'HAUTE', 'URGENTE']).optional(),
  dueDate: dateValidation.optional(),
  assigneeId: z.cuid().optional(),
  progress: z.number().min(0).max(100).optional(),
}).refine(data => {
  if (data.status === 'TERMINEE' && data.progress !== undefined) {
    return data.progress === 100;
  }
  return true;
}, {
  message: "Le progrès doit être à 100% pour une tâche terminée",
  path: ["progress"]
});

export const taskListQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
  status: z.enum(['A_FAIRE', 'EN_COURS', 'EN_REVISION', 'TERMINEE', 'ANNULEE']).optional(),
  priority: z.enum(['BASSE', 'NORMALE', 'HAUTE', 'URGENTE']).optional(),
  assigneeId: z.cuid().optional(),
  creatorId: z.cuid().optional(),
  projectId: z.cuid().optional(),
  activityId: z.cuid().optional(),
  search: z.string().optional(),
  dueDate: dateValidation.optional(),
  overdue: z.string().transform(val => val === 'true').optional(),
});