// src/pages/chercheur/TaskDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Share2,
  MoreVertical,
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  Circle,
  MessageSquare,
  FileText,
  Activity,
  Target,
  Flag,
  TrendingUp,
  AlertTriangle,
  XCircle,
  Play,
  FolderOpen,
  Briefcase
} from 'lucide-react';
import tasksApi, { Task} from '../../services/tasksApi';
import { CommentSection } from '../../components/comments/CommentSection';

// Couleurs et labels des statuts
const statusConfig = {
  A_FAIRE: {
    color: 'bg-gray-100 text-gray-800',
    label: 'À faire',
    icon: Circle
  },
  EN_COURS: {
    color: 'bg-blue-100 text-blue-800',
    label: 'En cours',
    icon: Play
  },
  EN_REVISION: {
    color: 'bg-yellow-100 text-yellow-800',
    label: 'En révision',
    icon: AlertCircle
  },
  TERMINEE: {
    color: 'bg-green-100 text-green-800',
    label: 'Terminée',
    icon: CheckCircle2
  },
  ANNULEE: {
    color: 'bg-red-100 text-red-800',
    label: 'Annulée',
    icon: XCircle
  }
};

// Couleurs et labels des priorités
const priorityConfig = {
  BASSE: {
    color: 'bg-gray-100 text-gray-700',
    label: 'Basse',
    icon: Flag
  },
  NORMALE: {
    color: 'bg-blue-100 text-blue-700',
    label: 'Normale',
    icon: Flag
  },
  HAUTE: {
    color: 'bg-orange-100 text-orange-700',
    label: 'Haute',
    icon: AlertTriangle
  },
  URGENTE: {
    color: 'bg-red-100 text-red-700',
    label: 'Urgente',
    icon: AlertTriangle
  }
};

