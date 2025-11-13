// src/utils/dashboardHelpers.ts
import { DashboardResponse } from '../services/dashboard.api';

/**
 * Formate la taille des fichiers en format lisible
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Formate une date en format français court
 */
export const formatDate = (dateString: string | Date): string => {
  if (!dateString) return 'Non définie';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  if (isNaN(date.getTime())) return 'Date invalide';
  
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

/**
 * Formate une date avec l'heure en format français
 */
export const formatDateTime = (dateString: string | Date): string => {
  if (!dateString) return 'Non définie';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  if (isNaN(date.getTime())) return 'Date/Heure invalide';
  
  return date.toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Formate une date relative (il y a X jours, etc.)
 */
export const formatRelativeDate = (dateString: string | Date): string => {
  if (!dateString) return 'Jamais';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  if (isNaN(date.getTime())) return 'Date invalide';
  
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.ceil(diffTime / (1000 * 60));

  if (diffMinutes < 60) {
    return `Il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
  } else if (diffHours < 24) {
    return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
  } else if (diffDays === 1) {
    return 'Hier';
  } else if (diffDays < 7) {
    return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `Il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `Il y a ${months} mois`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `Il y a ${years} an${years > 1 ? 's' : ''}`;
  }
};

/**
 * Retourne la classe CSS pour les couleurs de statut
 */
export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    // Statuts projets
    'PLANIFIE': 'bg-gray-100 text-gray-800',
    'EN_COURS': 'bg-blue-100 text-blue-800',
    'SUSPENDU': 'bg-yellow-100 text-yellow-800',
    'TERMINE': 'bg-green-100 text-green-800',
    'ARCHIVE': 'bg-purple-100 text-purple-800',
    
    // Statuts tâches
    'A_FAIRE': 'bg-gray-100 text-gray-800',
    'EN_REVISION': 'bg-yellow-100 text-yellow-800',
    'TERMINEE': 'bg-green-100 text-green-800',
    'ANNULEE': 'bg-red-100 text-red-800',
    
    // Priorités
    'BASSE': 'bg-gray-100 text-gray-800',
    'NORMALE': 'bg-blue-100 text-blue-800',
    'HAUTE': 'bg-orange-100 text-orange-800',
    'URGENTE': 'bg-red-100 text-red-800',
    
    // Types documents
    'RAPPORT': 'bg-blue-100 text-blue-800',
    'FICHE_ACTIVITE': 'bg-green-100 text-green-800',
    'FICHE_TECHNIQUE': 'bg-purple-100 text-purple-800',
    'DONNEES_EXPERIMENTALES': 'bg-orange-100 text-orange-800',
    'FORMULAIRE': 'bg-yellow-100 text-yellow-800',
    'IMAGE': 'bg-pink-100 text-pink-800',
    'AUTRE': 'bg-gray-100 text-gray-800'
  };
  
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Retourne le label français pour un statut
 */
export const getStatusLabel = (status: string): string => {
  const statusLabels: Record<string, string> = {
    // Statuts projets
    'PLANIFIE': 'Planifié',
    'EN_COURS': 'En cours',
    'SUSPENDU': 'Suspendu',
    'TERMINE': 'Terminé',
    'ARCHIVE': 'Archivé',
    
    // Statuts tâches
    'A_FAIRE': 'À faire',
    'EN_REVISION': 'En révision',
    'TERMINEE': 'Terminée',
    'ANNULEE': 'Annulée',
    
    // Priorités
    'BASSE': 'Basse',
    'NORMALE': 'Normale',
    'HAUTE': 'Haute',
    'URGENTE': 'Urgente',
    
    // Types documents
    'RAPPORT': 'Rapport',
    'FICHE_ACTIVITE': 'Fiche activité',
    'FICHE_TECHNIQUE': 'Fiche technique',
    'DONNEES_EXPERIMENTALES': 'Données expérimentales',
    'FORMULAIRE': 'Formulaire',
    'IMAGE': 'Image',
    'AUTRE': 'Autre'
  };
  
  return statusLabels[status] || status;
};

/**
 * Retourne la couleur pour les priorités
 */
export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'BASSE': return 'text-gray-600';
    case 'NORMALE': return 'text-blue-600';
    case 'HAUTE': return 'text-orange-600';
    case 'URGENTE': return 'text-red-600';
    default: return 'text-gray-600';
  }
};

