// src/hooks/useReports.ts - Fichier principal corrigé
import { useState, useCallback, useEffect } from 'react';
import reportsApi, { 
  ReportTemplate, 
  ReportPreview, 
  GenerateReportRequest,
  ReportStats,
  ReportHistoryItem
} from '../services/reportsApi';

// Hook principal pour les actions de rapports
interface UseReportsReturn {
  loading: boolean;
  error: string | null;
  generateReport: (options: GenerateReportRequest) => Promise<Blob>;
  downloadReport: (type: string, entityId?: string, options?: Partial<GenerateReportRequest>) => Promise<void>;
  previewReport: (type: string, entityId?: string) => Promise<ReportPreview>;
  exportData: (type: 'users' | 'projects' | 'tasks' | 'documents', format?: 'xlsx' | 'csv') => Promise<void>;
  clearError: () => void;
}

export const useReports = (): UseReportsReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const generateReport = useCallback(async (options: GenerateReportRequest): Promise<Blob> => {
    try {
      setLoading(true);
      setError(null);
      
      const blob = await reportsApi.generateReport(options);
      return blob;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadReport = useCallback(async (
    type: string, 
    entityId?: string, 
    options?: Partial<GenerateReportRequest>
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      await reportsApi.downloadReport(type, entityId, options);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const previewReport = useCallback(async (
    type: string, 
    entityId?: string
  ): Promise<ReportPreview> => {
    try {
      setLoading(true);
      setError(null);
      
      const preview = await reportsApi.previewReport(type, entityId);
      return preview;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportData = useCallback(async (
    type: 'users' | 'projects' | 'tasks' | 'documents',
    format: 'xlsx' | 'csv' = 'xlsx'
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const blob = await reportsApi.exportToExcel({ type, format });
      const filename = `export_${type}_${new Date().toISOString().split('T')[0]}.${format}`;
      reportsApi.downloadBlob(blob, filename);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    generateReport,
    downloadReport,
    previewReport,
    exportData,
    clearError
  };
};

// Hook pour les templates
interface UseReportTemplatesReturn {
  templates: ReportTemplate[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useReportTemplates = (): UseReportTemplatesReturn => {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await reportsApi.getTemplates();
      setTemplates(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    loading,
    error,
    refetch: fetchTemplates
  };
};

// Hook pour les statistiques
interface UseReportStatsReturn {
  stats: ReportStats | null;
  loading: boolean;
  error: string | null;
  refetch: (period?: number) => Promise<void>;
}

export const useReportStats = (initialPeriod: number = 30): UseReportStatsReturn => {
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async (period: number = initialPeriod) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await reportsApi.getReportStats(period);
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [initialPeriod]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
};

// Hook pour l'historique
interface UseReportHistoryReturn {
  history: ReportHistoryItem[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  loadPage: (page: number) => Promise<void>;
  refetch: () => Promise<void>;
}

export const useReportHistory = (initialLimit: number = 10): UseReportHistoryReturn => {
  const [history, setHistory] = useState<ReportHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: initialLimit,
    total: 0,
    pages: 0
  });

  const fetchHistory = useCallback(async (page: number = 1, limit: number = initialLimit) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await reportsApi.getReportHistory(page, limit);
      setHistory(response.history);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [initialLimit]);

  const loadPage = useCallback(async (page: number) => {
    await fetchHistory(page, pagination.limit);
  }, [fetchHistory, pagination.limit]);

  const refetch = useCallback(async () => {
    await fetchHistory(pagination.page, pagination.limit);
  }, [fetchHistory, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    history,
    loading,
    error,
    pagination,
    loadPage,
    refetch
  };
};

// Hook combiné pour une utilisation complète sur la page rapports
export const useReportsPage = () => {
  const templates = useReportTemplates();
  const stats = useReportStats();
  const history = useReportHistory(5); // Seulement 5 éléments récents pour la page principale
  const reports = useReports();

  return {
    templates,
    stats,
    history,
    reports
  };
};