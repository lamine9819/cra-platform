// src/utils/projectValidation.ts
import { z } from 'zod';

// Validation personnalisée pour les dates
const dateValidation = z.string()
  .transform(val => val === '' ? undefined : val)
  .pipe(
    z.string()
      .refine((val) => {
        const date = new Date(val);
        return !isNaN(date.getTime());
      }, {
        message: "Date invalide"
      })
      .optional()
  )
  .optional();

// ENUM pour les types de recherche
const researchTypeEnum = z.enum([
  'RECHERCHE_FONDAMENTALE',
  'RECHERCHE_APPLIQUEE', 
  'RECHERCHE_DEVELOPPEMENT',
  'PRODUCTION_SEMENCES'
]);

// ENUM pour les rôles de participants (adapté CRA)
const participantRoleEnum = z.enum([
  'RESPONSABLE',
  'CO_RESPONSABLE',
  'CHERCHEUR_PRINCIPAL',
  'CHERCHEUR_ASSOCIE',
  'TECHNICIEN',
  'STAGIAIRE',
  'PARTENAIRE_EXTERNE',
  'CONSULTANT'
]);

// ENUM pour les types de financement
const fundingTypeEnum = z.enum([
  'SUBVENTION',
  'CONTRAT',
  'PARTENARIAT',
  'BUDGET_INTERNE',
  'COOPERATION_INTERNATIONALE',
  'SECTEUR_PRIVE'
]);

// ENUM pour les statuts de financement
const fundingStatusEnum = z.enum([
  'DEMANDE',
  'APPROUVE',
  'REJETE',
  'EN_COURS',
  'TERMINE',
  'SUSPENDU'
]);