const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [updating, setUpdating] = useState(false);

  // Charger la tâche
  const loadTask = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const taskData = await tasksApi.getTaskById(id);
      setTask(taskData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTask();
  }, [id]);

  // Actions sur la tâche
  const handleDeleteTask = async () => {
    if (!task || !window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      return;
    }

    try {
      setUpdating(true);
      await tasksApi.deleteTask(task.id);
      navigate(-1);
    } catch (err: any) {
      console.error('Erreur lors de la suppression:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la suppression de la tâche';
      alert(`Erreur: ${errorMessage}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateStatus = async (newStatus: Task['status']) => {
    if (!task) return;
    
    setUpdating(true);
    try {
      const updatedTask = await tasksApi.updateTask(task.id, { 
        status: newStatus,
        progress: newStatus === 'TERMINEE' ? 100 : task.progress
      });
      setTask(updatedTask);
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour du statut:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la mise à jour du statut';
      alert(`Erreur: ${errorMessage}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateProgress = async (newProgress: number) => {
    if (!task) return;
    
    setUpdating(true);
    try {
      const updatedTask = await tasksApi.updateProgress(task.id, newProgress);
      setTask(updatedTask);
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour de la progression:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la mise à jour de la progression';
      alert(`Erreur: ${errorMessage}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePriority = async (newPriority: Task['priority']) => {
    if (!task) return;
    
    setUpdating(true);
    try {
      const updatedTask = await tasksApi.updateTask(task.id, { priority: newPriority });
      setTask(updatedTask);
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour de la priorité:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la mise à jour de la priorité';
      alert(`Erreur: ${errorMessage}`);
    } finally {
      setUpdating(false);
    }
  };

  // Calculer si la tâche est en retard
  const isOverdue = () => {
    if (!task?.dueDate || task.status === 'TERMINEE' || task.status === 'ANNULEE') return false;
    return new Date(task.dueDate) < new Date();
  };

  // Obtenir le nombre de jours restants
  const getDaysRemaining = () => {
    if (!task?.dueDate) return null;
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Erreur de chargement
        </h3>
        <p className="text-gray-600 mb-4">
          {error || 'Tâche non trouvée'}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Retour
        </button>
      </div>
    );
  }

  const StatusIcon = statusConfig[task.status].icon;
  const PriorityIcon = priorityConfig[task.priority].icon;
  const daysRemaining = getDaysRemaining();

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: Target },
    { id: 'activity', label: 'Activité', icon: Activity },
    { id: 'documents', label: 'Documents', icon: FileText, badge: task._count?.documents },
    { id: 'discussions', label: 'Discussions', icon: MessageSquare, badge: task._count?.comments }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[task.status].color}`}>
                <StatusIcon className="h-3 w-3" />
                {statusConfig[task.status].label}
              </span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityConfig[task.priority].color}`}>
                <PriorityIcon className="h-3 w-3" />
                {priorityConfig[task.priority].label}
              </span>
              {isOverdue() && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  <AlertCircle className="h-3 w-3" />
                  En retard
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>
                Créée le {new Date(task.createdAt).toLocaleDateString()}
              </span>
              {task.creator && (
                <span>par {task.creator.firstName} {task.creator.lastName}</span>
              )}
            </div>
          </div>
        </div>

        {/* Actions menu */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            disabled={updating}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
          
          {showDropdown && (
            <>
              {/* Overlay pour fermer le menu en cliquant ailleurs */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowDropdown(false)}
              />
              
              {/* Menu dropdown */}
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border z-50">
                <div className="py-1">
                  <Link
                    to={`/chercheur/tasks/${task.id}/edit`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDropdown(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    <Edit className="h-4 w-4" />
                    Modifier
                  </Link>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDropdown(false);
                      alert('Fonctionnalité de partage à venir');
                    }}
                    disabled={updating}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left disabled:opacity-50 cursor-pointer"
                  >
                    <Share2 className="h-4 w-4" />
                    Partager
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDropdown(false);
                      handleUpdateStatus('ANNULEE');
                    }}
                    disabled={updating}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left disabled:opacity-50 cursor-pointer"
                  >
                    <XCircle className="h-4 w-4" />
                    Annuler la tâche
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDropdown(false);
                      handleDeleteTask();
                    }}
                    disabled={updating}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left disabled:opacity-50 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                    {updating ? 'Suppression...' : 'Supprimer'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">Progression</h3>
          <span className="text-sm font-semibold text-gray-900">{task.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${task.progress}%` }}
          />
        </div>
        <div className="mt-4 flex gap-2">
          {[0, 25, 50, 75, 100].map((value) => (
            <button
              key={value}
              onClick={() => handleUpdateProgress(value)}
              disabled={updating || task.progress === value}
              className="px-3 py-1 text-xs rounded-md border transition-colors disabled:opacity-50 hover:bg-gray-50"
            >
              {value}%
            </button>
          ))}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Statut card avec actions */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Statut</p>
            <StatusIcon className={`h-5 w-5 ${statusConfig[task.status].color.split(' ')[1]}`} />
          </div>
          <p className="text-lg font-semibold text-gray-900">{statusConfig[task.status].label}</p>
          <select
            value={task.status}
            onChange={(e) => handleUpdateStatus(e.target.value as Task['status'])}
            disabled={updating}
            className="mt-2 w-full text-sm border rounded px-2 py-1"
          >
            {Object.entries(statusConfig).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>

        {/* Priorité card avec actions */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Priorité</p>
            <PriorityIcon className={`h-5 w-5 ${priorityConfig[task.priority].color.split(' ')[1]}`} />
          </div>
          <p className="text-lg font-semibold text-gray-900">{priorityConfig[task.priority].label}</p>
          <select
            value={task.priority}
            onChange={(e) => handleUpdatePriority(e.target.value as Task['priority'])}
            disabled={updating}
            className="mt-2 w-full text-sm border rounded px-2 py-1"
          >
            {Object.entries(priorityConfig).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>

        {/* Échéance */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Échéance</p>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          {task.dueDate ? (
            <>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(task.dueDate).toLocaleDateString()}
              </p>
              {daysRemaining !== null && (
                <p className={`text-xs mt-1 ${isOverdue() ? 'text-red-600' : 'text-gray-500'}`}>
                  {isOverdue() 
                    ? `En retard de ${Math.abs(daysRemaining)} jour(s)`
                    : daysRemaining === 0 
                    ? "Aujourd'hui"
                    : `Dans ${daysRemaining} jour(s)`
                  }
                </p>
              )}
            </>
          ) : (
            <p className="text-lg font-semibold text-gray-400">Non définie</p>
          )}
        </div>

        {/* Assigné à */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Assigné à</p>
            <User className="h-5 w-5 text-gray-400" />
          </div>
          {task.assignee ? (
            <>
              <p className="text-lg font-semibold text-gray-900">
                {task.assignee.firstName} {task.assignee.lastName}
              </p>
              <p className="text-xs text-gray-500 mt-1">{task.assignee.email}</p>
            </>
          ) : (
            <p className="text-lg font-semibold text-gray-400">Non assignée</p>
          )}
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
            {/* Contenu principal */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              {task.description && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{task.description}</p>
                </div>
              )}

              {/* Projet associé */}
              {task.project && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FolderOpen className="h-5 w-5" />
                    Projet associé
                  </h3>
                  <Link
                    to={`/chercheur/projects/${task.project.id}`}
                    className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{task.project.title}</h4>
                        {task.project.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {task.project.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Créé par {task.project.creator.firstName} {task.project.creator.lastName}</span>
                          {task.project.participants && (
                            <span>{task.project.participants.length} participant(s)</span>
                          )}
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        task.project.status === 'EN_COURS' ? 'bg-blue-100 text-blue-800' :
                        task.project.status === 'TERMINE' ? 'bg-green-100 text-green-800' :
                        task.project.status === 'SUSPENDU' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.project.status}
                      </span>
                    </div>
                  </Link>
                </div>
              )}

              {/* Activité associée */}
              {task.activity && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Activité associée
                  </h3>
                  <Link
                    to={`/chercheur/activities/${task.activity.id}`}
                    className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <h4 className="font-medium text-gray-900">{task.activity.title}</h4>
                    {task.activity.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {task.activity.description}
                      </p>
                    )}
                    {task.activity.location && (
                      <p className="text-xs text-gray-500 mt-2">
                        📍 {task.activity.location}
                      </p>
                    )}
                  </Link>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Informations de la tâche */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations</h3>
                <div className="space-y-4">
                  {/* Créateur */}
                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Créé par</p>
                      <p className="text-sm font-medium text-gray-900">
                        {task.creator?.firstName} {task.creator?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{task.creator?.email}</p>
                    </div>
                  </div>

                  {/* Date de création */}
                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Créée le</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(task.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(task.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  {/* Dernière mise à jour */}
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-4 w-4 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Dernière mise à jour</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(task.updatedAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(task.updatedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  {/* Date de complétion */}
                  {task.completedAt && (
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Terminée le</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(task.completedAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(task.completedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions rapides */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
                <div className="space-y-2">
                  {task.status !== 'EN_COURS' && task.status !== 'TERMINEE' && task.status !== 'ANNULEE' && (
                    <button
                      onClick={() => handleUpdateStatus('EN_COURS')}
                      disabled={updating}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50"
                    >
                      <Play className="h-4 w-4" />
                      Commencer la tâche
                    </button>
                  )}
                  
                  {task.status === 'EN_COURS' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus('EN_REVISION')}
                        disabled={updating}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-yellow-600 hover:bg-yellow-50 rounded-lg disabled:opacity-50"
                      >
                        <AlertCircle className="h-4 w-4" />
                        Mettre en révision
                      </button>
                      <button
                        onClick={() => handleUpdateStatus('TERMINEE')}
                        disabled={updating}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Marquer comme terminée
                      </button>
                    </>
                  )}
                  
                  {task.status === 'EN_REVISION' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus('EN_COURS')}
                        disabled={updating}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50"
                      >
                        <Play className="h-4 w-4" />
                        Reprendre la tâche
                      </button>
                      <button
                        onClick={() => handleUpdateStatus('TERMINEE')}
                        disabled={updating}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Approuver et terminer
                      </button>
                    </>
                  )}
                  
                  {task.status === 'TERMINEE' && (
                    <button
                      onClick={() => handleUpdateStatus('EN_COURS')}
                      disabled={updating}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50"
                    >
                      <Play className="h-4 w-4" />
                      Rouvrir la tâche
                    </button>
                  )}
                  
                  <Link
                    to={`/chercheur/tasks/${task.id}/edit`}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                  >
                    <Edit className="h-4 w-4" />
                    Modifier les détails
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Historique d'activité</h3>
              <p className="text-gray-600 mb-4">Cette section affichera l'historique des modifications</p>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Documents de la tâche</h3>
              <p className="text-gray-600 mb-4">
                {task._count?.documents 
                  ? `${task._count.documents} document(s) attaché(s)`
                  : 'Aucun document attaché à cette tâche'
                }
              </p>
              <button
                onClick={() => alert('Fonctionnalité d\'upload à venir')}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <FileText className="h-4 w-4" />
                Ajouter un document
              </button>
            </div>
          </div>
        )}

        {activeTab === 'discussions' && (
          <CommentSection
            targetType="task"
            targetId={task.id}
            title={`Discussions de la tâche "${task.title}"`}
            showStats={true}
            className="bg-gray-50 p-6 rounded-lg"
          />
        )}
      </div>
    </div>
  );
};

export default TaskDetail;