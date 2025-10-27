// src/services/projectsApi.ts
import api from './api';
import type {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectListQuery,
  ProjectListResponse,
  AddParticipantRequest,
  UpdateParticipantRequest,
  AddPartnershipRequest,
  UpdatePartnershipRequest,
  AddFundingRequest,
  UpdateFundingRequest,
  ProjectStatistics,
  ProjectReport,
  ProjectPartnership,
  ProjectFunding,
  Partner,
} from '../types/project.types';

// =============================================
// SERVICE API PROJECTS
// =============================================

class ProjectsApiService {
  private baseUrl = '/projects';

  // =============================================
  // CRUD DE BASE
  // =============================================

  /**
   * Créer un nouveau projet
   */
  async createProject(data: CreateProjectRequest): Promise<Project> {
    try {
      const response = await api.post(this.baseUrl, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création du projet');
    }
  }

  /**
   * Lister les projets avec filtres
   */
  async listProjects(filters: ProjectListQuery = {}): Promise<ProjectListResponse> {
    try {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`${this.baseUrl}?${params.toString()}`);

      return {
        projects: response.data.data || response.data.projects || [],
        pagination: response.data.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des projets');
    }
  }

  /**
   * Obtenir un projet par ID avec toutes ses relations
   */
  async getProjectById(id: string): Promise<Project> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du projet');
    }
  }

  /**
   * Mettre à jour un projet
   */
  async updateProject(id: string, data: UpdateProjectRequest): Promise<Project> {
    try {
      const response = await api.patch(`${this.baseUrl}/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du projet');
    }
  }

  /**
   * Supprimer un projet
   */
  async deleteProject(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression du projet');
    }
  }

  // =============================================
  // GESTION DES PARTICIPANTS
  // =============================================

  /**
   * Ajouter un participant au projet
   */
  async addParticipant(projectId: string, data: AddParticipantRequest): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/${projectId}/participants`, data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'ajout du participant');
    }
  }

  /**
   * Mettre à jour un participant
   */
  async updateParticipant(projectId: string, data: UpdateParticipantRequest): Promise<void> {
    try {
      await api.patch(`${this.baseUrl}/${projectId}/participants`, data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du participant');
    }
  }

  /**
   * Retirer un participant du projet
   */
  async removeParticipant(projectId: string, participantId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${projectId}/participants/${participantId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors du retrait du participant');
    }
  }

  // =============================================
  // GESTION DES PARTENARIATS
  // =============================================

  /**
   * Lister les partenariats d'un projet
   */
  async getProjectPartnerships(projectId: string): Promise<ProjectPartnership[]> {
    try {
      const response = await api.get(`${this.baseUrl}/${projectId}/partnerships`);
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des partenariats');
    }
  }

  /**
   * Ajouter un partenariat au projet
   */
  async addPartnership(projectId: string, data: AddPartnershipRequest): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/${projectId}/partnerships`, data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'ajout du partenariat');
    }
  }

  /**
   * Mettre à jour un partenariat
   */
  async updatePartnership(projectId: string, data: UpdatePartnershipRequest): Promise<void> {
    try {
      await api.patch(`${this.baseUrl}/${projectId}/partnerships`, data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du partenariat');
    }
  }

  /**
   * Retirer un partenariat du projet
   */
  async removePartnership(projectId: string, partnershipId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${projectId}/partnerships/${partnershipId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors du retrait du partenariat');
    }
  }

  /**
   * Rechercher des partenaires potentiels
   */
  async searchPotentialPartners(
    projectId: string,
    query?: string,
    expertise?: string[],
    type?: string
  ): Promise<Partner[]> {
    try {
      const params = new URLSearchParams();
      if (query) params.append('query', query);
      if (expertise && expertise.length > 0) params.append('expertise', expertise.join(','));
      if (type) params.append('type', type);

      const response = await api.get(`${this.baseUrl}/${projectId}/partners/search?${params.toString()}`);
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la recherche de partenaires');
    }
  }

  // =============================================
  // GESTION DU FINANCEMENT
  // =============================================

  /**
   * Ajouter un financement au projet
   */
  async addFunding(projectId: string, data: AddFundingRequest): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/${projectId}/funding`, data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'ajout du financement');
    }
  }

  /**
   * Mettre à jour un financement
   */
  async updateFunding(projectId: string, data: UpdateFundingRequest): Promise<void> {
    try {
      await api.patch(`${this.baseUrl}/${projectId}/funding`, data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du financement');
    }
  }

  /**
   * Retirer un financement du projet
   */
  async removeFunding(projectId: string, fundingId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${projectId}/funding/${fundingId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors du retrait du financement');
    }
  }

  // =============================================
  // ANALYSE ET RAPPORTS
  // =============================================

  /**
   * Obtenir les statistiques d'un projet
   */
  async getProjectStatistics(projectId: string): Promise<ProjectStatistics> {
    try {
      const response = await api.get(`${this.baseUrl}/${projectId}/statistics`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des statistiques');
    }
  }

  /**
   * Générer un rapport de projet
   */
  async generateProjectReport(
    projectId: string,
    format: 'pdf' | 'word',
    sections?: string[]
  ): Promise<void> {
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      if (sections && sections.length > 0) {
        params.append('sections', sections.join(','));
      }

      // Utiliser responseType: 'blob' pour recevoir le fichier directement
      const response = await api.get(`${this.baseUrl}/${projectId}/reports?${params.toString()}`, {
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
      link.download = `rapport_projet_${projectId}_${Date.now()}.${extension}`;
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
   * Dupliquer un projet
   */
  async duplicateProject(
    id: string,
    options: {
      title?: string;
      copyParticipants?: boolean;
      copyActivities?: boolean;
      copyPartnerships?: boolean;
    }
  ): Promise<Project> {
    try {
      const response = await api.post(`${this.baseUrl}/${id}/duplicate`, options);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la duplication du projet');
    }
  }

  /**
   * Archiver un projet
   */
  async archiveProject(id: string, reason?: string): Promise<Project> {
    try {
      const response = await api.patch(`${this.baseUrl}/${id}/archive`, { reason });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'archivage du projet');
    }
  }

  /**
   * Restaurer un projet archivé
   */
  async restoreProject(id: string, newStatus: string = 'PLANIFIE'): Promise<Project> {
    try {
      const response = await api.patch(`${this.baseUrl}/${id}/restore`, { newStatus });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la restauration du projet');
    }
  }

  // =============================================
  // RECHERCHE PAR CRITÈRES
  // =============================================

  /**
   * Obtenir les projets par thème
   */
  async getProjectsByTheme(themeId: string, page: number = 1, limit: number = 10): Promise<ProjectListResponse> {
    try {
      const response = await api.get(`${this.baseUrl}/theme/${themeId}?page=${page}&limit=${limit}`);
      return {
        projects: response.data.data || [],
        pagination: response.data.pagination || { page, limit, total: 0, totalPages: 0 },
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des projets par thème');
    }
  }

  /**
   * Obtenir les projets par programme de recherche
   */
  async getProjectsByProgram(programId: string, page: number = 1, limit: number = 10): Promise<ProjectListResponse> {
    try {
      const response = await api.get(`${this.baseUrl}/program/${programId}?page=${page}&limit=${limit}`);
      return {
        projects: response.data.data || [],
        pagination: response.data.pagination || { page, limit, total: 0, totalPages: 0 },
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des projets par programme');
    }
  }

  /**
   * Obtenir les projets par convention
   */
  async getProjectsByConvention(conventionId: string, page: number = 1, limit: number = 10): Promise<ProjectListResponse> {
    try {
      const response = await api.get(`${this.baseUrl}/convention/${conventionId}?page=${page}&limit=${limit}`);
      return {
        projects: response.data.data || [],
        pagination: response.data.pagination || { page, limit, total: 0, totalPages: 0 },
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des projets par convention');
    }
  }

  /**
   * Recherche avancée de projets
   */
  async advancedSearch(params: {
    keywords?: string;
    themeIds?: string[];
    programIds?: string[];
    status?: string[];
    page?: number;
    limit?: number;
  }): Promise<ProjectListResponse> {
    try {
      const searchParams = new URLSearchParams();

      if (params.keywords) searchParams.append('keywords', params.keywords);
      if (params.themeIds) searchParams.append('themeIds', params.themeIds.join(','));
      if (params.programIds) searchParams.append('programIds', params.programIds.join(','));
      if (params.status) searchParams.append('status', params.status.join(','));
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());

      const response = await api.get(`${this.baseUrl}/search/advanced?${searchParams.toString()}`);
      return {
        projects: response.data.data || [],
        pagination: response.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 },
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la recherche avancée');
    }
  }
}

// Export singleton
export const projectsApi = new ProjectsApiService();
export default projectsApi;
