// src/pages/chercheur/ReportsPage.tsx
import React from 'react';
import { FileBarChart, Download, FileText, BarChart3 } from 'lucide-react';

const ReportsPage: React.FC = () => {
  const handleGenerateReport = (reportType: string) => {
    // Cette fonction sera implémentée pour appeler l'API de rapports
    console.log(`Génération du rapport: ${reportType}`);
    // TODO: Appel à l'API /api/reports
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-bold text-gray-900">Rapports</h1>
        <p className="mt-2 text-sm text-gray-600">
          Générez et téléchargez des rapports sur les activités et projets de recherche
        </p>
      </div>

      {/* Info coordinateur */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <FileBarChart className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              En tant que coordinateur, vous avez accès aux rapports détaillés sur l'ensemble de la plateforme.
            </p>
          </div>
        </div>
      </div>

      {/* Types de rapports disponibles */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Rapport d'activités */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Rapport d'Activités
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    Vue d'ensemble de toutes les activités
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-3">
            <button
              onClick={() => handleGenerateReport('activities')}
              className="text-sm font-medium text-green-700 hover:text-green-900 flex items-center"
            >
              <Download className="h-4 w-4 mr-1" />
              Générer le rapport
            </button>
          </div>
        </div>

        {/* Rapport de projets */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Rapport de Projets
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    Statistiques sur tous les projets
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-3">
            <button
              onClick={() => handleGenerateReport('projects')}
              className="text-sm font-medium text-blue-700 hover:text-blue-900 flex items-center"
            >
              <Download className="h-4 w-4 mr-1" />
              Générer le rapport
            </button>
          </div>
        </div>

        {/* Rapport de publications */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Rapport de Publications
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    Liste des publications scientifiques
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-3">
            <button
              onClick={() => handleGenerateReport('publications')}
              className="text-sm font-medium text-purple-700 hover:text-purple-900 flex items-center"
            >
              <Download className="h-4 w-4 mr-1" />
              Générer le rapport
            </button>
          </div>
        </div>
      </div>

      {/* Information supplémentaire */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">À propos des rapports</h2>
        <p className="text-sm text-gray-600 mb-4">
          Les rapports sont générés au format PDF et incluent les données les plus récentes.
          Ils peuvent être utilisés pour des présentations, des bilans ou des analyses.
        </p>
        <p className="text-sm text-gray-500">
          <strong>Note :</strong> La génération de rapports détaillés peut prendre quelques secondes selon la quantité de données.
        </p>
      </div>
    </div>
  );
};

export default ReportsPage;
