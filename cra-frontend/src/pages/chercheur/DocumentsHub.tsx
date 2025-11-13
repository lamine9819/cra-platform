// src/pages/chercheur/DocumentsHub.tsx
// Page Hub centralisée pour la gestion de tous les documents

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  Search,
  Filter,
  Grid,
  List,
  Star,
  Trash2,
  RefreshCw,
  Download,
  Eye,
  Edit,
  Share2,
  MoreVertical,
  X,
} from 'lucide-react';
import {
  useDocuments,
  useDocumentStats,
  useDeleteDocument,
} from '../../hooks/documents/useDocuments';
import {
  useFavoriteDocuments,
  useTrashDocuments,
  useRestoreDocument,
  usePermanentDeleteDocument,
  useEmptyTrash,
  useAddToFavorites,
  useRemoveFromFavorites,
  usePreviewDocument,
} from '../../hooks/documents/useDocumentsAdvanced';
import { DocumentCard } from '../../components/documents/DocumentCard';
import { DocumentSkeleton } from '../../components/documents/shared/DocumentSkeleton';
import { EmptyDocuments } from '../../components/documents/shared/EmptyDocuments';
import { UploadDocumentModal } from '../../components/documents/modals/UploadDocumentModal';
import { DocumentPreviewModal } from '../../components/documents/modals/DocumentPreviewModal';
import { ShareDocumentModal } from '../../components/documents/modals/ShareDocumentModal';
import { EditMetadataModal } from '../../components/documents/modals/EditMetadataModal';
import { DocumentResponse } from '../../types/document.types';

type TabType = 'all' | 'favorites' | 'trash';
type ViewMode = 'grid' | 'list';

