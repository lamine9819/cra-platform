// src/pages/chercheur/Formations.tsx
import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  Users,
  FileText,
  Plus,
  Download,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import {
  useShortTrainingsReceived,
  useDiplomaticTrainingsReceived,
  useTrainingsGiven,
  useSupervisions,
  useDownloadFormationReport,
} from '../../hooks/formations/useFormations';
import { ShortTrainingsReceivedList } from '../../components/formations/ShortTrainingsReceivedList';
import { DiplomaticTrainingsReceivedList } from '../../components/formations/DiplomaticTrainingsReceivedList';
import { TrainingsGivenList } from '../../components/formations/TrainingsGivenList';
import { SupervisionsList } from '../../components/formations/SupervisionsList';

type TabType = 'short-received' | 'diplomatic-received' | 'given' | 'supervisions';

const Formations: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('short-received');

  // Charger les données
  const { data: shortTrainings, isLoading: isLoadingShort } = useShortTrainingsReceived();
  const { data: diplomaticTrainings, isLoading: isLoadingDiplomatic } = useDiplomaticTrainingsReceived();
  const { data: trainingsGiven, isLoading: isLoadingGiven } = useTrainingsGiven();
  const { data: supervisions, isLoading: isLoadingSupervisions } = useSupervisions();

  const downloadReportMutation = useDownloadFormationReport();

  const tabs = [
    {
      id: 'short-received' as TabType,
      label: 'Formations courtes reçues',
      icon: BookOpen,
      count: shortTrainings?.length || 0,
    },
    {
      id: 'diplomatic-received' as TabType,
      label: 'Formations diplômantes reçues',
      icon: GraduationCap,
      count: diplomaticTrainings?.length || 0,
    },
    {
      id: 'given' as TabType,
      label: 'Formations dispensées',
      icon: Users,
      count: trainingsGiven?.length || 0,
    },
    {
      id: 'supervisions' as TabType,
      label: 'Encadrements',
      icon: FileText,
      count: supervisions?.length || 0,
    },
  ];

  const handleDownloadReport = () => {
    downloadReportMutation.mutate();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <GraduationCap className="w-8 h-8 mr-3 text-green-600" />
              Mes Formations
            </h1>
            <p className="text-gray-600 mt-2">
              Gérez vos formations reçues, dispensées et vos encadrements
            </p>
          </div>
          <Button
            onClick={handleDownloadReport}
            disabled={downloadReportMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            {downloadReportMutation.isPending ? 'Téléchargement...' : 'Télécharger mon rapport'}
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Formations courtes</p>
              <p className="text-2xl font-bold text-gray-900">{shortTrainings?.length || 0}</p>
            </div>
            <BookOpen className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Formations diplômantes</p>
              <p className="text-2xl font-bold text-gray-900">{diplomaticTrainings?.length || 0}</p>
            </div>
            <GraduationCap className="w-10 h-10 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Formations dispensées</p>
              <p className="text-2xl font-bold text-gray-900">{trainingsGiven?.length || 0}</p>
            </div>
            <Users className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Encadrements</p>
              <p className="text-2xl font-bold text-gray-900">{supervisions?.length || 0}</p>
            </div>
            <FileText className="w-10 h-10 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                    ${
                      isActive
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon
                    className={`
                      -ml-0.5 mr-2 h-5 w-5
                      ${isActive ? 'text-green-500' : 'text-gray-400 group-hover:text-gray-500'}
                    `}
                  />
                  {tab.label}
                  {tab.count > 0 && (
                    <span
                      className={`
                        ml-3 py-0.5 px-2.5 rounded-full text-xs font-medium
                        ${
                          isActive
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-900'
                        }
                      `}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenu des onglets */}
        <div className="p-6">
          {activeTab === 'short-received' && (
            <ShortTrainingsReceivedList
              trainings={shortTrainings || []}
              isLoading={isLoadingShort}
            />
          )}

          {activeTab === 'diplomatic-received' && (
            <DiplomaticTrainingsReceivedList
              trainings={diplomaticTrainings || []}
              isLoading={isLoadingDiplomatic}
            />
          )}

          {activeTab === 'given' && (
            <TrainingsGivenList
              trainings={trainingsGiven || []}
              isLoading={isLoadingGiven}
            />
          )}

          {activeTab === 'supervisions' && (
            <SupervisionsList
              supervisions={supervisions || []}
              isLoading={isLoadingSupervisions}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Formations;
