import { ActivityReport, ConventionReport, KnowledgeTransferReport, Quarter } from '../types/reports.types';
import { GenerateReportInput } from '../utils/report.validation';
export declare class DocumentGeneratorService {
    private readonly uploadsDir;
    constructor();
    private ensureUploadsDirExists;
    /**
     * Génère un rapport trimestriel d'activités au format PDF
     */
    generateActivitiesPDF(activities: ActivityReport[], filters: GenerateReportInput): Promise<string>;
    /**
     * Génère un rapport trimestriel d'activités au format WORD
     */
    generateActivitiesWORD(activities: ActivityReport[], filters: GenerateReportInput): Promise<string>;
    /**
     * Génère un rapport trimestriel de conventions au format PDF
     */
    generateConventionsPDF(conventions: ConventionReport[], filters: GenerateReportInput): Promise<string>;
    /**
     * Génère un rapport trimestriel de conventions au format WORD
     */
    generateConventionsWORD(conventions: ConventionReport[], filters: GenerateReportInput): Promise<string>;
    /**
     * Génère un rapport trimestriel de transferts au format PDF
     */
    generateKnowledgeTransfersPDF(transfers: KnowledgeTransferReport[], filters: GenerateReportInput): Promise<string>;
    /**
     * Génère un rapport trimestriel de transferts au format WORD
     */
    generateKnowledgeTransfersWORD(transfers: KnowledgeTransferReport[], filters: GenerateReportInput): Promise<string>;
    /**
     * Génère une page de couverture pour les rapports annuels
     */
    private generateCoverPage;
    /**
     * Génère une page de synthèse annuelle
     */
    private generateAnnualSummaryPage;
    /**
     * Génère une page pour un trimestre spécifique
     */
    private generateQuarterActivitiesPage;
    /**
     * Génère une page de conclusion
     */
    private generateConclusionPage;
    /**
     * Génère un rapport annuel d'activités au format PDF
     */
    generateAnnualActivitiesPDF(activitiesByQuarter: Map<Quarter, ActivityReport[]>, year: number, statistics: any): Promise<string>;
    /**
     * Génère un rapport annuel d'activités au format WORD
     */
    generateAnnualActivitiesWORD(activitiesByQuarter: Map<Quarter, ActivityReport[]>, year: number, statistics: any): Promise<string>;
    /**
     * Crée un tableau récapitulatif trimestriel pour Word
     */
    private createQuarterlySummaryTable;
    /**
     * Crée un tableau d'activités pour Word
     */
    private createActivitiesTable;
    /**
     * Crée les paragraphes des faits saillants
     */
    private createHighlightsParagraphs;
    /**
     * Crée les paragraphes des tendances
     */
    private createTrendsParagraphs;
    /**
     * Génère un rapport annuel de conventions au format PDF
     */
    generateAnnualConventionsPDF(conventionsByQuarter: Map<Quarter, ConventionReport[]>, year: number, statistics: any): Promise<string>;
    /**
     * Génère un rapport annuel de conventions au format WORD
     */
    generateAnnualConventionsWORD(conventionsByQuarter: Map<Quarter, ConventionReport[]>, year: number, statistics: any): Promise<string>;
    /**
     * Génère un rapport annuel de transferts au format PDF
     */
    generateAnnualKnowledgeTransfersPDF(transfersByQuarter: Map<Quarter, KnowledgeTransferReport[]>, year: number, statistics: any): Promise<string>;
    /**
     * Génère un rapport annuel de transferts au format WORD
     */
    generateAnnualKnowledgeTransfersWORD(transfersByQuarter: Map<Quarter, KnowledgeTransferReport[]>, year: number, statistics: any): Promise<string>;
    /**
     * Nettoie les anciens fichiers de rapport (plus de 24h)
     */
    cleanOldReports(): Promise<void>;
}
export declare const documentGeneratorService: DocumentGeneratorService;
//# sourceMappingURL=document-generator.service.d.ts.map