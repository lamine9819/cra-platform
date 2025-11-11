// src/components/documents/modals/DocumentPreviewModal.tsx
import React from 'react';
import { X, Download, Share2, Eye, FileText, AlertCircle } from 'lucide-react';
import { DocumentResponse, formatDocumentSize, getMimeTypeIcon } from '../../../types/document.types';
import { Button } from '../../ui/Button';
import { documentService } from '../../../services/api/documentService';

interface DocumentPreviewModalProps {
  document: DocumentResponse;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: () => void;
  onShare?: () => void;
}

const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document,
  isOpen,
  onClose,
  onDownload,
  onShare,
}) => {
  if (!isOpen) return null;

  const previewUrl = documentService.getPreviewUrl(document.id);
  const isImage = document.mimeType.startsWith('image/');
  const isPDF = document.mimeType === 'application/pdf';
  const canPreview = isImage || isPDF;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="text-2xl">{getMimeTypeIcon(document.mimeType)}</div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 truncate">
                {document.title}
              </h2>
              <p className="text-sm text-gray-600">
                {document.filename} " {formatDocumentSize(Number(document.size))}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            {onDownload && (
              <Button
                onClick={onDownload}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                <Download className="w-4 h-4 mr-2" />
                T�l�charger
              </Button>
            )}
            {onShare && (
              <Button
                onClick={onShare}
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Partager
              </Button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Preview Area */}
          <div className="flex-1 bg-gray-100 flex items-center justify-center p-4 overflow-auto">
            {isImage ? (
              <img
                src={previewUrl}
                alt={document.title}
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              />
            ) : isPDF ? (
              <iframe
                src={previewUrl}
                title={document.title}
                className="w-full h-full rounded-lg shadow-lg bg-white"
                style={{ minHeight: '600px' }}
              />
            ) : (
              <div className="text-center py-12">
                <FileText className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aper�u non disponible
                </h3>
                <p className="text-gray-600 mb-4">
                  Ce type de fichier ne peut pas �tre pr�visualis� dans le navigateur
                </p>
                <Button
                  onClick={onDownload}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  T�l�charger pour voir
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar - M�tadonn�es */}
          <div className="w-80 border-l border-gray-200 bg-white overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Informations */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Informations
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <label className="block text-gray-600 mb-1">Type</label>
                    <span className="px-2 py-1 bg-gray-100 rounded text-gray-900">
                      {document.type}
                    </span>
                  </div>

                  <div>
                    <label className="block text-gray-600 mb-1">Taille</label>
                    <p className="text-gray-900">
                      {formatDocumentSize(Number(document.size))}
                    </p>
                  </div>

                  <div>
                    <label className="block text-gray-600 mb-1">Format</label>
                    <p className="text-gray-900">{document.mimeType}</p>
                  </div>

                  <div>
                    <label className="block text-gray-600 mb-1">Ajout� le</label>
                    <p className="text-gray-900">
                      {new Date(document.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  <div>
                    <label className="block text-gray-600 mb-1">Propri�taire</label>
                    <p className="text-gray-900">
                      {document.owner.firstName} {document.owner.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{document.owner.email}</p>
                  </div>

                  {document.isPublic && (
                    <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
                      <Eye className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-700">Document public</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {document.description && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    Description
                  </h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {document.description}
                  </p>
                </div>
              )}

              {/* Tags */}
              {document.tags && document.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {document.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contexte */}
              {(document.activity || document.project || document.task) && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    Li� �
                  </h3>
                  <div className="space-y-2">
                    {document.activity && (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <FileText className="w-4 h-4 text-gray-600" />
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">Activit�</p>
                          <p className="text-gray-600">{document.activity.title}</p>
                        </div>
                      </div>
                    )}
                    {document.project && (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <FileText className="w-4 h-4 text-gray-600" />
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">Projet</p>
                          <p className="text-gray-600">{document.project.title}</p>
                        </div>
                      </div>
                    )}
                    {document.task && (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <FileText className="w-4 h-4 text-gray-600" />
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">T�che</p>
                          <p className="text-gray-600">{document.task.title}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Partages */}
              {document.shares && document.shares.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    Partag� avec ({document.shares.length})
                  </h3>
                  <div className="space-y-2">
                    {document.shares.map((share) => (
                      <div
                        key={share.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">
                            {share.sharedWith.firstName} {share.sharedWith.lastName}
                          </p>
                          <p className="text-xs text-gray-600">
                            {share.canEdit && 'Peut �diter'} {share.canDelete && '" Peut supprimer'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { DocumentPreviewModal };