/**
 * Calcule la direction de tendance
 */
export const calculateTrendDirection = (current: number, previous: number): 'up' | 'down' | 'stable' => {
  if (current > previous) return 'up';
  if (current < previous) return 'down';
  return 'stable';
};

/**
 * Calcule le pourcentage de changement
 */
export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

/**
 * Retourne le label du score de productivité
 */
export const getProductivityScoreLabel = (score: number): string => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Bon';
  if (score >= 40) return 'Moyen';
  return 'À améliorer';
};

/**
 * Retourne la couleur du score de productivité
 */
export const getProductivityScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
};

/**
 * Retourne la classe CSS pour l'arrière-plan du score
 */
export const getProductivityScoreBgColor = (score: number): string => {
  if (score >= 80) return 'bg-green-50 border-green-200';
  if (score >= 60) return 'bg-yellow-50 border-yellow-200';
  return 'bg-red-50 border-red-200';
};

/**
 * Formate un nombre avec séparateurs de milliers
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('fr-FR').format(num);
};

/**
 * Formate un pourcentage
 */
export const formatPercentage = (value: number, decimals: number = 0): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Vérifie si une date est dans la plage spécifiée
 */
export const isDateInRange = (date: string | Date, days: number): boolean => {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffTime = now.getTime() - targetDate.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  
  return diffDays <= days && diffDays >= 0;
};

/**
 * Tronque un texte à une longueur spécifiée
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Génère une couleur basée sur une chaîne (pour les avatars, etc.)
 */
export const generateColorFromString = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-gray-500'
  ];
  
  return colors[Math.abs(hash) % colors.length];
};

/**
 * Retourne les initiales d'un nom complet
 */
export const getInitials = (firstName: string, lastName: string): string => {
  const first = firstName ? firstName.charAt(0).toUpperCase() : '';
  const last = lastName ? lastName.charAt(0).toUpperCase() : '';
  return `${first}${last}`;
};

/**
 * Validation d'email simple
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Debounce function pour optimiser les recherches
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Fonction d'export des données du dashboard
 */
export const exportDashboardData = async (
  dashboardData: DashboardResponse,
  format: 'json' | 'csv' = 'json'
): Promise<void> => {
  if (!dashboardData) {
    throw new Error('Aucune donnée à exporter');
  }

  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
  const filename = `dashboard_${timestamp}`;

  if (format === 'json') {
    const dataStr = JSON.stringify(dashboardData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    downloadFile(dataBlob, `${filename}.json`);
  } else if (format === 'csv') {
    const csvData = convertDashboardToCSV(dashboardData);
    const dataBlob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    
    downloadFile(dataBlob, `${filename}.csv`);
  }
};

/**
 * Convertit les données du dashboard en CSV
 */
const convertDashboardToCSV = (data: DashboardResponse): string => {
  const csvData = [
    ['Métrique', 'Valeur'],
    ['Utilisateur', `${data.user.firstName} ${data.user.lastName}`],
    ['Rôle', data.user.role],
    ['Département', data.user.department || 'Non spécifié'],
    ['Score de productivité', data.summary.productivityScore.toString()],
    ['Taux de completion tâches', data.summary.taskCompletionRate.toString()],
    ['Participation projets', data.summary.projectParticipation.toString()],
    ['Contribution documents', data.summary.documentContribution.toString()],
    ['Engagement formulaires', data.summary.formEngagement.toString()],
    ['Total projets', data.projects.total.toString()],
    ['Projets utilisateur', data.projects.userProjects.toString()],
    ['Total tâches', data.tasks.total.toString()],
    ['Tâches en retard', data.tasks.overdue.toString()],
    ['Tâches dues aujourd\'hui', data.tasks.dueToday.toString()],
    ['Total documents', data.documents.total.toString()],
    ['Documents utilisateur', data.documents.userDocuments.toString()],
    ['Taille totale documents (MB)', data.documents.totalSizeMB.toString()],
    ['Total activités', data.activities.total.toString()],
    ['Activités avec résultats', data.activities.withResults.toString()]
  ];

  return csvData.map(row => row.join(',')).join('\n');
};

/**
 * Télécharge un fichier
 */
const downloadFile = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Cache simple pour optimiser les performances
 */
class SimpleCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  remove(key: string): void {
    this.cache.delete(key);
  }

  size(): number {
    return this.cache.size;
  }
}

