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
    const response = await api.get<{
      success: boolean;
      data: PartnerListResponse;
    }>('/partners', { params: query });
    return response.data.data;
  },

  /**
   * Récupérer un partenaire par son ID
   */
  async getPartnerById(id: string): Promise<Partner> {
    const response = await api.get<{
      success: boolean;
      data: { partner: Partner };
    }>(`/partners/${id}`);
    return response.data.data.partner;
  },

  /**
   * Créer un nouveau partenaire
   */
  async createPartner(data: CreatePartnerRequest): Promise<Partner> {
    const response = await api.post<{
      success: boolean;
      data: { partner: Partner };
      message: string;
    }>('/partners', data);
    return response.data.data.partner;
  },

  /**
   * Mettre à jour un partenaire
   */
  async updatePartner(id: string, data: UpdatePartnerRequest): Promise<Partner> {
    const response = await api.patch<{
      success: boolean;
      data: { partner: Partner };
      message: string;
    }>(`/partners/${id}`, data);
    return response.data.data.partner;
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
    const response = await api.get<{
      success: boolean;
      data: { partners: Partner[] };
    }>('/partners/search/expertise', {
      params: { expertise }
    });
    return response.data.data.partners;
  }
};

export default partnersApi;
