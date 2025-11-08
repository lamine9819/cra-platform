// src/services/activitiesApi.ts
import api from './api';
import type {
  Activity,
  CreateActivityRequest,
  UpdateActivityRequest,
  ActivityListQuery,
  ActivityListResponse,
  ActivityParticipant,
  ActivityPartnership,
  ActivityFunding,
  ActivityTask,
  AddActivityParticipantRequest,
  UpdateActivityParticipantRequest,
  AddActivityPartnershipRequest,
  UpdateActivityPartnershipRequest,
  AddActivityFundingRequest,
  UpdateActivityFundingRequest,
  CreateActivityTaskRequest,
  UpdateActivityTaskRequest,
  ReconductActivityRequest,
  ActivityStatistics,
} from '../types/activity.types';

// =============================================
// SERVICE API ACTIVITÉS
// =============================================

class ActivitiesApiService {
  private baseUrl = '/activities';

  // =============================================
  // CRUD DE BASE
  // =============================================

  /**
   * Créer une nouvelle activité
   */
  async createActivity(data: CreateActivityRequest): Promise<Activity> {
    try {
      const response = await api.post(this.baseUrl, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création de l\'activité');
    }
  }

  /**
   * Lister les activités avec filtres
   */
  async listActivities(filters: ActivityListQuery = {}): Promise<ActivityListResponse> {
    try {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`${this.baseUrl}?${params.toString()}`);

      return {
        activities: response.data.data || response.data.activities || [],
        pagination: response.data.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des activités');
    }
  }

