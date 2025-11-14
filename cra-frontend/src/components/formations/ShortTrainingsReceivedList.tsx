// src/components/formations/ShortTrainingsReceivedList.tsx
import React, { useState } from 'react';
import { Plus, Trash2, Calendar, MapPin, Target, Users, Building2, X } from 'lucide-react';
import { Button } from '../ui/Button';
import type { ShortTrainingReceived, CreateShortTrainingReceivedRequest } from '../../types/formation.types';
import {
  useCreateShortTrainingReceived,
  useDeleteShortTrainingReceived,
} from '../../hooks/formations/useFormations';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface ShortTrainingsReceivedListProps {
  trainings: ShortTrainingReceived[];
  isLoading: boolean;
}

export const ShortTrainingsReceivedList: React.FC<ShortTrainingsReceivedListProps> = ({
  trainings,
  isLoading,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [objectives, setObjectives] = useState<string[]>(['']);
  const [beneficiaries, setBeneficiaries] = useState<string[]>([]);
  const [newBeneficiary, setNewBeneficiary] = useState('');

  const [formData, setFormData] = useState<CreateShortTrainingReceivedRequest>({
    title: '',
    objectives: [],
    location: '',
    startDate: '',
    endDate: '',
    duration: undefined,
    beneficiaries: [],
    organizer: '',
  });

  const createMutation = useCreateShortTrainingReceived();
  const deleteMutation = useDeleteShortTrainingReceived();

  const resetForm = () => {
    setFormData({
      title: '',
      objectives: [],
      location: '',
      startDate: '',
      endDate: '',
      duration: undefined,
      beneficiaries: [],
      organizer: '',
    });
    setObjectives(['']);
    setBeneficiaries([]);
    setNewBeneficiary('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const filteredObjectives = objectives.filter((obj) => obj.trim() !== '');
    if (filteredObjectives.length === 0) {
      toast.error('Veuillez ajouter au moins un objectif');
      return;
    }

    createMutation.mutate(
      {
        ...formData,
        objectives: filteredObjectives,
        beneficiaries,
      },
      {
        onSuccess: () => {
          setShowAddModal(false);
          resetForm();
        },
      }
    );
  };

  const handleDelete = (trainingId: string) => {
    toast(
      (t) => (
        <div>
          <p className="font-medium mb-2">Voulez-vous vraiment supprimer cette formation ?</p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                deleteMutation.mutate(trainingId);
                toast.dismiss(t.id);
              }}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Confirmer
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Annuler
            </button>
          </div>
        </div>
      ),
      { duration: 5000 }
    );
  };

  const addObjective = () => {
    setObjectives([...objectives, '']);
  };

  const removeObjective = (index: number) => {
    setObjectives(objectives.filter((_, i) => i !== index));
  };

  const updateObjective = (index: number, value: string) => {
    const newObjectives = [...objectives];
    newObjectives[index] = value;
    setObjectives(newObjectives);
  };

  const addBeneficiary = () => {
    if (newBeneficiary.trim() && !beneficiaries.includes(newBeneficiary.trim())) {
      setBeneficiaries([...beneficiaries, newBeneficiary.trim()]);
      setNewBeneficiary('');
    }
  };

  const removeBeneficiary = (beneficiary: string) => {
    setBeneficiaries(beneficiaries.filter((b) => b !== beneficiary));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bouton d'ajout */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          Formations courtes reçues ({trainings.length})
        </h3>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une formation
        </Button>
      </div>

      {/* Liste des formations */}
      {trainings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Aucune formation courte reçue</p>
          <p className="text-sm text-gray-500 mb-4">
            Ajoutez vos formations courtes pour enrichir votre profil
          </p>
          <Button onClick={() => setShowAddModal(true)} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une formation
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {trainings.map((training) => (
            <div
              key={training.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{training.title}</h4>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{training.location}</span>
                    </div>

                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span>
                        {format(new Date(training.startDate), 'dd MMMM yyyy', { locale: fr })}
                        {training.endDate &&
                          ` - ${format(new Date(training.endDate), 'dd MMMM yyyy', { locale: fr })}`}
                        {training.duration && ` (${training.duration} jours)`}
                      </span>
                    </div>

                    {training.organizer && (
                      <div className="flex items-center">
                        <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{training.organizer}</span>
                      </div>
                    )}

                    {training.objectives.length > 0 && (
                      <div className="mt-3">
                        <div className="flex items-start">
                          <Target className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-700 mb-1">Objectifs:</p>
                            <ul className="list-disc list-inside space-y-1">
                              {training.objectives.map((obj, idx) => (
                                <li key={idx}>{obj}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {training.beneficiaries.length > 0 && (
                      <div className="mt-3">
                        <div className="flex items-start">
                          <Users className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-700 mb-1">Bénéficiaires:</p>
                            <div className="flex flex-wrap gap-2">
                              {training.beneficiaries.map((beneficiary, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                >
                                  {beneficiary}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {training.activity && (
                      <div className="mt-3">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Lié à l'activité: {training.activity.title}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(training.id)}
                  className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal d'ajout */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Ajouter une formation courte reçue</h3>
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

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Intitulé de la formation *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Objectifs de la formation *
                </label>
                <div className="space-y-3">
                  {objectives.map((objective, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={objective}
                        onChange={(e) => updateObjective(index, e.target.value)}
                        placeholder={`Objectif ${index + 1}`}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      {objectives.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeObjective(index)}
                          variant="outline"
                          className="border-red-600 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    onClick={addObjective}
                    variant="outline"
                    className="border-green-600 text-green-600 hover:bg-green-50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un objectif
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lieu *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de début *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date de fin</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durée (jours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.duration || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: Number(e.target.value) || undefined })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organisme organisateur
                </label>
                <input
                  type="text"
                  value={formData.organizer}
                  onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chercheurs bénéficiaires
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newBeneficiary}
                    onChange={(e) => setNewBeneficiary(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBeneficiary())}
                    placeholder="Nom du chercheur"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <Button
                    type="button"
                    onClick={addBeneficiary}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {beneficiaries.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {beneficiaries.map((beneficiary) => (
                      <span
                        key={beneficiary}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {beneficiary}
                        <button
                          type="button"
                          onClick={() => removeBeneficiary(beneficiary)}
                          className="hover:bg-blue-200 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

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
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {createMutation.isPending ? 'Ajout en cours...' : 'Ajouter'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
