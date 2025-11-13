// src/pages/chercheur/ReportsHistoryPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Download,
  Calendar,
  CheckCircle,
  XCircle,
  Search
} from 'lucide-react';
import reportsApi, { ReportHistoryItem } from '../../services/reportsApi';

const ReportsHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [history, setHistory] = useState<ReportHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Filtres
  const [filters, setFilters] = useState({
    search: '',
    reportType: '',
    success: '',
    startDate: '',
    endDate: ''
  });

  // Charger l'historique
  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await reportsApi.getReportHistory(pagination.page, pagination.limit);
      setHistory(response.history);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [pagination.page]);

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusText = (success: boolean) => {
    return success ? 'Succès' : 'Erreur';
  };

  const getStatusClass = (success: boolean) => {
    return success 
      ? 'bg-green-100 text-green-700' 
      : 'bg-red-100 text-red-700';
  };

  const getReportTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      project: 'Projet',
      activity: 'Activité',
      user: 'Utilisateur',
      global: 'Global'
    };
    return labels[type] || type;
  };

  const filteredHistory = history.filter(item => {
    if (filters.search && !item.details.reportType.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.reportType && item.details.reportType !== filters.reportType) {
      return false;
    }
    if (filters.success && item.details.success.toString() !== filters.success) {
      return false;
    }
    return true;
  });

  if (loading && history.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/chercheur/reports')}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Historique des Rapports
            </h1>
            <p className="text-gray-600 mt-1">
              Consultez l'historique complet de vos rapports générés
            </p>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Type de rapport */}
          <select
            value={filters.reportType}
            onChange={(e) => setFilters(prev => ({ ...prev, reportType: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les types</option>
            <option value="project">Projet</option>
            <option value="activity">Activité</option>
            <option value="user">Utilisateur</option>
            <option value="global">Global</option>
          </select>

          {/* Statut */}
          <select
            value={filters.success}
            onChange={(e) => setFilters(prev => ({ ...prev, success: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les statuts</option>
            <option value="true">Succès</option>
            <option value="false">Erreur</option>
          </select>

          {/* Reset */}
          <button
            onClick={() => setFilters({
              search: '',
              reportType: '',
              success: '',
              startDate: '',
              endDate: ''
            })}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <XCircle className="h-4 w-4 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Liste de l'historique */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Historique ({pagination.total} éléments)
          </h3>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun historique trouvé
            </h3>
            <p className="text-gray-600">
              {filters.search || filters.reportType || filters.success
                ? 'Essayez de modifier vos critères de recherche'
                : 'Vous n\'avez pas encore généré de rapports'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type de rapport
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date/Heure
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Détails
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(item.details.success)}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(item.details.success)}`}>
                          {getStatusText(item.details.success)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          Rapport {getReportTypeLabel(item.details.reportType)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <div>
                          <div>{new Date(item.createdAt).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-400">
                            {new Date(item.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-600">
                        {item.entityType && item.entityId && (
                          <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                            ID: {item.entityId.substring(0, 8)}...
                          </span>
                        )}
                        {item.level && (
                          <span className={`ml-2 px-2 py-1 rounded text-xs ${
                            item.level === 'INFO' ? 'bg-blue-100 text-blue-700' :
                            item.level === 'WARNING' ? 'bg-yellow-100 text-yellow-700' :
                            item.level === 'ERROR' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {item.level}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {item.details.success && item.entityId && (
                        <button
                          onClick={() => {
                            // Régénérer le même rapport
                            reportsApi.downloadReport(item.details.reportType, item.entityId)
                              .catch(err => alert(err.message));
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                          title="Régénérer ce rapport"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-between items-center p-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Page {pagination.page} sur {pagination.pages} ({pagination.total} éléments)
            </div>
            <div className="flex gap-2">
              <button
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm"
              >
                Précédent
              </button>
              <button
                disabled={pagination.page === pagination.pages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsHistoryPage;