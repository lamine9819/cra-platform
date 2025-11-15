"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fundingFiltersSchema = exports.updateFundingSchema = exports.createFundingSchema = void 0;
// src/utils/validation/funding.validation.ts
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createFundingSchema = zod_1.z.object({
    fundingSource: zod_1.z.string().min(1, "La source de financement est requise"),
    fundingType: zod_1.z.nativeEnum(client_1.FundingType, {
        message: "Type de financement invalide"
    }),
    status: zod_1.z.nativeEnum(client_1.FundingStatus).optional(),
    requestedAmount: zod_1.z.number().positive("Le montant demandé doit être positif"),
    approvedAmount: zod_1.z.number().positive().optional(),
    receivedAmount: zod_1.z.number().positive().optional(),
    currency: zod_1.z.string().default("XOF"),
    applicationDate: zod_1.z.string().datetime().optional(),
    approvalDate: zod_1.z.string().datetime().optional(),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
    conditions: zod_1.z.string().optional(),
    reportingReqs: zod_1.z.array(zod_1.z.string()).optional(),
    restrictions: zod_1.z.array(zod_1.z.string()).optional(),
    contractNumber: zod_1.z.string().optional(),
    contactPerson: zod_1.z.string().optional(),
    contactEmail: zod_1.z.string().email("Email invalide").optional(),
    notes: zod_1.z.string().optional(),
    activityId: zod_1.z.string().cuid("ID d'activité invalide"),
    conventionId: zod_1.z.string().cuid().optional()
}).refine((data) => {
    // Vérifier que le montant approuvé ne dépasse pas le montant demandé
    if (data.approvedAmount && data.approvedAmount > data.requestedAmount) {
        return false;
    }
    return true;
}, {
    message: "Le montant approuvé ne peut pas dépasser le montant demandé",
    path: ["approvedAmount"]
}).refine((data) => {
    // Vérifier que le montant reçu ne dépasse pas le montant approuvé
    if (data.receivedAmount && data.approvedAmount && data.receivedAmount > data.approvedAmount) {
        return false;
    }
    return true;
}, {
    message: "Le montant reçu ne peut pas dépasser le montant approuvé",
    path: ["receivedAmount"]
});
exports.updateFundingSchema = zod_1.z.object({
    fundingSource: zod_1.z.string().min(1).optional(),
    fundingType: zod_1.z.nativeEnum(client_1.FundingType).optional(),
    status: zod_1.z.nativeEnum(client_1.FundingStatus).optional(),
    requestedAmount: zod_1.z.number().positive().optional(),
    approvedAmount: zod_1.z.number().positive().optional(),
    receivedAmount: zod_1.z.number().positive().optional(),
    currency: zod_1.z.string().optional(),
    applicationDate: zod_1.z.string().datetime().optional(),
    approvalDate: zod_1.z.string().datetime().optional(),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
    conditions: zod_1.z.string().optional(),
    reportingReqs: zod_1.z.array(zod_1.z.string()).optional(),
    restrictions: zod_1.z.array(zod_1.z.string()).optional(),
    contractNumber: zod_1.z.string().optional(),
    contactPerson: zod_1.z.string().optional(),
    contactEmail: zod_1.z.string().email().optional(),
    notes: zod_1.z.string().optional(),
    conventionId: zod_1.z.string().cuid().optional()
});
exports.fundingFiltersSchema = zod_1.z.object({
    activityId: zod_1.z.string().cuid().optional(),
    fundingType: zod_1.z.nativeEnum(client_1.FundingType).optional(),
    status: zod_1.z.nativeEnum(client_1.FundingStatus).optional(),
    conventionId: zod_1.z.string().cuid().optional(),
    minAmount: zod_1.z.string().transform(Number).pipe(zod_1.z.number().positive()).optional(),
    maxAmount: zod_1.z.string().transform(Number).pipe(zod_1.z.number().positive()).optional(),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional()
});
//# sourceMappingURL=funding.validation.js.map