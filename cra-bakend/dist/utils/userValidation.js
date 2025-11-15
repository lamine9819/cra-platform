"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadIndividualProfileSchema = exports.createPersonnelRequestSchema = exports.validateIndividualProfileSchema = exports.createTimeAllocationSchema = exports.userListQuerySchema = exports.assignSupervisorSchema = exports.updateIndividualProfileSchema = exports.updateUserSchema = exports.createUserSchema = void 0;
// src/utils/userValidation.ts
const zod_1 = require("zod");
// =============================================
// VALIDATION PROFIL INDIVIDUEL
// =============================================
const individualProfileSchema = zod_1.z.object({
    matricule: zod_1.z.string().min(1, 'Le matricule est requis'),
    grade: zod_1.z.string().min(1, 'Le grade est requis'),
    classe: zod_1.z.string().optional(),
    dateNaissance: zod_1.z.string().transform(str => new Date(str)),
    dateRecrutement: zod_1.z.string().transform(str => new Date(str)),
    localite: zod_1.z.string().min(1, 'Le lieu d\'affectation est requis'),
    diplome: zod_1.z.string().min(1, 'Le diplôme est requis'),
    // Validation de la répartition du temps (doit totaliser 100%)
    tempsRecherche: zod_1.z.number().min(0).max(100).default(0),
    tempsEnseignement: zod_1.z.number().min(0).max(100).default(0),
    tempsFormation: zod_1.z.number().min(0).max(100).default(0),
    tempsConsultation: zod_1.z.number().min(0).max(100).default(0),
    tempsGestionScientifique: zod_1.z.number().min(0).max(100).default(0),
    tempsAdministration: zod_1.z.number().min(0).max(100).default(0),
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
exports.createUserSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email invalide'),
    password: zod_1.z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    firstName: zod_1.z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
    lastName: zod_1.z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    role: zod_1.z.enum(['CHERCHEUR', 'COORDONATEUR_PROJET', 'ADMINISTRATEUR']),
    // Informations personnelles et professionnelles
    phoneNumber: zod_1.z.string().optional(),
    dateOfBirth: zod_1.z.string().transform(str => str ? new Date(str) : undefined).optional(),
    dateOfHire: zod_1.z.string().transform(str => str ? new Date(str) : undefined).optional(),
    diploma: zod_1.z.string().optional(),
    specialization: zod_1.z.string().optional(),
    discipline: zod_1.z.string().optional(),
    department: zod_1.z.string().optional(),
    supervisorId: zod_1.z.string().cuid().optional(),
    // IDs réseaux académiques
    orcidId: zod_1.z.string().regex(/^0000-000[1-9]-[0-9]{4}-[0-9]{4}$/).optional().or(zod_1.z.literal('')),
    researchGateId: zod_1.z.string().optional(),
    googleScholarId: zod_1.z.string().optional(),
    linkedinId: zod_1.z.string().optional(),
    // Profil individuel (optionnel - peut être créé plus tard)
    individualProfile: individualProfileSchema.optional(),
});
// =============================================
// MISE À JOUR D'UTILISATEUR
// =============================================
exports.updateUserSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2).optional(),
    lastName: zod_1.z.string().min(2).optional(),
    phoneNumber: zod_1.z.string().optional(),
    dateOfBirth: zod_1.z.string().transform(str => str ? new Date(str) : undefined).optional(),
    dateOfHire: zod_1.z.string().transform(str => str ? new Date(str) : undefined).optional(),
    diploma: zod_1.z.string().optional(),
    specialization: zod_1.z.string().optional(),
    discipline: zod_1.z.string().optional(),
    department: zod_1.z.string().optional(),
    supervisorId: zod_1.z.string().cuid().optional(),
    isActive: zod_1.z.boolean().optional(),
    // IDs réseaux académiques
    orcidId: zod_1.z.string().regex(/^0000-000[1-9]-[0-9]{4}-[0-9]{4}$/).optional().or(zod_1.z.literal('')),
    researchGateId: zod_1.z.string().optional(),
    googleScholarId: zod_1.z.string().optional(),
    linkedinId: zod_1.z.string().optional(),
    // Préférences
    notificationPrefs: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    dashboardConfig: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
});
// =============================================
// MISE À JOUR PROFIL INDIVIDUEL
// =============================================
exports.updateIndividualProfileSchema = zod_1.z.object({
    matricule: zod_1.z.string().min(1).optional(),
    grade: zod_1.z.string().min(1).optional(),
    classe: zod_1.z.string().optional(),
    localite: zod_1.z.string().min(1).optional(),
    diplome: zod_1.z.string().min(1).optional(),
    // Répartition du temps
    tempsRecherche: zod_1.z.number().min(0).max(100).optional(),
    tempsEnseignement: zod_1.z.number().min(0).max(100).optional(),
    tempsFormation: zod_1.z.number().min(0).max(100).optional(),
    tempsConsultation: zod_1.z.number().min(0).max(100).optional(),
    tempsGestionScientifique: zod_1.z.number().min(0).max(100).optional(),
    tempsAdministration: zod_1.z.number().min(0).max(100).optional(),
}).refine((data) => {
    // Si des valeurs de temps sont fournies, vérifier qu'elles totalisent 100%
    const timeKeys = ['tempsRecherche', 'tempsEnseignement', 'tempsFormation',
        'tempsConsultation', 'tempsGestionScientifique', 'tempsAdministration'];
    const timeValues = timeKeys.filter(key => data[key] !== undefined);
    if (timeValues.length > 0) {
        const total = timeKeys.reduce((sum, key) => {
            return sum + Number(data[key] || 0);
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
exports.assignSupervisorSchema = zod_1.z.object({
    supervisorId: zod_1.z.string().cuid('ID de superviseur invalide'),
});
exports.userListQuerySchema = zod_1.z.object({
    page: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(1)).optional(),
    limit: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(1).max(100)).optional(),
    role: zod_1.z.enum(['CHERCHEUR', 'COORDONATEUR_PROJET', 'ADMINISTRATEUR']).optional(),
    department: zod_1.z.string().optional(),
    discipline: zod_1.z.string().optional(),
    grade: zod_1.z.string().optional(),
    localite: zod_1.z.string().optional(),
    supervisorId: zod_1.z.string().cuid().optional(),
    isActive: zod_1.z.string().transform(val => val === 'true').optional(),
    search: zod_1.z.string().optional(),
});
exports.createTimeAllocationSchema = zod_1.z.object({
    year: zod_1.z.number().min(2020).max(2030),
    tempsRecherche: zod_1.z.number().min(0).max(100),
    tempsEnseignement: zod_1.z.number().min(0).max(100),
    tempsFormation: zod_1.z.number().min(0).max(100),
    tempsConsultation: zod_1.z.number().min(0).max(100),
    tempsGestionScientifique: zod_1.z.number().min(0).max(100),
    tempsAdministration: zod_1.z.number().min(0).max(100),
}).refine((data) => {
    const total = data.tempsRecherche + data.tempsEnseignement + data.tempsFormation +
        data.tempsConsultation + data.tempsGestionScientifique + data.tempsAdministration;
    return total === 100;
}, {
    message: "La répartition du temps doit totaliser 100%",
});
exports.validateIndividualProfileSchema = zod_1.z.object({
    year: zod_1.z.number().min(2020).max(2030).optional(),
});
exports.createPersonnelRequestSchema = zod_1.z.object({
    postType: zod_1.z.string().min(1, 'Le type de poste est requis'),
    discipline: zod_1.z.string().min(1, 'La discipline est requise'),
    profile: zod_1.z.string().min(1, 'Le profil est requis'),
    diploma: zod_1.z.string().min(1, 'Le diplôme requis est obligatoire'),
    description: zod_1.z.string().min(10, 'La description doit contenir au moins 10 caractères'),
    competencies: zod_1.z.array(zod_1.z.string()).min(1, 'Au moins une compétence est requise'),
    activities: zod_1.z.array(zod_1.z.string()).min(1, 'Au moins une activité est requise'),
    contractType: zod_1.z.string().min(1, 'Le type de contrat est requis'),
    location: zod_1.z.string().min(1, 'Le lieu d\'affectation est requis'),
    estimatedCost: zod_1.z.number().positive().optional(),
    fundingSource: zod_1.z.string().optional(),
    requestedDate: zod_1.z.string().transform(str => str ? new Date(str) : undefined).optional(),
    justification: zod_1.z.string().min(20, 'La justification doit contenir au moins 20 caractères'),
    center: zod_1.z.string().min(1, 'Le centre demandeur est requis'),
});
// =============================================
// SCHÉMAS TÉLÉCHARGEMENT FICHE INDIVIDUELLE
// =============================================
exports.downloadIndividualProfileSchema = zod_1.z.object({
    format: zod_1.z.enum(['pdf', 'word'])
        .refine((val) => ['pdf', 'word'].includes(val), {
        message: "Le format doit être 'pdf' ou 'word'",
    })
        .default('pdf'),
});
//# sourceMappingURL=userValidation.js.map