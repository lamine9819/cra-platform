// src/components/dashboard/ProductivityScore.tsx
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ProductivityScoreProps {
  score: number;
  trending: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
    period: string;
  };
  metrics: {
    taskCompletion: number;
    projectParticipation: number;
    documentContribution: number;
    formEngagement: number;
  };
}

const ProductivityScore: React.FC<ProductivityScoreProps> = ({
  score,
  trending,
  metrics
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Bon';
    if (score >= 40) return 'Moyen';
    return 'À améliorer';
  };

  const getTrendIcon = () => {
    switch (trending.direction) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable': return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Score de productivité</h2>
          <p className="text-gray-600">Évaluation globale de votre performance</p>
        </div>
        
        <div className="text-center">
          <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
            {score}%
          </div>
          <div className="text-sm text-gray-600">{getScoreLabel(score)}</div>
          
          <div className="flex items-center justify-center mt-2 text-sm">
            {getTrendIcon()}
            <span className="ml-1">
              {trending.percentage > 0 && trending.direction !== 'stable' ? '+' : ''}
              {trending.percentage}% ({trending.period})
            </span>
          </div>
        </div>
      </div>
      
      {/* Métriques détaillées */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">{metrics.taskCompletion}%</div>
          <div className="text-xs text-gray-600">Tâches terminées</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">{metrics.projectParticipation}%</div>
          <div className="text-xs text-gray-600">Participation projets</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">{metrics.documentContribution}%</div>
          <div className="text-xs text-gray-600">Contribution docs</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">{metrics.formEngagement}%</div>
          <div className="text-xs text-gray-600">Engagement formulaires</div>
        </div>
      </div>
    </div>
  );
}
export default ProductivityScore;