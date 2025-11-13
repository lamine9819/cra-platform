// src/pages/chercheur/SeminarsList.tsx
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  MapPin,
  Clock,
  Eye,
  UserPlus,
  UserMinus,
  MoreVertical,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  X
} from 'lucide-react';

// Import du service et des types
import seminarsApi, { SeminarListResponse } from '../../services/seminarsApi';
import { SeminarResponse, SeminarFilters } from '../../types/seminar.types';

const SeminarsList: React.FC = () => {
  // États locaux
  const [searchParams, setSearchParams] = useSearchParams();
  const [seminars, setSeminars] = useState<SeminarResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [timeFilter, setTimeFilter] = useState(searchParams.get('timeFilter') || 'all');
  const [locationFilter, setLocationFilter] = useState(searchParams.get('location') || '');
  const [showFilters, setShowFilters] = useState(false);

  // États pour les actions
  const [loadingActions, setLoadingActions] = useState<{ [key: string]: boolean }>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Données utilisateur
  const userData = JSON.parse(localStorage.getItem('cra_user_data') || '{}');
  const userRole = userData.role;

  // =============================================
  // EFFETS ET CHARGEMENT DES DONNÉES
  // =============================================

  useEffect(() => {
    loadSeminars();
  }, [searchParams]);

  const loadSeminars = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: SeminarFilters = {
        page: parseInt(searchParams.get('page') || '1'),
        limit: 12,
        search: searchParams.get('search') || undefined,
        status: searchParams.get('status') === 'all' ? undefined : searchParams.get('status') as any,
        timeFilter: searchParams.get('timeFilter') === 'all' ? undefined : searchParams.get('timeFilter') as any,
        location: searchParams.get('location') || undefined,
      };

      console.log('🔍 Chargement des séminaires avec filtres:', filters);

      const result: SeminarListResponse = await seminarsApi.listSeminars(filters);
      
      setSeminars(result.seminars);
      setPagination(result.pagination);

      console.log('✅ Séminaires chargés:', { 
        count: result.seminars.length, 
        pagination: result.pagination 
      });

    } catch (err: any) {
      console.error('❌ Erreur lors du chargement des séminaires:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =============================================
  // GESTION DES FILTRES
  // =============================================

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateURLParams({ search: searchTerm || undefined, page: '1' });
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    updateURLParams({ status: value === 'all' ? undefined : value, page: '1' });
  };

  const handleTimeFilter = (value: string) => {
    setTimeFilter(value);
    updateURLParams({ timeFilter: value === 'all' ? undefined : value, page: '1' });
  };

  const handleLocationFilter = (value: string) => {
    setLocationFilter(value);
    updateURLParams({ location: value || undefined, page: '1' });
  };

  const updateURLParams = (updates: Record<string, string | undefined>) => {
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });

    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTimeFilter('all');
    setLocationFilter('');
    setSearchParams({});
  };

  // =============================================
  // ACTIONS SUR LES SÉMINAIRES
  // =============================================

  const handleRegister = async (seminarId: string) => {
    try {
      setLoadingActions(prev => ({ ...prev, [`register-${seminarId}`]: true }));
      
      await seminarsApi.registerToSeminar(seminarId);
      setSuccessMessage('Inscription réussie au séminaire');
      
      loadSeminars();
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingActions(prev => ({ ...prev, [`register-${seminarId}`]: false }));
    }
  };

  const handleUnregister = async (seminarId: string) => {
    try {
      setLoadingActions(prev => ({ ...prev, [`unregister-${seminarId}`]: true }));
      
      await seminarsApi.unregisterFromSeminar(seminarId);
      setSuccessMessage('Désinscription réussie du séminaire');
      
      loadSeminars();
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingActions(prev => ({ ...prev, [`unregister-${seminarId}`]: false }));
    }
  };

  const handleDelete = async (seminarId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce séminaire ?')) {
      return;
    }

    try {
      setLoadingActions(prev => ({ ...prev, [`delete-${seminarId}`]: true }));
      
      await seminarsApi.deleteSeminar(seminarId);
      setSuccessMessage('Séminaire supprimé avec succès');
      
      loadSeminars();
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingActions(prev => ({ ...prev, [`delete-${seminarId}`]: false }));
    }
  };

  // =============================================
  // FONCTIONS UTILITAIRES
  // =============================================

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PLANIFIE':
        return <Clock className="h-4 w-4" />;
      case 'EN_COURS':
        return <AlertCircle className="h-4 w-4" />;
      case 'TERMINE':
        return <CheckCircle className="h-4 w-4" />;
      case 'ANNULE':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case 'PLANIFIE':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'EN_COURS':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'TERMINE':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'ANNULE':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getRegistrationStatusBadge = (registrationStatus?: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (registrationStatus) {
      case 'open':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'full':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'closed':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case 'ended':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const canUserEditSeminar = (seminar: SeminarResponse): boolean => {
    return seminar.organizer.id === userData.id || userRole === 'ADMINISTRATEUR';
  };

  const canUserDeleteSeminar = (seminar: SeminarResponse): boolean => {
    return canUserEditSeminar(seminar) && seminar.status !== 'EN_COURS' && seminar.status !== 'TERMINE';
  };

  const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // =============================================
  // RENDU
  // =============================================

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Chargement des séminaires...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec titre et bouton de création */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Séminaires</h1>
          <p className="text-gray-600 mt-1">
            Gérez et participez aux séminaires de recherche
          </p>
        </div>
        
        {['CHERCHEUR', 'ADMINISTRATEUR'].includes(userRole) && (
          <Link 
            to="/chercheur/seminars/new"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau séminaire
          </Link>
        )}
      </div>

      {/* Messages de succès/erreur */}
      {successMessage && (
        <div className="rounded-md bg-green-50 p-4 border border-green-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                {successMessage}
              </p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setSuccessMessage(null)}
                className="inline-flex text-green-400 hover:text-green-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                {error}
              </p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="inline-flex text-red-400 hover:text-red-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-lg border border-gray-200 shadow">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Recherche */}
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher des séminaires..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </form>

            {/* Filtre par statut */}
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="all">Tous les statuts</option>
              <option value="PLANIFIE">Planifié</option>
              <option value="EN_COURS">En cours</option>
              <option value="TERMINE">Terminé</option>
              <option value="ANNULE">Annulé</option>
            </select>

            {/* Filtre temporel */}
            <select
              value={timeFilter}
              onChange={(e) => handleTimeFilter(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="all">Toutes les périodes</option>
              <option value="upcoming">À venir</option>
              <option value="current">En cours</option>
              <option value="past">Passés</option>
            </select>

            {/* Bouton pour effacer les filtres */}
            <button 
              onClick={clearFilters}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Filter className="h-4 w-4 mr-2" />
              Effacer les filtres
            </button>
          </div>
        </div>
      </div>

      {/* Liste des séminaires */}
      {seminars.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun séminaire trouvé</h3>
          <p className="text-gray-600 mb-4">
            Il n'y a pas de séminaires correspondant à vos critères de recherche.
          </p>
          {['CHERCHEUR', 'ADMINISTRATEUR'].includes(userRole) && (
            <Link 
              to="/chercheur/seminars/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Créer un séminaire
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6">
          {seminars.map((seminar) => (
            <div key={seminar.id} className="bg-white rounded-lg border border-gray-200 shadow hover:shadow-md transition-shadow">
              {/* En-tête de la carte */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        <Link 
                          to={`/chercheur/seminars/${seminar.id}`}
                          className="hover:text-blue-600"
                        >
                          {seminar.title}
                        </Link>
                      </h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center text-sm text-gray-500">
                          <User className="h-4 w-4 mr-1" />
                          {seminar.organizer.firstName} {seminar.organizer.lastName}
                        </div>
                        {seminar.location && (
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="h-4 w-4 mr-1" />
                            {seminar.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Badges de statut */}
                    <span className={getStatusBadge(seminar.status)}>
                      {getStatusIcon(seminar.status)}
                      <span className="ml-1">
                        {seminar.status === 'PLANIFIE' ? 'Planifié' :
                         seminar.status === 'EN_COURS' ? 'En cours' :
                         seminar.status === 'TERMINE' ? 'Terminé' :
                         seminar.status === 'ANNULE' ? 'Annulé' : seminar.status}
                      </span>
                    </span>
                    
                    {seminar.registrationStatus && (
                      <span className={getRegistrationStatusBadge(seminar.registrationStatus)}>
                        {seminar.registrationStatus === 'open' ? 'Ouvert' :
                         seminar.registrationStatus === 'full' ? 'Complet' :
                         seminar.registrationStatus === 'closed' ? 'Fermé' :
                         seminar.registrationStatus === 'ended' ? 'Terminé' : seminar.registrationStatus}
                      </span>
                    )}

                    {/* Menu d'actions */}
                    <div className="relative">
                      <button
                        onClick={() => {/* Toggle dropdown */}}
                        className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contenu de la carte */}
              <div className="px-6 py-4">
                {seminar.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {seminar.description}
                  </p>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Date de début:</span>
                    <p className="font-medium text-gray-900">
                      {formatDate(seminar.startDate)}
                    </p>
                  </div>
                  
                  {seminar.endDate && (
                    <div>
                      <span className="text-gray-500">Date de fin:</span>
                      <p className="font-medium text-gray-900">
                        {formatDate(seminar.endDate)}
                      </p>
                    </div>
                  )}

                  <div>
                    <span className="text-gray-500">Participants:</span>
                    <p className="font-medium text-gray-900">
                      {seminar._count?.participants || 0}
                      {seminar.maxParticipants && ` / ${seminar.maxParticipants}`}
                    </p>
                  </div>

                  <div>
                    <span className="text-gray-500">Documents:</span>
                    <p className="font-medium text-gray-900">
                      {seminar._count?.documents || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <Link
                      to={`/chercheur/seminars/${seminar.id}`}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Voir détails
                    </Link>

                    {canUserEditSeminar(seminar) && (
                      <Link
                        to={`/chercheur/seminars/${seminar.id}/edit`}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Modifier
                      </Link>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Actions d'inscription */}
                    {seminar.isRegistered ? (
                      <button
                        onClick={() => handleUnregister(seminar.id)}
                        disabled={loadingActions[`unregister-${seminar.id}`]}
                        className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
                      >
                        {loadingActions[`unregister-${seminar.id}`] ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                        ) : (
                          <UserMinus className="h-4 w-4 mr-2" />
                        )}
                        Se désinscrire
                      </button>
                    ) : seminar.canRegister ? (
                      <button
                        onClick={() => handleRegister(seminar.id)}
                        disabled={loadingActions[`register-${seminar.id}`]}
                        className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                      >
                        {loadingActions[`register-${seminar.id}`] ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <UserPlus className="h-4 w-4 mr-2" />
                        )}
                        S'inscrire
                      </button>
                    ) : null}

                    {/* Action de suppression */}
                    {canUserDeleteSeminar(seminar) && (
                      <button
                        onClick={() => handleDelete(seminar.id)}
                        disabled={loadingActions[`delete-${seminar.id}`]}
                        className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
                      >
                        {loadingActions[`delete-${seminar.id}`] ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                        ) : (
                          <Trash2 className="h-4 w-4 mr-2" />
                        )}
                        Supprimer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="bg-white px-4 py-3 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Affichage de {((pagination.page - 1) * pagination.limit) + 1} à{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} sur{' '}
              {pagination.total} séminaires
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => updateURLParams({ page: String(pagination.page - 1) })}
                disabled={!pagination.hasPrev}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              <span className="text-sm text-gray-700">
                Page {pagination.page} sur {pagination.totalPages}
              </span>
              <button
                onClick={() => updateURLParams({ page: String(pagination.page + 1) })}
                disabled={!pagination.hasNext}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeminarsList;