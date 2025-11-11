// src/components/documents/modals/ShareDocumentModal.tsx
import React, { useState } from 'react';
import { X, Share2, Search, UserPlus, Check, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { DocumentResponse } from '../../../types/document.types';
import { useShareDocument } from '../../../hooks/documents/useDocuments';
import { Button } from '../../ui/Button';
import api from '../../../services/api';
import toast from 'react-hot-toast';

interface ShareDocumentModalProps {
  document: DocumentResponse;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

const ShareDocumentModal: React.FC<ShareDocumentModalProps> = ({
  document,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [canEdit, setCanEdit] = useState(false);
  const [canDelete, setCanDelete] = useState(false);

  const shareMutation = useShareDocument();

  // Charger la liste des utilisateurs
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: User[] }>('/users');
      return response.data.data || [];
    },
    enabled: isOpen,
  });

  // Filtrer les utilisateurs
  const filteredUsers = users.filter((user) => {
    // Exclure le propri�taire
    if (user.id === document.owner.id) return false;

    // Exclure les utilisateurs d�j� partag\u00e9s
    if (document.shares?.some(share => share.sharedWith.id === user.id)) return false;

    // Filtre de recherche
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        user.firstName.toLowerCase().includes(search) ||
        user.lastName.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
      );
    }

    return true;
  });

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleShare = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Veuillez s�lectionner au moins un utilisateur');
      return;
    }

    try {
      await shareMutation.mutateAsync({
        id: document.id,
        data: {
          userIds: selectedUsers,
          canEdit,
          canDelete,
        },
      });

      toast.success(`Document partag� avec ${selectedUsers.length} utilisateur(s)`);
      setSelectedUsers([]);
      setCanEdit(false);
      setCanDelete(false);
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du partage');
    }
  };

  const handleRevokeShare = async (shareId: string) => {
    // TODO: N�cessite endpoint DELETE /documents/:id/shares/:shareId
    toast.error('Fonctionnalit� "R�voquer" � impl�menter c�t� backend');
    // try {
    //   await api.delete(`/documents/${document.id}/shares/${shareId}`);
    //   toast.success('Partage r�voqu�');
    //   onSuccess?.();
    // } catch (error: any) {
    //   toast.error(error.message || 'Erreur lors de la r�vocation');
    // }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Share2 className="w-6 h-6" />
              Partager le document
            </h2>
            <p className="text-sm text-gray-600 mt-1 truncate">
              {document.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Partages existants */}
          {document.shares && document.shares.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                D�j� partag� avec ({document.shares.length})
              </h3>
              <div className="space-y-2">
                {document.shares.map((share) => (
                  <div
                    key={share.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {share.sharedWith.firstName} {share.sharedWith.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{share.sharedWith.email}</p>
                      <div className="flex gap-2 mt-1">
                        {share.canEdit && (
                          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                            Peut �diter
                          </span>
                        )}
                        {share.canDelete && (
                          <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded">
                            Peut supprimer
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRevokeShare(share.id)}
                      className="text-red-600 hover:text-red-700 p-2"
                      title="R�voquer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nouveau partage */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Partager avec de nouveaux utilisateurs
            </h3>

            {/* Recherche utilisateurs */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Liste des utilisateurs */}
            <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-gray-600">
                  {searchTerm ? 'Aucun utilisateur trouv�' : 'Tous les utilisateurs ont d�j� acc�s'}
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <label
                      key={user.id}
                      className="flex items-center p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="mr-3 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      {selectedUsers.includes(user.id) && (
                        <Check className="w-5 h-5 text-green-600" />
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Permissions */}
            {selectedUsers.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
                <h4 className="text-sm font-semibold text-gray-900">
                  Permissions ({selectedUsers.length} utilisateur(s) s�lectionn�(s))
                </h4>

                <label className="flex items-center text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canEdit}
                    onChange={(e) => setCanEdit(e.target.checked)}
                    className="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span>
                    <strong>Peut �diter</strong> - Modifier le titre, la description, les tags
                  </span>
                </label>

                <label className="flex items-center text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canDelete}
                    onChange={(e) => setCanDelete(e.target.checked)}
                    className="mr-2 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span>
                    <strong>Peut supprimer</strong> - Supprimer d�finitivement le document
                  </span>
                </label>

                <p className="text-xs text-gray-600 mt-2">
                  Par d�faut, les utilisateurs peuvent consulter et t�l�charger le document
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            {selectedUsers.length > 0 && (
              <span>{selectedUsers.length} utilisateur(s) s�lectionn�(s)</span>
            )}
          </p>
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="border-gray-300 text-gray-700"
            >
              Annuler
            </Button>
            <Button
              onClick={handleShare}
              disabled={selectedUsers.length === 0 || shareMutation.isPending}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {shareMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Partage en cours...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Partager
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ShareDocumentModal };
