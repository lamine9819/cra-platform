import { z } from 'zod';
export declare const createUserSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    role: z.ZodEnum<{
        CHERCHEUR: "CHERCHEUR";
        COORDONATEUR_PROJET: "COORDONATEUR_PROJET";
        ADMINISTRATEUR: "ADMINISTRATEUR";
    }>;
    phoneNumber: z.ZodOptional<z.ZodString>;
    dateOfBirth: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<Date | undefined, string>>>;
    dateOfHire: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<Date | undefined, string>>>;
    diploma: z.ZodOptional<z.ZodString>;
    specialization: z.ZodOptional<z.ZodString>;
    discipline: z.ZodOptional<z.ZodString>;
    department: z.ZodOptional<z.ZodString>;
    supervisorId: z.ZodOptional<z.ZodString>;
    orcidId: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    researchGateId: z.ZodOptional<z.ZodString>;
    googleScholarId: z.ZodOptional<z.ZodString>;
    linkedinId: z.ZodOptional<z.ZodString>;
    individualProfile: z.ZodOptional<z.ZodObject<{
        matricule: z.ZodString;
        grade: z.ZodString;
        classe: z.ZodOptional<z.ZodString>;
        dateNaissance: z.ZodPipe<z.ZodString, z.ZodTransform<Date, string>>;
        dateRecrutement: z.ZodPipe<z.ZodString, z.ZodTransform<Date, string>>;
        localite: z.ZodString;
        diplome: z.ZodString;
        tempsRecherche: z.ZodDefault<z.ZodNumber>;
        tempsEnseignement: z.ZodDefault<z.ZodNumber>;
        tempsFormation: z.ZodDefault<z.ZodNumber>;
        tempsConsultation: z.ZodDefault<z.ZodNumber>;
        tempsGestionScientifique: z.ZodDefault<z.ZodNumber>;
        tempsAdministration: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const updateUserSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    phoneNumber: z.ZodOptional<z.ZodString>;
    dateOfBirth: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<Date | undefined, string>>>;
    dateOfHire: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<Date | undefined, string>>>;
    diploma: z.ZodOptional<z.ZodString>;
    specialization: z.ZodOptional<z.ZodString>;
    discipline: z.ZodOptional<z.ZodString>;
    department: z.ZodOptional<z.ZodString>;
    supervisorId: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    orcidId: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    researchGateId: z.ZodOptional<z.ZodString>;
    googleScholarId: z.ZodOptional<z.ZodString>;
    linkedinId: z.ZodOptional<z.ZodString>;
    notificationPrefs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    dashboardConfig: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, z.core.$strip>;
export declare const updateIndividualProfileSchema: z.ZodObject<{
    matricule: z.ZodOptional<z.ZodString>;
    grade: z.ZodOptional<z.ZodString>;
    classe: z.ZodOptional<z.ZodString>;
    localite: z.ZodOptional<z.ZodString>;
    diplome: z.ZodOptional<z.ZodString>;
    tempsRecherche: z.ZodOptional<z.ZodNumber>;
    tempsEnseignement: z.ZodOptional<z.ZodNumber>;
    tempsFormation: z.ZodOptional<z.ZodNumber>;
    tempsConsultation: z.ZodOptional<z.ZodNumber>;
    tempsGestionScientifique: z.ZodOptional<z.ZodNumber>;
    tempsAdministration: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const assignSupervisorSchema: z.ZodObject<{
    supervisorId: z.ZodString;
}, z.core.$strip>;
export declare const userListQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    limit: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    role: z.ZodOptional<z.ZodEnum<{
        CHERCHEUR: "CHERCHEUR";
        COORDONATEUR_PROJET: "COORDONATEUR_PROJET";
        ADMINISTRATEUR: "ADMINISTRATEUR";
    }>>;
    department: z.ZodOptional<z.ZodString>;
    discipline: z.ZodOptional<z.ZodString>;
    grade: z.ZodOptional<z.ZodString>;
    localite: z.ZodOptional<z.ZodString>;
    supervisorId: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<boolean, string>>>;
    search: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const createTimeAllocationSchema: z.ZodObject<{
    year: z.ZodNumber;
    tempsRecherche: z.ZodNumber;
    tempsEnseignement: z.ZodNumber;
    tempsFormation: z.ZodNumber;
    tempsConsultation: z.ZodNumber;
    tempsGestionScientifique: z.ZodNumber;
    tempsAdministration: z.ZodNumber;
}, z.core.$strip>;
export declare const validateIndividualProfileSchema: z.ZodObject<{
    year: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const createPersonnelRequestSchema: z.ZodObject<{
    postType: z.ZodString;
    discipline: z.ZodString;
    profile: z.ZodString;
    diploma: z.ZodString;
    description: z.ZodString;
    competencies: z.ZodArray<z.ZodString>;
    activities: z.ZodArray<z.ZodString>;
    contractType: z.ZodString;
    location: z.ZodString;
    estimatedCost: z.ZodOptional<z.ZodNumber>;
    fundingSource: z.ZodOptional<z.ZodString>;
    requestedDate: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<Date | undefined, string>>>;
    justification: z.ZodString;
    center: z.ZodString;
}, z.core.$strip>;
export declare const downloadIndividualProfileSchema: z.ZodObject<{
    format: z.ZodDefault<z.ZodEnum<{
        pdf: "pdf";
        word: "word";
    }>>;
}, z.core.$strip>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateIndividualProfileInput = z.infer<typeof updateIndividualProfileSchema>;
export type UserListQueryInput = z.infer<typeof userListQuerySchema>;
export type CreateTimeAllocationInput = z.infer<typeof createTimeAllocationSchema>;
export type CreatePersonnelRequestInput = z.infer<typeof createPersonnelRequestSchema>;
export type DownloadIndividualProfileInput = z.infer<typeof downloadIndividualProfileSchema>;
//# sourceMappingURL=userValidation.d.ts.map