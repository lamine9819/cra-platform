// src/components/dashboard/TasksOverview.tsx
import React from 'react';
import { CheckSquare, Clock, AlertTriangle, Plus } from 'lucide-react';
import { TaskStats } from '../../services/dashboard.api';

interface TasksOverviewProps {
  tasks: TaskStats;
  onViewAll: () => void;
  onCreateNew: () => void;
}

const TasksOverview: React.FC<TasksOverviewProps> = ({
  tasks,
  onViewAll,
  onCreateNew
}) => {
  const statusLabels = {
    A_FAIRE: 'À faire',
    EN_COURS: 'En cours',
    EN_REVISION: 'En révision',
    TERMINEE: 'Terminée',
    ANNULEE: 'Annulée'
  };

  const priorityLabels = {
    BASSE: 'Basse',
    NORMALE: 'Normale',
    HAUTE: 'Haute',
    URGENTE: 'Urgente'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'A_FAIRE': return 'bg-gray-100 text-gray-800';
      case 'EN_COURS': return 'bg-blue-100 text-blue-800';
      case 'EN_REVISION': return 'bg-yellow-100 text-yellow-800';
      case 'TERMINEE': return 'bg-green-100 text-green-800';
      case 'ANNULEE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'BASSE': return 'text-gray-600';
      case 'NORMALE': return 'text-blue-600';
      case 'HAUTE': return 'text-orange-600';
      case 'URGENTE': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Mes tâches</h3>
        <div className="flex gap-2">
          <button
            onClick={onCreateNew}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Nouvelle
          </button>
          <button
            onClick={onViewAll}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Voir tout →
          </button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg mx-auto mb-2">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </div>
          <div className="text-lg font-semibold text-gray-900">{tasks.overdue}</div>
          <div className="text-xs text-gray-600">En retard</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mx-auto mb-2">
            <Clock className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-lg font-semibold text-gray-900">{tasks.dueToday}</div>
          <div className="text-xs text-gray-600">Aujourd'hui</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mx-auto mb-2">
            <CheckSquare className="h-4 w-4 text-green-600" />
          </div>
          <div className="text-lg font-semibold text-gray-900">{tasks.completionRate}%</div>
          <div className="text-xs text-gray-600">Terminées</div>
        </div>
      </div>

      {/* Répartition par statut */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Répartition par statut</h4>
        <div className="flex flex-wrap gap-2">
          {Object.entries(tasks.byStatus).map(([status, count]) => (
            <span
              key={status}
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}
            >
              {statusLabels[status as keyof typeof statusLabels]}: {count}
            </span>
          ))}
        </div>
      </div>

      {/* Tâches récentes */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Tâches récentes</h4>
        <div className="space-y-2">
          {tasks.recentTasks.slice(0, 3).map((task) => (
            <div key={task.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {task.title}
                </div>
                {task.project && (
                  <div className="text-xs text-gray-600 truncate">
                    {task.project.title}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {priorityLabels[task.priority as keyof typeof priorityLabels]}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                  {statusLabels[task.status as keyof typeof statusLabels]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default TasksOverview;