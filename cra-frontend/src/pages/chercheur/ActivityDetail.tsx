// src/pages/chercheur/ActivityDetail.tsx
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Users,
  Target,
  FileText,
  TrendingUp,
  Clock,
  Copy,
  CheckCircle,
  RefreshCw,
  Download,
} from 'lucide-react';
import { activitiesApi } from '../../services/activitiesApi';
import { Button } from '../../components/ui/Button';
import ActivityParticipants from '../../components/activities/ActivityParticipants';
import ActivityPartnerships from '../../components/activities/ActivityPartnerships';
import ActivityFunding from '../../components/activities/ActivityFunding';
import ActivityTasks from '../../components/activities/ActivityTasks';
import ReconductActivityModal from '../../components/activities/ReconductActivityModal';
import toast from 'react-hot-toast';
import {
  ActivityTypeLabels,
  ActivityTypeColors,
  ActivityStatusLabels,
  ActivityStatusColors,
  ActivityLifecycleStatusLabels,
} from '../../types/activity.types';

type TabType = 'overview' | 'participants' | 'partnerships' | 'funding' | 'tasks';

const ActivityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showReconductModal, setShowReconductModal] = useState(false);

  // Empêcher le chargement si l'ID est "create" ou "edit" (routes réservées)
  const isValidId = id && id !== 'create' && id !== 'edit' && !id.includes('/');

  // Rediriger si l'ID n'est pas valide
  React.useEffect(() => {
    if (id === 'create') {
      console.log('ActivityDetail: ID invalide détecté (create), ne devrait pas être ici');
      // Ne pas naviguer, juste ignorer
      return;
    }
  }, [id]);

  const { data: activity, isLoading, error, refetch } = useQuery({
    queryKey: ['activity', id],
    queryFn: () => activitiesApi.getActivityById(id!),
    enabled: !!isValidId,
  });

  // Charger l'historique des reconductions
  const { data: recurrenceHistory } = useQuery({
    queryKey: ['activity-recurrence', id],
    queryFn: () => activitiesApi.getRecurrenceHistory(id!),
    enabled: !!isValidId && !!activity?.isRecurrent,
  });

  // Si l'ID n'est pas valide, ne rien afficher
  if (!isValidId) {
    return null;
  }

  const handleDelete = () => {
    toast((t) => (
      <div>
        <p className="font-medium mb-2">
          Voulez-vous vraiment supprimer cette activité ?
        </p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              try {
                await activitiesApi.deleteActivity(id!);
                toast.dismiss(t.id);
                toast.success('Activité supprimée avec succès');
                navigate('/chercheur/activities');
              } catch (error: any) {
                toast.dismiss(t.id);
                toast.error(error.message || 'Erreur lors de la suppression');
              }
            }}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Confirmer
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Annuler
          </button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  const handleDuplicate = async () => {
    try {
      toast.loading('Duplication en cours...');
      const duplicated = await activitiesApi.duplicateActivity(id!, {
        title: `${activity?.title} (Copie)`,
        copyParticipants: true,
        copyTasks: false,
        copyPartnerships: true,
        copyFundings: false,
      });
      toast.dismiss();
      toast.success('Activité dupliquée avec succès');
      navigate(`/chercheur/activities/${duplicated.id}`);
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message || 'Erreur lors de la duplication');
    }
  };

  const handleGenerateReport = async () => {
    try {
      toast.loading('Génération du rapport Word en cours...');
      await activitiesApi.generateReport(id!, 'word');
      toast.dismiss();
      toast.success('Rapport Word généré avec succès');
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message || 'Erreur lors de la génération du rapport');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-red-600">Erreur lors du chargement de l'activité</p>
          <Button onClick={() => refetch()} className="mt-4 bg-green-600 hover:bg-green-700">
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview' as TabType, label: 'Vue d\'ensemble', icon: FileText },
    { id: 'participants' as TabType, label: 'Participants', icon: Users, count: activity._count?.participants },
    { id: 'partnerships' as TabType, label: 'Partenariats', icon: TrendingUp, count: activity.partners?.length || 0 },
    { id: 'funding' as TabType, label: 'Financements', icon: Target, count: activity.fundings?.length || 0 },
    { id: 'tasks' as TabType, label: 'Tâches', icon: CheckCircle, count: activity._count?.tasks },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link to="/chercheur/activities" className="text-green-600 hover:text-green-700 flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux activités
        </Link>
      </div>

      {/* En-tête */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {activity.code && (
                <span className="text-sm text-gray-500 font-mono">{activity.code}</span>
              )}
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${ActivityTypeColors[activity.type]}`}>
                {ActivityTypeLabels[activity.type]}
              </span>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                activity.lifecycleStatus === 'NOUVELLE' ? 'bg-blue-100 text-blue-800' :
                activity.lifecycleStatus === 'RECONDUITE' ? 'bg-purple-100 text-purple-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                Cycle: {ActivityLifecycleStatusLabels[activity.lifecycleStatus]}
              </span>
              {activity.isRecurrent && (
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-800">
                  Récurrente ({activity.recurrenceCount})
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{activity.title}</h1>
            {activity.description && (
              <p className="text-gray-600">{activity.description}</p>
            )}
          </div>

          {/* Actions - Responsive Design */}
          <div className="flex flex-col sm:flex-row gap-2 lg:ml-4 min-w-fit">
            {/* Boutons principaux */}
            <div className="flex gap-2">
              <Link to={`/chercheur/activities/${id}/edit`} className="flex-1 sm:flex-none">
                <Button className="bg-green-600 hover:bg-green-700 text-white w-full">
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </Button>
              </Link>
              <Button
                onClick={handleDelete}
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-50 flex-1 sm:flex-none"
              >
                <Trash2 className="w-4 h-4 sm:mr-0 mr-2" />
                <span className="sm:hidden">Supprimer</span>
              </Button>
            </div>

            {/* Autres actions */}
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={handleGenerateReport}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50 flex-1 sm:flex-none"
              >
                <Download className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Rapport</span>
                <span className="sm:hidden">Rapport Word</span>
              </Button>

              <Button
                onClick={() => setShowReconductModal(true)}
                variant="outline"
                className="border-purple-600 text-purple-600 hover:bg-purple-50 flex-1 sm:flex-none"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reconduire
              </Button>

              <Button
                onClick={handleDuplicate}
                variant="outline"
                className="border-gray-600 text-gray-600 hover:bg-gray-50 flex-1 sm:flex-none"
              >
                <Copy className="w-4 h-4 mr-2" />
                Dupliquer
              </Button>
            </div>
          </div>
        </div>

        {/* Informations clés */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center text-gray-600">
            <Target className="w-5 h-5 mr-2 text-green-600" />
            <div>
              <p className="text-xs text-gray-500">Thème</p>
              <p className="font-medium">{activity.theme.name}</p>
            </div>
          </div>
          <div className="flex items-center text-gray-600">
            <Users className="w-5 h-5 mr-2 text-green-600" />
            <div>
              <p className="text-xs text-gray-500">Responsable</p>
              <p className="font-medium">
                {activity.responsible.firstName} {activity.responsible.lastName}
              </p>
            </div>
          </div>
          {(activity.startDate || activity.endDate) && (
            <div className="flex items-center text-gray-600">
              <Calendar className="w-5 h-5 mr-2 text-green-600" />
              <div>
                <p className="text-xs text-gray-500">Période</p>
                <p className="font-medium">
                  {activity.startDate ? new Date(activity.startDate).toLocaleDateString('fr-FR') : '?'} →{' '}
                  {activity.endDate ? new Date(activity.endDate).toLocaleDateString('fr-FR') : '?'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-4 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-green-600 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Objectifs */}
              {activity.objectives && activity.objectives.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Objectifs</h3>
                  <ul className="list-disc list-inside space-y-2">
                    {activity.objectives.map((obj, idx) => (
                      <li key={idx} className="text-gray-700">{obj}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Méthodologie */}
              {activity.methodology && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Méthodologie</h3>
                  <p className="text-gray-700">{activity.methodology}</p>
                </div>
              )}

              {/* Localisation */}
              {activity.location && (
                <div className="flex items-center text-gray-700">
                  <MapPin className="w-5 h-5 mr-2 text-green-600" />
                  <span><strong>Localisation:</strong> {activity.location}</span>
                </div>
              )}

              {/* Station */}
              {activity.station && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Station</h3>
                  <p className="text-gray-700">{activity.station.name}</p>
                </div>
              )}

              {/* Projet lié */}
              {activity.project ? (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Projet lié</h3>
                  <Link
                    to={`/chercheur/projects/${activity.project.id}`}
                    className="text-green-600 hover:text-green-700 hover:underline"
                  >
                    {activity.project.title}
                  </Link>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800">
                    <strong>Note:</strong> Cette activité n'est pas rattachée à un projet.
                  </p>
                </div>
              )}

              {/* Convention */}
              {activity.convention && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Convention</h3>
                  <p className="text-gray-700">{activity.convention.title}</p>
                </div>
              )}

              {/* Résultats attendus */}
              {activity.expectedResults && activity.expectedResults.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Résultats attendus</h3>
                  <ul className="list-disc list-inside space-y-2">
                    {activity.expectedResults.map((result, idx) => (
                      <li key={idx} className="text-gray-700">{result}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Contraintes */}
              {activity.constraints && activity.constraints.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Contraintes</h3>
                  <ul className="list-disc list-inside space-y-2">
                    {activity.constraints.map((constraint, idx) => (
                      <li key={idx} className="text-gray-700">{constraint}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Résultats obtenus */}
              {activity.results && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Résultats obtenus</h3>
                  <p className="text-gray-700">{activity.results}</p>
                </div>
              )}

              {/* Conclusions */}
              {activity.conclusions && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Conclusions</h3>
                  <p className="text-gray-700">{activity.conclusions}</p>
                </div>
              )}

              {/* Reconduction */}
              {activity.isRecurrent && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-purple-900 mb-2 flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Informations de reconduction
                  </h3>
                  <div className="space-y-2 text-sm text-purple-800">
                    <p><strong>Statut:</strong> {ActivityLifecycleStatusLabels[activity.lifecycleStatus]}</p>
                    <p><strong>Nombre de reconductions:</strong> {activity.recurrenceCount}</p>
                    {activity.recurrenceReason && (
                      <p><strong>Raison:</strong> {activity.recurrenceReason}</p>
                    )}
                    {activity.parentActivity && (
                      <p>
                        <strong>Activité parente:</strong>{' '}
                        <Link
                          to={`/chercheur/activities/${activity.parentActivity.id}`}
                          className="text-purple-600 hover:underline"
                        >
                          {activity.parentActivity.title}
                        </Link>
                      </p>
                    )}
                  </div>

                  {/* Historique des reconductions */}
                  {recurrenceHistory && recurrenceHistory.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-purple-200">
                      <h4 className="text-md font-semibold text-purple-900 mb-3">
                        Historique des reconductions ({recurrenceHistory.length})
                      </h4>
                      <div className="space-y-2">
                        {recurrenceHistory.map((recurrent) => (
                          <div
                            key={recurrent.id}
                            className="bg-white rounded-lg p-3 border border-purple-200"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <Link
                                  to={`/chercheur/activities/${recurrent.id}`}
                                  className="font-medium text-purple-700 hover:text-purple-900 hover:underline"
                                >
                                  {recurrent.title}
                                </Link>
                                <p className="text-xs text-gray-600 mt-1">
                                  {recurrent.startDate
                                    ? new Date(recurrent.startDate).toLocaleDateString('fr-FR')
                                    : '?'}{' '}
                                  →{' '}
                                  {recurrent.endDate
                                    ? new Date(recurrent.endDate).toLocaleDateString('fr-FR')
                                    : '?'}
                                </p>
                                {recurrent.recurrenceReason && (
                                  <p className="text-xs text-gray-600 mt-1 italic">
                                    "{recurrent.recurrenceReason}"
                                  </p>
                                )}
                              </div>
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  ActivityStatusColors[recurrent.status]
                                }`}
                              >
                                {ActivityStatusLabels[recurrent.status]}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'participants' && (
            <ActivityParticipants
              activityId={activity.id}
              participants={activity.participants || []}
            />
          )}

          {activeTab === 'partnerships' && (
            <ActivityPartnerships
              activityId={activity.id}
              partnerships={activity.partners || []}
            />
          )}

          {activeTab === 'funding' && (
            <ActivityFunding
              activityId={activity.id}
              fundings={activity.fundings || []}
            />
          )}

          {activeTab === 'tasks' && (
            <ActivityTasks
              activityId={activity.id}
              tasks={activity.tasks || []}
              availableUsers={[
                // Ajouter le responsable de l'activité
                {
                  id: activity.responsible.id,
                  firstName: activity.responsible.firstName,
                  lastName: activity.responsible.lastName,
                  email: activity.responsible.email,
                },
                // Ajouter tous les participants actifs
                ...(activity.participants || [])
                  .filter(p => p.isActive)
                  .map(p => ({
                    id: p.user.id,
                    firstName: p.user.firstName,
                    lastName: p.user.lastName,
                    email: p.user.email,
                  }))
              ].filter((user, index, self) =>
                // Éliminer les doublons basés sur l'ID
                index === self.findIndex(u => u.id === user.id)
              )}
            />
          )}
        </div>
      </div>

      {/* Modal de reconduction */}
      {showReconductModal && (
        <ReconductActivityModal
          activityId={activity.id}
          activityTitle={activity.title}
          onClose={() => setShowReconductModal(false)}
          onSuccess={(newActivityId) => {
            setShowReconductModal(false);
            navigate(`/chercheur/activities/${newActivityId}`);
          }}
        />
      )}
    </div>
  );
};

export default ActivityDetail;
