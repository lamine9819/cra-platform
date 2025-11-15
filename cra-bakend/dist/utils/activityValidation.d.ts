import { z } from 'zod';
import { ActivityType, ActivityLifecycleStatus, ActivityStatus, ParticipantRole } from '../types/activity.types';
export declare const createActivitySchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    objectives: z.ZodArray<z.ZodString>;
    methodology: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>;
    endDate: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>;
    code: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<typeof ActivityType>;
    lifecycleStatus: z.ZodDefault<z.ZodEnum<typeof ActivityLifecycleStatus>>;
    interventionRegion: z.ZodOptional<z.ZodString>;
    strategicPlan: z.ZodOptional<z.ZodString>;
    strategicAxis: z.ZodOptional<z.ZodString>;
    subAxis: z.ZodOptional<z.ZodString>;
    themeId: z.ZodString;
    responsibleId: z.ZodString;
    stationId: z.ZodOptional<z.ZodString>;
    conventionId: z.ZodOptional<z.ZodString>;
    projectId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateActivitySchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    objectives: z.ZodOptional<z.ZodArray<z.ZodString>>;
    methodology: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    location: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    startDate: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>;
    endDate: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>;
    results: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    conclusions: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    code: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<typeof ActivityType>>;
    lifecycleStatus: z.ZodOptional<z.ZodEnum<typeof ActivityLifecycleStatus>>;
    interventionRegion: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    strategicPlan: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    strategicAxis: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    subAxis: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    themeId: z.ZodOptional<z.ZodString>;
    responsibleId: z.ZodOptional<z.ZodString>;
    stationId: z.ZodOptional<z.ZodString>;
    conventionId: z.ZodOptional<z.ZodString>;
    projectId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const activityListQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    limit: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    search: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>;
    endDate: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>;
    hasResults: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<boolean, string>>>;
    themeId: z.ZodOptional<z.ZodString>;
    stationId: z.ZodOptional<z.ZodString>;
    responsibleId: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<typeof ActivityType>>;
    status: z.ZodOptional<z.ZodEnum<typeof ActivityStatus>>;
    lifecycleStatus: z.ZodOptional<z.ZodEnum<typeof ActivityLifecycleStatus>>;
    interventionRegion: z.ZodOptional<z.ZodString>;
    withoutProject: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<boolean, string>>>;
    isRecurrent: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<boolean, string>>>;
    conventionId: z.ZodOptional<z.ZodString>;
    projectId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const activityRecurrenceSchema: z.ZodObject<{
    reason: z.ZodString;
    modifications: z.ZodOptional<z.ZodArray<z.ZodString>>;
    budgetChanges: z.ZodOptional<z.ZodString>;
    teamChanges: z.ZodOptional<z.ZodString>;
    scopeChanges: z.ZodOptional<z.ZodString>;
    newTitle: z.ZodOptional<z.ZodString>;
    newStartDate: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>;
    newEndDate: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>;
}, z.core.$strip>;
export declare const linkFormSchema: z.ZodObject<{
    formId: z.ZodString;
}, z.core.$strip>;
export declare const linkDocumentSchema: z.ZodObject<{
    documentId: z.ZodString;
}, z.core.$strip>;
export declare const duplicateActivitySchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    newResponsibleId: z.ZodOptional<z.ZodString>;
    newThemeId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const addParticipantSchema: z.ZodObject<{
    userId: z.ZodString;
    role: z.ZodEnum<typeof ParticipantRole>;
    timeAllocation: z.ZodOptional<z.ZodNumber>;
    responsibilities: z.ZodOptional<z.ZodString>;
    expertise: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateParticipantSchema: z.ZodObject<{
    role: z.ZodOptional<z.ZodEnum<typeof ParticipantRole>>;
    timeAllocation: z.ZodOptional<z.ZodNumber>;
    responsibilities: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    expertise: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const addFundingSchema: z.ZodObject<{
    fundingSource: z.ZodString;
    fundingType: z.ZodEnum<{
        SUBVENTION: "SUBVENTION";
        CONTRAT: "CONTRAT";
        PARTENARIAT: "PARTENARIAT";
        BUDGET_INTERNE: "BUDGET_INTERNE";
        COOPERATION_INTERNATIONALE: "COOPERATION_INTERNATIONALE";
        SECTEUR_PRIVE: "SECTEUR_PRIVE";
    }>;
    requestedAmount: z.ZodNumber;
    currency: z.ZodDefault<z.ZodString>;
    applicationDate: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>;
    startDate: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>;
    endDate: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>;
    conditions: z.ZodOptional<z.ZodString>;
    contractNumber: z.ZodOptional<z.ZodString>;
    conventionId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const addActivityPartnerSchema: z.ZodObject<{
    partnerId: z.ZodOptional<z.ZodString>;
    partnerName: z.ZodOptional<z.ZodString>;
    partnerType: z.ZodString;
    contactPerson: z.ZodOptional<z.ZodNullable<z.ZodUnion<[z.ZodString, z.ZodLiteral<"">]>>>;
    contactEmail: z.ZodOptional<z.ZodNullable<z.ZodUnion<[z.ZodString, z.ZodLiteral<"">]>>>;
    contribution: z.ZodOptional<z.ZodNullable<z.ZodUnion<[z.ZodString, z.ZodLiteral<"">]>>>;
    benefits: z.ZodOptional<z.ZodNullable<z.ZodUnion<[z.ZodString, z.ZodLiteral<"">]>>>;
    startDate: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>;
    endDate: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>;
}, z.core.$strip>;
export declare const updateActivityPartnerSchema: z.ZodObject<{
    partnerType: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    contribution: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    benefits: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    startDate: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>;
    endDate: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const updateFundingSchema: z.ZodObject<{
    fundingSource: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    fundingType: z.ZodOptional<z.ZodEnum<{
        SUBVENTION: "SUBVENTION";
        CONTRAT: "CONTRAT";
        PARTENARIAT: "PARTENARIAT";
        BUDGET_INTERNE: "BUDGET_INTERNE";
        COOPERATION_INTERNATIONALE: "COOPERATION_INTERNATIONALE";
        SECTEUR_PRIVE: "SECTEUR_PRIVE";
    }>>;
    status: z.ZodOptional<z.ZodEnum<{
        EN_COURS: "EN_COURS";
        SUSPENDU: "SUSPENDU";
        TERMINE: "TERMINE";
        DEMANDE: "DEMANDE";
        APPROUVE: "APPROUVE";
        REJETE: "REJETE";
    }>>;
    requestedAmount: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    approvedAmount: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    receivedAmount: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    applicationDate: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>;
    approvalDate: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>;
    startDate: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>;
    endDate: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>;
    conditions: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    contractNumber: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    conventionId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const createTaskSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<{
        A_FAIRE: "A_FAIRE";
        EN_COURS: "EN_COURS";
        EN_REVISION: "EN_REVISION";
        TERMINEE: "TERMINEE";
        ANNULEE: "ANNULEE";
    }>>;
    priority: z.ZodDefault<z.ZodEnum<{
        BASSE: "BASSE";
        NORMALE: "NORMALE";
        HAUTE: "HAUTE";
        URGENTE: "URGENTE";
    }>>;
    dueDate: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>;
    assigneeId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateTaskSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    status: z.ZodOptional<z.ZodEnum<{
        A_FAIRE: "A_FAIRE";
        EN_COURS: "EN_COURS";
        EN_REVISION: "EN_REVISION";
        TERMINEE: "TERMINEE";
        ANNULEE: "ANNULEE";
    }>>;
    priority: z.ZodOptional<z.ZodEnum<{
        BASSE: "BASSE";
        NORMALE: "NORMALE";
        HAUTE: "HAUTE";
        URGENTE: "URGENTE";
    }>>;
    dueDate: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>;
    assigneeId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    progress: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, z.core.$strip>;
export declare const reassignTaskSchema: z.ZodObject<{
    newAssigneeId: z.ZodString;
    reason: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export type ReassignTaskInput = z.infer<typeof reassignTaskSchema>;
export declare const createCommentSchema: z.ZodObject<{
    content: z.ZodString;
}, z.core.$strip>;
export declare const updateCommentSchema: z.ZodObject<{
    content: z.ZodString;
}, z.core.$strip>;
export declare const linkKnowledgeTransferSchema: z.ZodObject<{
    transferId: z.ZodString;
}, z.core.$strip>;
export type LinkKnowledgeTransferInput = z.infer<typeof linkKnowledgeTransferSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type AddActivityPartnerInput = z.infer<typeof addActivityPartnerSchema>;
export type UpdateActivityPartnerInput = z.infer<typeof updateActivityPartnerSchema>;
export type UpdateFundingInput = z.infer<typeof updateFundingSchema>;
export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;
export type ActivityListQuery = z.infer<typeof activityListQuerySchema>;
export type ActivityRecurrenceInput = z.infer<typeof activityRecurrenceSchema>;
export type LinkFormInput = z.infer<typeof linkFormSchema>;
export type LinkDocumentInput = z.infer<typeof linkDocumentSchema>;
export type DuplicateActivityInput = z.infer<typeof duplicateActivitySchema>;
export type AddParticipantInput = z.infer<typeof addParticipantSchema>;
export type UpdateParticipantInput = z.infer<typeof updateParticipantSchema>;
export type AddFundingInput = z.infer<typeof addFundingSchema>;
export declare const validateActivityCode: (code: string, themeCode?: string) => boolean;
export declare const validateDateRange: (startDate?: string, endDate?: string) => boolean;
export declare const validateActivityType: (type: string) => type is ActivityType;
export declare const validateLifecycleStatus: (status: string) => status is ActivityLifecycleStatus;
//# sourceMappingURL=activityValidation.d.ts.map