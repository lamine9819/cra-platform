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
  showActions?: boolean;
  onView?: (document: DocumentResponse) => void;
  onDownload?: (document: DocumentResponse) => void;
  onEdit?: (document: DocumentResponse) => void;
  onShare?: (document: DocumentResponse) => void;
  onDelete?: (document: DocumentResponse) => void;
  onLink?: (document: DocumentResponse) => void;
  onUnlink?: (document: DocumentResponse) => void;
  onFavorite?: (document: DocumentResponse) => void;
  onManageLinks?: (document: DocumentResponse) => void; // Nouveau: pour ouvrir le modal de gestion des liaisons
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
  onFavorite,
  onManageLinks
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
      case 'manageLinks':
        onManageLinks?.(document);
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

  // Version carte (grille) - Simplifiée
  return (
    <div className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow relative overflow-hidden group flex flex-col h-full">
      {/* Badge nouveau */}
      {isRecent(document) && (
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 shadow-sm">
            Nouveau
          </span>
        </div>
      )}

      {/* Contenu cliquable */}
      <div
        className="p-6 cursor-pointer flex-1 flex flex-col"
        onClick={() => handleAction('view')}
      >
        {/* Icône et titre */}
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <IconComponent className={`h-16 w-16 ${iconColor}`} />
          </div>

          <div className="flex-1 min-w-0 pr-12">
            <h3
              className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug"
              title={document.title}
            >
              {document.title}
            </h3>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
                {document.type}
              </span>
              {document.isPublic && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200 whitespace-nowrap">
                  Public
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions - Toujours visibles en bas */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction('view');
              }}
              className="p-2 text-gray-500 hover:text-blue-600 rounded-md hover:bg-white transition-colors"
              title="Prévisualiser"
            >
              <Eye className="h-5 w-5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction('download');
              }}
              className="p-2 text-gray-500 hover:text-green-600 rounded-md hover:bg-white transition-colors"
              title="Télécharger"
            >
              <Download className="h-5 w-5" />
            </button>

            {mode === 'hub' && permissions.canEdit && onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction('edit');
                }}
                className="p-2 text-gray-500 hover:text-purple-600 rounded-md hover:bg-white transition-colors"
                title="Éditer"
              >
                <Edit className="h-5 w-5" />
              </button>
            )}

            {mode === 'hub' && permissions.canShare && onShare && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction('share');
                }}
                className="p-2 text-gray-500 hover:text-indigo-600 rounded-md hover:bg-white transition-colors"
                title="Partager"
              >
                <Share2 className="h-5 w-5" />
              </button>
            )}

            {mode === 'hub' && onManageLinks && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction('manageLinks');
                }}
                className="p-2 text-gray-500 hover:text-blue-600 rounded-md hover:bg-white transition-colors"
                title="Gérer les liaisons"
              >
                <LinkIcon className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-1">
            {onFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction('favorite');
                }}
                className="p-2 text-gray-500 hover:text-yellow-600 rounded-md hover:bg-white transition-colors"
                title="Favoris"
              >
                <Star className="h-5 w-5" />
              </button>
            )}

            {mode === 'hub' && permissions.canDelete && onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction('delete');
                }}
                className="p-2 text-gray-500 hover:text-red-600 rounded-md hover:bg-white transition-colors"
                title="Supprimer"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}

            {mode === 'contextual' && permissions.canUnlink && onUnlink && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction('unlink');
                }}
                className="p-2 text-gray-500 hover:text-orange-600 rounded-md hover:bg-white transition-colors"
                title="Délier"
              >
                <Unlink className="h-5 w-5" />
              </button>
            )}

            {mode === 'contextual' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction('hub');
                }}
                className="p-2 text-gray-500 hover:text-blue-600 rounded-md hover:bg-white transition-colors"
                title="Voir dans le hub"
              >
                <ExternalLink className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};