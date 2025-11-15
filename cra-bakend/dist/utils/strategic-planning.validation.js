"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.researchThemeQuerySchema = exports.researchProgramQuerySchema = exports.strategicAxisQuerySchema = exports.strategicPlanQuerySchema = exports.updateResearchStationSchema = exports.createResearchStationSchema = exports.updateResearchThemeSchema = exports.createResearchThemeSchema = exports.updateResearchProgramSchema = exports.createResearchProgramSchema = exports.updateStrategicSubAxisSchema = exports.createStrategicSubAxisSchema = exports.updateStrategicAxisSchema = exports.createStrategicAxisSchema = exports.updateStrategicPlanSchema = exports.createStrategicPlanSchema = void 0;
// src/utils/validation/strategic-planning.validation.ts
const zod_1 = require("zod");
// Schémas pour les Plans Stratégiques
exports.createStrategicPlanSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(3, 'Le nom doit contenir au moins 3 caractères')
        .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
    description: zod_1.z.string()
        .max(500, 'La description ne peut pas dépasser 500 caractères')
        .optional(),
    startYear: zod_1.z.number()
        .int('L\'année de début doit être un entier')
        .min(2020, 'L\'année de début doit être supérieure à 2020')
        .max(2050, 'L\'année de début doit être inférieure à 2050'),
    endYear: zod_1.z.number()
        .int('L\'année de fin doit être un entier')
        .min(2020, 'L\'année de fin doit être supérieure à 2020')
        .max(2050, 'L\'année de fin doit être inférieure à 2050'),
    isActive: zod_1.z.boolean().optional().default(true),
}).refine((data) => data.endYear > data.startYear, {
    message: 'L\'année de fin doit être postérieure à l\'année de début',
    path: ['endYear'],
});
exports.updateStrategicPlanSchema = exports.createStrategicPlanSchema.partial();
// Schémas pour les Axes Stratégiques
exports.createStrategicAxisSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(3, 'Le nom doit contenir au moins 3 caractères')
        .max(150, 'Le nom ne peut pas dépasser 150 caractères'),
    description: zod_1.z.string()
        .max(500, 'La description ne peut pas dépasser 500 caractères')
        .optional(),
    code: zod_1.z.string()
        .max(20, 'Le code ne peut pas dépasser 20 caractères')
        .regex(/^[A-Z0-9_-]+$/, 'Le code ne peut contenir que des lettres majuscules, chiffres, tirets et underscores')
        .optional(),
    order: zod_1.z.number()
        .int('L\'ordre doit être un entier')
        .min(1, 'L\'ordre doit être supérieur à 0')
        .max(100, 'L\'ordre doit être inférieur à 100')
        .optional(),
    strategicPlanId: zod_1.z.string().cuid('ID du plan stratégique invalide'),
});
exports.updateStrategicAxisSchema = exports.createStrategicAxisSchema
    .omit({ strategicPlanId: true })
    .partial();
// Schémas pour les Sous-axes Stratégiques
exports.createStrategicSubAxisSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(3, 'Le nom doit contenir au moins 3 caractères')
        .max(150, 'Le nom ne peut pas dépasser 150 caractères'),
    description: zod_1.z.string()
        .max(500, 'La description ne peut pas dépasser 500 caractères')
        .optional(),
    code: zod_1.z.string()
        .max(20, 'Le code ne peut pas dépasser 20 caractères')
        .regex(/^[A-Z0-9_.-]+$/, 'Le code ne peut contenir que des lettres majuscules, chiffres, tirets, points et underscores')
        .optional(),
    order: zod_1.z.number()
        .int('L\'ordre doit être un entier')
        .min(1, 'L\'ordre doit être supérieur à 0')
        .max(100, 'L\'ordre doit être inférieur à 100')
        .optional(),
    strategicAxisId: zod_1.z.string().cuid('ID de l\'axe stratégique invalide'),
});
exports.updateStrategicSubAxisSchema = exports.createStrategicSubAxisSchema
    .omit({ strategicAxisId: true })
    .partial();
