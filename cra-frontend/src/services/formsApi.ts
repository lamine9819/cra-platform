// src/services/formsApi.ts
import api from './api';
import type {
  Form,
  FormResponseData,
  CreateFormRequest,
  UpdateFormRequest,
  SubmitFormResponseRequest,
  ShareFormRequest,
  FormShare,
  ExportOptions,
  PublicShareInfo,
  FormComment,
  AddCommentRequest,
  SyncSummary,
  SyncStatus,
  ApiResponse,
} from '../types/form.types';

// =============================================
// SERVICE API FORMULAIRES
// =============================================

class FormsApiService {
  private baseUrl = '/forms';

  // =============================================
  // CRUD DE BASE
  // =============================================

  /**
   * Créer un nouveau formulaire
   */
  async createForm(data: CreateFormRequest): Promise<Form> {
    try {
      const response = await api.post(this.baseUrl, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création du formulaire');
    }
  }

  /**
   * Lister les formulaires
   */
  async listForms(params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    activityId?: string;
  }): Promise<ApiResponse<Form[]>> {
    try {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, value.toString());
          }
        });
      }

      const response = await api.get(`${this.baseUrl}?${searchParams.toString()}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des formulaires');
    }
  }

  /**
   * Obtenir un formulaire par ID
   */
  async getFormById(id: string): Promise<Form> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du formulaire');
    }
  }

  /**
   * Mettre à jour un formulaire
   */
  async updateForm(id: string, data: UpdateFormRequest): Promise<Form> {
    try {
      const response = await api.patch(`${this.baseUrl}/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du formulaire');
    }
  }

  /**
   * Supprimer un formulaire
   */
  async deleteForm(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression du formulaire');
    }
  }

  // =============================================
  // GESTION DES RÉPONSES
  // =============================================

  /**
   * Soumettre une réponse au formulaire
   */
  async submitResponse(formId: string, data: SubmitFormResponseRequest): Promise<FormResponseData> {
    try {
      const response = await api.post(`${this.baseUrl}/${formId}/responses`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la soumission de la réponse');
    }
  }

  /**
   * Obtenir les réponses d'un formulaire
   */
  async getFormResponses(formId: string, params?: {
    page?: number;
    limit?: number;
    collectorType?: string;
  }): Promise<ApiResponse<FormResponseData[]>> {
    try {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, value.toString());
          }
        });
      }

      const response = await api.get(`${this.baseUrl}/${formId}/responses?${searchParams.toString()}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des réponses');
    }
  }

  /**
   * Supprimer une réponse
   */
  async deleteResponse(formId: string, responseId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${formId}/responses/${responseId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression de la réponse');
    }
  }

  // =============================================
  // GESTION DU PARTAGE
  // =============================================

  /**
   * Partager un formulaire
   */
  async shareForm(formId: string, data: ShareFormRequest): Promise<FormShare> {
    try {
      const response = await api.post(`${this.baseUrl}/${formId}/share`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors du partage du formulaire');
    }
  }

  /**
   * Obtenir les partages d'un formulaire
   */
  async getFormShares(formId: string): Promise<FormShare[]> {
    try {
      const response = await api.get(`${this.baseUrl}/${formId}/shares`);
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des partages');
    }
  }

  /**
   * Révoquer un partage
   */
  async revokeShare(formId: string, shareId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${formId}/shares/${shareId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la révocation du partage');
    }
  }

  /**
   * Créer un lien de partage public
   */
  async createPublicLink(formId: string, options?: {
    expiresAt?: string;
    maxSubmissions?: number;
  }): Promise<PublicShareInfo> {
    try {
      const response = await api.post(`${this.baseUrl}/${formId}/public-link`, options);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création du lien public');
    }
  }

  /**
   * Révoquer le lien de partage public
   */
  async revokePublicLink(formId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${formId}/public-link`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la révocation du lien public');
    }
  }

  // =============================================
  // EXPORT
  // =============================================

  /**
   * Exporter les réponses d'un formulaire
   */
  async exportResponses(formId: string, options: ExportOptions): Promise<void> {
    try {
      const response = await api.post(`${this.baseUrl}/${formId}/export`, options, {
        responseType: 'blob',
      });

      // Déterminer l'extension
      const extension = options.format === 'xlsx' ? 'xlsx' : options.format === 'csv' ? 'csv' : 'json';
      const mimeType = options.format === 'xlsx'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : options.format === 'csv'
          ? 'text/csv'
          : 'application/json';

      // Créer un blob et déclencher le téléchargement
      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `form_responses_${formId}_${Date.now()}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'exportation des réponses');
    }
  }

  // =============================================
  // COMMENTAIRES
  // =============================================

  /**
   * Ajouter un commentaire
   */
  async addComment(formId: string, data: AddCommentRequest): Promise<FormComment> {
    try {
      const response = await api.post(`${this.baseUrl}/${formId}/comments`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'ajout du commentaire');
    }
  }

  /**
   * Obtenir les commentaires d'un formulaire
   */
  async getComments(formId: string): Promise<FormComment[]> {
    try {
      const response = await api.get(`${this.baseUrl}/${formId}/comments`);
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des commentaires');
    }
  }

  /**
   * Supprimer un commentaire
   */
  async deleteComment(formId: string, commentId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${formId}/comments/${commentId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression du commentaire');
    }
  }

  // =============================================
  // SYNCHRONISATION OFFLINE
  // =============================================

  /**
   * Synchroniser les données offline
   */
  async syncOfflineData(formId: string, data: any): Promise<SyncSummary> {
    try {
      const response = await api.post(`${this.baseUrl}/${formId}/sync`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la synchronisation');
    }
  }

  /**
   * Obtenir le statut de synchronisation
   */
  async getSyncStatus(formId: string, deviceId: string): Promise<SyncStatus> {
    try {
      const response = await api.get(`${this.baseUrl}/${formId}/sync/status?deviceId=${deviceId}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du statut');
    }
  }

  // =============================================
  // ACCÈS PUBLIC
  // =============================================

  /**
   * Obtenir un formulaire via un lien public
   */
  async getPublicForm(shareToken: string): Promise<Form> {
    try {
      const response = await api.get(`/public/forms/${shareToken}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du formulaire public');
    }
  }

  /**
   * Soumettre une réponse via un lien public
   */
  async submitPublicResponse(shareToken: string, data: SubmitFormResponseRequest): Promise<FormResponseData> {
    try {
      const response = await api.post(`/public/forms/${shareToken}/responses`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la soumission de la réponse publique');
    }
  }
}

// Export singleton
export const formsApi = new FormsApiService();
export default formsApi;

// Re-export types for convenience
export type {
  Form,
  FormField,
  FormSchema,
  FormResponseData,
  CreateFormRequest,
  UpdateFormRequest,
  SubmitFormResponseRequest,
  ShareFormRequest,
  FormShare,
  ExportOptions,
  PublicShareInfo,
  FormComment,
  AddCommentRequest,
  SyncSummary,
  SyncStatus,
  ApiResponse,
  PhotoData,
  ResponsePhoto,
  CollectorInfo,
} from '../types/form.types';
