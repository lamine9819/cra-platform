import { z } from 'zod';
export declare const createFundingSchema: z.ZodObject<{
    fundingSource: z.ZodString;
    fundingType: z.ZodEnum<{
        SUBVENTION: "SUBVENTION";
        CONTRAT: "CONTRAT";
        PARTENARIAT: "PARTENARIAT";
        BUDGET_INTERNE: "BUDGET_INTERNE";
        COOPERATION_INTERNATIONALE: "COOPERATION_INTERNATIONALE";
        SECTEUR_PRIVE: "SECTEUR_PRIVE";
    }>;
    status: z.ZodOptional<z.ZodEnum<{
        DEMANDE: "DEMANDE";
        APPROUVE: "APPROUVE";
        REJETE: "REJETE";
        EN_COURS: "EN_COURS";
        TERMINE: "TERMINE";
        SUSPENDU: "SUSPENDU";
    }>>;
    requestedAmount: z.ZodNumber;
    approvedAmount: z.ZodOptional<z.ZodNumber>;
    receivedAmount: z.ZodOptional<z.ZodNumber>;
    currency: z.ZodDefault<z.ZodString>;
    applicationDate: z.ZodOptional<z.ZodString>;
    approvalDate: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    conditions: z.ZodOptional<z.ZodString>;
    reportingReqs: z.ZodOptional<z.ZodArray<z.ZodString>>;
    restrictions: z.ZodOptional<z.ZodArray<z.ZodString>>;
    contractNumber: z.ZodOptional<z.ZodString>;
    contactPerson: z.ZodOptional<z.ZodString>;
    contactEmail: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    activityId: z.ZodString;
    conventionId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateFundingSchema: z.ZodObject<{
    fundingSource: z.ZodOptional<z.ZodString>;
    fundingType: z.ZodOptional<z.ZodEnum<{
        SUBVENTION: "SUBVENTION";
        CONTRAT: "CONTRAT";
        PARTENARIAT: "PARTENARIAT";
        BUDGET_INTERNE: "BUDGET_INTERNE";
        COOPERATION_INTERNATIONALE: "COOPERATION_INTERNATIONALE";
        SECTEUR_PRIVE: "SECTEUR_PRIVE";
    }>>;
    status: z.ZodOptional<z.ZodEnum<{
        DEMANDE: "DEMANDE";
        APPROUVE: "APPROUVE";
        REJETE: "REJETE";
        EN_COURS: "EN_COURS";
        TERMINE: "TERMINE";
        SUSPENDU: "SUSPENDU";
    }>>;
    requestedAmount: z.ZodOptional<z.ZodNumber>;
    approvedAmount: z.ZodOptional<z.ZodNumber>;
    receivedAmount: z.ZodOptional<z.ZodNumber>;
    currency: z.ZodOptional<z.ZodString>;
    applicationDate: z.ZodOptional<z.ZodString>;
    approvalDate: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    conditions: z.ZodOptional<z.ZodString>;
    reportingReqs: z.ZodOptional<z.ZodArray<z.ZodString>>;
    restrictions: z.ZodOptional<z.ZodArray<z.ZodString>>;
    contractNumber: z.ZodOptional<z.ZodString>;
    contactPerson: z.ZodOptional<z.ZodString>;
    contactEmail: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    conventionId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const fundingFiltersSchema: z.ZodObject<{
    activityId: z.ZodOptional<z.ZodString>;
    fundingType: z.ZodOptional<z.ZodEnum<{
        SUBVENTION: "SUBVENTION";
        CONTRAT: "CONTRAT";
        PARTENARIAT: "PARTENARIAT";
        BUDGET_INTERNE: "BUDGET_INTERNE";
        COOPERATION_INTERNATIONALE: "COOPERATION_INTERNATIONALE";
        SECTEUR_PRIVE: "SECTEUR_PRIVE";
    }>>;
    status: z.ZodOptional<z.ZodEnum<{
        DEMANDE: "DEMANDE";
        APPROUVE: "APPROUVE";
        REJETE: "REJETE";
        EN_COURS: "EN_COURS";
        TERMINE: "TERMINE";
        SUSPENDU: "SUSPENDU";
    }>>;
    conventionId: z.ZodOptional<z.ZodString>;
    minAmount: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    maxAmount: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=funding.validation.d.ts.map