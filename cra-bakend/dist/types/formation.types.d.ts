import { z } from 'zod';
export declare const createShortTrainingReceivedSchema: z.ZodObject<{
    title: z.ZodString;
    objectives: z.ZodArray<z.ZodString>;
    location: z.ZodString;
    startDate: z.ZodString;
    endDate: z.ZodOptional<z.ZodString>;
    duration: z.ZodOptional<z.ZodNumber>;
    beneficiaries: z.ZodDefault<z.ZodArray<z.ZodString>>;
    organizer: z.ZodOptional<z.ZodString>;
    activityId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const createDiplomaticTrainingReceivedSchema: z.ZodObject<{
    studentName: z.ZodString;
    level: z.ZodString;
    specialty: z.ZodString;
    university: z.ZodString;
    startDate: z.ZodString;
    endDate: z.ZodOptional<z.ZodString>;
    period: z.ZodString;
    diplomaObtained: z.ZodDefault<z.ZodEnum<{
        EN_COURS: "EN_COURS";
        OUI: "OUI";
        NON: "NON";
    }>>;
    activityId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const createTrainingGivenSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<{
        FORMATION_COURTE: "FORMATION_COURTE";
        FORMATION_DIPLOMANTE: "FORMATION_DIPLOMANTE";
        STAGE_ADAPTATION: "STAGE_ADAPTATION";
        STAGE_RECHERCHE: "STAGE_RECHERCHE";
        ATELIER_TECHNIQUE: "ATELIER_TECHNIQUE";
        SEMINAIRE_FORMATION: "SEMINAIRE_FORMATION";
    }>;
    institution: z.ZodString;
    level: z.ZodString;
    department: z.ZodString;
    location: z.ZodOptional<z.ZodString>;
    startDate: z.ZodString;
    endDate: z.ZodOptional<z.ZodString>;
    duration: z.ZodOptional<z.ZodNumber>;
    objectives: z.ZodDefault<z.ZodArray<z.ZodString>>;
    maxParticipants: z.ZodOptional<z.ZodNumber>;
    activityId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const createSupervisionSchema: z.ZodObject<{
    title: z.ZodString;
    studentName: z.ZodString;
    type: z.ZodEnum<{
        DOCTORAT: "DOCTORAT";
        MASTER: "MASTER";
        LICENCE: "LICENCE";
        INGENIEUR: "INGENIEUR";
    }>;
    specialty: z.ZodString;
    university: z.ZodString;
    startDate: z.ZodString;
    endDate: z.ZodOptional<z.ZodString>;
    expectedDefenseDate: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<{
        EN_COURS: "EN_COURS";
        SOUTENU: "SOUTENU";
        ABANDONNE: "ABANDONNE";
    }>>;
    abstract: z.ZodOptional<z.ZodString>;
    coSupervisors: z.ZodDefault<z.ZodArray<z.ZodString>>;
    activityId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateTrainingReceivedSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    objectives: z.ZodOptional<z.ZodArray<z.ZodString>>;
    location: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    duration: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    beneficiaries: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString>>>;
    organizer: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    activityId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export declare const updateTrainingGivenSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    type: z.ZodOptional<z.ZodEnum<{
        FORMATION_COURTE: "FORMATION_COURTE";
        FORMATION_DIPLOMANTE: "FORMATION_DIPLOMANTE";
        STAGE_ADAPTATION: "STAGE_ADAPTATION";
        STAGE_RECHERCHE: "STAGE_RECHERCHE";
        ATELIER_TECHNIQUE: "ATELIER_TECHNIQUE";
        SEMINAIRE_FORMATION: "SEMINAIRE_FORMATION";
    }>>;
    institution: z.ZodOptional<z.ZodString>;
    level: z.ZodOptional<z.ZodString>;
    department: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    duration: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    objectives: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString>>>;
    maxParticipants: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    activityId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export declare const updateSupervisionSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    studentName: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<{
        DOCTORAT: "DOCTORAT";
        MASTER: "MASTER";
        LICENCE: "LICENCE";
        INGENIEUR: "INGENIEUR";
    }>>;
    specialty: z.ZodOptional<z.ZodString>;
    university: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    expectedDefenseDate: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    status: z.ZodOptional<z.ZodDefault<z.ZodEnum<{
        EN_COURS: "EN_COURS";
        SOUTENU: "SOUTENU";
        ABANDONNE: "ABANDONNE";
    }>>>;
    abstract: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    coSupervisors: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString>>>;
    activityId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export type CreateShortTrainingReceivedInput = z.infer<typeof createShortTrainingReceivedSchema>;
export type CreateDiplomaticTrainingReceivedInput = z.infer<typeof createDiplomaticTrainingReceivedSchema>;
export type CreateTrainingGivenInput = z.infer<typeof createTrainingGivenSchema>;
export type CreateSupervisionInput = z.infer<typeof createSupervisionSchema>;
export type UpdateTrainingReceivedInput = z.infer<typeof updateTrainingReceivedSchema>;
export type UpdateTrainingGivenInput = z.infer<typeof updateTrainingGivenSchema>;
export type UpdateSupervisionInput = z.infer<typeof updateSupervisionSchema>;
export interface ShortTrainingReceivedResponse {
    id: string;
    title: string;
    objectives: string[];
    location: string;
    startDate: Date;
    endDate: Date | null;
    duration: number | null;
    period?: string;
    beneficiaries: string[];
    organizer: string | null;
    createdAt: Date;
    updatedAt: Date;
    activity: {
        id: string;
        title: string;
    } | null;
}
export interface DiplomaticTrainingReceivedResponse {
    id: string;
    studentName: string;
    level: string;
    specialty: string;
    university: string;
    startDate: Date;
    endDate: Date | null;
    period: string;
    diplomaObtained: string;
    createdAt: Date;
    updatedAt: Date;
    activity: {
        id: string;
        title: string;
    } | null;
}
export interface TrainingGivenResponse {
    id: string;
    title: string;
    description: string | null;
    type: string;
    institution: string;
    level: string;
    department: string;
    location: string | null;
    startDate: Date;
    endDate: Date | null;
    duration: number | null;
    objectives: string[];
    maxParticipants: number | null;
    createdAt: Date;
    updatedAt: Date;
    activity: {
        id: string;
        title: string;
    } | null;
}
export interface SupervisionResponse {
    id: string;
    title: string;
    studentName: string;
    type: string;
    specialty: string;
    university: string;
    startDate: Date;
    endDate: Date | null;
    expectedDefenseDate?: Date;
    status: string;
    abstract: string | null;
    coSupervisors: string[];
    createdAt: Date;
    updatedAt: Date;
    activity: {
        id: string;
        title: string;
    } | null;
}
export interface FormationReport {
    user: {
        firstName: string;
        lastName: string;
        email: string;
    };
    shortTrainingsReceived: ShortTrainingReceivedResponse[];
    diplomaticTrainingsReceived: DiplomaticTrainingReceivedResponse[];
    trainingsGiven: TrainingGivenResponse[];
    supervisions: SupervisionResponse[];
}
//# sourceMappingURL=formation.types.d.ts.map