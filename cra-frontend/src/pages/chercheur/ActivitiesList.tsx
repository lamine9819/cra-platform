// src/pages/chercheur/ActivitiesList.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Eye,
  AlertCircle,
  Activity,
  MapPin,
  Calendar,
  Folder,
  FileText,
  CheckSquare
} from 'lucide-react';
import activitiesApi, { Activity as ActivityType, ActivityFilters } from '../../services/activitiesApi';

const ActivitiesList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtres et recherche
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedProject, setSelectedProject] = useState(searchParams.get('projectId') || '');
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('location') || '');
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

  // Charger les activités
  const loadActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters: ActivityFilters = {
        search: searchTerm || undefined,
        projectId: selectedProject || undefined,
        location: selectedLocation || undefined,
        page: pagination.page,
        limit: pagination.limit,
        sortBy: 'updatedAt',
        sortOrder: 'desc'
      };

      const response = await activitiesApi.listActivities(filters);
      setActivities(response.activities);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Effect pour charger les activités
  useEffect(() => {
    loadActivities();
  }, [searchTerm, selectedProject, selectedLocation, pagination.page]);

  // Effect pour les URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedProject) params.set('projectId', selectedProject);
    if (selectedLocation) params.set('location', selectedLocation);
    setSearchParams(params);
  }, [searchTerm, selectedProject, selectedLocation, setSearchParams]);

  // Gestion des actions
  const handleDeleteActivity = async (activityId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette activité ?')) {
      try {
        await activitiesApi.deleteActivity(activityId);
        await loadActivities();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleDuplicateActivity = async (activityId: string) => {
    try {
      const duplicated = await activitiesApi.duplicateActivity(activityId);
      navigate(`/chercheur/activities/${duplicated.id}`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Reset des filtres
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedProject('');
    setSelectedLocation('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Formater les dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading && activities.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900">Mes Activités</h1>
          <p className="text-gray-600 mt-1">
            Gérez et suivez vos activités de recherche
          </p>
        </div>
        <Link
          to="/chercheur/activities/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nouvelle activité
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
              placeholder="Rechercher une activité..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Bouton filtres */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors ${
              showFilters || selectedProject || selectedLocation
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
                  Projet
                </label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tous les projets</option>
                  {/* TODO: Charger la liste des projets dynamiquement */}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lieu
                </label>
                <input
                  type="text"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  placeholder="Filtrer par lieu..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
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

      {/* Liste des activités */}
      {activities.length === 0 && !loading ? (
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Activity className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune activité trouvée
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedProject || selectedLocation
              ? 'Essayez de modifier vos critères de recherche'
              : 'Commencez par créer votre première activité'}
          </p>
          <Link
            to="/chercheur/activities/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Créer une activité
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
            >
              {/* Header de la carte */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/chercheur/activities/${activity.id}`}
                      className="block hover:text-blue-600 transition-colors"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {activity.title}
                      </h3>
                    </Link>
                    {activity.project && (
                      <Link
                        to={`/chercheur/projects/${activity.project.id}`}
                        className="text-sm text-blue-600 hover:text-blue-700 mt-1 block"
                      >
                        📁 {activity.project.title}
                      </Link>
                    )}
                  </div>
                  
                  {/* Menu actions */}
                  <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setOpenDropdown(openDropdown === activity.id ? null : activity.id)}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    
                    {openDropdown === activity.id && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setOpenDropdown(null)}
                        />
                        
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border z-20">
                          <div className="py-1">
                            <Link
                              to={`/chercheur/activities/${activity.id}`}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              onClick={() => setOpenDropdown(null)}
                            >
                              <Eye className="h-4 w-4" />
                              Voir le détail
                            </Link>
                            <Link
                              to={`/chercheur/activities/${activity.id}/edit`}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              onClick={() => setOpenDropdown(null)}
                            >
                              <Edit className="h-4 w-4" />
                              Modifier
                            </Link>
                            <button
                              onClick={() => {
                                handleDuplicateActivity(activity.id);
                                setOpenDropdown(null);
                              }}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                            >
                              <Copy className="h-4 w-4" />
                              Dupliquer
                            </button>
                            <button
                              onClick={() => {
                                handleDeleteActivity(activity.id);
                                setOpenDropdown(null);
                              }}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                            >
                              <Trash2 className="h-4 w-4" />
                              Supprimer
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Corps de la carte */}
              <div className="p-4">
                {/* Description */}
                {activity.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {activity.description}
                  </p>
                )}

                {/* Informations */}
                <div className="space-y-2 mb-4">
                  {/* Lieu */}
                  {activity.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{activity.location}</span>
                    </div>
                  )}

                  {/* Dates */}
                  {(activity.startDate || activity.endDate) && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {activity.startDate && formatDate(activity.startDate)}
                        {activity.startDate && activity.endDate && ' - '}
                        {activity.endDate && formatDate(activity.endDate)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <CheckSquare className="h-4 w-4" />
                    <span>{activity._count?.tasks || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <FileText className="h-4 w-4" />
                    <span>{activity._count?.documents || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Folder className="h-4 w-4" />
                    <span>{activity._count?.forms || 0}</span>
                  </div>
                </div>

                {/* Dernière mise à jour */}
                <div className="text-xs text-gray-500 mb-4">
                  Mis à jour le {formatDate(activity.updatedAt)}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    to={`/chercheur/activities/${activity.id}`}
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

export default ActivitiesList;