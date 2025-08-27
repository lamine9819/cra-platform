// src/config/reports.config.ts
import { FileText, Activity, Users, BarChart3 } from 'lucide-react';

export const REPORT_TYPES = {
  PROJECT: 'project',
  ACTIVITY: 'activity', 
  USER: 'user',
  GLOBAL: 'global'
} as const;

export type ReportType = typeof REPORT_TYPES[keyof typeof REPORT_TYPES];

export const REPORT_LABELS = {
  [REPORT_TYPES.PROJECT]: 'Rapport de Projet',
  [REPORT_TYPES.ACTIVITY]: 'Rapport d\'Activité',
  [REPORT_TYPES.USER]: 'Rapport Utilisateur',
  [REPORT_TYPES.GLOBAL]: 'Rapport Global'
};

export const REPORT_ICONS = {
  [REPORT_TYPES.PROJECT]: FileText,
  [REPORT_TYPES.ACTIVITY]: Activity,
  [REPORT_TYPES.USER]: Users,
  [REPORT_TYPES.GLOBAL]: BarChart3
};

export const REPORT_COLORS = {
  [REPORT_TYPES.PROJECT]: 'blue',
  [REPORT_TYPES.ACTIVITY]: 'green',
  [REPORT_TYPES.USER]: 'purple',
  [REPORT_TYPES.GLOBAL]: 'orange'
} as const;

export const EXPORT_TYPES = {
  USERS: 'users',
  PROJECTS: 'projects',
  TASKS: 'tasks',
  DOCUMENTS: 'documents'
} as const;

export type ExportType = typeof EXPORT_TYPES[keyof typeof EXPORT_TYPES];

export const EXPORT_LABELS = {
  [EXPORT_TYPES.USERS]: 'Utilisateurs',
  [EXPORT_TYPES.PROJECTS]: 'Projets', 
  [EXPORT_TYPES.TASKS]: 'Tâches',
  [EXPORT_TYPES.DOCUMENTS]: 'Documents'
};

export const LANGUAGES = {
  FR: 'fr',
  EN: 'en'
} as const;

export const LANGUAGE_LABELS = {
  [LANGUAGES.FR]: 'Français',
  [LANGUAGES.EN]: 'English'
};

export const REPORT_PERIODS = [
  { value: 7, label: '7 derniers jours' },
  { value: 30, label: '30 derniers jours' },
  { value: 90, label: '3 derniers mois' },
  { value: 365, label: 'Année courante' }
];

export const DEFAULT_REPORT_OPTIONS = {
  language: LANGUAGES.FR,
  includeGraphics: false,
  format: 'pdf'
} as const;