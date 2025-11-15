/**
 * Types pour le dashboard administrateur
 */
export interface UserStats {
    total: number;
    active: number;
    inactive: number;
    byRole: {
        CHERCHEUR: number;
        COORDONATEUR_PROJET: number;
        ADMINISTRATEUR: number;
    };
}
export interface ActivityStats {
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    byTheme: Array<{
        themeId: string;
        themeName: string;
        count: number;
    }>;
    newVsReconducted: {
        new: number;
        reconducted: number;
    };
    withProjects: number;
    withoutProjects: number;
}
export interface ProjectStats {
    total: number;
    byStatus: Record<string, number>;
}
export interface ThemeStats {
    total: number;
    active: number;
    topThemes: Array<{
        id: string;
        name: string;
        activityCount: number;
    }>;
}
export interface StationStats {
    total: number;
    topStations: Array<{
        id: string;
        name: string;
        activityCount: number;
    }>;
}
export interface TransferStats {
    total: number;
    byType: Record<string, number>;
}
export interface NotificationStats {
    total: number;
    read: number;
    unread: number;
    readRate: number;
}
export interface DashboardSummary {
    users: UserStats;
    activities: ActivityStats;
    projects: ProjectStats;
    themes: ThemeStats;
    stations: StationStats;
    transfers: TransferStats;
    notifications: NotificationStats;
}
export interface RecentActivityItem {
    id: string;
    action: string;
    entityType: string | null;
    entityId: string | null;
    userId: string | null;
    userName: string | null;
    userEmail: string | null;
    timestamp: Date;
    details: any;
    level: string;
}
export type AlertType = 'warning' | 'error' | 'info';
export interface DashboardAlert {
    type: AlertType;
    title: string;
    message: string;
    count?: number;
    entityIds?: string[];
    priority: number;
}
export interface ChartDataPoint {
    label: string;
    value: number;
}
export interface MonthlyChartData {
    month: string;
    count: number;
}
export interface WeeklyChartData {
    week: string;
    rate: number;
}
export interface DashboardCharts {
    activitiesPerMonth: MonthlyChartData[];
    usersPerMonth: MonthlyChartData[];
    projectsPerMonth: MonthlyChartData[];
    taskCompletionRate: WeeklyChartData[];
    transfersPerMonth: MonthlyChartData[];
}
export interface DashboardData {
    summary: DashboardSummary;
    recentActivity: RecentActivityItem[];
    alerts: DashboardAlert[];
    charts: DashboardCharts;
    generatedAt: Date;
}
export interface DashboardStatsResponse {
    summary: DashboardSummary;
    generatedAt: Date;
}
export interface DashboardAlertsResponse {
    alerts: DashboardAlert[];
    generatedAt: Date;
}
export interface DashboardRecentActivityResponse {
    recentActivity: RecentActivityItem[];
    generatedAt: Date;
}
export interface DashboardChartsResponse {
    charts: DashboardCharts;
    generatedAt: Date;
}
/**
 * Filtres optionnels pour les requêtes
 */
export interface DashboardFilters {
    startDate?: Date;
    endDate?: Date;
    themeId?: string;
    stationId?: string;
}
//# sourceMappingURL=admin.types.d.ts.map