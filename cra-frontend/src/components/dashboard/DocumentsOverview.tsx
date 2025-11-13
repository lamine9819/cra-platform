// src/components/dashboard/DocumentsOverview.tsx
import React from 'react';
import { FileText } from 'lucide-react';
import { DocumentStats } from '../../services/dashboard.api';

interface DocumentsOverviewProps {
  documents: DocumentStats;
  onViewAll: () => void;
}

const DocumentsOverview: React.FC<DocumentsOverviewProps> = ({
  documents,
  onViewAll
}) => {
  const typeLabels = {
    RAPPORT: 'Rapport',
    FICHE_ACTIVITE: 'Fiche activité',
    FICHE_TECHNIQUE: 'Fiche technique',
    DONNEES_EXPERIMENTALES: 'Données exp.',
    FORMULAIRE: 'Formulaire',
    IMAGE: 'Image',
    AUTRE: 'Autre'
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'RAPPORT': return 'bg-blue-100 text-blue-800';
      case 'FICHE_ACTIVITE': return 'bg-green-100 text-green-800';
      case 'FICHE_TECHNIQUE': return 'bg-purple-100 text-purple-800';
      case 'DONNEES_EXPERIMENTALES': return 'bg-orange-100 text-orange-800';
      case 'FORMULAIRE': return 'bg-yellow-100 text-yellow-800';
      case 'IMAGE': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
        <button
          onClick={onViewAll}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Voir tout →
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">{documents.total}</div>
          <div className="text-xs text-gray-600">Total</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">{documents.userDocuments}</div>
          <div className="text-xs text-gray-600">Mes docs</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">{documents.totalSizeMB} MB</div>
          <div className="text-xs text-gray-600">Taille</div>
        </div>
      </div>

      {/* Répartition par type */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Répartition par type</h4>
        <div className="flex flex-wrap gap-1">
          {Object.entries(documents.byType)
            .filter(([_, count]) => count > 0)
            .map(([type, count]) => (
              <span
                key={type}
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(type)}`}
              >
                {typeLabels[type as keyof typeof typeLabels]}: {count}
              </span>
            ))}
        </div>
      </div>

      {/* Documents récents */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Documents récents</h4>
        <div className="space-y-2">
          {documents.recentDocuments.slice(0, 3).map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {doc.title}
                  </div>
                  <div className="text-xs text-gray-600">
                    {formatFileSize(doc.size)} • {doc.owner.firstName} {doc.owner.lastName}
                  </div>
                </div>
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(doc.type)}`}>
                {typeLabels[doc.type as keyof typeof typeLabels]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default DocumentsOverview;