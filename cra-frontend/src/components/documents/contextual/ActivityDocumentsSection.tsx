// src/components/documents/contextual/ActivityDocumentsSection.tsx
import React, { useState } from 'react';
import { Upload, FileText, Download, Eye, Share2, X, Search } from 'lucide-react';
import { useActivityDocuments, useDeleteDocument, useDownloadDocument } from '../../../hooks/documents/useDocuments';
import { DocumentType, DocumentResponse, formatDocumentSize, getMimeTypeIcon } from '../../../types/document.types';
import { Button } from '../../ui/Button';
import { UploadDocumentModal } from '../modals/UploadDocumentModal';
import { DocumentPreviewModal } from '../modals/DocumentPreviewModal';
import { ShareDocumentModal } from '../modals/ShareDocumentModal';
import toast from 'react-hot-toast';

interface ActivityDocumentsSectionProps {
  activityId: string;
}

const ActivityDocumentsSection: React.FC<ActivityDocumentsSectionProps> = ({ activityId }) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const { data: documents = [], isLoading, refetch } = useActivityDocuments(activityId);
  const deleteMutation = useDeleteDocument();
  const downloadMutation = useDownloadDocument();

  // Filtrer les documents
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.filename.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || doc.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handlePreview = (doc: DocumentResponse) => {
    setSelectedDocument(doc);
    setShowPreviewModal(true);
  };

  const handleShare = (doc: DocumentResponse) => {
    setSelectedDocument(doc);
    setShowShareModal(true);
  };

  const handleDownload = (doc: DocumentResponse) => {
    downloadMutation.mutate({ id: doc.id, filename: doc.filename });
  };

  const handleDelete = async (doc: DocumentResponse) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce document ?')) {
      try {
        await deleteMutation.mutateAsync(doc.id);
        refetch();
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const handleUploadSuccess = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Documents ({documents.length})
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Documents li�s � cette activit�
          </p>
        </div>
        <Button
          onClick={() => setShowUploadModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Upload className="w-4 h-4 mr-2" />
          Ajouter document
        </Button>
      </div>

      {/* Filtres */}
      <div className="mb-4 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher un document..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="all">Tous les types</option>
          {Object.values(DocumentType).map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Liste des documents */}
      {filteredDocuments.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">
            {searchTerm || selectedType !== 'all'
              ? 'Aucun document ne correspond aux filtres'
              : 'Aucun document pour cette activit�'}
          </p>
          <p className="text-sm text-gray-500">
            Cliquez sur "Ajouter document" pour commencer
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className="text-2xl">{getMimeTypeIcon(doc.mimeType)}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{doc.title}</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                    <span>{formatDocumentSize(Number(doc.size))}</span>
                    <span>"</span>
                    <span>{doc.type}</span>
                    <span>"</span>
                    <span>
                      Ajout� par {doc.owner.firstName} {doc.owner.lastName}
                    </span>
                    <span>"</span>
                    <span>{new Date(doc.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 ml-4">
                <Button
                  onClick={() => handleDownload(doc.id, doc.filename)}
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                  title="T�l�charger"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => handleDelete(doc.id)}
                  variant="outline"
                  className="border-red-600 text-red-600 hover:bg-red-50"
                  title="Supprimer"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Upload Simple */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ajouter un document</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  S�lectionner un fichier
                </label>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Le document sera automatiquement li� � cette activit�
                </p>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  onClick={() => setShowUploadModal(false)}
                  variant="outline"
                  className="border-gray-300 text-gray-700"
                >
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityDocumentsSection;
