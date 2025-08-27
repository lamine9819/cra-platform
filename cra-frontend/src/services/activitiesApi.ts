// src/services/activitiesApi.ts - Version corrigée et complète
import api from './api';

// =============================================
// TYPES ET INTERFACES
// =============================================

export interface Activity {
  id: string;
  title: string;
  description?: string;
  objectives: string[];
  methodology?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  results?: string;
  conclusions?: string;
  createdAt: string;
  updatedAt: string;
  projectId: string;
  project?: {
    id: string;
    title: string;
    status: string;
  };
  tasks?: any[];
  documents?: any[];
  forms?: any[];
  _count?: {
    tasks: number;
    documents: number;
    forms: number;
  };
}

export interface ActivityFilters {
  search?: string;
  projectId?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  hasResults?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'title' | 'createdAt' | 'updatedAt' | 'startDate';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateActivityRequest {
  title: string;
  description?: string;
  objectives: string[];
  methodology?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  results?: string;
  conclusions?: string;
  projectId: string;
}

// ✅ CORRECTION PRINCIPALE : Permettre la modification du projectId
export interface UpdateActivityRequest {
  title?: string;
  description?: string;
  objectives?: string[];
  methodology?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  results?: string;
  conclusions?: string;
  projectId?: string; // ✅ AJOUT: permettre la modification du projet
}

export interface LinkFormRequest {
  formId: string;
}

export interface LinkDocumentRequest {
  documentId: string;
}

// ✅ AJOUT: Interface pour les statistiques
export interface ActivityStats {
  total: number;
  byProject: Record<string, number>;
  recent: Activity[];
  withResults: number;
  inProgress: number;
  completed: number;
}

// =============================================
// SERVICE API ACTIVITIES
// =============================================

class ActivitiesApiService {
  private baseUrl = '/activities';

  // Créer une nouvelle activité
  async createActivity(data: CreateActivityRequest): Promise<Activity> {
    try {
      const response = await api.post(this.baseUrl, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création de l\'activité');
    }
  }

  // Lister les activités avec filtres
  async listActivities(filters: ActivityFilters = {}): Promise<{
    activities: Activity[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`${this.baseUrl}?${params.toString()}`);
      
      return {
        activities: response.data.data || [],
        pagination: response.data.pagination || {
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 0
        }
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des activités');
    }
  }

  // Obtenir une activité par ID
  async getActivityById(id: string): Promise<Activity> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération de l\'activité');
    }
  }

  // Mettre à jour une activité
  async updateActivity(id: string, data: UpdateActivityRequest): Promise<Activity> {
    try {
      const response = await api.patch(`${this.baseUrl}/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour de l\'activité');
    }
  }

  // Supprimer une activité
  async deleteActivity(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression de l\'activité');
    }
  }

  // Dupliquer une activité
  async duplicateActivity(id: string, newTitle?: string): Promise<Activity> {
    try {
      const response = await api.post(`${this.baseUrl}/${id}/duplicate`, {
        title: newTitle
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la duplication de l\'activité');
    }
  }

  // Lier un formulaire à une activité
  async linkForm(activityId: string, formId: string): Promise<any> {
    try {
      const response = await api.post(`${this.baseUrl}/${activityId}/forms`, { formId });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la liaison du formulaire');
    }
  }

  // Délier un formulaire d'une activité
  async unlinkForm(activityId: string, formId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${activityId}/forms/${formId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression du lien formulaire');
    }
  }

  // Lier un document à une activité
  async linkDocument(activityId: string, documentId: string): Promise<any> {
    try {
      const response = await api.post(`${this.baseUrl}/${activityId}/documents`, { documentId });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la liaison du document');
    }
  }

  // ✅ AMÉLIORATION: Obtenir les statistiques des activités
  async getActivityStats(): Promise<ActivityStats> {
    try {
      const response = await api.get(`${this.baseUrl}/stats`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des statistiques');
    }
  }

  // Obtenir les activités d'un projet spécifique
  async getActivitiesByProject(projectId: string, filters: Omit<ActivityFilters, 'projectId'> = {}): Promise<{
    activities: Activity[];
    pagination: any;
  }> {
    return this.listActivities({ ...filters, projectId });
  }

  // Recherche d'activités
  async searchActivities(query: string, limit: number = 10): Promise<Activity[]> {
    try {
      const response = await this.listActivities({
        search: query,
        limit,
        sortBy: 'updatedAt',
        sortOrder: 'desc'
      });
      return response.activities;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la recherche d\'activités');
    }
  }

  // ✅ AJOUT: Obtenir les activités récentes
  async getRecentActivities(limit: number = 10): Promise<Activity[]> {
    try {
      const response = await this.listActivities({
        limit,
        sortBy: 'updatedAt',
        sortOrder: 'desc'
      });
      return response.activities;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des activités récentes');
    }
  }

  // ✅ AJOUT: Exporter les activités
  async exportActivities(filters: ActivityFilters = {}): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`${this.baseUrl}/export?${params.toString()}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'exportation');
    }
  }

  // ✅ AJOUT: Obtenir le résumé d'une activité
  async getActivitySummary(id: string): Promise<{
    activity: Activity;
    tasksSummary: {
      total: number;
      completed: number;
      pending: number;
    };
    documentsSummary: {
      total: number;
      byType: Record<string, number>;
    };
  }> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}/summary`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du résumé');
    }
  }
}

// Export singleton
export const activitiesApi = new ActivitiesApiService();
export default activitiesApi;