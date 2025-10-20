 // src/pages/admin/ActivitiesManagement.tsx
  import React, { useState } from 'react';
  import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
  import { Activity, Search, Filter, Trash2, Copy, X, TrendingUp, CheckCircle, Clock } from 'lucide-react';
  import { activitiesApi } from '../../services/activitiesApi';
  import { Button } from '../../components/ui/Button';
  import Pagination from '../../components/ui/Pagination';
  import toast from 'react-hot-toast';
  import { format } from 'date-fns';
  import { fr } from 'date-fns/locale';
  import {
    ActivityType,
    ActivityTypeLabels,
    ActivityTypeColors,
    ActivityLifecycleStatus,
    ActivityLifecycleStatusLabels
  } from '../../types/activity.types';

  const ActivitiesManagement: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterLifecycleStatus, setFilterLifecycleStatus] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const pageSize = 20;
    const queryClient = useQueryClient();

    const { data, isLoading, isError, error } = useQuery({
      queryKey: ['admin-activities', currentPage, search, filterType, filterLifecycleStatus],
      queryFn: () => {
        const params: any = {
          page: currentPage,
          limit: pageSize,
        };
        if (search) params.search = search;
        if (filterType) params.type = filterType as ActivityType;
        if (filterLifecycleStatus) params.lifecycleStatus = filterLifecycleStatus as ActivityLifecycleStatus;
        return activitiesApi.listActivities(params);
      },
    });

    const deleteMutation = useMutation({
      mutationFn: (id: string) => activitiesApi.deleteActivity(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin-activities'] });
        toast.success('Activité supprimée avec succès');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Erreur lors de la suppression');
      },
    });

    const duplicateMutation = useMutation({
      mutationFn: (id: string) => activitiesApi.duplicateActivity(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin-activities'] });
        toast.success('Activité dupliquée avec succès');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Erreur lors de la duplication');
      },
    });

    const handleDelete = (id: string, title: string) => {
      if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'activité "${title}" ?`)) {
        deleteMutation.mutate(id);
      }
    };

    const handleDuplicate = (id: string) => {
      duplicateMutation.mutate(id);
    };

    const clearFilters = () => {
      setSearch('');
      setFilterType('');
      setFilterLifecycleStatus('');
      setCurrentPage(1);
    };

    const hasActiveFilters = filterType || filterLifecycleStatus || search;
    const activities = data?.activities || [];
    const pagination = data?.pagination || { total: 0, totalPages: 0 };

    // Calculate statistics from current data
    const stats = {
      total: pagination.total || 0,
      byType: activities.reduce((acc: Record<string, number>, act: any) => {
        acc[act.type] = (acc[act.type] || 0) + 1;
        return acc;
      }, {}),
      byLifecycle: activities.reduce((acc: Record<string, number>, act: any) => {
        acc[act.lifecycleStatus] = (acc[act.lifecycleStatus] || 0) + 1;
        return acc;
      }, {}),
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center 
  justify-center shadow-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Gestion des Activités
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {pagination.total || 0} activité{(pagination.total || 0) > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Activités</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Nouvelles</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.byLifecycle['NOUVELLE'] || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Reconduites</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.byLifecycle['RECONDUITE'] || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Clôturées</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.byLifecycle['CLOTUREE'] || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Rechercher par titre, code..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2        
  focus:ring-green-500"
              />
            </div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="w-4 h-4 mr-2" />
              Filtres
              {hasActiveFilters && (
                <span className="ml-2 bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">Actifs</span>
              )}
            </Button>
          </div>

          {showFilters && (
            <div className="border-t pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={filterType}
                  onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2
  focus:ring-green-500"
                >
                  <option value="">Tous les types</option>
                  {Object.entries(ActivityTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut de cycle</label>
                <select
                  value={filterLifecycleStatus}
                  onChange={(e) => { setFilterLifecycleStatus(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2
  focus:ring-green-500"
                >
                  <option value="">Tous les statuts</option>
                  {Object.entries(ActivityLifecycleStatusLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {hasActiveFilters && (
            <div className="flex items-center justify-between border-t pt-4">
              <p className="text-sm text-gray-600">
                {[filterType, filterLifecycleStatus, search].filter(Boolean).length} filtre(s) actif(s)
              </p>
              <Button variant="outline" onClick={clearFilters} size="sm">
                <X className="w-4 h-4 mr-2" />
                Réinitialiser
              </Button>
            </div>
          )}
        </div>

        {isError ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-red-600 mb-2">Erreur de chargement</div>
            <p className="text-gray-600 text-sm">{(error as any)?.message || 'Une erreur est survenue'}</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activité</th>        
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut Cycle</th>    
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Projet</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date début</th>      
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tâches</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>        
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center">
                          <div className="flex justify-center items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                            <span className="ml-3 text-gray-600">Chargement...</span>
                          </div>
                        </td>
                      </tr>
                    ) : activities.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">Aucune activité trouvée</td>
                      </tr>
                    ) : (
                      activities.map((activity: any) => (
                        <tr key={activity.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium text-gray-900">{activity.title}</div>
                              {activity.code && <div className="text-sm text-gray-500">Code: {activity.code}</div>}        
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              ActivityTypeColors[activity.type as ActivityType] || 'bg-gray-100 text-gray-800'
                            }`}>
                              {ActivityTypeLabels[activity.type as ActivityType] || activity.type}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 
  text-blue-800">
                              {ActivityLifecycleStatusLabels[activity.lifecycleStatus as ActivityLifecycleStatus] ||       
  activity.lifecycleStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {activity.project?.title || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {activity.startDate ? format(new Date(activity.startDate), 'dd/MM/yyyy', { locale: fr }) :     
  '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {activity._count?.tasks || 0}
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => handleDuplicate(activity.id)} className="text-gray-600
  hover:text-gray-900" title="Dupliquer">
                                <Copy className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDelete(activity.id, activity.title)} className="text-red-600    
   hover:text-red-900" title="Supprimer">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination currentPage={currentPage} totalPages={pagination.totalPages} onPageChange={setCurrentPage}     
  />
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  export default ActivitiesManagement;
