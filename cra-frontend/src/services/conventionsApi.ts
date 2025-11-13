// src/services/conventionsApi.ts
import api from './api';
import {
  Convention,
  CreateConventionRequest,
  UpdateConventionRequest,
  ConventionListQuery,
  ConventionListResponse,
} from '../types/convention.types';

export const conventionsApi = {
  // Get all conventions with pagination and filters
  getConventions: async (params?: ConventionListQuery): Promise<ConventionListResponse> => {
    const response = await api.get('/conventions', { params });
    // Le backend renvoie {success, data, pagination}
    // On transforme en {conventions, total, page, limit, totalPages}
    return {
      conventions: response.data.data,
      total: response.data.pagination.total,
      page: response.data.pagination.page,
      limit: response.data.pagination.limit,
      totalPages: response.data.pagination.totalPages,
    };
  },

  // Get a single convention by ID
  getConventionById: async (id: string): Promise<Convention> => {
    const response = await api.get(`/conventions/${id}`);
    return response.data.data;
  },

  // Create a new convention
  createConvention: async (data: CreateConventionRequest): Promise<Convention> => {
    const response = await api.post('/conventions', data);
    return response.data.data;
  },

  // Update an existing convention
  updateConvention: async (id: string, data: UpdateConventionRequest): Promise<Convention> => {
    const response = await api.patch(`/conventions/${id}`, data);
    return response.data.data;
  },

  // Delete a convention
  deleteConvention: async (id: string): Promise<void> => {
    await api.delete(`/conventions/${id}`);
  },
};
