// src/hooks/admin/useDashboard.ts

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { dashboardService } from '../../services/admin/dashboardService';
import { DashboardData } from '../../types/admin.types';

/**
 * Hook React Query pour récupérer les données du dashboard administrateur
 * - Cache les données pendant 5 minutes
 * - Rafraîchit automatiquement toutes les 30 secondes
 * - Réessaie 2 fois en cas d'erreur
 */
export const useDashboard = (): UseQueryResult<DashboardData, Error> => {
  return useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: dashboardService.getDashboard,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // 30 secondes
    retry: 2,
    refetchOnWindowFocus: true,
  });
};

/**
 * Hook pour récupérer uniquement les statistiques
 */
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: dashboardService.getStats,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

/**
 * Hook pour récupérer uniquement les alertes
 */
export const useDashboardAlerts = () => {
  return useQuery({
    queryKey: ['admin-dashboard-alerts'],
    queryFn: dashboardService.getAlerts,
    staleTime: 2 * 60 * 1000, // 2 minutes (plus court car les alertes changent plus souvent)
    refetchInterval: 60 * 1000, // 1 minute
    retry: 2,
  });
};
