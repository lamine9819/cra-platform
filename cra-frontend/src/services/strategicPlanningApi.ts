// src/services/strategicPlanningApi.ts
import api from './api';
import {
  StrategicPlan,
  StrategicPlanWithRelations,
  StrategicAxis,
  StrategicAxisWithRelations,
  StrategicSubAxis,
  StrategicSubAxisWithRelations,
  ResearchProgram,
  ResearchProgramWithRelations,
  ResearchTheme,
  ResearchThemeWithRelations,
  ResearchStation,
  ResearchStationWithRelations,
  CreateStrategicPlanRequest,
  UpdateStrategicPlanRequest,
  CreateStrategicAxisRequest,
  UpdateStrategicAxisRequest,
  CreateStrategicSubAxisRequest,
  CreateResearchProgramRequest,
  UpdateResearchProgramRequest,
  CreateResearchThemeRequest,
  UpdateResearchThemeRequest,
  CreateResearchStationRequest,
  UpdateResearchStationRequest,
  StrategicPlanFilters,
  StrategicAxisFilters,
  ResearchProgramFilters,
  ResearchThemeFilters,
  ResearchStationFilters,
  StrategicPlanningStats,
  EligibleCoordinator,
} from '../types/strategic-planning.types';

class StrategicPlanningApiService {
  private baseUrl = '/strategic-planning';

  // ========================================
  // PLANS STRATÉGIQUES
  // ========================================

  async getStrategicPlans(filters: StrategicPlanFilters = {}): Promise<{
    data: StrategicPlan[];
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

      const response = await api.get(`${this.baseUrl}/plans?${params.toString()}`);
      return {
        data: response.data.data,
        pagination: response.data.pagination,
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des plans stratégiques');
    }
  }

  async getStrategicPlanById(id: string): Promise<StrategicPlanWithRelations> {
    try {
      const response = await api.get(`${this.baseUrl}/plans/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du plan stratégique');
    }
  }

  async createStrategicPlan(data: CreateStrategicPlanRequest): Promise<StrategicPlan> {
    try {
      const response = await api.post(`${this.baseUrl}/plans`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création du plan stratégique');
    }
  }

  async updateStrategicPlan(id: string, data: UpdateStrategicPlanRequest): Promise<StrategicPlan> {
    try {
      const response = await api.put(`${this.baseUrl}/plans/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du plan stratégique');
    }
  }

  async deleteStrategicPlan(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/plans/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression du plan stratégique');
    }
  }

  // ========================================
  // AXES STRATÉGIQUES
  // ========================================

  async getStrategicAxes(filters: StrategicAxisFilters = {}): Promise<{
    data: StrategicAxis[];
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

      const response = await api.get(`${this.baseUrl}/axes?${params.toString()}`);
      return {
        data: response.data.data,
        pagination: response.data.pagination,
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des axes stratégiques');
    }
  }

  async getStrategicAxisById(id: string): Promise<StrategicAxisWithRelations> {
    try {
      const response = await api.get(`${this.baseUrl}/axes/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération de l\'axe stratégique');
    }
  }

  async createStrategicAxis(data: CreateStrategicAxisRequest): Promise<StrategicAxis> {
    try {
      const response = await api.post(`${this.baseUrl}/axes`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création de l\'axe stratégique');
    }
  }

  async updateStrategicAxis(id: string, data: UpdateStrategicAxisRequest): Promise<StrategicAxis> {
    try {
      const response = await api.put(`${this.baseUrl}/axes/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour de l\'axe stratégique');
    }
  }

