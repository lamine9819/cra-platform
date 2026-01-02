// src/components/forms/FormResponsesView.tsx - Vue des réponses d'un formulaire

import React, { useState, useEffect } from 'react';
import {
  Form,
  FormResponseData,
  ExportOptions,
} from '../../types/form.types';
import formApi from '../../services/formApi';
import {
  Download,
  Filter,
  Search,
  Eye,
  Calendar,
  User,
  Image as ImageIcon,
  Loader,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface FormResponsesViewProps {
  form: Form;
}

export const FormResponsesView: React.FC<FormResponsesViewProps> = ({
  form,
}) => {
  const [responses, setResponses] = useState<FormResponseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [collectorFilter, setCollectorFilter] = useState<
    'ALL' | 'USER' | 'SHARED_USER' | 'PUBLIC'
  >('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResponse, setSelectedResponse] =
    useState<FormResponseData | null>(null);
  const [exporting, setExporting] = useState(false);

  // Charger les réponses
  const loadResponses = async (pageNum: number = 1) => {
    setLoading(true);
    try {
      const result = await formApi.getFormResponses(form.id, {
        page: pageNum,
        limit: 20,
        collectorType: collectorFilter,
      });

      setResponses(result.responses);
      setPagination(result.pagination);
      setPage(pageNum);
    } catch (err) {
      toast.error('Erreur lors du chargement des réponses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResponses(1);
  }, [collectorFilter]);

  // Exporter les réponses
  const handleExport = async (format: 'xlsx' | 'csv' | 'json') => {
    setExporting(true);
    try {
      const options: ExportOptions = {
        format,
        includePhotos: true,
        includeMetadata: true,
        collectorTypes: collectorFilter === 'ALL'
          ? ['USER', 'SHARED_USER', 'PUBLIC']
          : [collectorFilter],
      };

      await formApi.downloadExport(form.id, options, `${form.title}_responses.${format}`);
      toast.success('Export téléchargé avec succès');
    } catch (err) {
      toast.error('Erreur lors de l\'export');
    } finally {
      setExporting(false);
    }
  };

  // Détails d'une réponse
  const ResponseDetailModal: React.FC<{
    response: FormResponseData;
    onClose: () => void;
  }> = ({ response, onClose }) => {
    const [photos, setPhotos] = useState<any[]>([]);
    const [loadingPhotos, setLoadingPhotos] = useState(false);

    useEffect(() => {
      const loadPhotos = async () => {
        if (!response.photos || response.photos.length === 0) return;

        setLoadingPhotos(true);
        try {
          const photoData = await formApi.getResponsePhotos(response.id);
          setPhotos(photoData);
        } catch (err) {
          console.error('Erreur chargement photos:', err);
        } finally {
          setLoadingPhotos(false);
        }
      };

      loadPhotos();
    }, [response.id]);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          {/* En-tête */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Détails de la réponse
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Soumise le{' '}
                {new Date(response.submittedAt).toLocaleString('fr-FR')}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Contenu */}
          <div className="p-6 space-y-6">
            {/* Informations du collecteur */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">
                Informations du collecteur
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">
                    {response.collectorType === 'USER' && 'Utilisateur'}
                    {response.collectorType === 'SHARED_USER' &&
                      'Utilisateur partagé'}
                    {response.collectorType === 'PUBLIC' && 'Public'}
                  </span>
                </div>
                {response.respondent && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nom:</span>
                      <span className="font-medium">
                        {response.respondent.firstName}{' '}
                        {response.respondent.lastName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">
                        {response.respondent.email}
                      </span>
                    </div>
                  </>
                )}
                {response.collectorInfo && (
                  <>
                    {response.collectorInfo.name && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nom:</span>
                        <span className="font-medium">
                          {response.collectorInfo.name}
                        </span>
                      </div>
                    )}
                    {response.collectorInfo.email && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">
                          {response.collectorInfo.email}
                        </span>
                      </div>
                    )}
                  </>
                )}
                {response.isOffline && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mode:</span>
                    <span className="font-medium text-orange-600">
                      Collecté offline
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Données du formulaire */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">
                Réponses du formulaire
              </h4>
              <div className="space-y-4">
                {form.schema.fields.map((field) => {
                  const value = response.data[field.id];

                  // Fonction pour résoudre le label d'une option
                  const resolveOptionLabel = (optionValue: any): string => {
                    if (!field.options) return optionValue?.toString() || '';
                    const option = field.options.find(opt => opt.value === optionValue);
                    return option ? option.label : optionValue?.toString() || '';
                  };

                  return (
                    <div
                      key={field.id}
                      className="border-b border-gray-200 pb-4 last:border-0"
                    >
                      <div className="text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                      </div>
                      <div className="text-gray-900">
                        {value === null || value === undefined || value === '' ? (
                          <span className="text-gray-400 italic">
                            Pas de réponse
                          </span>
                        ) : Array.isArray(value) ? (
                          <ul className="list-disc list-inside">
                            {value.map((v, i) => (
                              <li key={i}>
                                {field.type === 'checkbox' && field.options
                                  ? resolveOptionLabel(v)
                                  : v}
                              </li>
                            ))}
                          </ul>
                        ) : typeof value === 'object' ? (
                          <pre className="text-sm bg-gray-50 p-2 rounded">
                            {JSON.stringify(value, null, 2)}
                          </pre>
                        ) : (
                          // Pour radio et select, résoudre le label
                          field.type === 'radio' || field.type === 'select'
                            ? resolveOptionLabel(value)
                            : value.toString()
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Photos */}
            {response.photosCount && response.photosCount > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Photos ({response.photosCount})
                </h4>
                {loadingPhotos ? (
                  <div className="text-center py-8">
                    <Loader className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {photos.map((photo) => (
                      <div
                        key={photo.id}
                        className="bg-gray-100 rounded-lg overflow-hidden"
                      >
                        <img
                          src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${photo.url}`}
                          alt={photo.caption || 'Photo'}
                          className="w-full h-40 object-cover"
                        />
                        {photo.caption && (
                          <div className="p-2 text-sm text-gray-700">
                            {photo.caption}
                          </div>
                        )}
                        {(photo.latitude || photo.longitude) && (
                          <div className="px-2 pb-2 text-xs text-gray-500">
                            GPS: {photo.latitude?.toFixed(4)},{' '}
                            {photo.longitude?.toFixed(4)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pied de page */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Barre d'outils */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        {/* Filtres */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={collectorFilter}
              onChange={(e) => setCollectorFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Tous les types</option>
              <option value="USER">Moi</option>
              <option value="SHARED_USER">Utilisateurs partagés</option>
              <option value="PUBLIC">Public</option>
            </select>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Actions d'export */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleExport('xlsx')}
            disabled={exporting || responses.length === 0}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4 mr-2" />
            {exporting ? 'Export...' : 'Excel'}
          </button>
          <button
            onClick={() => handleExport('csv')}
            disabled={exporting || responses.length === 0}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4 mr-2" />
            CSV
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Total des réponses</div>
          <div className="text-2xl font-bold text-gray-900">
            {pagination?.total || 0}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Mes réponses</div>
          <div className="text-2xl font-bold text-indigo-600">
            {responses.filter((r) => r.collectorType === 'USER').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Utilisateurs partagés</div>
          <div className="text-2xl font-bold text-blue-600">
            {responses.filter((r) => r.collectorType === 'SHARED_USER').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Publiques</div>
          <div className="text-2xl font-bold text-green-600">
            {responses.filter((r) => r.collectorType === 'PUBLIC').length}
          </div>
        </div>
      </div>

      {/* Liste des réponses */}
      {loading ? (
        <div className="bg-white rounded-lg p-12 text-center">
          <Loader className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des réponses...</p>
        </div>
      ) : responses.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune réponse
          </h3>
          <p className="text-gray-600">
            Ce formulaire n'a pas encore reçu de réponses.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Collecteur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Photos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {responses.map((response) => (
                <tr
                  key={response.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedResponse(response)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {new Date(response.submittedAt).toLocaleDateString(
                        'fr-FR'
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      {response.respondent
                        ? `${response.respondent.firstName} ${response.respondent.lastName}`
                        : response.collectorInfo?.name || 'Anonyme'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        response.collectorType === 'USER'
                          ? 'bg-indigo-100 text-indigo-800'
                          : response.collectorType === 'SHARED_USER'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {response.collectorType === 'USER' && 'Moi'}
                      {response.collectorType === 'SHARED_USER' && 'Partagé'}
                      {response.collectorType === 'PUBLIC' && 'Public'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {response.photosCount && response.photosCount > 0 ? (
                      <div className="flex items-center text-sm text-gray-600">
                        <ImageIcon className="w-4 h-4 mr-1" />
                        {response.photosCount}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedResponse(response);
                      }}
                      className="text-indigo-600 hover:text-indigo-900 flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Voir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => loadResponses(page - 1)}
                  disabled={!pagination.hasPrev}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Précédent
                </button>
                <button
                  onClick={() => loadResponses(page + 1)}
                  disabled={!pagination.hasNext}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Suivant
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Affichage de{' '}
                    <span className="font-medium">
                      {(page - 1) * pagination.limit + 1}
                    </span>{' '}
                    à{' '}
                    <span className="font-medium">
                      {Math.min(page * pagination.limit, pagination.total)}
                    </span>{' '}
                    sur <span className="font-medium">{pagination.total}</span>{' '}
                    résultats
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => loadResponses(page - 1)}
                      disabled={!pagination.hasPrev}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Précédent
                    </button>
                    {[...Array(pagination.totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => loadResponses(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === i + 1
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => loadResponses(page + 1)}
                      disabled={!pagination.hasNext}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Suivant
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de détails */}
      {selectedResponse && (
        <ResponseDetailModal
          response={selectedResponse}
          onClose={() => setSelectedResponse(null)}
        />
      )}
    </div>
  );
};

export default FormResponsesView;
