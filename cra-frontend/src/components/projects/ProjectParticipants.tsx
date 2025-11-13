// src/components/projects/ProjectParticipants.tsx
import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Plus, UserPlus, Edit, Trash2, X, Search } from 'lucide-react';
import { projectsApi } from '../../services/projectsApi';
import api from '../../services/api';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';
import {
  type ProjectParticipant,
  type AddParticipantRequest,
  type UpdateParticipantRequest,
  ParticipantRole,
  ParticipantRoleLabels,
} from '../../types/project.types';

interface ProjectParticipantsProps {
  projectId: string;
  participants: ProjectParticipant[];
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

const ProjectParticipants: React.FC<ProjectParticipantsProps> = ({ projectId, participants }) => {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<ProjectParticipant | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Récupérer la liste des utilisateurs
  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['users', searchTerm],
    queryFn: async () => {
      const response = await api.get('/users', {
        params: { search: searchTerm, limit: 50 },
      });
      return response.data.data || response.data || [];
    },
    enabled: showAddModal,
  });

  // Formulaire pour ajouter un participant
  const [newParticipant, setNewParticipant] = useState<AddParticipantRequest>({
    userId: '',
    role: ParticipantRole.CHERCHEUR_ASSOCIE,
    timeAllocation: 0,
    responsibilities: '',
    expertise: '',
  });

  // Mutation pour ajouter un participant
  const addMutation = useMutation({
    mutationFn: (data: AddParticipantRequest) => projectsApi.addParticipant(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast.success('Participant ajouté avec succès');
      setShowAddModal(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de l\'ajout du participant');
    },
  });

  // Mutation pour mettre à jour un participant
  const updateMutation = useMutation({
    mutationFn: (data: UpdateParticipantRequest) => projectsApi.updateParticipant(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast.success('Participant modifié avec succès');
      setShowEditModal(false);
      setSelectedParticipant(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la modification');
    },
  });

  // Mutation pour retirer un participant
  const removeMutation = useMutation({
    mutationFn: (participantId: string) => projectsApi.removeParticipant(projectId, participantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast.success('Participant retiré avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors du retrait');
    },
  });

  const resetForm = () => {
    setNewParticipant({
      userId: '',
      role: ParticipantRole.CHERCHEUR_ASSOCIE,
      timeAllocation: 0,
      responsibilities: '',
      expertise: '',
    });
    setSearchTerm('');
  };

  const handleAdd = () => {
    if (!newParticipant.userId) {
      toast.error('Veuillez sélectionner un utilisateur');
      return;
    }
    addMutation.mutate(newParticipant);
  };

  const handleEdit = () => {
    if (!selectedParticipant) return;
    updateMutation.mutate({
      participantId: selectedParticipant.id,
      role: selectedParticipant.role,
      timeAllocation: selectedParticipant.timeAllocation,
      responsibilities: selectedParticipant.responsibilities,
      expertise: selectedParticipant.expertise,
    });
  };

  const handleRemove = (participantId: string, userName: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir retirer ${userName} du projet ?`)) {
      removeMutation.mutate(participantId);
    }
  };

  // Filtrer les utilisateurs qui ne sont pas déjà participants
  const availableUsers = users.filter((user: User) =>
    !participants.some(p => p.user.id === user.id)
  );

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Participants ({participants.length})</h3>
        <Button onClick={() => setShowAddModal(true)} className="bg-green-600 hover:bg-green-700 text-white">
          <UserPlus className="w-4 h-4 mr-2" />
          Ajouter un participant
        </Button>
      </div>

      {/* Liste des participants */}
      {participants.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Aucun participant pour le moment</p>
          <Button
            onClick={() => setShowAddModal(true)}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white"
          >
            Ajouter le premier participant
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">
                    {participant.user.firstName} {participant.user.lastName}
                  </h4>
                  <p className="text-sm text-gray-600">{participant.user.email}</p>
                  <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    {ParticipantRoleLabels[participant.role]}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedParticipant(participant);
                      setShowEditModal(true);
                    }}
                    className="p-1 text-gray-600 hover:text-green-600"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      handleRemove(
                        participant.id,
                        `${participant.user.firstName} ${participant.user.lastName}`
                      )
                    }
                    className="p-1 text-gray-600 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {participant.timeAllocation && participant.timeAllocation > 0 && (
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Allocation:</span> {participant.timeAllocation}%
                </div>
              )}

              {participant.expertise && (
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Expertise:</span> {participant.expertise}
                </div>
              )}

              {participant.responsibilities && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Responsabilités:</span> {participant.responsibilities}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal d'ajout */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Ajouter un participant</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rechercher et sélectionner un utilisateur <span className="text-red-500">*</span>
                </label>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher par nom ou email..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {loadingUsers ? (
                  <div className="text-center py-4 text-gray-600">Chargement...</div>
                ) : availableUsers.length === 0 ? (
                  <div className="text-center py-4 text-gray-600">
                    {searchTerm ? 'Aucun utilisateur trouvé' : 'Tous les utilisateurs sont déjà participants'}
                  </div>
                ) : (
                  <div className="border border-gray-300 rounded-md max-h-48 overflow-y-auto">
                    {availableUsers.map((user: User) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => setNewParticipant({ ...newParticipant, userId: user.id })}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                          newParticipant.userId === user.id ? 'bg-green-50 border-l-4 border-l-green-600' : ''
                        }`}
                      >
                        <div className="font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                        {user.role && (
                          <div className="text-xs text-gray-500 mt-1">Rôle: {user.role}</div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {newParticipant.userId && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rôle dans le projet</label>
                    <select
                      value={newParticipant.role}
                      onChange={(e) =>
                        setNewParticipant({ ...newParticipant, role: e.target.value as ParticipantRole })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {Object.entries(ParticipantRoleLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Allocation de temps (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newParticipant.timeAllocation}
                      onChange={(e) =>
                        setNewParticipant({ ...newParticipant, timeAllocation: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expertise</label>
                    <input
                      type="text"
                      value={newParticipant.expertise}
                      onChange={(e) => setNewParticipant({ ...newParticipant, expertise: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Responsabilités</label>
                    <textarea
                      value={newParticipant.responsibilities}
                      onChange={(e) =>
                        setNewParticipant({ ...newParticipant, responsibilities: e.target.value })
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
              >
                Annuler
              </Button>
              <Button
                onClick={handleAdd}
                disabled={addMutation.isPending || !newParticipant.userId}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {addMutation.isPending ? 'Ajout...' : 'Ajouter'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de modification */}
      {showEditModal && selectedParticipant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Modifier le participant</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedParticipant(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Utilisateur</label>
                <input
                  type="text"
                  value={`${selectedParticipant.user.firstName} ${selectedParticipant.user.lastName}`}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                <select
                  value={selectedParticipant.role}
                  onChange={(e) =>
                    setSelectedParticipant({
                      ...selectedParticipant,
                      role: e.target.value as ParticipantRole,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {Object.entries(ParticipantRoleLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allocation de temps (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={selectedParticipant.timeAllocation || 0}
                  onChange={(e) =>
                    setSelectedParticipant({
                      ...selectedParticipant,
                      timeAllocation: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expertise</label>
                <input
                  type="text"
                  value={selectedParticipant.expertise || ''}
                  onChange={(e) =>
                    setSelectedParticipant({ ...selectedParticipant, expertise: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Responsabilités</label>
                <textarea
                  value={selectedParticipant.responsibilities || ''}
                  onChange={(e) =>
                    setSelectedParticipant({ ...selectedParticipant, responsibilities: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedParticipant(null);
                }}
              >
                Annuler
              </Button>
              <Button
                onClick={handleEdit}
                disabled={updateMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {updateMutation.isPending ? 'Modification...' : 'Modifier'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectParticipants;
