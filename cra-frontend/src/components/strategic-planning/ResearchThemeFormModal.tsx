// src/components/strategic-planning/ResearchThemeFormModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Plus, Trash2 } from 'lucide-react';
import { ResearchTheme, ResearchProgram } from '../../types/strategic-planning.types';

interface ResearchThemeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (themeData: any) => Promise<void>;
  theme?: ResearchTheme | null;
  mode: 'create' | 'edit';
  programs: ResearchProgram[];
}

const ResearchThemeFormModal: React.FC<ResearchThemeFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  theme,
  mode,
  programs,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    objectives: [''],
    order: 1,
    isActive: true,
    programId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (theme && mode === 'edit') {
      setFormData({
        name: theme.name,
        code: theme.code || '',
        description: theme.description || '',
        objectives: theme.objectives.length > 0 ? theme.objectives : [''],
        order: theme.order || 1,
        isActive: theme.isActive,
        programId: theme.programId,
      });
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        objectives: [''],
        order: 1,
        isActive: true,
        programId: programs.length > 0 ? programs[0].id : '',
      });
    }
    setErrors({});
  }, [theme, mode, isOpen, programs]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }

    if (!formData.programId) {
      newErrors.programId = 'Le programme de recherche est requis';
    }

    if (formData.order < 1) {
      newErrors.order = "L'ordre doit être supérieur à 0";
    }

    // Filter empty objectives
    const nonEmptyObjectives = formData.objectives.filter((obj) => obj.trim());
    if (nonEmptyObjectives.length === 0) {
      newErrors.objectives = 'Au moins un objectif est requis';
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
      // Filter empty objectives before submitting
      const nonEmptyObjectives = formData.objectives.filter((obj) => obj.trim());

      await onSubmit({
        name: formData.name,
        code: formData.code || undefined,
        description: formData.description || undefined,
        objectives: nonEmptyObjectives,
        order: formData.order,
        isActive: formData.isActive,
        programId: formData.programId,
      });
      onClose();
    } catch (error: any) {
      setErrors({ submit: error.message || 'Une erreur est survenue' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleObjectiveChange = (index: number, value: string) => {
    const newObjectives = [...formData.objectives];
    newObjectives[index] = value;
    setFormData({ ...formData, objectives: newObjectives });
  };

  const addObjective = () => {
    setFormData({ ...formData, objectives: [...formData.objectives, ''] });
  };

  const removeObjective = (index: number) => {
    if (formData.objectives.length > 1) {
      const newObjectives = formData.objectives.filter((_, i) => i !== index);
      setFormData({ ...formData, objectives: newObjectives });
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
                  ? 'Créer un thème de recherche'
                  : 'Modifier le thème de recherche'}
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
              {/* Programme de recherche */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Programme de recherche <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.programId}
                  onChange={(e) =>
                    setFormData({ ...formData, programId: e.target.value })
                  }
                  disabled={mode === 'edit'}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.programId ? 'border-red-500' : 'border-gray-300'
                  } ${mode === 'edit' ? 'bg-gray-100' : ''}`}
                >
                  <option value="">Sélectionner un programme</option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </select>
                {errors.programId && (
                  <p className="mt-1 text-sm text-red-600">{errors.programId}</p>
                )}
              </div>

              {/* Nom */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du thème <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Thème de recherche sur..."
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              {/* Code et Ordre en ligne */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="TH-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ordre d'affichage <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({ ...formData, order: parseInt(e.target.value) || 1 })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      errors.order ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.order && <p className="mt-1 text-sm text-red-600">{errors.order}</p>}
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
                  placeholder="Description du thème de recherche..."
                />
              </div>

              {/* Objectifs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Objectifs <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={addObjective}
                    className="flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter un objectif
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.objectives.map((objective, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={objective}
                        onChange={(e) => handleObjectiveChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder={`Objectif ${index + 1}`}
                      />
                      {formData.objectives.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeObjective(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer cet objectif"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {errors.objectives && (
                  <p className="mt-1 text-sm text-red-600">{errors.objectives}</p>
                )}
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
                  Thème actif
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

export default ResearchThemeFormModal;
