// types/publication.types.ts
import { z } from 'zod';
import { PublicationType } from '@prisma/client';

export const createPublicationSchema = z.object({
  title: z.string().min(5, "Le titre doit contenir au moins 5 caractères"),
  type: z.nativeEnum(PublicationType),
  journal: z.string().optional(),
  isbn: z.string().optional(),
  doi: z.string().optional(),
  url: z.string().url("URL invalide").optional().or(z.literal('')),
  volume: z.string().optional(),
  issue: z.string().optional(),
  pages: z.string().optional(),
  publisher: z.string().optional(),
  impactFactor: z.number().positive().optional(),
  quartile: z.enum(['Q1', 'Q2', 'Q3', 'Q4']).optional(),
  citationsCount: z.number().int().min(0).default(0),
  isOpenAccess: z.boolean().default(false),
  submissionDate: z.string().datetime().optional(),
  acceptanceDate: z.string().datetime().optional(),
  publicationDate: z.string().datetime().optional(),
  status: z.enum(['SOUMIS', 'ACCEPTE', 'PUBLIE']).default('PUBLIE'),
  isInternational: z.boolean().default(false),
  language: z.string().default('fr'),
  abstract: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  authors: z.array(z.object({
    userId: z.string().cuid().optional(),
    externalName: z.string().optional(),
    externalEmail: z.string().email("Email invalide").optional().or(z.literal('')),
    authorOrder: z.number().int().positive(),
    isCorresponding: z.boolean().default(false),
    affiliation: z.string().optional()
  }).refine(data => data.userId || data.externalName, {
    message: "Chaque auteur doit avoir soit un userId (auteur interne) soit un externalName (auteur externe)"
  })).min(1, "Au moins un auteur est requis"),
  linkedProjectIds: z.array(z.string().cuid()).default([]),
  linkedActivityIds: z.array(z.string().cuid()).default([])
});

export const updatePublicationSchema = createPublicationSchema.partial();

export const publicationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  type: z.nativeEnum(PublicationType).optional(),
  year: z.coerce.number().int().optional(),
  authorId: z.string().cuid().optional(),
  status: z.enum(['SOUMIS', 'ACCEPTE', 'PUBLIE']).optional(),
  isInternational: z.coerce.boolean().optional(),
  quartile: z.enum(['Q1', 'Q2', 'Q3', 'Q4']).optional(),
  search: z.string().optional()
});

export type CreatePublicationInput = z.infer<typeof createPublicationSchema>;
export type UpdatePublicationInput = z.infer<typeof updatePublicationSchema>;
export type PublicationQuery = z.infer<typeof publicationQuerySchema>;