// src/services/admin/dashboardService.ts

import api from '../api';
import { DashboardApiResponse, DashboardData } from '../../types/admin.types';

/**
 * Service pour interagir avec l'API du dashboard administrateur
 */
export const dashboardService = {
  /**
   * Récupère toutes les données du dashboard
   */
  getDashboard: async (): Promise<DashboardData> => {
    const response = await api.get<DashboardApiResponse>('/admin/dashboard');
    return response.data.data;
  },

  /**
   * Récupère uniquement les statistiques
   */
  getStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data.data;
  },

  /**
   * Récupère uniquement les alertes
   */
  getAlerts: async () => {
    const response = await api.get('/admin/dashboard/alerts');
    return response.data.data;
  },

  /**
   * Récupère l'activité récente
   * @param limit - Nombre d'entrées (max 100)
   */
  getRecentActivity: async (limit: number = 20) => {
    const response = await api.get('/admin/dashboard/recent', {
      params: { limit },
    });
    return response.data.data;
  },

  /**
   * Récupère les données des graphiques
   */
  getCharts: async () => {
    const response = await api.get('/admin/dashboard/charts');
    return response.data.data;
  },
};
