export interface DashboardResponse {
    user: {
        id: string;
        firstName: string;
        lastName: string;
        role: string;
        department?: string | null;
    };
    projects: {
        byStatus: {
            PLANIFIE: number;
            EN_COURS: number;
            SUSPENDU: number;
            TERMINE: number;
            ARCHIVE: number;
        };
        total: number;
        userProjects: number;
        recentProjects: Array<{
            id: string;
            title: string;
            status: string;
            createdAt: Date;
            participantCount: number;
        }>;
    };
    tasks: {
        byStatus: {
            A_FAIRE: number;
            EN_COURS: number;
            EN_REVISION: number;
            TERMINEE: number;
            ANNULEE: number;
        };
        byPriority: {
            BASSE: number;
            NORMALE: number;
            HAUTE: number;
            URGENTE: number;
        };
        total: number;
        overdue: number;
        dueToday: number;
        dueThisWeek: number;
        completionRate: number;
        recentTasks: Array<{
            id: string;
            title: string;
            status: string;
            priority: string;
            dueDate?: Date | null;
            project?: {
                id: string;
                title: string;
            } | null;
        }>;
    };
    documents: {
        byType: {
            RAPPORT: number;
            FICHE_ACTIVITE: number;
            FICHE_TECHNIQUE: number;
            DONNEES_EXPERIMENTALES: number;
            FORMULAIRE: number;
            IMAGE: number;
            AUTRE: number;
        };
        total: number;
        totalSize: number;
        totalSizeMB: number;
        userDocuments: number;
        sharedWithUser: number;
        recentDocuments: Array<{
            id: string;
            title: string;
            type: string;
            size: number;
            createdAt: Date;
            owner: {
                firstName: string;
                lastName: string;
            };
        }>;
    };
    activities: {
        byMonth: Array<{
            month: string;
            year: number;
            count: number;
            completedCount: number;
        }>;
        total: number;
        withResults: number;
        averagePerMonth: number;
        recentActivities: Array<{
            id: string;
            title: string;
            startDate?: Date | null;
            endDate?: Date | null;
            project: {
                id: string;
                title: string;
            };
        }>;
    };
    forms?: {
        created?: {
            total: number;
            active: number;
            inactive: number;
            totalResponses: number;
            averageResponsesPerForm: number;
            recentForms: Array<{
                id: string;
                title: string;
                createdAt: Date;
                isActive: boolean;
                responseCount: number;
                activity?: {
                    title: string;
                    project: {
                        title: string;
                    };
                } | null;
            }>;
        };
        participation?: {
            formsToComplete: number;
            responsesSubmitted: number;
            pendingForms: Array<{
                id: string;
                title: string;
                creator: {
                    firstName: string;
                    lastName: string;
                };
                activity?: {
                    title: string;
                    project: {
                        title: string;
                    };
                } | null;
            }>;
            recentResponses: Array<{
                formId: string;
                formTitle: string;
                submittedAt: Date;
                activity?: {
                    title: string;
                    project: {
                        title: string;
                    };
                } | null;
            }>;
        };
        overview?: {
            totalForms: number;
            activeForms: number;
            totalResponses: number;
            uniqueRespondents: number;
            averageResponsesPerForm: number;
            topForms: Array<{
                id: string;
                title: string;
                creator: string;
                responses: number;
            }>;
            responsesTrend: Array<{
                date: string;
                count: number;
            }>;
        };
    };
    summary: {
        productivityScore: number;
        taskCompletionRate: number;
        projectParticipation: number;
        documentContribution: number;
        formEngagement?: number;
        trending: {
            direction: 'up' | 'down' | 'stable';
            percentage: number;
            period: string;
        };
    };
}
export interface DashboardQuery {
    period?: 'week' | 'month' | 'quarter' | 'year';
    includeArchived?: boolean;
    detailed?: boolean;
    includeForms?: boolean;
    formsPeriod?: number;
}
export interface FormMetrics {
    totalCreated: number;
    totalResponses: number;
    averageCompletionTime?: number;
    completionRate: number;
    responsesTrend: Array<{
        date: string;
        count: number;
    }>;
}
export interface UserProductivityMetrics {
    tasksCompleted: number;
    documentsCreated: number;
    formsCreated?: number;
    responsesSubmitted?: number;
    projectContributions: number;
    productivityScore: number;
    trendsComparison: {
        thisWeek: number;
        lastWeek: number;
        thisMonth: number;
        lastMonth: number;
    };
}
export interface SystemOverviewMetrics {
    users: {
        total: number;
        active: number;
        byRole: Record<string, number>;
    };
    projects: {
        total: number;
        active: number;
        byStatus: Record<string, number>;
    };
    content: {
        documents: number;
        tasks: number;
        forms: number;
        responses: number;
    };
    activity: {
        loginsToday: number;
        documentsUploadedToday: number;
        tasksCreatedToday: number;
        formsSubmittedToday: number;
    };
}
export interface QuickStatsResponse {
    activeTasks: number;
    activeProjects: number;
    myDocuments: number;
    unreadNotifications: number;
    myForms?: number;
    pendingForms?: number;
    responsesSubmitted?: number;
}
export interface PerformanceMetricsResponse {
    taskTrend: TrendMetric;
    activityTrend: TrendMetric;
    completionRate: CompletionRate;
    formTrend?: TrendMetric;
}
interface TrendMetric {
    thisMonth: number;
    lastMonth: number;
    change: number;
    direction: 'up' | 'down' | 'stable';
}
interface CompletionRate {
    thisMonth: number;
    lastMonth: number;
}
export {};
//# sourceMappingURL=dashboard.types.d.ts.map