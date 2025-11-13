// src/components/activities/ActivityTasks.tsx
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, X, CheckCircle, Clock, Users } from 'lucide-react';
import { activitiesApi } from '../../services/activitiesApi';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';
import {
  type ActivityTask,
  type CreateActivityTaskRequest,
  type UpdateActivityTaskRequest,
  TaskPriority,
  TaskPriorityLabels,
  TaskStatus,
  TaskStatusLabels,
} from '../../types/activity.types';

interface ActivityTasksProps {
  activityId: string;
  tasks: ActivityTask[];
  availableUsers?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
}

const ActivityTasks: React.FC<ActivityTasksProps> = ({ activityId, tasks, availableUsers = [] }) => {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ActivityTask | null>(null);

  const [newTask, setNewTask] = useState<CreateActivityTaskRequest>({
    title: '',
    description: '',
    priority: TaskPriority.NORMALE,
    dueDate: '',
    assigneeId: '',
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateActivityTaskRequest) => activitiesApi.createTask(activityId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity', activityId] });
      toast.success('Tâche créée avec succès');
      setShowAddModal(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la création de la tâche');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: UpdateActivityTaskRequest }) =>
      activitiesApi.updateTask(activityId, taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity', activityId] });
      toast.success('Tâche modifiée avec succès');
      setShowEditModal(false);
      setSelectedTask(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la modification');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (taskId: string) => activitiesApi.deleteTask(activityId, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity', activityId] });
      toast.success('Tâche supprimée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la suppression');
    },
  });

  const resetForm = () => {
    setNewTask({
      title: '',
      description: '',
      priority: TaskPriority.NORMALE,
      dueDate: '',
      assigneeId: '',
    });
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newTask);
  };

  const handleEdit = (task: ActivityTask) => {
    setSelectedTask(task);
    setShowEditModal(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    updateMutation.mutate({
      taskId: selectedTask.id,
      data: {
        title: selectedTask.title,
        description: selectedTask.description,
        status: selectedTask.status,
        priority: selectedTask.priority,
        dueDate: selectedTask.dueDate,
        progress: selectedTask.progress,
        assigneeId: selectedTask.assignee?.id || undefined,
      },
    });
  };

  const handleDelete = (taskId: string) => {
    toast((t) => (
      <div>
        <p className="font-medium mb-2">Voulez-vous vraiment supprimer cette tâche ?</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              deleteMutation.mutate(taskId);
              toast.dismiss(t.id);
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

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.URGENTE:
        return 'bg-red-100 text-red-800';
      case TaskPriority.HAUTE:
        return 'bg-orange-100 text-orange-800';
      case TaskPriority.NORMALE:
        return 'bg-blue-100 text-blue-800';
      case TaskPriority.BASSE:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TERMINEE:
        return 'bg-green-100 text-green-800';
      case TaskStatus.EN_COURS:
        return 'bg-blue-100 text-blue-800';
      case TaskStatus.EN_REVISION:
        return 'bg-purple-100 text-purple-800';
      case TaskStatus.ANNULEE:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Statistiques
  const completedTasks = tasks.filter((t) => t.status === TaskStatus.TERMINEE).length;
  const inProgressTasks = tasks.filter((t) => t.status === TaskStatus.EN_COURS).length;
  const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* En-tête avec stats */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
            Tâches ({tasks.length})
          </h3>
          {tasks.length > 0 && (
            <div className="flex gap-4 mt-2 text-sm">
              <div className="flex items-center text-green-600">
                <span>Terminées: {completedTasks}</span>
              </div>
              <div className="flex items-center text-blue-600">
                <span>En cours: {inProgressTasks}</span>
              </div>
              <div className="flex items-center text-purple-600">
                <span>Taux de complétion: {completionRate}%</span>
              </div>
            </div>
          )}
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Créer une tâche
        </Button>
      </div>

      {/* Liste des tâches */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Aucune tâche pour le moment</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h4 className="font-medium text-gray-900">{task.title}</h4>
                    <span
                      className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        task.status
                      )}`}
                    >
                      {TaskStatusLabels[task.status]}
                    </span>
                    <span
                      className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {TaskPriorityLabels[task.priority]}
                    </span>
                  </div>

                  {task.description && (
                    <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                  )}

                  <div className="flex flex-col gap-2 text-sm text-gray-500">
                    <div className="flex items-center gap-4 flex-wrap">
                      {task.createdBy && (
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1 text-purple-500" />
                          <span className="font-medium text-purple-700">Superviseur:</span>
                          <span className="ml-1">{task.createdBy.firstName} {task.createdBy.lastName}</span>
                        </div>
                      )}
                      {task.assignee && (
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1 text-blue-500" />
                          <span className="font-medium text-blue-700">Assigné à:</span>
                          <span className="ml-1">{task.assignee.firstName} {task.assignee.lastName}</span>
                        </div>
                      )}
                    </div>
                    {task.dueDate && (
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>
                          Échéance: {new Date(task.dueDate).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    )}
                  </div>

                  {task.progress !== undefined && task.progress !== null && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Progression</span>
                        <span>{task.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(task)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal d'ajout */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Créer une tâche</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre de la tâche *
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newTask.description || ''}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priorité</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) =>
                      setNewTask({ ...newTask, priority: e.target.value as TaskPriority })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {Object.entries(TaskPriorityLabels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Échéance</label>
                  <input
                    type="date"
                    value={newTask.dueDate || ''}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigner à
                </label>
                <select
                  value={newTask.assigneeId || ''}
                  onChange={(e) => setNewTask({ ...newTask, assigneeId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Aucun assigné</option>
                  {availableUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Sélectionnez un membre de l'activité pour lui assigner cette tâche
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {createMutation.isPending ? 'Création en cours...' : 'Créer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de modification */}
      {showEditModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Modifier la tâche</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedTask(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titre *</label>
                <input
                  type="text"
                  value={selectedTask.title}
                  onChange={(e) => setSelectedTask({ ...selectedTask, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={selectedTask.description || ''}
                  onChange={(e) =>
                    setSelectedTask({ ...selectedTask, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                  <select
                    value={selectedTask.status}
                    onChange={(e) =>
                      setSelectedTask({ ...selectedTask, status: e.target.value as TaskStatus })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    {Object.entries(TaskStatusLabels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priorité</label>
                  <select
                    value={selectedTask.priority}
                    onChange={(e) =>
                      setSelectedTask({ ...selectedTask, priority: e.target.value as TaskPriority })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    {Object.entries(TaskPriorityLabels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Échéance</label>
                  <input
                    type="date"
                    value={selectedTask.dueDate || ''}
                    onChange={(e) => setSelectedTask({ ...selectedTask, dueDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Progression (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={selectedTask.progress || 0}
                    onChange={(e) =>
                      setSelectedTask({ ...selectedTask, progress: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigner à
                </label>
                <select
                  value={selectedTask.assignee?.id || ''}
                  onChange={(e) => {
                    const userId = e.target.value;
                    const user = availableUsers.find(u => u.id === userId);
                    setSelectedTask({
                      ...selectedTask,
                      assignee: user ? {
                        id: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email
                      } : undefined
                    });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Aucun assigné</option>
                  {availableUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Réassigner cette tâche à un autre membre de l'activité
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedTask(null);
                  }}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {updateMutation.isPending ? 'Modification en cours...' : 'Modifier'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityTasks;