  async deleteStrategicAxis(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/axes/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression de l\'axe stratégique');
    }
  }

  // ========================================
  // SOUS-AXES STRATÉGIQUES
  // ========================================

  async getStrategicSubAxes(strategicAxisId?: string): Promise<{
    data: StrategicSubAxis[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const params = new URLSearchParams();
      if (strategicAxisId) {
        params.append('strategicAxisId', strategicAxisId);
      }

      const response = await api.get(`${this.baseUrl}/sub-axes?${params.toString()}`);
      return {
        data: response.data.data,
        pagination: response.data.pagination,
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des sous-axes stratégiques');
    }
  }

  async createStrategicSubAxis(data: CreateStrategicSubAxisRequest): Promise<StrategicSubAxis> {
    try {
      const response = await api.post(`${this.baseUrl}/sub-axes`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création du sous-axe stratégique');
    }
  }

  async getStrategicSubAxisById(id: string): Promise<StrategicSubAxisWithRelations> {
    try {
      const response = await api.get(`${this.baseUrl}/sub-axes/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du sous-axe stratégique');
    }
  }

  async updateStrategicSubAxis(id: string, data: CreateStrategicSubAxisRequest): Promise<StrategicSubAxis> {
    try {
      const response = await api.put(`${this.baseUrl}/sub-axes/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du sous-axe stratégique');
    }
  }

  async deleteStrategicSubAxis(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/sub-axes/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression du sous-axe stratégique');
    }
  }

  // ========================================
  // PROGRAMMES DE RECHERCHE
  // ========================================

  async getResearchPrograms(filters: ResearchProgramFilters = {}): Promise<{
    data: ResearchProgram[];
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

      const response = await api.get(`${this.baseUrl}/programs?${params.toString()}`);
      return {
        data: response.data.data,
        pagination: response.data.pagination,
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des programmes de recherche');
    }
  }

  async createResearchProgram(data: CreateResearchProgramRequest): Promise<ResearchProgram> {
    try {
      const response = await api.post(`${this.baseUrl}/programs`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création du programme de recherche');
    }
  }

  async updateResearchProgram(id: string, data: UpdateResearchProgramRequest): Promise<ResearchProgram> {
    try {
      const response = await api.put(`${this.baseUrl}/programs/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du programme de recherche');
    }
  }

  async getResearchProgramById(id: string): Promise<ResearchProgramWithRelations> {
    try {
      const response = await api.get(`${this.baseUrl}/programs/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du programme de recherche');
    }
  }

  async deleteResearchProgram(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/programs/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression du programme de recherche');
    }
  }

  // ========================================
  // THÈMES DE RECHERCHE
  // ========================================

  async getResearchThemes(filters: ResearchThemeFilters = {}): Promise<{
    data: ResearchTheme[];
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

      const response = await api.get(`${this.baseUrl}/themes?${params.toString()}`);
      return {
        data: response.data.data,
        pagination: response.data.pagination,
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des thèmes de recherche');
    }
  }

  async createResearchTheme(data: CreateResearchThemeRequest): Promise<ResearchTheme> {
    try {
      const response = await api.post(`${this.baseUrl}/themes`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création du thème de recherche');
    }
  }

  async updateResearchTheme(id: string, data: UpdateResearchThemeRequest): Promise<ResearchTheme> {
    try {
      const response = await api.put(`${this.baseUrl}/themes/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du thème de recherche');
    }
  }

  async getResearchThemeById(id: string): Promise<ResearchThemeWithRelations> {
    try {
      const response = await api.get(`${this.baseUrl}/themes/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du thème de recherche');
    }
  }

  async deleteResearchTheme(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/themes/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression du thème de recherche');
    }
  }

  // ========================================
  // STATIONS DE RECHERCHE
  // ========================================

  async getResearchStations(filters: ResearchStationFilters = {}): Promise<{
    data: ResearchStation[];
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

      const response = await api.get(`${this.baseUrl}/stations?${params.toString()}`);
      return {
        data: response.data.data,
        pagination: response.data.pagination,
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des stations de recherche');
    }
  }

  async createResearchStation(data: CreateResearchStationRequest): Promise<ResearchStation> {
    try {
      const response = await api.post(`${this.baseUrl}/stations`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création de la station de recherche');
    }
  }

  async updateResearchStation(id: string, data: UpdateResearchStationRequest): Promise<ResearchStation> {
    try {
      const response = await api.put(`${this.baseUrl}/stations/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour de la station de recherche');
    }
  }

  async deleteResearchStation(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/stations/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression de la station de recherche');
    }
  }

  // ========================================
  // UTILITAIRES
  // ========================================

  async getStrategicHierarchy(): Promise<StrategicPlanWithRelations[]> {
    try {
      const response = await api.get(`${this.baseUrl}/hierarchy`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération de la hiérarchie stratégique');
    }
  }

  async getStrategicPlanningStats(): Promise<StrategicPlanningStats> {
    try {
      const response = await api.get(`${this.baseUrl}/stats`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des statistiques');
    }
  }

  async getEligibleCoordinators(): Promise<EligibleCoordinator[]> {
    try {
      const response = await api.get(`${this.baseUrl}/coordinators`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des coordinateurs éligibles');
    }
  }
}

export const strategicPlanningApi = new StrategicPlanningApiService();
export default strategicPlanningApi;
