// src/components/documents/DocumentShareModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Users, Search, Check, UserPlus, Shield, Trash2 } from 'lucide-react';
import { DocumentShareModalProps, ShareDocumentRequest } from '../../types/document.types';
import { User } from '../../services/usersApi';
import usersApi from '../../services/usersApi';
import { toast } from 'react-hot-toast';

export const DocumentShareModal: React.FC<DocumentShareModalProps> = ({
  document,
  isOpen,
  onClose,
  onShare
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [permissions, setPermissions] = useState({
    canEdit: false,
    canDelete: false
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);

  // Charger les utilisateurs disponibles
  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen, searchTerm]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const excludeIds = [
        document.owner.id,
        ...(document.shares?.map(share => share.sharedWith.id) || [])
      ];
      
      const availableUsers = await usersApi.searchUsersForProject(searchTerm, excludeIds);
      setUsers(availableUsers);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleShare = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Veuillez sélectionner au moins un utilisateur');
      return;
    }

    try {
      setSharing(true);
      const shareData: ShareDocumentRequest = {
        userIds: selectedUsers,
        canEdit: permissions.canEdit,
        canDelete: permissions.canDelete
      };

      await onShare(shareData);
      
      // Reset du formulaire
      setSelectedUsers([]);
      setPermissions({ canEdit: false, canDelete: false });
      onClose();
    } catch (error) {
      // L'erreur est déjà gérée par le contexte
    } finally {
      setSharing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Partager le document
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {document.title}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white px-6 py-4 max-h-96 overflow-y-auto">
            {/* Partages existants */}
            {document.shares && document.shares.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Déjà partagé avec ({document.shares.length})
                </h4>
                <div className="space-y-2">
                  {document.shares.map((share) => (
                    <div key={share.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {share.sharedWith.firstName} {share.sharedWith.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{share.sharedWith.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1 text-xs text-gray-600">
                          {share.canEdit && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800">
                              <Shield className="h-3 w-3 mr-1" />
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
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recherche d'utilisateurs */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Partager avec de nouveaux utilisateurs
              </h4>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher des utilisateurs..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Liste des utilisateurs */}
            <div className="mb-6">
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-sm text-gray-600">Recherche...</span>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-4">
                  <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    {searchTerm ? 'Aucun utilisateur trouvé' : 'Commencez à taper pour rechercher des utilisateurs'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedUsers.includes(user.id)
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => handleUserToggle(user.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <Users className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {user.email} • {user.role.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      {selectedUsers.includes(user.id) && (
                        <Check className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Permissions */}
            {selectedUsers.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Permissions</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={permissions.canEdit}
                      onChange={(e) => setPermissions(prev => ({ ...prev, canEdit: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Autoriser la modification du document
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={permissions.canDelete}
                      onChange={(e) => setPermissions(prev => ({ ...prev, canDelete: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Autoriser la suppression du document
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Annuler
            </button>
            <button
              onClick={handleShare}
              disabled={selectedUsers.length === 0 || sharing}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sharing ? (
                <>
                  <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Partage...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Partager avec {selectedUsers.length} utilisateur{selectedUsers.length > 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};