export const createProjectSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(200),
  description: z.string().max(2000).optional(),
  objectives: z.array(z.string().min(1)).min(1, 'Au moins un objectif est requis'),
  status: z.enum(['PLANIFIE', 'EN_COURS', 'SUSPENDU', 'TERMINE', 'ARCHIVE']).optional(),
  startDate: dateValidation.optional(),
  endDate: dateValidation.optional(),
  budget: z.number().positive().optional(),
  keywords: z.array(z.string().min(1)).default([]),

  // NOUVEAUX CHAMPS CRA
  code: z.string().min(1).max(50).optional(),
  themeId: z.string().cuid('ID thème invalide'),
  researchProgramId: z.string().cuid('ID programme invalide').optional(),
  conventionId: z.string().cuid('ID convention invalide').optional(),

  // Cadrage stratégique
  strategicPlan: z.string().max(100).optional(),
  strategicAxis: z.string().max(100).optional(),
  subAxis: z.string().max(100).optional(),
  program: z.string().max(100).optional(),

  researchType: researchTypeEnum.optional(),
  interventionRegion: z.string().max(100).optional(),
}).refine(data => {
  // Vérifier que les dates ne sont pas vides et sont valides
  if (data.startDate && data.startDate !== '' && data.endDate && data.endDate !== '') {
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
  
  // NOUVEAUX CHAMPS CRA
  themeId: z.string().cuid('ID thème invalide').optional(),
  researchProgramId: z.string().cuid('ID programme invalide').optional(),
  conventionId: z.string().cuid('ID convention invalide').optional(),
  strategicPlan: z.string().max(100).optional(),
  strategicAxis: z.string().max(100).optional(),
  subAxis: z.string().max(100).optional(),
  program: z.string().max(100).optional(),
  researchType: researchTypeEnum.optional(),
  interventionRegion: z.string().max(100).optional(),
}).refine(data => {
  // Vérifier que les dates ne sont pas vides et sont valides
  if (data.startDate && data.startDate !== '' && data.endDate && data.endDate !== '') {
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
  creatorId: z.string().cuid().optional(),
  search: z.string().optional(),
  startDate: dateValidation.optional(),
  endDate: dateValidation.optional(),
  
  // NOUVEAUX FILTRES CRA
  themeId: z.string().cuid().optional(),
  researchProgramId: z.string().cuid().optional(),
  conventionId: z.string().cuid().optional(),
  researchType: researchTypeEnum.optional(),
  interventionRegion: z.string().optional(),
  strategicAxis: z.string().optional(),
});

// VALIDATION ADAPTÉE POUR LES PARTICIPANTS CRA
export const addParticipantSchema = z.object({
  userId: z.string().cuid('ID utilisateur invalide'),
  role: participantRoleEnum,
  timeAllocation: z.number().min(0).max(100).optional(),
  responsibilities: z.string().max(500).optional(),
  expertise: z.string().max(200).optional(),
});

export const updateParticipantSchema = z.object({
  participantId: z.string().cuid('ID participant invalide'),
  role: participantRoleEnum.optional(),
  timeAllocation: z.number().min(0).max(100).optional(),
  responsibilities: z.string().max(500).optional(),
  expertise: z.string().max(200).optional(),
  isActive: z.boolean().optional(),
});

// NOUVELLES VALIDATIONS POUR LES PARTENARIATS
export const addPartnershipSchema = z.object({
  partnerId: z.string().cuid('ID partenaire invalide'),
  partnerType: z.string().min(1, 'Type de partenariat requis'),
  contribution: z.string().max(1000).optional(),
  benefits: z.string().max(1000).optional(),
  startDate: dateValidation.optional(),
  endDate: dateValidation.optional(),
}).refine(data => {
  // Vérifier que les dates ne sont pas vides et sont valides
  if (data.startDate && data.startDate !== '' && data.endDate && data.endDate !== '') {
    return new Date(data.startDate) < new Date(data.endDate);
  }
  return true;
}, {
  message: "La date de fin doit être postérieure à la date de début",
  path: ["endDate"]
});

export const updatePartnershipSchema = z.object({
  partnershipId: z.string().cuid('ID partenariat invalide'),
  partnerType: z.string().min(1).optional(),
  contribution: z.string().max(1000).optional(),
  benefits: z.string().max(1000).optional(),
  endDate: dateValidation.optional(),
  isActive: z.boolean().optional(),
});

// NOUVELLES VALIDATIONS POUR LE FINANCEMENT
export const addFundingSchema = z.object({
  fundingSource: z.string().min(1, 'Source de financement requise'),
  fundingType: fundingTypeEnum,
  requestedAmount: z.number().positive('Montant demandé doit être positif'),
  currency: z.string().default('XOF'),
  applicationDate: dateValidation.optional(),
  startDate: dateValidation.optional(),
  endDate: dateValidation.optional(),
  conditions: z.string().max(2000).optional(),
  contractNumber: z.string().max(100).optional(),
  conventionId: z.string().cuid('ID convention invalide').optional(),
}).refine(data => {
  // Vérifier que les dates ne sont pas vides et sont valides
  if (data.startDate && data.startDate !== '' && data.endDate && data.endDate !== '') {
    return new Date(data.startDate) < new Date(data.endDate);
  }
  return true;
}, {
  message: "La date de fin doit être postérieure à la date de début",
  path: ["endDate"]
});

export const updateFundingSchema = z.object({
  fundingId: z.string().cuid('ID financement invalide'),
  status: fundingStatusEnum.optional(),
  approvedAmount: z.number().positive().optional(),
  receivedAmount: z.number().positive().optional(),
  approvalDate: dateValidation.optional(),
  conditions: z.string().max(2000).optional(),
  notes: z.string().max(1000).optional(),
}).refine(data => {
  // Vérifier que le montant reçu ne dépasse pas le montant approuvé
  if (data.approvedAmount && data.receivedAmount) {
    return data.receivedAmount <= data.approvedAmount;
  }
  return true;
}, {
  message: "Le montant reçu ne peut pas dépasser le montant approuvé",
  path: ["receivedAmount"]
});

// Validation pour la recherche et les filtres avancés
export const projectSearchSchema = z.object({
  query: z.string().min(1).optional(),
  themeIds: z.array(z.string().cuid()).optional(),
  programIds: z.array(z.string().cuid()).optional(),
  participantIds: z.array(z.string().cuid()).optional(),
  partnerIds: z.array(z.string().cuid()).optional(),
  budgetMin: z.number().positive().optional(),
  budgetMax: z.number().positive().optional(),
  dateRange: z.object({
    start: dateValidation,
    end: dateValidation
  }).optional(),
}).refine(data => {
  if (data.budgetMin && data.budgetMax) {
    return data.budgetMin <= data.budgetMax;
  }
  return true;
}, {
  message: "Le budget minimum ne peut pas être supérieur au budget maximum",
  path: ["budgetMax"]
});

// Export des énumérations pour réutilisation
export { researchTypeEnum, participantRoleEnum, fundingTypeEnum, fundingStatusEnum };