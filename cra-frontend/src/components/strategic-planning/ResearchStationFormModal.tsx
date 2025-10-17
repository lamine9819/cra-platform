// src/components/strategic-planning/ResearchStationFormModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { ResearchStation } from '../../types/strategic-planning.types';

interface ResearchStationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (stationData: any) => Promise<void>;
  station?: ResearchStation | null;
  mode: 'create' | 'edit';
}

const ResearchStationFormModal: React.FC<ResearchStationFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  station,
  mode,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    surface: '',
    description: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (station && mode === 'edit') {
      setFormData({
        name: station.name,
        location: station.location,
        surface: station.surface?.toString() || '',
        description: station.description || '',
        isActive: station.isActive,
      });
    } else {
      setFormData({
        name: '',
        location: '',
        surface: '',
        description: '',
        isActive: true,
      });
    }
    setErrors({});
  }, [station, mode, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'La localisation est requise';
    }

    if (formData.surface && isNaN(parseFloat(formData.surface))) {
      newErrors.surface = 'La surface doit être un nombre';
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
        location: formData.location,
        surface: formData.surface ? parseFloat(formData.surface) : undefined,
        description: formData.description || undefined,
        isActive: formData.isActive,
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
                  ? 'Créer une station de recherche'
                  : 'Modifier la station de recherche'}
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
                  placeholder="Station de Recherche de Bambey"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              {/* Localisation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Localisation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.location ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Bambey, Diourbel"
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                )}
              </div>

              {/* Surface */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Surface (hectares)
                </label>
                <input
                  type="text"
                  value={formData.surface}
                  onChange={(e) => setFormData({ ...formData, surface: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.surface ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="100"
                />
                {errors.surface && (
                  <p className="mt-1 text-sm text-red-600">{errors.surface}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Description de la station de recherche..."
                />
              </div>

              {/* Statut actif */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500 h-4 w-4"
                  />
                  <span className="ml-2 text-sm text-gray-700">Station active</span>
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

export default ResearchStationFormModal;
