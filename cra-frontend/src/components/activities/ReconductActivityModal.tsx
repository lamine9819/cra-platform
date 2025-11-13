// src/components/activities/ReconductActivityModal.tsx
import React, { useState } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';
import { activitiesApi } from '../../services/activitiesApi';

interface ReconductActivityModalProps {
  activityId: string;
  activityTitle: string;
  onClose: () => void;
  onSuccess: (newActivityId: string) => void;
}

const ReconductActivityModal: React.FC<ReconductActivityModalProps> = ({
  activityId,
  activityTitle,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    newTitle: `${activityTitle} (Reconduction)`,
    reason: '',
    notes: '',
    copyParticipants: true,
    copyTasks: false,
    copyPartnerships: true,
    copyFundings: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.reason.trim()) {
      toast.error('Veuillez indiquer la raison de la reconduction');
      return;
    }

    if (formData.reason.trim().length < 10) {
      toast.error('La raison de reconduction doit contenir au moins 10 caractères');
      return;
    }

    try {
      setLoading(true);
      const newActivity = await activitiesApi.reconductActivity(activityId, {
        newTitle: formData.newTitle,
        reason: formData.reason,
        notes: formData.notes || undefined,
        copyParticipants: formData.copyParticipants,
        copyTasks: formData.copyTasks,
        copyPartnerships: formData.copyPartnerships,
        copyFundings: formData.copyFundings,
      });

      toast.success('Activité reconduite avec succès');
      onSuccess(newActivity.id);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la reconduction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <RefreshCw className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Reconduire l'activité</h2>
              <p className="text-sm text-gray-600 mt-1">
                Créer une nouvelle activité basée sur "{activityTitle}"
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nouveau titre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre de la nouvelle activité *
            </label>
            <input
              type="text"
              value={formData.newTitle}
              onChange={(e) => setFormData({ ...formData, newTitle: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Titre de l'activité reconduite"
            />
          </div>

          {/* Raison de la reconduction */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Raison de la reconduction * (minimum 10 caractères)
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              required
              minLength={10}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Ex: Poursuite des travaux de recherche, nouveaux résultats attendus..."
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.reason.length}/500 caractères (minimum 10)
            </p>
          </div>

          {/* Notes additionnelles */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes additionnelles (optionnel)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Informations complémentaires..."
            />
          </div>

          {/* Options de copie */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Éléments à copier vers la nouvelle activité
            </h3>

            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.copyParticipants}
                  onChange={(e) => setFormData({ ...formData, copyParticipants: e.target.checked })}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Copier les participants (recommandé)
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.copyPartnerships}
                  onChange={(e) => setFormData({ ...formData, copyPartnerships: e.target.checked })}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Copier les partenariats (recommandé)
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.copyFundings}
                  onChange={(e) => setFormData({ ...formData, copyFundings: e.target.checked })}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Copier les sources de financement
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.copyTasks}
                  onChange={(e) => setFormData({ ...formData, copyTasks: e.target.checked })}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Copier les tâches (non recommandé)
                </span>
              </label>
            </div>

            <p className="text-xs text-gray-500 mt-3">
              Les objectifs, méthodologie et contraintes seront copiés automatiquement
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {loading ? 'Reconduction en cours...' : 'Reconduire l\'activité'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReconductActivityModal;