  /**
   * Obtenir une activité par ID avec toutes ses relations
   */
  async getActivityById(id: string): Promise<Activity> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération de l\'activité');
    }
  }

  /**
   * Mettre à jour une activité
   */
  async updateActivity(id: string, data: UpdateActivityRequest): Promise<Activity> {
    try {
      const response = await api.patch(`${this.baseUrl}/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour de l\'activité');
    }
  }

  /**
   * Supprimer une activité
   */
  async deleteActivity(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression de l\'activité');
    }
  }

  // =============================================
  // GESTION DES PARTICIPANTS
  // =============================================

  /**
   * Lister les participants d'une activité
   */
  async getActivityParticipants(activityId: string): Promise<ActivityParticipant[]> {
    try {
      const response = await api.get(`${this.baseUrl}/${activityId}/participants`);
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des participants');
    }
  }

  /**
   * Ajouter un participant à l'activité
   */
  async addParticipant(activityId: string, data: AddActivityParticipantRequest): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/${activityId}/participants`, data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'ajout du participant');
    }
  }

  /**
   * Mettre à jour un participant
   */
  async updateParticipant(activityId: string, participantId: string, data: UpdateActivityParticipantRequest): Promise<void> {
    try {
      await api.patch(`${this.baseUrl}/${activityId}/participants/${participantId}`, data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du participant');
    }
  }

  /**
   * Retirer un participant de l'activité
   */
  async removeParticipant(activityId: string, participantId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${activityId}/participants/${participantId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors du retrait du participant');
    }
  }

  // =============================================
  // GESTION DES PARTENARIATS
  // =============================================

  /**
   * Lister les partenariats d'une activité
   */
  async getActivityPartnerships(activityId: string): Promise<ActivityPartnership[]> {
    try {
      const response = await api.get(`${this.baseUrl}/${activityId}/partnerships`);
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des partenariats');
    }
  }

  /**
   * Ajouter un partenariat à l'activité
   */
  async addPartnership(activityId: string, data: AddActivityPartnershipRequest): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/${activityId}/partnerships`, data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'ajout du partenariat');
    }
  }

  /**
   * Mettre à jour un partenariat
   */
  async updatePartnership(activityId: string, partnershipId: string, data: UpdateActivityPartnershipRequest): Promise<void> {
    try {
      await api.patch(`${this.baseUrl}/${activityId}/partnerships/${partnershipId}`, data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du partenariat');
    }
  }

  /**
   * Retirer un partenariat de l'activité
   */
  async removePartnership(activityId: string, partnershipId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${activityId}/partnerships/${partnershipId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors du retrait du partenariat');
    }
  }

  // =============================================
  // GESTION DU FINANCEMENT
  // =============================================

  /**
   * Lister les financements d'une activité
   */
  async getActivityFundings(activityId: string): Promise<ActivityFunding[]> {
    try {
      const response = await api.get(`${this.baseUrl}/${activityId}/fundings`);
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des financements');
    }
  }

  /**
   * Ajouter un financement à l'activité
   */
  async addFunding(activityId: string, data: AddActivityFundingRequest): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/${activityId}/fundings`, data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'ajout du financement');
    }
  }

  /**
   * Mettre à jour un financement
   */
  async updateFunding(activityId: string, fundingId: string, data: UpdateActivityFundingRequest): Promise<void> {
    try {
      await api.patch(`${this.baseUrl}/${activityId}/fundings/${fundingId}`, data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du financement');
    }
  }

  /**
   * Retirer un financement de l'activité
   */
  async removeFunding(activityId: string, fundingId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${activityId}/fundings/${fundingId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors du retrait du financement');
    }
  }

  // =============================================
  // GESTION DES TÂCHES
  // =============================================

  /**
   * Lister les tâches d'une activité
   */
  async getActivityTasks(activityId: string): Promise<ActivityTask[]> {
    try {
      const response = await api.get(`${this.baseUrl}/${activityId}/tasks`);
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des tâches');
    }
  }

  /**
   * Créer une tâche pour l'activité
   */
  async createTask(activityId: string, data: CreateActivityTaskRequest): Promise<ActivityTask> {
    try {
      const response = await api.post(`${this.baseUrl}/${activityId}/tasks`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création de la tâche');
    }
  }

  /**
   * Mettre à jour une tâche
   */
  async updateTask(activityId: string, taskId: string, data: UpdateActivityTaskRequest): Promise<ActivityTask> {
    try {
      const response = await api.patch(`${this.baseUrl}/${activityId}/tasks/${taskId}`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour de la tâche');
    }
  }

  /**
   * Supprimer une tâche
   */
  async deleteTask(activityId: string, taskId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${activityId}/tasks/${taskId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression de la tâche');
    }
  }

  // =============================================
  // CYCLE DE VIE ET RECONDUCTION
  // =============================================

  /**
   * Reconduire une activité (créer une nouvelle occurrence)
   */
  async reconductActivity(activityId: string, data: ReconductActivityRequest): Promise<Activity> {
    try {
      const response = await api.post(`${this.baseUrl}/${activityId}/recurrence`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la reconduction de l\'activité');
    }
  }

  /**
   * Clôturer une activité
   */
  async closeActivity(activityId: string, results: string, conclusions: string): Promise<Activity> {
    try {
      const response = await api.patch(`${this.baseUrl}/${activityId}/close`, {
        results,
        conclusions,
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la clôture de l\'activité');
    }
  }

  /**
   * Obtenir l'historique de reconduction d'une activité
   */
  async getRecurrenceHistory(activityId: string): Promise<Activity[]> {
    try {
      const response = await api.get(`${this.baseUrl}/${activityId}/recurrence-history`);
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération de l\'historique');
    }
  }

  // =============================================
  // STATISTIQUES ET ANALYSE
  // =============================================

  /**
   * Obtenir les statistiques globales des activités
   */
  async getStatistics(filters?: ActivityListQuery): Promise<ActivityStatistics> {
    try {
      const params = new URLSearchParams();

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
      }

      const url = params.toString() ? `${this.baseUrl}/stats?${params.toString()}` : `${this.baseUrl}/stats`;
      const response = await api.get(url);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des statistiques');
    }
  }

  /**
   * Générer un rapport d'activité
   */
  async generateReport(
    activityId: string,
    format: 'pdf' | 'word',
    sections?: string[]
  ): Promise<void> {
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      if (sections && sections.length > 0) {
        params.append('sections', sections.join(','));
      }

      const response = await api.get(`${this.baseUrl}/${activityId}/report?${params.toString()}`, {
        responseType: 'blob',
      });

      // Déterminer le type MIME et l'extension
      const mimeType = format === 'word'
        ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        : 'application/pdf';
      const extension = format === 'word' ? 'docx' : 'pdf';

      // Créer un blob et déclencher le téléchargement
      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rapport_activite_${activityId}_${Date.now()}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la génération du rapport');
    }
  }

  // =============================================
  // ACTIONS SPÉCIALES
  // =============================================

  /**
   * Dupliquer une activité
   */
  async duplicateActivity(
    id: string,
    options: {
      title?: string;
      copyParticipants?: boolean;
      copyTasks?: boolean;
      copyPartnerships?: boolean;
      copyFundings?: boolean;
    }
  ): Promise<Activity> {
    try {
      const response = await api.post(`${this.baseUrl}/${id}/duplicate`, options);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la duplication de l\'activité');
    }
  }

  /**
   * Suspendre une activité
   */
  async suspendActivity(id: string, reason?: string): Promise<Activity> {
    try {
      const response = await api.patch(`${this.baseUrl}/${id}/suspend`, { reason });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suspension de l\'activité');
    }
  }

  /**
   * Reprendre une activité suspendue
   */
  async resumeActivity(id: string): Promise<Activity> {
    try {
      const response = await api.patch(`${this.baseUrl}/${id}/resume`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la reprise de l\'activité');
    }
  }

  /**
   * Annuler une activité
   */
  async cancelActivity(id: string, reason: string): Promise<Activity> {
    try {
      const response = await api.patch(`${this.baseUrl}/${id}/cancel`, { reason });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'annulation de l\'activité');
    }
  }

  // =============================================
  // RECHERCHE PAR CRITÈRES
  // =============================================

  /**
   * Obtenir les activités par thème
   */
  async getActivitiesByTheme(themeId: string, page: number = 1, limit: number = 10): Promise<ActivityListResponse> {
    try {
      const response = await api.get(`${this.baseUrl}/theme/${themeId}?page=${page}&limit=${limit}`);
      return {
        activities: response.data.data || [],
        pagination: response.data.pagination || { page, limit, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des activités par thème');
    }
  }

  /**
   * Obtenir les activités par station
   */
  async getActivitiesByStation(stationId: string, page: number = 1, limit: number = 10): Promise<ActivityListResponse> {
    try {
      const response = await api.get(`${this.baseUrl}/station/${stationId}?page=${page}&limit=${limit}`);
      return {
        activities: response.data.data || [],
        pagination: response.data.pagination || { page, limit, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des activités par station');
    }
  }

  /**
   * Obtenir les activités par responsable
   */
  async getActivitiesByResponsible(responsibleId: string, page: number = 1, limit: number = 10): Promise<ActivityListResponse> {
    try {
      const response = await api.get(`${this.baseUrl}/responsible/${responsibleId}?page=${page}&limit=${limit}`);
      return {
        activities: response.data.data || [],
        pagination: response.data.pagination || { page, limit, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des activités par responsable');
    }
  }

  /**
   * Obtenir les activités par convention
   */
  async getActivitiesByConvention(conventionId: string, page: number = 1, limit: number = 10): Promise<ActivityListResponse> {
    try {
      const response = await api.get(`${this.baseUrl}/convention/${conventionId}?page=${page}&limit=${limit}`);
      return {
        activities: response.data.data || [],
        pagination: response.data.pagination || { page, limit, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des activités par convention');
    }
  }

  /**
   * Obtenir les activités par projet
   */
  async getActivitiesByProject(projectId: string, page: number = 1, limit: number = 10): Promise<ActivityListResponse> {
    return this.listActivities({ projectId, page, limit });
  }

  /**
   * Obtenir les activités sans projet assigné
   */
  async getActivitiesWithoutProject(page: number = 1, limit: number = 10): Promise<ActivityListResponse> {
    return this.listActivities({ withoutProject: true, page, limit });
  }

  /**
   * Recherche avancée d'activités
   */
  async advancedSearch(params: {
    keywords?: string;
    types?: string[];
    statuses?: string[];
    themeIds?: string[];
    stationIds?: string[];
    page?: number;
    limit?: number;
  }): Promise<ActivityListResponse> {
    try {
      const searchParams = new URLSearchParams();

      if (params.keywords) searchParams.append('keywords', params.keywords);
      if (params.types) searchParams.append('types', params.types.join(','));
      if (params.statuses) searchParams.append('statuses', params.statuses.join(','));
      if (params.themeIds) searchParams.append('themeIds', params.themeIds.join(','));
      if (params.stationIds) searchParams.append('stationIds', params.stationIds.join(','));
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());

      const response = await api.get(`${this.baseUrl}/search/advanced?${searchParams.toString()}`);
      return {
        activities: response.data.data || [],
        pagination: response.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la recherche avancée');
    }
  }

  /**
   * Exporter les activités vers Excel
   */
  async exportActivities(filters?: ActivityListQuery): Promise<void> {
    try {
      const params = new URLSearchParams();

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
      }

      const url = params.toString() ? `${this.baseUrl}/export?${params.toString()}` : `${this.baseUrl}/export`;
      const response = await api.get(url, { responseType: 'blob' });

      // Créer un blob et déclencher le téléchargement
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `activites_${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'exportation des activités');
    }
  }
}

// Export singleton
export const activitiesApi = new ActivitiesApiService();
export default activitiesApi;
