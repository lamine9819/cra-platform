import { z } from 'zod';
import { ReportFormat, ReportType, Quarter } from '../types/reports.types';
export declare const generateReportSchema: z.ZodObject<{
    reportType: z.ZodEnum<typeof ReportType>;
    format: z.ZodEnum<typeof ReportFormat>;
    year: z.ZodNumber;
    quarter: z.ZodOptional<z.ZodEnum<typeof Quarter>>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    themeId: z.ZodOptional<z.ZodString>;
    programId: z.ZodOptional<z.ZodString>;
    stationId: z.ZodOptional<z.ZodString>;
    includeArchived: z.ZodDefault<z.ZodBoolean>;
    includeCharts: z.ZodDefault<z.ZodBoolean>;
    includeStatistics: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export type GenerateReportInput = z.infer<typeof generateReportSchema>;
//# sourceMappingURL=report.validation.d.ts.map