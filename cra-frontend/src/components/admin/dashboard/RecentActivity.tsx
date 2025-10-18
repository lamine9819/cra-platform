// src/components/admin/dashboard/RecentActivity.tsx

import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, Edit, Trash2, Eye, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { RecentActivityItem } from '../../../types/admin.types';
import { cn } from '../../../lib/utils';

interface RecentActivityProps {
  activities: RecentActivityItem[];
}

const getActionIcon = (action: string) => {
  switch (action) {
    case 'CREATE':
      return Plus;
    case 'UPDATE':
      return Edit;
    case 'DELETE':
      return Trash2;
    case 'VIEW':
      return Eye;
    default:
      return FileText;
  }
};

const getActionColor = (action: string) => {
  switch (action) {
    case 'CREATE':
      return 'text-green-600 bg-green-100';
    case 'UPDATE':
      return 'text-blue-600 bg-blue-100';
    case 'DELETE':
      return 'text-red-600 bg-red-100';
    case 'VIEW':
      return 'text-gray-600 bg-gray-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

const getActionText = (action: string) => {
  switch (action) {
    case 'CREATE':
      return 'a créé';
    case 'UPDATE':
      return 'a modifié';
    case 'DELETE':
      return 'a supprimé';
    case 'VIEW':
      return 'a consulté';
    default:
      return 'a effectué une action sur';
  }
};

const getEntityTypeText = (entityType: string) => {
  const types: Record<string, string> = {
    activity: 'une activité',
    project: 'un projet',
    user: 'un utilisateur',
    theme: 'un thème',
    station: 'une station',
    transfer: 'un transfert',
    task: 'une tâche',
    document: 'un document',
    comment: 'un commentaire',
    notification: 'une notification',
  };
  return types[entityType] || entityType;
};

const getUserInitials = (name: string | null) => {
  if (!name) return '??';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-500" />
          Activité Récente
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        {activities.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-500">Aucune activité récente</p>
          </div>
        ) : (
          <div className="space-y-3 overflow-y-auto h-full pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {activities.map((activity) => {
              const Icon = getActionIcon(activity.action);
              const colorClass = getActionColor(activity.action);

              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 flex-shrink-0 rounded-full bg-green-100 text-green-700 text-sm font-semibold flex items-center justify-center">
                    {getUserInitials(activity.userName)}
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <div className={cn('p-1.5 rounded-lg flex-shrink-0', colorClass)}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          <span className="font-semibold">
                            {activity.userName || 'Utilisateur inconnu'}
                          </span>{' '}
                          {getActionText(activity.action)}{' '}
                          {getEntityTypeText(activity.entityType)}
                        </p>
                        {activity.details && (
                          <p className="text-xs text-gray-600 mt-0.5 truncate">
                            {activity.details.activityTitle ||
                              activity.details.projectTitle ||
                              activity.details.title ||
                              ''}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDistanceToNow(new Date(activity.timestamp), {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
