import { z } from 'zod';
import { ConventionType, ConventionStatus } from '../types/convention.types';
export declare const createConventionSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<typeof ConventionType>;
    status: z.ZodDefault<z.ZodEnum<typeof ConventionStatus>>;
    contractNumber: z.ZodOptional<z.ZodString>;
    signatureDate: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>;
    startDate: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>;
    endDate: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>;
    totalBudget: z.ZodOptional<z.ZodNumber>;
    currency: z.ZodDefault<z.ZodString>;
    documentPath: z.ZodOptional<z.ZodString>;
    mainPartner: z.ZodString;
    otherPartners: z.ZodOptional<z.ZodArray<z.ZodString>>;
    responsibleUserId: z.ZodString;
}, z.core.$strip>;
export declare const updateConventionSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    type: z.ZodOptional<z.ZodEnum<typeof ConventionType>>;
    status: z.ZodOptional<z.ZodEnum<typeof ConventionStatus>>;
    contractNumber: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    signatureDate: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>;
    startDate: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>;
    endDate: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>;
    totalBudget: z.ZodOptional<z.ZodNumber>;
    documentPath: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    mainPartner: z.ZodOptional<z.ZodString>;
    otherPartners: z.ZodOptional<z.ZodArray<z.ZodString>>;
    responsibleUserId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const conventionListQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    limit: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    search: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<typeof ConventionType>>;
    status: z.ZodOptional<z.ZodEnum<typeof ConventionStatus>>;
    responsibleId: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>;
    endDate: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>;
}, z.core.$strip>;
export type CreateConventionInput = z.infer<typeof createConventionSchema>;
export type UpdateConventionInput = z.infer<typeof updateConventionSchema>;
export type ConventionListQuery = z.infer<typeof conventionListQuerySchema>;
//# sourceMappingURL=conventionValidation.d.ts.map