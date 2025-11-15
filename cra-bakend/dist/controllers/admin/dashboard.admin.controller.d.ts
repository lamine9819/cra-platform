import { Request, Response, NextFunction } from 'express';
/**
 * Contrôleur pour le dashboard administrateur
 */
export declare class DashboardAdminController {
    /**
     * GET /api/admin/dashboard
     * Récupère toutes les données du dashboard
     */
    getDashboard(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /api/admin/dashboard/stats
     * Récupère uniquement les statistiques globales
     */
    getStats(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /api/admin/dashboard/alerts
     * Récupère uniquement les alertes système
     */
    getAlerts(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /api/admin/dashboard/recent
     * Récupère l'activité récente du système
     */
    getRecentActivity(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /api/admin/dashboard/charts
     * Récupère les données pour les graphiques
     */
    getCharts(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Extrait les filtres depuis les query parameters
     */
    private extractFilters;
}
export declare const dashboardAdminController: DashboardAdminController;
//# sourceMappingURL=dashboard.admin.controller.d.ts.map