// src/pages/chercheur/ProjectDetail.tsx (avec commentaires)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Archive,
  Share2,
  MoreVertical,
  Users,
  Calendar,
  CheckSquare,
  FileText,
  Target,
  Tag,
  DollarSign,
  Plus,
  Activity,
  AlertCircle,
  User,
  Clock,
  UserMinus,
  MessageSquare
} from 'lucide-react';
import projectsApi, { Project } from '../../services/projectsApi';
import { useProjectActions } from '../../hooks/useProjects';
import AddParticipantModal from '../../components/projects/AddParticipantModal';
import { CommentSection } from '../../components/comments/CommentSection';

// Status colors mapping
const statusColors = {
  PLANIFIE: 'bg-gray-100 text-gray-800',
  EN_COURS: 'bg-blue-100 text-blue-800',
  SUSPENDU: 'bg-yellow-100 text-yellow-800',
  TERMINE: 'bg-green-100 text-green-800',
  ARCHIVE: 'bg-red-100 text-red-800'
};

const statusLabels = {
  PLANIFIE: 'Planifié',
  EN_COURS: 'En cours',
  SUSPENDU: 'Suspendu',
  TERMINE: 'Terminé',
  ARCHIVE: 'Archivé'
};

const roleLabels: Record<string, string> = {
  CHERCHEUR: 'Chercheur',
  ASSISTANT_CHERCHEUR: 'Assistant Chercheur',
  TECHNICIEN_SUPERIEUR: 'Technicien Supérieur',
  ADMINISTRATEUR: 'Administrateur'
};

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // État pour la modal d'ajout de participant
  const [showAddParticipantModal, setShowAddParticipantModal] = useState(false);
  
  // Hook pour les actions sur les participants
  const { loading: actionLoading, error: actionError } = useProjectActions();

  // Charger le projet
  const loadProject = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const projectData = await projectsApi.getProjectById(id);
      setProject(projectData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [id]);

  // Actions du projet
  const handleDeleteProject = async () => {
    if (!project || !window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      return;
    }

    try {
      await projectsApi.deleteProject(project.id);
      navigate('/chercheur/projects');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleArchiveProject = async () => {
    if (!project) return;

    try {
      await projectsApi.archiveProject(project.id);
      await loadProject();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Gérer l'ajout de participant
  const handleParticipantAdded = () => {
    loadProject(); // Recharger le projet pour afficher le nouveau participant
  };

  // Retirer un participant
  const handleRemoveParticipant = async (participantId: string, participantName: string) => {
    if (!project || !window.confirm(`Êtes-vous sûr de vouloir retirer ${participantName} du projet ?`)) {
      return;
    }

    try {
      await projectsApi.removeParticipant(project.id, participantId);
      await loadProject();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Erreur de chargement
        </h3>
        <p className="text-gray-600 mb-4">
          {error || 'Projet non trouvé'}
        </p>
        <button
          onClick={() => navigate('/chercheur/projects')}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Retour aux projets
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: Target },
    { id: 'activities', label: 'Activités', icon: Activity, badge: project._count?.activities },
    { id: 'tasks', label: 'Tâches', icon: CheckSquare, badge: project._count?.tasks },
    { id: 'team', label: 'Équipe', icon: Users, badge: project._count?.participants },
    { id: 'documents', label: 'Documents', icon: FileText, badge: project._count?.documents },
    { id: 'discussions', label: 'Discussions', icon: MessageSquare}
  ];

  // IDs des participants existants pour le modal
  const existingParticipantIds = project.participants.map(p => p.user.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/chercheur/projects')}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
                {statusLabels[project.status]}
              </span>
            </div>
            <p className="text-gray-600">
              Créé le {new Date(project.createdAt).toLocaleDateString()}
              {project.creator && (
                <span> par {project.creator.firstName} {project.creator.lastName}</span>
              )}
            </p>
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
                  to={`/chercheur/projects/${project.id}/edit`}
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
                  onClick={handleArchiveProject}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                >
                  <Archive className="h-4 w-4" />
                  Archiver
                </button>
                <button
                  onClick={handleDeleteProject}
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Participants</p>
              <p className="text-2xl font-bold text-gray-900">{project._count?.participants || 0}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Activités</p>
              <p className="text-2xl font-bold text-gray-900">{project._count?.activities || 0}</p>
            </div>
            <Activity className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tâches</p>
              <p className="text-2xl font-bold text-gray-900">{project._count?.tasks || 0}</p>
            </div>
            <CheckSquare className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Documents</p>
              <p className="text-2xl font-bold text-gray-900">{project._count?.documents || 0}</p>
            </div>
            <FileText className="h-8 w-8 text-purple-500" />
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
              {project.description && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{project.description}</p>
                </div>
              )}

              {/* Objectifs */}
              {project.objectives.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Objectifs
                  </h3>
                  <ul className="space-y-2">
                    {project.objectives.map((objective, index) => (
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

              {/* Mots-clés */}
              {project.keywords.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Mots-clés
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Informations du projet */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations</h3>
                <div className="space-y-4">
                  {/* Dates */}
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Période</p>
                      <p className="text-sm font-medium text-gray-900">
                        {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Non définie'}
                        {project.endDate && (
                          <span> - {new Date(project.endDate).toLocaleDateString()}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Budget */}
                  {project.budget && (
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Budget</p>
                        <p className="text-sm font-medium text-gray-900">
                          {project.budget.toLocaleString()} FCFA
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Créateur */}
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Créé par</p>
                      <p className="text-sm font-medium text-gray-900">
                        {project.creator?.firstName} {project.creator?.lastName}
                      </p>
                    </div>
                  </div>

                  {/* Dernière mise à jour */}
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Dernière mise à jour</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(project.updatedAt).toLocaleDateString()}
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
                    to={`/chercheur/projects/${project.id}/activities/new`}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Plus className="h-4 w-4" />
                    Nouvelle activité
                  </Link>
                  <Link
                    to={`/chercheur/projects/${project.id}/tasks/new`}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Plus className="h-4 w-4" />
                    Nouvelle tâche
                  </Link>
                  <button
                    onClick={() => setShowAddParticipantModal(true)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Plus className="h-4 w-4" />
                    Ajouter un participant
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Autres onglets */}
        {activeTab === 'activities' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Activités du projet</h3>
              <p className="text-gray-600 mb-4">Cette section sera développée prochainement</p>
              <Link
                to={`/chercheur/projects/${project.id}/activities/new`}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Créer une activité
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-center py-8">
              <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tâches du projet</h3>
              <p className="text-gray-600 mb-4">Cette section sera développée prochainement</p>
              <Link
                to={`/chercheur/projects/${project.id}/tasks/new`}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Créer une tâche
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Équipe du projet</h3>
              <button
                onClick={() => setShowAddParticipantModal(true)}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Ajouter un participant
              </button>
            </div>
            
            {/* Message d'erreur pour les actions */}
            {actionError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-red-700">{actionError}</span>
              </div>
            )}
            
            {project.participants && project.participants.length > 0 ? (
              <div className="space-y-4">
                {project.participants.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 rounded-full w-10 h-10 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {participant.user.firstName} {participant.user.lastName}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-medium">{participant.role}</span>
                          <span>•</span>
                          <span>{roleLabels[participant.user.role] || participant.user.role}</span>
                          {participant.user.department && (
                            <>
                              <span>•</span>
                              <span>{participant.user.department}</span>
                            </>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{participant.user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          Rejoint le {new Date(participant.joinedAt).toLocaleDateString()}
                        </p>
                        {participant.isActive ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                            Actif
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                            Inactif
                          </span>
                        )}
                      </div>
                      
                      {/* Bouton de retrait (seulement si ce n'est pas le créateur) */}
                      {participant.user.id !== project.creator?.id && (
                        <button
                          onClick={() => handleRemoveParticipant(
                            participant.id, 
                            `${participant.user.firstName} ${participant.user.lastName}`
                          )}
                          disabled={actionLoading}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Retirer du projet"
                        >
                          <UserMinus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun participant</h3>
                <p className="text-gray-600 mb-4">Ajoutez des collaborateurs à votre projet</p>
                <button
                  onClick={() => setShowAddParticipantModal(true)}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter le premier participant
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Documents du projet</h3>
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

        {/* 🎯 NOUVEAUTÉ: Onglet Discussions */}
        {activeTab === 'discussions' && (
          <CommentSection
            targetType="project"
            targetId={project.id}
            title={`Discussions du projet "${project.title}"`}
            showStats={true}
            className="bg-gray-50 p-6 rounded-lg"
          />
        )}
      </div>

      {/* Modal d'ajout de participant */}
      <AddParticipantModal
        isOpen={showAddParticipantModal}
        onClose={() => setShowAddParticipantModal(false)}
        projectId={project.id}
        onParticipantAdded={handleParticipantAdded}
        existingParticipants={existingParticipantIds}
      />
    </div>
  );
};

export default ProjectDetail;