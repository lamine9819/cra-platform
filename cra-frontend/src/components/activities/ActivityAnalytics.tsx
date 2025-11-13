// src/components/activities/ActivityAnalytics.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, PieChart, TrendingUp, Download, FileText } from 'lucide-react';
import { activitiesApi } from '../../services/activitiesApi';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';
import type { ActivityListQuery } from '../../types/activity.types';

interface ActivityAnalyticsProps {
  filters?: ActivityListQuery;
}

const ActivityAnalytics: React.FC<ActivityAnalyticsProps> = ({ filters }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['activity-statistics', filters],
    queryFn: () => activitiesApi.getStatistics(filters),
  });

  const handleExport = async () => {
    try {
      toast.loading('Export en cours...');
      await activitiesApi.exportActivities(filters);
      toast.dismiss();
      toast.success('Export réussi');
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message || "Erreur lors de l'export");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-gray-200 rounded-lg"></div>
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Aucune statistique disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec export */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Statistiques et Analyse</h3>
        <Button
          onClick={handleExport}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          Exporter (Excel)
        </Button>
      </div>

      {/* Vue d'ensemble */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
          <PieChart className="w-5 h-5 mr-2 text-green-600" />
          Vue d'ensemble
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{stats.total}</p>
            <p className="text-sm text-gray-600">Total</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{stats.withResults}</p>
            <p className="text-sm text-gray-600">Avec résultats</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">{stats.recurrent}</p>
            <p className="text-sm text-gray-600">Récurrentes</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-600">{stats.withoutProject}</p>
            <p className="text-sm text-gray-600">Sans projet</p>
          </div>
        </div>
      </div>

      {/* Par type */}
      {Object.keys(stats.byType).length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Par type</h4>
          <div className="space-y-2">
            {Object.entries(stats.byType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{type}</span>
                <span className="text-sm font-medium text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Par thème */}
      {Object.keys(stats.byTheme).length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Par thème</h4>
          <div className="space-y-2">
            {Object.entries(stats.byTheme).map(([theme, count]) => (
              <div key={theme} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{theme}</span>
                <span className="text-sm font-medium text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Par région d'intervention */}
      {Object.keys(stats.byInterventionRegion).length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Par région d'intervention</h4>
          <div className="space-y-2">
            {Object.entries(stats.byInterventionRegion).map(([region, count]) => (
              <div key={region} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{region}</span>
                <span className="text-sm font-medium text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activités récentes */}
      {stats.recent && stats.recent.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
            Activités récentes
          </h4>
          <div className="space-y-2">
            {stats.recent.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.theme.name}</p>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(activity.updatedAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityAnalytics;
