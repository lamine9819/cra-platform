import { z } from 'zod';
import { TransferType } from '@prisma/client';

const dateValidation = z.union([
  z.string().refine((val) => {
    if (val === '') return true;
    const date = new Date(val);
    return !isNaN(date.getTime());
  }),
  z.literal('')
]);

export const createKnowledgeTransferSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(200),
  description: z.string().max(2000).optional(),
  type: z.nativeEnum(TransferType, { message: "Type de transfert requis" }),
  targetAudience: z.array(z.string().min(1)).min(1, 'Au moins un public cible est requis'),
  location: z.string().max(200).optional(),
  date: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, { message: "Date valide requise" }),
  participants: z.number().int().positive().optional(),
  impact: z.string().max(2000).optional(),
  feedback: z.string().max(2000).optional(),
  organizerId: z.string().cuid('ID organisateur requis'),
  activityId: z.string().cuid().optional(),
});

export const updateKnowledgeTransferSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(2000).optional(),
  type: z.nativeEnum(TransferType).optional(),
  targetAudience: z.array(z.string().min(1)).min(1).optional(),
  location: z.string().max(200).optional(),
  date: dateValidation.optional(),
  participants: z.number().int().positive().optional(),
  impact: z.string().max(2000).optional(),
  feedback: z.string().max(2000).optional(),
  organizerId: z.string().cuid().optional(),
  activityId: z.string().cuid().optional(),
});

export const knowledgeTransferListQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
  search: z.string().optional(),
  type: z.nativeEnum(TransferType).optional(),
  organizerId: z.string().cuid().optional(),
  activityId: z.string().cuid().optional(),
  startDate: dateValidation.optional(),
  endDate: dateValidation.optional(),
});

export type CreateKnowledgeTransferInput = z.infer<typeof createKnowledgeTransferSchema>;
export type UpdateKnowledgeTransferInput = z.infer<typeof updateKnowledgeTransferSchema>;
export type KnowledgeTransferListQuery = z.infer<typeof knowledgeTransferListQuerySchema>;