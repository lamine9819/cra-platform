// src/components/documents/contextual/ContextualDocumentsSection.tsx
// Composant générique pour afficher les documents liés à une entité (Activity/Project/Task)

import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Upload,
  Link as LinkIcon,
  Eye,
  Download,
  Unlink,
  ExternalLink,
  Star,
  Heart,
} from 'lucide-react';
import { DocumentResponse } from '../../../types/document.types';
import {
  useActivityDocuments,
  useProjectDocuments,
  useTaskDocuments,
} from '../../../hooks/documents/useDocuments';
import {
  useUnlinkDocument,
  useAddToFavorites,
  useRemoveFromFavorites,
  usePreviewDocument,
} from '../../../hooks/documents/useDocumentsAdvanced';
import { useDownloadDocument } from '../../../hooks/documents/useDocuments';
import { DocumentCard } from '../DocumentCard';
import { DocumentSkeleton } from '../shared/DocumentSkeleton';
import { EmptyDocuments } from '../shared/EmptyDocuments';
import { UploadDocumentModal } from '../modals/UploadDocumentModal';
import { LinkExistingModal } from '../modals/LinkExistingModal';
import { DocumentPreviewModal } from '../modals/DocumentPreviewModal';

interface ContextualDocumentsSectionProps {
  entityType: 'activity' | 'project' | 'task';
  entityId: string;
  entityTitle: string;
  canEdit?: boolean;
}

export const ContextualDocumentsSection: React.FC<ContextualDocumentsSectionProps> = ({
  entityType,
  entityId,
  entityTitle,
  canEdit = true,
}) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'link'>('upload');

  // Utiliser le hook approprié selon le type d'entité
  const { data: documents, isLoading, refetch } =
    entityType === 'activity'
      ? useActivityDocuments(entityId)
      : entityType === 'project'
      ? useProjectDocuments(entityId)
      : useTaskDocuments(entityId);

  const unlinkMutation = useUnlinkDocument();
  const downloadMutation = useDownloadDocument();
  const previewMutation = usePreviewDocument();
  const addToFavoritesMutation = useAddToFavorites();
  const removeFromFavoritesMutation = useRemoveFromFavorites();

  const handleView = (document: DocumentResponse) => {
    setSelectedDocument(document);
    setShowPreviewModal(true);
  };

  const handleDownload = async (document: DocumentResponse) => {
    await downloadMutation.mutateAsync({
      id: document.id,
      filename: document.filename,
    });
  };

  const handleUnlink = async (document: DocumentResponse) => {
    if (confirm(`Délier "${document.title}" de ${entityTitle} ?`)) {
      await unlinkMutation.mutateAsync({
        documentId: document.id,
        entityType,
        entityId,
      });
      refetch();
    }
  };

  const handleGoToHub = (document: DocumentResponse) => {
    window.location.href = `/chercheur/documents?highlight=${document.id}`;
  };

  const handleToggleFavorite = async (document: DocumentResponse) => {
    const userData = JSON.parse(localStorage.getItem('cra_user_data') || '{}');
    const userId = userData.id;

    // Vérifier si déjà en favoris
    const isFavorite = (document as any).favoritedBy?.includes(userId);

    if (isFavorite) {
      await removeFromFavoritesMutation.mutateAsync(document.id);
    } else {
      await addToFavoritesMutation.mutateAsync(document.id);
    }
    refetch();
  };

  const handlePreview = async (document: DocumentResponse) => {
    await previewMutation.mutateAsync(document.id);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <FileText className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Documents
            </h3>
            <p className="text-sm text-gray-500">
              {documents?.length || 0} document(s) lié(s)
            </p>
          </div>
        </div>

        {canEdit && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setActiveTab('upload');
                setShowUploadModal(true);
              }}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Upload className="h-4 w-4 mr-2" />
              Uploader
            </button>
            <button
              onClick={() => setShowLinkModal(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              Lier existant
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <DocumentSkeleton key={i} compact />
            ))}
          </div>
        ) : !documents || documents.length === 0 ? (
          <EmptyDocuments
            message="Aucun document lié"
            showUploadButton={canEdit}
            onUploadClick={() => setShowUploadModal(true)}
          />
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                mode="contextual"
                compact
                showContext={false}
                onView={handleView}
                onDownload={handleDownload}
                onUnlink={canEdit ? handleUnlink : undefined}
                onFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showUploadModal && (
        <UploadDocumentModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          defaultEntityType={entityType}
          defaultEntityId={entityId}
          onSuccess={() => {
            setShowUploadModal(false);
            refetch();
          }}
        />
      )}

      {showLinkModal && (
        <LinkExistingModal
          isOpen={showLinkModal}
          onClose={() => setShowLinkModal(false)}
          entityType={entityType}
          entityId={entityId}
          entityTitle={entityTitle}
          onSuccess={() => {
            setShowLinkModal(false);
            refetch();
          }}
        />
      )}

      {showPreviewModal && selectedDocument && (
        <DocumentPreviewModal
          isOpen={showPreviewModal}
          onClose={() => {
            setShowPreviewModal(false);
            setSelectedDocument(null);
          }}
          document={selectedDocument}
        />
      )}
    </div>
  );
};
