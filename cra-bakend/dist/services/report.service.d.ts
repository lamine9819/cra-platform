import { ActivityReport, ConventionReport, KnowledgeTransferReport } from '../types/reports.types';
import { GenerateReportInput } from '../utils/report.validation';
export declare class ReportService {
    /**
     * Récupère les données des activités pour le rapport trimestriel
     */
    getActivitiesData(filters: GenerateReportInput): Promise<ActivityReport[]>;
    /**
     * Récupère les données des conventions pour le rapport trimestriel
     */
    getConventionsData(filters: GenerateReportInput): Promise<ConventionReport[]>;
    /**
     * Récupère les données des transferts de connaissances pour le rapport trimestriel
     */
    getKnowledgeTransfersData(filters: GenerateReportInput): Promise<KnowledgeTransferReport[]>;
    /**
     * Obtient les statistiques trimestrielles
     */
    getQuarterlyStatistics(filters: GenerateReportInput): Promise<{
        period: string;
        activities: {
            total: number;
            new: number;
            reconducted: number;
            closed: number;
        };
        conventions: {
            total: number;
        };
        transfers: {
            total: number;
        };
        budget: {
            totalGlobal: number;
            totalMobilized: number;
        };
    }>;
    /**
     * Mappe le statut d'activité Prisma vers le format du rapport
     */
    private mapActivityStatus;
    /**
     * Formate une date pour l'affichage dans les rapports
     */
    formatDate(date: Date): string;
    /**
     * Formate un montant en devise
     */
    formatCurrency(amount: number, currency?: string): string;
}
export declare const reportService: ReportService;
//# sourceMappingURL=report.service.d.ts.map