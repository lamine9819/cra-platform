import { z } from 'zod';
declare const researchTypeEnum: z.ZodEnum<{
    RECHERCHE_DEVELOPPEMENT: "RECHERCHE_DEVELOPPEMENT";
    PRODUCTION_SEMENCES: "PRODUCTION_SEMENCES";
    RECHERCHE_FONDAMENTALE: "RECHERCHE_FONDAMENTALE";
    RECHERCHE_APPLIQUEE: "RECHERCHE_APPLIQUEE";
}>;
declare const participantRoleEnum: z.ZodEnum<{
    RESPONSABLE: "RESPONSABLE";
    CO_RESPONSABLE: "CO_RESPONSABLE";
    CHERCHEUR_PRINCIPAL: "CHERCHEUR_PRINCIPAL";
    CHERCHEUR_ASSOCIE: "CHERCHEUR_ASSOCIE";
    TECHNICIEN: "TECHNICIEN";
    STAGIAIRE: "STAGIAIRE";
    PARTENAIRE_EXTERNE: "PARTENAIRE_EXTERNE";
    CONSULTANT: "CONSULTANT";
}>;
declare const fundingTypeEnum: z.ZodEnum<{
    SUBVENTION: "SUBVENTION";
    CONTRAT: "CONTRAT";
    PARTENARIAT: "PARTENARIAT";
    BUDGET_INTERNE: "BUDGET_INTERNE";
    COOPERATION_INTERNATIONALE: "COOPERATION_INTERNATIONALE";
    SECTEUR_PRIVE: "SECTEUR_PRIVE";
}>;
declare const fundingStatusEnum: z.ZodEnum<{
    EN_COURS: "EN_COURS";
    SUSPENDU: "SUSPENDU";
    TERMINE: "TERMINE";
    DEMANDE: "DEMANDE";
    APPROUVE: "APPROUVE";
    REJETE: "REJETE";
}>;
export declare const createProjectSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    objectives: z.ZodArray<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        PLANIFIE: "PLANIFIE";
        EN_COURS: "EN_COURS";
        SUSPENDU: "SUSPENDU";
        TERMINE: "TERMINE";
        ARCHIVE: "ARCHIVE";
    }>>;
    startDate: z.ZodOptional<z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string | undefined, string>>, z.ZodOptional<z.ZodString>>>>;
    endDate: z.ZodOptional<z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string | undefined, string>>, z.ZodOptional<z.ZodString>>>>;
    budget: z.ZodOptional<z.ZodNumber>;
    keywords: z.ZodDefault<z.ZodArray<z.ZodString>>;
    code: z.ZodOptional<z.ZodString>;
    themeId: z.ZodString;
    researchProgramId: z.ZodOptional<z.ZodString>;
    conventionId: z.ZodOptional<z.ZodString>;
    strategicPlan: z.ZodOptional<z.ZodString>;
    strategicAxis: z.ZodOptional<z.ZodString>;
    subAxis: z.ZodOptional<z.ZodString>;
    program: z.ZodOptional<z.ZodString>;
    researchType: z.ZodOptional<z.ZodEnum<{
        RECHERCHE_DEVELOPPEMENT: "RECHERCHE_DEVELOPPEMENT";
        PRODUCTION_SEMENCES: "PRODUCTION_SEMENCES";
        RECHERCHE_FONDAMENTALE: "RECHERCHE_FONDAMENTALE";
        RECHERCHE_APPLIQUEE: "RECHERCHE_APPLIQUEE";
    }>>;
    interventionRegion: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateProjectSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    objectives: z.ZodOptional<z.ZodArray<z.ZodString>>;
    status: z.ZodOptional<z.ZodEnum<{
        PLANIFIE: "PLANIFIE";
        EN_COURS: "EN_COURS";
        SUSPENDU: "SUSPENDU";
        TERMINE: "TERMINE";
        ARCHIVE: "ARCHIVE";
    }>>;
    startDate: z.ZodOptional<z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string | undefined, string>>, z.ZodOptional<z.ZodString>>>>;
    endDate: z.ZodOptional<z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string | undefined, string>>, z.ZodOptional<z.ZodString>>>>;
    budget: z.ZodOptional<z.ZodNumber>;
    keywords: z.ZodOptional<z.ZodArray<z.ZodString>>;
    themeId: z.ZodOptional<z.ZodString>;
    researchProgramId: z.ZodOptional<z.ZodString>;
    conventionId: z.ZodOptional<z.ZodString>;
    strategicPlan: z.ZodOptional<z.ZodString>;
    strategicAxis: z.ZodOptional<z.ZodString>;
    subAxis: z.ZodOptional<z.ZodString>;
    program: z.ZodOptional<z.ZodString>;
    researchType: z.ZodOptional<z.ZodEnum<{
        RECHERCHE_DEVELOPPEMENT: "RECHERCHE_DEVELOPPEMENT";
        PRODUCTION_SEMENCES: "PRODUCTION_SEMENCES";
        RECHERCHE_FONDAMENTALE: "RECHERCHE_FONDAMENTALE";
        RECHERCHE_APPLIQUEE: "RECHERCHE_APPLIQUEE";
    }>>;
    interventionRegion: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const projectListQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    limit: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    status: z.ZodOptional<z.ZodEnum<{
        PLANIFIE: "PLANIFIE";
        EN_COURS: "EN_COURS";
        SUSPENDU: "SUSPENDU";
        TERMINE: "TERMINE";
        ARCHIVE: "ARCHIVE";
    }>>;
    creatorId: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string | undefined, string>>, z.ZodOptional<z.ZodString>>>>;
    endDate: z.ZodOptional<z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string | undefined, string>>, z.ZodOptional<z.ZodString>>>>;
    themeId: z.ZodOptional<z.ZodString>;
    researchProgramId: z.ZodOptional<z.ZodString>;
    conventionId: z.ZodOptional<z.ZodString>;
    researchType: z.ZodOptional<z.ZodEnum<{
        RECHERCHE_DEVELOPPEMENT: "RECHERCHE_DEVELOPPEMENT";
        PRODUCTION_SEMENCES: "PRODUCTION_SEMENCES";
        RECHERCHE_FONDAMENTALE: "RECHERCHE_FONDAMENTALE";
        RECHERCHE_APPLIQUEE: "RECHERCHE_APPLIQUEE";
    }>>;
    interventionRegion: z.ZodOptional<z.ZodString>;
    strategicAxis: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const addParticipantSchema: z.ZodObject<{
    userId: z.ZodString;
    role: z.ZodEnum<{
        RESPONSABLE: "RESPONSABLE";
        CO_RESPONSABLE: "CO_RESPONSABLE";
        CHERCHEUR_PRINCIPAL: "CHERCHEUR_PRINCIPAL";
        CHERCHEUR_ASSOCIE: "CHERCHEUR_ASSOCIE";
        TECHNICIEN: "TECHNICIEN";
        STAGIAIRE: "STAGIAIRE";
        PARTENAIRE_EXTERNE: "PARTENAIRE_EXTERNE";
        CONSULTANT: "CONSULTANT";
    }>;
    timeAllocation: z.ZodOptional<z.ZodNumber>;
    responsibilities: z.ZodOptional<z.ZodString>;
    expertise: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateParticipantSchema: z.ZodObject<{
    participantId: z.ZodString;
    role: z.ZodOptional<z.ZodEnum<{
        RESPONSABLE: "RESPONSABLE";
        CO_RESPONSABLE: "CO_RESPONSABLE";
        CHERCHEUR_PRINCIPAL: "CHERCHEUR_PRINCIPAL";
        CHERCHEUR_ASSOCIE: "CHERCHEUR_ASSOCIE";
        TECHNICIEN: "TECHNICIEN";
        STAGIAIRE: "STAGIAIRE";
        PARTENAIRE_EXTERNE: "PARTENAIRE_EXTERNE";
        CONSULTANT: "CONSULTANT";
    }>>;
    timeAllocation: z.ZodOptional<z.ZodNumber>;
    responsibilities: z.ZodOptional<z.ZodString>;
    expertise: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const addPartnershipSchema: z.ZodObject<{
    partnerId: z.ZodString;
    partnerType: z.ZodString;
    contribution: z.ZodOptional<z.ZodString>;
    benefits: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string | undefined, string>>, z.ZodOptional<z.ZodString>>>>;
    endDate: z.ZodOptional<z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string | undefined, string>>, z.ZodOptional<z.ZodString>>>>;
}, z.core.$strip>;
export declare const updatePartnershipSchema: z.ZodObject<{
    partnershipId: z.ZodString;
    partnerType: z.ZodOptional<z.ZodString>;
    contribution: z.ZodOptional<z.ZodString>;
    benefits: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string | undefined, string>>, z.ZodOptional<z.ZodString>>>>;
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
    applicationDate: z.ZodOptional<z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string | undefined, string>>, z.ZodOptional<z.ZodString>>>>;
    startDate: z.ZodOptional<z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string | undefined, string>>, z.ZodOptional<z.ZodString>>>>;
    endDate: z.ZodOptional<z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string | undefined, string>>, z.ZodOptional<z.ZodString>>>>;
    conditions: z.ZodOptional<z.ZodString>;
    contractNumber: z.ZodOptional<z.ZodString>;
    conventionId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateFundingSchema: z.ZodObject<{
    fundingId: z.ZodString;
    status: z.ZodOptional<z.ZodEnum<{
        EN_COURS: "EN_COURS";
        SUSPENDU: "SUSPENDU";
        TERMINE: "TERMINE";
        DEMANDE: "DEMANDE";
        APPROUVE: "APPROUVE";
        REJETE: "REJETE";
    }>>;
    approvedAmount: z.ZodOptional<z.ZodNumber>;
    receivedAmount: z.ZodOptional<z.ZodNumber>;
    approvalDate: z.ZodOptional<z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string | undefined, string>>, z.ZodOptional<z.ZodString>>>>;
    conditions: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const projectSearchSchema: z.ZodObject<{
    query: z.ZodOptional<z.ZodString>;
    themeIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    programIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    participantIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    partnerIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    budgetMin: z.ZodOptional<z.ZodNumber>;
    budgetMax: z.ZodOptional<z.ZodNumber>;
    dateRange: z.ZodOptional<z.ZodObject<{
        start: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string | undefined, string>>, z.ZodOptional<z.ZodString>>>;
        end: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string | undefined, string>>, z.ZodOptional<z.ZodString>>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export { researchTypeEnum, participantRoleEnum, fundingTypeEnum, fundingStatusEnum };
//# sourceMappingURL=projectValidation.d.ts.map