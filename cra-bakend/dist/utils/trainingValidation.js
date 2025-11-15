"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTrainingDuration = exports.validateDateRange = exports.validateSupervisionStatus = exports.validateSupervisionType = exports.validateTrainingType = exports.supervisionListQuerySchema = exports.updateSupervisionSchema = exports.createSupervisionSchema = exports.internshipListQuerySchema = exports.updateInternshipSchema = exports.createInternshipSchema = exports.trainingListQuerySchema = exports.updateTrainingSchema = exports.createTrainingSchema = void 0;
// src/utils/trainingValidation.ts - Schémas de validation Zod
const zod_1 = require("zod");
const training_types_1 = require("../types/training.types");
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
// ================================
// SCHEMAS POUR LES FORMATIONS
// ================================
exports.createTrainingSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(200),
    description: zod_1.z.string().max(2000).optional(),
    type: zod_1.z.nativeEnum(training_types_1.TrainingType, {
        message: "Type de formation requis"
    }),
    location: zod_1.z.string().max(200).optional(),
    startDate: zod_1.z.string().refine((val) => {
        const date = new Date(val);
        return !isNaN(date.getTime());
    }, {
        message: "Date de début requise et valide"
    }),
    endDate: dateValidation.optional(),
    duration: zod_1.z.number().int().min(1).max(1000).optional(),
    objectives: zod_1.z.array(zod_1.z.string().min(1, 'Les objectifs ne peuvent pas être vides')).min(1, 'Au moins un objectif est requis'),
    // Pour formations dispensées : déclaratif
    participantCount: zod_1.z.number().int().min(1).max(1000).optional(),
    targetAudience: zod_1.z.string().max(200).optional(),
    isInternal: zod_1.z.boolean().default(true),
    organizer: zod_1.z.string().max(200).optional(),
    activityId: zod_1.z.string().cuid().optional(),
}).refine(data => {
    if (data.startDate && data.endDate && data.endDate !== '') {
        return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
}, {
    message: "La date de fin doit être postérieure à la date de début",
    path: ["endDate"]
}).refine(data => {
    // Si c'est une formation externe, l'organisateur est requis
    if (!data.isInternal && !data.organizer) {
        return false;
    }
    return true;
}, {
    message: "L'organisateur est requis pour les formations externes",
    path: ["organizer"]
});
exports.updateTrainingSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(200).optional(),
    description: zod_1.z.string().max(2000).optional().or(zod_1.z.literal('')),
    type: zod_1.z.nativeEnum(training_types_1.TrainingType).optional(),
    location: zod_1.z.string().max(200).optional().or(zod_1.z.literal('')),
    startDate: dateValidation.optional(),
    endDate: dateValidation.optional(),
    duration: zod_1.z.number().int().min(1).max(1000).optional(),
    objectives: zod_1.z.array(zod_1.z.string().min(1)).optional(),
    participantCount: zod_1.z.number().int().min(1).max(1000).optional(),
    targetAudience: zod_1.z.string().max(200).optional().or(zod_1.z.literal('')),
    isInternal: zod_1.z.boolean().optional(),
    organizer: zod_1.z.string().max(200).optional().or(zod_1.z.literal('')),
    activityId: zod_1.z.string().cuid().optional(),
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
exports.trainingListQuerySchema = zod_1.z.object({
    page: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(1)).optional(),
    limit: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(1).max(100)).optional(),
    search: zod_1.z.string().optional(),
    type: zod_1.z.nativeEnum(training_types_1.TrainingType).optional(),
    startDate: dateValidation.optional(),
    endDate: dateValidation.optional(),
    isInternal: zod_1.z.string().transform(val => val === 'true').optional(),
    activityId: zod_1.z.string().cuid().optional(),
    // Supprimé participantId car pas de gestion de participants
});
// Suppression des schémas de participants
// export const addTrainingParticipantSchema = ...
// export const updateTrainingParticipantSchema = ...
// ================================
// SCHEMAS POUR LES STAGES
// ================================
exports.createInternshipSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(200),
    description: zod_1.z.string().max(2000).optional(),
    institution: zod_1.z.string().min(2, 'Institution requise').max(200),
    startDate: zod_1.z.string().refine((val) => {
        const date = new Date(val);
        return !isNaN(date.getTime());
    }, {
        message: "Date de début requise et valide"
    }),
    endDate: zod_1.z.string().refine((val) => {
        const date = new Date(val);
        return !isNaN(date.getTime());
    }, {
        message: "Date de fin requise et valide"
    }),
    objectives: zod_1.z.array(zod_1.z.string().min(1)).min(1, 'Au moins un objectif est requis'),
    supervisorId: zod_1.z.string().cuid('Superviseur requis'),
    internId: zod_1.z.string().cuid('Stagiaire requis'),
    activityId: zod_1.z.string().cuid().optional(),
}).refine(data => {
    return new Date(data.startDate) < new Date(data.endDate);
}, {
    message: "La date de fin doit être postérieure à la date de début",
    path: ["endDate"]
});
exports.updateInternshipSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).max(200).optional(),
    description: zod_1.z.string().max(2000).optional().or(zod_1.z.literal('')),
    institution: zod_1.z.string().min(2).max(200).optional(),
    startDate: dateValidation.optional(),
    endDate: dateValidation.optional(),
    objectives: zod_1.z.array(zod_1.z.string().min(1)).optional(),
    results: zod_1.z.string().max(2000).optional().or(zod_1.z.literal('')),
    supervisorId: zod_1.z.string().cuid().optional(),
    internId: zod_1.z.string().cuid().optional(),
    activityId: zod_1.z.string().cuid().optional(),
}).refine(data => {
    if (data.startDate && data.endDate &&
        data.startDate !== '' && data.endDate !== '') {
        return new Date(data.startDate) < new Date(data.endDate);
    }
    return true;
}, {
    message: 'La date de fin doit être postérieure à la date de début',
    path: ['endDate']
});
exports.internshipListQuerySchema = zod_1.z.object({
    page: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(1)).optional(),
    limit: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(1).max(100)).optional(),
    search: zod_1.z.string().optional(),
    supervisorId: zod_1.z.string().cuid().optional(),
    internId: zod_1.z.string().cuid().optional(),
    startDate: dateValidation.optional(),
    endDate: dateValidation.optional(),
    activityId: zod_1.z.string().cuid().optional(),
});
// ================================
// SCHEMAS POUR LES SUPERVISIONS
// ================================
exports.createSupervisionSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(300),
    type: zod_1.z.nativeEnum(training_types_1.SupervisionType, {
        message: "Type de supervision requis"
    }),
    university: zod_1.z.string().min(2, 'Université requise').max(200),
    startDate: zod_1.z.string().refine((val) => {
        const date = new Date(val);
        return !isNaN(date.getTime());
    }, {
        message: "Date de début requise et valide"
    }),
    endDate: dateValidation.optional(),
    abstract: zod_1.z.string().max(3000).optional(),
    supervisorId: zod_1.z.string().cuid('Superviseur requis'),
    studentId: zod_1.z.string().cuid('Étudiant requis'),
    activityId: zod_1.z.string().cuid().optional(),
}).refine(data => {
    if (data.endDate && data.endDate !== '') {
        return new Date(data.startDate) < new Date(data.endDate);
    }
    return true;
}, {
    message: "La date de fin doit être postérieure à la date de début",
    path: ["endDate"]
});
exports.updateSupervisionSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).max(300).optional(),
    type: zod_1.z.nativeEnum(training_types_1.SupervisionType).optional(),
    university: zod_1.z.string().min(2).max(200).optional(),
    startDate: dateValidation.optional(),
    endDate: dateValidation.optional(),
    status: zod_1.z.nativeEnum(training_types_1.SupervisionStatus).optional(),
    abstract: zod_1.z.string().max(3000).optional().or(zod_1.z.literal('')),
    supervisorId: zod_1.z.string().cuid().optional(),
    studentId: zod_1.z.string().cuid().optional(),
    activityId: zod_1.z.string().cuid().optional(),
}).refine(data => {
    if (data.startDate && data.endDate &&
        data.startDate !== '' && data.endDate !== '') {
        return new Date(data.startDate) < new Date(data.endDate);
    }
    return true;
}, {
    message: 'La date de fin doit être postérieure à la date de début',
    path: ['endDate']
});
exports.supervisionListQuerySchema = zod_1.z.object({
    page: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(1)).optional(),
    limit: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(1).max(100)).optional(),
    search: zod_1.z.string().optional(),
    type: zod_1.z.nativeEnum(training_types_1.SupervisionType).optional(),
    status: zod_1.z.nativeEnum(training_types_1.SupervisionStatus).optional(),
    supervisorId: zod_1.z.string().cuid().optional(),
    studentId: zod_1.z.string().cuid().optional(),
    university: zod_1.z.string().optional(),
    startDate: dateValidation.optional(),
    endDate: dateValidation.optional(),
    activityId: zod_1.z.string().cuid().optional(),
});
// ================================
// UTILITAIRES DE VALIDATION
// ================================
const validateTrainingType = (type) => {
    return Object.values(training_types_1.TrainingType).includes(type);
};
exports.validateTrainingType = validateTrainingType;
const validateSupervisionType = (type) => {
    return Object.values(training_types_1.SupervisionType).includes(type);
};
exports.validateSupervisionType = validateSupervisionType;
const validateSupervisionStatus = (status) => {
    return Object.values(training_types_1.SupervisionStatus).includes(status);
};
exports.validateSupervisionStatus = validateSupervisionStatus;
const validateDateRange = (startDate, endDate) => {
    if (!startDate || !endDate || endDate === '')
        return true;
    return new Date(startDate) <= new Date(endDate);
};
exports.validateDateRange = validateDateRange;
const validateTrainingDuration = (startDate, endDate, duration) => {
    if (!startDate || !endDate || !duration || endDate === '')
        return true;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffHours = Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60);
    // La durée ne doit pas dépasser le nombre d'heures entre les dates
    return duration <= diffHours;
};
exports.validateTrainingDuration = validateTrainingDuration;
//# sourceMappingURL=trainingValidation.js.map