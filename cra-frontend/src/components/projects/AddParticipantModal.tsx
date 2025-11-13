// src/components/projects/AddParticipantModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Plus, Search, User, AlertCircle } from 'lucide-react';
import { useProjectActions } from '../../hooks/useProjects';
import api from '../../services/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CHERCHEUR' | 'COORDONATEUR_PROJET' | 'ADMINISTRATEUR';
  department?: string;
  specialization?: string;
}

interface AddParticipantModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onParticipantAdded: () => void;
  existingParticipants?: string[]; // IDs des participants déjà dans le projet
}

const roleLabels = {
  CHERCHEUR: 'Chercheur',
  COORDONATEUR_PROJET: 'Coordonateur de Projet',
  ADMINISTRATEUR: 'Administrateur'
};

const projectRoles = [
  'Responsable',
  'Co-responsable', 
  'Chercheur principal',
  'Chercheur associé',
  'Assistant de recherche',
  'Technicien',
  'Collaborateur',
  'Consultant'
];

const AddParticipantModal: React.FC<AddParticipantModalProps> = ({
  isOpen,
  onClose,
  projectId,
  onParticipantAdded,
  existingParticipants = []
}) => {
  const { addParticipant, loading, error, clearError } = useProjectActions();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState('Collaborateur');

  // Charger la liste des utilisateurs
  const loadUsers = async (search: string = '') => {
    try {
      setLoadingUsers(true);
      const response = await api.get('/users', {
        params: {
          search,
          limit: 20,
          roles: 'CHERCHEUR,COORDONATEUR_PROJET'
        }
      });
      
      // Filtrer les utilisateurs déjà participants
      const availableUsers = response.data.data.filter(
        (user: User) => !existingParticipants.includes(user.id)
      );
      
      setUsers(availableUsers);
    } catch (err) {
      console.error('Erreur lors du chargement des utilisateurs:', err);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Effect pour charger les utilisateurs
  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  // Effect pour la recherche avec debounce
  useEffect(() => {
    if (!isOpen) return;
    
    const timer = setTimeout(() => {
      loadUsers(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, isOpen]);

  // Gérer l'ajout du participant
  const handleAddParticipant = async () => {
    if (!selectedUser) return;

    const participant = await addParticipant(projectId, selectedUser.id, selectedRole);
    
    if (participant) {
      onParticipantAdded();
      handleClose();
    }
  };

  // Fermer le modal et reset
  const handleClose = () => {
    setSelectedUser(null);
    setSelectedRole('Collaborateur');
    setSearchTerm('');
    setUsers([]);
    clearError();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Ajouter un participant
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Corps du modal */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Message d'erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {/* Étape 1: Sélectionner l'utilisateur */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rechercher un utilisateur
            </label>
            
            {/* Barre de recherche */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Nom, prénom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Liste des utilisateurs */}
            <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
              {loadingUsers ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <span className="block mt-2">Chargement...</span>
                </div>
              ) : users.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <User className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <span>Aucun utilisateur trouvé</span>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className={`w-full p-3 text-left hover:bg-gray-50 transition-colors ${
                        selectedUser?.id === user.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          selectedUser?.id === user.id ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <User className={`h-4 w-4 ${
                            selectedUser?.id === user.id ? 'text-blue-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>{roleLabels[user.role]}</span>
                            {user.department && (
                              <>
                                <span>•</span>
                                <span>{user.department}</span>
                              </>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        </div>
                        {selectedUser?.id === user.id && (
                          <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Étape 2: Sélectionner le rôle dans le projet */}
          {selectedUser && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rôle dans le projet
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {projectRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Définit les responsabilités de {selectedUser.firstName} dans ce projet
              </p>
            </div>
          )}

          {/* Résumé de la sélection */}
          {selectedUser && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Récapitulatif</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Utilisateur :</span> {selectedUser.firstName} {selectedUser.lastName}</p>
                <p><span className="font-medium">Email :</span> {selectedUser.email}</p>
                <p><span className="font-medium">Rôle CRA :</span> {roleLabels[selectedUser.role]}</p>
                <p><span className="font-medium">Rôle projet :</span> {selectedRole}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleAddParticipant}
            disabled={!selectedUser || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {loading ? 'Ajout...' : 'Ajouter au projet'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddParticipantModal;