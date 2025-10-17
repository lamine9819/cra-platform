// src/components/strategic-planning/ResearchProgramFormModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { ResearchProgram, StrategicSubAxis, EligibleCoordinator } from '../../types/strategic-planning.types';

interface ResearchProgramFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (programData: any) => Promise<void>;
  program?: ResearchProgram | null;
  mode: 'create' | 'edit';
  subAxes: StrategicSubAxis[];
  coordinators: EligibleCoordinator[];
}

const ResearchProgramFormModal: React.FC<ResearchProgramFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  program,
  mode,
  subAxes,
  coordinators,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    startDate: '',
    endDate: '',
    isActive: true,
    strategicSubAxisId: '',
    coordinatorId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (program && mode === 'edit') {
      setFormData({
        name: program.name,
        code: program.code || '',
        description: program.description || '',
        startDate: program.startDate ? program.startDate.split('T')[0] : '',
        endDate: program.endDate ? program.endDate.split('T')[0] : '',
        isActive: program.isActive,
        strategicSubAxisId: program.strategicSubAxisId,
        coordinatorId: program.coordinatorId,
      });
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        startDate: '',
        endDate: '',
        isActive: true,
        strategicSubAxisId: subAxes.length > 0 ? subAxes[0].id : '',
        coordinatorId: coordinators.length > 0 ? coordinators[0].id : '',
      });
    }
    setErrors({});
  }, [program, mode, isOpen, subAxes, coordinators]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }

    if (!formData.strategicSubAxisId) {
      newErrors.strategicSubAxisId = 'Le sous-axe stratégique est requis';
    }

    if (!formData.coordinatorId) {
      newErrors.coordinatorId = 'Le coordinateur est requis';
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) > new Date(formData.endDate)) {
        newErrors.endDate = 'La date de fin doit être après la date de début';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        name: formData.name,
        code: formData.code || undefined,
        description: formData.description || undefined,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        isActive: formData.isActive,
        strategicSubAxisId: formData.strategicSubAxisId,
        coordinatorId: formData.coordinatorId,
      });
      onClose();
    } catch (error: any) {
      setErrors({ submit: error.message || 'Une erreur est survenue' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                {mode === 'create'
                  ? 'Créer un programme de recherche'
                  : 'Modifier le programme de recherche'}
              </h3>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              {/* Sous-axe stratégique */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sous-axe stratégique <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.strategicSubAxisId}
                  onChange={(e) =>
                    setFormData({ ...formData, strategicSubAxisId: e.target.value })
                  }
                  disabled={mode === 'edit'}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.strategicSubAxisId ? 'border-red-500' : 'border-gray-300'
                  } ${mode === 'edit' ? 'bg-gray-100' : ''}`}
                >
                  <option value="">Sélectionner un sous-axe</option>
                  {subAxes.map((subAxis) => (
                    <option key={subAxis.id} value={subAxis.id}>
                      {subAxis.name}
                    </option>
                  ))}
                </select>
                {errors.strategicSubAxisId && (
                  <p className="mt-1 text-sm text-red-600">{errors.strategicSubAxisId}</p>
                )}
              </div>

              {/* Nom */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du programme <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Programme d'amélioration variétale..."
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              {/* Code et Coordinateur en ligne */}
              <div className="grid grid-cols-2 gap-4">
                {/* Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="PROG-001"
                  />
                </div>

                {/* Coordinateur */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coordinateur <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.coordinatorId}
                    onChange={(e) =>
                      setFormData({ ...formData, coordinatorId: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      errors.coordinatorId ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Sélectionner un coordinateur</option>
                    {coordinators.map((coord) => (
                      <option key={coord.id} value={coord.id}>
                        {coord.firstName} {coord.lastName}
                      </option>
                    ))}
                  </select>
                  {errors.coordinatorId && (
                    <p className="mt-1 text-sm text-red-600">{errors.coordinatorId}</p>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      errors.endDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.endDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Description du programme de recherche..."
                />
              </div>

              {/* Statut actif */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Programme actif
                </label>
              </div>
            </div>

            {errors.submit && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            <div className="mt-6 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {mode === 'create' ? 'Créer' : 'Enregistrer'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResearchProgramFormModal;
