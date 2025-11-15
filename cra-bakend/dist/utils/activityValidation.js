"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLifecycleStatus = exports.validateActivityType = exports.validateDateRange = exports.validateActivityCode = exports.linkKnowledgeTransferSchema = exports.updateCommentSchema = exports.createCommentSchema = exports.reassignTaskSchema = exports.updateTaskSchema = exports.createTaskSchema = exports.updateFundingSchema = exports.updateActivityPartnerSchema = exports.addActivityPartnerSchema = exports.addFundingSchema = exports.updateParticipantSchema = exports.addParticipantSchema = exports.duplicateActivitySchema = exports.linkDocumentSchema = exports.linkFormSchema = exports.activityRecurrenceSchema = exports.activityListQuerySchema = exports.updateActivitySchema = exports.createActivitySchema = void 0;
// src/utils/activityValidation.ts - Version CRA adaptée
const zod_1 = require("zod");
const activity_types_1 = require("../types/activity.types");
const client_1 = require("@prisma/client");
// Validation personnalisée pour les dates
const dateValidation = zod_1.z.union([
    zod_1.z.string().refine((val) => {
        if (val === '')
            return true;
        if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
            const date = new Date(val);
            return !isNaN(date.getTime());
        }
        const date = new Date(val);
        return !isNaN(date.getTime());
    }, {
        message: "Date invalide - Format attendu: YYYY-MM-DD"
    }),
    zod_1.z.literal('')
]);
// Schema pour créer une activité CRA
exports.createActivitySchema = zod_1.z.object({
    title: zod_1.z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(200),
    description: zod_1.z.string().max(2000).optional(),
    objectives: zod_1.z.array(zod_1.z.string().min(1, 'Les objectifs ne peuvent pas être vides')).min(1, 'Au moins un objectif est requis'),
    methodology: zod_1.z.string().max(2000).optional(),
    location: zod_1.z.string().max(200).optional(),
    startDate: dateValidation.optional(),
    endDate: dateValidation.optional(),
    // Champs CRA spécifiques
    code: zod_1.z.string().max(50).optional(),
    type: zod_1.z.nativeEnum(activity_types_1.ActivityType, {
        message: "Type d'activité requis"
    }),
    lifecycleStatus: zod_1.z.nativeEnum(activity_types_1.ActivityLifecycleStatus).default(activity_types_1.ActivityLifecycleStatus.NOUVELLE),
    interventionRegion: zod_1.z.string().max(100).optional(),
    strategicPlan: zod_1.z.string().max(100).optional(),
    strategicAxis: zod_1.z.string().max(100).optional(),
    subAxis: zod_1.z.string().max(100).optional(),
    // Relations CRA - thème et responsable OBLIGATOIRES
    themeId: zod_1.z.string().cuid('ID de thème requis'),
    responsibleId: zod_1.z.string().cuid('Responsable requis'),
    stationId: zod_1.z.string().cuid().optional(),
    conventionId: zod_1.z.string().cuid().optional(),
    // Le projet devient optionnel
    projectId: zod_1.z.string().cuid('ID de projet invalide').optional(),
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
    if (data.type === activity_types_1.ActivityType.FORMATION_DISPENSEE && !data.methodology) {
        return false;
    }
    return true;
}, {
    message: "La méthodologie est requise pour les activités de formation dispensée",
    path: ["methodology"]
});
// Schema pour mettre à jour une activité CRA
exports.updateActivitySchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Le titre est obligatoire').max(255).optional(),
    description: zod_1.z.string().max(1000).optional().or(zod_1.z.literal('')),
    objectives: zod_1.z.array(zod_1.z.string().min(1, 'Les objectifs ne peuvent pas être vides')).optional(),
    methodology: zod_1.z.string().max(1000).optional().or(zod_1.z.literal('')),
    location: zod_1.z.string().max(255).optional().or(zod_1.z.literal('')),
    startDate: dateValidation.optional(),
    endDate: dateValidation.optional(),
    results: zod_1.z.string().max(2000).optional().or(zod_1.z.literal('')),
    conclusions: zod_1.z.string().max(2000).optional().or(zod_1.z.literal('')),
    // Champs CRA modifiables
    code: zod_1.z.string().max(50).optional(),
    type: zod_1.z.nativeEnum(activity_types_1.ActivityType).optional(),
    lifecycleStatus: zod_1.z.nativeEnum(activity_types_1.ActivityLifecycleStatus).optional(),
    interventionRegion: zod_1.z.string().max(100).optional().or(zod_1.z.literal('')),
    strategicPlan: zod_1.z.string().max(100).optional().or(zod_1.z.literal('')),
    strategicAxis: zod_1.z.string().max(100).optional().or(zod_1.z.literal('')),
    subAxis: zod_1.z.string().max(100).optional().or(zod_1.z.literal('')),
    // Relations modifiables
    themeId: zod_1.z.string().cuid().optional(),
    responsibleId: zod_1.z.string().cuid().optional(),
    stationId: zod_1.z.string().cuid().optional(),
    conventionId: zod_1.z.string().cuid().optional(),
    projectId: zod_1.z.string().cuid().optional(),
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
exports.activityListQuerySchema = zod_1.z.object({
    page: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(1)).optional(),
    limit: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(1).max(100)).optional(),
    search: zod_1.z.string().optional(),
    startDate: dateValidation.optional(),
    endDate: dateValidation.optional(),
    hasResults: zod_1.z.string().transform(val => val === 'true').optional(),
    // Filtres CRA spécifiques
    themeId: zod_1.z.string().cuid().optional(),
    stationId: zod_1.z.string().cuid().optional(),
    responsibleId: zod_1.z.string().cuid().optional(),
    type: zod_1.z.nativeEnum(activity_types_1.ActivityType).optional(),
    status: zod_1.z.nativeEnum(activity_types_1.ActivityStatus).optional(),
    lifecycleStatus: zod_1.z.nativeEnum(activity_types_1.ActivityLifecycleStatus).optional(),
    interventionRegion: zod_1.z.string().optional(),
    withoutProject: zod_1.z.string().transform(val => val === 'true').optional(),
    isRecurrent: zod_1.z.string().transform(val => val === 'true').optional(),
    conventionId: zod_1.z.string().cuid().optional(),
    // Projet optionnel
    projectId: zod_1.z.string().cuid().optional(),
});
// Schema pour la reconduction d'activité
exports.activityRecurrenceSchema = zod_1.z.object({
    reason: zod_1.z.string().min(10, 'La raison de reconduction doit être détaillée').max(500),
    modifications: zod_1.z.array(zod_1.z.string()).optional(),
    budgetChanges: zod_1.z.string().max(500).optional(),
    teamChanges: zod_1.z.string().max(500).optional(),
    scopeChanges: zod_1.z.string().max(500).optional(),
    newTitle: zod_1.z.string().max(200).optional(),
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
exports.linkFormSchema = zod_1.z.object({
    formId: zod_1.z.string().cuid('ID de formulaire invalide'),
});
exports.linkDocumentSchema = zod_1.z.object({
    documentId: zod_1.z.string().cuid('ID de document invalide'),
});
exports.duplicateActivitySchema = zod_1.z.object({
    title: zod_1.z.string().max(255).optional(),
    newResponsibleId: zod_1.z.string().cuid().optional(), // Permettre de changer le responsable
    newThemeId: zod_1.z.string().cuid().optional(), // Permettre de changer le thème
});
// Schema pour les participants à l'activité
exports.addParticipantSchema = zod_1.z.object({
    userId: zod_1.z.string().cuid('ID utilisateur requis'),
    role: zod_1.z.nativeEnum(activity_types_1.ParticipantRole, {
        message: 'Rôle de participant invalide'
    }),
    timeAllocation: zod_1.z.number().min(0).max(100).optional(),
    responsibilities: zod_1.z.string().max(500).optional(),
    expertise: zod_1.z.string().max(200).optional(),
});
exports.updateParticipantSchema = zod_1.z.object({
    role: zod_1.z.nativeEnum(activity_types_1.ParticipantRole, {
        message: 'Rôle de participant invalide'
    }).optional(),
    timeAllocation: zod_1.z.number().min(0).max(100).optional(),
    responsibilities: zod_1.z.string().max(500).nullable().optional(),
    expertise: zod_1.z.string().max(200).nullable().optional(),
    isActive: zod_1.z.boolean().optional(),
});
// Schema pour les financements d'activité
exports.addFundingSchema = zod_1.z.object({
    fundingSource: zod_1.z.string().min(2, 'Source de financement requise').max(200),
    fundingType: zod_1.z.enum([
        'SUBVENTION',
        'CONTRAT',
        'PARTENARIAT',
        'BUDGET_INTERNE',
        'COOPERATION_INTERNATIONALE',
        'SECTEUR_PRIVE'
    ]),
    requestedAmount: zod_1.z.number().positive('Montant requis'),
    currency: zod_1.z.string().default('XOF'),
    applicationDate: dateValidation.optional(),
    startDate: dateValidation.optional(),
    endDate: dateValidation.optional(),
    conditions: zod_1.z.string().max(1000).optional(),
    contractNumber: zod_1.z.string().max(100).optional(),
    conventionId: zod_1.z.string().cuid().optional(),
});
// Schema pour ajouter un partenaire à une activité
exports.addActivityPartnerSchema = zod_1.z.object({
    // Option 1 : Lier un partenaire existant
    partnerId: zod_1.z.string().cuid().optional(),
    // Option 2 : Créer un nouveau partenaire
    partnerName: zod_1.z.string().min(2).max(200).optional(),
    partnerType: zod_1.z.string().min(2, 'Type de partenariat requis').max(100),
    contactPerson: zod_1.z.string().max(200).or(zod_1.z.literal('')).nullable().optional(),
    contactEmail: zod_1.z.string().email().or(zod_1.z.literal('')).nullable().optional(),
    // Informations sur le partenariat
    contribution: zod_1.z.string().max(500).or(zod_1.z.literal('')).nullable().optional(),
    benefits: zod_1.z.string().max(500).or(zod_1.z.literal('')).nullable().optional(),
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
exports.updateActivityPartnerSchema = zod_1.z.object({
    partnerType: zod_1.z.string().min(2).max(100).nullable().optional(),
    contribution: zod_1.z.string().max(500).nullable().optional(),
    benefits: zod_1.z.string().max(500).nullable().optional(),
    startDate: dateValidation.optional(),
    endDate: dateValidation.optional(),
    isActive: zod_1.z.boolean().optional(),
});
// Schema pour mettre à jour un financement
exports.updateFundingSchema = zod_1.z.object({
    fundingSource: zod_1.z.string().min(2).max(200).nullable().optional(),
    fundingType: zod_1.z.enum([
        'SUBVENTION',
        'CONTRAT',
        'PARTENARIAT',
        'BUDGET_INTERNE',
        'COOPERATION_INTERNATIONALE',
        'SECTEUR_PRIVE'
    ]).optional(),
    status: zod_1.z.enum([
        'DEMANDE',
        'APPROUVE',
        'REJETE',
        'EN_COURS',
        'TERMINE',
        'SUSPENDU'
    ]).optional(),
    requestedAmount: zod_1.z.number().positive().nullable().optional(),
    approvedAmount: zod_1.z.number().positive().nullable().optional(),
    receivedAmount: zod_1.z.number().positive().nullable().optional(),
    applicationDate: dateValidation.optional(),
    approvalDate: dateValidation.optional(),
    startDate: dateValidation.optional(),
    endDate: dateValidation.optional(),
    conditions: zod_1.z.string().max(1000).nullable().optional(),
    contractNumber: zod_1.z.string().max(100).nullable().optional(),
    conventionId: zod_1.z.string().cuid().nullable().optional(),
});
exports.createTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(200),
    description: zod_1.z.string().max(1000).optional(),
    status: zod_1.z.nativeEnum(client_1.TaskStatus).default(client_1.TaskStatus.A_FAIRE),
    priority: zod_1.z.nativeEnum(client_1.TaskPriority).default(client_1.TaskPriority.NORMALE),
    dueDate: dateValidation.optional(),
    assigneeId: zod_1.z.string().cuid().optional(), // Optionnel : peut être assignée plus tard
});
exports.updateTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).max(200).nullable().optional(),
    description: zod_1.z.string().max(1000).nullable().optional(),
    status: zod_1.z.nativeEnum(client_1.TaskStatus).optional(),
    priority: zod_1.z.nativeEnum(client_1.TaskPriority).optional(),
    dueDate: dateValidation.optional(),
    assigneeId: zod_1.z.string().cuid().nullable().optional(),
    progress: zod_1.z.number().min(0).max(100).nullable().optional(),
});
// Nouveau schéma pour réassigner une tâche
exports.reassignTaskSchema = zod_1.z.object({
    newAssigneeId: zod_1.z.string().cuid('ID utilisateur requis'),
    reason: zod_1.z.string().max(500).nullable().optional(),
});
exports.createCommentSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, 'Le commentaire ne peut pas être vide').max(2000),
});
exports.updateCommentSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, 'Le commentaire ne peut pas être vide').max(2000),
});
// Schema pour lier un transfert d'acquis existant
exports.linkKnowledgeTransferSchema = zod_1.z.object({
    transferId: zod_1.z.string().cuid('ID de transfert invalide'),
});
// Utilitaires de validation
const validateActivityCode = (code, themeCode) => {
    if (!themeCode)
        return true;
    const pattern = new RegExp(`^${themeCode}-\\d{4}-\\d{2}$`);
    return pattern.test(code);
};
exports.validateActivityCode = validateActivityCode;
const validateDateRange = (startDate, endDate) => {
    if (!startDate || !endDate || startDate === '' || endDate === '')
        return true;
    return new Date(startDate) <= new Date(endDate);
};
exports.validateDateRange = validateDateRange;
const validateActivityType = (type) => {
    return Object.values(activity_types_1.ActivityType).includes(type);
};
exports.validateActivityType = validateActivityType;
const validateLifecycleStatus = (status) => {
    return Object.values(activity_types_1.ActivityLifecycleStatus).includes(status);
};
exports.validateLifecycleStatus = validateLifecycleStatus;
//# sourceMappingURL=activityValidation.js.map