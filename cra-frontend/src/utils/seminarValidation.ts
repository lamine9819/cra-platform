// src/utils/seminarValidation.ts
import { z } from 'zod';

// Validation personnalisée pour les dates
const dateValidation = z.string().refine((val) => {
  const date = new Date(val);
  return !isNaN(date.getTime());
}, {
  message: "Date invalide"
});

// Schema pour la création d'un séminaire
export const createSeminarSchema = z.object({
  title: z.string()
    .min(3, 'Le titre doit contenir au moins 3 caractères')
    .max(200, 'Le titre ne peut pas dépasser 200 caractères')
    .trim(),
  description: z.string()
    .max(2000, 'La description ne peut pas dépasser 2000 caractères')
    .optional(),
  location: z.string()
    .max(200, 'Le lieu ne peut pas dépasser 200 caractères')
    .optional(),
  startDate: dateValidation,
  endDate: dateValidation.optional(),
  agenda: z.string()
    .max(5000, 'L\'agenda ne peut pas dépasser 5000 caractères')
    .optional(),
  maxParticipants: z.number()
    .min(1, 'Le nombre de participants doit être au moins 1')
    .max(1000, 'Le nombre de participants ne peut pas dépasser 1000')
    .optional(),
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

// Schema pour la mise à jour d'un séminaire
export const updateSeminarSchema = z.object({
  title: z.string()
    .min(3, 'Le titre doit contenir au moins 3 caractères')
    .max(200, 'Le titre ne peut pas dépasser 200 caractères')
    .trim()
    .optional(),
  description: z.string()
    .max(2000, 'La description ne peut pas dépasser 2000 caractères')
    .optional(),
  location: z.string()
    .max(200, 'Le lieu ne peut pas dépasser 200 caractères')
    .optional(),
  startDate: dateValidation.optional(),
  endDate: dateValidation.optional(),
  status: z.enum(['PLANIFIE', 'EN_COURS', 'TERMINE', 'ANNULE']).optional(),
  agenda: z.string()
    .max(5000, 'L\'agenda ne peut pas dépasser 5000 caractères')
    .optional(),
  maxParticipants: z.number()
    .min(1, 'Le nombre de participants doit être au moins 1')
    .max(1000, 'Le nombre de participants ne peut pas dépasser 1000')
    .optional(),
}).refine(data => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) < new Date(data.endDate);
  }
  return true;
}, {
  message: "La date de fin doit être postérieure à la date de début",
  path: ["endDate"]
});

// Schema pour les paramètres de requête de liste
export const seminarListQuerySchema = z.object({
  page: z.string()
    .transform(Number)
    .pipe(z.number().min(1))
    .optional(),
  limit: z.string()
    .transform(Number)
    .pipe(z.number().min(1).max(100))
    .optional(),
  status: z.enum(['PLANIFIE', 'EN_COURS', 'TERMINE', 'ANNULE']).optional(),
  organizerId: z.string().cuid().optional(),
  search: z.string().optional(),
  startDate: dateValidation.optional(),
  endDate: dateValidation.optional(),
  timeFilter: z.enum(['past', 'upcoming', 'current', 'all']).default('all'),
  location: z.string().optional(),
  sortBy: z.enum(['title', 'createdAt', 'updatedAt', 'startDate']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Schema pour l'inscription à un séminaire
export const seminarRegistrationSchema = z.object({
  userId: z.string().cuid().optional(), // Pour les admins qui inscrivent d'autres utilisateurs
});

// Fonction utilitaire pour valider une date
export const validateDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

// Fonction utilitaire pour valider que la date est dans le futur
export const validateFutureDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  const now = new Date();
  return date > now;
};

// Fonction utilitaire pour valider qu'une date de fin est après une date de début
export const validateEndDateAfterStartDate = (startDate: string, endDate: string): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return end > start;
};

// Schema simple pour les IDs
export const seminarIdSchema = z.string().cuid();

// Schema pour les filtres de recherche côté client
export const searchFiltersSchema = z.object({
  searchTerm: z.string().optional(),
  statusFilter: z.enum(['all', 'PLANIFIE', 'EN_COURS', 'TERMINE', 'ANNULE']).default('all'),
  timeFilter: z.enum(['all', 'past', 'upcoming', 'current']).default('all'),
  locationFilter: z.string().optional(),
});

// Type inféré pour les filtres de recherche
export type SearchFilters = z.infer<typeof searchFiltersSchema>;

// Fonction de validation personnalisée pour les formulaires côté client
export const validateSeminarForm = (data: any): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  // Validation du titre
  if (!data.title || data.title.trim().length < 3) {
    errors.title = 'Le titre doit contenir au moins 3 caractères';
  } else if (data.title.trim().length > 200) {
    errors.title = 'Le titre ne peut pas dépasser 200 caractères';
  }

  // Validation de la description
  if (data.description && data.description.length > 2000) {
    errors.description = 'La description ne peut pas dépasser 2000 caractères';
  }

  // Validation du lieu
  if (data.location && data.location.length > 200) {
    errors.location = 'Le lieu ne peut pas dépasser 200 caractères';
  }

  // Validation de la date de début
  if (!data.startDate) {
    errors.startDate = 'La date de début est requise';
  } else if (!validateDate(data.startDate)) {
    errors.startDate = 'Format de date invalide';
  } else if (!validateFutureDate(data.startDate)) {
    errors.startDate = 'La date de début doit être dans le futur';
  }

  // Validation de la date de fin
  if (data.endDate) {
    if (!validateDate(data.endDate)) {
      errors.endDate = 'Format de date invalide';
    } else if (data.startDate && !validateEndDateAfterStartDate(data.startDate, data.endDate)) {
      errors.endDate = 'La date de fin doit être postérieure à la date de début';
    }
  }

  // Validation de l'agenda
  if (data.agenda && data.agenda.length > 5000) {
    errors.agenda = 'L\'agenda ne peut pas dépasser 5000 caractères';
  }

  // Validation du nombre maximum de participants
  if (data.maxParticipants !== undefined && data.maxParticipants !== null) {
    const maxParticipants = Number(data.maxParticipants);
    if (isNaN(maxParticipants) || maxParticipants < 1) {
      errors.maxParticipants = 'Le nombre de participants doit être au moins 1';
    } else if (maxParticipants > 1000) {
      errors.maxParticipants = 'Le nombre de participants ne peut pas dépasser 1000';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};