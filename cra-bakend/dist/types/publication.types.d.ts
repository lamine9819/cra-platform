import { z } from 'zod';
export declare const createPublicationSchema: z.ZodObject<{
    title: z.ZodString;
    type: z.ZodEnum<{
        ARTICLE_SCIENTIFIQUE: "ARTICLE_SCIENTIFIQUE";
        COMMUNICATION_CONFERENCE: "COMMUNICATION_CONFERENCE";
        CHAPITRE_LIVRE: "CHAPITRE_LIVRE";
        LIVRE: "LIVRE";
        RAPPORT_TECHNIQUE: "RAPPORT_TECHNIQUE";
        FICHE_TECHNIQUE: "FICHE_TECHNIQUE";
        MEMOIRE: "MEMOIRE";
        THESE: "THESE";
    }>;
    journal: z.ZodOptional<z.ZodString>;
    isbn: z.ZodOptional<z.ZodString>;
    doi: z.ZodOptional<z.ZodString>;
    url: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    volume: z.ZodOptional<z.ZodString>;
    issue: z.ZodOptional<z.ZodString>;
    pages: z.ZodOptional<z.ZodString>;
    publisher: z.ZodOptional<z.ZodString>;
    impactFactor: z.ZodOptional<z.ZodNumber>;
    quartile: z.ZodOptional<z.ZodEnum<{
        Q1: "Q1";
        Q2: "Q2";
        Q3: "Q3";
        Q4: "Q4";
    }>>;
    citationsCount: z.ZodDefault<z.ZodNumber>;
    isOpenAccess: z.ZodDefault<z.ZodBoolean>;
    submissionDate: z.ZodOptional<z.ZodString>;
    acceptanceDate: z.ZodOptional<z.ZodString>;
    publicationDate: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<{
        SOUMIS: "SOUMIS";
        ACCEPTE: "ACCEPTE";
        PUBLIE: "PUBLIE";
    }>>;
    isInternational: z.ZodDefault<z.ZodBoolean>;
    language: z.ZodDefault<z.ZodString>;
    abstract: z.ZodOptional<z.ZodString>;
    keywords: z.ZodDefault<z.ZodArray<z.ZodString>>;
    authors: z.ZodArray<z.ZodObject<{
        userId: z.ZodString;
        authorOrder: z.ZodNumber;
        isCorresponding: z.ZodDefault<z.ZodBoolean>;
        affiliation: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    linkedProjectIds: z.ZodDefault<z.ZodArray<z.ZodString>>;
    linkedActivityIds: z.ZodDefault<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export declare const updatePublicationSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<{
        ARTICLE_SCIENTIFIQUE: "ARTICLE_SCIENTIFIQUE";
        COMMUNICATION_CONFERENCE: "COMMUNICATION_CONFERENCE";
        CHAPITRE_LIVRE: "CHAPITRE_LIVRE";
        LIVRE: "LIVRE";
        RAPPORT_TECHNIQUE: "RAPPORT_TECHNIQUE";
        FICHE_TECHNIQUE: "FICHE_TECHNIQUE";
        MEMOIRE: "MEMOIRE";
        THESE: "THESE";
    }>>;
    journal: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    isbn: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    doi: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    url: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
    volume: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    issue: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    pages: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    publisher: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    impactFactor: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    quartile: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
        Q1: "Q1";
        Q2: "Q2";
        Q3: "Q3";
        Q4: "Q4";
    }>>>;
    citationsCount: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    isOpenAccess: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    submissionDate: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    acceptanceDate: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    publicationDate: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    status: z.ZodOptional<z.ZodDefault<z.ZodEnum<{
        SOUMIS: "SOUMIS";
        ACCEPTE: "ACCEPTE";
        PUBLIE: "PUBLIE";
    }>>>;
    isInternational: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    language: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    abstract: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    keywords: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString>>>;
    authors: z.ZodOptional<z.ZodArray<z.ZodObject<{
        userId: z.ZodString;
        authorOrder: z.ZodNumber;
        isCorresponding: z.ZodDefault<z.ZodBoolean>;
        affiliation: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    linkedProjectIds: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString>>>;
    linkedActivityIds: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString>>>;
}, z.core.$strip>;
export declare const publicationQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    type: z.ZodOptional<z.ZodEnum<{
        ARTICLE_SCIENTIFIQUE: "ARTICLE_SCIENTIFIQUE";
        COMMUNICATION_CONFERENCE: "COMMUNICATION_CONFERENCE";
        CHAPITRE_LIVRE: "CHAPITRE_LIVRE";
        LIVRE: "LIVRE";
        RAPPORT_TECHNIQUE: "RAPPORT_TECHNIQUE";
        FICHE_TECHNIQUE: "FICHE_TECHNIQUE";
        MEMOIRE: "MEMOIRE";
        THESE: "THESE";
    }>>;
    year: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    authorId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        SOUMIS: "SOUMIS";
        ACCEPTE: "ACCEPTE";
        PUBLIE: "PUBLIE";
    }>>;
    isInternational: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
    quartile: z.ZodOptional<z.ZodEnum<{
        Q1: "Q1";
        Q2: "Q2";
        Q3: "Q3";
        Q4: "Q4";
    }>>;
    search: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreatePublicationInput = z.infer<typeof createPublicationSchema>;
export type UpdatePublicationInput = z.infer<typeof updatePublicationSchema>;
export type PublicationQuery = z.infer<typeof publicationQuerySchema>;
//# sourceMappingURL=publication.types.d.ts.map