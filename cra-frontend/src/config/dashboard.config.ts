// src/config/dashboard.config.ts - Configuration du dashboard
export const DASHBOARD_CONFIG = {
  // Intervalles de rafraîchissement (en millisecondes)
  REFRESH_INTERVALS: {
    QUICK_STATS: 30 * 1000, // 30 secondes
    DASHBOARD: 5 * 60 * 1000, // 5 minutes
    PERFORMANCE: 10 * 60 * 1000, // 10 minutes
    FORMS: 2 * 60 * 1000, // 2 minutes
  },
  
  // Périodes disponibles
  PERIODS: [
    { value: 'week', label: 'Cette semaine' },
    { value: 'month', label: 'Ce mois' },
    { value: 'quarter', label: 'Ce trimestre' },
    { value: 'year', label: 'Cette année' }
  ],
  
  // Couleurs pour les graphiques
  CHART_COLORS: {
    primary: '#3B82F6',
    secondary: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#8B5CF6',
    success: '#10B981',
    gray: '#6B7280'
  },
  
  // Seuils pour les alertes
  THRESHOLDS: {
    productivity: {
      excellent: 80,
      good: 60,
      average: 40
    },
    overdueTasks: {
      warning: 5,
      critical: 10
    },
    dataFreshness: {
      warning: 10 * 60 * 1000, // 10 minutes
      critical: 30 * 60 * 1000  // 30 minutes
    }
  },
  
  // Paramètres d'affichage
  DISPLAY: {
    maxRecentItems: 5,
    maxChartDataPoints: 12,
    dateFormat: 'fr-FR',
    timeFormat: '24h'
  },
  
  // Cache TTL (Time To Live)
  CACHE_TTL: {
    dashboard: 5 * 60 * 1000, // 5 minutes
    quickStats: 1 * 60 * 1000, // 1 minute
    performance: 10 * 60 * 1000, // 10 minutes
    forms: 2 * 60 * 1000 // 2 minutes
  }
};