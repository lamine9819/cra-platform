// src/utils/userValidation.ts
import { z } from 'zod';

// =============================================
// VALIDATION PROFIL INDIVIDUEL
// =============================================

const individualProfileSchema = z.object({
  matricule: z.string().min(1, 'Le matricule est requis'),
  grade: z.string().min(1, 'Le grade est requis'),
  classe: z.string().optional(),
  dateNaissance: z.string().transform(str => new Date(str)),
  dateRecrutement: z.string().transform(str => new Date(str)),
  localite: z.string().min(1, 'Le lieu d\'affectation est requis'),
  diplome: z.string().min(1, 'Le diplôme est requis'),
  
  // Validation de la répartition du temps (doit totaliser 100%)
  tempsRecherche: z.number().min(0).max(100).default(0),
  tempsEnseignement: z.number().min(0).max(100).default(0),
  tempsFormation: z.number().min(0).max(100).default(0),
  tempsConsultation: z.number().min(0).max(100).default(0),
  tempsGestionScientifique: z.number().min(0).max(100).default(0),
  tempsAdministration: z.number().min(0).max(100).default(0),
}).refine((data) => {
  const total = data.tempsRecherche + data.tempsEnseignement + data.tempsFormation + 
               data.tempsConsultation + data.tempsGestionScientifique + data.tempsAdministration;
  return total === 100;
}, {
  message: "La répartition du temps doit totaliser 100%",
});

// =============================================
// CRÉATION D'UTILISATEUR
// =============================================

export const createUserSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  role: z.enum(['CHERCHEUR', 'COORDONATEUR_PROJET', 'ADMINISTRATEUR']),

  // Informations personnelles et professionnelles
  phoneNumber: z.string().optional(),
  dateOfBirth: z.string().transform(str => str ? new Date(str) : undefined).optional(),
  dateOfHire: z.string().transform(str => str ? new Date(str) : undefined).optional(),
  diploma: z.string().optional(),
  specialization: z.string().optional(),
  discipline: z.string().optional(),
  department: z.string().optional(),
  supervisorId: z.string().cuid().optional(),

  // IDs réseaux académiques
  orcidId: z.string().regex(/^0000-000[1-9]-[0-9]{4}-[0-9]{4}$/).optional().or(z.literal('')),
  researchGateId: z.string().optional(),
  googleScholarId: z.string().optional(),
  linkedinId: z.string().optional(),

  // Profil individuel (optionnel - peut être créé plus tard)
  individualProfile: individualProfileSchema.optional(),
});

// =============================================
// MISE À JOUR D'UTILISATEUR
// =============================================

export const updateUserSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phoneNumber: z.string().optional(),
  dateOfBirth: z.string().transform(str => str ? new Date(str) : undefined).optional(),
  dateOfHire: z.string().transform(str => str ? new Date(str) : undefined).optional(),
  diploma: z.string().optional(),
  specialization: z.string().optional(),
  discipline: z.string().optional(),
  department: z.string().optional(),
  supervisorId: z.string().cuid().optional(),
  isActive: z.boolean().optional(),
  
  // IDs réseaux académiques
  orcidId: z.string().regex(/^0000-000[1-9]-[0-9]{4}-[0-9]{4}$/).optional().or(z.literal('')),
  researchGateId: z.string().optional(),
  googleScholarId: z.string().optional(),
  linkedinId: z.string().optional(),
  
  // Préférences
  notificationPrefs: z.record(z.string(), z.any()).optional(),
  dashboardConfig: z.record(z.string(), z.any()).optional(),
});

// =============================================
// MISE À JOUR PROFIL INDIVIDUEL
// =============================================

