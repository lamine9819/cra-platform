// src/utils/trainingValidation.ts - Schémas de validation Zod
import { z } from 'zod';
import { TrainingType, SupervisionType, SupervisionStatus } from '../types/training.types';

// Validation personnalisée pour les dates
const dateValidation = z.union([
  z.string().refine((val) => {
    if (val === '') return true;
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
      const date = new Date(val);
      return !isNaN(date.getTime());
    }
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, {
    message: "Date invalide - Format attendu: YYYY-MM-DD"
  }),
  z.literal('')
]);

// ================================
// SCHEMAS POUR LES FORMATIONS
// ================================

export const createTrainingSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(200),
  description: z.string().max(2000).optional(),
  type: z.nativeEnum(TrainingType, {
    message: "Type de formation requis"
  }),
  location: z.string().max(200).optional(),
  startDate: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, {
    message: "Date de début requise et valide"
  }),
  endDate: dateValidation.optional(),
  duration: z.number().int().min(1).max(1000).optional(),
  objectives: z.array(z.string().min(1, 'Les objectifs ne peuvent pas être vides')).min(1, 'Au moins un objectif est requis'),
  // Pour formations dispensées : déclaratif
  participantCount: z.number().int().min(1).max(1000).optional(),
  targetAudience: z.string().max(200).optional(),
  isInternal: z.boolean().default(true),
  organizer: z.string().max(200).optional(),
  activityId: z.string().cuid().optional(),
}).refine(data => {
  if (data.startDate && data.endDate && data.endDate !== '') {
    return new Date(data.startDate) <= new Date(data.endDate);
  }
  return true;
}, {
  message: "La date de fin doit être postérieure à la date de début",
  path: ["endDate"]
}).refine(data => {
  // Si c'est une formation externe, l'organisateur est requis
  if (!data.isInternal && !data.organizer) {
    return false;
  }
  return true;
}, {
  message: "L'organisateur est requis pour les formations externes",
  path: ["organizer"]
});

export const updateTrainingSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(200).optional(),
  description: z.string().max(2000).optional().or(z.literal('')),
  type: z.nativeEnum(TrainingType).optional(),
  location: z.string().max(200).optional().or(z.literal('')),
  startDate: dateValidation.optional(),
  endDate: dateValidation.optional(),
  duration: z.number().int().min(1).max(1000).optional(),
  objectives: z.array(z.string().min(1)).optional(),
  participantCount: z.number().int().min(1).max(1000).optional(),
  targetAudience: z.string().max(200).optional().or(z.literal('')),
  isInternal: z.boolean().optional(),
  organizer: z.string().max(200).optional().or(z.literal('')),
  activityId: z.string().cuid().optional(),
}).refine(data => {
  if (data.startDate && data.endDate && 
      data.startDate !== '' && data.endDate !== '') {
    return new Date(data.startDate) <= new Date(data.endDate);
  }
  return true;
}, {
  message: 'La date de fin doit être postérieure à la date de début',
  path: ['endDate']
});

export const trainingListQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
  search: z.string().optional(),
  type: z.nativeEnum(TrainingType).optional(),
  startDate: dateValidation.optional(),
  endDate: dateValidation.optional(),
  isInternal: z.string().transform(val => val === 'true').optional(),
  activityId: z.string().cuid().optional(),
  // Supprimé participantId car pas de gestion de participants
});

// Suppression des schémas de participants
// export const addTrainingParticipantSchema = ...
// export const updateTrainingParticipantSchema = ...

// ================================
// SCHEMAS POUR LES STAGES
// ================================

export const createInternshipSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(200),
  description: z.string().max(2000).optional(),
  institution: z.string().min(2, 'Institution requise').max(200),
  startDate: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, {
    message: "Date de début requise et valide"
  }),
  endDate: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, {
    message: "Date de fin requise et valide"
  }),
  objectives: z.array(z.string().min(1)).min(1, 'Au moins un objectif est requis'),
  supervisorId: z.string().cuid('Superviseur requis'),
  internId: z.string().cuid('Stagiaire requis'),
  activityId: z.string().cuid().optional(),
}).refine(data => {
  return new Date(data.startDate) < new Date(data.endDate);
}, {
  message: "La date de fin doit être postérieure à la date de début",
  path: ["endDate"]
});

