// src/pages/chercheur/ActivitiesList.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, Download, BarChart3 } from 'lucide-react';
import { activitiesApi } from '../../services/activitiesApi';
import { Button } from '../../components/ui/Button';
import ActivityCard from '../../components/activities/ActivityCard';
import ActivityAnalytics from '../../components/activities/ActivityAnalytics';
import toast from 'react-hot-toast';
import {
  ActivityType,
  ActivityTypeLabels,
  ActivityStatus,
  ActivityStatusLabels,
  ActivityLifecycleStatus,
  ActivityLifecycleStatusLabels,
  type ActivityListQuery,
} from '../../types/activity.types';

const ActivitiesList: React.FC = () => {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Filtres
  const [filters, setFilters] = useState<ActivityListQuery>({
    page: 1,
    limit: 12,
    search: '',
    type: undefined,
    status: undefined,
    lifecycleStatus: undefined,
    themeId: undefined,
    responsibleId: undefined,
    projectId: undefined,
    conventionId: undefined,
    stationId: undefined,
    interventionRegion: undefined,
    withoutProject: undefined,
    isRecurrent: undefined,
  });

  // Charger les activités
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['activities', filters],
    queryFn: () => activitiesApi.listActivities(filters),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  const handleFilterChange = (key: keyof ActivityListQuery, value: any) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
  };

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

  const handleDelete = async (activity: any) => {
    toast((t) => (
      <div>
        <p className="font-medium mb-2">
          Voulez-vous vraiment supprimer l'activité "{activity.title}" ?
        </p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              try {
                await activitiesApi.deleteActivity(activity.id);
                toast.dismiss(t.id);
                toast.success('Activité supprimée avec succès');
                refetch();
              } catch (error: any) {
                toast.dismiss(t.id);
                toast.error(error.message || 'Erreur lors de la suppression');
              }
            }}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Confirmer
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Annuler
          </button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Erreur lors du chargement des activités</p>
        <Button onClick={() => refetch()} className="mt-4 bg-green-600 hover:bg-green-700">
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activités</h1>
          <p className="text-gray-600 mt-1">
            {data?.pagination.total || 0} activité(s) au total
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowAnalytics(!showAnalytics)}
            variant="outline"
            className="border-green-600 text-green-600 hover:bg-green-50"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            {showAnalytics ? 'Masquer' : 'Statistiques'}
          </Button>
          <Button
            onClick={handleExport}
            variant="outline"
            className="border-green-600 text-green-600 hover:bg-green-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Link to="/chercheur/activities/create">
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle activité
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistiques */}
      {showAnalytics && (
        <div className="mb-8">
          <ActivityAnalytics filters={filters} />
        </div>
      )}

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher une activité..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <Button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className={showFilters ? 'bg-green-50 border-green-600 text-green-600' : ''}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtres
          </Button>
          <Button type="submit" className="bg-green-600 hover:bg-green-700">
            Rechercher
          </Button>
        </form>

        {/* Filtres avancés */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={filters.type || ''}
                onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">Tous les types</option>
                {Object.entries(ActivityTypeLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">Tous les statuts</option>
                {Object.entries(ActivityStatusLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cycle de vie</label>
              <select
                value={filters.lifecycleStatus || ''}
                onChange={(e) => handleFilterChange('lifecycleStatus', e.target.value || undefined)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">Tous</option>
                {Object.entries(ActivityLifecycleStatusLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="withoutProject"
                checked={filters.withoutProject || false}
                onChange={(e) => handleFilterChange('withoutProject', e.target.checked || undefined)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <label htmlFor="withoutProject" className="ml-2 text-sm text-gray-700">
                Sans projet assigné
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isRecurrent"
                checked={filters.isRecurrent || false}
                onChange={(e) => handleFilterChange('isRecurrent', e.target.checked || undefined)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="isRecurrent" className="ml-2 text-sm text-gray-700 flex items-center">
                <span className="mr-1">Activités reconduites uniquement</span>
                <span className="text-purple-600">♻️</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Liste des activités */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      ) : data?.activities && data.activities.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.activities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                showProject={true}
                onEdit={(activity) => navigate(`/chercheur/activities/${activity.id}/edit`)}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Pagination */}
          {data.pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                onClick={() => handlePageChange(filters.page! - 1)}
                disabled={!data.pagination.hasPrev}
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                Précédent
              </Button>
              <span className="text-sm text-gray-600">
                Page {data.pagination.page} sur {data.pagination.totalPages}
              </span>
              <Button
                onClick={() => handlePageChange(filters.page! + 1)}
                disabled={!data.pagination.hasNext}
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                Suivant
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600">Aucune activité trouvée</p>
          <Link to="/chercheur/activities/create">
            <Button className="mt-4 bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Créer votre première activité
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default ActivitiesList;
