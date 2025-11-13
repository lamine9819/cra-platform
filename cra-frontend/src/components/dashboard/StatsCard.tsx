// src/components/dashboard/StatsCard.tsx
import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'red' | 'gray' | 'yellow';
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  onClick?: () => void;
}

const colorClasses = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  purple: 'bg-purple-100 text-purple-600',
  red: 'bg-red-100 text-red-600',
  gray: 'bg-gray-100 text-gray-600',
  yellow: 'bg-yellow-100 text-yellow-600',
};

const trendColors = {
  up: 'text-green-600',
  down: 'text-red-600',
  stable: 'text-gray-600',
};

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
  trend,
  trendValue,
  onClick
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      case 'stable': return Minus;
      default: return null;
    }
  };

  const TrendIcon = getTrendIcon();

  return (
    <div 
      className={`bg-white rounded-lg shadow p-6 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
          
          {trend && trendValue !== undefined && TrendIcon && (
            <div className={`flex items-center mt-2 ${trendColors[trend]}`}>
              <TrendIcon className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">
                {trendValue > 0 && trend !== 'stable' ? '+' : ''}{trendValue}%
              </span>
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};
export default StatsCard;

