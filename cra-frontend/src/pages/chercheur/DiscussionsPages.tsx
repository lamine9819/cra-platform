// src/pages/chercheur/DiscussionsPage.tsx
import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  TrendingUp, 
  Users, 
  Filter,
  Search,
  Calendar,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { CommentList } from '../../components/comments/CommentList';
import { useComments } from '../../hooks/useComments';
import { CommentListQuery } from '../../types/comment.types';

const DiscussionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'my' | 'recent'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTargetType, setSelectedTargetType] = useState<'all' | 'project' | 'activity' | 'task'>('all');
  const [dateRange, setDateRange] = useState<'all' | '7d' | '30d' | '3m'>('all');

  // Construction des paramètres de requête
  const buildQueryParams = (): CommentListQuery => {
    const params: CommentListQuery = {
      page: 1,
      limit: 20,
    };

    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }

    if (selectedTargetType !== 'all') {
      params.targetType = selectedTargetType as 'project' | 'activity' | 'task';
    }

    if (dateRange !== 'all') {
      const now = new Date();
      const startDate = new Date();
      
      switch (dateRange) {
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '3m':
          startDate.setMonth(now.getMonth() - 3);
          break;
      }
      
      params.startDate = startDate.toISOString();
    }

    return params;
  };

  const {
    comments,
    loading,
    error,
    pagination,
    updateComment,
    deleteComment,
    loadComments,
    refreshComments,
    loadMore,
    stats,
    loadStats,
  } = useComments({
    autoLoad: true,
    initialParams: buildQueryParams(),
  });

  // Charger les statistiques
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Recharger les commentaires quand les filtres changent
  useEffect(() => {
    loadComments(buildQueryParams());
  }, [activeTab, selectedTargetType, dateRange]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadComments(buildQueryParams());
  };

  const getDateRangeLabel = (range: string) => {
    switch (range) {
      case '7d': return '7 derniers jours';
      case '30d': return '30 derniers jours';
      case '3m': return '3 derniers mois';
      default: return 'Toutes les périodes';
    }
  };

  const getTargetTypeLabel = (type: string) => {
    switch (type) {
      case 'project': return 'Projets';
      case 'activity': return 'Activités';
      case 'task': return 'Tâches';
      default: return 'Tous les types';
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Discussions</h1>
                <p className="text-sm text-gray-600">
                  Toutes les conversations de vos projets, activités et tâches
                </p>
              </div>
            </div>
            
            <button
              onClick={refreshComments}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 rounded-full hover:bg-gray-100"
              title="Actualiser"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Statistiques */}
        {stats && (
          <div className="px-6 py-4 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <MessageSquare className="w-8 h-8 text-indigo-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Total commentaires</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalComments}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Contributeurs</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.byAuthor.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="w-8 h-8 text-orange-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Cette semaine</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.recentActivity.slice(0, 7).reduce((sum, day) => sum + day.count, 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BarChart3 className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Projets actifs</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.byTargetType.project}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
        <div className="space-y-4">
          {/* Onglets */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors duration-200 ${
                activeTab === 'all'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Toutes les discussions
            </button>
            <button
              onClick={() => setActiveTab('my')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors duration-200 ${
                activeTab === 'my'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Mes commentaires
            </button>
            <button
              onClick={() => setActiveTab('recent')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors duration-200 ${
                activeTab === 'recent'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Récents
            </button>
          </div>

          {/* Barre de recherche */}
          <form onSubmit={handleSearch} className="flex space-x-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher dans toutes les discussions..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              Rechercher
            </button>
          </form>

          {/* Filtres */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filtres:</span>
            </div>

            <select
              value={selectedTargetType}
              onChange={(e) => setSelectedTargetType(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Tous les types</option>
              <option value="project">Projets</option>
              <option value="activity">Activités</option>
              <option value="task">Tâches</option>
            </select>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Toutes les périodes</option>
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
              <option value="3m">3 derniers mois</option>
            </select>

            {/* Indicateurs de filtres actifs */}
            {(selectedTargetType !== 'all' || dateRange !== 'all' || searchQuery) && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Filtres actifs:</span>
                
                {selectedTargetType !== 'all' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {getTargetTypeLabel(selectedTargetType)}
                  </span>
                )}
                
                {dateRange !== 'all' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Calendar className="w-3 h-3 mr-1" />
                    {getDateRangeLabel(dateRange)}
                  </span>
                )}
                
                {searchQuery && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    <Search className="w-3 h-3 mr-1" />
                    "{searchQuery}"
                  </span>
                )}

                <button
                  onClick={() => {
                    setSelectedTargetType('all');
                    setDateRange('all');
                    setSearchQuery('');
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Effacer tout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Liste des commentaires */}
      <CommentList
        comments={comments}
        loading={loading}
        error={error}
        pagination={pagination}
        onUpdate={updateComment}
        onDelete={deleteComment}
        onLoadMore={loadMore}
        onRefresh={refreshComments}
        showLoadMore={true}
        emptyMessage={
          activeTab === 'my' 
            ? "Vous n'avez encore écrit aucun commentaire. Participez aux discussions de vos projets !" 
            : "Aucune discussion trouvée avec ces critères. Essayez de modifier vos filtres."
        }
      />

      {/* Section contributeurs les plus actifs */}
      {stats && stats.byAuthor.length > 0 && (
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-indigo-600" />
            Contributeurs les plus actifs
          </h3>
          
          <div className="space-y-3">
            {stats.byAuthor.slice(0, 5).map((contributor, index) => (
              <div key={contributor.authorId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-indigo-700">#{index + 1}</span>
                  </div>
                  <span className="font-medium text-gray-900">{contributor.authorName}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">
                    {contributor.count} commentaire{contributor.count !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscussionsPage;