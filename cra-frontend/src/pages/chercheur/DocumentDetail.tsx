// src/pages/chercheur/DocumentDetail.tsx - VERSION COMPLÈTE
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Share2,
  Trash2,
  Calendar,
  User,
  Tag,
  FileText,
  Lock,
  Users,
  ExternalLink,
  Link as LinkIcon,
  Unlink,
  FolderOpen,
  Activity as ActivityIcon,
  CheckSquare,
  Edit
} from 'lucide-react';
import { DocumentResponse } from '../../types/document.types';
import { getFileIconFromMime, formatFileSize } from '../../utils/documentUtils';
import DocumentService from '../../services/documentService';
import { DocumentShareModal } from '../../components/documents/DocumentShare';
import { DocumentLinkModal } from '../../components/documents/DocumentLinkModal';
import { toast } from 'react-hot-toast';

const DocumentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<DocumentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);

  // Données utilisateur pour les permissions
  const userData = JSON.parse(localStorage.getItem('cra_user_data') || '{}');

  useEffect(() => {
    if (!id) return;

    const fetchDocument = async () => {
      try {
        setLoading(true);
        const response = await DocumentService.getDocumentById(id);
        setDocument(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Erreur lors du chargement du document');
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

  // Vérification des permissions
  const getPermissions = () => {
    if (!document) return { canEdit: false, canDelete: false, canShare: false, canLink: false };
    
    const isOwner = document.owner.id === userData.id;
    const isAdmin = userData.role === 'ADMINISTRATEUR';
    const sharePermissions = document.shares?.find(share => share.sharedWith.id === userData.id);
    
    return {
      canEdit: isOwner || isAdmin || (sharePermissions?.canEdit ?? false),
      canDelete: isOwner || isAdmin || (sharePermissions?.canDelete ?? false),
      canShare: isOwner || isAdmin,
      canLink: isOwner || isAdmin || (sharePermissions?.canEdit ?? false)
    };
  };

  const permissions = getPermissions();

  const handleDownload = async () => {
    if (!document) return;
    
    try {
      await DocumentService.downloadDocument(document.id, document.filename);
    } catch (error) {
      toast.error('Erreur lors du téléchargement');
    }
  };

  const handleDelete = async () => {
    if (!document) return;
    
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      return;
    }

    try {
      await DocumentService.deleteDocument(document.id);
      toast.success('Document supprimé avec succès');
      navigate('/chercheur/documents');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleShare = async (shareData: any) => {
    if (!document) return;
    
    try {
      await DocumentService.shareDocument(document.id, shareData);
      toast.success('Document partagé avec succès');
      // Recharger le document pour mettre à jour les infos de partage
      const response = await DocumentService.getDocumentById(document.id);
      setDocument(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors du partage');
    }
  };

  const handleLink = async (context: any) => {
    if (!document) return;
    
    try {
      let response;
      if (context.type === 'project') {
        response = await DocumentService.linkToProject(document.id, context.id);
      } else if (context.type === 'activity') {
        response = await DocumentService.linkToActivity(document.id, context.id);
      }
      
      if (response) {
        toast.success('Document lié avec succès');
        setDocument(response.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la liaison');
    }
  };

  const handleUnlink = async () => {
    if (!document) return;
    
    try {
      const response = await DocumentService.unlinkDocument(document.id);
      toast.success('Document délié avec succès');
      setDocument(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors du déliage');
    }
  };

  const navigateToContext = () => {
    if (!document) return;
    
    if (document.project) {
      navigate(`/chercheur/projects/${document.project.id}`);
    } else if (document.activity) {
      navigate(`/chercheur/activities/${document.activity.id}`);
    } else if (document.task) {
      navigate(`/chercheur/tasks/${document.task.id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Chargement du document...</span>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur</h3>
        <p className="text-gray-600 mb-4">{error || 'Document non trouvé'}</p>
        <button
          onClick={() => navigate('/chercheur/documents')}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux documents
        </button>
      </div>
    );
  }

  const fileIcon = getFileIconFromMime(document.mimeType);

  return (
    <div className="space-y-6">
      {/* Header avec navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/chercheur/documents')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux documents
          </button>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleDownload}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Télécharger
          </button>
          {permissions.canShare && (
            <button
              onClick={() => setShowShareModal(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Partager
            </button>
          )}
          {permissions.canLink && (
            <button
              onClick={() => setShowLinkModal(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              {document.project || document.activity || document.task ? (
                <>
                  <Unlink className="h-4 w-4 mr-2" />
                  Gérer liaisons
                </>
              ) : (
                <>
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Lier
                </>
              )}
            </button>
          )}
          {permissions.canDelete && (
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </button>
          )}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations principales */}
        <div className="lg:col-span-2 space-y-6">
          {/* En-tête du document */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start space-x-4">
              <div className="text-4xl">{fileIcon}</div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{document.title}</h1>
                <p className="text-gray-600 mb-4">{document.filename}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {document.owner.firstName} {document.owner.lastName}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(document.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                  <span>{formatFileSize(document.size)}</span>
                </div>

                <div className="flex items-center space-x-2 mt-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {document.type.replace(/_/g, ' ')}
                  </span>
                  {document.isPublic ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Users className="h-3 w-3 mr-1" />
                      Public
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      <Lock className="h-3 w-3 mr-1" />
                      Privé
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {document.description && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{document.description}</p>
            </div>
          )}

          {/* Tags */}
          {document.tags && document.tags.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {document.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Partages */}
          {document.shares && document.shares.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Partagé avec ({document.shares.length})
              </h3>
              <div className="space-y-3">
                {document.shares.map((share) => (
                  <div key={share.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {share.sharedWith.firstName} {share.sharedWith.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{share.sharedWith.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 text-xs">
                      {share.canEdit && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800">
                          <Edit className="h-3 w-3 mr-1" />
                          Édition
                        </span>
                      )}
                      {share.canDelete && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-800">
                          <Trash2 className="h-3 w-3 mr-1" />
                          Suppression
                        </span>
                      )}
                      {!share.canEdit && !share.canDelete && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                          Lecture
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar avec contexte et métadonnées */}
        <div className="space-y-6">
          {/* Contexte/Liaisons */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Contexte</h3>
            <div className="space-y-3">
              {document.project && (
                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <FolderOpen className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Projet</p>
                    <p className="text-sm text-gray-600">{document.project.title}</p>
                    {document.project.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {document.project.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={navigateToContext}
                    className="p-1 text-blue-600 hover:text-blue-800"
                    title="Voir le projet"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              )}
              {document.activity && (
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <ActivityIcon className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Activité</p>
                    <p className="text-sm text-gray-600">{document.activity.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Projet: {document.activity.project.title}
                    </p>
                  </div>
                  <button
                    onClick={navigateToContext}
                    className="p-1 text-green-600 hover:text-green-800"
                    title="Voir l'activité"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              )}
              {document.task && (
                <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                  <CheckSquare className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Tâche</p>
                    <p className="text-sm text-gray-600">{document.task.title}</p>
                    {document.task.project && (
                      <p className="text-xs text-gray-500 mt-1">
                        Projet: {document.task.project.title}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={navigateToContext}
                    className="p-1 text-purple-600 hover:text-purple-800"
                    title="Voir la tâche"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              )}
              {document.seminar && (
                <div className="flex items-start space-x-3 p-3 bg-indigo-50 rounded-lg">
                  <FileText className="h-5 w-5 text-indigo-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Séminaire</p>
                    <p className="text-sm text-gray-600">{document.seminar.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Organisé par {document.seminar.organizer.firstName} {document.seminar.organizer.lastName}
                    </p>
                  </div>
                </div>
              )}
              {!document.project && !document.activity && !document.task && !document.seminar && (
                <div className="text-center py-4">
                  <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Document autonome</p>
                  {permissions.canLink && (
                    <button
                      onClick={() => setShowLinkModal(true)}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      Lier à un projet ou activité
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Informations système */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informations</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Créé le :</span>
                <span className="text-gray-900">
                  {new Date(document.createdAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Modifié le :</span>
                <span className="text-gray-900">
                  {new Date(document.updatedAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Taille :</span>
                <span className="text-gray-900">{formatFileSize(document.size)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Type MIME :</span>
                <span className="text-gray-900 font-mono text-xs">{document.mimeType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Propriétaire :</span>
                <span className="text-gray-900">
                  {document.owner.firstName} {document.owner.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Rôle propriétaire :</span>
                <span className="text-gray-900 text-xs">
                  {document.owner.role.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Actions rapides</h3>
            <div className="space-y-2">
              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </button>
              
              {permissions.canShare && (
                <button
                  onClick={() => setShowShareModal(true)}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Partager
                </button>
              )}

              {permissions.canLink && (
                <button
                  onClick={() => setShowLinkModal(true)}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Gérer les liaisons
                </button>
              )}

              {/* Raccourcis vers contextes */}
              {document.project && (
                <button
                  onClick={navigateToContext}
                  className="w-full flex items-center justify-center px-4 py-2 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100"
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Voir le projet
                </button>
              )}

              {document.activity && (
                <button
                  onClick={navigateToContext}
                  className="w-full flex items-center justify-center px-4 py-2 border border-green-300 shadow-sm text-sm font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100"
                >
                  <ActivityIcon className="h-4 w-4 mr-2" />
                  Voir l'activité
                </button>
              )}

              {document.task && (
                <button
                  onClick={navigateToContext}
                  className="w-full flex items-center justify-center px-4 py-2 border border-purple-300 shadow-sm text-sm font-medium rounded-md text-purple-700 bg-purple-50 hover:bg-purple-100"
                >
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Voir la tâche
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <DocumentShareModal
        document={document}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        onShare={handleShare}
      />

      <DocumentLinkModal
        document={document}
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        onLink={handleLink}
        onUnlink={handleUnlink}
      />
    </div>
  );
};

export default DocumentDetail;