export const dashboardCache = new SimpleCache();

/**
 * Constantes utiles pour le dashboard
 */
export const DASHBOARD_CONSTANTS = {
  REFRESH_INTERVALS: {
    QUICK_STATS: 30 * 1000, // 30 secondes
    DASHBOARD: 5 * 60 * 1000, // 5 minutes
    PERFORMANCE: 10 * 60 * 1000, // 10 minutes
    FORMS: 2 * 60 * 1000, // 2 minutes
  },
  PERIODS: {
    WEEK: 'week',
    MONTH: 'month',
    QUARTER: 'quarter',
    YEAR: 'year'
  } as const,
  CACHE_KEYS: {
    DASHBOARD: 'dashboard_data',
    QUICK_STATS: 'quick_stats',
    PERFORMANCE: 'performance_metrics',
    FORM_STATS: 'form_stats'
  } as const,
  THRESHOLDS: {
    PRODUCTIVITY: {
      EXCELLENT: 80,
      GOOD: 60,
      AVERAGE: 40
    },
    OVERDUE_TASKS: {
      WARNING: 5,
      CRITICAL: 10
    },
    DATA_FRESHNESS: {
      WARNING: 10 * 60 * 1000, // 10 minutes
      CRITICAL: 30 * 60 * 1000  // 30 minutes
    }
  },
  DISPLAY: {
    MAX_RECENT_ITEMS: 5,
    MAX_CHART_DATA_POINTS: 12,
    DATE_FORMAT: 'fr-FR',
    TIME_FORMAT: '24h'
  }
};

/**
 * Utilitaires pour les couleurs de graphiques
 */
export const CHART_COLORS = {
  primary: '#3B82F6',
  secondary: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#8B5CF6',
  success: '#10B981',
  gray: '#6B7280',
  gradient: {
    blue: ['#3B82F6', '#1D4ED8'],
    green: ['#10B981', '#047857'],
    purple: ['#8B5CF6', '#7C3AED'],
    orange: ['#F59E0B', '#D97706']
  }
};

/**
 * Générateur de données de test pour le développement
 */
export const generateMockData = {
  quickStats: () => ({
    activeTasks: Math.floor(Math.random() * 20) + 5,
    activeProjects: Math.floor(Math.random() * 10) + 2,
    myDocuments: Math.floor(Math.random() * 50) + 10,
    unreadNotifications: Math.floor(Math.random() * 15)
  }),
  
  performanceMetrics: () => ({
    taskTrend: {
      thisMonth: Math.floor(Math.random() * 30) + 10,
      lastMonth: Math.floor(Math.random() * 25) + 8,
      change: Math.floor(Math.random() * 40) - 20,
      direction: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable'
    },
    activityTrend: {
      thisMonth: Math.floor(Math.random() * 15) + 5,
      lastMonth: Math.floor(Math.random() * 12) + 3,
      change: Math.floor(Math.random() * 30) - 15,
      direction: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable'
    }
  })
};

export default {
  formatFileSize,
  formatDate,
  formatDateTime,
  formatRelativeDate,
  getStatusColor,
  getStatusLabel,
  getPriorityColor,
  calculateTrendDirection,
  calculatePercentageChange,
  getProductivityScoreLabel,
  getProductivityScoreColor,
  getProductivityScoreBgColor,
  formatNumber,
  formatPercentage,
  isDateInRange,
  truncateText,
  generateColorFromString,
  getInitials,
  isValidEmail,
  debounce,
  exportDashboardData,
  dashboardCache,
  DASHBOARD_CONSTANTS,
  CHART_COLORS,
  generateMockData
};