// src/pages/chercheur/PublicationsList.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Filter,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Download,
  FileText,
  Calendar,
  Users,
  ExternalLink,
  Award,
  Globe,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { publicationsApi } from '../../services/publicationsApi';
import { useAuth } from '../../contexts/AuthContext';
import {
  PublicationType,
  PublicationStatus,
  Quartile,
  PublicationTypeLabels,
  PublicationTypeColors,
  PublicationStatusLabels,
  PublicationStatusColors,
  QuartileLabels,
  QuartileColors
} from '../../types/publication.types';
import type {
  Publication,
  PublicationQuery
} from '../../types/publication.types';

const PublicationsList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Filtres et pagination
  const [filters, setFilters] = useState<PublicationQuery>({
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [showFilters, setShowFilters] = useState(false);

  // Charger les publications
  useEffect(() => {
    loadPublications();
  }, [filters]);

  const loadPublications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await publicationsApi.listPublications(filters);
      setPublications(response.publications);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des publications');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await publicationsApi.deletePublication(id);
      loadPublications();
      setDeleteConfirm(null);
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la suppression');
    }
  };

  const handleDownload = async (publicationId: string) => {
    try {
      await publicationsApi.downloadDocument(publicationId);
    } catch (err: any) {
      alert(err.message || 'Erreur lors du téléchargement');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getAuthorsString = (authors: Publication['authors']) => {
    if (!authors || authors.length === 0) return 'Aucun auteur';
    return authors
      .sort((a, b) => a.authorOrder - b.authorOrder)
      .map(a => {
        // Auteur interne (user existe)
        if (a.user) {
          return `${a.user.firstName} ${a.user.lastName}`;
        }
        // Auteur externe (externalName existe)
        return a.externalName || 'Auteur inconnu';
      })
      .join(', ');
  };

  // Vérifier si l'utilisateur peut modifier une publication
  const canManagePublication = (publication: Publication) => {
    return (
      publication.authors.some(author => author.userId === user?.id) ||
      user?.role === 'ADMINISTRATEUR'
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-green-600" />
              Publications Scientifiques
            </h1>
            <p className="text-gray-600 mt-1">
              Gérez et consultez vos publications scientifiques
            </p>
          </div>
          <Link
            to="/chercheur/publications/create"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Nouvelle Publication
          </Link>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par titre, abstract, journal..."
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 border rounded-lg flex items-center gap-2 ${
                showFilters ? 'bg-green-50 border-green-500 text-green-600' : 'border-gray-300 text-gray-700'
              }`}
            >
              <Filter className="h-5 w-5" />
              Filtres
            </button>
          </div>

          {/* Filtres avancés */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={filters.type || ''}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value as PublicationType || undefined, page: 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Tous les types</option>
                  {Object.entries(PublicationTypeLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value as PublicationStatus || undefined, page: 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Tous les statuts</option>
                  {Object.entries(PublicationStatusLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Année
                </label>
                <input
                  type="number"
                  placeholder="Ex: 2024"
                  value={filters.year || ''}
                  onChange={(e) => setFilters({ ...filters, year: e.target.value ? parseInt(e.target.value) : undefined, page: 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quartile
                </label>
                <select
                  value={filters.quartile || ''}
                  onChange={(e) => setFilters({ ...filters, quartile: e.target.value as Quartile || undefined, page: 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Tous les quartiles</option>
                  {Object.entries(QuartileLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Portée
                </label>
                <select
                  value={filters.isInternational === undefined ? '' : filters.isInternational.toString()}
                  onChange={(e) => setFilters({
                    ...filters,
                    isInternational: e.target.value === '' ? undefined : e.target.value === 'true',
                    page: 1
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Toutes</option>
                  <option value="true">International</option>
                  <option value="false">National</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilters({ page: 1, limit: 10 });
                    setShowFilters(false);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contenu */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : publications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune publication trouvée
          </h3>
          <p className="text-gray-600 mb-4">
            Commencez par créer votre première publication scientifique
          </p>
          <Link
            to="/chercheur/publications/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="h-5 w-5" />
            Créer une publication
          </Link>
        </div>
      ) : (
        <>
          {/* Liste des publications */}
          <div className="space-y-4 mb-6">
            {publications.map((publication) => (
              <div
                key={publication.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {publication.title}
                      </h3>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${PublicationTypeColors[publication.type]}`}>
                        {PublicationTypeLabels[publication.type]}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${PublicationStatusColors[publication.status]}`}>
                        {PublicationStatusLabels[publication.status]}
                      </span>
                      {publication.quartile && (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${QuartileColors[publication.quartile]}`}>
                          {publication.quartile}
                        </span>
                      )}
                      {publication.isInternational && (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 flex items-center gap-1">
                          <Globe className="h-4 w-4" />
                          International
                        </span>
                      )}
                      {publication.isOpenAccess && (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          Open Access
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{getAuthorsString(publication.authors)}</span>
                      </div>
                      {publication.journal && (
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span>{publication.journal}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Publié le {formatDate(publication.publicationDate)}</span>
                      </div>
                      {publication.impactFactor && (
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4" />
                          <span>Impact Factor: {publication.impactFactor}</span>
                        </div>
                      )}
                    </div>

                    {publication.abstract && (
                      <p className="mt-3 text-gray-700 line-clamp-2">
                        {publication.abstract}
                      </p>
                    )}

                    {publication.keywords && publication.keywords.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {publication.keywords.map((keyword, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => navigate(`/chercheur/publications/${publication.id}`)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                      title="Voir les détails"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    {canManagePublication(publication) && (
                      <button
                        onClick={() => navigate(`/chercheur/publications/${publication.id}/edit`)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                        title="Modifier"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                    )}
                    {publication.document && (
                      <button
                        onClick={() => handleDownload(publication.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        title="Télécharger le document"
                      >
                        <Download className="h-5 w-5" />
                      </button>
                    )}
                    {publication.url && (
                      <a
                        href={publication.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                        title="Ouvrir le lien"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    )}
                    {canManagePublication(publication) && (
                      <button
                        onClick={() => setDeleteConfirm(publication.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Supprimer"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white rounded-lg shadow-sm p-4 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Affichage de {(pagination.page - 1) * pagination.limit + 1} à{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} sur{' '}
                {pagination.total} publications
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilters({ ...filters, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Précédent
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      return (
                        page === 1 ||
                        page === pagination.totalPages ||
                        Math.abs(page - pagination.page) <= 1
                      );
                    })
                    .map((page, idx, arr) => (
                      <React.Fragment key={page}>
                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                          <span className="text-gray-400">...</span>
                        )}
                        <button
                          onClick={() => setFilters({ ...filters, page })}
                          className={`px-4 py-2 rounded-lg ${
                            page === pagination.page
                              ? 'bg-green-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    ))}
                </div>
                <button
                  onClick={() => setFilters({ ...filters, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Suivant
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de confirmation de suppression */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confirmer la suppression
            </h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer cette publication ? Cette action est irréversible.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicationsList;
