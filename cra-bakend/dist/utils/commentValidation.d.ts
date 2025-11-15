import { z } from 'zod';
export declare const createCommentSchema: z.ZodObject<{
    content: z.ZodString;
    targetType: z.ZodEnum<{
        project: "project";
        activity: "activity";
        task: "task";
    }>;
    targetId: z.ZodCUID;
}, z.core.$strip>;
export declare const updateCommentSchema: z.ZodObject<{
    content: z.ZodString;
}, z.core.$strip>;
export declare const commentListQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    limit: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    targetType: z.ZodOptional<z.ZodEnum<{
        project: "project";
        activity: "activity";
        task: "task";
    }>>;
    targetId: z.ZodOptional<z.ZodCUID>;
    authorId: z.ZodOptional<z.ZodCUID>;
    search: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=commentValidation.d.ts.map