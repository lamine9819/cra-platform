// src/hooks/useDashboard.ts
import { useState, useEffect, useCallback } from 'react';
import { 
  dashboardService, 
  DashboardResponse, 
  QuickStats, 
  PerformanceMetrics, 
  DashboardQuery,
  FormMetrics,
  DataCollectionStats
} from '../services/dashboard.api';

interface UseDashboardOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // en millisecondes
  initialPeriod?: 'week' | 'month' | 'quarter' | 'year';
}

interface UseDashboardReturn {
  // État des données
  dashboardData: DashboardResponse | null;
  quickStats: QuickStats | null;
  performanceMetrics: PerformanceMetrics | null;
  formMetrics: FormMetrics | null;
  dataCollectionStats: DataCollectionStats | null;
  
  // État de chargement
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  
  // Contrôles
  period: 'week' | 'month' | 'quarter' | 'year';
  setPeriod: (period: 'week' | 'month' | 'quarter' | 'year') => void;
  refresh: () => Promise<void>;
  loadDashboard: (query?: DashboardQuery) => Promise<void>;
  loadQuickStats: () => Promise<void>;
  loadPerformanceMetrics: () => Promise<void>;
  loadFormMetrics: (period?: number) => Promise<void>;
  loadDataCollectionStats: () => Promise<void>;
  
  // Utilitaires
  clearError: () => void;
  isStale: boolean;
  lastUpdated: Date | null;
}

export const useDashboard = (options: UseDashboardOptions = {}): UseDashboardReturn => {
  const {
    autoRefresh = false,
    refreshInterval = 5 * 60 * 1000, // 5 minutes par défaut
    initialPeriod = 'month'
  } = options;

  // État principal
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [quickStats, setQuickStats] = useState<QuickStats | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [formMetrics, setFormMetrics] = useState<FormMetrics | null>(null);
  const [dataCollectionStats, setDataCollectionStats] = useState<DataCollectionStats | null>(null);
  
  // État de chargement et erreurs
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Configuration
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>(initialPeriod);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Calculer si les données sont périmées
  const isStale = lastUpdated ? 
    (Date.now() - lastUpdated.getTime()) > refreshInterval : 
    true;

  // Fonctions de chargement individuelles
  const loadDashboard = useCallback(async (query?: DashboardQuery) => {
    try {
      const data = await dashboardService.getDashboardData({
        period,
        detailed: true,
        includeForms: true,
        ...query
      });
      setDashboardData(data);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du chargement du dashboard';
      setError(errorMessage);
      throw err;
    }
  }, [period]);

  const loadQuickStats = useCallback(async () => {
    try {
      const data = await dashboardService.getQuickStats();
      setQuickStats(data);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du chargement des statistiques rapides';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const loadPerformanceMetrics = useCallback(async () => {
    try {
      const data = await dashboardService.getPerformanceMetrics();
      setPerformanceMetrics(data);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du chargement des métriques de performance';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const loadFormMetrics = useCallback(async (formPeriod = 30) => {
    try {
      const data = await dashboardService.getFormStats(formPeriod);
      setFormMetrics(data);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du chargement des métriques de formulaires';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const loadDataCollectionStats = useCallback(async () => {
    try {
      const data = await dashboardService.getDataCollectionStats();
      setDataCollectionStats(data);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du chargement des statistiques de collecte';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Fonction de chargement complète
  const loadAllData = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      
      setError(null);

      // Charger toutes les données en parallèle
      await Promise.all([
        loadDashboard(),
        loadQuickStats(),
        loadPerformanceMetrics(),
        loadFormMetrics(),
        loadDataCollectionStats()
      ]);

      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('Erreur lors du chargement complet du dashboard:', err);
      // L'erreur est déjà définie dans les fonctions individuelles
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loadDashboard, loadQuickStats, loadPerformanceMetrics, loadFormMetrics, loadDataCollectionStats]);

  // Fonction de refresh manuel
  const refresh = useCallback(async () => {
    await loadAllData(true);
  }, [loadAllData]);

  // Fonction pour effacer l'erreur
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Effet pour le chargement initial
  useEffect(() => {
    loadAllData();
  }, [period]); // Recharger quand la période change

  // Effet pour l'auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      if (isStale) {
        refresh();
      }
    }, Math.min(refreshInterval, 60000)); // Maximum 1 minute

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, isStale, refresh]);

  // Gestionnaire de changement de période
  const handleSetPeriod = useCallback((newPeriod: 'week' | 'month' | 'quarter' | 'year') => {
    if (newPeriod !== period) {
      setPeriod(newPeriod);
      setLoading(true);
    }
  }, [period]);

  return {
    // Données
    dashboardData,
    quickStats,
    performanceMetrics,
    formMetrics,
    dataCollectionStats,
    
    // État
    loading,
    refreshing,
    error,
    
    // Contrôles
    period,
    setPeriod: handleSetPeriod,
    refresh,
    loadDashboard,
    loadQuickStats,
    loadPerformanceMetrics,
    loadFormMetrics,
    loadDataCollectionStats,
    
    // Utilitaires
    clearError,
    isStale,
    lastUpdated
  };
};

// Hook spécialisé pour les statistiques rapides seulement
export const useQuickStats = (autoRefresh = true) => {
  const [quickStats, setQuickStats] = useState<QuickStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setError(null);
      const data = await dashboardService.getQuickStats();
      setQuickStats(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(loadStats, 30000); // Refresh toutes les 30 secondes
    return () => clearInterval(interval);
  }, [autoRefresh, loadStats]);

  return {
    quickStats,
    loading,
    error,
    refresh: loadStats
  };
};

// Hook pour les métriques de performance seulement
export const usePerformanceMetrics = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMetrics = useCallback(async () => {
    try {
      setError(null);
      const data = await dashboardService.getPerformanceMetrics();
      setMetrics(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  return {
    metrics,
    loading,
    error,
    refresh: loadMetrics
  };
};

export default useDashboard;