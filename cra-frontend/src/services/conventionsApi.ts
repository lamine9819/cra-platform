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
    const response = await api.get<ConventionListResponse>('/conventions', { params });
    return response.data;
  },

  // Get a single convention by ID
  getConventionById: async (id: string): Promise<Convention> => {
    const response = await api.get<Convention>(`/conventions/${id}`);
    return response.data;
  },

  // Create a new convention
  createConvention: async (data: CreateConventionRequest): Promise<Convention> => {
    const response = await api.post<Convention>('/conventions', data);
    return response.data;
  },

  // Update an existing convention
  updateConvention: async (id: string, data: UpdateConventionRequest): Promise<Convention> => {
    const response = await api.patch<Convention>(`/conventions/${id}`, data);
    return response.data;
  },

  // Delete a convention
  deleteConvention: async (id: string): Promise<void> => {
    await api.delete(`/conventions/${id}`);
  },
};
