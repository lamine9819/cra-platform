// src/components/admin/dashboard/StatsCard.tsx

import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '../../ui/Card';
import { cn } from '../../../lib/utils';

interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'cyan';
}

const colorClasses = {
  blue: 'bg-blue-500 text-white',
  green: 'bg-green-500 text-white',
  orange: 'bg-orange-500 text-white',
  red: 'bg-red-500 text-white',
  purple: 'bg-purple-500 text-white',
  cyan: 'bg-cyan-500 text-white',
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue',
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
              {trend && (
                <div
                  className={cn(
                    'flex items-center text-sm font-medium',
                    trend.isPositive ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {trend.isPositive ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  )}
                  {Math.abs(trend.value)}%
                </div>
              )}
            </div>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <div
            className={cn(
              'w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0',
              colorClasses[color]
            )}
          >
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
