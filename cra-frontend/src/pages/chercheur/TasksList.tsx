// src/pages/chercheur/TasksList.tsx
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  CheckSquare,
  Clock,
  AlertTriangle,
  Calendar,
  User,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Flag,
  AlertCircle,
  FileText
} from 'lucide-react';
import { Task } from '../../services/tasksApi';
import { useTasks, useTaskActions } from '../../hooks/useTasks';

// Composant Badge pour le statut
const StatusBadge: React.FC<{ status: Task['status'] }> = ({ status }) => {
  const statusConfig = {
    A_FAIRE: { label: 'À faire', className: 'bg-gray-100 text-gray-800' },
    EN_COURS: { label: 'En cours', className: 'bg-blue-100 text-blue-800' },
    EN_REVISION: { label: 'En révision', className: 'bg-yellow-100 text-yellow-800' },
    TERMINEE: { label: 'Terminée', className: 'bg-green-100 text-green-800' },
    ANNULEE: { label: 'Annulée', className: 'bg-red-100 text-red-800' },
  };

  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
};

// Composant Badge pour la priorité
const PriorityBadge: React.FC<{ priority: Task['priority'] }> = ({ priority }) => {
  const priorityConfig = {
    BASSE: { label: 'Basse', className: 'bg-gray-100 text-gray-600', icon: null },
    NORMALE: { label: 'Normale', className: 'bg-blue-100 text-blue-600', icon: null },
    HAUTE: { label: 'Haute', className: 'bg-orange-100 text-orange-600', icon: Flag },
    URGENTE: { label: 'Urgente', className: 'bg-red-100 text-red-600', icon: AlertTriangle },
  };

  const config = priorityConfig[priority];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {Icon && <Icon className="w-3 h-3 mr-1" />}
      {config.label}
    </span>
  );
};

