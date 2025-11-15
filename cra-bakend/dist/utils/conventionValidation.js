"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.conventionListQuerySchema = exports.updateConventionSchema = exports.createConventionSchema = void 0;
const zod_1 = require("zod");
const convention_types_1 = require("../types/convention.types");
const dateValidation = zod_1.z.union([
    zod_1.z.string().refine((val) => {
        if (val === '')
            return true;
        const date = new Date(val);
        return !isNaN(date.getTime());
    }),
    zod_1.z.literal('')
]);
exports.createConventionSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(200),
    description: zod_1.z.string().max(2000).optional(),
    type: zod_1.z.nativeEnum(convention_types_1.ConventionType, { message: "Type de convention requis" }),
    status: zod_1.z.nativeEnum(convention_types_1.ConventionStatus).default(convention_types_1.ConventionStatus.EN_NEGOCIATION),
    contractNumber: zod_1.z.string().max(100).optional(),
    signatureDate: dateValidation.optional(),
    startDate: dateValidation.optional(),
    endDate: dateValidation.optional(),
    totalBudget: zod_1.z.number().positive().optional(),
    currency: zod_1.z.string().default('XOF'),
    documentPath: zod_1.z.string().max(500).optional(),
    mainPartner: zod_1.z.string().min(2, 'Partenaire principal requis').max(200),
    otherPartners: zod_1.z.array(zod_1.z.string()).optional(),
    responsibleUserId: zod_1.z.string().cuid('Responsable requis'),
}).refine(data => {
    if (data.startDate && data.endDate && data.startDate !== '' && data.endDate !== '') {
        return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
}, {
    message: "La date de fin doit être postérieure à la date de début",
    path: ["endDate"]
});
exports.updateConventionSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).max(200).optional(),
    description: zod_1.z.string().max(2000).optional().or(zod_1.z.literal('')),
    type: zod_1.z.nativeEnum(convention_types_1.ConventionType).optional(),
    status: zod_1.z.nativeEnum(convention_types_1.ConventionStatus).optional(),
    contractNumber: zod_1.z.string().max(100).optional().or(zod_1.z.literal('')),
    signatureDate: dateValidation.optional(),
    startDate: dateValidation.optional(),
    endDate: dateValidation.optional(),
    totalBudget: zod_1.z.number().positive().optional(),
    documentPath: zod_1.z.string().max(500).optional().or(zod_1.z.literal('')),
    mainPartner: zod_1.z.string().min(2).max(200).optional(),
    otherPartners: zod_1.z.array(zod_1.z.string()).optional(),
    responsibleUserId: zod_1.z.string().cuid().optional(),
});
exports.conventionListQuerySchema = zod_1.z.object({
    page: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(1)).optional(),
    limit: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(1).max(100)).optional(),
    search: zod_1.z.string().optional(),
    type: zod_1.z.nativeEnum(convention_types_1.ConventionType).optional(),
    status: zod_1.z.nativeEnum(convention_types_1.ConventionStatus).optional(),
    responsibleId: zod_1.z.string().cuid().optional(),
    startDate: dateValidation.optional(),
    endDate: dateValidation.optional(),
});
//# sourceMappingURL=conventionValidation.js.map