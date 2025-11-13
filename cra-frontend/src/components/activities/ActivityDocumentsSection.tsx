// src/components/activities/ActivityDocumentsSection.tsx
import React, { useState } from 'react';
import { 
  FileText, 
  
  Plus, 
  Search, 
  
  Grid,
  List,
  FolderOpen
} from 'lucide-react';
import { useActivityDocuments } from '../../contexts/DocumentContext';
import { DocumentCard } from '../documents/DocumentCard';
import { DocumentUpload } from '../documents/DocumentUpload';
import { DocumentShareModal } from '../documents/DocumentShare';
import { DocumentResponse} from '../../types/document.types';
import { toast } from 'react-hot-toast';

interface ActivityDocumentsSectionProps {
  activityId: string;
  activityTitle: string;
  projectId?: string;
  projectTitle?: string;
  canAddDocuments?: boolean;
}

export const ActivityDocumentsSection: React.FC<ActivityDocumentsSectionProps> = ({
  activityId,
  activityTitle,
  projectId,
  projectTitle,
  canAddDocuments = true
}) => {
  const { documents, loading, error, refetch } = useActivityDocuments(activityId);
  const [showUpload, setShowUpload] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<DocumentResponse | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  // Filtrer les documents localement
  const filteredDocuments = documents.filter(doc => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        doc.title.toLowerCase().includes(search) ||
        doc.description?.toLowerCase().includes(search) ||
        doc.filename.toLowerCase().includes(search) ||
        doc.tags.some(tag => tag.toLowerCase().includes(search))
      );
    }
    return true;
  });

  const handleDocumentAction = async (action: string, document: DocumentResponse) => {
    switch (action) {
      case 'download':
        try {
          const { default: DocumentService } = await import('../../services/documentService');
          await DocumentService.downloadDocument(document.id, document.filename);
        } catch {
          toast.error('Erreur lors du téléchargement');
        }
        break;
        
      case 'share':
        setSelectedDocument(document);
        setShowShareModal(true);
        break;
        
      case 'delete':
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
          try {
            const { default: DocumentService } = await import('../../services/documentService');
            await DocumentService.deleteDocument(document.id);
            toast.success('Document supprimé');
            refetch();
          } catch (error: unknown) {
            const errorMessage = error instanceof Error && 'response' in error 
              ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
              : 'Erreur lors de la suppression';
            toast.error(errorMessage || 'Erreur lors de la suppression');
          }
        }
        break;

      case 'unlink':
        if (window.confirm('Êtes-vous sûr de vouloir délier ce document de l\'activité ?')) {
          try {
            const { default: DocumentService } = await import('../../services/documentService');
            await DocumentService.unlinkDocument(document.id);
            toast.success('Document délié de l\'activité');
            refetch();
          } catch (error: unknown) {
            const errorMessage = error instanceof Error && 'response' in error 
              ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
              : 'Erreur lors du déliage';
            toast.error(errorMessage || 'Erreur lors du déliage');
          }
        }
        break;
    }
  };

  const handleShare = async (shareData: { userIds: string[]; canEdit?: boolean; canDelete?: boolean }) => {
    if (!selectedDocument) return;

    try {
      const { default: DocumentService } = await import('../../services/documentService');
      await DocumentService.shareDocument(selectedDocument.id, shareData);
      toast.success('Document partagé avec succès');
      refetch();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Erreur lors du partage';
      toast.error(errorMessage || 'Erreur lors du partage');
    }
  };

  const handleUploadSuccess = () => {
    setShowUpload(false);
    refetch();
    toast.success('Document ajouté à l\'activité');
  };

  return (
    <div className="space-y-6">
      {/* Header avec contexte */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Documents de l'activité
          </h3>
          <div className="flex items-center text-sm text-gray-600 mt-1 space-x-2">
            <span>{documents.length} document{documents.length > 1 ? 's' : ''} dans {activityTitle}</span>
            {projectTitle && (
              <>
                <span>•</span>
                <div className="flex items-center">
                  <FolderOpen className="h-4 w-4 mr-1" />
                  <span>Projet : {projectTitle}</span>
                </div>
              </>
            )}
          </div>
        </div>
        
        {canAddDocuments && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter des documents
            </button>
          </div>
        )}
      </div>

      {/* Zone d'upload (conditionnelle) */}
      {showUpload && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-medium text-gray-900">Ajouter des documents à l'activité</h4>
              <p className="text-sm text-gray-600 mt-1">
                Les documents seront automatiquement liés à cette activité
                {projectTitle && ` et au projet "${projectTitle}"`}
              </p>
            </div>
            <button
              onClick={() => setShowUpload(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          <DocumentUpload
            multiple={true}
            activityId={activityId}
            projectId={projectId} // Maintenir la cohérence avec le projet
            autoLink={true}
            onUploadSuccess={handleUploadSuccess}
            onUploadError={(error) => toast.error(error)}
          />
        </div>
      )}

      {/* Barre de recherche et contrôles */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        {/* Recherche */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher dans les documents..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Mode d'affichage */}
        <div className="flex items-center space-x-2">
          <div className="flex border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 text-sm font-medium ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              } rounded-l-lg`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 text-sm font-medium ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              } rounded-r-lg border-l border-gray-300`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Liste des documents */}
      <div className="bg-white rounded-lg border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Chargement des documents...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <FileText className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => refetch()}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Réessayer
              </button>
            </div>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {documents.length === 0 ? 'Aucun document' : 'Aucun résultat'}
            </h3>
            <p className="text-gray-600 mb-4">
              {documents.length === 0 
                ? 'Cette activité ne contient pas encore de documents.'
                : 'Aucun document ne correspond à votre recherche.'
              }
            </p>
            {documents.length === 0 && canAddDocuments && !showUpload && (
              <button
                onClick={() => setShowUpload(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter le premier document
              </button>
            )}
          </div>
        ) : (
          <div className="p-6">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDocuments.map((document) => (
                  <DocumentCard
                    key={document.id}
                    document={document}
                    onDownload={(doc) => handleDocumentAction('download', doc)}
                    onShare={(doc) => handleDocumentAction('share', doc)}
                    onDelete={(doc) => handleDocumentAction('delete', doc)}
                    onUnlink={(doc) => handleDocumentAction('unlink', doc)}
                    showActions={true}
                    showContext={false} // Pas besoin d'afficher le contexte dans la page de l'activité
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDocuments.map((document) => (
                  <DocumentCard
                    key={document.id}
                    document={document}
                    onDownload={(doc) => handleDocumentAction('download', doc)}
                    onShare={(doc) => handleDocumentAction('share', doc)}
                    onDelete={(doc) => handleDocumentAction('delete', doc)}
                    onUnlink={(doc) => handleDocumentAction('unlink', doc)}
                    showActions={true}
                    compact={true}
                    showContext={false}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de partage */}
      {selectedDocument && (
        <DocumentShareModal
          document={selectedDocument}
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false);
            setSelectedDocument(null);
          }}
          onShare={handleShare}
        />
      )}
    </div>
  );
};