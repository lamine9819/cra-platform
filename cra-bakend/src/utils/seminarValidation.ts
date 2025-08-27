// src/utils/seminarValidation.ts
import { z } from 'zod';

// Validation personnalisée pour les dates
const dateValidation = z.string().refine((val) => {
  const date = new Date(val);
  return !isNaN(date.getTime());
}, {
  message: "Date invalide"
});

export const createSeminarSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(200),
  description: z.string().max(2000).optional(),
  location: z.string().max(200).optional(),
  startDate: dateValidation,
  endDate: dateValidation.optional(),
  agenda: z.string().max(5000).optional(),
  maxParticipants: z.number().min(1).max(1000).optional(),
}).refine(data => {
  if (data.endDate) {
    return new Date(data.startDate) < new Date(data.endDate);
  }
  return true;
}, {
  message: "La date de fin doit être postérieure à la date de début",
  path: ["endDate"]
}).refine(data => {
  // La date de début doit être dans le futur (sauf pour les admins)
  return new Date(data.startDate) > new Date();
}, {
  message: "La date de début doit être dans le futur",
  path: ["startDate"]
});

export const updateSeminarSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(2000).optional(),
  location: z.string().max(200).optional(),
  startDate: dateValidation.optional(),
  endDate: dateValidation.optional(),
  status: z.enum(['PLANIFIE', 'EN_COURS', 'TERMINE', 'ANNULE']).optional(),
  agenda: z.string().max(5000).optional(),
  maxParticipants: z.number().min(1).max(1000).optional(),
}).refine(data => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) < new Date(data.endDate);
  }
  return true;
}, {
  message: "La date de fin doit être postérieure à la date de début",
  path: ["endDate"]
});

export const seminarListQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
  status: z.enum(['PLANIFIE', 'EN_COURS', 'TERMINE', 'ANNULE']).optional(),
  organizerId: z.cuid().optional(),
  search: z.string().optional(),
  startDate: dateValidation.optional(),
  endDate: dateValidation.optional(),
  timeFilter: z.enum(['past', 'upcoming', 'current', 'all']).default('all'),
  location: z.string().optional(),
});

export const seminarRegistrationSchema = z.object({
  userId: z.string().cuid().optional(), // Pour les admins qui inscrivent d'autres utilisateurs
});