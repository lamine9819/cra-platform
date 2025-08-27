// src/components/dashboard/PerformanceChart.tsx
import React from 'react';
import {  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface PerformanceChartProps {
  taskMetrics: {
    thisMonth: number;
    lastMonth: number;
    change: number;
    direction: 'up' | 'down' | 'stable';
  };
  activityMetrics: {
    thisMonth: number;
    lastMonth: number;
    change: number;
    direction: 'up' | 'down' | 'stable';
  };
  period: string;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({
  taskMetrics,
  activityMetrics,
  period
}) => {
  const data = [
    {
      name: 'Mois précédent',
      taches: taskMetrics.lastMonth,
      activites: activityMetrics.lastMonth,
    },
    {
      name: 'Ce mois',
      taches: taskMetrics.thisMonth,
      activites: activityMetrics.thisMonth,
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Évolution de l'activité</h3>
        <span className="text-sm text-gray-500 capitalize">{period}</span>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="taches" fill="#3B82F6" name="Tâches" />
            <Bar dataKey="activites" fill="#10B981" name="Activités" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className={`text-lg font-semibold ${taskMetrics.direction === 'up' ? 'text-green-600' : taskMetrics.direction === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
            {taskMetrics.change > 0 && taskMetrics.direction !== 'stable' ? '+' : ''}{taskMetrics.change}%
          </div>
          <div className="text-sm text-gray-600">Évolution tâches</div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-semibold ${activityMetrics.direction === 'up' ? 'text-green-600' : activityMetrics.direction === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
            {activityMetrics.change > 0 && activityMetrics.direction !== 'stable' ? '+' : ''}{activityMetrics.change}%
          </div>
          <div className="text-sm text-gray-600">Évolution activités</div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;