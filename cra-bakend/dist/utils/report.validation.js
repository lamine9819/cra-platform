"use strict";
// src/utils/validation/report.validation.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReportSchema = void 0;
const zod_1 = require("zod");
const reports_types_1 = require("../types/reports.types");
exports.generateReportSchema = zod_1.z.object({
    reportType: zod_1.z.nativeEnum(reports_types_1.ReportType),
    format: zod_1.z.nativeEnum(reports_types_1.ReportFormat),
    // Option 1: Spécifier l'année et le trimestre
    year: zod_1.z.number().int().min(2000).max(2100),
    quarter: zod_1.z.nativeEnum(reports_types_1.Quarter).optional(),
    // Option 2: Ou utiliser des dates personnalisées (priorité si spécifiées)
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
    // Filtres additionnels
    themeId: zod_1.z.string().cuid().optional(),
    programId: zod_1.z.string().cuid().optional(),
    stationId: zod_1.z.string().cuid().optional(),
    includeArchived: zod_1.z.boolean().default(false),
    // Métadonnées du rapport
    includeCharts: zod_1.z.boolean().default(false),
    includeStatistics: zod_1.z.boolean().default(true)
}).refine((data) => {
    // Si startDate est spécifiée, endDate doit l'être aussi
    if (data.startDate && !data.endDate)
        return false;
    if (!data.startDate && data.endDate)
        return false;
    return true;
}, {
    message: "startDate et endDate doivent être spécifiés ensemble"
});
//# sourceMappingURL=report.validation.js.map