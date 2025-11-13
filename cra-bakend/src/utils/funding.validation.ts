// src/utils/validation/funding.validation.ts
import { z } from 'zod';
import { FundingType, FundingStatus } from '@prisma/client';

export const createFundingSchema = z.object({
  fundingSource: z.string().min(1, "La source de financement est requise"),
  fundingType: z.nativeEnum(FundingType, {
    message: "Type de financement invalide"
  }),
  status: z.nativeEnum(FundingStatus).optional(),
  requestedAmount: z.number().positive("Le montant demandé doit être positif"),
  approvedAmount: z.number().positive().optional(),
  receivedAmount: z.number().positive().optional(),
  currency: z.string().default("XOF"),
  applicationDate: z.string().datetime().optional(),
  approvalDate: z.string().datetime().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  conditions: z.string().optional(),
  reportingReqs: z.array(z.string()).optional(),
  restrictions: z.array(z.string()).optional(),
  contractNumber: z.string().optional(),
  contactPerson: z.string().optional(),
  contactEmail: z.string().email("Email invalide").optional(),
  notes: z.string().optional(),
  activityId: z.string().cuid("ID d'activité invalide"),
  conventionId: z.string().cuid().optional()
}).refine(
  (data) => {
    // Vérifier que le montant approuvé ne dépasse pas le montant demandé
    if (data.approvedAmount && data.approvedAmount > data.requestedAmount) {
      return false;
    }
    return true;
  },
  {
    message: "Le montant approuvé ne peut pas dépasser le montant demandé",
    path: ["approvedAmount"]
  }
).refine(
  (data) => {
    // Vérifier que le montant reçu ne dépasse pas le montant approuvé
    if (data.receivedAmount && data.approvedAmount && data.receivedAmount > data.approvedAmount) {
      return false;
    }
    return true;
  },
  {
    message: "Le montant reçu ne peut pas dépasser le montant approuvé",
    path: ["receivedAmount"]
  }
);

export const updateFundingSchema = z.object({
  fundingSource: z.string().min(1).optional(),
  fundingType: z.nativeEnum(FundingType).optional(),
  status: z.nativeEnum(FundingStatus).optional(),
  requestedAmount: z.number().positive().optional(),
  approvedAmount: z.number().positive().optional(),
  receivedAmount: z.number().positive().optional(),
  currency: z.string().optional(),
  applicationDate: z.string().datetime().optional(),
  approvalDate: z.string().datetime().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  conditions: z.string().optional(),
  reportingReqs: z.array(z.string()).optional(),
  restrictions: z.array(z.string()).optional(),
  contractNumber: z.string().optional(),
  contactPerson: z.string().optional(),
  contactEmail: z.string().email().optional(),
  notes: z.string().optional(),
  conventionId: z.string().cuid().optional()
});

export const fundingFiltersSchema = z.object({
  activityId: z.string().cuid().optional(),
  fundingType: z.nativeEnum(FundingType).optional(),
  status: z.nativeEnum(FundingStatus).optional(),
  conventionId: z.string().cuid().optional(),
  minAmount: z.string().transform(Number).pipe(z.number().positive()).optional(),
  maxAmount: z.string().transform(Number).pipe(z.number().positive()).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
});