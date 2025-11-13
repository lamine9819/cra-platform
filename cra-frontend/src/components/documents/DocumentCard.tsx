// src/components/documents/DocumentCard.tsx
import React from 'react';
import {
  FileText,
  Download,
  Share2,
  Edit,
  Trash2,
  Link as LinkIcon,
  Unlink,
  Eye,
  Star,
  MoreVertical,
  ExternalLink,
  Calendar,
  User,
  Tag,
  Lock,
  Users
} from 'lucide-react';
import { DocumentResponse } from '../../types/document.types';
import { getPermissions, formatDate, formatRelativeDate, isRecent, getDocumentContext } from '../../utils/documentHelpers';
import { formatFileSize, getFileIcon, getFileIconColor } from '../../utils/fileHelpers';

interface DocumentCardProps {
  document: DocumentResponse;
  mode?: 'hub' | 'contextual';
  compact?: boolean;
  showContext?: boolean;
  onView?: (document: DocumentResponse) => void;
  onDownload?: (document: DocumentResponse) => void;
  onEdit?: (document: DocumentResponse) => void;
  onShare?: (document: DocumentResponse) => void;
  onDelete?: (document: DocumentResponse) => void;
  onLink?: (document: DocumentResponse) => void;
  onUnlink?: (document: DocumentResponse) => void;
  onFavorite?: (document: DocumentResponse) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  mode = 'hub',
  compact = false,
  showContext = true,
  onView,
  onDownload,
  onEdit,
  onShare,
  onDelete,
  onLink,
  onUnlink,
  onFavorite
}) => {

  // Récupérer l'utilisateur connecté
  const userData = JSON.parse(localStorage.getItem('cra_user_data') || '{}');
  const userId = userData.id;
  const userRole = userData.role;

  // Calculer les permissions
  const permissions = getPermissions(document, userId, userRole);

  // Récupérer le contexte
  const context = getDocumentContext(document);

  // Récupérer l'icône
  const IconComponent = getFileIcon(document.mimeType);
  const iconColor = getFileIconColor(document.mimeType);

  const handleAction = (action: string, e?: React.MouseEvent) => {
    e?.stopPropagation();

    switch (action) {
      case 'view':
        onView?.(document);
        break;
      case 'download':
        onDownload?.(document);
        break;
      case 'edit':
        onEdit?.(document);
        break;
      case 'share':
        onShare?.(document);
        break;
      case 'delete':
        onDelete?.(document);
        break;
      case 'link':
        onLink?.(document);
        break;
      case 'unlink':
        onUnlink?.(document);
        break;
      case 'favorite':
        onFavorite?.(document);
        break;
      case 'hub':
        window.location.href = `/chercheur/documents?highlight=${document.id}`;
        break;
    }
  };

  // Version compacte (liste)
  if (compact) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center space-x-4">
          {/* Icône */}
          <div className="flex-shrink-0">
            <IconComponent className={`h-10 w-10 ${iconColor}`} />
          </div>

          {/* Infos */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {document.title}
              </h3>
              {isRecent(document) && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  Nouveau
                </span>
              )}
              {document.isPublic && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  Public
                </span>
              )}
            </div>

            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span className="flex items-center">
                <User className="h-3 w-3 mr-1" />
                {document.owner.firstName} {document.owner.lastName}
              </span>
              <span>{formatFileSize(document.size)}</span>
              <span>{formatRelativeDate(document.createdAt)}</span>
              {showContext && context.type && (
                <span className="flex items-center text-blue-600">
                  <LinkIcon className="h-3 w-3 mr-1" />
                  {context.title}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleAction('view')}
              className="p-2 text-gray-400 hover:text-blue-600 rounded-md hover:bg-gray-100"
              title="Voir"
            >
              <Eye className="h-4 w-4" />
            </button>

            <button
              onClick={() => handleAction('download')}
              className="p-2 text-gray-400 hover:text-green-600 rounded-md hover:bg-gray-100"
              title="Télécharger"
            >
              <Download className="h-4 w-4" />
            </button>

            {mode === 'hub' && permissions.canEdit && onEdit && (
              <button
                onClick={() => handleAction('edit')}
                className="p-2 text-gray-400 hover:text-purple-600 rounded-md hover:bg-gray-100"
                title="Éditer"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}

            {mode === 'contextual' && permissions.canUnlink && onUnlink && (
              <button
                onClick={() => handleAction('unlink')}
                className="p-2 text-gray-400 hover:text-orange-600 rounded-md hover:bg-gray-100"
                title="Délier"
              >
                <Unlink className="h-4 w-4" />
              </button>
            )}

            {onFavorite && (
              <button
                onClick={() => handleAction('favorite')}
                className="p-2 text-gray-400 hover:text-yellow-600 rounded-md hover:bg-gray-100"
                title="Ajouter aux favoris"
              >
                <Star className="h-4 w-4" />
              </button>
            )}

            {mode === 'hub' && permissions.canDelete && onDelete && (
              <button
                onClick={() => handleAction('delete')}
                className="p-2 text-gray-400 hover:text-red-600 rounded-md hover:bg-gray-100"
                title="Supprimer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}

            {mode === 'contextual' && (
              <button
                onClick={() => handleAction('hub')}
                className="p-2 text-gray-400 hover:text-blue-600 rounded-md hover:bg-gray-100"
                title="Voir dans le hub"
              >
                <ExternalLink className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Version carte (grille)
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow relative">
      {/* Badge nouveau */}
      {isRecent(document) && (
        <div className="absolute top-2 right-2">
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
            Nouveau
          </span>
        </div>
      )}

      {/* Header avec icône */}
      <div className="flex items-start space-x-4 mb-4">
        <div className="flex-shrink-0">
          <IconComponent className={`h-12 w-12 ${iconColor}`} />
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className="text-lg font-medium text-gray-900 mb-1 truncate cursor-pointer hover:text-blue-600"
            onClick={() => handleAction('view')}
            title={document.title}
          >
            {document.title}
          </h3>

          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>{formatFileSize(document.size)}</span>
            <span>•</span>
            <span>{document.type}</span>
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
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleAction('view')}
              className="p-2 text-gray-400 hover:text-blue-600 rounded-md hover:bg-gray-100"
              title="Voir"
            >
              <Eye className="h-4 w-4" />
            </button>

            <button
              onClick={() => handleAction('download')}
              className="p-2 text-gray-400 hover:text-green-600 rounded-md hover:bg-gray-100"
              title="Télécharger"
            >
              <Download className="h-4 w-4" />
            </button>

            {mode === 'hub' && permissions.canEdit && onEdit && (
              <button
                onClick={() => handleAction('edit')}
                className="p-2 text-gray-400 hover:text-purple-600 rounded-md hover:bg-gray-100"
                title="Éditer"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}

            {mode === 'hub' && permissions.canShare && onShare && (
              <button
                onClick={() => handleAction('share')}
                className="p-2 text-gray-400 hover:text-indigo-600 rounded-md hover:bg-gray-100"
                title="Partager"
              >
                <Share2 className="h-4 w-4" />
              </button>
            )}

            {mode === 'contextual' && permissions.canUnlink && onUnlink && (
              <button
                onClick={() => handleAction('unlink')}
                className="p-2 text-gray-400 hover:text-orange-600 rounded-md hover:bg-gray-100"
                title="Délier"
              >
                <Unlink className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {onFavorite && (
              <button
                onClick={() => handleAction('favorite')}
                className="p-2 text-gray-400 hover:text-yellow-600 rounded-md hover:bg-gray-100"
                title="Ajouter aux favoris"
              >
                <Star className="h-4 w-4" />
              </button>
            )}

            {mode === 'hub' && permissions.canDelete && onDelete && (
              <button
                onClick={() => handleAction('delete')}
                className="p-2 text-gray-400 hover:text-red-600 rounded-md hover:bg-gray-100"
                title="Supprimer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}

            {mode === 'contextual' && (
              <button
                onClick={() => handleAction('hub')}
                className="p-2 text-gray-400 hover:text-blue-600 rounded-md hover:bg-gray-100"
                title="Voir dans le hub"
              >
                <ExternalLink className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};