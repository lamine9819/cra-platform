// src/components/formations/SupervisionsList.tsx
import React, { useState } from 'react';
import { Plus, Trash2, Calendar, GraduationCap, Building2, FileText, Users, X } from 'lucide-react';
import { Button } from '../ui/Button';
import type { Supervision, CreateSupervisionRequest } from '../../types/formation.types';
import {
  useCreateSupervision,
  useDeleteSupervision,
} from '../../hooks/formations/useFormations';
import {
  SupervisionType,
  SupervisionStatus,
  SupervisionTypeLabels,
  SupervisionStatusLabels,
  SupervisionStatusColors
} from '../../types/formation.types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface SupervisionsListProps {
  supervisions: Supervision[];
  isLoading: boolean;
}

export const SupervisionsList: React.FC<SupervisionsListProps> = ({
  supervisions,
  isLoading,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [coSupervisors, setCoSupervisors] = useState<string[]>([]);
  const [newCoSupervisor, setNewCoSupervisor] = useState('');

  const [formData, setFormData] = useState<CreateSupervisionRequest>({
    title: '',
    studentName: '',
    type: SupervisionType.MASTER,
    specialty: '',
    university: '',
    startDate: '',
    endDate: '',
    expectedDefenseDate: '',
    status: SupervisionStatus.EN_COURS,
    abstract: '',
    coSupervisors: [],
  });

  const createMutation = useCreateSupervision();
  const deleteMutation = useDeleteSupervision();

  const resetForm = () => {
    setFormData({
      title: '',
      studentName: '',
      type: SupervisionType.MASTER,
      specialty: '',
      university: '',
      startDate: '',
      endDate: '',
      expectedDefenseDate: '',
      status: SupervisionStatus.EN_COURS,
      abstract: '',
      coSupervisors: [],
    });
    setCoSupervisors([]);
    setNewCoSupervisor('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createMutation.mutate(
      {
        ...formData,
        coSupervisors,
      },
      {
        onSuccess: () => {
          setShowAddModal(false);
          resetForm();
        },
      }
    );
  };

  const handleDelete = (supervisionId: string) => {
    toast(
      (t) => (
        <div>
          <p className="font-medium mb-2">Voulez-vous vraiment supprimer cet encadrement ?</p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                deleteMutation.mutate(supervisionId);
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

  const addCoSupervisor = () => {
    if (newCoSupervisor.trim() && !coSupervisors.includes(newCoSupervisor.trim())) {
      setCoSupervisors([...coSupervisors, newCoSupervisor.trim()]);
      setNewCoSupervisor('');
    }
  };

  const removeCoSupervisor = (supervisor: string) => {
    setCoSupervisors(coSupervisors.filter((s) => s !== supervisor));
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
          Encadrements ({supervisions.length})
        </h3>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un encadrement
        </Button>
      </div>

      {/* Liste des encadrements */}
      {supervisions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Aucun encadrement</p>
          <p className="text-sm text-gray-500 mb-4">
            Ajoutez vos encadrements d'étudiants pour enrichir votre profil
          </p>
          <Button onClick={() => setShowAddModal(true)} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un encadrement
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {supervisions.map((supervision) => (
            <div
              key={supervision.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <h4 className="text-lg font-semibold text-gray-900">{supervision.title}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${SupervisionStatusColors[supervision.status]}`}>
                      {SupervisionStatusLabels[supervision.status]}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-gray-400" />
                      <span><strong>Étudiant:</strong> {supervision.studentName}</span>
                    </div>

                    <div className="flex items-center">
                      <GraduationCap className="w-4 h-4 mr-2 text-gray-400" />
                      <span><strong>Type:</strong> {SupervisionTypeLabels[supervision.type]}</span>
                    </div>

                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-gray-400" />
                      <span><strong>Spécialité:</strong> {supervision.specialty}</span>
                    </div>

                    <div className="flex items-center">
                      <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{supervision.university}</span>
                    </div>

                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span>
                        <strong>Période:</strong>{' '}
                        {format(new Date(supervision.startDate), 'dd MMMM yyyy', { locale: fr })}
                        {supervision.endDate &&
                          ` - ${format(new Date(supervision.endDate), 'dd MMMM yyyy', { locale: fr })}`}
                      </span>
                    </div>

                    {supervision.expectedDefenseDate && (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        <span>
                          <strong>Soutenance prévue:</strong>{' '}
                          {format(new Date(supervision.expectedDefenseDate), 'dd MMMM yyyy', { locale: fr })}
                        </span>
                      </div>
                    )}

                    {supervision.abstract && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <p className="font-medium text-gray-700 mb-1">Résumé:</p>
                        <p className="text-gray-600 text-sm whitespace-pre-wrap">{supervision.abstract}</p>
                      </div>
                    )}

                    {supervision.coSupervisors.length > 0 && (
                      <div className="mt-3">
                        <p className="font-medium text-gray-700 mb-2">Co-encadrants:</p>
                        <div className="flex flex-wrap gap-2">
                          {supervision.coSupervisors.map((supervisor, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full"
                            >
                              {supervisor}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {supervision.activity && (
                      <div className="mt-3">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Lié à l'activité: {supervision.activity.title}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(supervision.id)}
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
              <h3 className="text-lg font-semibold text-gray-900">Ajouter un encadrement</h3>
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
                  Titre du travail *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Ex: Étude de l'impact du changement climatique..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'étudiant *
                  </label>
                  <input
                    type="text"
                    value={formData.studentName}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as SupervisionType })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {Object.entries(SupervisionTypeLabels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Spécialité *
                  </label>
                  <input
                    type="text"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Université / École *
                  </label>
                  <input
                    type="text"
                    value={formData.university}
                    onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Soutenance prévue
                  </label>
                  <input
                    type="date"
                    value={formData.expectedDefenseDate}
                    onChange={(e) =>
                      setFormData({ ...formData, expectedDefenseDate: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut *</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as SupervisionStatus })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {Object.entries(SupervisionStatusLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Résumé du travail
                </label>
                <textarea
                  value={formData.abstract}
                  onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                  rows={4}
                  placeholder="Décrivez brièvement le sujet de recherche..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Co-encadrants
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newCoSupervisor}
                    onChange={(e) => setNewCoSupervisor(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCoSupervisor())}
                    placeholder="Nom du co-encadrant"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <Button
                    type="button"
                    onClick={addCoSupervisor}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {coSupervisors.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {coSupervisors.map((supervisor) => (
                      <span
                        key={supervisor}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                      >
                        {supervisor}
                        <button
                          type="button"
                          onClick={() => removeCoSupervisor(supervisor)}
                          className="hover:bg-indigo-200 rounded-full p-0.5"
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
