// src/components/comments/CommentItem.tsx
import React, { useState } from 'react';
import { Edit2, Trash2, MoreHorizontal, Save, X, Clock } from 'lucide-react';
import { CommentResponse, UpdateCommentRequest } from '../../types/comment.types';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CommentItemProps {
  comment: CommentResponse;
  onUpdate: (id: string, data: UpdateCommentRequest) => Promise<CommentResponse>;
  onDelete: (id: string) => Promise<void>;
  className?: string;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onUpdate,
  onDelete,
  className = "",
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isLoading, setIsLoading] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleEdit = async () => {
    console.log('handleEdit appelé');
    
    if (!editContent.trim() || editContent.trim() === comment.content.trim()) {
      console.log('Contenu identique ou vide, annulation');
      setIsEditing(false);
      setEditContent(comment.content);
      return;
    }

    setIsLoading(true);
    try {
      console.log('Envoi de la modification:', { id: comment.id, content: editContent.trim() });
      const updatedComment = await onUpdate(comment.id, { content: editContent.trim() });
      console.log('Commentaire modifié avec succès:', updatedComment);
      // Mettre à jour le contenu avec la réponse du serveur
      setEditContent(updatedComment.content);
      setIsEditing(false);
    } catch (error: any) {
      console.error('Erreur lors de la modification:', error);
      alert(`Erreur: ${error.message || 'Impossible de modifier le commentaire'}`);
      // Restaurer le contenu original en cas d'erreur
      setEditContent(comment.content);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    console.log('handleDelete appelé pour le commentaire:', comment.id);
    setIsLoading(true);
    try {
      console.log('Suppression en cours...');
      await onDelete(comment.id);
      console.log('Commentaire supprimé avec succès');
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      alert(`Erreur: ${error.message || 'Impossible de supprimer le commentaire'}`);
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content);
  };

  const formatDate = (date: Date | string) => {
    const commentDate = new Date(date);
    const now = new Date();
    const diffInHours = (now.getTime() - commentDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return formatDistanceToNow(commentDate, { addSuffix: true, locale: fr });
    } else {
      return format(commentDate, 'dd MMM yyyy à HH:mm', { locale: fr });
    }
  };

  const getAuthorInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getRoleLabel = (role: string) => {
    const roleLabels: { [key: string]: string } = {
      CHERCHEUR: 'Chercheur',
      ASSISTANT_CHERCHEUR: 'Assistant',
      TECHNICIEN_SUPERIEUR: 'Technicien',
      ADMINISTRATEUR: 'Admin',
    };
    return roleLabels[role] || role;
  };

  // Utiliser directement les flags du backend
  const canEdit = comment.canEdit === true;
  const canDelete = comment.canDelete === true;
  const showActionsButton = canEdit || canDelete;

  console.log(`Comment ${comment.id} permissions:`, { canEdit, canDelete, fromBackend: { canEdit: comment.canEdit, canDelete: comment.canDelete } });

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 transition-shadow duration-200 hover:shadow-sm ${className}`}>
      {/* En-tête du commentaire */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div className="relative">
            {comment.author.profileImage ? (
              <img
                src={comment.author.profileImage}
                alt={`${comment.author.firstName} ${comment.author.lastName}`}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-indigo-700">
                  {getAuthorInitials(comment.author.firstName, comment.author.lastName)}
                </span>
              </div>
            )}
            
            {/* Indicateur de rôle */}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full border-2 border-white">
              <div className={`w-full h-full rounded-full ${
                comment.author.role === 'CHERCHEUR' ? 'bg-blue-500' :
                comment.author.role === 'ASSISTANT_CHERCHEUR' ? 'bg-green-500' :
                comment.author.role === 'TECHNICIEN_SUPERIEUR' ? 'bg-orange-500' :
                'bg-purple-500'
              }`} title={getRoleLabel(comment.author.role)} />
            </div>
          </div>

          {/* Informations auteur */}
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-medium text-gray-900">
                {comment.author.firstName} {comment.author.lastName}
              </h4>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {getRoleLabel(comment.author.role)}
              </span>
            </div>
            
            <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
              <Clock className="w-3 h-3" />
              <span>{formatDate(comment.createdAt)}</span>
              
              {comment.isEdited && (
                <>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <Edit2 className="w-3 h-3" />
                    <span>modifié</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Actions - Afficher seulement si l'utilisateur a des permissions */}
        {showActionsButton && (
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200 rounded-full hover:bg-gray-100"
              disabled={isLoading}
              title="Options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showActions && (
              <>
                {/* Overlay pour fermer le menu en cliquant ailleurs */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowActions(false)}
                />
                
                {/* Menu dropdown */}
                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50 min-w-[120px]">
                  {canEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditing(true);
                        setShowActions(false);
                      }}
                      disabled={isLoading}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Modifier</span>
                    </button>
                  )}
                  
                  {canDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteConfirm(true);
                        setShowActions(false);
                      }}
                      disabled={isLoading}
                      className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Supprimer</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Contenu du commentaire */}
      <div className="ml-13">
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              disabled={isLoading}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              maxLength={2000}
              autoFocus
            />
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {editContent.length}/2000 caractères
              </span>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCancelEdit}
                  disabled={isLoading}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <X className="w-4 h-4 mr-1" />
                  Annuler
                </button>
                
                <button
                  onClick={handleEdit}
                  disabled={isLoading || !editContent.trim()}
                  className="inline-flex items-center px-3 py-1 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4 mr-1" />
                  {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap break-words">
            {comment.content}
          </div>
        )}
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Supprimer le commentaire
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Cette action est irréversible.
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-md p-3 mb-4">
              <p className="text-sm text-gray-700 line-clamp-3">
                {comment.content}
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Annuler
              </button>
              
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};