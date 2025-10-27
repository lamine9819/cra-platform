// src/utils/partnerValidation.ts - VALIDATION DES DONNÉES PARTENAIRES
import { z } from 'zod';

// ENUM pour les types de partenaires
const partnerTypeEnum = z.enum([
  'UNIVERSITE',
  'INSTITUT_RECHERCHE',
  'ENTREPRISE_PRIVEE',
  'ONG',
  'ORGANISME_PUBLIC',
  'ORGANISATION_INTERNATIONALE',
  'COOPERATIVE',
  'ASSOCIATION'
]);

// ENUM pour les types de partenariat
const partnershipTypeEnum = z.enum([
  'TECHNIQUE',
  'FINANCIER',
  'LOGISTIQUE',
  'SCIENTIFIQUE',
  'FORMATION',
  'EQUIPEMENT',
  'CONSEIL',
  'RECHERCHE_COLLABORATIVE',
  'TRANSFERT_TECHNOLOGIQUE',
  'DISSEMINATION'
]);

// Validation des emails - accepte chaîne vide ou email valide
const emailValidation = z.string()
  .transform(val => val === '' ? undefined : val)
  .pipe(z.string().email('Format d\'email invalide').optional())
  .optional();

// Validation des URLs - accepte chaîne vide ou URL valide
const urlValidation = z.string()
  .transform(val => val === '' ? undefined : val)
  .pipe(z.string().url('Format d\'URL invalide').optional())
  .optional();

// Validation des téléphones - accepte chaîne vide ou numéro valide
const phoneValidation = z.string()
  .transform(val => val === '' ? undefined : val)
  .pipe(z.string().regex(/^[\+]?[0-9\s\-\(\)]{8,}$/, 'Format de téléphone invalide').optional())
  .optional();

// Validation pour créer un partenaire
export const createPartnerSchema = z.object({
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(200, 'Le nom ne peut pas dépasser 200 caractères'),
  
  type: partnerTypeEnum,
  
  category: z.string()
    .max(100, 'La catégorie ne peut pas dépasser 100 caractères')
    .optional(),
  
  description: z.string()
    .max(2000, 'La description ne peut pas dépasser 2000 caractères')
    .optional(),
  
  // Informations de contact
  address: z.string()
    .max(500, 'L\'adresse ne peut pas dépasser 500 caractères')
    .optional(),

  phone: phoneValidation,

  email: emailValidation,
  website: urlValidation,
  
  // Contact principal
  contactPerson: z.string()
    .max(100, 'Le nom du contact ne peut pas dépasser 100 caractères')
    .optional(),
  
  contactTitle: z.string()
    .max(100, 'Le titre du contact ne peut pas dépasser 100 caractères')
    .optional(),
  
  contactEmail: emailValidation,

  contactPhone: phoneValidation,
  
  // Domaines de compétence
  expertise: z.array(z.string().min(1, 'L\'expertise ne peut pas être vide'))
    .default([])
    .refine(arr => arr.length <= 20, {
      message: 'Maximum 20 domaines d\'expertise autorisés'
    }),
  
  services: z.array(z.string().min(1, 'Le service ne peut pas être vide'))
    .default([])
    .refine(arr => arr.length <= 20, {
      message: 'Maximum 20 services autorisés'
    })
});

// Validation pour mettre à jour un partenaire
export const updatePartnerSchema = z.object({
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(200, 'Le nom ne peut pas dépasser 200 caractères')
    .optional(),
  
  type: partnerTypeEnum.optional(),
  
  category: z.string()
    .max(100, 'La catégorie ne peut pas dépasser 100 caractères')
    .optional(),
  
  description: z.string()
    .max(2000, 'La description ne peut pas dépasser 2000 caractères')
    .optional(),
  
  address: z.string()
    .max(500, 'L\'adresse ne peut pas dépasser 500 caractères')
    .optional(),

  phone: phoneValidation,

  email: emailValidation,
  website: urlValidation,
  contactPerson: z.string().max(100).optional(),
  contactTitle: z.string().max(100).optional(),
  contactEmail: emailValidation,
  contactPhone: phoneValidation,
  
  expertise: z.array(z.string().min(1))
    .refine(arr => arr.length <= 20, {
      message: 'Maximum 20 domaines d\'expertise autorisés'
    })
    .optional(),
  
  services: z.array(z.string().min(1))
    .refine(arr => arr.length <= 20, {
      message: 'Maximum 20 services autorisés'
    })
    .optional()
});

// Validation pour les requêtes de liste de partenaires
export const partnerListQuerySchema = z.object({
  page: z.string()
    .transform(Number)
    .pipe(z.number().min(1))
    .optional(),
  
  limit: z.string()
    .transform(Number)
    .pipe(z.number().min(1).max(100))
    .optional(),
  
  type: partnerTypeEnum.optional(),
  
  category: z.string()
    .max(100)
    .optional(),
  
  search: z.string()
    .max(200)
    .optional()
});

// Validation des dates pour les partenariats
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

// Validation pour ajouter un partenariat au projet (dans projectValidation.ts)
export const addPartnershipSchema = z.object({
  partnerId: z.string().cuid('ID partenaire invalide'),
  
  partnerType: partnershipTypeEnum,
  
  contribution: z.string()
    .max(1000, 'La contribution ne peut pas dépasser 1000 caractères')
    .optional(),
  
  benefits: z.string()
    .max(1000, 'Les bénéfices ne peuvent pas dépasser 1000 caractères')
    .optional(),
  
  startDate: dateValidation.optional(),
  endDate: dateValidation.optional()
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

// Validation pour mettre à jour un partenariat
export const updatePartnershipSchema = z.object({
  partnershipId: z.string().cuid('ID partenariat invalide'),
  
  partnerType: partnershipTypeEnum.optional(),
  
  contribution: z.string()
    .max(1000, 'La contribution ne peut pas dépasser 1000 caractères')
    .optional(),
  
  benefits: z.string()
    .max(1000, 'Les bénéfices ne peuvent pas dépasser 1000 caractères')
    .optional(),
  
  endDate: dateValidation.optional(),
  
  isActive: z.boolean().optional()
});

// Export des énumérations pour réutilisation
export { 
  partnerTypeEnum, 
  partnershipTypeEnum 
};