export const updateInternshipSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(2000).optional().or(z.literal('')),
  institution: z.string().min(2).max(200).optional(),
  startDate: dateValidation.optional(),
  endDate: dateValidation.optional(),
  objectives: z.array(z.string().min(1)).optional(),
  results: z.string().max(2000).optional().or(z.literal('')),
  supervisorId: z.string().cuid().optional(),
  internId: z.string().cuid().optional(),
  activityId: z.string().cuid().optional(),
}).refine(data => {
  if (data.startDate && data.endDate && 
      data.startDate !== '' && data.endDate !== '') {
    return new Date(data.startDate) < new Date(data.endDate);
  }
  return true;
}, {
  message: 'La date de fin doit être postérieure à la date de début',
  path: ['endDate']
});

export const internshipListQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
  search: z.string().optional(),
  supervisorId: z.string().cuid().optional(),
  internId: z.string().cuid().optional(),
  startDate: dateValidation.optional(),
  endDate: dateValidation.optional(),
  activityId: z.string().cuid().optional(),
});

// ================================
// SCHEMAS POUR LES SUPERVISIONS
// ================================

export const createSupervisionSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(300),
  type: z.nativeEnum(SupervisionType, {
    message: "Type de supervision requis"
  }),
  university: z.string().min(2, 'Université requise').max(200),
  startDate: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, {
    message: "Date de début requise et valide"
  }),
  endDate: dateValidation.optional(),
  abstract: z.string().max(3000).optional(),
  supervisorId: z.string().cuid('Superviseur requis'),
  studentId: z.string().cuid('Étudiant requis'),
  activityId: z.string().cuid().optional(),
}).refine(data => {
  if (data.endDate && data.endDate !== '') {
    return new Date(data.startDate) < new Date(data.endDate);
  }
  return true;
}, {
  message: "La date de fin doit être postérieure à la date de début",
  path: ["endDate"]
});

export const updateSupervisionSchema = z.object({
  title: z.string().min(3).max(300).optional(),
  type: z.nativeEnum(SupervisionType).optional(),
  university: z.string().min(2).max(200).optional(),
  startDate: dateValidation.optional(),
  endDate: dateValidation.optional(),
  status: z.nativeEnum(SupervisionStatus).optional(),
  abstract: z.string().max(3000).optional().or(z.literal('')),
  supervisorId: z.string().cuid().optional(),
  studentId: z.string().cuid().optional(),
  activityId: z.string().cuid().optional(),
}).refine(data => {
  if (data.startDate && data.endDate && 
      data.startDate !== '' && data.endDate !== '') {
    return new Date(data.startDate) < new Date(data.endDate);
  }
  return true;
}, {
  message: 'La date de fin doit être postérieure à la date de début',
  path: ['endDate']
});

export const supervisionListQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
  search: z.string().optional(),
  type: z.nativeEnum(SupervisionType).optional(),
  status: z.nativeEnum(SupervisionStatus).optional(),
  supervisorId: z.string().cuid().optional(),
  studentId: z.string().cuid().optional(),
  university: z.string().optional(),
  startDate: dateValidation.optional(),
  endDate: dateValidation.optional(),
  activityId: z.string().cuid().optional(),
});

// ================================
// TYPES TYPESCRIPT INFÉRÉS
// ================================

export type CreateTrainingInput = z.infer<typeof createTrainingSchema>;
export type UpdateTrainingInput = z.infer<typeof updateTrainingSchema>;
export type TrainingListQuery = z.infer<typeof trainingListQuerySchema>;

export type CreateInternshipInput = z.infer<typeof createInternshipSchema>;
export type UpdateInternshipInput = z.infer<typeof updateInternshipSchema>;
export type InternshipListQuery = z.infer<typeof internshipListQuerySchema>;

export type CreateSupervisionInput = z.infer<typeof createSupervisionSchema>;
export type UpdateSupervisionInput = z.infer<typeof updateSupervisionSchema>;
export type SupervisionListQuery = z.infer<typeof supervisionListQuerySchema>;

// ================================
// UTILITAIRES DE VALIDATION
// ================================

export const validateTrainingType = (type: string): type is TrainingType => {
  return Object.values(TrainingType).includes(type as TrainingType);
};

export const validateSupervisionType = (type: string): type is SupervisionType => {
  return Object.values(SupervisionType).includes(type as SupervisionType);
};

export const validateSupervisionStatus = (status: string): status is SupervisionStatus => {
  return Object.values(SupervisionStatus).includes(status as SupervisionStatus);
};

export const validateDateRange = (startDate?: string, endDate?: string): boolean => {
  if (!startDate || !endDate || endDate === '') return true;
  return new Date(startDate) <= new Date(endDate);
};

export const validateTrainingDuration = (startDate?: string, endDate?: string, duration?: number): boolean => {
  if (!startDate || !endDate || !duration || endDate === '') return true;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffHours = Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60);
  
  // La durée ne doit pas dépasser le nombre d'heures entre les dates
  return duration <= diffHours;
};