// Schémas pour les Programmes de Recherche
exports.createResearchProgramSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(3, 'Le nom doit contenir au moins 3 caractères')
        .max(200, 'Le nom ne peut pas dépasser 200 caractères'),
    description: zod_1.z.string()
        .max(1000, 'La description ne peut pas dépasser 1000 caractères')
        .optional(),
    code: zod_1.z.string()
        .max(30, 'Le code ne peut pas dépasser 30 caractères')
        .regex(/^[A-Z0-9_.-]+$/, 'Le code ne peut contenir que des lettres majuscules, chiffres, tirets, points et underscores')
        .optional(),
    startDate: zod_1.z.string().datetime('Date de début invalide').optional()
        .transform((str) => str ? new Date(str) : undefined),
    endDate: zod_1.z.string().datetime('Date de fin invalide').optional()
        .transform((str) => str ? new Date(str) : undefined),
    isActive: zod_1.z.boolean().optional().default(true),
    strategicSubAxisId: zod_1.z.string().cuid('ID du sous-axe stratégique invalide'),
    coordinatorId: zod_1.z.string().cuid('ID du coordinateur invalide'),
}).refine((data) => {
    if (data.startDate && data.endDate) {
        return data.endDate > data.startDate;
    }
    return true;
}, {
    message: 'La date de fin doit être postérieure à la date de début',
    path: ['endDate'],
});
exports.updateResearchProgramSchema = exports.createResearchProgramSchema
    .omit({ strategicSubAxisId: true })
    .partial();
// Schémas pour les Thèmes de Recherche
exports.createResearchThemeSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(3, 'Le nom doit contenir au moins 3 caractères')
        .max(200, 'Le nom ne peut pas dépasser 200 caractères'),
    description: zod_1.z.string()
        .max(1000, 'La description ne peut pas dépasser 1000 caractères')
        .optional(),
    objectives: zod_1.z.array(zod_1.z.string().min(5, 'Chaque objectif doit contenir au moins 5 caractères'))
        .max(10, 'Maximum 10 objectifs autorisés')
        .optional()
        .default([]),
    code: zod_1.z.string()
        .max(30, 'Le code ne peut pas dépasser 30 caractères')
        .regex(/^[A-Z0-9_.-]+$/, 'Le code ne peut contenir que des lettres majuscules, chiffres, tirets, points et underscores')
        .optional(),
    order: zod_1.z.number()
        .int('L\'ordre doit être un entier')
        .min(1, 'L\'ordre doit être supérieur à 0')
        .max(100, 'L\'ordre doit être inférieur à 100')
        .optional(),
    isActive: zod_1.z.boolean().optional().default(true),
    programId: zod_1.z.string().cuid('ID du programme invalide'),
});
exports.updateResearchThemeSchema = exports.createResearchThemeSchema
    .omit({ programId: true })
    .partial();
// Schémas pour les Stations de Recherche
exports.createResearchStationSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(3, 'Le nom doit contenir au moins 3 caractères')
        .max(150, 'Le nom ne peut pas dépasser 150 caractères'),
    location: zod_1.z.string()
        .min(3, 'La localisation doit contenir au moins 3 caractères')
        .max(200, 'La localisation ne peut pas dépasser 200 caractères'),
    surface: zod_1.z.number()
        .positive('La surface doit être positive')
        .max(10000, 'La surface ne peut pas dépasser 10000 hectares')
        .optional(),
    description: zod_1.z.string()
        .max(1000, 'La description ne peut pas dépasser 1000 caractères')
        .optional(),
    isActive: zod_1.z.boolean().optional().default(true),
});
exports.updateResearchStationSchema = exports.createResearchStationSchema.partial();
// Schémas pour les paramètres de requête
exports.strategicPlanQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).optional().default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).optional().default(10),
    search: zod_1.z.string().optional(),
    isActive: zod_1.z.coerce.boolean().optional(),
    startYear: zod_1.z.coerce.number().int().optional(),
    endYear: zod_1.z.coerce.number().int().optional(),
    sortBy: zod_1.z.enum(['name', 'startYear', 'endYear', 'createdAt']).optional().default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional().default('desc'),
});
exports.strategicAxisQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).optional().default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).optional().default(10),
    search: zod_1.z.string().optional(),
    strategicPlanId: zod_1.z.string().cuid().optional(),
    sortBy: zod_1.z.enum(['name', 'code', 'order', 'createdAt']).optional().default('order'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional().default('asc'),
});
exports.researchProgramQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).optional().default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).optional().default(10),
    search: zod_1.z.string().optional(),
    strategicSubAxisId: zod_1.z.string().cuid().optional(),
    coordinatorId: zod_1.z.string().cuid().optional(),
    isActive: zod_1.z.coerce.boolean().optional(),
    sortBy: zod_1.z.enum(['name', 'code', 'startDate', 'createdAt']).optional().default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional().default('desc'),
});
exports.researchThemeQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).optional().default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).optional().default(10),
    search: zod_1.z.string().optional(),
    programId: zod_1.z.string().cuid().optional(),
    isActive: zod_1.z.coerce.boolean().optional(),
    sortBy: zod_1.z.enum(['name', 'code', 'order', 'createdAt']).optional().default('order'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional().default('asc'),
});
//# sourceMappingURL=strategic-planning.validation.js.map