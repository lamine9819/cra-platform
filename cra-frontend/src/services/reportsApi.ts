// src/services/reportsApi.ts
import api from './api';

// =============================================
// TYPES ET INTERFACES
// =============================================

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'project' | 'activity' | 'user' | 'global';
}

export interface ReportPreview {
  type: string;
  title: string;
  creator?: string;
  projectCreator?: string;
  role?: string;
  department?: string;
  summary: {
    [key: string]: number;
  };
  estimatedPages: number;
  sections: string[];
}

export interface GenerateReportRequest {
  type: 'project' | 'activity' | 'user' | 'global';
  entityId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  includeGraphics?: boolean;
  language?: 'fr' | 'en';
}

export interface ReportStats {
  period: number;
  recentActivity: {
    tasks: number;
    projects: number;
    documents: number;
    forms: number;
  };
}

export interface ReportHistoryItem {
  id: string;
  action: string;
  level: string;
  entityType?: string;
  entityId?: string;
  details: {
    reportType: string;
    success: boolean;
    timestamp: string;
  };
  createdAt: string;
}

export interface ExportFilters {
  type: 'users' | 'projects' | 'tasks' | 'documents';
  entityId?: string;
  format?: 'xlsx' | 'csv';
}

// =============================================
// SERVICE API REPORTS
// =============================================

class ReportsApiService {
  private baseUrl = '/reports';

  // Obtenir les templates disponibles
  async getTemplates(): Promise<ReportTemplate[]> {
    try {
      const response = await api.get(`${this.baseUrl}/templates`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des templates');
    }
  }

  // Prévisualiser un rapport
  async previewReport(type: string, entityId?: string): Promise<ReportPreview> {
    try {
      const params = new URLSearchParams({ type });
      if (entityId) params.append('entityId', entityId);
      
      const response = await api.get(`${this.baseUrl}/preview?${params.toString()}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la prévisualisation');
    }
  }

  // Générer un rapport PDF
  async generateReport(data: GenerateReportRequest): Promise<Blob> {
    try {
      const response = await api.post(`${this.baseUrl}/generate`, data, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la génération du rapport');
    }
  }

  // Générer un rapport de projet
  async generateProjectReport(projectId: string, options: Partial<GenerateReportRequest> = {}): Promise<Blob> {
    try {
      const response = await api.post(`${this.baseUrl}/project/${projectId}`, options, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la génération du rapport de projet');
    }
  }

  // Générer un rapport d'activité
  async generateActivityReport(activityId: string, options: Partial<GenerateReportRequest> = {}): Promise<Blob> {
    try {
      const response = await api.post(`${this.baseUrl}/activity/${activityId}`, options, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la génération du rapport d\'activité');
    }
  }

  // Générer un rapport utilisateur
  async generateUserReport(userId: string, options: Partial<GenerateReportRequest> = {}): Promise<Blob> {
    try {
      const response = await api.post(`${this.baseUrl}/user/${userId}`, options, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la génération du rapport utilisateur');
    }
  }

  // Obtenir les statistiques pour rapports
  async getReportStats(period: number = 30): Promise<ReportStats> {
    try {
      const response = await api.get(`${this.baseUrl}/stats?period=${period}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des statistiques');
    }
  }

  // Obtenir l'historique des rapports
  async getReportHistory(page: number = 1, limit: number = 10): Promise<{
    history: ReportHistoryItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    try {
      const response = await api.get(`${this.baseUrl}/history?page=${page}&limit=${limit}`);
      return {
        history: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération de l\'historique');
    }
  }

  // Exporter des données en Excel
  async exportToExcel(filters: ExportFilters): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`${this.baseUrl}/export?${params.toString()}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'export');
    }
  }

  // Exports spécialisés
  async exportUsers(format: 'xlsx' | 'csv' = 'xlsx'): Promise<Blob> {
    return this.exportToExcel({ type: 'users', format });
  }

  async exportProjects(format: 'xlsx' | 'csv' = 'xlsx'): Promise<Blob> {
    return this.exportToExcel({ type: 'projects', format });
  }

  async exportTasks(format: 'xlsx' | 'csv' = 'xlsx'): Promise<Blob> {
    return this.exportToExcel({ type: 'tasks', format });
  }

  async exportDocuments(format: 'xlsx' | 'csv' = 'xlsx'): Promise<Blob> {
    return this.exportToExcel({ type: 'documents', format });
  }

  // Utilitaire pour télécharger un blob
  downloadBlob(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // Télécharger un rapport avec nom automatique
  async downloadReport(type: string, entityId?: string, options: Partial<GenerateReportRequest> = {}): Promise<void> {
    const blob = await this.generateReport({
      type: type as any,
      entityId,
      ...options
    });

    const timestamp = new Date().toISOString().split('T')[0];
    const suffix = entityId ? `_${entityId}` : '';
    let filename = '';

    switch (type) {
      case 'project':
        filename = `rapport_projet${suffix}_${timestamp}.pdf`;
        break;
      case 'activity':
        filename = `rapport_activite${suffix}_${timestamp}.pdf`;
        break;
      case 'user':
        filename = `rapport_utilisateur${suffix}_${timestamp}.pdf`;
        break;
      case 'global':
        filename = `rapport_global_${timestamp}.pdf`;
        break;
      default:
        filename = `rapport_${timestamp}.pdf`;
    }

    this.downloadBlob(blob, filename);
  }
}

// Export singleton
export const reportsApi = new ReportsApiService();
export default reportsApi;