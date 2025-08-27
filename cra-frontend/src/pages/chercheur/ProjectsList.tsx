// src/pages/chercheur/ProjectsList.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Archive,
  Copy,
  Users,
  Calendar,
  CheckSquare,
  FileText,
  Eye,
  AlertCircle
} from 'lucide-react';
import projectsApi, { Project, ProjectFilters } from '../../services/projectsApi';

// Status colors mapping
const statusColors = {
  PLANIFIE: 'bg-gray-100 text-gray-800',
  EN_COURS: 'bg-blue-100 text-blue-800',
  SUSPENDU: 'bg-yellow-100 text-yellow-800',
  TERMINE: 'bg-green-100 text-green-800',
  ARCHIVE: 'bg-red-100 text-red-800'
};

const statusLabels = {
  PLANIFIE: 'Planifié',
  EN_COURS: 'En cours',
  SUSPENDU: 'Suspendu',
  TERMINE: 'Terminé',
  ARCHIVE: 'Archivé'
};

const ProjectsList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtres et recherche
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || '');
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });

  // Dropdown actions
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Charger les projets
  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters: ProjectFilters = {
        search: searchTerm || undefined,
        status: selectedStatus || undefined,
        page: pagination.page,
        limit: pagination.limit,
        sortBy: 'updatedAt',
        sortOrder: 'desc'
      };

      const response = await projectsApi.listProjects(filters);
      setProjects(response.projects);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Effect pour charger les projets
  useEffect(() => {
    loadProjects();
  }, [searchTerm, selectedStatus, pagination.page]);

  // Effect pour les URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedStatus) params.set('status', selectedStatus);
    setSearchParams(params);
  }, [searchTerm, selectedStatus, setSearchParams]);

  // Gestion des actions
  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      try {
        await projectsApi.deleteProject(projectId);
        await loadProjects();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleArchiveProject = async (projectId: string) => {
    try {
      await projectsApi.archiveProject(projectId);
      await loadProjects();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDuplicateProject = async (projectId: string) => {
    try {
      const duplicated = await projectsApi.duplicateProject(projectId);
      navigate(`/chercheur/projects/${duplicated.id}`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Reset des filtres
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  if (loading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Projets</h1>
          <p className="text-gray-600 mt-1">
            Gérez et suivez vos projets de recherche
          </p>
        </div>
        <Link
          to="/chercheur/projects/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nouveau projet
        </Link>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un projet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Bouton filtres */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors ${
              showFilters || selectedStatus
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filtres
          </button>
        </div>

        {/* Filtres avancés */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tous les statuts</option>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Actions filtres */}
            <div className="flex justify-end mt-4 gap-2">
              <button
                onClick={resetFilters}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Liste des projets */}
      {projects.length === 0 && !loading ? (
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun projet trouvé
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedStatus
              ? 'Essayez de modifier vos critères de recherche'
              : 'Commencez par créer votre premier projet'}
          </p>
          <Link
            to="/chercheur/projects/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Créer un projet
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
            >
              {/* Header de la carte */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {project.title}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${statusColors[project.status]}`}>
                      {statusLabels[project.status]}
                    </span>
                  </div>
                  
                  {/* Menu actions */}
                  <div className="relative">
                    <button
                      onClick={() => setOpenDropdown(openDropdown === project.id ? null : project.id)}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    
                    {openDropdown === project.id && (
                      <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border z-10">
                        <div className="py-1">
                          <Link
                            to={`/chercheur/projects/${project.id}`}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setOpenDropdown(null)}
                          >
                            <Eye className="h-4 w-4" />
                            Voir
                          </Link>
                          <Link
                            to={`/chercheur/projects/${project.id}/edit`}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setOpenDropdown(null)}
                          >
                            <Edit className="h-4 w-4" />
                            Modifier
                          </Link>
                          <button
                            onClick={() => {
                              handleDuplicateProject(project.id);
                              setOpenDropdown(null);
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                          >
                            <Copy className="h-4 w-4" />
                            Dupliquer
                          </button>
                          <button
                            onClick={() => {
                              handleArchiveProject(project.id);
                              setOpenDropdown(null);
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                          >
                            <Archive className="h-4 w-4" />
                            Archiver
                          </button>
                          <button
                            onClick={() => {
                              handleDeleteProject(project.id);
                              setOpenDropdown(null);
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                          >
                            <Trash2 className="h-4 w-4" />
                            Supprimer
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Corps de la carte */}
              <div className="p-4">
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {project.description || 'Aucune description'}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{project._count?.participants || 0} participants</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckSquare className="h-4 w-4" />
                    <span>{project._count?.activities || 0} activités</span>
                  </div>
                </div>

                {/* Dates */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {project.startDate 
                      ? `Créé le ${new Date(project.createdAt).toLocaleDateString()}`
                      : 'Date non définie'
                    }
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    to={`/chercheur/projects/${project.id}`}
                    className="flex-1 bg-blue-600 text-white text-center py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Ouvrir
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            disabled={pagination.page === 1}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Précédent
          </button>
          
          <span className="px-4 py-2 text-sm text-gray-600">
            Page {pagination.page} sur {pagination.totalPages}
          </span>
          
          <button
            disabled={pagination.page === pagination.totalPages}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectsList;