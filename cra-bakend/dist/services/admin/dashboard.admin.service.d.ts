import { DashboardData, DashboardSummary, RecentActivityItem, DashboardAlert, DashboardCharts, DashboardFilters } from '../../types/admin.types';
/**
 * Service pour gérer le dashboard administrateur
 */
export declare class DashboardAdminService {
    /**
     * Récupère toutes les données du dashboard
     */
    getDashboardData(filters?: DashboardFilters): Promise<DashboardData>;
    /**
     * Récupère le résumé des statistiques globales
     */
    getDashboardSummary(filters?: DashboardFilters): Promise<DashboardSummary>;
    /**
     * Statistiques des utilisateurs
     */
    private getUserStats;
    /**
     * Statistiques des activités
     */
    private getActivityStats;
    /**
     * Statistiques des projets
     */
    private getProjectStats;
    /**
     * Statistiques des thèmes de recherche
     */
    private getThemeStats;
    /**
     * Statistiques des stations de recherche
     */
    private getStationStats;
    /**
     * Statistiques des transferts d'acquis
     */
    private getTransferStats;
    /**
     * Statistiques des notifications
     */
    private getNotificationStats;
    /**
     * Récupère l'activité récente du système depuis les audit logs
     */
    getRecentActivity(limit?: number): Promise<RecentActivityItem[]>;
    /**
     * Génère les alertes système
     */
    getSystemAlerts(): Promise<DashboardAlert[]>;
    /**
     * Méthodes privées pour les alertes
     */
    private getInactiveUsers;
    private getActivitiesWithoutResponsible;
    private getLateProjects;
    private getUpcomingActivities;
    private getLateTasks;
    private getOldUnreadNotifications;
    /**
     * Récupère les données pour les graphiques
     */
    getChartsData(): Promise<DashboardCharts>;
    /**
     * Activités créées par mois (6 derniers mois)
     */
    private getActivitiesPerMonth;
    /**
     * Utilisateurs créés par mois (6 derniers mois)
     */
    private getUsersPerMonth;
    /**
     * Projets créés par mois (6 derniers mois)
     */
    private getProjectsPerMonth;
    /**
     * Transferts créés par mois (6 derniers mois)
     */
    private getTransfersPerMonth;
    /**
     * Taux de complétion des tâches par semaine (4 dernières semaines)
     */
    private getTaskCompletionRate;
    /**
     * Groupe les éléments par mois
     */
    private groupByMonth;
    /**
     * Calcule le taux de complétion par semaine
     */
    private calculateWeeklyCompletionRate;
    /**
     * Obtient la clé de semaine au format ISO (YYYY-WXX)
     */
    private getWeekKey;
}
export declare const dashboardAdminService: DashboardAdminService;
//# sourceMappingURL=dashboard.admin.service.d.ts.map