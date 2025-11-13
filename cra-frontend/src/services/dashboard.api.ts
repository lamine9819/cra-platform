// src/services/dashboard.api.ts
import api from './api';

export interface DashboardQuery {
  period?: 'week' | 'month' | 'quarter' | 'year';
  includeArchived?: boolean;
  detailed?: boolean;
  includeForms?: boolean;
  formsPeriod?: number;
}

export interface ProjectStats {
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
    createdAt: string;
    participantCount: number;
  }>;
}

export interface TaskStats {
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
    dueDate?: string;
    project?: {
      id: string;
      title: string;
    };
  }>;
}

export interface DocumentStats {
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
    createdAt: string;
    owner: {
      firstName: string;
      lastName: string;
    };
  }>;
}

export interface ActivityStats {
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
    startDate?: string;
    endDate?: string;
    project?: {
      id: string;
      title: string;
    };
  }>;
}

export interface FormStats {
  created?: {
    total: number;
    active: number;
    inactive: number;
    totalResponses: number;
    averageResponsesPerForm: number;
    responsesByForm: Array<{
      formId: string;
      responseCount: number;
    }>;
    recentForms: Array<{
      id: string;
      title: string;
      createdAt: string;
      isActive: boolean;
      responseCount: number;
      activity?: {
        title: string;
        project: {
          title: string;
        };
      };
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
      activity: {
        title: string;
        project: {
          title: string;
        };
      };
    }>;
    recentResponses: Array<{
      formId: string;
      formTitle: string;
      submittedAt: string;
      activity: {
        title: string;
        project: {
          title: string;
        };
      };
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
}

export interface SummaryMetrics {
  productivityScore: number;
  taskCompletionRate: number;
  projectParticipation: number;
  documentContribution: number;
  formEngagement: number;
  trending: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
    period: string;
  };
}

export interface DashboardResponse {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
    department?: string;
  };
  projects: ProjectStats;
  tasks: TaskStats;
  documents: DocumentStats;
  activities: ActivityStats;
  forms: FormStats;
  summary: SummaryMetrics;
}

export interface QuickStats {
  activeTasks: number;
  activeProjects: number;
  myDocuments: number;
  unreadNotifications: number;
  myForms?: number;
  formsWithResponses?: number;
  pendingForms?: number;
  responsesSubmitted?: number;
  totalForms?: number;
  totalResponses?: number;
}

export interface PerformanceMetrics {
  taskTrend: {
    thisMonth: number;
    lastMonth: number;
    change: number;
    direction: 'up' | 'down' | 'stable';
  };
  activityTrend: {
    thisMonth: number;
    lastMonth: number;
    change: number;
    direction: 'up' | 'down' | 'stable';
  };
  completionRate: {
    thisMonth: number;
    lastMonth: number;
  };
  formTrend: {
    thisMonth: number;
    lastMonth: number;
    change: number;
    direction: 'up' | 'down' | 'stable';
    responsesThisMonth?: number;
    responsesLastMonth?: number;
  };
}

export interface FormMetrics {
  period: number;
  formsCreated?: number;
  responsesReceived?: number;
  avgResponseTime?: number;
  completionRates?: Array<{
    formId: string;
    title: string;
    expectedResponses: number;
    actualResponses: number;
    completionRate: number;
  }>;
  responsesSubmitted?: number;
  participationRate?: number;
}

export interface DataCollectionStats {
  totalResponses: number;
  responsesByForm: number;
  recentResponses: Array<{
    form: {
      title: string;
      activity?: {
        title: string;
        project: {
          title: string;
        };
      };
    };
    respondent: {
      firstName: string;
      lastName: string;
    };
    submittedAt: string;
  }>;
  trend: Array<{
    date: string;
    count: number;
  }>;
}

class DashboardService {
  /**
   * Récupère les données complètes du dashboard
   */
  async getDashboardData(query?: DashboardQuery): Promise<DashboardResponse> {
    const params = new URLSearchParams();
    
    if (query?.period) params.append('period', query.period);
    if (query?.includeArchived !== undefined) params.append('includeArchived', query.includeArchived.toString());
    if (query?.detailed !== undefined) params.append('detailed', query.detailed.toString());
    if (query?.includeForms !== undefined) params.append('includeForms', query.includeForms.toString());
    if (query?.formsPeriod) params.append('formsPeriod', query.formsPeriod.toString());

    const response = await api.get(`/dashboard?${params.toString()}`);
    return response.data.data;
  }

  /**
   * Récupère les statistiques rapides
   */
  async getQuickStats(): Promise<QuickStats> {
    const response = await api.get('/dashboard/quick-stats');
    return response.data.data;
  }

  /**
   * Récupère les métriques de performance
   */
  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    const response = await api.get('/dashboard/performance');
    return response.data.data;
  }

  /**
   * Récupère les statistiques des formulaires
   */
  async getFormStats(period: number = 30): Promise<FormMetrics> {
    const response = await api.get(`/dashboard/forms/stats?period=${period}`);
    return response.data.data;
  }

  /**
   * Récupère les statistiques de collecte de données
   */
  async getDataCollectionStats(): Promise<DataCollectionStats> {
    const response = await api.get('/dashboard/data-collection/stats');
    return response.data.data;
  }
}

export const dashboardService = new DashboardService();