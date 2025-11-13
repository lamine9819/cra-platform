// src/services/partnersApi.ts
import api from './api';
import {
  Partner,
  CreatePartnerRequest,
  UpdatePartnerRequest,
  PartnerListQuery,
  PartnerListResponse
} from '../types/partner.types';

/**
 * Service API pour la gestion des partenaires
 */
export const partnersApi = {
  /**
   * Récupérer la liste des partenaires avec pagination et filtres
   */
  async getPartners(query?: PartnerListQuery): Promise<PartnerListResponse> {
    const response = await api.get('/partners', { params: query });
    // Le backend renvoie {success, data: partners[], pagination, filters}
    // On transforme en {partners, total, page, limit, totalPages}
    return {
      partners: response.data.data,
      total: response.data.pagination.total,
      page: response.data.pagination.page,
      limit: response.data.pagination.limit,
      totalPages: response.data.pagination.totalPages,
    };
  },

  /**
   * Récupérer un partenaire par son ID
   */
  async getPartnerById(id: string): Promise<Partner> {
    const response = await api.get(`/partners/${id}`);
    return response.data.data;
  },

  /**
   * Créer un nouveau partenaire
   */
  async createPartner(data: CreatePartnerRequest): Promise<Partner> {
    const response = await api.post('/partners', data);
    return response.data.data;
  },

  /**
   * Mettre à jour un partenaire
   */
  async updatePartner(id: string, data: UpdatePartnerRequest): Promise<Partner> {
    const response = await api.patch(`/partners/${id}`, data);
    return response.data.data;
  },

  /**
   * Supprimer un partenaire
   */
  async deletePartner(id: string): Promise<void> {
    await api.delete(`/partners/${id}`);
  },

  /**
   * Rechercher des partenaires par expertise
   */
  async searchByExpertise(expertise: string): Promise<Partner[]> {
    const response = await api.get('/partners/search/expertise', {
      params: { expertise }
    });
    return response.data.data;
  }
};

export default partnersApi;
