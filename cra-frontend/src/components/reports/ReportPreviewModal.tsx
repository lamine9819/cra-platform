// src/components/reports/ReportPreviewModal.tsx
import React from 'react';
import { X, FileText, Download } from 'lucide-react';
import { ReportPreview } from '../../services/reportsApi';

interface ReportPreviewModalProps {
  open: boolean;
  onClose: () => void;
  preview?: ReportPreview;
  onGenerate: () => void;
}

const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({
  open,
  onClose,
  preview,
  onGenerate
}) => {
  if (!open || !preview) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Prévisualisation du Rapport
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="space-y-6">
            {/* Informations générales */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                {preview.title}
              </h4>
              {preview.creator && (
                <p className="text-sm text-gray-600">
                  Créateur: {preview.creator}
                </p>
              )}
              {preview.projectCreator && (
                <p className="text-sm text-gray-600">
                  Responsable projet: {preview.projectCreator}
                </p>
              )}
              {preview.role && (
                <p className="text-sm text-gray-600">
                  Rôle: {preview.role}
                </p>
              )}
              {preview.department && (
                <p className="text-sm text-gray-600">
                  Département: {preview.department}
                </p>
              )}
            </div>

            {/* Résumé */}
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Résumé</h5>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(preview.summary).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </p>
                    <p className="text-lg font-semibold text-gray-900">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sections */}
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Sections incluses</h5>
              <ul className="space-y-1">
                {preview.sections.map((section, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    {section}
                  </li>
                ))}
              </ul>
            </div>

            {/* Estimation */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Pages estimées:</strong> {preview.estimatedPages}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Fermer
          </button>
          <button
            onClick={onGenerate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Générer le rapport
          </button>
        </div>
      </div>
    </div>
  );
};
export  {ReportPreviewModal};