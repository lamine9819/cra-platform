// src/pages/chercheur/ActivityDetail.tsx (avec commentaires)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Share2,
  MoreVertical,
  Calendar,
  MapPin,
  Target,
  FileText,
  Lightbulb,
  CheckSquare,
  Folder,
  Plus,
  AlertCircle,
  Activity as ActivityIcon,
  Clock,
  MessageSquare
} from 'lucide-react';
import activitiesApi, { Activity } from '../../services/activitiesApi';
import { CommentSection } from '../../components/comments/CommentSection';

const ActivityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Charger l'activité
  const loadActivity = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const activityData = await activitiesApi.getActivityById(id);
      setActivity(activityData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivity();
  }, [id]);

  // Actions de l'activité
  const handleDeleteActivity = async () => {
    if (!activity || !window.confirm('Êtes-vous sûr de vouloir supprimer cette activité ?')) {
      return;
    }

    try {
      await activitiesApi.deleteActivity(activity.id);
      navigate('/chercheur/activities');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Formater les dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Erreur de chargement
        </h3>
        <p className="text-gray-600 mb-4">
          {error || 'Activité non trouvée'}
        </p>
        <button
          onClick={() => navigate('/chercheur/activities')}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Retour aux activités
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: Target },
    { id: 'tasks', label: 'Tâches', icon: CheckSquare, badge: activity._count?.tasks },
    { id: 'documents', label: 'Documents', icon: FileText, badge: activity._count?.documents },
    { id: 'forms', label: 'Formulaires', icon: Folder, badge: activity._count?.forms },
    { id: 'discussions', label: 'Discussions', icon: MessageSquare }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/chercheur/activities')}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{activity.title}</h1>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Créé le {formatDate(activity.createdAt)}</span>
              {activity.project && (
                <Link
                  to={`/chercheur/projects/${activity.project.id}`}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  📁 {activity.project.title}
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Actions menu */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border z-10">
              <div className="py-1">
                <Link
                  to={`/chercheur/activities/${activity.id}/edit`}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Edit className="h-4 w-4" />
                  Modifier
                </Link>
                <button
                  onClick={() => {
                    // TODO: Implémenter le partage
                    alert('Fonctionnalité de partage à venir');
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                >
                  <Share2 className="h-4 w-4" />
                  Partager
                </button>
                <button
                  onClick={handleDeleteActivity}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tâches</p>
              <p className="text-2xl font-bold text-gray-900">{activity._count?.tasks || 0}</p>
            </div>
            <CheckSquare className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Documents</p>
              <p className="text-2xl font-bold text-gray-900">{activity._count?.documents || 0}</p>
            </div>
            <FileText className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Formulaires</p>
              <p className="text-2xl font-bold text-gray-900">{activity._count?.forms || 0}</p>
            </div>
            <Folder className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Informations principales */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              {activity.description && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{activity.description}</p>
                </div>
              )}

              {/* Objectifs */}
              {activity.objectives.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Objectifs
                  </h3>
                  <ul className="space-y-2">
                    {activity.objectives.map((objective, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-sm font-medium min-w-[24px] text-center">
                          {index + 1}
                        </span>
                        <span className="text-gray-700">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Méthodologie */}
              {activity.methodology && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Méthodologie
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{activity.methodology}</p>
                </div>
              )}

              {/* Résultats et conclusions */}
              {(activity.results || activity.conclusions) && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Résultats et conclusions
                  </h3>
                  <div className="space-y-4">
                    {activity.results && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Résultats observés</h4>
                        <p className="text-gray-700 leading-relaxed">{activity.results}</p>
                      </div>
                    )}
                    {activity.conclusions && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Conclusions</h4>
                        <p className="text-gray-700 leading-relaxed">{activity.conclusions}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Informations de l'activité */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations</h3>
                <div className="space-y-4">
                  {/* Lieu */}
                  {activity.location && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Lieu</p>
                        <p className="text-sm font-medium text-gray-900">{activity.location}</p>
                      </div>
                    </div>
                  )}

                  {/* Dates */}
                  {(activity.startDate || activity.endDate) && (
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Période</p>
                        <p className="text-sm font-medium text-gray-900">
                          {activity.startDate && formatDate(activity.startDate)}
                          {activity.startDate && activity.endDate && ' - '}
                          {activity.endDate && formatDate(activity.endDate)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Dernière mise à jour */}
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Dernière mise à jour</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(activity.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions rapides */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
                <div className="space-y-2">
                  <Link
                    to={`/chercheur/activities/${activity.id}/tasks/new`}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Plus className="h-4 w-4" />
                    Nouvelle tâche
                  </Link>
                  <button
                    onClick={() => {
                      // TODO: Implémenter l'ajout de document
                      alert('Fonctionnalité à venir');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Plus className="h-4 w-4" />
                    Ajouter un document
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Implémenter l'ajout de formulaire
                      alert('Fonctionnalité à venir');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Plus className="h-4 w-4" />
                    Lier un formulaire
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Autres onglets */}
        {activeTab === 'tasks' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-center py-8">
              <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tâches de l'activité</h3>
              <p className="text-gray-600 mb-4">Cette section sera développée prochainement</p>
              <Link
                to={`/chercheur/activities/${activity.id}/tasks/new`}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Créer une tâche
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Documents de l'activité</h3>
              <p className="text-gray-600 mb-4">Cette section sera développée prochainement</p>
              <button
                onClick={() => {
                  // TODO: Implémenter l'upload de documents
                  alert('Fonctionnalité à venir');
                }}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Ajouter un document
              </button>
            </div>
          </div>
        )}

        {activeTab === 'forms' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-center py-8">
              <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Formulaires liés</h3>
              <p className="text-gray-600 mb-4">Cette section sera développée prochainement</p>
              <button
                onClick={() => {
                  // TODO: Implémenter la liaison de formulaires
                  alert('Fonctionnalité à venir');
                }}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Lier un formulaire
              </button>
            </div>
          </div>
        )}

        {/* 🎯 NOUVEAUTÉ: Onglet Discussions */}
        {activeTab === 'discussions' && (
          <CommentSection
            targetType="activity"
            targetId={activity.id}
            title={`Discussions de l'activité "${activity.title}"`}
            showStats={false}
            className="bg-gray-50 p-6 rounded-lg"
          />
        )}
      </div>
    </div>
  );
};

export default ActivityDetail;