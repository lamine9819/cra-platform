// src/components/dashboard/RecentActivities.tsx
import React from 'react';
import { Calendar} from 'lucide-react';

interface Activity {
  id: string;
  title: string;
  startDate?: string;
  endDate?: string;
  project?: {
    id: string;
    title: string;
  };
}

interface RecentActivitiesProps {
  activities: Activity[];
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({ activities }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non définie';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Calendar className="h-8 w-8 mx-auto mb-2" />
        <p>Aucune activité récente</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.slice(0, 5).map((activity) => (
        <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg flex-shrink-0">
            <Calendar className="h-4 w-4 text-blue-600" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">
              {activity.title}
            </div>
            
            {activity.project && (
              <div className="text-xs text-gray-600 truncate">
                Projet: {activity.project.title}
              </div>
            )}
            
            <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              {activity.startDate && activity.endDate ? (
                <span>{formatDate(activity.startDate)} - {formatDate(activity.endDate)}</span>
              ) : activity.startDate ? (
                <span>Début: {formatDate(activity.startDate)}</span>
              ) : (
                <span>Dates non définies</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
export default RecentActivities;
