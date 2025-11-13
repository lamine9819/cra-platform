// src/utils/activityValidation.ts - Version CRA adaptée
import { z } from 'zod';
import { ActivityType, ActivityLifecycleStatus, ActivityStatus, ParticipantRole } from '../types/activity.types';
import { TaskStatus, TaskPriority,FundingType, FundingStatus } from '@prisma/client';
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

// Schema pour créer une activité CRA
export const createActivitySchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(200),
  description: z.string().max(2000).optional(),
  objectives: z.array(z.string().min(1, 'Les objectifs ne peuvent pas être vides')).min(1, 'Au moins un objectif est requis'),
  methodology: z.string().max(2000).optional(),
  location: z.string().max(200).optional(),
  startDate: dateValidation.optional(),
  endDate: dateValidation.optional(),
  
  // Champs CRA spécifiques
  code: z.string().max(50).optional(),
  type: z.nativeEnum(ActivityType, {
    message: "Type d'activité requis"
  }),
  lifecycleStatus: z.nativeEnum(ActivityLifecycleStatus).default(ActivityLifecycleStatus.NOUVELLE),
  interventionRegion: z.string().max(100).optional(),
  strategicPlan: z.string().max(100).optional(),
  strategicAxis: z.string().max(100).optional(),
  subAxis: z.string().max(100).optional(),
  
  // Relations CRA - thème et responsable OBLIGATOIRES
  themeId: z.string().cuid('ID de thème requis'),
  responsibleId: z.string().cuid('Responsable requis'),
  stationId: z.string().cuid().optional(),
  conventionId: z.string().cuid().optional(),
  
  // Le projet devient optionnel
  projectId: z.string().cuid('ID de projet invalide').optional(),
}).refine(data => {
  if (data.startDate && data.endDate && data.startDate !== '' && data.endDate !== '') {
    return new Date(data.startDate) <= new Date(data.endDate);
  }
  return true;
}, {
  message: "La date de fin doit être postérieure à la date de début",
  path: ["endDate"]
}).refine(data => {
  // Validation spécifique : si c'est une activité de formation dispensée,
  // la méthodologie est fortement recommandée
  if (data.type === ActivityType.FORMATION_DISPENSEE && !data.methodology) {
    return false;
  }
  return true;
}, {
  message: "La méthodologie est requise pour les activités de formation dispensée",
  path: ["methodology"]
});

// Schema pour mettre à jour une activité CRA
export const updateActivitySchema = z.object({
  title: z.string().min(1, 'Le titre est obligatoire').max(255).optional(),
  description: z.string().max(1000).optional().or(z.literal('')),
  objectives: z.array(z.string().min(1, 'Les objectifs ne peuvent pas être vides')).optional(),
  methodology: z.string().max(1000).optional().or(z.literal('')),
  location: z.string().max(255).optional().or(z.literal('')),
  startDate: dateValidation.optional(),
  endDate: dateValidation.optional(),
  results: z.string().max(2000).optional().or(z.literal('')),
  conclusions: z.string().max(2000).optional().or(z.literal('')),
  
  // Champs CRA modifiables
  code: z.string().max(50).optional(),
  type: z.nativeEnum(ActivityType).optional(),
  lifecycleStatus: z.nativeEnum(ActivityLifecycleStatus).optional(),
  interventionRegion: z.string().max(100).optional().or(z.literal('')),
  strategicPlan: z.string().max(100).optional().or(z.literal('')),
  strategicAxis: z.string().max(100).optional().or(z.literal('')),
  subAxis: z.string().max(100).optional().or(z.literal('')),
  
  // Relations modifiables
  themeId: z.string().cuid().optional(),
  responsibleId: z.string().cuid().optional(),
  stationId: z.string().cuid().optional(),
  conventionId: z.string().cuid().optional(),
  projectId: z.string().cuid().optional(),
}).refine(data => {
  if (data.startDate && data.endDate && 
      data.startDate !== '' && data.endDate !== '' &&
      data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate);
  }
  return true;
}, {
  message: 'La date de fin doit être postérieure à la date de début',
  path: ['endDate']
});

