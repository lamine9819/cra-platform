// src/services/knowledgeTransferApi.ts
import api from './api';

// =============================================
// TYPES ET INTERFACES
// =============================================

export type TransferType =
  | 'FICHE_TECHNIQUE'
  | 'DEMONSTRATION'
  | 'FORMATION_PRODUCTEUR'
  | 'VISITE_GUIDEE'
  | 'EMISSION_RADIO'
  | 'REPORTAGE_TV'
  | 'PUBLICATION_VULGARISATION'
  | 'SITE_WEB'
  | 'RESEAUX_SOCIAUX';

export interface KnowledgeTransfer {
  id: string;
  title: string;
  description?: string;
  type: TransferType;
  targetAudience: string[];
  location?: string;
  date: string;
  participants?: number;
  impact?: string;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
  activityId?: string;
  organizerId: string;
  organizer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  activity?: {
    id: string;
    title: string;
  };
  documents?: any[];
}

export interface CreateKnowledgeTransferData {
  title: string;
  description?: string;
  type: TransferType;
  targetAudience: string[];
  location?: string;
  date: string;
  participants?: number;
  impact?: string;
  feedback?: string;
  activityId?: string;
}

export interface UpdateKnowledgeTransferData extends Partial<CreateKnowledgeTransferData> {}

export interface KnowledgeTransferFilters {
  search?: string;
  type?: TransferType;
  startDate?: string;
  endDate?: string;
  activityId?: string;
  organizerId?: string;
  page?: number;
  limit?: number;
  sortBy?: 'title' | 'date' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// =============================================
// SERVICE API KNOWLEDGE TRANSFERS
// =============================================

class KnowledgeTransferApiService {
  private baseUrl = '/knowledge-transfers';

  // Lister les transferts de connaissances avec filtres
  async listKnowledgeTransfers(filters: KnowledgeTransferFilters = {}): Promise<{
    transfers: KnowledgeTransfer[];
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
        transfers: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des transferts de connaissances');
    }
  }

  // Obtenir un transfert par ID
  async getKnowledgeTransferById(id: string): Promise<KnowledgeTransfer> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du transfert de connaissances');
    }
  }

  // Créer un transfert de connaissances
  async createKnowledgeTransfer(data: CreateKnowledgeTransferData): Promise<KnowledgeTransfer> {
    try {
      const response = await api.post(this.baseUrl, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création du transfert de connaissances');
    }
  }

  // Mettre à jour un transfert de connaissances
  async updateKnowledgeTransfer(id: string, data: UpdateKnowledgeTransferData): Promise<KnowledgeTransfer> {
    try {
      const response = await api.patch(`${this.baseUrl}/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du transfert de connaissances');
    }
  }

  // Supprimer un transfert de connaissances
  async deleteKnowledgeTransfer(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression du transfert de connaissances');
    }
  }

  // Labels pour les types de transferts
  getTransferTypeLabel(type: TransferType): string {
    const labels: Record<TransferType, string> = {
      FICHE_TECHNIQUE: 'Fiche technique',
      DEMONSTRATION: 'Démonstration',
      FORMATION_PRODUCTEUR: 'Formation producteur',
      VISITE_GUIDEE: 'Visite guidée',
      EMISSION_RADIO: 'Émission radio',
      REPORTAGE_TV: 'Reportage TV',
      PUBLICATION_VULGARISATION: 'Publication vulgarisation',
      SITE_WEB: 'Site web',
      RESEAUX_SOCIAUX: 'Réseaux sociaux'
    };
    return labels[type] || type;
  }

  // Obtenir tous les types de transferts
  getTransferTypes(): { value: TransferType; label: string }[] {
    return [
      { value: 'FICHE_TECHNIQUE', label: 'Fiche technique' },
      { value: 'DEMONSTRATION', label: 'Démonstration' },
      { value: 'FORMATION_PRODUCTEUR', label: 'Formation producteur' },
      { value: 'VISITE_GUIDEE', label: 'Visite guidée' },
      { value: 'EMISSION_RADIO', label: 'Émission radio' },
      { value: 'REPORTAGE_TV', label: 'Reportage TV' },
      { value: 'PUBLICATION_VULGARISATION', label: 'Publication vulgarisation' },
      { value: 'SITE_WEB', label: 'Site web' },
      { value: 'RESEAUX_SOCIAUX', label: 'Réseaux sociaux' }
    ];
  }
}

// Export singleton
export const knowledgeTransferApi = new KnowledgeTransferApiService();
export default knowledgeTransferApi;