export const updateIndividualProfileSchema = z.object({
  matricule: z.string().min(1).optional(),
  grade: z.string().min(1).optional(),
  classe: z.string().optional(),
  localite: z.string().min(1).optional(),
  diplome: z.string().min(1).optional(),
  
  // Répartition du temps
  tempsRecherche: z.number().min(0).max(100).optional(),
  tempsEnseignement: z.number().min(0).max(100).optional(),
  tempsFormation: z.number().min(0).max(100).optional(),
  tempsConsultation: z.number().min(0).max(100).optional(),
  tempsGestionScientifique: z.number().min(0).max(100).optional(),
  tempsAdministration: z.number().min(0).max(100).optional(),
}).refine((data) => {
  // Si des valeurs de temps sont fournies, vérifier qu'elles totalisent 100%
  const timeKeys = ['tempsRecherche', 'tempsEnseignement', 'tempsFormation', 
                   'tempsConsultation', 'tempsGestionScientifique', 'tempsAdministration'];
  const timeValues = timeKeys.filter(key => data[key as keyof typeof data] !== undefined);
  
  if (timeValues.length > 0) {
    const total = timeKeys.reduce((sum, key) => {
      return sum + Number(data[key as keyof typeof data] || 0);
    }, 0);
    
    // Si au moins une valeur de temps est fournie, toutes doivent être fournies et totaliser 100%
    if (timeValues.length < timeKeys.length || total !== 100) {
      return false;
    }
  }
  
  return true;
}, {
  message: "Si vous modifiez la répartition du temps, toutes les valeurs doivent être fournies et totaliser 100%",
});

// =============================================
// AUTRES SCHÉMAS
// =============================================

export const assignSupervisorSchema = z.object({
  supervisorId: z.string().cuid('ID de superviseur invalide'),
});

export const userListQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
  role: z.enum(['CHERCHEUR', 'COORDONATEUR_PROJET', 'ADMINISTRATEUR']).optional(),
  department: z.string().optional(),
  discipline: z.string().optional(),
  grade: z.string().optional(),
  localite: z.string().optional(),
  supervisorId: z.string().cuid().optional(),
  isActive: z.string().transform(val => val === 'true').optional(),
  search: z.string().optional(),
});

export const createTimeAllocationSchema = z.object({
  year: z.number().min(2020).max(2030),
  tempsRecherche: z.number().min(0).max(100),
  tempsEnseignement: z.number().min(0).max(100),
  tempsFormation: z.number().min(0).max(100),
  tempsConsultation: z.number().min(0).max(100),
  tempsGestionScientifique: z.number().min(0).max(100),
  tempsAdministration: z.number().min(0).max(100),
}).refine((data) => {
  const total = data.tempsRecherche + data.tempsEnseignement + data.tempsFormation + 
               data.tempsConsultation + data.tempsGestionScientifique + data.tempsAdministration;
  return total === 100;
}, {
  message: "La répartition du temps doit totaliser 100%",
});

export const validateIndividualProfileSchema = z.object({
  year: z.number().min(2020).max(2030).optional(),
});

export const createPersonnelRequestSchema = z.object({
  postType: z.string().min(1, 'Le type de poste est requis'),
  discipline: z.string().min(1, 'La discipline est requise'),
  profile: z.string().min(1, 'Le profil est requis'),
  diploma: z.string().min(1, 'Le diplôme requis est obligatoire'),
  
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  competencies: z.array(z.string()).min(1, 'Au moins une compétence est requise'),
  activities: z.array(z.string()).min(1, 'Au moins une activité est requise'),
  
  contractType: z.string().min(1, 'Le type de contrat est requis'),
  location: z.string().min(1, 'Le lieu d\'affectation est requis'),
  estimatedCost: z.number().positive().optional(),
  fundingSource: z.string().optional(),
  
  requestedDate: z.string().transform(str => str ? new Date(str) : undefined).optional(),
  justification: z.string().min(20, 'La justification doit contenir au moins 20 caractères'),
  
  center: z.string().min(1, 'Le centre demandeur est requis'),
});

// =============================================
// SCHÉMAS TÉLÉCHARGEMENT FICHE INDIVIDUELLE
// =============================================

export const downloadIndividualProfileSchema = z.object({
  format: z.enum(['pdf', 'word'])
    .refine((val) => ['pdf', 'word'].includes(val), {
      message: "Le format doit être 'pdf' ou 'word'",
    })
    .default('pdf'),
});


// =============================================
// TYPES TYPESCRIPT
// =============================================

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateIndividualProfileInput = z.infer<typeof updateIndividualProfileSchema>;
export type UserListQueryInput = z.infer<typeof userListQuerySchema>;
export type CreateTimeAllocationInput = z.infer<typeof createTimeAllocationSchema>;
export type CreatePersonnelRequestInput = z.infer<typeof createPersonnelRequestSchema>;
export type DownloadIndividualProfileInput = z.infer<typeof downloadIndividualProfileSchema>;