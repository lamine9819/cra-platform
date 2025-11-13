// src/components/documents/modals/LinkExistingModal.tsx
import React, { useState } from 'react';
import { X, Search, FileText, Link as LinkIcon } from 'lucide-react';
import { DocumentResponse } from '../../../types/document.types';
import { useDocuments } from '../../../hooks/documents/useDocuments';
import { useLinkDocument } from '../../../hooks/documents/useDocumentsAdvanced';
import { DocumentSkeleton } from '../shared/DocumentSkeleton';
import { EmptyDocuments } from '../shared/EmptyDocuments';
import { getFileIcon, getFileIconColor } from '../../../utils/fileHelpers';
import { formatFileSize, formatRelativeDate } from '../../../utils/documentHelpers';

interface LinkExistingModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: 'project' | 'activity' | 'task' | 'seminar' | 'training' | 'internship' | 'supervision' | 'knowledgeTransfer' | 'event';
  entityId: string;
  entityTitle: string;
  onSuccess?: () => void;
}

export const LinkExistingModal: React.FC<LinkExistingModalProps> = ({
  isOpen,
  onClose,
  entityType,
  entityId,
  entityTitle,
  onSuccess,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());

  // Récupérer tous les documents disponibles
  const { data: documentsData, isLoading } = useDocuments({ search: searchTerm });
  const linkMutation = useLinkDocument();

  if (!isOpen) return null;

  const documents = documentsData?.data || [];

  // Filtrer les documents non déjà liés à cette entité
  const availableDocuments = documents.filter((doc) => {
    const entityIdField = `${entityType}Id` as keyof DocumentResponse;
    return (doc as any)[entityIdField] !== entityId;
  });

  const handleToggleDocument = (docId: string) => {
    const newSelected = new Set(selectedDocuments);
    if (newSelected.has(docId)) {
      newSelected.delete(docId);
    } else {
      newSelected.add(docId);
    }
    setSelectedDocuments(newSelected);
  };

  const handleLinkDocuments = async () => {
    try {
      // Lier tous les documents sélectionnés
      for (const docId of Array.from(selectedDocuments)) {
        await linkMutation.mutateAsync({
          documentId: docId,
          entityType,
          entityId,
        });
      }

      onSuccess?.();
      onClose();
      setSelectedDocuments(new Set());
      setSearchTerm('');
    } catch (error) {
      console.error('Error linking documents:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Lier des documents existants
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              à {entityTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher des documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {selectedDocuments.size > 0 && (
            <div className="mt-3 text-sm text-gray-600">
              {selectedDocuments.size} document(s) sélectionné(s)
            </div>
          )}
        </div>

        {/* Documents List */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <DocumentSkeleton key={i} compact />
              ))}
            </div>
          ) : availableDocuments.length === 0 ? (
            <EmptyDocuments
              message={searchTerm ? 'Aucun document trouvé' : 'Tous les documents sont déjà liés'}
              showUploadButton={false}
            />
          ) : (
            <div className="space-y-2">
              {availableDocuments.map((doc) => {
                const Icon = getFileIcon(doc.mimeType);
                const iconColor = getFileIconColor(doc.mimeType);
                const isSelected = selectedDocuments.has(doc.id);

                return (
                  <div
                    key={doc.id}
                    onClick={() => handleToggleDocument(doc.id)}
                    className={`
                      flex items-center space-x-4 p-4 rounded-lg border-2 cursor-pointer transition-all
                      ${isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    {/* Checkbox */}
                    <div className="flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </div>

                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <Icon className={`h-8 w-8 ${iconColor}`} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {doc.title}
                      </h4>
                      <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                        <span>{formatFileSize(doc.size)}</span>
                        <span>•</span>
                        <span>{formatRelativeDate(doc.createdAt)}</span>
                        <span>•</span>
                        <span>{doc.owner.firstName} {doc.owner.lastName}</span>
                      </div>
                    </div>

                    {/* Current links indicator */}
                    {(doc.project || doc.activity || doc.task) && (
                      <div className="flex-shrink-0">
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <LinkIcon className="h-3 w-3" />
                          <span>
                            {[doc.project, doc.activity, doc.task].filter(Boolean).length} lien(s)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Annuler
          </button>
          <button
            onClick={handleLinkDocuments}
            disabled={selectedDocuments.size === 0 || linkMutation.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <LinkIcon className="h-4 w-4" />
            <span>
              {linkMutation.isPending
                ? 'Liaison en cours...'
                : `Lier ${selectedDocuments.size} document(s)`
              }
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
