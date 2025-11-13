// src/hooks/useReportTemplates.ts
import { useState, useEffect } from 'react';
import reportsApi, { ReportTemplate } from '../services/reportsApi';

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

export default useReportTemplates;
