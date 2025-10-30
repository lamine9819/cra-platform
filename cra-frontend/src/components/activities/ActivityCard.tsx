// src/components/activities/ActivityCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Users,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import type { Activity } from '../../types/activity.types';
import {
  ActivityTypeLabels,
  ActivityTypeColors,
  ActivityStatusLabels,
  ActivityStatusColors,
} from '../../types/activity.types';

interface ActivityCardProps {
  activity: Activity;
  showProject?: boolean;
  onEdit?: (activity: Activity) => void;
  onDelete?: (activity: Activity) => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  showProject = true,
  onEdit,
  onDelete,
}) => {
  const getLifecycleIcon = () => {
    switch (activity.lifecycleStatus) {
      case 'NOUVELLE':
        return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case 'RECONDUITE':
        return <Clock className="w-4 h-4 text-purple-600" />;
      case 'CLOTUREE':
        return <CheckCircle className="w-4 h-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const getStatusIcon = () => {
    switch (activity.status) {
      case 'EN_COURS':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'PLANIFIEE':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'SUSPENDUE':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'ANNULEE':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'CLOTUREE':
        return <CheckCircle className="w-4 h-4 text-gray-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        {/* En-tête avec badges */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <Link
              to={`/chercheur/activities/${activity.id}`}
              className="text-lg font-semibold text-gray-900 hover:text-green-600 transition-colors"
            >
              {activity.code && (
                <span className="text-sm text-gray-500 font-normal mr-2">
                  [{activity.code}]
                </span>
              )}
              {activity.title}
            </Link>
          </div>
        </div>

        {/* Badges Type */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              ActivityTypeColors[activity.type]
            }`}
          >
            {ActivityTypeLabels[activity.type]}
          </span>
          {activity.isRecurrent && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 flex items-center">
              {getLifecycleIcon()}
              <span className="ml-1">Récurrente ({activity.recurrenceCount})</span>
            </span>
          )}
        </div>

        {/* Informations principales simplifiées */}
        <div className="space-y-2 text-sm text-gray-600">
          {/* Statut */}
          {activity.status && (
            <div className="flex items-center">
              {getStatusIcon()}
              <span className="font-medium text-gray-700 ml-2">Statut:</span>
              <span className="ml-1">{ActivityStatusLabels[activity.status]}</span>
            </div>
          )}

          {/* Responsable */}
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-2 text-gray-400" />
            <span className="font-medium text-gray-700">Responsable:</span>
            <span className="ml-1">
              {activity.responsible.firstName} {activity.responsible.lastName}
            </span>
          </div>

          {/* Dates */}
          {(activity.startDate || activity.endDate) && (
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              <span>
                {activity.startDate
                  ? new Date(activity.startDate).toLocaleDateString('fr-FR')
                  : '?'}{' '}
                →{' '}
                {activity.endDate
                  ? new Date(activity.endDate).toLocaleDateString('fr-FR')
                  : '?'}
              </span>
            </div>
          )}
        </div>

        {/* Compteurs */}
        {activity._count && (activity._count.tasks > 0 || activity._count.documents > 0) && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-4 text-sm text-gray-600">
            {activity._count.tasks > 0 && (
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" />
                <span>{activity._count.tasks} tâche(s)</span>
              </div>
            )}
            {activity._count.documents > 0 && (
              <div className="flex items-center">
                <span className="mr-1">📄</span>
                <span>{activity._count.documents} document(s)</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {(onEdit || onDelete) && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(activity)}
                className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              >
                Modifier
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(activity)}
                className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                Supprimer
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityCard;
