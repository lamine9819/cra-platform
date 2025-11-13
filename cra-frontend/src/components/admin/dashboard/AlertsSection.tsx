// src/components/admin/dashboard/AlertsSection.tsx

import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { DashboardAlert } from '../../../types/admin.types';
import { cn } from '../../../lib/utils';

interface AlertsSectionProps {
  alerts: DashboardAlert[];
}

const getAlertIcon = (type: string) => {
  switch (type) {
    case 'error':
      return AlertCircle;
    case 'warning':
      return AlertTriangle;
    case 'info':
      return Info;
    default:
      return Info;
  }
};

const getAlertStyles = (type: string) => {
  switch (type) {
    case 'error':
      return {
        container: 'bg-red-50 border-red-200',
        icon: 'text-red-600',
        badge: 'bg-red-100 text-red-800 border-red-300',
      };
    case 'warning':
      return {
        container: 'bg-yellow-50 border-yellow-200',
        icon: 'text-yellow-600',
        badge: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      };
    case 'info':
      return {
        container: 'bg-blue-50 border-blue-200',
        icon: 'text-blue-600',
        badge: 'bg-blue-100 text-blue-800 border-blue-300',
      };
    default:
      return {
        container: 'bg-gray-50 border-gray-200',
        icon: 'text-gray-600',
        badge: 'bg-gray-100 text-gray-800 border-gray-300',
      };
  }
};

export const AlertsSection: React.FC<AlertsSectionProps> = ({ alerts }) => {
  // Trier les alertes par priorité
  const sortedAlerts = [...alerts].sort((a, b) => a.priority - b.priority);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          Alertes Système
          {alerts.length > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {alerts.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedAlerts.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <Info className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-sm text-gray-500">Aucune alerte système</p>
            <p className="text-xs text-gray-400 mt-1">
              Tout fonctionne normalement
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedAlerts.map((alert, index) => {
              const Icon = getAlertIcon(alert.type);
              const styles = getAlertStyles(alert.type);

              return (
                <div
                  key={index}
                  className={cn(
                    'p-4 rounded-lg border transition-all hover:shadow-sm',
                    styles.container
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', styles.icon)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-sm text-gray-900">
                          {alert.title}
                        </h4>
                        <Badge
                          variant="outline"
                          className={cn('flex-shrink-0', styles.badge)}
                        >
                          {alert.count}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
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
