// src/utils/validation/report.validation.ts

import { z } from 'zod';
import { ReportFormat, ReportType, Quarter } from '../types/reports.types';

export const generateReportSchema = z.object({
  reportType: z.nativeEnum(ReportType),
  format: z.nativeEnum(ReportFormat),
  
  // Option 1: Spécifier l'année et le trimestre
  year: z.number().int().min(2000).max(2100),
  quarter: z.nativeEnum(Quarter).optional(),
  
  // Option 2: Ou utiliser des dates personnalisées (priorité si spécifiées)
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  
  // Filtres additionnels
  themeId: z.string().cuid().optional(),
  programId: z.string().cuid().optional(),
  stationId: z.string().cuid().optional(),
  includeArchived: z.boolean().default(false),
  
  // Métadonnées du rapport
  includeCharts: z.boolean().default(false),
  includeStatistics: z.boolean().default(true)
}).refine(
  (data) => {
    // Si startDate est spécifiée, endDate doit l'être aussi
    if (data.startDate && !data.endDate) return false;
    if (!data.startDate && data.endDate) return false;
    return true;
  },
  {
    message: "startDate et endDate doivent être spécifiés ensemble"
  }
);

export type GenerateReportInput = z.infer<typeof generateReportSchema>;