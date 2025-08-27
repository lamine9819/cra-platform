// src/utils/projectValidation.ts
import { z } from 'zod';

// Validation personnalisée pour les dates
const dateValidation = z.string().refine((val) => {
  const date = new Date(val);
  return !isNaN(date.getTime());
}, {
  message: "Date invalide"
});

export const createProjectSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(200),
  description: z.string().max(2000).optional(),
  objectives: z.array(z.string().min(1)).min(1, 'Au moins un objectif est requis'),
  startDate: dateValidation.optional(),
  endDate: dateValidation.optional(),
  budget: z.number().positive().optional(),
  keywords: z.array(z.string().min(1)).default([]),
}).refine(data => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) < new Date(data.endDate);
  }
  return true;
}, {
  message: "La date de fin doit être postérieure à la date de début",
  path: ["endDate"]
});

export const updateProjectSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(2000).optional(),
  objectives: z.array(z.string().min(1)).optional(),
  status: z.enum(['PLANIFIE', 'EN_COURS', 'SUSPENDU', 'TERMINE', 'ARCHIVE']).optional(),
  startDate: dateValidation.optional(),
  endDate: dateValidation.optional(),
  budget: z.number().positive().optional(),
  keywords: z.array(z.string().min(1)).optional(),
}).refine(data => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) < new Date(data.endDate);
  }
  return true;
}, {
  message: "La date de fin doit être postérieure à la date de début",
  path: ["endDate"]
});

export const projectListQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
  status: z.enum(['PLANIFIE', 'EN_COURS', 'SUSPENDU', 'TERMINE', 'ARCHIVE']).optional(),
  creatorId: z.cuid().optional(),
  search: z.string().optional(),
  startDate: dateValidation.optional(),
  endDate: dateValidation.optional(),
});

// PAR ÇA :
export const addParticipantSchema = z.object({
  userId: z.cuid('ID utilisateur invalide'),
  role: z.string().min(1, 'Le rôle dans le projet est requis'),
  // ✅ projectId enlevé car il vient de req.params.id
}).refine(data => data.role.length > 0, {
  message: "Le rôle est requis",
  path: ["role"]
});

export const removeParticipantSchema = z.object({
  userId: z.cuid('ID utilisateur invalide'),
  projectId: z.cuid('ID projet invalide'),
  isActive: z.boolean().optional(),
}).refine(data => data.isActive === false, {
  message: "le participant n'est pas actif",
  path: ["isActive"]
});

export const updateParticipantRoleSchema = z.object({
  userId: z.cuid('ID utilisateur invalide'),
  role: z.string().min(1, 'Le rôle dans le projet est requis'),
  projectId: z.cuid('ID projet invalide'),
}).refine(data => data.role.length > 0, {
  message: "Le rôle est requis",
  path: ["role"]
});