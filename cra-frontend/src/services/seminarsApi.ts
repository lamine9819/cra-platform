// src/services/seminarsApi.ts
import api from './api';

// Import conditionnel des types - créez d'abord le fichier seminar.types.ts
import type { 
  CreateSeminarRequest, 
  UpdateSeminarRequest, 
  SeminarListQuery, 
  SeminarResponse,
  SeminarStatsResponse,
  SeminarRegistrationRequest 
} from '../types/seminar.types';

// =============================================
// INTERFACES SUPPLÉMENTAIRES
// =============================================

export interface SeminarFilters extends SeminarListQuery {}

export interface SeminarListResponse {
  seminars: SeminarResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface RegistrationResponse {
  id: string;
  registeredAt: Date;
  participant: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  seminar: {
    id: string;
    title: string;
    startDate: Date;
    location?: string;
  };
  message: string;
}

// =============================================
// SERVICE API SÉMINAIRES
// =============================================

class SeminarsApiService {
  private baseUrl = '/seminars';

  // =============================================
  // GESTION DES SÉMINAIRES
  // =============================================

  /**
   * Créer un nouveau séminaire
   */
  async createSeminar(data: CreateSeminarRequest): Promise<SeminarResponse> {
    try {
      const response = await api.post(this.baseUrl, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création du séminaire');
    }
  }

  /**
   * Lister les séminaires avec filtres
   */
  async listSeminars(filters: SeminarFilters = {}): Promise<SeminarListResponse> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`${this.baseUrl}?${params.toString()}`);
      
      return {
        seminars: response.data.data || [],
        pagination: response.data.pagination || {
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        }
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des séminaires');
    }
  }

