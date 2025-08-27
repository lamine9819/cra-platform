// src/components/comments/CommentList.tsx
import React from 'react';
import { Loader2, MessageSquare, RefreshCw, ChevronDown } from 'lucide-react';
import { CommentItem } from './CommentItem';
import { CommentResponse, UpdateCommentRequest } from '../../types/comment.types';

interface CommentListProps {
  comments: CommentResponse[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  onUpdate: (id: string, data: UpdateCommentRequest) => Promise<CommentResponse>;
  onDelete: (id: string) => Promise<void>;
  onLoadMore?: () => Promise<void>;
  onRefresh?: () => Promise<void>;
  className?: string;
  showLoadMore?: boolean;
  emptyMessage?: string;
}

export const CommentList: React.FC<CommentListProps> = ({
  comments,
  loading,
  error,
  pagination,
  onUpdate,
  onDelete,
  onLoadMore,
  onRefresh,
  className = "",
  showLoadMore = true,
  emptyMessage = "Aucun commentaire pour le moment. Soyez le premier à commenter !",
}) => {
  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-xs">!</span>
            </div>
            <span className="text-red-800 text-sm font-medium">
              Erreur lors du chargement des commentaires
            </span>
          </div>
          
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="text-red-600 hover:text-red-700 transition-colors duration-200"
              title="Réessayer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <p className="text-red-700 text-sm mt-2">{error}</p>
      </div>
    );
  }

  if (loading && comments.length === 0) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-8 ${className}`}>
        <div className="flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-gray-600 text-sm">Chargement des commentaires...</p>
        </div>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-8 ${className}`}>
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-gray-400" />
          </div>
          
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun commentaire
            </h3>
            <p className="text-gray-600 text-sm max-w-sm">
              {emptyMessage}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* En-tête avec statistiques */}
      {pagination && (
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-900">
                {pagination.total} commentaire{pagination.total !== 1 ? 's' : ''}
              </span>
            </div>
            
            {pagination.page > 1 && (
              <div className="text-sm text-gray-500">
                Page {pagination.page} sur {pagination.totalPages}
              </div>
            )}
          </div>
          
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 rounded-full hover:bg-gray-100 disabled:cursor-not-allowed"
              title="Actualiser"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      )}

      {/* Liste des commentaires */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* Bouton "Charger plus" */}
      {showLoadMore && pagination?.hasNext && onLoadMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Chargement...
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                Charger plus de commentaires
              </>
            )}
          </button>
        </div>
      )}

      {/* Indicateur de fin */}
      {pagination && !pagination.hasNext && comments.length > 0 && (
        <div className="text-center py-4">
          <div className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
            <span>Tous les commentaires ont été chargés</span>
          </div>
        </div>
      )}
    </div>
  );
};