// src/services/publicationsApi.ts
import api from './api';
import type {
  Publication,
  CreatePublicationRequest,
  UpdatePublicationRequest,
  PublicationQuery,
  PublicationListResponse,
  PublicationStats,
  GenerateReportQuery
} from '../types/publication.types';

// =============================================
// SERVICE API PUBLICATIONS
// =============================================

class PublicationsApiService {
  private baseUrl = '/publications';

  // =============================================
  // CRUD DE BASE
  // =============================================

  /**
   * Créer une nouvelle publication
   */
  async createPublication(data: CreatePublicationRequest): Promise<Publication> {
    try {
      const response = await api.post(this.baseUrl, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création de la publication');
    }
  }

  /**
   * Lister les publications avec filtres et pagination
   */
  async listPublications(filters: PublicationQuery = {}): Promise<PublicationListResponse> {
    try {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`${this.baseUrl}?${params.toString()}`);

      return {
        publications: response.data.data || response.data.publications || [],
        pagination: response.data.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des publications');
    }
  }

  /**
   * Obtenir une publication par ID
   */
  async getPublicationById(id: string): Promise<Publication> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération de la publication');
    }
  }

  /**
   * Mettre à jour une publication
   */
  async updatePublication(id: string, data: UpdatePublicationRequest): Promise<Publication> {
    try {
      const response = await api.put(`${this.baseUrl}/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour de la publication');
    }
  }

  /**
   * Supprimer une publication
   */
  async deletePublication(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression de la publication');
    }
  }

  // =============================================
  // REQUÊTES SPÉCIFIQUES
  // =============================================

  /**
   * Obtenir mes publications
   */
  async getMyPublications(year?: number): Promise<Publication[]> {
    try {
      const params = year ? `?year=${year}` : '';
      const response = await api.get(`${this.baseUrl}/me${params}`);
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération de vos publications');
    }
  }

  /**
   * Obtenir les statistiques des publications
   */
  async getPublicationStats(userId?: string): Promise<PublicationStats> {
    try {
      const params = userId ? `?userId=${userId}` : '';
      const response = await api.get(`${this.baseUrl}/stats${params}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des statistiques');
    }
  }

  // =============================================
  // GESTION DES DOCUMENTS
  // =============================================

  /**
   * Uploader un document PDF pour une publication
   */
  async uploadDocument(publicationId: string, file: File): Promise<Publication> {
    try {
      const formData = new FormData();
      formData.append('document', file);

      const response = await api.post(
        `${this.baseUrl}/${publicationId}/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'upload du document');
    }
  }

  /**
   * Télécharger le document d'une publication
   */
  async downloadDocument(publicationId: string): Promise<void> {
    try {
      const response = await api.get(
        `${this.baseUrl}/${publicationId}/download`,
        {
          responseType: 'blob'
        }
      );

      // Extraire le nom du fichier depuis les headers
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'document.pdf';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors du téléchargement du document');
    }
  }

  // =============================================
  // RAPPORTS
  // =============================================

  /**
   * Générer un rapport de publications
   */
  async generateReport(params: GenerateReportQuery): Promise<void> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('researcherId', params.researcherId);
      queryParams.append('year', params.year.toString());
      if (params.format) {
        queryParams.append('format', params.format);
      }

      const response = await api.get(
        `${this.baseUrl}/report/generate?${queryParams.toString()}`,
        {
          responseType: 'blob'
        }
      );

      // Extraire le nom du fichier depuis les headers
      const contentDisposition = response.headers['content-disposition'];
      let filename = `rapport-publications-${params.year}.${params.format || 'pdf'}`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la génération du rapport');
    }
  }
}

export const publicationsApi = new PublicationsApiService();
export default publicationsApi;
