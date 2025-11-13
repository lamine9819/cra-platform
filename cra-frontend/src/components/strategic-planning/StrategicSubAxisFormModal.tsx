// src/components/strategic-planning/StrategicSubAxisFormModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { StrategicSubAxis, StrategicAxis } from '../../types/strategic-planning.types';

interface StrategicSubAxisFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (subAxisData: any) => Promise<void>;
  subAxis?: StrategicSubAxis | null;
  mode: 'create' | 'edit';
  axes: StrategicAxis[];
}

const StrategicSubAxisFormModal: React.FC<StrategicSubAxisFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  subAxis,
  mode,
  axes,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    order: 1,
    strategicAxisId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (subAxis && mode === 'edit') {
      setFormData({
        name: subAxis.name,
        code: subAxis.code || '',
        description: subAxis.description || '',
        order: subAxis.order || 1,
        strategicAxisId: subAxis.strategicAxisId,
      });
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        order: 1,
        strategicAxisId: axes.length > 0 ? axes[0].id : '',
      });
    }
    setErrors({});
  }, [subAxis, mode, isOpen, axes]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }

    if (!formData.strategicAxisId) {
      newErrors.strategicAxisId = "L'axe stratégique est requis";
    }

    if (formData.order < 1) {
      newErrors.order = "L'ordre doit être supérieur à 0";
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
        order: formData.order,
        strategicAxisId: formData.strategicAxisId,
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

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                {mode === 'create'
                  ? 'Créer un sous-axe stratégique'
                  : 'Modifier le sous-axe stratégique'}
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
              {/* Axe stratégique */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Axe stratégique <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.strategicAxisId}
                  onChange={(e) =>
                    setFormData({ ...formData, strategicAxisId: e.target.value })
                  }
                  disabled={mode === 'edit'}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.strategicAxisId ? 'border-red-500' : 'border-gray-300'
                  } ${mode === 'edit' ? 'bg-gray-100' : ''}`}
                >
                  <option value="">Sélectionner un axe</option>
                  {axes.map((axis) => (
                    <option key={axis.id} value={axis.id}>
                      {axis.name}
                    </option>
                  ))}
                </select>
                {errors.strategicAxisId && (
                  <p className="mt-1 text-sm text-red-600">{errors.strategicAxisId}</p>
                )}
              </div>

              {/* Nom */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Sous-Axe 1.1: Amélioration des variétés..."
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

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
                  placeholder="SA-1.1"
                />
              </div>

              {/* Ordre */}
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
                  placeholder="Description du sous-axe stratégique..."
                />
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

export default StrategicSubAxisFormModal;
