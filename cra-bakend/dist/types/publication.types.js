"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicationQuerySchema = exports.updatePublicationSchema = exports.createPublicationSchema = void 0;
// types/publication.types.ts
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createPublicationSchema = zod_1.z.object({
    title: zod_1.z.string().min(5, "Le titre doit contenir au moins 5 caractères"),
    type: zod_1.z.nativeEnum(client_1.PublicationType),
    journal: zod_1.z.string().optional(),
    isbn: zod_1.z.string().optional(),
    doi: zod_1.z.string().optional(),
    url: zod_1.z.string().url("URL invalide").optional().or(zod_1.z.literal('')),
    volume: zod_1.z.string().optional(),
    issue: zod_1.z.string().optional(),
    pages: zod_1.z.string().optional(),
    publisher: zod_1.z.string().optional(),
    impactFactor: zod_1.z.number().positive().optional(),
    quartile: zod_1.z.enum(['Q1', 'Q2', 'Q3', 'Q4']).optional(),
    citationsCount: zod_1.z.number().int().min(0).default(0),
    isOpenAccess: zod_1.z.boolean().default(false),
    submissionDate: zod_1.z.string().datetime().optional(),
    acceptanceDate: zod_1.z.string().datetime().optional(),
    publicationDate: zod_1.z.string().datetime().optional(),
    status: zod_1.z.enum(['SOUMIS', 'ACCEPTE', 'PUBLIE']).default('PUBLIE'),
    isInternational: zod_1.z.boolean().default(false),
    language: zod_1.z.string().default('fr'),
    abstract: zod_1.z.string().optional(),
    keywords: zod_1.z.array(zod_1.z.string()).default([]),
    authors: zod_1.z.array(zod_1.z.object({
        userId: zod_1.z.string().cuid().optional(),
        externalName: zod_1.z.string().optional(),
        externalEmail: zod_1.z.string().email("Email invalide").optional().or(zod_1.z.literal('')),
        authorOrder: zod_1.z.number().int().positive(),
        isCorresponding: zod_1.z.boolean().default(false),
        affiliation: zod_1.z.string().optional()
    }).refine(data => data.userId || data.externalName, {
        message: "Chaque auteur doit avoir soit un userId (auteur interne) soit un externalName (auteur externe)"
    })).min(1, "Au moins un auteur est requis"),
    linkedProjectIds: zod_1.z.array(zod_1.z.string().cuid()).default([]),
    linkedActivityIds: zod_1.z.array(zod_1.z.string().cuid()).default([])
});
exports.updatePublicationSchema = exports.createPublicationSchema.partial();
exports.publicationQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).default(10),
    type: zod_1.z.nativeEnum(client_1.PublicationType).optional(),
    year: zod_1.z.coerce.number().int().optional(),
    authorId: zod_1.z.string().cuid().optional(),
    status: zod_1.z.enum(['SOUMIS', 'ACCEPTE', 'PUBLIE']).optional(),
    isInternational: zod_1.z.coerce.boolean().optional(),
    quartile: zod_1.z.enum(['Q1', 'Q2', 'Q3', 'Q4']).optional(),
    search: zod_1.z.string().optional()
});
//# sourceMappingURL=publication.types.js.map