  /**
   * Obtenir un séminaire par ID
   */
  async getSeminarById(id: string): Promise<SeminarResponse> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du séminaire');
    }
  }

  /**
   * Mettre à jour un séminaire
   */
  async updateSeminar(id: string, data: UpdateSeminarRequest): Promise<SeminarResponse> {
    try {
      const response = await api.patch(`${this.baseUrl}/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du séminaire');
    }
  }

  /**
   * Supprimer un séminaire
   */
  async deleteSeminar(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression du séminaire');
    }
  }

  // =============================================
  // GESTION DES INSCRIPTIONS
  // =============================================

  /**
   * S'inscrire à un séminaire
   */
  async registerToSeminar(seminarId: string, registration?: SeminarRegistrationRequest): Promise<RegistrationResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/${seminarId}/register`, registration || {});
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'inscription au séminaire');
    }
  }

  /**
   * Se désinscrire d'un séminaire
   */
  async unregisterFromSeminar(seminarId: string, userId?: string): Promise<{ message: string }> {
    try {
      const params = userId ? `?userId=${userId}` : '';
      const response = await api.delete(`${this.baseUrl}/${seminarId}/unregister${params}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la désinscription du séminaire');
    }
  }

  /**
   * Marquer la présence d'un participant
   */
  async markAttendance(seminarId: string, participantId: string): Promise<{ message: string; attendedAt: Date }> {
    try {
      const response = await api.patch(`${this.baseUrl}/${seminarId}/attendance/${participantId}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la prise de présence');
    }
  }

  // =============================================
  // REQUÊTES SPÉCIALISÉES
  // =============================================

  /**
   * Obtenir les séminaires passés
   */
  async getPastSeminars(filters: Omit<SeminarFilters, 'timeFilter'> = {}): Promise<SeminarListResponse> {
    try {
      const response = await api.get('/seminars/past', {
        params: filters
      });
      return {
        seminars: response.data.data || [],
        pagination: response.data.pagination || {
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        }
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des séminaires passés');
    }
  }

  /**
   * Obtenir les séminaires à venir
   */
  async getUpcomingSeminars(filters: Omit<SeminarFilters, 'timeFilter'> = {}): Promise<SeminarListResponse> {
    try {
      const response = await api.get('/seminars/upcoming', {
        params: filters
      });
      return {
        seminars: response.data.data || [],
        pagination: response.data.pagination || {
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        }
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des séminaires à venir');
    }
  }

  /**
   * Obtenir les séminaires en cours
   */
  async getCurrentSeminars(filters: Omit<SeminarFilters, 'timeFilter'> = {}): Promise<SeminarListResponse> {
    try {
      const response = await api.get('/seminars/current', {
        params: filters
      });
      return {
        seminars: response.data.data || [],
        pagination: response.data.pagination || {
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        }
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des séminaires en cours');
    }
  }

  /**
   * Obtenir mes inscriptions
   */
  async getMyRegistrations(): Promise<Array<{
    id: string;
    registeredAt: Date;
    attendedAt?: Date;
    seminar: {
      id: string;
      title: string;
      description?: string;
      location?: string;
      startDate: Date;
      endDate?: Date;
      status: string;
      organizer: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
      };
      _count: {
        participants: number;
      };
    };
  }>> {
    try {
      const response = await api.get('/seminars/my-registrations');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des inscriptions');
    }
  }

  /**
   * Obtenir les statistiques des séminaires
   */
  async getSeminarStats(): Promise<SeminarStatsResponse> {
    try {
      const response = await api.get('/seminars/stats');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des statistiques');
    }
  }

  // =============================================
  // MÉTHODES UTILITAIRES
  // =============================================

  /**
   * Rechercher des séminaires
   */
  async searchSeminars(query: string, limit: number = 10): Promise<SeminarResponse[]> {
    try {
      const response = await this.listSeminars({
        search: query,
        limit,
        sortBy: 'startDate',
        sortOrder: 'asc'
      });
      return response.seminars;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la recherche de séminaires');
    }
  }

  /**
   * Obtenir les séminaires organisés par un utilisateur
   */
  async getSeminarsByOrganizer(organizerId: string, filters: Omit<SeminarFilters, 'organizerId'> = {}): Promise<SeminarListResponse> {
    return this.listSeminars({ ...filters, organizerId });
  }

  /**
   * Vérifier si un utilisateur peut s'inscrire à un séminaire
   */
  async canRegisterToSeminar(seminarId: string): Promise<{
    canRegister: boolean;
    reason?: string;
    isRegistered: boolean;
  }> {
    try {
      const seminar = await this.getSeminarById(seminarId);
      
      return {
        canRegister: seminar.canRegister || false,
        reason: this.getRegistrationBlockedReason(seminar),
        isRegistered: seminar.isRegistered || false
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la vérification des droits d\'inscription');
    }
  }

  /**
   * Obtenir la raison pour laquelle l'inscription est bloquée
   */
  private getRegistrationBlockedReason(seminar: SeminarResponse): string | undefined {
    if (seminar.isRegistered) {
      return 'Vous êtes déjà inscrit à ce séminaire';
    }
    
    if (seminar.registrationStatus === 'ended') {
      return 'Ce séminaire est terminé ou annulé';
    }
    
    if (seminar.registrationStatus === 'full') {
      return 'Ce séminaire est complet';
    }
    
    if (seminar.registrationStatus === 'closed') {
      return 'Les inscriptions sont fermées';
    }
    
    const now = new Date();
    if (new Date(seminar.startDate) <= now) {
      return 'Ce séminaire a déjà commencé';
    }
    
    return undefined;
  }

  /**
   * Formater une date pour l'affichage
   */
  static formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Formater la durée d'un séminaire
   */
  static formatDuration(startDate: Date | string, endDate?: Date | string | null): string {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    
    if (!endDate) {
      return this.formatDate(start);
    }
    
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    const startStr = start.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const endStr = end.toLocaleDateString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Si même jour
    if (start.toDateString() === end.toDateString()) {
      return `${startStr} - ${endStr}`;
    }
    
    // Jours différents
    return `${startStr} - ${this.formatDate(end)}`;
  }

  /**
   * Obtenir le badge de statut pour un séminaire
   */
  static getStatusBadge(status: string): {
    label: string;
    variant: 'default' | 'success' | 'warning' | 'destructive' | 'secondary';
  } {
    switch (status) {
      case 'PLANIFIE':
        return { label: 'Planifié', variant: 'default' };
      case 'EN_COURS':
        return { label: 'En cours', variant: 'warning' };
      case 'TERMINE':
        return { label: 'Terminé', variant: 'success' };
      case 'ANNULE':
        return { label: 'Annulé', variant: 'destructive' };
      default:
        return { label: status, variant: 'secondary' };
    }
  }

  /**
   * Obtenir le badge de statut d'inscription
   */
  static getRegistrationStatusBadge(registrationStatus?: string): {
    label: string;
    variant: 'default' | 'success' | 'warning' | 'destructive';
  } {
    switch (registrationStatus) {
      case 'open':
        return { label: 'Ouvert', variant: 'success' };
      case 'full':
        return { label: 'Complet', variant: 'warning' };
      case 'closed':
        return { label: 'Fermé', variant: 'default' };
      case 'ended':
        return { label: 'Terminé', variant: 'destructive' };
      default:
        return { label: 'Inconnu', variant: 'default' };
    }
  }
}

// Export singleton
export const seminarsApi = new SeminarsApiService();
export default seminarsApi;