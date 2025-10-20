// src/pages/chercheur/ProjectsList.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Search,
  Filter,
  FolderOpen,
  Calendar,
  Users,
  TrendingUp,
  Archive,
  X,
  Eye,
  Edit,
  Copy,
  Trash2,
  MoreVertical,
  CheckCircle,
  Clock,
  AlertCircle,
  Briefcase,
} from 'lucide-react';
import { projectsApi } from '../../services/projectsApi';
import { Button } from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ProjectStatus,
  ProjectStatusLabels,
  ProjectStatusColors,
  ResearchType,
  ResearchTypeLabels,
  type Project,
} from '../../types/project.types';

const ProjectsList: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // États pour les filtres et la recherche
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | ''>('');
  const [filterResearchType, setFilterResearchType] = useState<ResearchType | ''>('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const pageSize = 12;

  // Récupération des projets
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['projects', currentPage, search, filterStatus, filterResearchType],
    queryFn: () =>
      projectsApi.listProjects({
        page: currentPage,
        limit: pageSize,
        search: search || undefined,
        status: filterStatus || undefined,
        researchType: filterResearchType || undefined,
      }),
  });

  // Mutation pour supprimer un projet
  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectsApi.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Projet supprimé avec succès');
      setSelectedProject(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la suppression');
    },
  });

  // Mutation pour archiver un projet
  const archiveMutation = useMutation({
    mutationFn: (id: string) => projectsApi.archiveProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Projet archivé avec succès');
      setSelectedProject(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de l\'archivage');
    },
  });

  // Mutation pour dupliquer un projet
  const duplicateMutation = useMutation({
    mutationFn: (id: string) => projectsApi.duplicateProject(id, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
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
    setFilterResearchType('');
    setCurrentPage(1);
  };

  const hasActiveFilters = filterStatus || filterResearchType || search;
  const projects = data?.projects || [];
  const pagination = data?.pagination || { total: 0, totalPages: 0 };

  // Calculer les statistiques
  const stats = {
    total: pagination.total || 0,
    byStatus: projects.reduce((acc: Record<string, number>, proj: Project) => {
      acc[proj.status] = (acc[proj.status] || 0) + 1;
      return acc;
    }, {}),
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
            <FolderOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mes Projets</h1>
            <p className="text-sm text-gray-600 mt-1">
              {pagination.total || 0} projet{(pagination.total || 0) > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Link to="/chercheur/projects/new">
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau projet
          </Button>
        </Link>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En cours</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.byStatus[ProjectStatus.EN_COURS] || 0}
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
                {stats.byStatus[ProjectStatus.PLANIFIE] || 0}
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
              <p className="text-sm text-gray-600">Terminés</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.byStatus[ProjectStatus.TERMINE] || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Rechercher par titre, code, thème..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" />
            Filtres
            {hasActiveFilters && (
              <span className="ml-2 bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">
                Actifs
              </span>
            )}
          </Button>
        </div>

        {/* Panneau de filtres */}
        {showFilters && (
          <div className="border-t pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value as ProjectStatus | '');
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Tous les statuts</option>
                {Object.entries(ProjectStatusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type de recherche</label>
              <select
                value={filterResearchType}
                onChange={(e) => {
                  setFilterResearchType(e.target.value as ResearchType | '');
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Tous les types</option>
                {Object.entries(ResearchTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Bouton pour réinitialiser les filtres */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between border-t pt-4">
            <p className="text-sm text-gray-600">
              {[filterStatus, filterResearchType, search].filter(Boolean).length} filtre(s) actif(s)
            </p>
            <Button variant="outline" onClick={clearFilters} size="sm">
              <X className="w-4 h-4 mr-2" />
              Réinitialiser
            </Button>
          </div>
        )}
      </div>

      {/* Liste des projets */}
      {isError ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <div className="text-red-600 mb-2">Erreur de chargement</div>
          <p className="text-gray-600 text-sm">{(error as any)?.message || 'Une erreur est survenue'}</p>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="flex gap-2">
                <div className="h-8 bg-gray-200 rounded flex-1"></div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun projet trouvé</h3>
          <p className="text-gray-600 mb-6">
            {hasActiveFilters
              ? 'Aucun projet ne correspond à vos critères de recherche.'
              : 'Commencez par créer votre premier projet.'}
          </p>
          {!hasActiveFilters && (
            <Link to="/chercheur/projects/new">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Créer un projet
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 overflow-hidden"
              >
                {/* En-tête de la carte */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                        {project.title}
                      </h3>
                      {project.code && (
                        <p className="text-sm text-gray-500">Code: {project.code}</p>
                      )}
                    </div>
                    <div className="relative">
                      <button
                        onClick={() =>
                          setSelectedProject(selectedProject === project.id ? null : project.id)
                        }
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-400" />
                      </button>

                      {/* Menu dropdown */}
                      {selectedProject === project.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 py-1 border border-gray-200">
                          <Link
                            to={`/chercheur/projects/${project.id}`}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Voir les détails
                          </Link>
                          <Link
                            to={`/chercheur/projects/${project.id}/edit`}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Modifier
                          </Link>
                          <button
                            onClick={() => handleDuplicate(project.id)}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Dupliquer
                          </button>
                          <button
                            onClick={() => handleArchive(project.id, project.title)}
                            className="flex items-center w-full px-4 py-2 text-sm text-orange-600 hover:bg-orange-50"
                          >
                            <Archive className="w-4 h-4 mr-2" />
                            Archiver
                          </button>
                          <button
                            onClick={() => handleDelete(project.id, project.title)}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Supprimer
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {project.description || 'Aucune description'}
                  </p>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        ProjectStatusColors[project.status]
                      }`}
                    >
                      {ProjectStatusLabels[project.status]}
                    </span>
                    {project.researchType && (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {ResearchTypeLabels[project.researchType]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Corps de la carte */}
                <div className="p-6 space-y-3">
                  {project.theme && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="truncate">{project.theme.name}</span>
                    </div>
                  )}

                  {project.startDate && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span>
                        {format(new Date(project.startDate), 'dd MMM yyyy', { locale: fr })}
                        {project.endDate && ` - ${format(new Date(project.endDate), 'dd MMM yyyy', { locale: fr })}`}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-1 text-gray-400" />
                      <span>{project._count?.participants || 0}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 mr-1 text-gray-400" />
                      <span>{project._count?.activities || 0} activités</span>
                    </div>
                  </div>
                </div>

                {/* Pied de la carte */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <Link to={`/chercheur/projects/${project.id}`}>
                    <Button variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50">
                      <Eye className="w-4 h-4 mr-2" />
                      Voir le projet
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProjectsList;