// Schema pour les requêtes de liste avec filtres CRA
export const activityListQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
  search: z.string().optional(),
  startDate: dateValidation.optional(),
  endDate: dateValidation.optional(),
  hasResults: z.string().transform(val => val === 'true').optional(),
  
  // Filtres CRA spécifiques
  themeId: z.string().cuid().optional(),
  stationId: z.string().cuid().optional(),
  responsibleId: z.string().cuid().optional(),
  type: z.nativeEnum(ActivityType).optional(),
  status: z.nativeEnum(ActivityStatus).optional(),
  lifecycleStatus: z.nativeEnum(ActivityLifecycleStatus).optional(),
  interventionRegion: z.string().optional(),
  withoutProject: z.string().transform(val => val === 'true').optional(),
  isRecurrent: z.string().transform(val => val === 'true').optional(),
  conventionId: z.string().cuid().optional(),
  
  // Projet optionnel
  projectId: z.string().cuid().optional(),
});

// Schema pour la reconduction d'activité
export const activityRecurrenceSchema = z.object({
  reason: z.string().min(10, 'La raison de reconduction doit être détaillée').max(500),
  modifications: z.array(z.string()).optional(),
  budgetChanges: z.string().max(500).optional(),
  teamChanges: z.string().max(500).optional(),
  scopeChanges: z.string().max(500).optional(),
  newTitle: z.string().max(200).optional(),
  newStartDate: dateValidation.optional(),
  newEndDate: dateValidation.optional(),
}).refine(data => {
  if (data.newStartDate && data.newEndDate && 
      data.newStartDate !== '' && data.newEndDate !== '') {
    return new Date(data.newStartDate) <= new Date(data.newEndDate);
  }
  return true;
}, {
  message: 'La nouvelle date de fin doit être postérieure à la nouvelle date de début',
  path: ['newEndDate']
});

// Schemas existants adaptés
export const linkFormSchema = z.object({
  formId: z.string().cuid('ID de formulaire invalide'),
});

export const linkDocumentSchema = z.object({
  documentId: z.string().cuid('ID de document invalide'),
});

export const duplicateActivitySchema = z.object({
  title: z.string().max(255).optional(),
  newResponsibleId: z.string().cuid().optional(), // Permettre de changer le responsable
  newThemeId: z.string().cuid().optional(), // Permettre de changer le thème
});

// Schema pour les participants à l'activité
export const addParticipantSchema = z.object({
  userId: z.string().cuid('ID utilisateur requis'),
  role: z.nativeEnum(ParticipantRole, {
    message: 'Rôle de participant invalide'
  }),
  timeAllocation: z.number().min(0).max(100).optional(),
  responsibilities: z.string().max(500).optional(),
  expertise: z.string().max(200).optional(),
});

export const updateParticipantSchema = z.object({
  role: z.nativeEnum(ParticipantRole, {
    message: 'Rôle de participant invalide'
  }).optional(),
  timeAllocation: z.number().min(0).max(100).optional(),
  responsibilities: z.string().max(500).nullable().optional(),
  expertise: z.string().max(200).nullable().optional(),
  isActive: z.boolean().optional(),
});

// Schema pour les financements d'activité
export const addFundingSchema = z.object({
  fundingSource: z.string().min(2, 'Source de financement requise').max(200),
  fundingType: z.enum([
    'SUBVENTION',
    'CONTRAT',
    'PARTENARIAT',
    'BUDGET_INTERNE',
    'COOPERATION_INTERNATIONALE',
    'SECTEUR_PRIVE'
  ]),
  requestedAmount: z.number().positive('Montant requis'),
  currency: z.string().default('XOF'),
  applicationDate: dateValidation.optional(),
  startDate: dateValidation.optional(),
  endDate: dateValidation.optional(),
  conditions: z.string().max(1000).optional(),
  contractNumber: z.string().max(100).optional(),
  conventionId: z.string().cuid().optional(),
});
// Schema pour ajouter un partenaire à une activité
export const addActivityPartnerSchema = z.object({
  // Option 1 : Lier un partenaire existant
  partnerId: z.string().cuid().optional(),

  // Option 2 : Créer un nouveau partenaire
  partnerName: z.string().min(2).max(200).optional(),
  partnerType: z.string().min(2, 'Type de partenariat requis').max(100),
  contactPerson: z.string().max(200).or(z.literal('')).nullable().optional(),
  contactEmail: z.string().email().or(z.literal('')).nullable().optional(),

  // Informations sur le partenariat
  contribution: z.string().max(500).or(z.literal('')).nullable().optional(),
  benefits: z.string().max(500).or(z.literal('')).nullable().optional(),
  startDate: dateValidation.optional(),
  endDate: dateValidation.optional(),
}).refine(data => {
  // Soit partnerId, soit partnerName doit être fourni
  return data.partnerId || data.partnerName;
}, {
  message: 'Un ID de partenaire ou un nom de partenaire est requis',
  path: ['partnerId']
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

// Schema pour mettre à jour un partenaire
export const updateActivityPartnerSchema = z.object({
  partnerType: z.string().min(2).max(100).nullable().optional(),
  contribution: z.string().max(500).nullable().optional(),
  benefits: z.string().max(500).nullable().optional(),
  startDate: dateValidation.optional(),
  endDate: dateValidation.optional(),
  isActive: z.boolean().optional(),
});

// Schema pour mettre à jour un financement
export const updateFundingSchema = z.object({
  fundingSource: z.string().min(2).max(200).nullable().optional(),
  fundingType: z.enum([
    'SUBVENTION',
    'CONTRAT',
    'PARTENARIAT',
    'BUDGET_INTERNE',
    'COOPERATION_INTERNATIONALE',
    'SECTEUR_PRIVE'
  ]).optional(),
  status: z.enum([
    'DEMANDE',
    'APPROUVE',
    'REJETE',
    'EN_COURS',
    'TERMINE',
    'SUSPENDU'
  ]).optional(),
  requestedAmount: z.number().positive().nullable().optional(),
  approvedAmount: z.number().positive().nullable().optional(),
  receivedAmount: z.number().positive().nullable().optional(),
  applicationDate: dateValidation.optional(),
  approvalDate: dateValidation.optional(),
  startDate: dateValidation.optional(),
  endDate: dateValidation.optional(),
  conditions: z.string().max(1000).nullable().optional(),
  contractNumber: z.string().max(100).nullable().optional(),
  conventionId: z.string().cuid().nullable().optional(),
});

export const createTaskSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(200),
  description: z.string().max(1000).optional(),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.A_FAIRE),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.NORMALE),
  dueDate: dateValidation.optional(),
  assigneeId: z.string().cuid().optional(), // Optionnel : peut être assignée plus tard
});

