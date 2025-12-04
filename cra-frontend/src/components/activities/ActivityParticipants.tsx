// src/components/activities/ActivityParticipants.tsx
import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Plus, Edit, Trash2, X, Search, Users } from 'lucide-react';
import { activitiesApi } from '../../services/activitiesApi';
import api from '../../services/api';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';
import {
  type ActivityParticipant,
  type AddActivityParticipantRequest,
  type UpdateActivityParticipantRequest,
  ActivityParticipantRole,
  ActivityParticipantRoleLabels,
} from '../../types/activity.types';

interface ActivityParticipantsProps {
  activityId: string;
  participants: ActivityParticipant[];
  canManage?: boolean;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

const ActivityParticipants: React.FC<ActivityParticipantsProps> = ({
  activityId,
  participants,
  canManage = false,
}) => {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<ActivityParticipant | null>(
    null
  );
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

  const [newParticipant, setNewParticipant] = useState<AddActivityParticipantRequest>({
    userId: '',
    role: ActivityParticipantRole.CHERCHEUR_ASSOCIE,
    timeAllocation: 0,
    responsibilities: '',
    expertise: '',
  });

  // Mutations
  const addMutation = useMutation({
    mutationFn: (data: AddActivityParticipantRequest) =>
      activitiesApi.addParticipant(activityId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity', activityId] });
      toast.success('Participant ajouté avec succès');
      setShowAddModal(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur lors de l'ajout du participant");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ participantId, data }: { participantId: string; data: UpdateActivityParticipantRequest }) =>
      activitiesApi.updateParticipant(activityId, participantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity', activityId] });
      toast.success('Participant modifié avec succès');
      setShowEditModal(false);
      setSelectedParticipant(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la modification');
    },
  });

  const removeMutation = useMutation({
    mutationFn: (participantId: string) =>
      activitiesApi.removeParticipant(activityId, participantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity', activityId] });
      toast.success('Participant retiré avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors du retrait');
    },
  });

  const resetForm = () => {
    setNewParticipant({
      userId: '',
      role: ActivityParticipantRole.CHERCHEUR_ASSOCIE,
      timeAllocation: 0,
      responsibilities: '',
      expertise: '',
    });
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParticipant.userId) {
      toast.error('Veuillez sélectionner un utilisateur');
      return;
    }
    addMutation.mutate(newParticipant);
  };

  const handleEdit = (participant: ActivityParticipant) => {
    setSelectedParticipant(participant);
    setShowEditModal(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParticipant) return;

    updateMutation.mutate({
      participantId: selectedParticipant.id,
      data: {
        userId: selectedParticipant.user.id,
        role: selectedParticipant.role,
        timeAllocation: selectedParticipant.timeAllocation,
        responsibilities: selectedParticipant.responsibilities,
        expertise: selectedParticipant.expertise,
        isActive: selectedParticipant.isActive,
      },
    });
  };

  const handleRemove = (participantId: string) => {
    if (window.confirm('Voulez-vous vraiment retirer ce participant ?')) {
      removeMutation.mutate(participantId);
    }
  };

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Users className="w-5 h-5 mr-2 text-green-600" />
          Participants ({participants.length})
        </h3>
        {canManage && (
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un participant
          </Button>
        )}
      </div>

      {/* Liste des participants */}
      <div className="space-y-3">
        {participants.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Aucun participant pour le moment</p>
          </div>
        ) : (
          participants.map((participant) => (
            <div
              key={participant.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h4 className="font-medium text-gray-900">
                      {participant.user.firstName} {participant.user.lastName}
                    </h4>
                    <span className="ml-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      {ActivityParticipantRoleLabels[participant.role]}
                    </span>
                    {!participant.isActive && (
                      <span className="ml-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                        Inactif
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{participant.user.email}</p>
                  {participant.user.grade && (
                    <p className="text-sm text-gray-500">Grade: {participant.user.grade}</p>
                  )}
                  {participant.timeAllocation && (
                    <p className="text-sm text-gray-500">
                      Allocation de temps: {participant.timeAllocation}%
                    </p>
                  )}
                  {participant.responsibilities && (
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="font-medium">Responsabilités:</span>{' '}
                      {participant.responsibilities}
                    </p>
                  )}
                  {participant.expertise && (
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Expertise:</span> {participant.expertise}
                    </p>
                  )}
                </div>
                {canManage && (
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(participant)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemove(participant.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Retirer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal d'ajout */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
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

            <form onSubmit={handleAdd} className="p-6 space-y-4">
              {/* Recherche d'utilisateur */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rechercher un utilisateur
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nom, prénom ou email..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Liste des utilisateurs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sélectionner un utilisateur *
                </label>
                <select
                  value={newParticipant.userId}
                  onChange={(e) => setNewParticipant({ ...newParticipant, userId: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">-- Sélectionner --</option>
                  {loadingUsers ? (
                    <option>Chargement...</option>
                  ) : (
                    users.map((user: User) => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} ({user.email})
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Rôle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rôle *</label>
                <select
                  value={newParticipant.role}
                  onChange={(e) =>
                    setNewParticipant({
                      ...newParticipant,
                      role: e.target.value as ActivityParticipantRole,
                    })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {Object.entries(ActivityParticipantRoleLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Allocation de temps */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allocation de temps (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newParticipant.timeAllocation || ''}
                  onChange={(e) =>
                    setNewParticipant({
                      ...newParticipant,
                      timeAllocation: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Responsabilités */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Responsabilités
                </label>
                <textarea
                  value={newParticipant.responsibilities || ''}
                  onChange={(e) =>
                    setNewParticipant({ ...newParticipant, responsibilities: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Expertise */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expertise</label>
                <textarea
                  value={newParticipant.expertise || ''}
                  onChange={(e) =>
                    setNewParticipant({ ...newParticipant, expertise: e.target.value })
                  }
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={addMutation.isPending}>
                  {addMutation.isPending ? 'Ajout en cours...' : 'Ajouter'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de modification */}
      {showEditModal && selectedParticipant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
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

            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {selectedParticipant.user.firstName} {selectedParticipant.user.lastName}
                </p>
                <p className="text-sm text-gray-500">{selectedParticipant.user.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rôle *</label>
                <select
                  value={selectedParticipant.role}
                  onChange={(e) =>
                    setSelectedParticipant({
                      ...selectedParticipant,
                      role: e.target.value as ActivityParticipantRole,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  {Object.entries(ActivityParticipantRoleLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allocation de temps (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={selectedParticipant.timeAllocation || ''}
                  onChange={(e) =>
                    setSelectedParticipant({
                      ...selectedParticipant,
                      timeAllocation: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Responsabilités
                </label>
                <textarea
                  value={selectedParticipant.responsibilities || ''}
                  onChange={(e) =>
                    setSelectedParticipant({
                      ...selectedParticipant,
                      responsibilities: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expertise</label>
                <textarea
                  value={selectedParticipant.expertise || ''}
                  onChange={(e) =>
                    setSelectedParticipant({
                      ...selectedParticipant,
                      expertise: e.target.value,
                    })
                  }
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={selectedParticipant.isActive}
                  onChange={(e) =>
                    setSelectedParticipant({
                      ...selectedParticipant,
                      isActive: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                  Participant actif
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedParticipant(null);
                  }}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Modification en cours...' : 'Modifier'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityParticipants;
