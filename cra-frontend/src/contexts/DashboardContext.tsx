// src/contexts/DashboardContext.tsx - Context pour partager l'état du dashboard
import React, { createContext, useContext, ReactNode } from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { DASHBOARD_CONFIG } from '../config/dashboard.config';

interface DashboardContextType {
  dashboardData: any;
  quickStats: any;
  performanceMetrics: any;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  period: string;
  setPeriod: (period: any) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const dashboardState = useDashboard({
    autoRefresh: true,
    refreshInterval: DASHBOARD_CONFIG.REFRESH_INTERVALS.DASHBOARD
  });

  return (
    <DashboardContext.Provider value={dashboardState}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboardContext = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboardContext must be used within a DashboardProvider');
  }
  return context;
};