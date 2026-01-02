// src/pages/chercheur/ChercheurDashboardOptimized.tsx
import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  CheckSquare,
  FileText,
  RefreshCw,
  Activity,
} from 'lucide-react';

import { useDashboard } from '../../hooks/useDashboard';
import ErrorMessage from '../../components/ui/ErrorMessage';


// Import des composants du dashboard
import {
  StatsCard,
  ProductivityScore
} from '../../components/dashboard';

interface DashboardErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const DashboardErrorFallback: React.FC<DashboardErrorFallbackProps> = ({ 
  error, 
  resetErrorBoundary 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <ErrorMessage
          message={`Une erreur inattendue s'est produite : ${error.message}`}
          onRetry={resetErrorBoundary}
        />
      </div>
    </div>
  );
};

const DashboardLoadingFallback: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Skeleton du header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-24 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-9 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Skeleton du score de productivité */}
      <div className="bg-gray-200 rounded-lg h-32 animate-pulse"></div>

      {/* Skeleton des cartes de stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-24 animate-pulse"></div>
        ))}
      </div>

      {/* Skeleton des graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-200 rounded-lg h-80 animate-pulse"></div>
        <div className="bg-gray-200 rounded-lg h-80 animate-pulse"></div>
      </div>
    </div>
  );
};

const ChercheurDashboardOptimized: React.FC = () => {
  const navigate = useNavigate();
  const {
    dashboardData,
    quickStats,
    performanceMetrics,
    loading,
    refreshing,
    error,
    period,
    setPeriod,
    refresh,
    clearError,
    lastUpdated
  } = useDashboard({
    autoRefresh: true,
    refreshInterval: 5 * 60 * 1000, // 5 minutes
    initialPeriod: 'month'
  });

  // Affichage des erreurs critiques
  if (error && !dashboardData) {
    return (
      <div className="p-6">
        <ErrorMessage
          message={error}
          onRetry={refresh}
          className="max-w-2xl mx-auto"
        />
      </div>
    );
  }

  // Affichage du chargement initial
  if (loading && !dashboardData) {
    return (
      <div className="p-6">
        <DashboardLoadingFallback />
      </div>
    );
  }

  return (
    <ErrorBoundary
      FallbackComponent={DashboardErrorFallback}
      onReset={() => {
        clearError();
        refresh();
      }}
    >
      <div className="space-y-6">
       
        {/* En-tête du dashboard */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {dashboardData?.user ? 
                `Bonjour, ${dashboardData.user.firstName} ${dashboardData.user.lastName}` : 
                'Dashboard Chercheur'
              }
            </h1>
            <p className="text-gray-600">
              Voici un aperçu de votre activité de recherche
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Bouton d'action */}
            <button
              onClick={refresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>
        </div>

        {/* Contenu principal */}
        {dashboardData && quickStats && performanceMetrics ? (
          <Suspense fallback={<DashboardLoadingFallback />}>
            <DashboardContent
              dashboardData={dashboardData}
              quickStats={quickStats}
              performanceMetrics={performanceMetrics}
              navigate={navigate}
              lastUpdated={lastUpdated}
            />
          </Suspense>
        ) : (
          <DashboardLoadingFallback />
        )}
      </div>
    </ErrorBoundary>
  );
};

// Composant de contenu séparé pour optimiser les re-renders
interface DashboardContentProps {
  dashboardData: any;
  quickStats: any;
  performanceMetrics: any;
  navigate: any;
  lastUpdated: Date | null;
}

const DashboardContent: React.FC<DashboardContentProps> = React.memo(({
  dashboardData,
  quickStats,
  performanceMetrics,
  navigate,
  lastUpdated
}) => {
  return (
    <>
      {/* Score de productivité */}
      {dashboardData.summary && (
        <ProductivityScore 
          score={dashboardData.summary.productivityScore}
          trending={dashboardData.summary.trending}
          metrics={{
            taskCompletion: dashboardData.summary.taskCompletionRate,
            projectParticipation: dashboardData.summary.projectParticipation,
            documentContribution: dashboardData.summary.documentContribution,
            formEngagement: dashboardData.summary.formEngagement
          }}
        />
      )}

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Projets actifs"
          value={quickStats.activeProjects || 0}
          icon={Briefcase}
          color="blue"
          subtitle="projets en cours"
          onClick={() => navigate('/chercheur/projects')}
        />

        <StatsCard
          title="Tâches actives"
          value={quickStats.activeTasks || 0}
          icon={CheckSquare}
          color="green"
          subtitle="tâches à traiter"
          onClick={() => navigate('/chercheur/activities')}
          trend={performanceMetrics.taskTrend?.direction}
          trendValue={performanceMetrics.taskTrend?.change}
        />

        <StatsCard
          title="Mes activités"
          value={dashboardData.activities?.total || 0}
          icon={Activity}
          color="orange"
          subtitle="activités totales"
          onClick={() => navigate('/chercheur/activities')}
        />

        <StatsCard
          title="Mes documents"
          value={quickStats.myDocuments || 0}
          icon={FileText}
          color="purple"
          subtitle="documents créés"
          onClick={() => navigate('/chercheur/documents')}
        />
      </div>

      {/* Informations de mise à jour */}
      {lastUpdated && (
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600">
            Dernière mise à jour : {lastUpdated.toLocaleString('fr-FR')}
          </p>
        </div>
      )}
    </>
  );
});

DashboardContent.displayName = 'DashboardContent';

export default ChercheurDashboardOptimized;