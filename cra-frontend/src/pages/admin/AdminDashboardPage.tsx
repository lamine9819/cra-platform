// src/pages/admin/AdminDashboardPage.tsx

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { RefreshCw, AlertCircle, LayoutDashboard } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useDashboard } from '../../hooks/admin/useDashboard';
import { DashboardStats } from '../../components/admin/dashboard/DashboardStats';
import { ActivityChart } from '../../components/admin/dashboard/ActivityChart';
import { RecentActivity } from '../../components/admin/dashboard/RecentActivity';
import { AlertsSection } from '../../components/admin/dashboard/AlertsSection';
import { DashboardSkeleton } from '../../components/admin/dashboard/DashboardSkeleton';
import { cn } from '../../lib/utils';

export const AdminDashboardPage: React.FC = () => {
  const { data, isLoading, isError, error, refetch, isRefetching } = useDashboard();

  // État d'erreur
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Erreur de chargement
            </h3>
            <p className="text-gray-600 mb-6">
              {error?.message || 'Une erreur est survenue lors du chargement du dashboard'}
            </p>
            <Button
              onClick={() => refetch()}
              className="w-full"
              size="lg"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // État de chargement
  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <DashboardSkeleton />
      </div>
    );
  }

  const formattedDate = format(new Date(data.generatedAt), "d MMMM yyyy 'à' HH:mm", {
    locale: fr,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Dashboard Administrateur
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Généré le {formattedDate}
                </p>
              </div>
            </div>
          </div>
          <Button
            onClick={() => refetch()}
            disabled={isRefetching}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            <RefreshCw
              className={cn('w-4 h-4 mr-2', isRefetching && 'animate-spin')}
            />
            {isRefetching ? 'Actualisation...' : 'Actualiser'}
          </Button>
        </div>

        {/* Stats Cards */}
        <DashboardStats summary={data.summary} />

        {/* Charts */}
        <ActivityChart charts={data.charts} />

        {/* Recent Activity & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivity activities={data.recentActivity} />
          <AlertsSection alerts={data.alerts} />
        </div>

        {/* Footer Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>Actualisation automatique toutes les 30 secondes</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Version 1.0.0</span>
              <span className="text-gray-400">•</span>
              <span>CRA Platform</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
