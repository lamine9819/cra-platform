// src/utils/reports.utils.ts
import { REPORT_TYPES, REPORT_LABELS, ReportType } from '../config/reports.config';
import { toast } from 'react-hot-toast';
/**
 * Génère un nom de fichier pour un rapport
 */
export const generateReportFilename = (
  type: ReportType,
  entityId?: string,
  extension: 'pdf' | 'xlsx' | 'csv' = 'pdf'
): string => {
  const timestamp = new Date().toISOString().split('T')[0];
  const suffix = entityId ? `_${entityId.substring(0, 8)}` : '';
  
  const typeNames: Record<ReportType, string> = {
    [REPORT_TYPES.PROJECT]: 'projet',
    [REPORT_TYPES.ACTIVITY]: 'activite',
    [REPORT_TYPES.USER]: 'utilisateur',
    [REPORT_TYPES.GLOBAL]: 'global'
  };
  
  return `rapport_${typeNames[type]}${suffix}_${timestamp}.${extension}`;
};

/**
 * Génère un nom de fichier pour un export
 */
export const generateExportFilename = (
  type: string,
  extension: 'xlsx' | 'csv' = 'xlsx'
): string => {
  const timestamp = new Date().toISOString().split('T')[0];
  return `export_${type}_${timestamp}.${extension}`;
};

/**
 * Valide les options de génération de rapport
 */
export const validateReportOptions = (options: {
  type: string;
  entityId?: string;
  dateRange?: { start: string; end: string };
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Vérifier le type
  const validTypes = Object.values(REPORT_TYPES) as ReportType[];
  if (!validTypes.includes(options.type as ReportType)) {
    errors.push('Type de rapport invalide');
  }
  
  // Vérifier entityId pour les rapports spécifiques
  const requiresEntityId: ReportType[] = [
    REPORT_TYPES.PROJECT, 
    REPORT_TYPES.ACTIVITY, 
    REPORT_TYPES.USER
  ];
  
  const reportType = options.type as ReportType;
  if (requiresEntityId.includes(reportType) && !options.entityId) {
    errors.push('ID d\'entité requis pour ce type de rapport');
  }
  
  // Le rapport global ne doit pas avoir d'entityId
  if (reportType === REPORT_TYPES.GLOBAL && options.entityId) {
    errors.push('ID d\'entité non autorisé pour le rapport global');
  }
  
  // Vérifier la plage de dates
  if (options.dateRange) {
    const { start, end } = options.dateRange;
    if (start && end && new Date(start) > new Date(end)) {
      errors.push('La date de début doit être antérieure à la date de fin');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Formate la taille d'un fichier
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Obtient les informations utilisateur depuis le localStorage
 */
export const getCurrentUser = (): { id: string; name: string } | null => {
  try {
    const userData = localStorage.getItem('cra_user_data');
    if (!userData) return null;
    
    const user = JSON.parse(userData);
    return {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`
    };
  } catch (error) {
    console.error('Erreur lecture données utilisateur:', error);
    return null;
  }
};

/**
 * Détermine si l'utilisateur peut générer un type de rapport
 */
export const canGenerateReport = (
  reportType: ReportType,
  userRole?: string
): boolean => {
  if (!userRole) return false;
  
  switch (reportType) {
    case REPORT_TYPES.GLOBAL:
      return userRole === 'ADMINISTRATEUR';
    case REPORT_TYPES.PROJECT:
      return ['CHERCHEUR', 'ADMINISTRATEUR'].includes(userRole);
    case REPORT_TYPES.ACTIVITY:
      return ['CHERCHEUR', 'ASSISTANT_CHERCHEUR', 'ADMINISTRATEUR'].includes(userRole);
    case REPORT_TYPES.USER:
      return ['CHERCHEUR', 'ASSISTANT_CHERCHEUR', 'TECHNICIEN_SUPERIEUR', 'ADMINISTRATEUR'].includes(userRole);
    default:
      return false;
  }
};

/**
 * Gère les erreurs de rapport avec des messages utilisateur
 */
export const handleReportError = (error: any): string => {
  if (typeof error === 'string') return error;
  
  const message = error?.message || error?.response?.data?.message;
  
  if (!message) return 'Une erreur inattendue s\'est produite';
  
  // Messages d'erreur spécifiques
  const errorMap: { [key: string]: string } = {
    'Permissions insuffisantes': 'Vous n\'avez pas les droits pour générer ce rapport',
    'Projet non trouvé': 'Le projet demandé n\'existe pas ou n\'est plus accessible',
    'Activité non trouvée': 'L\'activité demandée n\'existe pas ou n\'est plus accessible',
    'Utilisateur non trouvé': 'L\'utilisateur demandé n\'existe pas',
    'Type de rapport non supporté': 'Le type de rapport demandé n\'est pas disponible',
    'Network Error': 'Problème de connexion au serveur',
    'timeout': 'La génération du rapport a pris trop de temps'
  };
  
  // Rechercher un message correspondant
  for (const [key, userMessage] of Object.entries(errorMap)) {
    if (message.includes(key)) {
      return userMessage;
    }
  }
  
  return message;
};

/**
 * Crée un toast de notification pour les succès de rapport
 */
export const showReportSuccess = (reportType: ReportType, action: 'generated' | 'exported') => {
  const actionText = action === 'generated' ? 'généré' : 'exporté';
  const reportLabel = REPORT_LABELS[reportType];
  
  // Ici vous pouvez intégrer avec votre système de notifications/toast
  console.info(`✅ ${reportLabel} ${actionText} avec succès`);
  
  // Si vous utilisez une librairie de toast comme react-hot-toast :
   toast.success(`${reportLabel} ${actionText} avec succès`);
};

/**
 * Débounce pour les recherches
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};