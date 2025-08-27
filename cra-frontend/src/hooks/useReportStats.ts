// src/hooks/useReportStats.ts
import { useState, useEffect, useCallback } from 'react';
import reportsApi, { ReportStats } from '../services/reportsApi';

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