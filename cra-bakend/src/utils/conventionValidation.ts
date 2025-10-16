import { z } from 'zod';
import { ConventionType, ConventionStatus } from '../types/convention.types';

const dateValidation = z.union([
  z.string().refine((val) => {
    if (val === '') return true;
    const date = new Date(val);
    return !isNaN(date.getTime());
  }),
  z.literal('')
]);

export const createConventionSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(200),
  description: z.string().max(2000).optional(),
  type: z.nativeEnum(ConventionType, { message: "Type de convention requis" }),
  status: z.nativeEnum(ConventionStatus).default(ConventionStatus.EN_NEGOCIATION),
  contractNumber: z.string().max(100).optional(),
  signatureDate: dateValidation.optional(),
  startDate: dateValidation.optional(),
  endDate: dateValidation.optional(),
  totalBudget: z.number().positive().optional(),
  currency: z.string().default('XOF'),
  documentPath: z.string().max(500).optional(),
  mainPartner: z.string().min(2, 'Partenaire principal requis').max(200),
  otherPartners: z.array(z.string()).optional(),
  responsibleUserId: z.string().cuid('Responsable requis'),
}).refine(data => {
  if (data.startDate && data.endDate && data.startDate !== '' && data.endDate !== '') {
    return new Date(data.startDate) <= new Date(data.endDate);
  }
  return true;
}, {
  message: "La date de fin doit être postérieure à la date de début",
  path: ["endDate"]
});

export const updateConventionSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(2000).optional().or(z.literal('')),
  type: z.nativeEnum(ConventionType).optional(),
  status: z.nativeEnum(ConventionStatus).optional(),
  contractNumber: z.string().max(100).optional().or(z.literal('')),
  signatureDate: dateValidation.optional(),
  startDate: dateValidation.optional(),
  endDate: dateValidation.optional(),
  totalBudget: z.number().positive().optional(),
  documentPath: z.string().max(500).optional().or(z.literal('')),
  mainPartner: z.string().min(2).max(200).optional(),
  otherPartners: z.array(z.string()).optional(),
  responsibleUserId: z.string().cuid().optional(),
});

export const conventionListQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
  search: z.string().optional(),
  type: z.nativeEnum(ConventionType).optional(),
  status: z.nativeEnum(ConventionStatus).optional(),
  responsibleId: z.string().cuid().optional(),
  startDate: dateValidation.optional(),
  endDate: dateValidation.optional(),
});

export type CreateConventionInput = z.infer<typeof createConventionSchema>;
export type UpdateConventionInput = z.infer<typeof updateConventionSchema>;
export type ConventionListQuery = z.infer<typeof conventionListQuerySchema>;