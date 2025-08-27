// src/pages/chercheur/DocumentsList.tsx - VERSION COMPLÈTE AVEC HOOKS
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Plus,
  FileText,
  Download,
  Share2,
  Eye,
  SortAsc,
  SortDesc,
  X
} from 'lucide-react';
import { useDocumentsLocal } from '../../hooks/useDocumentsLocal';
import { DocumentCard } from '../../components/documents/DocumentCard';
import { DocumentUpload } from '../../components/documents/DocumentUpload';
import { DocumentShareModal } from '../../components/documents/DocumentShare';
import { DocumentLinkModal } from '../../components/documents/DocumentLinkModal';
import { DocumentResponse, DocumentListQuery, DOCUMENT_TYPES } from '../../types/document.types';
import { toast } from 'react-hot-toast';

const DocumentsList: React.FC = () => {
  const navigate = useNavigate();
  
  // Hook principal pour la gestion des documents
  const {
    documents,
    loading,
    error,
    pagination,
    fetchDocuments,
    deleteDocument,
    shareDocument,
    linkToProject,
    linkToActivity,
    unlinkDocument,
    downloadDocument
  } = useDocumentsLocal({ page: 1, limit: 12 });

  // États locaux pour l'interface
  const [showUpload, setShowUpload] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<DocumentResponse | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // États pour les filtres
  const [filters, setFilters] = useState<DocumentListQuery>({
    page: 1,
    limit: 12
  });
  
  // États pour le tri
  const [sortBy, setSortBy] = useState<'title' | 'createdAt' | 'size'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Charger les documents quand les filtres changent
  useEffect(() => {
    fetchDocuments(filters);
  }, [filters, fetchDocuments]);

  // Gérer la recherche
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({
      ...prev,
      search: searchTerm || undefined,
      page: 1
    }));
  };

  // Gérer les filtres
  const handleFilterChange = (key: keyof DocumentListQuery, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
      page: 1
    }));
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({ page: 1, limit: 12 });
    setSearchTerm('');
  };

  // Gérer le tri
  const handleSort = (field: 'title' | 'createdAt' | 'size') => {
    const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(field);
    setSortOrder(newOrder);
    
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: newOrder,
      page: 1
    }));
  };

  // Gérer la pagination
  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  // Actions sur les documents
  const handleDocumentAction = async (action: string, document: DocumentResponse) => {
    switch (action) {
      case 'view':
        navigate(`/chercheur/documents/${document.id}`);
        break;
        
      case 'download':
        try {
          await downloadDocument(document.id, document.filename);
        } catch (error) {
          // Erreur déjà gérée par le hook
        }
        break;
        
      case 'share':
        setSelectedDocument(document);
        setShowShareModal(true);
        break;

      case 'link':
        setSelectedDocument(document);
        setShowLinkModal(true);
        break;
        
      case 'delete':
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
          try {
            await deleteDocument(document.id);
          } catch (error) {
            // Erreur déjà gérée par le hook
          }
        }
        break;
    }
  };

  // Gérer l'upload
  const handleUploadSuccess = () => {
    setShowUpload(false);
    fetchDocuments(filters);
  };

  // Gérer le partage
  const handleShare = async (shareData: any) => {
    if (!selectedDocument) return;
    
    try {
      await shareDocument(selectedDocument.id, shareData);
      setShowShareModal(false);
      setSelectedDocument(null);
    } catch (error) {
      // Erreur déjà gérée par le hook
    }
  };

  // Gérer la liaison
  const handleLink = async (context: any) => {
    if (!selectedDocument) return;
    
    try {
      if (context.type === 'project') {
        await linkToProject(selectedDocument.id, context.id);
      } else if (context.type === 'activity') {
        await linkToActivity(selectedDocument.id, context.id);
      }
      
      setShowLinkModal(false);
      setSelectedDocument(null);
    } catch (error) {
      // Erreur déjà gérée par le hook
    }
  };

  // Gérer le déliage
  const handleUnlink = async () => {
    if (!selectedDocument) return;
    
    try {
      await unlinkDocument(selectedDocument.id);
      setShowLinkModal(false);
      setSelectedDocument(null);
    } catch (error) {
      // Erreur déjà gérée par le hook
    }
  };

  // Filtrage local pour la recherche instantanée
  const filteredDocuments = documents.filter(doc => {
    if (searchTerm && !filters.search) {
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

  // Calculer les statistiques
  const stats = {
    total: documents.length,
    byType: documents.reduce((acc, doc) => {
      acc[doc.type] = (acc[doc.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    owned: documents.filter(d => d.owner.id === JSON.parse(localStorage.getItem('cra_user_data') || '{}').id).length,
    shared: documents.filter(d => d.shares && d.shares.length > 0).length,
    public: documents.filter(d => d.isPublic).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Documents</h1>
          <p className="text-gray-600 mt-1">Gérez vos documents de recherche</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Upload className="h-4 w-4 mr-2" />
            Uploader des documents
          </button>
        </div>
      </div>

      {/* Zone d'upload (conditionnelle) */}
      {showUpload && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Uploader des documents</h3>
            <button
              onClick={() => setShowUpload(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <DocumentUpload
            multiple={true}
            onUploadSuccess={handleUploadSuccess}
            onUploadError={(error) => toast.error(error)}
          />
        </div>
      )}

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Recherche */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher des documents..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </form>

          {/* Contrôles */}
          <div className="flex items-center space-x-4">
            {/* Bouton filtres */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                showFilters ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtres
            </button>

            {/* Tri */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleSort('createdAt')}
                className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md ${
                  sortBy === 'createdAt' ? 'bg-blue-50 text-blue-700 border-blue-300' : 'text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                Date
                {sortBy === 'createdAt' && (
                  sortOrder === 'asc' ? <SortAsc className="h-4 w-4 ml-1" /> : <SortDesc className="h-4 w-4 ml-1" />
                )}
              </button>
              <button
                onClick={() => handleSort('title')}
                className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md ${
                  sortBy === 'title' ? 'bg-blue-50 text-blue-700 border-blue-300' : 'text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                Nom
                {sortBy === 'title' && (
                  sortOrder === 'asc' ? <SortAsc className="h-4 w-4 ml-1" /> : <SortDesc className="h-4 w-4 ml-1" />
                )}
              </button>
              <button
                onClick={() => handleSort('size')}
                className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md ${
                  sortBy === 'size' ? 'bg-blue-50 text-blue-700 border-blue-300' : 'text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                Taille
                {sortBy === 'size' && (
                  sortOrder === 'asc' ? <SortAsc className="h-4 w-4 ml-1" /> : <SortDesc className="h-4 w-4 ml-1" />
                )}
              </button>
            </div>

            {/* Mode d'affichage */}
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

        {/* Filtres détaillés */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={filters.type || ''}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Tous les types</option>
                  {DOCUMENT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visibilité
                </label>
                <select
                  value={filters.isPublic !== undefined ? String(filters.isPublic) : ''}
                  onChange={(e) => handleFilterChange('isPublic', 
                    e.target.value === '' ? undefined : e.target.value === 'true'
                  )}
                  className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Tous</option>
                  <option value="false">Privés</option>
                  <option value="true">Publics</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  placeholder="Rechercher par tag..."
                  onChange={(e) => handleFilterChange('tags', e.target.value ? [e.target.value] : undefined)}
                  className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={resetFilters}
                  className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <Download className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Mes documents</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.owned}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <Share2 className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Partagés</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.shared}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <Eye className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Publics</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.public}</p>
            </div>
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
                onClick={() => fetchDocuments(filters)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Réessayer
              </button>
            </div>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun document</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || Object.keys(filters).some(key => key !== 'page' && key !== 'limit' && filters[key as keyof DocumentListQuery])
                ? 'Aucun document ne correspond à vos critères de recherche.'
                : 'Vous n\'avez pas encore uploadé de documents.'
              }
            </p>
            {!showUpload && !searchTerm && Object.keys(filters).length <= 2 && (
              <button
                onClick={() => setShowUpload(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Uploader mon premier document
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
                    onView={(doc) => handleDocumentAction('view', doc)}
                    onDownload={(doc) => handleDocumentAction('download', doc)}
                    onShare={(doc) => handleDocumentAction('share', doc)}
                    onDelete={(doc) => handleDocumentAction('delete', doc)}
                    onLink={(doc) => handleDocumentAction('link', doc)}
                    showActions={true}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDocuments.map((document) => (
                  <DocumentCard
                    key={document.id}
                    document={document}
                    onView={(doc) => handleDocumentAction('view', doc)}
                    onDownload={(doc) => handleDocumentAction('download', doc)}
                    onShare={(doc) => handleDocumentAction('share', doc)}
                    onDelete={(doc) => handleDocumentAction('delete', doc)}
                    onLink={(doc) => handleDocumentAction('link', doc)}
                    showActions={true}
                    compact={true}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Affichage de {((pagination.page - 1) * pagination.limit) + 1} à{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} sur{' '}
                  {pagination.total} documents
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrev}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {pagination.page} sur {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNext}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedDocument && showShareModal && (
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

      {selectedDocument && showLinkModal && (
        <DocumentLinkModal
          document={selectedDocument}
          isOpen={showLinkModal}
          onClose={() => {
            setShowLinkModal(false);
            setSelectedDocument(null);
          }}
          onLink={handleLink}
          onUnlink={handleUnlink}
        />
      )}
    </div>
  );
};

export default DocumentsList;