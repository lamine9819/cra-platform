import { z } from 'zod';
export declare const createKnowledgeTransferSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<{
        FICHE_TECHNIQUE: "FICHE_TECHNIQUE";
        DEMONSTRATION: "DEMONSTRATION";
        FORMATION_PRODUCTEUR: "FORMATION_PRODUCTEUR";
        VISITE_GUIDEE: "VISITE_GUIDEE";
        EMISSION_RADIO: "EMISSION_RADIO";
        REPORTAGE_TV: "REPORTAGE_TV";
        PUBLICATION_VULGARISATION: "PUBLICATION_VULGARISATION";
        SITE_WEB: "SITE_WEB";
        RESEAUX_SOCIAUX: "RESEAUX_SOCIAUX";
    }>;
    targetAudience: z.ZodArray<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    date: z.ZodString;
    participants: z.ZodOptional<z.ZodNumber>;
    impact: z.ZodOptional<z.ZodString>;
    feedback: z.ZodOptional<z.ZodString>;
    organizerId: z.ZodString;
    activityId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateKnowledgeTransferSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<{
        FICHE_TECHNIQUE: "FICHE_TECHNIQUE";
        DEMONSTRATION: "DEMONSTRATION";
        FORMATION_PRODUCTEUR: "FORMATION_PRODUCTEUR";
        VISITE_GUIDEE: "VISITE_GUIDEE";
        EMISSION_RADIO: "EMISSION_RADIO";
        REPORTAGE_TV: "REPORTAGE_TV";
        PUBLICATION_VULGARISATION: "PUBLICATION_VULGARISATION";
        SITE_WEB: "SITE_WEB";
        RESEAUX_SOCIAUX: "RESEAUX_SOCIAUX";
    }>>;
    targetAudience: z.ZodOptional<z.ZodArray<z.ZodString>>;
    location: z.ZodOptional<z.ZodString>;
    date: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>;
    participants: z.ZodOptional<z.ZodNumber>;
    impact: z.ZodOptional<z.ZodString>;
    feedback: z.ZodOptional<z.ZodString>;
    organizerId: z.ZodOptional<z.ZodString>;
    activityId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const knowledgeTransferListQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    limit: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    search: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<{
        FICHE_TECHNIQUE: "FICHE_TECHNIQUE";
        DEMONSTRATION: "DEMONSTRATION";
        FORMATION_PRODUCTEUR: "FORMATION_PRODUCTEUR";
        VISITE_GUIDEE: "VISITE_GUIDEE";
        EMISSION_RADIO: "EMISSION_RADIO";
        REPORTAGE_TV: "REPORTAGE_TV";
        PUBLICATION_VULGARISATION: "PUBLICATION_VULGARISATION";
        SITE_WEB: "SITE_WEB";
        RESEAUX_SOCIAUX: "RESEAUX_SOCIAUX";
    }>>;
    organizerId: z.ZodOptional<z.ZodString>;
    activityId: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>;
    endDate: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>;
}, z.core.$strip>;
export type CreateKnowledgeTransferInput = z.infer<typeof createKnowledgeTransferSchema>;
export type UpdateKnowledgeTransferInput = z.infer<typeof updateKnowledgeTransferSchema>;
export type KnowledgeTransferListQuery = z.infer<typeof knowledgeTransferListQuerySchema>;
//# sourceMappingURL=knowledgeTransferValidation.d.ts.map