export const updateTaskSchema = z.object({
  title: z.string().min(3).max(200).nullable().optional(),
  description: z.string().max(1000).nullable().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: dateValidation.optional(),
  assigneeId: z.string().cuid().nullable().optional(),
  progress: z.number().min(0).max(100).nullable().optional(),
});

// Nouveau schéma pour réassigner une tâche
export const reassignTaskSchema = z.object({
  newAssigneeId: z.string().cuid('ID utilisateur requis'),
  reason: z.string().max(500).nullable().optional(),
});

export type ReassignTaskInput = z.infer<typeof reassignTaskSchema>;

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Le commentaire ne peut pas être vide').max(2000),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1, 'Le commentaire ne peut pas être vide').max(2000),
});

// Schema pour lier un transfert d'acquis existant
export const linkKnowledgeTransferSchema = z.object({
  transferId: z.string().cuid('ID de transfert invalide'),
});

export type LinkKnowledgeTransferInput = z.infer<typeof linkKnowledgeTransferSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;

// Types TypeScript extraits des schemas
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type AddActivityPartnerInput = z.infer<typeof addActivityPartnerSchema>;
export type UpdateActivityPartnerInput = z.infer<typeof updateActivityPartnerSchema>;
export type UpdateFundingInput = z.infer<typeof updateFundingSchema>;
export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;
export type ActivityListQuery = z.infer<typeof activityListQuerySchema>;
export type ActivityRecurrenceInput = z.infer<typeof activityRecurrenceSchema>;
export type LinkFormInput = z.infer<typeof linkFormSchema>;
export type LinkDocumentInput = z.infer<typeof linkDocumentSchema>;
export type DuplicateActivityInput = z.infer<typeof duplicateActivitySchema>;
export type AddParticipantInput = z.infer<typeof addParticipantSchema>;
export type UpdateParticipantInput = z.infer<typeof updateParticipantSchema>;
export type AddFundingInput = z.infer<typeof addFundingSchema>;

// Utilitaires de validation
export const validateActivityCode = (code: string, themeCode?: string): boolean => {
  if (!themeCode) return true;
  const pattern = new RegExp(`^${themeCode}-\\d{4}-\\d{2}$`);
  return pattern.test(code);
};

export const validateDateRange = (startDate?: string, endDate?: string): boolean => {
  if (!startDate || !endDate || startDate === '' || endDate === '') return true;
  return new Date(startDate) <= new Date(endDate);
};

export const validateActivityType = (type: string): type is ActivityType => {
  return Object.values(ActivityType).includes(type as ActivityType);
};

export const validateLifecycleStatus = (status: string): status is ActivityLifecycleStatus => {
  return Object.values(ActivityLifecycleStatus).includes(status as ActivityLifecycleStatus);
};