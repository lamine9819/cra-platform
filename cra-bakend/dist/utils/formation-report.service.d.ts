export interface ReportGenerationOptions {
    format: 'pdf' | 'docx';
    includeHeader?: boolean;
    includeFooter?: boolean;
}
export declare class FormationReportService {
    /**
     * Génère le contenu HTML pour un rapport de formation
     */
    generateHTMLContent(report: any): string;
    /**
     * Génère la section des formations courtes reçues (nouveau format)
     */
    private generateShortTrainingsReceivedSection;
    /**
     * Génère la section des formations diplômantes reçues (format existant)
     */
    private generateDiplomaticTrainingsReceivedSection;
    /**
     * Génère la section des formations dispensées
     */
    private generateTrainingsGivenSection;
    /**
     * Génère la section des encadrements
     */
    private generateSupervisionsSection;
    /**
     * Convertit le type de formation en libellé français
     */
    private getTrainingTypeLabel;
    /**
     * Génère un rapport global pour tous les utilisateurs
     */
    generateGlobalHTMLContent(reports: any[]): string;
    /**
     * Génère le nom de fichier basé sur les données
     */
    generateFilename(report: any, format: 'pdf' | 'docx'): string;
}
//# sourceMappingURL=formation-report.service.d.ts.map