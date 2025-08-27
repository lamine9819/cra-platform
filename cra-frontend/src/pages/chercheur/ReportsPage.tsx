// src/pages/chercheur/ReportsPage.tsx - VERSION CORRIGÉE
import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Eye,
  BarChart3,
  Users,
  Activity,
  CheckSquare,
  FolderOpen,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { 
  ReportPreview, 
} from '../../services/reportsApi';
import { Project } from '../../services/projectsApi';
import { Activity as ActivityType } from '../../services/activitiesApi';
import { User } from '../../services/usersApi';
import { useReportsPage } from '../../hooks/useReports';

// Composants
import {
  ReportPreviewModal,
  ReportGenerationModal,
  ReportStatsCard
} from '../../components/reports';

const ReportsPage: React.FC = () => {
  // Utiliser le hook combiné pour les données des rapports
  const { templates, stats, history, reports } = useReportsPage();
  
  // État local pour les projets, activités et utilisateur
  const [projects, setProjects] = useState<Project[]>([]);
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtres
  const [selectedPeriod, setSelectedPeriod] = useState<number>(30);
  const [selectedTemplateType, setSelectedTemplateType] = useState<string>('');

  // Modales
  const [previewModal, setPreviewModal] = useState<{
    open: boolean;
    data?: ReportPreview;
    type?: string;
    entityId?: string;
  }>({ open: false });
  
  const [generationModal, setGenerationModal] = useState<{
    open: boolean;
    type?: string;
    entityId?: string;
    entityTitle?: string;
  }>({ open: false });

  // ✅ CORRECTION PRINCIPALE : Méthode unifiée pour récupérer l'utilisateur
  const getCurrentUserInfo = () => {
    console.log('🔍 Debug getCurrentUserInfo');
    
    // Méthode 1 : currentUser state (priorité)
    if (currentUser) {
      console.log('✅ Using currentUser state:', currentUser.id);
      return {
        id: currentUser.id,
        name: `${currentUser.firstName} ${currentUser.lastName}`,
        email: currentUser.email
      };
    }
    
    // Méthode 2 : ✅ CORRECTION - Utiliser la bonne clé localStorage
    try {
      const userStr = localStorage.getItem('cra_user_data'); // ✅ Bonne clé
      console.log('🔍 cra_user_data raw:', userStr);
      
      if (userStr) {
        const user = JSON.parse(userStr);
        console.log('🔍 cra_user_data parsed:', user);
        
        if (user && user.id) {
          console.log('✅ Using cra_user_data:', user.id);
          return {
            id: user.id,
            name: user.name || `${user.firstName} ${user.lastName}`,
            email: user.email
          };
        }
      }
    } catch (e) {
      console.error('❌ Error parsing cra_user_data:', e);
    }
    
    // Méthode 3 : Fallback avec d'autres clés possibles
    const fallbackKeys = ['user', 'authUser', 'currentUser'];
    for (const key of fallbackKeys) {
      try {
        const userStr = localStorage.getItem(key);
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user && user.id) {
            console.log(`✅ Fallback found user in ${key}:`, user.id);
            return {
              id: user.id,
              name: user.name || `${user.firstName} ${user.lastName}`,
              email: user.email
            };
          }
        }
      } catch (e) {
        console.warn(`❌ Error parsing ${key}:`, e);
      }
    }
    
    console.error('❌ Aucune donnée utilisateur trouvée');
    console.log('🔍 Available localStorage keys:', Object.keys(localStorage));
    return null;
  };

  // Charger les projets, activités et utilisateur actuel
  useEffect(() => {
    console.log('🔍 ReportsPage useEffect - Debug storage:');
    console.log('- localStorage keys:', Object.keys(localStorage));
    console.log('- cra_user_data:', localStorage.getItem('cra_user_data'));
    console.log('- cra_auth_token:', localStorage.getItem('cra_auth_token') ? 'Present' : 'Missing');
    
    loadProjectsAndActivities();
    loadCurrentUser();
  }, []);

  // Recharger les stats quand la période change
  useEffect(() => {
    if (selectedPeriod && stats.refetch) {
      stats.refetch(selectedPeriod);
    }
  }, [selectedPeriod]);

  // ✅ CORRECTION : loadCurrentUser simplifié
  const loadCurrentUser = async () => {
    try {
      // Récupérer l'utilisateur actuel avec la méthode corrigée
      const userInfo = getCurrentUserInfo();
      if (!userInfo?.id) {
        console.warn('Aucun utilisateur connecté trouvé');
        return;
      }

      console.log('🔍 Loading user details for ID:', userInfo.id);

      // Import dynamique pour éviter les dépendances circulaires
      const { default: usersApi } = await import('../../services/usersApi');
      const user = await usersApi.getUserById(userInfo.id);
      setCurrentUser(user);
      console.log('✅ User loaded successfully:', user);
    } catch (err: any) {
      console.error('❌ Erreur lors du chargement de l\'utilisateur:', err);
      // Ne pas bloquer l'interface pour cette erreur
    }
  };

  const loadProjectsAndActivities = async () => {
    try {
      setLoading(true);
      setError(null);

      // Import dynamique pour éviter les dépendances circulaires
      const [{ default: projectsApi }, { default: activitiesApi }] = await Promise.all([
        import('../../services/projectsApi'),
        import('../../services/activitiesApi')
      ]);

      const [projectsRes, activitiesRes] = await Promise.all([
        projectsApi.listProjects({ limit: 10, sortBy: 'updatedAt', sortOrder: 'desc' }),
        activitiesApi.listActivities({ limit: 10, sortBy: 'updatedAt', sortOrder: 'desc' })
      ]);

      setProjects(projectsRes.projects);
      setActivities(activitiesRes.activities);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ CORRECTION : Actions avec logging et gestion d'erreurs améliorée
  const handlePreviewReport = async (type: string, entityId?: string) => {
    try {
      console.log(`🔍 handlePreviewReport - type: ${type}, entityId: ${entityId}`);
      
      // Pour les templates sans entityId, on doit gérer différemment
      if (!entityId) {
        switch (type) {
          case 'project':
            if (projects.length > 0) {
              entityId = projects[0].id;
              console.log('✅ Using first project ID:', entityId);
            } else {
              alert('Aucun projet disponible pour la prévisualisation. Créez d\'abord un projet.');
              return;
            }
            break;
          case 'activity':
            if (activities.length > 0) {
              entityId = activities[0].id;
              console.log('✅ Using first activity ID:', entityId);
            } else {
              alert('Aucune activité disponible pour la prévisualisation. Créez d\'abord une activité.');
              return;
            }
            break;
          case 'user':
            const currentUserInfo = getCurrentUserInfo();
            if (currentUserInfo?.id) {
              entityId = currentUserInfo.id;
              console.log('✅ Using current user ID for preview:', entityId);
            } else {
              alert('Impossible de récupérer les informations utilisateur. Veuillez vous reconnecter.');
              return;
            }
            break;
          case 'global':
            // Le rapport global n'a pas besoin d'entityId
            console.log('✅ Global report - no entityId needed');
            break;
          default:
            alert('Type de rapport non reconnu.');
            return;
        }
      }

      console.log(`🚀 Starting preview for ${type} with entityId: ${entityId}`);
      const preview = await reports.previewReport(type, entityId);
      console.log('✅ Preview successful:', preview);
      
      setPreviewModal({
        open: true,
        data: preview,
        type,
        entityId
      });
    } catch (err: any) {
      console.error('❌ Erreur prévisualisation:', err);
      console.error('❌ Full error object:', err);
      alert(`Erreur lors de la prévisualisation: ${err.message || 'Erreur inconnue'}`);
    }
  };

  const handleGenerateReport = (type: string, entityId?: string, entityTitle?: string) => {
    console.log(`🔍 handleGenerateReport - type: ${type}, entityId: ${entityId}`);
    
    // Même logique pour la génération
    if (!entityId && type !== 'global') {
      switch (type) {
        case 'project':
          if (projects.length > 0) {
            entityId = projects[0].id;
            entityTitle = projects[0].title;
            console.log('✅ Using first project for generation:', entityId);
          } else {
            alert('Aucun projet disponible. Créez d\'abord un projet.');
            return;
          }
          break;
        case 'activity':
          if (activities.length > 0) {
            entityId = activities[0].id;
            entityTitle = activities[0].title;
            console.log('✅ Using first activity for generation:', entityId);
          } else {
            alert('Aucune activité disponible. Créez d\'abord une activité.');
            return;
          }
          break;
        case 'user':
          const currentUserInfo = getCurrentUserInfo();
          if (currentUserInfo?.id) {
            entityId = currentUserInfo.id;
            entityTitle = currentUserInfo.name;
            console.log('✅ Using current user for generation:', entityId);
          } else {
            alert('Impossible de récupérer les informations utilisateur. Veuillez vous reconnecter.');
            return;
          }
          break;
      }
    }

    setGenerationModal({
      open: true,
      type,
      entityId,
      entityTitle
    });
  };

  const handleDownloadReport = async (type: string, entityId?: string) => {
    try {
      console.log(`🔍 handleDownloadReport - type: ${type}, entityId: ${entityId}`);
      
      // Même logique pour le téléchargement direct
      if (!entityId && type !== 'global') {
        switch (type) {
          case 'project':
            if (projects.length > 0) {
              entityId = projects[0].id;
              console.log('✅ Using first project for download:', entityId);
            } else {
              alert('Aucun projet disponible.');
              return;
            }
            break;
          case 'activity':
            if (activities.length > 0) {
              entityId = activities[0].id;
              console.log('✅ Using first activity for download:', entityId);
            } else {
              alert('Aucune activité disponible.');
              return;
            }
            break;
          case 'user':
            const currentUserInfo = getCurrentUserInfo();
            if (currentUserInfo?.id) {
              entityId = currentUserInfo.id;
              console.log('✅ Using current user for download:', entityId);
            } else {
              alert('Impossible de récupérer les informations utilisateur. Veuillez vous reconnecter.');
              return;
            }
            break;
        }
      }

      console.log(`🚀 Starting download for ${type} with entityId: ${entityId}`);
      await reports.downloadReport(type, entityId);
      console.log('✅ Download successful');
      
      // Recharger l'historique après génération
      if (history.refetch) {
        await history.refetch();
      }
    } catch (err: any) {
      console.error('❌ Erreur téléchargement:', err);
      console.error('❌ Full error object:', err);
      alert(`Erreur lors du téléchargement: ${err.message || 'Erreur inconnue'}`);
    }
  };

  const handleExportData = async (type: 'users' | 'projects' | 'tasks' | 'documents') => {
    try {
      console.log(`🔍 handleExportData - type: ${type}`);
      await reports.exportData(type, 'xlsx');
      console.log('✅ Export successful');
    } catch (err: any) {
      console.error('❌ Erreur export:', err);
    }
  };

  // Loading global si les templates ne sont pas encore chargés
  if (templates.loading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const filteredTemplates = selectedTemplateType 
    ? (templates.templates || []).filter(t => t.type === selectedTemplateType)
    : (templates.templates || []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapports et Analyses</h1>
          <p className="text-gray-600 mt-1">
            Générez des rapports détaillés sur vos projets et activités
          </p>

        </div>
        
        <div className="flex gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value={7}>7 derniers jours</option>
            <option value={30}>30 derniers jours</option>
            <option value={90}>3 derniers mois</option>
            <option value={365}>Année courante</option>
          </select>
        </div>
      </div>

      {/* Message d'erreur */}
      {(error || templates.error || stats.error || history.error || reports.error) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-red-700">
            {error || templates.error || stats.error || history.error || reports.error}
          </span>
        </div>
      )}

      {/* Statistiques rapides */}
      {stats.stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ReportStatsCard
            title="Projets récents"
            value={stats.stats.recentActivity.projects}
            icon={FolderOpen}
            color="blue"
            subtitle={`${selectedPeriod} derniers jours`}
          />
          <ReportStatsCard
            title="Tâches créées"
            value={stats.stats.recentActivity.tasks}
            icon={CheckSquare}
            color="green"
            subtitle={`${selectedPeriod} derniers jours`}
          />
          <ReportStatsCard
            title="Documents ajoutés"
            value={stats.stats.recentActivity.documents}
            icon={FileText}
            color="purple"
            subtitle={`${selectedPeriod} derniers jours`}
          />
          <ReportStatsCard
            title="Formulaires"
            value={stats.stats.recentActivity.forms}
            icon={BarChart3}
            color="orange"
            subtitle={`${selectedPeriod} derniers jours`}
          />
        </div>
      )}

      {/* Templates de rapports */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Templates de Rapports
            </h2>
            <select
              value={selectedTemplateType}
              onChange={(e) => setSelectedTemplateType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Tous les types</option>
              <option value="project">Projets</option>
              <option value="activity">Activités</option>
              <option value="user">Utilisateur</option>
            </select>
          </div>
        </div>

        <div className="p-6">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucun template trouvé pour ce type</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 rounded-lg border bg-blue-50 text-blue-600 border-blue-200">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {template.name}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {template.description}
                      </p>
                      
                      {/* Indications sur l'entité qui sera utilisée */}
                      {template.type === 'project' && projects.length > 0 && (
                        <p className="text-xs text-blue-600 mt-2">
                          📋 Sera généré pour: {projects[0].title}
                        </p>
                      )}
                      {template.type === 'activity' && activities.length > 0 && (
                        <p className="text-xs text-green-600 mt-2">
                          🎯 Sera généré pour: {activities[0].title}
                        </p>
                      )}
                      {template.type === 'user' && (
                        <p className="text-xs text-purple-600 mt-2">
                          👤 Sera généré pour: {getCurrentUserInfo()?.name || 'Utilisateur actuel'}
                        </p>
                      )}
                      {template.type === 'global' && (
                        <p className="text-xs text-orange-600 mt-2">
                          🌍 Rapport global de la plateforme
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePreviewReport(template.type)}
                      disabled={reports.loading}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Eye className="h-4 w-4" />
                      Prévisualiser
                    </button>
                    <button
                      onClick={() => handleDownloadReport(template.type)}
                      disabled={reports.loading}
                      className="flex items-center justify-center gap-1 px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Download className="h-4 w-4" />
                      Télécharger
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Rapports par entité */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projets récents */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Projets Récents
            </h3>
          </div>
          <div className="p-4">
            {projects.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucun projet récent</p>
            ) : (
              <div className="space-y-3">
                {projects.slice(0, 5).map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {project.title}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {project._count?.activities || 0} activités • {project._count?.tasks || 0} tâches
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handlePreviewReport('project', project.id)}
                        className="p-1 text-gray-400 hover:text-blue-600 rounded"
                        title="Prévisualiser"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDownloadReport('project', project.id)}
                        className="p-1 text-gray-400 hover:text-green-600 rounded"
                        title="Télécharger"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Activités récentes */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activités Récentes
            </h3>
          </div>
          <div className="p-4">
            {activities.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucune activité récente</p>
            ) : (
              <div className="space-y-3">
                {activities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 truncate">
                        {activity.title}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {activity.project?.title} • {activity._count?.tasks || 0} tâches
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handlePreviewReport('activity', activity.id)}
                        className="p-1 text-gray-400 hover:text-blue-600 rounded"
                        title="Prévisualiser"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDownloadReport('activity', activity.id)}
                        className="p-1 text-gray-400 hover:text-green-600 rounded"
                        title="Télécharger"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Exports et historique */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exports rapides */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Exports Rapides
            </h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleExportData('projects')}
                disabled={reports.loading}
                className="p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <FolderOpen className="h-5 w-5 text-blue-600 mb-1" />
                <div className="text-sm font-medium text-blue-900">Projets</div>
                <div className="text-xs text-blue-700">Excel/CSV</div>
              </button>
              <button
                onClick={() => handleExportData('tasks')}
                disabled={reports.loading}
                className="p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <CheckSquare className="h-5 w-5 text-green-600 mb-1" />
                <div className="text-sm font-medium text-green-900">Tâches</div>
                <div className="text-xs text-green-700">Excel/CSV</div>
              </button>
              <button
                onClick={() => handleExportData('documents')}
                disabled={reports.loading}
                className="p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <FileText className="h-5 w-5 text-purple-600 mb-1" />
                <div className="text-sm font-medium text-purple-900">Documents</div>
                <div className="text-xs text-purple-700">Excel/CSV</div>
              </button>
              <button
                onClick={() => handleExportData('users')}
                disabled={reports.loading}
                className="p-3 text-left bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <Users className="h-5 w-5 text-orange-600 mb-1" />
                <div className="text-sm font-medium text-orange-900">Équipe</div>
                <div className="text-xs text-orange-700">Excel/CSV</div>
              </button>
            </div>
          </div>
        </div>

        {/* Historique récent */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Historique Récent
            </h3>
          </div>
          <div className="p-4">
            {!history.history || history.history.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucun historique</p>
            ) : (
              <div className="space-y-3">
                {history.history.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-2">
                    <div className={`p-1 rounded-full ${
                      item.details.success ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      <FileText className={`h-3 w-3 ${
                        item.details.success ? 'text-green-600' : 'text-red-600'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        Rapport {item.details.reportType}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString()} à {new Date(item.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.details.success 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {item.details.success ? 'Succès' : 'Erreur'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modales */}
      <ReportPreviewModal
        open={previewModal.open}
        onClose={() => setPreviewModal({ open: false })}
        preview={previewModal.data}
        onGenerate={() => {
          setPreviewModal({ open: false });
          handleGenerateReport(previewModal.type!, previewModal.entityId);
        }}
      />

      <ReportGenerationModal
        open={generationModal.open}
        onClose={() => setGenerationModal({ open: false })}
        type={generationModal.type}
        entityId={generationModal.entityId}
        entityTitle={generationModal.entityTitle}
        onGenerate={async (options) => {
          try {
            console.log('🚀 Generating report with options:', options);
            await reports.downloadReport(options.type, options.entityId);
            console.log('✅ Report generation successful');
            setGenerationModal({ open: false });
            if (history.refetch) {
              await history.refetch();
            }
          } catch (err) {
            console.error('❌ Erreur génération:', err);
          }
        }}
      />
    </div>
  );
};

export default ReportsPage;