"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.partnershipTypeEnum = exports.partnerTypeEnum = exports.updatePartnershipSchema = exports.addPartnershipSchema = exports.partnerListQuerySchema = exports.updatePartnerSchema = exports.createPartnerSchema = void 0;
// src/utils/partnerValidation.ts - VALIDATION DES DONNÉES PARTENAIRES
const zod_1 = require("zod");
// ENUM pour les types de partenaires
const partnerTypeEnum = zod_1.z.enum([
    'UNIVERSITE',
    'INSTITUT_RECHERCHE',
    'ENTREPRISE_PRIVEE',
    'ONG',
    'ORGANISME_PUBLIC',
    'ORGANISATION_INTERNATIONALE',
    'COOPERATIVE',
    'ASSOCIATION'
]);
exports.partnerTypeEnum = partnerTypeEnum;
// ENUM pour les types de partenariat
const partnershipTypeEnum = zod_1.z.enum([
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
exports.partnershipTypeEnum = partnershipTypeEnum;
// Validation des emails - accepte chaîne vide ou email valide
const emailValidation = zod_1.z.string()
    .transform(val => val === '' ? undefined : val)
    .pipe(zod_1.z.string().email('Format d\'email invalide').optional())
    .optional();
// Validation des URLs - accepte chaîne vide ou URL valide
const urlValidation = zod_1.z.string()
    .transform(val => val === '' ? undefined : val)
    .pipe(zod_1.z.string().url('Format d\'URL invalide').optional())
    .optional();
// Validation des téléphones - accepte chaîne vide ou numéro valide
const phoneValidation = zod_1.z.string()
    .transform(val => val === '' ? undefined : val)
    .pipe(zod_1.z.string().regex(/^[\+]?[0-9\s\-\(\)]{8,}$/, 'Format de téléphone invalide').optional())
    .optional();
// Validation pour créer un partenaire
exports.createPartnerSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(2, 'Le nom doit contenir au moins 2 caractères')
        .max(200, 'Le nom ne peut pas dépasser 200 caractères'),
    type: partnerTypeEnum,
    category: zod_1.z.string()
        .max(100, 'La catégorie ne peut pas dépasser 100 caractères')
        .optional(),
    description: zod_1.z.string()
        .max(2000, 'La description ne peut pas dépasser 2000 caractères')
        .optional(),
    // Informations de contact
    address: zod_1.z.string()
        .max(500, 'L\'adresse ne peut pas dépasser 500 caractères')
        .optional(),
    phone: phoneValidation,
    email: emailValidation,
    website: urlValidation,
    // Contact principal
    contactPerson: zod_1.z.string()
        .max(100, 'Le nom du contact ne peut pas dépasser 100 caractères')
        .optional(),
    contactTitle: zod_1.z.string()
        .max(100, 'Le titre du contact ne peut pas dépasser 100 caractères')
        .optional(),
    contactEmail: emailValidation,
    contactPhone: phoneValidation,
    // Domaines de compétence
    expertise: zod_1.z.array(zod_1.z.string().min(1, 'L\'expertise ne peut pas être vide'))
        .default([])
        .refine(arr => arr.length <= 20, {
        message: 'Maximum 20 domaines d\'expertise autorisés'
    }),
    services: zod_1.z.array(zod_1.z.string().min(1, 'Le service ne peut pas être vide'))
        .default([])
        .refine(arr => arr.length <= 20, {
        message: 'Maximum 20 services autorisés'
    })
});
// Validation pour mettre à jour un partenaire
exports.updatePartnerSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(2, 'Le nom doit contenir au moins 2 caractères')
        .max(200, 'Le nom ne peut pas dépasser 200 caractères')
        .optional(),
    type: partnerTypeEnum.optional(),
    category: zod_1.z.string()
        .max(100, 'La catégorie ne peut pas dépasser 100 caractères')
        .optional(),
    description: zod_1.z.string()
        .max(2000, 'La description ne peut pas dépasser 2000 caractères')
        .optional(),
    address: zod_1.z.string()
        .max(500, 'L\'adresse ne peut pas dépasser 500 caractères')
        .optional(),
    phone: phoneValidation,
    email: emailValidation,
    website: urlValidation,
    contactPerson: zod_1.z.string().max(100).optional(),
    contactTitle: zod_1.z.string().max(100).optional(),
    contactEmail: emailValidation,
    contactPhone: phoneValidation,
    expertise: zod_1.z.array(zod_1.z.string().min(1))
        .refine(arr => arr.length <= 20, {
        message: 'Maximum 20 domaines d\'expertise autorisés'
    })
        .optional(),
    services: zod_1.z.array(zod_1.z.string().min(1))
        .refine(arr => arr.length <= 20, {
        message: 'Maximum 20 services autorisés'
    })
        .optional()
});
// Validation pour les requêtes de liste de partenaires
exports.partnerListQuerySchema = zod_1.z.object({
    page: zod_1.z.string()
        .transform(Number)
        .pipe(zod_1.z.number().min(1))
        .optional(),
    limit: zod_1.z.string()
        .transform(Number)
        .pipe(zod_1.z.number().min(1).max(100))
        .optional(),
    type: partnerTypeEnum.optional(),
    category: zod_1.z.string()
        .max(100)
        .optional(),
    search: zod_1.z.string()
        .max(200)
        .optional()
});
// Validation des dates pour les partenariats
const dateValidation = zod_1.z.string()
    .transform(val => val === '' ? undefined : val)
    .pipe(zod_1.z.string()
    .refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
}, {
    message: "Date invalide"
})
    .optional())
    .optional();
// Validation pour ajouter un partenariat au projet (dans projectValidation.ts)
exports.addPartnershipSchema = zod_1.z.object({
    partnerId: zod_1.z.string().cuid('ID partenaire invalide'),
    partnerType: partnershipTypeEnum,
    contribution: zod_1.z.string()
        .max(1000, 'La contribution ne peut pas dépasser 1000 caractères')
        .optional(),
    benefits: zod_1.z.string()
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
exports.updatePartnershipSchema = zod_1.z.object({
    partnershipId: zod_1.z.string().cuid('ID partenariat invalide'),
    partnerType: partnershipTypeEnum.optional(),
    contribution: zod_1.z.string()
        .max(1000, 'La contribution ne peut pas dépasser 1000 caractères')
        .optional(),
    benefits: zod_1.z.string()
        .max(1000, 'Les bénéfices ne peuvent pas dépasser 1000 caractères')
        .optional(),
    endDate: dateValidation.optional(),
    isActive: zod_1.z.boolean().optional()
});
//# sourceMappingURL=partnerValidation.js.map