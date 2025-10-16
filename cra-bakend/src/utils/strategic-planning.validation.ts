// src/utils/validation/strategic-planning.validation.ts
import { z } from 'zod';

// Schémas pour les Plans Stratégiques
export const createStrategicPlanSchema = z.object({
  name: z.string()
    .min(3, 'Le nom doit contenir au moins 3 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  description: z.string()
    .max(500, 'La description ne peut pas dépasser 500 caractères')
    .optional(),
  startYear: z.number()
    .int('L\'année de début doit être un entier')
    .min(2020, 'L\'année de début doit être supérieure à 2020')
    .max(2050, 'L\'année de début doit être inférieure à 2050'),
  endYear: z.number()
    .int('L\'année de fin doit être un entier')
    .min(2020, 'L\'année de fin doit être supérieure à 2020')
    .max(2050, 'L\'année de fin doit être inférieure à 2050'),
  isActive: z.boolean().optional().default(true),
}).refine((data) => data.endYear > data.startYear, {
  message: 'L\'année de fin doit être postérieure à l\'année de début',
  path: ['endYear'],
});

export const updateStrategicPlanSchema = createStrategicPlanSchema.partial();

// Schémas pour les Axes Stratégiques
export const createStrategicAxisSchema = z.object({
  name: z.string()
    .min(3, 'Le nom doit contenir au moins 3 caractères')
    .max(150, 'Le nom ne peut pas dépasser 150 caractères'),
  description: z.string()
    .max(500, 'La description ne peut pas dépasser 500 caractères')
    .optional(),
  code: z.string()
    .max(20, 'Le code ne peut pas dépasser 20 caractères')
    .regex(/^[A-Z0-9_-]+$/, 'Le code ne peut contenir que des lettres majuscules, chiffres, tirets et underscores')
    .optional(),
  order: z.number()
    .int('L\'ordre doit être un entier')
    .min(1, 'L\'ordre doit être supérieur à 0')
    .max(100, 'L\'ordre doit être inférieur à 100')
    .optional(),
  strategicPlanId: z.string().cuid('ID du plan stratégique invalide'),
});

export const updateStrategicAxisSchema = createStrategicAxisSchema
  .omit({ strategicPlanId: true })
  .partial();

// Schémas pour les Sous-axes Stratégiques
export const createStrategicSubAxisSchema = z.object({
  name: z.string()
    .min(3, 'Le nom doit contenir au moins 3 caractères')
    .max(150, 'Le nom ne peut pas dépasser 150 caractères'),
  description: z.string()
    .max(500, 'La description ne peut pas dépasser 500 caractères')
    .optional(),
  code: z.string()
    .max(20, 'Le code ne peut pas dépasser 20 caractères')
    .regex(/^[A-Z0-9_.-]+$/, 'Le code ne peut contenir que des lettres majuscules, chiffres, tirets, points et underscores')
    .optional(),
  order: z.number()
    .int('L\'ordre doit être un entier')
    .min(1, 'L\'ordre doit être supérieur à 0')
    .max(100, 'L\'ordre doit être inférieur à 100')
    .optional(),
  strategicAxisId: z.string().cuid('ID de l\'axe stratégique invalide'),
});

export const updateStrategicSubAxisSchema = createStrategicSubAxisSchema
  .omit({ strategicAxisId: true })
  .partial();

// Schémas pour les Programmes de Recherche
export const createResearchProgramSchema = z.object({
  name: z.string()
    .min(3, 'Le nom doit contenir au moins 3 caractères')
    .max(200, 'Le nom ne peut pas dépasser 200 caractères'),
  description: z.string()
    .max(1000, 'La description ne peut pas dépasser 1000 caractères')
    .optional(),
  code: z.string()
    .max(30, 'Le code ne peut pas dépasser 30 caractères')
    .regex(/^[A-Z0-9_.-]+$/, 'Le code ne peut contenir que des lettres majuscules, chiffres, tirets, points et underscores')
    .optional(),
  startDate: z.string().datetime('Date de début invalide').optional()
    .transform((str) => str ? new Date(str) : undefined),
  endDate: z.string().datetime('Date de fin invalide').optional()
    .transform((str) => str ? new Date(str) : undefined),
  isActive: z.boolean().optional().default(true),
  strategicSubAxisId: z.string().cuid('ID du sous-axe stratégique invalide'),
  coordinatorId: z.string().cuid('ID du coordinateur invalide'),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return data.endDate > data.startDate;
  }
  return true;
}, {
  message: 'La date de fin doit être postérieure à la date de début',
  path: ['endDate'],
});

export const updateResearchProgramSchema = createResearchProgramSchema
  .omit({ strategicSubAxisId: true })
  .partial();

// Schémas pour les Thèmes de Recherche
export const createResearchThemeSchema = z.object({
  name: z.string()
    .min(3, 'Le nom doit contenir au moins 3 caractères')
    .max(200, 'Le nom ne peut pas dépasser 200 caractères'),
  description: z.string()
    .max(1000, 'La description ne peut pas dépasser 1000 caractères')
    .optional(),
  objectives: z.array(z.string().min(5, 'Chaque objectif doit contenir au moins 5 caractères'))
    .max(10, 'Maximum 10 objectifs autorisés')
    .optional()
    .default([]),
  code: z.string()
    .max(30, 'Le code ne peut pas dépasser 30 caractères')
    .regex(/^[A-Z0-9_.-]+$/, 'Le code ne peut contenir que des lettres majuscules, chiffres, tirets, points et underscores')
    .optional(),
  order: z.number()
    .int('L\'ordre doit être un entier')
    .min(1, 'L\'ordre doit être supérieur à 0')
    .max(100, 'L\'ordre doit être inférieur à 100')
    .optional(),
  isActive: z.boolean().optional().default(true),
  programId: z.string().cuid('ID du programme invalide'),
});

export const updateResearchThemeSchema = createResearchThemeSchema
  .omit({ programId: true })
  .partial();

// Schémas pour les Stations de Recherche
export const createResearchStationSchema = z.object({
  name: z.string()
    .min(3, 'Le nom doit contenir au moins 3 caractères')
    .max(150, 'Le nom ne peut pas dépasser 150 caractères'),
  location: z.string()
    .min(3, 'La localisation doit contenir au moins 3 caractères')
    .max(200, 'La localisation ne peut pas dépasser 200 caractères'),
  surface: z.number()
    .positive('La surface doit être positive')
    .max(10000, 'La surface ne peut pas dépasser 10000 hectares')
    .optional(),
  description: z.string()
    .max(1000, 'La description ne peut pas dépasser 1000 caractères')
    .optional(),
  isActive: z.boolean().optional().default(true),
});

export const updateResearchStationSchema = createResearchStationSchema.partial();

// Schémas pour les paramètres de requête
export const strategicPlanQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  startYear: z.coerce.number().int().optional(),
  endYear: z.coerce.number().int().optional(),
  sortBy: z.enum(['name', 'startYear', 'endYear', 'createdAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const strategicAxisQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  strategicPlanId: z.string().cuid().optional(),
  sortBy: z.enum(['name', 'code', 'order', 'createdAt']).optional().default('order'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

export const researchProgramQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  strategicSubAxisId: z.string().cuid().optional(),
  coordinatorId: z.string().cuid().optional(),
  isActive: z.coerce.boolean().optional(),
  sortBy: z.enum(['name', 'code', 'startDate', 'createdAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const researchThemeQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  programId: z.string().cuid().optional(),
  isActive: z.coerce.boolean().optional(),
  sortBy: z.enum(['name', 'code', 'order', 'createdAt']).optional().default('order'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});