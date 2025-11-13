// src/hooks/useReportHistory.ts
import { useState, useEffect, useCallback } from 'react';
import reportsApi, { ReportHistoryItem } from '../services/reportsApi';

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
export default useReportHistory;