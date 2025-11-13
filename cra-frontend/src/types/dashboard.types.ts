// src/types/dashboard.types.ts - Types TypeScript pour le dashboard
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: 'CHERCHEUR' | 'ASSISTANT_CHERCHEUR' | 'TECHNICIEN_SUPERIEUR' | 'ADMINISTRATEUR';
  department?: string;
}

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
  user: User;
  projects: ProjectStats;
  tasks: TaskStats;
  documents: DocumentStats;
  activities: ActivityStats;
  forms: FormStats;
  summary: SummaryMetrics;
}
