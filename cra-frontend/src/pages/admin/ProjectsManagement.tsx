// src/pages/admin/ProjectsManagement.tsx
  import React, { useState } from 'react';
  import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
  import { FileText, Search, Filter, Trash2, Archive, Copy, X, Calendar, Users, TrendingUp } from 'lucide-react';
  import { projectsApi } from '../../services/projectsApi';
  import { Button } from '../../components/ui/Button';
  import Pagination from '../../components/ui/Pagination';
  import toast from 'react-hot-toast';
  import { format } from 'date-fns';
  import { fr } from 'date-fns/locale';

  const PROJECT_STATUS_LABELS: Record<string, string> = {
    PLANIFIE: 'Planifié',
    EN_COURS: 'En cours',
    TERMINE: 'Terminé',
    SUSPENDU: 'Suspendu',
    ANNULE: 'Annulé',
  };

  const PROJECT_STATUS_COLORS: Record<string, string> = {
    PLANIFIE: 'bg-blue-100 text-blue-800',
    EN_COURS: 'bg-green-100 text-green-800',
    TERMINE: 'bg-gray-100 text-gray-800',
    SUSPENDU: 'bg-yellow-100 text-yellow-800',
    ANNULE: 'bg-red-100 text-red-800',
  };

  const ProjectsManagement: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const pageSize = 20;
    const queryClient = useQueryClient();

    const { data, isLoading, isError, error } = useQuery({
      queryKey: ['admin-projects', currentPage, search, filterStatus],
      queryFn: () => projectsApi.listProjects({
        page: currentPage,
        limit: pageSize,
        search: search || undefined,
        status: filterStatus || undefined,
      }),
    });

    const deleteMutation = useMutation({
      mutationFn: (id: string) => projectsApi.deleteProject(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
        toast.success('Projet supprimé avec succès');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Erreur lors de la suppression');
      },
    });

    const archiveMutation = useMutation({
      mutationFn: (id: string) => projectsApi.archiveProject(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
        toast.success('Projet archivé avec succès');
      },
      onError: (error: any) => {
        toast.error(error.message || "Erreur lors de l'archivage");
      },
    });

    const duplicateMutation = useMutation({
      mutationFn: (id: string) => projectsApi.duplicateProject(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
        toast.success('Projet dupliqué avec succès');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Erreur lors de la duplication');
      },
    });

    const handleDelete = (id: string, title: string) => {
      if (window.confirm(`Êtes-vous sûr de vouloir supprimer le projet "${title}" ?`)) {
        deleteMutation.mutate(id);
      }
    };

    const handleArchive = (id: string, title: string) => {
      if (window.confirm(`Êtes-vous sûr de vouloir archiver le projet "${title}" ?`)) {
        archiveMutation.mutate(id);
      }
    };

    const handleDuplicate = (id: string) => {
      duplicateMutation.mutate(id);
    };

    const clearFilters = () => {
      setSearch('');
      setFilterStatus('');
      setCurrentPage(1);
    };

    const hasActiveFilters = filterStatus || search;
    const projects = data?.projects || [];
    const pagination = data?.pagination || { total: 0, totalPages: 0 };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center 
  justify-center shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Gestion des Projets & Activités
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {pagination.total || 0} projet{(pagination.total || 0) > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Projets</p>
                <p className="text-2xl font-bold text-gray-900">{pagination.total || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En cours</p>
                <p className="text-2xl font-bold text-green-600">
                  {projects.filter((p: any) => p.status === 'EN_COURS').length}
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
                <p className="text-sm text-gray-600">Planifiés</p>
                <p className="text-2xl font-bold text-blue-600">
                  {projects.filter((p: any) => p.status === 'PLANIFIE').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Terminés</p>
                <p className="text-2xl font-bold text-gray-600">
                  {projects.filter((p: any) => p.status === 'TERMINE').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-gray-600" />
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
            <div className="border-t pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select
                  value={filterStatus}
                  onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2
  focus:ring-green-500"
                >
                  <option value="">Tous les statuts</option>
                  {Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {hasActiveFilters && (
            <div className="flex items-center justify-between border-t pt-4">
              <p className="text-sm text-gray-600">
                {[filterStatus, search].filter(Boolean).length} filtre(s) actif(s)
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Projet</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Créateur</th>        
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date début</th>      
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activités</th>       
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>        
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="flex justify-center items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                            <span className="ml-3 text-gray-600">Chargement...</span>
                          </div>
                        </td>
                      </tr>
                    ) : projects.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Aucun projet trouvé</td>
                      </tr>
                    ) : (
                      projects.map((project: any) => (
                        <tr key={project.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium text-gray-900">{project.title}</div>
                              {project.code && <div className="text-sm text-gray-500">Code: {project.code}</div>}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              PROJECT_STATUS_COLORS[project.status] || 'bg-gray-100 text-gray-800'
                            }`}>
                              {PROJECT_STATUS_LABELS[project.status] || project.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {project.creator?.firstName} {project.creator?.lastName}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {project.startDate ? format(new Date(project.startDate), 'dd/MM/yyyy', { locale: fr }) :       
  '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {project._count?.activities || 0}
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => handleDuplicate(project.id)} className="text-gray-600
  hover:text-gray-900" title="Dupliquer">
                                <Copy className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleArchive(project.id, project.title)}
  className="text-yellow-600 hover:text-yellow-900" title="Archiver">
                                <Archive className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDelete(project.id, project.title)} className="text-red-600      
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

  export default ProjectsManagement;