export const DocumentsHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentResponse | null>(null);

  // Queries
  const { data: documentsData, isLoading: isLoadingAll, refetch: refetchAll } = useDocuments({
    search: searchTerm,
    type: typeFilter || undefined,
  });
  const { data: favoritesData, isLoading: isLoadingFavorites, refetch: refetchFavorites } = useFavoriteDocuments();
  const { data: trashData, isLoading: isLoadingTrash, refetch: refetchTrash } = useTrashDocuments();
  const { data: stats } = useDocumentStats();

  // Mutations
  const deleteMutation = useDeleteDocument();
  const restoreMutation = useRestoreDocument();
  const permanentDeleteMutation = usePermanentDeleteDocument();
  const emptyTrashMutation = useEmptyTrash();
  const addToFavoritesMutation = useAddToFavorites();
  const removeFromFavoritesMutation = useRemoveFromFavorites();
  const previewMutation = usePreviewDocument();

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case 'favorites':
        return { data: favoritesData?.data || [], isLoading: isLoadingFavorites };
      case 'trash':
        return { data: trashData?.data || [], isLoading: isLoadingTrash };
      default:
        return { data: documentsData?.data || [], isLoading: isLoadingAll };
    }
  };

  const { data: documents, isLoading } = getCurrentData();

  // Handle URL highlight parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const highlightId = params.get('highlight');
    if (highlightId) {
      // Scroll to document
      setTimeout(() => {
        const element = document.getElementById(`doc-${highlightId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('ring-2', 'ring-blue-500');
          setTimeout(() => {
            element.classList.remove('ring-2', 'ring-blue-500');
          }, 2000);
        }
      }, 500);
    }
  }, [documents]);

  const handleView = (doc: DocumentResponse) => {
    setSelectedDocument(doc);
    setShowPreviewModal(true);
  };

  const handleDownload = async (doc: DocumentResponse) => {
    // Implémenter le téléchargement
    window.open(`/api/documents/${doc.id}/download`, '_blank');
  };

  const handleEdit = (doc: DocumentResponse) => {
    setSelectedDocument(doc);
    setShowEditModal(true);
  };

  const handleShare = (doc: DocumentResponse) => {
    setSelectedDocument(doc);
    setShowShareModal(true);
  };

  const handleDelete = async (doc: DocumentResponse) => {
    if (confirm(`Supprimer "${doc.title}" ?`)) {
      await deleteMutation.mutateAsync(doc.id);
      refetchAll();
    }
  };

  const handleRestore = async (doc: DocumentResponse) => {
    await restoreMutation.mutateAsync(doc.id);
    refetchTrash();
    refetchAll();
  };

  const handlePermanentDelete = async (doc: DocumentResponse) => {
    if (confirm(`Supprimer définitivement "${doc.title}" ? Cette action est irréversible.`)) {
      await permanentDeleteMutation.mutateAsync(doc.id);
      refetchTrash();
    }
  };

  const handleEmptyTrash = async () => {
    if (confirm('Vider la corbeille (documents > 30 jours) ? Cette action est irréversible.')) {
      await emptyTrashMutation.mutateAsync();
      refetchTrash();
    }
  };

  const handleToggleFavorite = async (doc: DocumentResponse) => {
    const userData = JSON.parse(localStorage.getItem('cra_user_data') || '{}');
    const userId = userData.id;
    const isFavorite = (doc as any).favoritedBy?.includes(userId);

    if (isFavorite) {
      await removeFromFavoritesMutation.mutateAsync(doc.id);
    } else {
      await addToFavoritesMutation.mutateAsync(doc.id);
    }
    refetchAll();
    refetchFavorites();
  };

  const tabs = [
    { id: 'all', label: 'Tous', icon: FileText, count: stats?.total || 0 },
    { id: 'favorites', label: 'Favoris', icon: Star, count: favoritesData?.data?.length || 0 },
    { id: 'trash', label: 'Corbeille', icon: Trash2, count: trashData?.data?.length || 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
              <p className="text-sm text-gray-500 mt-1">
                Gérez tous vos documents en un seul endroit
              </p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Upload className="h-4 w-4 mr-2" />
              Uploader
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`
                    flex items-center space-x-2 pb-4 border-b-2 transition-colors
                    ${activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between space-x-4">
            {/* Search */}
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher des documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Type Filter */}
            {activeTab === 'all' && (
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tous les types</option>
                <option value="RAPPORT">Rapport</option>
                <option value="FICHE_ACTIVITE">Fiche d'activité</option>
                <option value="FICHE_TECHNIQUE">Fiche technique</option>
                <option value="PUBLICATION_SCIENTIFIQUE">Publication</option>
                <option value="IMAGE">Image</option>
                <option value="PRESENTATION">Présentation</option>
                <option value="AUTRE">Autre</option>
              </select>
            )}

            {/* View Mode */}
            <div className="flex items-center space-x-2 border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* Trash Actions */}
            {activeTab === 'trash' && documents.length > 0 && (
              <button
                onClick={handleEmptyTrash}
                className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-lg text-red-700 bg-white hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Vider la corbeille
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-3'}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <DocumentSkeleton key={i} compact={viewMode === 'list'} />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <EmptyDocuments
            message={
              activeTab === 'favorites'
                ? 'Aucun document favori'
                : activeTab === 'trash'
                ? 'La corbeille est vide'
                : searchTerm
                ? 'Aucun document trouvé'
                : 'Aucun document'
            }
            showUploadButton={activeTab === 'all'}
            onUploadClick={() => setShowUploadModal(true)}
          />
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-3'}>
            {documents.map((doc) => (
              <div key={doc.id} id={`doc-${doc.id}`}>
                <DocumentCard
                  document={doc}
                  mode={activeTab === 'trash' ? 'contextual' : 'hub'}
                  compact={viewMode === 'list'}
                  showContext={activeTab !== 'trash'}
                  onView={handleView}
                  onDownload={handleDownload}
                  onEdit={activeTab !== 'trash' ? handleEdit : undefined}
                  onShare={activeTab !== 'trash' ? handleShare : undefined}
                  onDelete={activeTab !== 'trash' ? handleDelete : handlePermanentDelete}
                  onFavorite={activeTab !== 'trash' ? handleToggleFavorite : undefined}
                />
                {activeTab === 'trash' && (
                  <div className="mt-2 flex justify-end space-x-2">
                    <button
                      onClick={() => handleRestore(doc)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      <RefreshCw className="h-4 w-4 inline mr-1" />
                      Restaurer
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showUploadModal && (
        <UploadDocumentModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            refetchAll();
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

      {showShareModal && selectedDocument && (
        <ShareDocumentModal
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false);
            setSelectedDocument(null);
          }}
          document={selectedDocument}
        />
      )}

      {showEditModal && selectedDocument && (
        <EditMetadataModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedDocument(null);
          }}
          document={selectedDocument}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedDocument(null);
            refetchAll();
          }}
        />
      )}
    </div>
  );
};
