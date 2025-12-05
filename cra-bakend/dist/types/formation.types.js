"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSupervisionSchema = exports.updateTrainingGivenSchema = exports.updateTrainingReceivedSchema = exports.createSupervisionSchema = exports.createTrainingGivenSchema = exports.createDiplomaticTrainingReceivedSchema = exports.createShortTrainingReceivedSchema = void 0;
// types/formation.types.ts
const zod_1 = require("zod");
// Schéma de validation pour créer une formation courte reçue
exports.createShortTrainingReceivedSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "Le titre est requis"), // Intitulé de la formation
    objectives: zod_1.z.array(zod_1.z.string()).min(1, "Au moins un objectif est requis"), // Objectifs de la formation
    location: zod_1.z.string().min(1, "Le lieu est requis"), // Lieu
    startDate: zod_1.z.string().min(1, "Date de début requise").refine((date) => {
        // Accepter format YYYY-MM-DD ou ISO datetime
        return /^\d{4}-\d{2}-\d{2}(T.*)?$/.test(date);
    }, "Format de date invalide"),
    endDate: zod_1.z.string().optional().refine((date) => {
        // Si la date est fournie, vérifier le format
        return !date || /^\d{4}-\d{2}-\d{2}(T.*)?$/.test(date);
    }, "Format de date invalide"),
    duration: zod_1.z.number().int().positive("La durée doit être positive").optional(), // Période ou durée
    beneficiaries: zod_1.z.array(zod_1.z.string()).default([]), // Chercheurs bénéficiaires (si plusieurs)
    organizer: zod_1.z.string().optional(), // Organisme organisateur
    activityId: zod_1.z.string().optional(),
});
// Schéma de validation pour créer une formation diplômante reçue
exports.createDiplomaticTrainingReceivedSchema = zod_1.z.object({
    studentName: zod_1.z.string().min(1, "Le nom de l'étudiant est requis"), // Prénom et nom
    level: zod_1.z.string().min(1, "Le niveau est requis"), // Niveau
    specialty: zod_1.z.string().min(1, "La spécialité est requise"), // Spécialité
    university: zod_1.z.string().min(1, "L'université est requise"), // Universités / Écoles
    startDate: zod_1.z.string().min(1, "Date de début requise").refine((date) => {
        return /^\d{4}-\d{2}-\d{2}(T.*)?$/.test(date);
    }, "Format de date invalide"),
    endDate: zod_1.z.string().optional().refine((date) => {
        return !date || /^\d{4}-\d{2}-\d{2}(T.*)?$/.test(date);
    }, "Format de date invalide"),
    period: zod_1.z.string().min(1, "La période est requise"), // Période (format texte comme "2022-2024")
    diplomaObtained: zod_1.z.enum(['OUI', 'NON', 'EN_COURS']).default('EN_COURS'), // Obtention du diplôme
    activityId: zod_1.z.string().optional(),
});
// Schéma de validation pour créer une formation dispensée
exports.createTrainingGivenSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "Le titre est requis"),
    description: zod_1.z.string().optional(),
    type: zod_1.z.enum(['FORMATION_COURTE', 'FORMATION_DIPLOMANTE', 'STAGE_ADAPTATION', 'STAGE_RECHERCHE', 'ATELIER_TECHNIQUE', 'SEMINAIRE_FORMATION']),
    institution: zod_1.z.string().min(1, "L'institution est requise"),
    level: zod_1.z.string().min(1, "Le niveau est requis"),
    department: zod_1.z.string().min(1, "Le département/faculté est requis"),
    location: zod_1.z.string().optional(),
    startDate: zod_1.z.string().min(1, "Date de début requise").refine((date) => {
        return /^\d{4}-\d{2}-\d{2}(T.*)?$/.test(date);
    }, "Format de date invalide"),
    endDate: zod_1.z.string().optional().refine((date) => {
        return !date || /^\d{4}-\d{2}-\d{2}(T.*)?$/.test(date);
    }, "Format de date invalide"),
    duration: zod_1.z.number().int().positive("La durée doit être positive").optional(),
    objectives: zod_1.z.array(zod_1.z.string()).default([]),
    maxParticipants: zod_1.z.number().int().positive().optional(),
    activityId: zod_1.z.string().optional(),
});
// Schéma de validation pour créer un encadrement
exports.createSupervisionSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "Le titre est requis"),
    studentName: zod_1.z.string().min(1, "Le nom de l'étudiant est requis"),
    type: zod_1.z.enum(['DOCTORAT', 'MASTER', 'LICENCE', 'INGENIEUR']),
    specialty: zod_1.z.string().min(1, "La spécialité est requise"),
    university: zod_1.z.string().min(1, "L'université est requise"),
    startDate: zod_1.z.string().min(1, "Date de début requise").refine((date) => {
        return /^\d{4}-\d{2}-\d{2}(T.*)?$/.test(date);
    }, "Format de date invalide"),
    endDate: zod_1.z.string().optional().refine((date) => {
        return !date || /^\d{4}-\d{2}-\d{2}(T.*)?$/.test(date);
    }, "Format de date invalide"),
    expectedDefenseDate: zod_1.z.string().optional().refine((date) => {
        return !date || /^\d{4}-\d{2}-\d{2}(T.*)?$/.test(date);
    }, "Format de date invalide"),
    status: zod_1.z.enum(['EN_COURS', 'SOUTENU', 'ABANDONNE']).default('EN_COURS'),
    abstract: zod_1.z.string().optional(),
    coSupervisors: zod_1.z.array(zod_1.z.string()).default([]),
    activityId: zod_1.z.string().optional(),
});
// Schéma de validation pour la mise à jour
exports.updateTrainingReceivedSchema = exports.createShortTrainingReceivedSchema.partial();
exports.updateTrainingGivenSchema = exports.createTrainingGivenSchema.partial();
exports.updateSupervisionSchema = exports.createSupervisionSchema.partial();
//# sourceMappingURL=formation.types.js.map