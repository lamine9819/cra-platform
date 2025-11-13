// types/formation.types.ts
import { z } from 'zod';

// Schéma de validation pour créer une formation courte reçue
export const createShortTrainingReceivedSchema = z.object({
  title: z.string().min(1, "Le titre est requis"), // Intitulé de la formation
  objectives: z.array(z.string()).min(1, "Au moins un objectif est requis"), // Objectifs de la formation
  location: z.string().min(1, "Le lieu est requis"), // Lieu
  startDate: z.string().datetime("Date de début invalide"),
  endDate: z.string().datetime("Date de fin invalide").optional(),
  duration: z.number().int().positive("La durée doit être positive").optional(), // Période ou durée
  beneficiaries: z.array(z.string()).default([]), // Chercheurs bénéficiaires (si plusieurs)
  organizer: z.string().optional(), // Organisme organisateur
  activityId: z.string().optional(),
});

// Schéma de validation pour créer une formation diplômante reçue
export const createDiplomaticTrainingReceivedSchema = z.object({
  studentName: z.string().min(1, "Le nom de l'étudiant est requis"), // Prénom et nom
  level: z.string().min(1, "Le niveau est requis"), // Niveau
  specialty: z.string().min(1, "La spécialité est requise"), // Spécialité
  university: z.string().min(1, "L'université est requise"), // Universités / Écoles
  startDate: z.string().datetime("Date de début invalide"),
  endDate: z.string().datetime("Date de fin invalide").optional(),
  period: z.string().min(1, "La période est requise"), // Période (format texte comme "2022-2024")
  diplomaObtained: z.enum(['OUI', 'NON', 'EN_COURS']).default('EN_COURS'), // Obtention du diplôme
  activityId: z.string().optional(),
});

// Schéma de validation pour créer une formation dispensée
export const createTrainingGivenSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().optional(),
  type: z.enum(['FORMATION_COURTE', 'FORMATION_DIPLOMANTE', 'STAGE_ADAPTATION', 'STAGE_RECHERCHE', 'ATELIER_TECHNIQUE', 'SEMINAIRE_FORMATION']),
  institution: z.string().min(1, "L'institution est requise"),
  level: z.string().min(1, "Le niveau est requis"),
  department: z.string().min(1, "Le département/faculté est requis"),
  location: z.string().optional(),
  startDate: z.string().datetime("Date de début invalide"),
  endDate: z.string().datetime("Date de fin invalide").optional(),
  duration: z.number().int().positive("La durée doit être positive").optional(),
  objectives: z.array(z.string()).default([]),
  maxParticipants: z.number().int().positive().optional(),
  activityId: z.string().optional(),
});

// Schéma de validation pour créer un encadrement
export const createSupervisionSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  studentName: z.string().min(1, "Le nom de l'étudiant est requis"),
  type: z.enum(['DOCTORAT', 'MASTER', 'LICENCE', 'INGENIEUR']),
  specialty: z.string().min(1, "La spécialité est requise"),
  university: z.string().min(1, "L'université est requise"),
  startDate: z.string().datetime("Date de début invalide"),
  endDate: z.string().datetime("Date de fin invalide").optional(),
  expectedDefenseDate: z.string().datetime("Date prévue de soutenance invalide").optional(),
  status: z.enum(['EN_COURS', 'SOUTENU', 'ABANDONNE']).default('EN_COURS'),
  abstract: z.string().optional(),
  coSupervisors: z.array(z.string()).default([]),
  activityId: z.string().optional(),
});

// Schéma de validation pour la mise à jour
export const updateTrainingReceivedSchema = createShortTrainingReceivedSchema.partial();
export const updateTrainingGivenSchema = createTrainingGivenSchema.partial();
export const updateSupervisionSchema = createSupervisionSchema.partial();

// Types TypeScript exportés
export type CreateShortTrainingReceivedInput = z.infer<typeof createShortTrainingReceivedSchema>;
export type CreateDiplomaticTrainingReceivedInput = z.infer<typeof createDiplomaticTrainingReceivedSchema>;
export type CreateTrainingGivenInput = z.infer<typeof createTrainingGivenSchema>;
export type CreateSupervisionInput = z.infer<typeof createSupervisionSchema>;
export type UpdateTrainingReceivedInput = z.infer<typeof updateTrainingReceivedSchema>;
export type UpdateTrainingGivenInput = z.infer<typeof updateTrainingGivenSchema>;
export type UpdateSupervisionInput = z.infer<typeof updateSupervisionSchema>;

// Types pour les réponses API
export interface ShortTrainingReceivedResponse {
  id: string;
  title: string;
  objectives: string[];
  location: string;
  startDate: Date;
  endDate: Date | null;
  duration: number | null;
  period?: string; // Format texte pour affichage
  beneficiaries: string[];
  organizer: string | null;
  createdAt: Date;
  updatedAt: Date;
  activity: {
    id: string;
    title: string;
  } | null;
}

export interface DiplomaticTrainingReceivedResponse {
  id: string;
  studentName: string;
  level: string;
  specialty: string;
  university: string;
  startDate: Date;
  endDate: Date | null;
  period: string;
  diplomaObtained: string;
  createdAt: Date;
  updatedAt: Date;
  activity: {
    id: string;
    title: string;
  } | null;
}

export interface TrainingGivenResponse {
  id: string;
  title: string;
  description: string | null;
  type: string;
  institution: string;
  level: string;
  department: string;
  location: string | null;
  startDate: Date;
  endDate: Date | null;
  duration: number | null;
  objectives: string[];
  maxParticipants: number | null;
  createdAt: Date;
  updatedAt: Date;
  activity: {
    id: string;
    title: string;
  } | null;
}

export interface SupervisionResponse {
  id: string;
  title: string;
  studentName: string;
  type: string;
  specialty: string;
  university: string;
  startDate: Date;
  endDate: Date | null;
  expectedDefenseDate?: Date;
  status: string;
  abstract: string | null;
  coSupervisors: string[];
  createdAt: Date;
  updatedAt: Date;
  activity: {
    id: string;
    title: string;
  } | null;
}

// Types pour les rapports
export interface FormationReport {
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  shortTrainingsReceived: ShortTrainingReceivedResponse[];
  diplomaticTrainingsReceived: DiplomaticTrainingReceivedResponse[];
  trainingsGiven: TrainingGivenResponse[];
  supervisions: SupervisionResponse[];
}