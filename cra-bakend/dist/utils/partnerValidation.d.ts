import { z } from 'zod';
declare const partnerTypeEnum: z.ZodEnum<{
    UNIVERSITE: "UNIVERSITE";
    INSTITUT_RECHERCHE: "INSTITUT_RECHERCHE";
    ENTREPRISE_PRIVEE: "ENTREPRISE_PRIVEE";
    ONG: "ONG";
    ORGANISME_PUBLIC: "ORGANISME_PUBLIC";
    ORGANISATION_INTERNATIONALE: "ORGANISATION_INTERNATIONALE";
    COOPERATIVE: "COOPERATIVE";
    ASSOCIATION: "ASSOCIATION";
}>;
declare const partnershipTypeEnum: z.ZodEnum<{
    FORMATION: "FORMATION";
    TECHNIQUE: "TECHNIQUE";
    FINANCIER: "FINANCIER";
    LOGISTIQUE: "LOGISTIQUE";
    SCIENTIFIQUE: "SCIENTIFIQUE";
    EQUIPEMENT: "EQUIPEMENT";
    CONSEIL: "CONSEIL";
    RECHERCHE_COLLABORATIVE: "RECHERCHE_COLLABORATIVE";
    TRANSFERT_TECHNOLOGIQUE: "TRANSFERT_TECHNOLOGIQUE";
    DISSEMINATION: "DISSEMINATION";
}>;
export declare const createPartnerSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodEnum<{
        UNIVERSITE: "UNIVERSITE";
        INSTITUT_RECHERCHE: "INSTITUT_RECHERCHE";
        ENTREPRISE_PRIVEE: "ENTREPRISE_PRIVEE";
        ONG: "ONG";
        ORGANISME_PUBLIC: "ORGANISME_PUBLIC";
        ORGANISATION_INTERNATIONALE: "ORGANISATION_INTERNATIONALE";
        COOPERATIVE: "COOPERATIVE";
        ASSOCIATION: "ASSOCIATION";
    }>;
    category: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodOptional<z.ZodString>>>;
    email: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodOptional<z.ZodString>>>;
    website: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodOptional<z.ZodString>>>;
    contactPerson: z.ZodOptional<z.ZodString>;
    contactTitle: z.ZodOptional<z.ZodString>;
    contactEmail: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodOptional<z.ZodString>>>;
    contactPhone: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodOptional<z.ZodString>>>;
    expertise: z.ZodDefault<z.ZodArray<z.ZodString>>;
    services: z.ZodDefault<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export declare const updatePartnerSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<{
        UNIVERSITE: "UNIVERSITE";
        INSTITUT_RECHERCHE: "INSTITUT_RECHERCHE";
        ENTREPRISE_PRIVEE: "ENTREPRISE_PRIVEE";
        ONG: "ONG";
        ORGANISME_PUBLIC: "ORGANISME_PUBLIC";
        ORGANISATION_INTERNATIONALE: "ORGANISATION_INTERNATIONALE";
        COOPERATIVE: "COOPERATIVE";
        ASSOCIATION: "ASSOCIATION";
    }>>;
    category: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodOptional<z.ZodString>>>;
    email: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodOptional<z.ZodString>>>;
    website: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodOptional<z.ZodString>>>;
    contactPerson: z.ZodOptional<z.ZodString>;
    contactTitle: z.ZodOptional<z.ZodString>;
    contactEmail: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodOptional<z.ZodString>>>;
    contactPhone: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodOptional<z.ZodString>>>;
    expertise: z.ZodOptional<z.ZodArray<z.ZodString>>;
    services: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export declare const partnerListQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    limit: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    type: z.ZodOptional<z.ZodEnum<{
        UNIVERSITE: "UNIVERSITE";
        INSTITUT_RECHERCHE: "INSTITUT_RECHERCHE";
        ENTREPRISE_PRIVEE: "ENTREPRISE_PRIVEE";
        ONG: "ONG";
        ORGANISME_PUBLIC: "ORGANISME_PUBLIC";
        ORGANISATION_INTERNATIONALE: "ORGANISATION_INTERNATIONALE";
        COOPERATIVE: "COOPERATIVE";
        ASSOCIATION: "ASSOCIATION";
    }>>;
    category: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const addPartnershipSchema: z.ZodObject<{
    partnerId: z.ZodString;
    partnerType: z.ZodEnum<{
        FORMATION: "FORMATION";
        TECHNIQUE: "TECHNIQUE";
        FINANCIER: "FINANCIER";
        LOGISTIQUE: "LOGISTIQUE";
        SCIENTIFIQUE: "SCIENTIFIQUE";
        EQUIPEMENT: "EQUIPEMENT";
        CONSEIL: "CONSEIL";
        RECHERCHE_COLLABORATIVE: "RECHERCHE_COLLABORATIVE";
        TRANSFERT_TECHNOLOGIQUE: "TRANSFERT_TECHNOLOGIQUE";
        DISSEMINATION: "DISSEMINATION";
    }>;
    contribution: z.ZodOptional<z.ZodString>;
    benefits: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodOptional<z.ZodString>>>>;
    endDate: z.ZodOptional<z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodOptional<z.ZodString>>>>;
}, z.core.$strip>;
export declare const updatePartnershipSchema: z.ZodObject<{
    partnershipId: z.ZodString;
    partnerType: z.ZodOptional<z.ZodEnum<{
        FORMATION: "FORMATION";
        TECHNIQUE: "TECHNIQUE";
        FINANCIER: "FINANCIER";
        LOGISTIQUE: "LOGISTIQUE";
        SCIENTIFIQUE: "SCIENTIFIQUE";
        EQUIPEMENT: "EQUIPEMENT";
        CONSEIL: "CONSEIL";
        RECHERCHE_COLLABORATIVE: "RECHERCHE_COLLABORATIVE";
        TRANSFERT_TECHNOLOGIQUE: "TRANSFERT_TECHNOLOGIQUE";
        DISSEMINATION: "DISSEMINATION";
    }>>;
    contribution: z.ZodOptional<z.ZodString>;
    benefits: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodOptional<z.ZodString>>>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export { partnerTypeEnum, partnershipTypeEnum };
//# sourceMappingURL=partnerValidation.d.ts.map