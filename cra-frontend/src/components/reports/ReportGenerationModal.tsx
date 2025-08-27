// src/components/reports/ReportGenerationModal.tsx
import React, { useState } from 'react';
import { X, Download } from 'lucide-react';

interface ReportGenerationModalProps {
  open: boolean;
  onClose: () => void;
  type?: string;
  entityId?: string;
  entityTitle?: string;
  onGenerate: (options: {
    type: string;
    entityId?: string;
    dateRange?: { start: string; end: string };
    includeGraphics: boolean;
    language: 'fr' | 'en';
  }) => Promise<void>;
}

const ReportGenerationModal: React.FC<ReportGenerationModalProps> = ({
  open,
  onClose,
  type,
  entityId,
  entityTitle,
  onGenerate
}) => {
  const [loading, setLoading] = useState(false);
  const [includeGraphics, setIncludeGraphics] = useState(false);
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | undefined>();

  if (!open || !type) return null;

  const handleGenerate = async () => {
    try {
      setLoading(true);
      await onGenerate({
        type,
        entityId,
        dateRange,
        includeGraphics,
        language
      });
    } catch (error) {
      console.error('Erreur génération:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'project': return 'Projet';
      case 'activity': return 'Activité';
      case 'user': return 'Utilisateur';
      case 'global': return 'Global';
      default: return type;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Générer le rapport
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <h4 className="font-medium text-gray-900">
              Rapport {getTypeLabel(type)}
            </h4>
            {entityTitle && (
              <p className="text-sm text-gray-600 mt-1">
                {entityTitle}
              </p>
            )}
          </div>

          {/* Options */}
          <div className="space-y-4">
            {/* Période */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Période (optionnel)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={dateRange?.start || ''}
                  onChange={(e) => setDateRange(prev => ({
                    start: e.target.value,
                    end: prev?.end || ''
                  }))}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Date début"
                />
                <input
                  type="date"
                  value={dateRange?.end || ''}
                  onChange={(e) => setDateRange(prev => ({
                    start: prev?.start || '',
                    end: e.target.value
                  }))}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Date fin"
                />
              </div>
            </div>

            {/* Langue */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Langue
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'fr' | 'en')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>

            {/* Options */}
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeGraphics}
                  onChange={(e) => setIncludeGraphics(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">
                  Inclure les graphiques et statistiques
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Download className="h-4 w-4" />
            )}
            {loading ? 'Génération...' : 'Générer'}
          </button>
        </div>
      </div>
    </div>
  );
};
export { ReportGenerationModal };