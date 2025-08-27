// src/components/documents/DocumentCard.tsx
import React from 'react';
import { 
  Download, 
  Share2,  
  Trash2, 
  Eye, 
  Calendar,
  User,
  Tag,
  FileText,
  Lock,
  Users
} from 'lucide-react';
import { DocumentCardProps } from '../../types/document.types';
import { getFileIconFromMime, formatFileSize } from '../../utils/documentUtils';

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onView,
  onDownload,
  onShare,
  onEdit,
  onDelete,
  showActions = true,
  compact = false
}) => {
  const fileIcon = getFileIconFromMime(document.mimeType);
  
  const canDelete = document.shares?.some(share => share.canDelete) || false;

  const handleAction = (action: string, e: React.MouseEvent) => {
    e.stopPropagation();
    switch (action) {
      case 'view':
        onView?.(document);
        break;
      case 'download':
        onDownload?.(document);
        break;
      case 'share':
        onShare?.(document);
        break;
      case 'edit':
        onEdit?.(document);
        break;
      case 'delete':
        onDelete?.(document);
        break;
    }
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border hover:shadow-md transition-shadow">
        <div className="text-2xl">{fileIcon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{document.title}</p>
          <p className="text-xs text-gray-500">{formatFileSize(document.size)}</p>
        </div>
        {showActions && (
          <div className="flex space-x-1">
            <button
              onClick={(e) => handleAction('download', e)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="Télécharger"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => handleAction('view', e)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Voir les détails"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      {/* Header avec icône et titre */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start space-x-3">
          <div className="text-3xl">{fileIcon}</div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate" title={document.title}>
              {document.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1 truncate">{document.filename}</p>
            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center">
                <User className="h-3 w-3 mr-1" />
                {document.owner.firstName} {document.owner.lastName}
              </span>
              <span className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {new Date(document.createdAt).toLocaleDateString('fr-FR')}
              </span>
              <span>{formatFileSize(document.size)}</span>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-1">
            {document.isPublic ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <Users className="h-3 w-3 mr-1" />
                Public
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                <Lock className="h-3 w-3 mr-1" />
                Privé
              </span>
            )}
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {document.type.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-4">
        {document.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {document.description}
          </p>
        )}

        {/* Tags */}
        {document.tags && document.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {document.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Contexte (projet, activité, tâche) */}
        <div className="space-y-1 text-xs text-gray-500 mb-3">
          {document.project && (
            <div className="flex items-center">
              <FileText className="h-3 w-3 mr-1" />
              <span>Projet: {document.project.title}</span>
            </div>
          )}
          {document.activity && (
            <div className="flex items-center">
              <FileText className="h-3 w-3 mr-1" />
              <span>Activité: {document.activity.title}</span>
            </div>
          )}
          {document.task && (
            <div className="flex items-center">
              <FileText className="h-3 w-3 mr-1" />
              <span>Tâche: {document.task.title}</span>
            </div>
          )}
        </div>

        {/* Partages */}
        {document.shares && document.shares.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1">
              Partagé avec {document.shares.length} personne(s)
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="px-4 py-3 bg-gray-50 rounded-b-lg border-t border-gray-100">
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <button
                onClick={(e) => handleAction('view', e)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Eye className="h-3 w-3 mr-1" />
                Voir
              </button>
              <button
                onClick={(e) => handleAction('download', e)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Download className="h-3 w-3 mr-1" />
                Télécharger
              </button>
              <button
                onClick={(e) => handleAction('share', e)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Share2 className="h-3 w-3 mr-1" />
                Partager
              </button>
            </div>
            <div className="flex space-x-2">

              {canDelete && (
                <button
                  onClick={(e) => handleAction('delete', e)}
                  className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Supprimer
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};