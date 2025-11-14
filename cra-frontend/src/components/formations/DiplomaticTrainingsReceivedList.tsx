// src/components/formations/DiplomaticTrainingsReceivedList.tsx
import React, { useState } from 'react';
import { Plus, Trash2, Calendar, GraduationCap, Building2, BookOpen, X } from 'lucide-react';
import { Button } from '../ui/Button';
import type { DiplomaticTrainingReceived, CreateDiplomaticTrainingReceivedRequest } from '../../types/formation.types';
import {
  useCreateDiplomaticTrainingReceived,
  useDeleteDiplomaticTrainingReceived,
} from '../../hooks/formations/useFormations';
import { DiplomaStatus, DiplomaStatusLabels, DiplomaStatusColors } from '../../types/formation.types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface DiplomaticTrainingsReceivedListProps {
  trainings: DiplomaticTrainingReceived[];
  isLoading: boolean;
}

export const DiplomaticTrainingsReceivedList: React.FC<DiplomaticTrainingsReceivedListProps> = ({
  trainings,
  isLoading,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<CreateDiplomaticTrainingReceivedRequest>({
    studentName: '',
    level: '',
    specialty: '',
    university: '',
    startDate: '',
    endDate: '',
    period: '',
    diplomaObtained: DiplomaStatus.EN_COURS,
  });

  const createMutation = useCreateDiplomaticTrainingReceived();
  const deleteMutation = useDeleteDiplomaticTrainingReceived();

  const resetForm = () => {
    setFormData({
      studentName: '',
      level: '',
      specialty: '',
      university: '',
      startDate: '',
      endDate: '',
      period: '',
      diplomaObtained: DiplomaStatus.EN_COURS,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData, {
      onSuccess: () => {
        setShowAddModal(false);
        resetForm();
      },
    });
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
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          Formations diplômantes reçues ({trainings.length})
        </h3>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une formation
        </Button>
      </div>

      {trainings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Aucune formation diplômante reçue</p>
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
                  <div className="flex items-center gap-2 mb-3">
                    <h4 className="text-lg font-semibold text-gray-900">{training.studentName}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${DiplomaStatusColors[training.diplomaObtained]}`}>
                      {DiplomaStatusLabels[training.diplomaObtained]}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-2 text-gray-400" />
                      <span><strong>Niveau:</strong> {training.level}</span>
                    </div>

                    <div className="flex items-center">
                      <GraduationCap className="w-4 h-4 mr-2 text-gray-400" />
                      <span><strong>Spécialité:</strong> {training.specialty}</span>
                    </div>

                    <div className="flex items-center">
                      <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{training.university}</span>
                    </div>

                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span><strong>Période:</strong> {training.period}</span>
                    </div>

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
              <h3 className="text-lg font-semibold text-gray-900">Ajouter une formation diplômante reçue</h3>
              <button onClick={() => { setShowAddModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prénom et nom de l'étudiant *</label>
                  <input
                    type="text"
                    value={formData.studentName}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Niveau *</label>
                  <input
                    type="text"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    required
                    placeholder="Ex: Licence, Master, Doctorat..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Spécialité *</label>
                <input
                  type="text"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Université / École *</label>
                <input
                  type="text"
                  value={formData.university}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Période *</label>
                <input
                  type="text"
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  required
                  placeholder="Ex: 2022-2024"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date de début *</label>
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Obtention du diplôme *</label>
                <select
                  value={formData.diplomaObtained}
                  onChange={(e) => setFormData({ ...formData, diplomaObtained: e.target.value as DiplomaStatus })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {Object.entries(DiplomaStatusLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button type="button" variant="outline" onClick={() => { setShowAddModal(false); resetForm(); }}>
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
