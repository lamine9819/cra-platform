// src/pages/admin/StrategicPlanningManagement.tsx
import React, { useState, useEffect } from 'react';
import { Target, MapPin, Briefcase, Lightbulb, Building2, BarChart3, Layers, GitBranch } from 'lucide-react';
import { strategicPlanningApi } from '../../services/strategicPlanningApi';
import { StrategicPlanningStats } from '../../types/strategic-planning.types';
import { toast } from 'react-hot-toast';
import StrategicPlansTab from '../../components/strategic-planning/StrategicPlansTab';
import StrategicAxesTab from '../../components/strategic-planning/StrategicAxesTab';
import StrategicSubAxesTab from '../../components/strategic-planning/StrategicSubAxesTab';
import ResearchProgramsTab from '../../components/strategic-planning/ResearchProgramsTab';
import ResearchThemesTab from '../../components/strategic-planning/ResearchThemesTab';
import ResearchStationsTab from '../../components/strategic-planning/ResearchStationsTab';

type Tab = 'plans' | 'axes' | 'subAxes' | 'programs' | 'themes' | 'stations' | 'stats';

const StrategicPlanningManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('plans');
  const [stats, setStats] = useState<StrategicPlanningStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Charger les statistiques
  const loadStats = async () => {
    try {
      setLoadingStats(true);
      const data = await strategicPlanningApi.getStrategicPlanningStats();
      setStats(data);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement des statistiques');
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const tabs = [
    { id: 'plans' as Tab, label: 'Plans Stratégiques', icon: Target },
    { id: 'axes' as Tab, label: 'Axes Stratégiques', icon: Layers },
    { id: 'subAxes' as Tab, label: 'Sous-Axes', icon: GitBranch },
    { id: 'programs' as Tab, label: 'Programmes', icon: Building2 },
    { id: 'themes' as Tab, label: 'Thèmes', icon: Lightbulb },
    { id: 'stations' as Tab, label: 'Stations', icon: MapPin },
    { id: 'stats' as Tab, label: 'Statistiques', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Planification Stratégique</h1>
        <p className="text-gray-600 mt-1">
          Gérez la planification stratégique de la recherche
        </p>
      </div>

      {/* Statistics Cards */}
      {!loadingStats && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Plans Actifs</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.activePlans}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Target className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Axes</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.totalAxes}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Briefcase className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Programmes</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.activePrograms}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Thèmes</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.activeThemes}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Lightbulb className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stations</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.activeStations}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="flex -mb-px min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 lg:px-6 py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2 flex-shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'plans' && <StrategicPlansTab onUpdate={loadStats} />}
          {activeTab === 'axes' && <StrategicAxesTab />}
          {activeTab === 'subAxes' && <StrategicSubAxesTab />}
          {activeTab === 'programs' && <ResearchProgramsTab />}
          {activeTab === 'themes' && <ResearchThemesTab />}
          {activeTab === 'stations' && <ResearchStationsTab onUpdate={loadStats} />}
          {activeTab === 'stats' && stats && <StatsView stats={stats} />}
        </div>
      </div>
    </div>
  );
};

// Composant pour afficher les statistiques détaillées
const StatsView: React.FC<{ stats: StrategicPlanningStats }> = ({ stats }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Plans Stratégiques */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Target className="h-8 w-8 text-green-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Plans Stratégiques</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total</span>
              <span className="text-2xl font-bold text-gray-900">{stats.totalPlans}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Actifs</span>
              <span className="text-2xl font-bold text-green-600">{stats.activePlans}</span>
            </div>
          </div>
        </div>

        {/* Axes et Sous-axes */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Briefcase className="h-8 w-8 text-blue-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Structure</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Axes Stratégiques</span>
              <span className="text-2xl font-bold text-gray-900">{stats.totalAxes}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Sous-axes</span>
              <span className="text-2xl font-bold text-blue-600">{stats.totalSubAxes}</span>
            </div>
          </div>
        </div>

        {/* Programmes */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Building2 className="h-8 w-8 text-purple-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Programmes de Recherche</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total</span>
              <span className="text-2xl font-bold text-gray-900">{stats.totalPrograms}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Actifs</span>
              <span className="text-2xl font-bold text-purple-600">{stats.activePrograms}</span>
            </div>
          </div>
        </div>

        {/* Thèmes */}
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Lightbulb className="h-8 w-8 text-yellow-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Thèmes de Recherche</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total</span>
              <span className="text-2xl font-bold text-gray-900">{stats.totalThemes}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Actifs</span>
              <span className="text-2xl font-bold text-yellow-600">{stats.activeThemes}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stations */}
      <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <MapPin className="h-8 w-8 text-red-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">Stations de Recherche</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total</span>
            <span className="text-2xl font-bold text-gray-900">{stats.totalStations}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Actives</span>
            <span className="text-2xl font-bold text-red-600">{stats.activeStations}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategicPlanningManagement;