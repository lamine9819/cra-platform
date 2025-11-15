import { Quarter, QuarterPeriod } from '../types/reports.types';
import { GenerateReportInput } from '../utils/report.validation';
export declare class QuarterService {
    /**
     * Obtient le trimestre actuel
     */
    getCurrentQuarter(): QuarterPeriod;
    /**
     * Obtient les dates de début et fin d'un trimestre
     */
    getQuarterPeriod(year: number, quarter: Quarter): QuarterPeriod;
    /**
     * Obtient tous les trimestres d'une année
     */
    getYearQuarters(year: number): QuarterPeriod[];
    /**
     * Obtient le trimestre précédent
     */
    getPreviousQuarter(year: number, quarter: Quarter): QuarterPeriod;
    /**
     * Obtient le trimestre suivant
     */
    getNextQuarter(year: number, quarter: Quarter): QuarterPeriod;
    /**
     * Vérifie si une date est dans un trimestre donné
     */
    isDateInQuarter(date: Date, year: number, quarter: Quarter): boolean;
    /**
     * Obtient le trimestre d'une date donnée
     */
    getQuarterFromDate(date: Date): QuarterPeriod;
    /**
     * Formate le label du trimestre
     */
    formatQuarterLabel(year: number, quarter: Quarter): string;
    /**
     * Obtient la période de dates pour le rapport
     */
    getReportPeriod(filters: GenerateReportInput): {
        startDate: Date;
        endDate: Date;
        label: string;
    };
}
export declare const quarterService: QuarterService;
//# sourceMappingURL=quarter.service.d.ts.map