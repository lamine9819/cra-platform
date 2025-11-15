import { DashboardResponse, DashboardQuery } from '../types/dashboard.types';
export declare class DashboardService {
    getDashboardData(userId: string, userRole: string, query: DashboardQuery): Promise<DashboardResponse>;
    private getProjectStatistics;
    private getTaskStatistics;
    private getDocumentStatistics;
    private getActivityStatistics;
    private getFormStatistics;
    private getTechnicianFormStats;
    private getParticipantFormStats;
    private getAdminFormStats;
    private getBasicFormStats;
    private calculateSummaryMetrics;
    private getResponsesTrend;
    getFormPerformanceMetrics(userId: string, userRole: string, period?: number): Promise<{
        period: number;
        formsCreated: number;
        responsesReceived: number;
        avgResponseTime: number;
        completionRates: {
            formId: any;
            title: any;
            expectedResponses: any;
            actualResponses: any;
            completionRate: number;
        }[];
        responsesSubmitted?: undefined;
        participationRate?: undefined;
    } | {
        period: number;
        responsesSubmitted: number;
        participationRate: number;
        formsCreated?: undefined;
        responsesReceived?: undefined;
        avgResponseTime?: undefined;
        completionRates?: undefined;
    }>;
    private getFormCompletionRates;
}
//# sourceMappingURL=dashboard.service.d.ts.map