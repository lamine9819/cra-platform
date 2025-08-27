// src/components/comments/CommentSection.tsx
import React, { useState } from 'react';
import { MessageSquare, Filter, Search, X } from 'lucide-react';
import { CommentForm } from './CommentForm';
import { CommentList } from './CommentList';
import { useComments } from '../../hooks/useComments';
import { CommentListQuery } from '../../types/comment.types';

interface CommentSectionProps {
  targetType: 'project' | 'activity' | 'task';
  targetId: string;
  title?: string;
  className?: string;
  showStats?: boolean;
  initialQuery?: Partial<CommentListQuery>;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  targetType,
  targetId,
  title,
  className = "",
  showStats = false,
  initialQuery = {},
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Partial<CommentListQuery>>({
    page: 1,
    limit: 20,
    ...initialQuery,
  });

  const {
    comments,
    loading,
    error,
    pagination,
    createComment,
    updateComment,
    deleteComment,
    loadComments,
    refreshComments,
    loadMore,
    stats,
    loadStats,
  } = useComments({
    targetType,
    targetId,
    autoLoad: true,
    initialParams: filters,
  });

  // Charger les stats si demandé
  React.useEffect(() => {
    if (showStats) {
      loadStats();
    }
  }, [showStats, loadStats]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newFilters = {
      ...filters,
      search: searchQuery.trim() || undefined,
      page: 1,
    };
    setFilters(newFilters);
    loadComments(newFilters);
  };

  const handleFilterChange = (newFilters: Partial<CommentListQuery>) => {
    const updatedFilters = {
      ...filters,
      ...newFilters,
      page: 1,
    };
    setFilters(updatedFilters);
    loadComments(updatedFilters);
  };

  const clearFilters = () => {
    const defaultFilters = {
      page: 1,
      limit: 20,
      targetType,
      targetId,
    };
    setFilters(defaultFilters);
    setSearchQuery('');
    loadComments(defaultFilters);
  };

  const hasActiveFilters = searchQuery || filters.authorId || filters.startDate || filters.endDate;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {title || 'Commentaires'}
            </h2>
            {pagination && (
              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm">
                {pagination.total}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-md border transition-colors duration-200 ${
                showFilters || hasActiveFilters
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              title="Filtres"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Statistiques */}
        {showStats && stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{stats.totalComments}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.byAuthor.length}
              </div>
              <div className="text-sm text-gray-600">Contributeurs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {stats.recentActivity.slice(0, 7).reduce((sum, day) => sum + day.count, 0)}
              </div>
              <div className="text-sm text-gray-600">Cette semaine</div>
            </div>
          </div>
        )}

        {/* Barre de recherche et filtres */}
        <div className="space-y-4">
          {/* Recherche */}
          <form onSubmit={handleSearch} className="flex space-x-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher dans les commentaires..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              Rechercher
            </button>
          </form>

          {/* Filtres avancés */}
          {showFilters && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={filters.startDate || ''}
                    onChange={(e) => handleFilterChange({ startDate: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={filters.endDate || ''}
                    onChange={(e) => handleFilterChange({ endDate: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {hasActiveFilters && (
                <div className="flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Effacer les filtres
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Formulaire d'ajout de commentaire */}
      <CommentForm
        targetType={targetType}
        targetId={targetId}
        onSubmit={createComment}
      />

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
      />
    </div>
  );
};