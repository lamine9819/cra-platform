// src/components/projects/ProjectAnalytics.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, PieChart, TrendingUp, Download, FileText } from 'lucide-react';
import { projectsApi } from '../../services/projectsApi';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

interface ProjectAnalyticsProps {
  projectId: string;
}

const ProjectAnalytics: React.FC<ProjectAnalyticsProps> = ({ projectId }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['project-statistics', projectId],
    queryFn: () => projectsApi.getProjectStatistics(projectId),
  });

  const handleGenerateReport = async (format: 'pdf' | 'word') => {
    try {
      toast.loading('Génération du rapport en cours...');
      await projectsApi.generateProjectReport(projectId, format, [
        'overview',
        'participants',
        'activities',
        'budget',
      ]);
      toast.dismiss();
      toast.success('Rapport téléchargé avec succès');
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message || 'Erreur lors de la génération du rapport');
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
      {/* En-tête avec génération de rapports */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Analyse et Rapports</h3>
        <div className="flex gap-2">
          <Button
            onClick={() => handleGenerateReport('pdf')}
            variant="outline"
            className="border-green-600 text-green-600 hover:bg-green-50"
          >
            <FileText className="w-4 h-4 mr-2" />
            Rapport PDF
          </Button>
          <Button
            onClick={() => handleGenerateReport('word')}
            variant="outline"
            className="border-green-600 text-green-600 hover:bg-green-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Rapport Word
          </Button>
        </div>
      </div>

      {/* Participants */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
          <PieChart className="w-5 h-5 mr-2 text-green-600" />
          Participants
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{stats.participants.total}</p>
            <p className="text-sm text-gray-600">Total</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{stats.participants.activeCount}</p>
            <p className="text-sm text-gray-600">Actifs</p>
          </div>
        </div>
        {Object.keys(stats.participants.byRole).length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-medium text-gray-700 mb-3">Répartition par rôle :</p>
            <div className="space-y-2">
              {Object.entries(stats.participants.byRole).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{role}</span>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Activités */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
          Activités
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{stats.activities.total}</p>
            <p className="text-sm text-gray-600">Total</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{stats.activities.completion}%</p>
            <p className="text-sm text-gray-600">Complétion</p>
          </div>
        </div>
      </div>

      {/* Budget */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
          Budget
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-600 font-medium">Alloué</p>
            <p className="text-2xl font-bold text-blue-900">
              {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(stats.budget.allocated)}
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-purple-600 font-medium">Approuvé</p>
            <p className="text-2xl font-bold text-purple-900">
              {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(stats.budget.approved)}
            </p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <p className="text-sm text-orange-600 font-medium">Reçu</p>
            <p className="text-2xl font-bold text-orange-900">
              {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(stats.budget.received)}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-600 font-medium">Restant</p>
            <p className="text-2xl font-bold text-green-900">
              {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(stats.budget.remaining)}
            </p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Timeline du projet</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Durée totale</span>
            <span className="text-sm font-medium text-gray-900">{stats.timeline.duration} jours</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Progression</span>
            <span className="text-sm font-medium text-gray-900">{stats.timeline.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all"
              style={{ width: `${stats.timeline.progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectAnalytics;
