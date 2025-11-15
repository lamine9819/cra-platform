"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fundingStatusEnum = exports.fundingTypeEnum = exports.participantRoleEnum = exports.researchTypeEnum = exports.projectSearchSchema = exports.updateFundingSchema = exports.addFundingSchema = exports.updatePartnershipSchema = exports.addPartnershipSchema = exports.updateParticipantSchema = exports.addParticipantSchema = exports.projectListQuerySchema = exports.updateProjectSchema = exports.createProjectSchema = void 0;
// src/utils/projectValidation.ts
const zod_1 = require("zod");
// Validation personnalisée pour les dates
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
// ENUM pour les types de recherche
const researchTypeEnum = zod_1.z.enum([
    'RECHERCHE_FONDAMENTALE',
    'RECHERCHE_APPLIQUEE',
    'RECHERCHE_DEVELOPPEMENT',
    'PRODUCTION_SEMENCES'
]);
exports.researchTypeEnum = researchTypeEnum;
// ENUM pour les rôles de participants (adapté CRA)
const participantRoleEnum = zod_1.z.enum([
    'RESPONSABLE',
    'CO_RESPONSABLE',
    'CHERCHEUR_PRINCIPAL',
    'CHERCHEUR_ASSOCIE',
    'TECHNICIEN',
    'STAGIAIRE',
    'PARTENAIRE_EXTERNE',
    'CONSULTANT'
]);
exports.participantRoleEnum = participantRoleEnum;
// ENUM pour les types de financement
const fundingTypeEnum = zod_1.z.enum([
    'SUBVENTION',
    'CONTRAT',
    'PARTENARIAT',
    'BUDGET_INTERNE',
    'COOPERATION_INTERNATIONALE',
    'SECTEUR_PRIVE'
]);
exports.fundingTypeEnum = fundingTypeEnum;
// ENUM pour les statuts de financement
const fundingStatusEnum = zod_1.z.enum([
    'DEMANDE',
    'APPROUVE',
    'REJETE',
    'EN_COURS',
    'TERMINE',
    'SUSPENDU'
]);
exports.fundingStatusEnum = fundingStatusEnum;
exports.createProjectSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(200),
    description: zod_1.z.string().max(2000).optional(),
    objectives: zod_1.z.array(zod_1.z.string().min(1)).min(1, 'Au moins un objectif est requis'),
    status: zod_1.z.enum(['PLANIFIE', 'EN_COURS', 'SUSPENDU', 'TERMINE', 'ARCHIVE']).optional(),
    startDate: dateValidation.optional(),
    endDate: dateValidation.optional(),
    budget: zod_1.z.number().positive().optional(),
    keywords: zod_1.z.array(zod_1.z.string().min(1)).default([]),
    // NOUVEAUX CHAMPS CRA
    code: zod_1.z.string().min(1).max(50).optional(),
    themeId: zod_1.z.string().cuid('ID thème invalide'),
    researchProgramId: zod_1.z.string().cuid('ID programme invalide').optional(),
    conventionId: zod_1.z.string().cuid('ID convention invalide').optional(),
    // Cadrage stratégique
    strategicPlan: zod_1.z.string().max(100).optional(),
    strategicAxis: zod_1.z.string().max(100).optional(),
    subAxis: zod_1.z.string().max(100).optional(),
    program: zod_1.z.string().max(100).optional(),
    researchType: researchTypeEnum.optional(),
    interventionRegion: zod_1.z.string().max(100).optional(),
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
exports.updateProjectSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).max(200).optional(),
    description: zod_1.z.string().max(2000).optional(),
    objectives: zod_1.z.array(zod_1.z.string().min(1)).optional(),
    status: zod_1.z.enum(['PLANIFIE', 'EN_COURS', 'SUSPENDU', 'TERMINE', 'ARCHIVE']).optional(),
    startDate: dateValidation.optional(),
    endDate: dateValidation.optional(),
    budget: zod_1.z.number().positive().optional(),
    keywords: zod_1.z.array(zod_1.z.string().min(1)).optional(),
    // NOUVEAUX CHAMPS CRA
    themeId: zod_1.z.string().cuid('ID thème invalide').optional(),
    researchProgramId: zod_1.z.string().cuid('ID programme invalide').optional(),
    conventionId: zod_1.z.string().cuid('ID convention invalide').optional(),
    strategicPlan: zod_1.z.string().max(100).optional(),
    strategicAxis: zod_1.z.string().max(100).optional(),
    subAxis: zod_1.z.string().max(100).optional(),
    program: zod_1.z.string().max(100).optional(),
    researchType: researchTypeEnum.optional(),
    interventionRegion: zod_1.z.string().max(100).optional(),
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
exports.projectListQuerySchema = zod_1.z.object({
    page: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(1)).optional(),
    limit: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(1).max(100)).optional(),
    status: zod_1.z.enum(['PLANIFIE', 'EN_COURS', 'SUSPENDU', 'TERMINE', 'ARCHIVE']).optional(),
    creatorId: zod_1.z.string().cuid().optional(),
    search: zod_1.z.string().optional(),
    startDate: dateValidation.optional(),
    endDate: dateValidation.optional(),
    // NOUVEAUX FILTRES CRA
    themeId: zod_1.z.string().cuid().optional(),
    researchProgramId: zod_1.z.string().cuid().optional(),
    conventionId: zod_1.z.string().cuid().optional(),
    researchType: researchTypeEnum.optional(),
    interventionRegion: zod_1.z.string().optional(),
    strategicAxis: zod_1.z.string().optional(),
});
// VALIDATION ADAPTÉE POUR LES PARTICIPANTS CRA
exports.addParticipantSchema = zod_1.z.object({
    userId: zod_1.z.string().cuid('ID utilisateur invalide'),
    role: participantRoleEnum,
    timeAllocation: zod_1.z.number().min(0).max(100).optional(),
    responsibilities: zod_1.z.string().max(500).optional(),
    expertise: zod_1.z.string().max(200).optional(),
});
exports.updateParticipantSchema = zod_1.z.object({
    participantId: zod_1.z.string().cuid('ID participant invalide'),
    role: participantRoleEnum.optional(),
    timeAllocation: zod_1.z.number().min(0).max(100).optional(),
    responsibilities: zod_1.z.string().max(500).optional(),
    expertise: zod_1.z.string().max(200).optional(),
    isActive: zod_1.z.boolean().optional(),
});
// NOUVELLES VALIDATIONS POUR LES PARTENARIATS
exports.addPartnershipSchema = zod_1.z.object({
    partnerId: zod_1.z.string().cuid('ID partenaire invalide'),
    partnerType: zod_1.z.string().min(1, 'Type de partenariat requis'),
    contribution: zod_1.z.string().max(1000).optional(),
    benefits: zod_1.z.string().max(1000).optional(),
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
exports.updatePartnershipSchema = zod_1.z.object({
    partnershipId: zod_1.z.string().cuid('ID partenariat invalide'),
    partnerType: zod_1.z.string().min(1).optional(),
    contribution: zod_1.z.string().max(1000).optional(),
    benefits: zod_1.z.string().max(1000).optional(),
    endDate: dateValidation.optional(),
    isActive: zod_1.z.boolean().optional(),
});
// NOUVELLES VALIDATIONS POUR LE FINANCEMENT
exports.addFundingSchema = zod_1.z.object({
    fundingSource: zod_1.z.string().min(1, 'Source de financement requise'),
    fundingType: fundingTypeEnum,
    requestedAmount: zod_1.z.number().positive('Montant demandé doit être positif'),
    currency: zod_1.z.string().default('XOF'),
    applicationDate: dateValidation.optional(),
    startDate: dateValidation.optional(),
    endDate: dateValidation.optional(),
    conditions: zod_1.z.string().max(2000).optional(),
    contractNumber: zod_1.z.string().max(100).optional(),
    conventionId: zod_1.z.string().cuid('ID convention invalide').optional(),
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
exports.updateFundingSchema = zod_1.z.object({
    fundingId: zod_1.z.string().cuid('ID financement invalide'),
    status: fundingStatusEnum.optional(),
    approvedAmount: zod_1.z.number().positive().optional(),
    receivedAmount: zod_1.z.number().positive().optional(),
    approvalDate: dateValidation.optional(),
    conditions: zod_1.z.string().max(2000).optional(),
    notes: zod_1.z.string().max(1000).optional(),
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
exports.projectSearchSchema = zod_1.z.object({
    query: zod_1.z.string().min(1).optional(),
    themeIds: zod_1.z.array(zod_1.z.string().cuid()).optional(),
    programIds: zod_1.z.array(zod_1.z.string().cuid()).optional(),
    participantIds: zod_1.z.array(zod_1.z.string().cuid()).optional(),
    partnerIds: zod_1.z.array(zod_1.z.string().cuid()).optional(),
    budgetMin: zod_1.z.number().positive().optional(),
    budgetMax: zod_1.z.number().positive().optional(),
    dateRange: zod_1.z.object({
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
//# sourceMappingURL=projectValidation.js.map