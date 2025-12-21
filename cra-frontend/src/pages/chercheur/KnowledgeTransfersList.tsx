// src/pages/chercheur/KnowledgeTransfersList.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Share2,
  Search,
  Filter,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  Users,
  MapPin,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import { knowledgeTransferApi, TransferType, KnowledgeTransfer, KnowledgeTransferFilters } from '../../services/knowledgeTransferApi';
import { useAuth } from '../../contexts/AuthContext';

const KnowledgeTransfersList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [transfers, setTransfers] = useState<KnowledgeTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Filtres et pagination
  const [filters, setFilters] = useState<KnowledgeTransferFilters>({
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

  // Charger les transferts
  useEffect(() => {
    loadTransfers();
  }, [filters]);

  const loadTransfers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await knowledgeTransferApi.listKnowledgeTransfers(filters);
      setTransfers(response.transfers);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des transferts de connaissances');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await knowledgeTransferApi.deleteKnowledgeTransfer(id);
      loadTransfers();
      setDeleteConfirm(null);
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la suppression');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTypeColor = (type: TransferType): string => {
    const colors: Record<TransferType, string> = {
      FICHE_TECHNIQUE: 'bg-blue-100 text-blue-800',
      DEMONSTRATION: 'bg-green-100 text-green-800',
      FORMATION_PRODUCTEUR: 'bg-purple-100 text-purple-800',
      VISITE_GUIDEE: 'bg-yellow-100 text-yellow-800',
      EMISSION_RADIO: 'bg-pink-100 text-pink-800',
      REPORTAGE_TV: 'bg-red-100 text-red-800',
      PUBLICATION_VULGARISATION: 'bg-indigo-100 text-indigo-800',
      SITE_WEB: 'bg-cyan-100 text-cyan-800',
      RESEAUX_SOCIAUX: 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Share2 className="w-8 h-8 text-green-600" />
            Transferts de connaissances
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez vos activités de transfert et vulgarisation
          </p>
        </div>
        <Link
          to="/chercheur/knowledge-transfers/create"
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouveau transfert
        </Link>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un transfert..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            />
          </div>

          {/* Bouton filtres */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center px-4 py-2 border rounded-lg transition-colors ${
              showFilters ? 'bg-green-50 border-green-600 text-green-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-5 h-5 mr-2" />
            Filtres
          </button>
        </div>

        {/* Filtres avancés */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de transfert
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                value={filters.type || ''}
                onChange={(e) => setFilters({ ...filters, type: e.target.value as TransferType || undefined, page: 1 })}
              >
                <option value="">Tous les types</option>
                {knowledgeTransferApi.getTransferTypes().map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date début */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date début
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                value={filters.startDate || ''}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value || undefined, page: 1 })}
              />
            </div>

            {/* Date fin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date fin
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                value={filters.endDate || ''}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value || undefined, page: 1 })}
              />
            </div>
          </div>
        )}
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Liste des transferts */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : transfers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Share2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun transfert de connaissances
          </h3>
          <p className="text-gray-600 mb-6">
            Commencez par créer votre premier transfert de connaissances
          </p>
          <Link
            to="/chercheur/knowledge-transfers/create"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouveau transfert
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {transfers.map((transfer) => (
            <div
              key={transfer.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                {/* Informations principales */}
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <Share2 className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {transfer.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(transfer.type)}`}>
                          {knowledgeTransferApi.getTransferTypeLabel(transfer.type)}
                        </span>
                      </div>

                      {transfer.description && (
                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {transfer.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(transfer.date)}
                        </div>
                        {transfer.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {transfer.location}
                          </div>
                        )}
                        {transfer.participants && (
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {transfer.participants} participant{transfer.participants > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>

                      {transfer.targetAudience && transfer.targetAudience.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {transfer.targetAudience.map((audience, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                            >
                              {audience}
                            </span>
                          ))}
                        </div>
                      )}

                      {(transfer.impact || transfer.feedback) && (
                        <div className="mt-3 flex gap-4">
                          {transfer.impact && (
                            <div className="flex items-start gap-1 text-sm">
                              <TrendingUp className="w-4 h-4 text-green-600 mt-0.5" />
                              <span className="text-gray-600">{transfer.impact}</span>
                            </div>
                          )}
                          {transfer.feedback && (
                            <div className="flex items-start gap-1 text-sm">
                              <MessageSquare className="w-4 h-4 text-blue-600 mt-0.5" />
                              <span className="text-gray-600">{transfer.feedback}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col gap-2">
                  <Link
                    to={`/chercheur/knowledge-transfers/${transfer.id}`}
                    className="inline-flex items-center justify-center px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm"
                  >
                    <Eye className="w-4 h-4 lg:mr-0 xl:mr-2" />
                    <span className="hidden xl:inline">Voir</span>
                  </Link>
                  <Link
                    to={`/chercheur/knowledge-transfers/${transfer.id}/edit`}
                    className="inline-flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                  >
                    <Edit2 className="w-4 h-4 lg:mr-0 xl:mr-2" />
                    <span className="hidden xl:inline">Modifier</span>
                  </Link>
                  {deleteConfirm === transfer.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(transfer.id)}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        Confirmer
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm"
                      >
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(transfer.id)}
                      className="inline-flex items-center justify-center px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm"
                    >
                      <Trash2 className="w-4 h-4 lg:mr-0 xl:mr-2" />
                      <span className="hidden xl:inline">Supprimer</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3">
          <div className="text-sm text-gray-700">
            Page {pagination.page} sur {pagination.totalPages} ({pagination.total} résultat{pagination.total > 1 ? 's' : ''})
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilters({ ...filters, page: Math.max(1, pagination.page - 1) })}
              disabled={pagination.page === 1}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Précédent
            </button>
            <button
              onClick={() => setFilters({ ...filters, page: Math.min(pagination.totalPages, pagination.page + 1) })}
              disabled={pagination.page === pagination.totalPages}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeTransfersList;
