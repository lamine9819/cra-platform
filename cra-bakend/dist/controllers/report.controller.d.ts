import { Request, Response } from 'express';
export declare class ReportController {
    /**
     * Génère un rapport trimestriel
     */
    generateReport(req: Request, res: Response): Promise<void>;
    /**
     * Génère un rapport annuel (tous les trimestres)
     */
    generateAnnualReport(req: Request, res: Response): Promise<void>;
    /**
     * Récupère les statistiques annuelles
     */
    private getAnnualStatistics;
    /**
     * Récupère les trimestres disponibles pour les rapports
     */
    getAvailableQuarters(req: Request, res: Response): Promise<void>;
    /**
     * Récupère les statistiques trimestrielles
     */
    getQuarterlyStats(req: Request, res: Response): Promise<void>;
    /**
     * Récupère les statistiques annuelles
     */
    getAnnualStats(req: Request, res: Response): Promise<void>;
    /**
     * Compare les statistiques entre deux trimestres
     */
    compareQuarters(req: Request, res: Response): Promise<void>;
    /**
     * Récupère la liste des rapports disponibles
     */
    getAvailableReports(req: Request, res: Response): Promise<void>;
    /**
     * Nettoie les anciens rapports
     */
    cleanOldReports(req: Request, res: Response): Promise<void>;
    /**
     * Méthodes privées pour générer les rapports trimestriels
     */
    private generateActivitiesReport;
    private generateConventionsReport;
    private generateKnowledgeTransfersReport;
    /**
     * Envoie le fichier généré au client
     */
    private sendFile;
}
export declare const reportController: ReportController;
//# sourceMappingURL=report.controller.d.ts.map