// src/pages/chercheur/ChercheurDashboardOptimized.tsx
import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useNavigate } from 'react-router-dom';
import { 
   
  Briefcase, 
  CheckSquare, 
  FileText, 
  AlertCircle,
  RefreshCw,
  Filter,
  Download,
 
} from 'lucide-react';

import { useDashboard } from '../../hooks/useDashboard';
import ErrorMessage from '../../components/ui/ErrorMessage';


// Import des composants du dashboard
import { 
  StatsCard, 
  ProductivityScore, 
  PerformanceChart, 
  TasksOverview, 
  ProjectsOverview, 
  RecentActivities, 
  DocumentsOverview 
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

const handleExportData = async () => {
  try {
    if (!dashboardData) return;
    
    // Préparer les données CSV
    const csvData = [
      ['Métrique', 'Valeur', 'Catégorie'],
      
      // Informations utilisateur
      ['Nom complet', `${dashboardData.user.firstName} ${dashboardData.user.lastName}`, 'Utilisateur'],
      ['Rôle', dashboardData.user.role, 'Utilisateur'],
      ['Département', dashboardData.user.department || 'Non spécifié', 'Utilisateur'],
      
      // Score de productivité
      ['Score de productivité', `${dashboardData.summary.productivityScore}%`, 'Performance'],
      ['Taux completion tâches', `${dashboardData.summary.taskCompletionRate}%`, 'Performance'],
      ['Participation projets', `${dashboardData.summary.projectParticipation}%`, 'Performance'],
      ['Contribution documents', `${dashboardData.summary.documentContribution}%`, 'Performance'],
      ['Engagement formulaires', `${dashboardData.summary.formEngagement}%`, 'Performance'],
      
      // Statistiques générales
      ['Total projets', dashboardData.projects.total.toString(), 'Projets'],
      ['Mes projets', dashboardData.projects.userProjects.toString(), 'Projets'],
      ['Projets planifiés', dashboardData.projects.byStatus.PLANIFIE.toString(), 'Projets'],
      ['Projets en cours', dashboardData.projects.byStatus.EN_COURS.toString(), 'Projets'],
      ['Projets terminés', dashboardData.projects.byStatus.TERMINE.toString(), 'Projets'],
      
      // Tâches
      ['Total tâches', dashboardData.tasks.total.toString(), 'Tâches'],
      ['Tâches à faire', dashboardData.tasks.byStatus.A_FAIRE.toString(), 'Tâches'],
      ['Tâches en cours', dashboardData.tasks.byStatus.EN_COURS.toString(), 'Tâches'],
      ['Tâches terminées', dashboardData.tasks.byStatus.TERMINEE.toString(), 'Tâches'],
      ['Tâches en retard', dashboardData.tasks.overdue.toString(), 'Tâches'],
      ['Tâches dues aujourd\'hui', dashboardData.tasks.dueToday.toString(), 'Tâches'],
      ['Tâches dues cette semaine', dashboardData.tasks.dueThisWeek.toString(), 'Tâches'],
      
      // Documents
      ['Total documents', dashboardData.documents.total.toString(), 'Documents'],
      ['Mes documents', dashboardData.documents.userDocuments.toString(), 'Documents'],
      ['Documents partagés', dashboardData.documents.sharedWithUser.toString(), 'Documents'],
      ['Taille totale (MB)', dashboardData.documents.totalSizeMB.toString(), 'Documents'],
      
      // Activités
      ['Total activités', dashboardData.activities.total.toString(), 'Activités'],
      ['Activités avec résultats', dashboardData.activities.withResults.toString(), 'Activités'],
      ['Moyenne par mois', dashboardData.activities.averagePerMonth.toString(), 'Activités'],
    ];

    // Ajouter les données de formulaires si disponibles
    if (dashboardData.forms) {
      if (dashboardData.forms.created) {
        csvData.push(
          ['Formulaires créés', dashboardData.forms.created.total.toString(), 'Formulaires'],
          ['Formulaires actifs', dashboardData.forms.created.active.toString(), 'Formulaires'],
          ['Réponses reçues', dashboardData.forms.created.totalResponses.toString(), 'Formulaires'],
          ['Moyenne réponses/formulaire', dashboardData.forms.created.averageResponsesPerForm.toString(), 'Formulaires']
        );
      }
      
      if (dashboardData.forms.participation) {
        csvData.push(
          ['Formulaires à compléter', dashboardData.forms.participation.formsToComplete.toString(), 'Formulaires'],
          ['Réponses soumises', dashboardData.forms.participation.responsesSubmitted.toString(), 'Formulaires']
        );
      }
    }

    // Ajouter les métriques de performance si disponibles
    if (performanceMetrics) {
      csvData.push(
        ['Tâches ce mois', performanceMetrics.taskTrend.thisMonth.toString(), 'Tendances'],
        ['Tâches mois dernier', performanceMetrics.taskTrend.lastMonth.toString(), 'Tendances'],
        ['Évolution tâches (%)', performanceMetrics.taskTrend.change.toString(), 'Tendances'],
        ['Activités ce mois', performanceMetrics.activityTrend.thisMonth.toString(), 'Tendances'],
        ['Activités mois dernier', performanceMetrics.activityTrend.lastMonth.toString(), 'Tendances'],
        ['Évolution activités (%)', performanceMetrics.activityTrend.change.toString(), 'Tendances']
      );
    }

    // Convertir en CSV
    const csvString = csvData.map(row => 
      row.map(cell => {
        // Échapper les guillemets et encapsuler si nécessaire
        if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      }).join(',')
    ).join('\n');

    // Créer et télécharger le fichier
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    const filename = `dashboard_chercheur_${timestamp}.csv`;
    
    const dataBlob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
  } catch (err) {
    console.error('Erreur lors de l\'export CSV:', err);
    alert('Erreur lors de l\'export des données');
  }
};

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
            {/* Sélecteur de période */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as any)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="quarter">Ce trimestre</option>
                <option value="year">Cette année</option>
              </select>
            </div>

            {/* Boutons d'action */}
            <button
              onClick={refresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </button>

            <button
              onClick={handleExportData}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              <Download className="h-4 w-4" />
              Exporter
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
          onClick={() => navigate('/chercheur/tasks')}
          trend={performanceMetrics.taskTrend?.direction}
          trendValue={performanceMetrics.taskTrend?.change}
        />
        
        <StatsCard
          title="Mes documents"
          value={quickStats.myDocuments || 0}
          icon={FileText}
          color="purple"
          subtitle="documents créés"
          onClick={() => navigate('/chercheur/documents')}
        />
        
        <StatsCard
          title="Notifications"
          value={quickStats.unreadNotifications || 0}
          icon={AlertCircle}
          color={quickStats.unreadNotifications > 0 ? "red" : "gray"}
          subtitle="non lues"
          onClick={() => navigate('/chercheur/notifications')}
        />
      </div>

      {/* Graphiques et métriques */}
      {performanceMetrics && dashboardData.activities && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PerformanceChart
            taskMetrics={performanceMetrics.taskTrend}
            activityMetrics={performanceMetrics.activityTrend}
            period="month"
          />
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Activités récentes
            </h3>
            <RecentActivities activities={dashboardData.activities.recentActivities || []} />
          </div>
        </div>
      )}

      {/* Vue d'ensemble des projets et tâches */}
      {dashboardData.projects && dashboardData.tasks && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProjectsOverview
            projects={dashboardData.projects}
            onViewAll={() => navigate('/chercheur/projects')}
            onCreateNew={() => navigate('/chercheur/projects/new')}
          />
          
          <TasksOverview
            tasks={dashboardData.tasks}
            onViewAll={() => navigate('/chercheur/tasks')}
            onCreateNew={() => navigate('/chercheur/tasks/new')}
          />
        </div>
      )}

      {/* Documents et formulaires */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {dashboardData.documents && (
          <DocumentsOverview
            documents={dashboardData.documents}
            onViewAll={() => navigate('/chercheur/documents')}
          />
        )}
        
        {/* Formulaires - Section conditionnelle selon le rôle */}
        {dashboardData.forms && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Formulaires
              </h3>
              <button
                onClick={() => navigate('/chercheur/forms')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Voir tout →
              </button>
            </div>
            
            {dashboardData.forms.created && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Formulaires créés</span>
                  <span className="text-lg font-semibold">{dashboardData.forms.created.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Réponses reçues</span>
                  <span className="text-lg font-semibold">{dashboardData.forms.created.totalResponses}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Moyenne par formulaire</span>
                  <span className="text-lg font-semibold">{dashboardData.forms.created.averageResponsesPerForm}</span>
                </div>
              </div>
            )}
            
            {dashboardData.forms.participation && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">À compléter</span>
                  <span className="text-lg font-semibold text-orange-600">
                    {dashboardData.forms.participation.formsToComplete}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Réponses soumises</span>
                  <span className="text-lg font-semibold text-green-600">
                    {dashboardData.forms.participation.responsesSubmitted}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
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