const TasksList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // États locaux pour les filtres (comme dans ProjectsList)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || '');
  const [selectedPriority, setSelectedPriority] = useState(searchParams.get('priority') || '');
  const [showOverdue, setShowOverdue] = useState(searchParams.get('overdue') === 'true');
  const [showFilters, setShowFilters] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Hook personnalisé pour les tâches
  const { 
    tasks, 
    loading, 
    error, 
    pagination, 
    updateFilter, 
    updateTask, 
    removeTask 
  } = useTasks();

  // Hook pour les actions sur les tâches
  const { updating, markAsCompleted, markAsInProgress, deleteTask } = useTaskActions();

  // Synchroniser les filtres avec les hooks
  useEffect(() => {
    updateFilter('search', searchTerm || undefined);
  }, [searchTerm, updateFilter]);

  useEffect(() => {
    updateFilter('status', selectedStatus || undefined);
  }, [selectedStatus, updateFilter]);

  useEffect(() => {
    updateFilter('priority', selectedPriority || undefined);
  }, [selectedPriority, updateFilter]);

  useEffect(() => {
    updateFilter('overdue', showOverdue || undefined);
  }, [showOverdue, updateFilter]);

  // Effect pour les URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedStatus) params.set('status', selectedStatus);
    if (selectedPriority) params.set('priority', selectedPriority);
    if (showOverdue) params.set('overdue', 'true');
    setSearchParams(params);
  }, [searchTerm, selectedStatus, selectedPriority, showOverdue, setSearchParams]);

  // Actions sur les tâches
  const handleStatusChange = async (task: Task, newStatus: Task['status']) => {
    try {
      let updatedTask;
      if (newStatus === 'TERMINEE') {
        updatedTask = await markAsCompleted(task.id);
      } else if (newStatus === 'EN_COURS') {
        updatedTask = await markAsInProgress(task.id);
      }
      if (updatedTask) {
        updateTask(updatedTask);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      try {
        await deleteTask(taskId);
        removeTask(taskId);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  // Reset des filtres
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setSelectedPriority('');
    setShowOverdue(false);
    updateFilter('page', 1);
  };

  // Loading initial
  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Tâches</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos tâches assignées et suivez leur progression
          </p>
        </div>
        <Link
          to="/chercheur/tasks/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nouvelle tâche
        </Link>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une tâche..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Bouton filtres */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors ${
              showFilters || selectedStatus || selectedPriority || showOverdue
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filtres
          </button>
        </div>

        {/* Filtres avancés */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tous les statuts</option>
                  <option value="A_FAIRE">À faire</option>
                  <option value="EN_COURS">En cours</option>
                  <option value="EN_REVISION">En révision</option>
                  <option value="TERMINEE">Terminée</option>
                  <option value="ANNULEE">Annulée</option>
                </select>
              </div>

              {/* Priorité */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priorité
                </label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Toutes les priorités</option>
                  <option value="URGENTE">Urgente</option>
                  <option value="HAUTE">Haute</option>
                  <option value="NORMALE">Normale</option>
                  <option value="BASSE">Basse</option>
                </select>
              </div>

              {/* Checkbox retard */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filtres spéciaux
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showOverdue}
                    onChange={(e) => setShowOverdue(e.target.checked)}
                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Tâches en retard</span>
                </label>
              </div>
            </div>
            
            {/* Actions filtres */}
            <div className="flex justify-end mt-4 gap-2">
              <button
                onClick={resetFilters}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Liste des tâches */}
      {tasks.length === 0 && !loading ? (
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <CheckSquare className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune tâche trouvée
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedStatus || selectedPriority || showOverdue
              ? 'Essayez de modifier vos critères de recherche'
              : 'Commencez par créer votre première tâche'}
          </p>
          <Link
            to="/chercheur/tasks/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Créer une tâche
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => {
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'TERMINEE';
            const isDueToday = task.dueDate && new Date(task.dueDate).toDateString() === new Date().toDateString();

            return (
              <div
                key={task.id}
                className={`bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow ${
                  isOverdue ? 'border-red-200' : 'border-gray-200'
                }`}
              >
                {/* Header de la carte */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        <Link 
                          to={`/chercheur/tasks/${task.id}`}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {task.title}
                        </Link>
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <StatusBadge status={task.status} />
                        <PriorityBadge priority={task.priority} />
                      </div>
                    </div>
                    
                    {/* Menu actions */}
                    <div className="relative">
                      <button
                        onClick={() => setOpenDropdown(openDropdown === task.id ? null : task.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      
                      {openDropdown === task.id && (
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border z-10">
                          <div className="py-1">
                            <Link
                              to={`/chercheur/tasks/${task.id}`}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              onClick={() => setOpenDropdown(null)}
                            >
                              <Eye className="h-4 w-4" />
                              Voir
                            </Link>
                            <Link
                              to={`/chercheur/tasks/${task.id}/edit`}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              onClick={() => setOpenDropdown(null)}
                            >
                              <Edit className="h-4 w-4" />
                              Modifier
                            </Link>
                            {task.status !== 'TERMINEE' && (
                              <>
                                {task.status === 'A_FAIRE' && (
                                  <button
                                    onClick={() => {
                                      handleStatusChange(task, 'EN_COURS');
                                      setOpenDropdown(null);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 w-full text-left"
                                    disabled={updating}
                                  >
                                    <Clock className="h-4 w-4" />
                                    Démarrer
                                  </button>
                                )}
                                {task.status === 'EN_COURS' && (
                                  <button
                                    onClick={() => {
                                      handleStatusChange(task, 'TERMINEE');
                                      setOpenDropdown(null);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50 w-full text-left"
                                    disabled={updating}
                                  >
                                    <CheckSquare className="h-4 w-4" />
                                    Terminer
                                  </button>
                                )}
                              </>
                            )}
                            <button
                              onClick={() => {
                                handleDeleteTask(task.id);
                                setOpenDropdown(null);
                              }}
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
                </div>

                {/* Corps de la carte */}
                <div className="p-4">
                  {task.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  {/* Progrès */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">Progression</span>
                      <span className="text-sm text-gray-500">{task.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          task.status === 'TERMINEE' ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Informations */}
                  <div className="space-y-2 mb-4">
                    {task.assignee && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="h-4 w-4" />
                        <span>{task.assignee.firstName} {task.assignee.lastName}</span>
                      </div>
                    )}
                    
                    {task.dueDate && (
                      <div className={`flex items-center gap-2 text-sm ${
                        isOverdue ? 'text-red-600' : isDueToday ? 'text-orange-600' : 'text-gray-600'
                      }`}>
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(task.dueDate).toLocaleDateString('fr-FR')}
                          {isOverdue && ' (En retard)'}
                          {isDueToday && ' (Aujourd\'hui)'}
                        </span>
                      </div>
                    )}

                    {task.project && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText className="h-4 w-4" />
                        <Link 
                          to={`/chercheur/projects/${task.project.id}`}
                          className="hover:text-blue-600 transition-colors truncate"
                        >
                          {task.project.title}
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Action principale */}
                  <Link
                    to={`/chercheur/tasks/${task.id}`}
                    className="w-full bg-blue-600 text-white text-center py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors block"
                  >
                    Ouvrir
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            disabled={pagination.page === 1}
            onClick={() => updateFilter('page', pagination.page - 1)}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Précédent
          </button>
          
          <span className="px-4 py-2 text-sm text-gray-600">
            Page {pagination.page} sur {pagination.totalPages}
          </span>
          
          <button
            disabled={pagination.page === pagination.totalPages}
            onClick={() => updateFilter('page', pagination.page + 1)}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
};

export default TasksList;