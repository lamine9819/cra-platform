// src/utils/formValidation.ts - Version mise à jour avec commentaires
import { z } from 'zod';

// Validation personnalisée pour les dates
const dateValidation = z.string().refine((val) => {
  const date = new Date(val);
  return !isNaN(date.getTime());
}, {
  message: "Date invalide"
});

// Schema pour valider un champ de formulaire
const formFieldSchema = z.object({
  id: z.string().min(1, 'ID de champ requis'),
  type: z.enum(['text', 'number', 'email', 'textarea', 'select', 'checkbox', 'radio', 'date', 'time', 'file']),
  label: z.string().min(1, 'Label requis'),
  placeholder: z.string().optional(),
  required: z.boolean().default(false),
  validation: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
    message: z.string().optional(),
  }).optional(),
  options: z.array(z.object({
    value: z.union([z.string(), z.number()]),
    label: z.string(),
  })).optional(),
  defaultValue: z.any().optional(),
  description: z.string().optional(),
});

// Schema pour valider le schéma complet du formulaire
const formSchemaSchema = z.object({
  title: z.string().min(1, 'Titre du schéma requis'),
  description: z.string().optional(),
  version: z.string().default('1.0.0'),
  fields: z.array(formFieldSchema).min(1, 'Au moins un champ est requis'),
  settings: z.object({
    allowMultipleSubmissions: z.boolean().default(false),
    showProgress: z.boolean().default(false),
    submitButtonText: z.string().default('Soumettre'),
    successMessage: z.string().default('Formulaire soumis avec succès'),
  }).optional(),
});

export const createFormSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(200),
  description: z.string().max(2000).optional(),
  schema: formSchemaSchema,
  activityId: z.string().cuid().optional(),
  isActive: z.boolean().default(true),
});

export const updateFormSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(2000).optional(),
  schema: formSchemaSchema.optional(),
  isActive: z.boolean().optional(),
});

export const submitFormResponseSchema = z.object({
  data: z.record(z.any(), z.string()).refine(
    (data) => Object.keys(data).length > 0,
    { message: "Au moins un champ doit être rempli" }
  ),
});

export const formResponseQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
  formId: z.string().cuid().optional(),
  respondentId: z.string().cuid().optional(),
  startDate: dateValidation.optional(),
  endDate: dateValidation.optional(),
});

// =============================================
// NOUVELLES VALIDATIONS POUR LES COMMENTAIRES
// =============================================

// Schema pour ajouter un commentaire
export const addCommentSchema = z.object({
  content: z.string()
    .min(1, 'Le contenu du commentaire est requis')
    .max(2000, 'Le commentaire ne peut pas dépasser 2000 caractères')
    .transform((val) => val.trim()),
});

// Schema pour mettre à jour un commentaire
export const updateCommentSchema = z.object({
  content: z.string()
    .min(1, 'Le contenu du commentaire est requis')
    .max(2000, 'Le commentaire ne peut pas dépasser 2000 caractères')
    .transform((val) => val.trim()),
});

// Schema pour les paramètres de recherche de commentaires
export const commentSearchQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(50)).optional(),
  search: z.string().min(1, 'Terme de recherche requis').max(200),
  orderBy: z.enum(['asc', 'desc']).default('desc'),
});

// Schema pour les paramètres de pagination des commentaires
export const commentPaginationSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(50)).optional(),
  orderBy: z.enum(['asc', 'desc']).default('desc'),
});

// =============================================
// VALIDATIONS EXISTANTES MAINTENUES
// =============================================

// Schema pour créer un template
export const createTemplateSchema = z.object({
  name: z.string().min(3, 'Le nom doit contenir au moins 3 caractères').max(200),
  description: z.string().max(2000).optional(),
  schema: formSchemaSchema,
  category: z.string().min(1, 'La catégorie est requise').max(100).optional(),
});

// Schema pour dupliquer un formulaire
export const duplicateFormSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(200),
  includeResponses: z.boolean().default(false),
});

// Schema pour cloner un formulaire
export const cloneFormSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(200),
  includeResponses: z.boolean().default(false),
});

// Schema pour valider les paramètres de recherche
export const formSearchQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
  search: z.string().max(200).optional(),
  activityId: z.string().cuid().optional(),
  creatorId: z.string().cuid().optional(),
  isActive: z.string().transform((val) => val === 'true').optional(),
  status: z.enum(['active', 'inactive', 'all']).optional(),
  publicOnly: z.boolean().default(false),
});

// Schema pour valider les paramètres d'export
export const exportQuerySchema = z.object({
  format: z.enum(['xlsx', 'csv']).default('xlsx'),
  includeMetadata: z.string().transform((val) => val === 'true').default(false),
  includeComments: z.string().transform((val) => val === 'true').default(false),
});

// Schema pour les statistiques
export const statsQuerySchema = z.object({
  period: z.string().transform(Number).pipe(z.number().min(1).max(365)).optional(),
  type: z.enum(['overview', 'detailed', 'responses', 'comments']).default('overview'),
});

// =============================================
// VALIDATIONS POUR LES NOUVELLES FONCTIONNALITÉS
// =============================================

// Schema pour les paramètres d'audit
export const auditQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
  action: z.string().optional(),
  userId: z.string().cuid().optional(),
  startDate: dateValidation.optional(),
  endDate: dateValidation.optional(),
});

// Schema pour les paramètres de statistiques globales
export const globalStatsQuerySchema = z.object({
  period: z.enum(['day', 'week', 'month', 'quarter', 'year']).default('month'),
  includeInactive: z.boolean().default(false),
});

// Schema pour la gestion des permissions
export const permissionSchema = z.object({
  userId: z.string().cuid(),
  permissions: z.array(z.enum([
    'VIEW', 'EDIT', 'DELETE', 'COMMENT', 'EXPORT', 'MANAGE_COMMENTS'
  ])),
});

// Schema pour les préférences utilisateur
export const userPreferencesSchema = z.object({
  defaultPageSize: z.number().min(5).max(100).default(10),
  autoSave: z.boolean().default(true),
  showPreview: z.boolean().default(true),
  exportFormat: z.enum(['xlsx', 'csv']).default('xlsx'),
  emailNotifications: z.boolean().default(true),
  language: z.enum(['fr', 'en']).default('fr'),
});

// =============================================
// VALIDATION AVANCÉE POUR LES FORMULAIRES
// =============================================

// Validation avancée pour les champs de formulaire
const validateFieldValue = (field: any, value: any): { isValid: boolean; error?: string } => {
  // Si le champ n'est pas requis et la valeur est vide, c'est valide
  if (!field.required && (value === undefined || value === null || value === '')) {
    return { isValid: true };
  }

  // Si le champ est requis et la valeur est vide, c'est invalide
  if (field.required && (value === undefined || value === null || value === '')) {
    return { isValid: false, error: `Le champ "${field.label}" est requis` };
  }

  // Validation par type
  switch (field.type) {
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return { isValid: false, error: `Le champ "${field.label}" doit être un email valide` };
      }
      break;

    case 'number':
      if (isNaN(Number(value))) {
        return { isValid: false, error: `Le champ "${field.label}" doit être un nombre` };
      }
      break;

    case 'date':
      if (isNaN(Date.parse(value))) {
        return { isValid: false, error: `Le champ "${field.label}" doit être une date valide` };
      }
      break;

    case 'select':
    case 'radio':
      if (field.options && !field.options.some((opt: any) => opt.value === value)) {
        return { isValid: false, error: `La valeur sélectionnée pour "${field.label}" n'est pas valide` };
      }
      break;

    case 'checkbox':
      if (!Array.isArray(value) && typeof value !== 'boolean') {
        return { isValid: false, error: `Le champ "${field.label}" doit être un booléen ou un tableau` };
      }
      break;
  }

  // Validation personnalisée
  if (field.validation) {
    const validation = field.validation;
    
    // Validation de longueur
    if (typeof value === 'string') {
      if (validation.min && value.length < validation.min) {
        return { 
          isValid: false, 
          error: `Le champ "${field.label}" doit contenir au moins ${validation.min} caractères` 
        };
      }
      if (validation.max && value.length > validation.max) {
        return { 
          isValid: false, 
          error: `Le champ "${field.label}" ne peut pas dépasser ${validation.max} caractères` 
        };
      }
    }

    // Validation de valeur numérique
    if (field.type === 'number') {
      const numValue = Number(value);
      if (validation.min && numValue < validation.min) {
        return { 
          isValid: false, 
          error: `Le champ "${field.label}" doit être supérieur ou égal à ${validation.min}` 
        };
      }
      if (validation.max && numValue > validation.max) {
        return { 
          isValid: false, 
          error: `Le champ "${field.label}" doit être inférieur ou égal à ${validation.max}` 
        };
      }
    }

    // Validation par pattern
    if (validation.pattern && typeof value === 'string') {
      const regex = new RegExp(validation.pattern);
      if (!regex.test(value)) {
        return { 
          isValid: false, 
          error: validation.message || `Le champ "${field.label}" ne respecte pas le format requis` 
        };
      }
    }
  }

  return { isValid: true };
};

// Validation complète d'une réponse de formulaire
const validateFormResponse = (formSchema: any, responseData: Record<string, any>): {
  isValid: boolean;
  errors: string[];
  sanitizedData: Record<string, any>;
} => {
  const errors: string[] = [];
  const sanitizedData: Record<string, any> = {};

  if (!formSchema.fields || !Array.isArray(formSchema.fields)) {
    return {
      isValid: false,
      errors: ['Schéma de formulaire invalide'],
      sanitizedData: {}
    };
  }

  // Valider chaque champ
  for (const field of formSchema.fields) {
    const value = responseData[field.id];
    const validation = validateFieldValue(field, value);
    
    if (!validation.isValid) {
      errors.push(validation.error!);
    } else {
      // Nettoyer et formater la valeur
      sanitizedData[field.id] = sanitizeFieldValue(field, value);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData
  };
};

// Nettoyer et formater une valeur de champ
const sanitizeFieldValue = (field: any, value: any): any => {
  if (value === undefined || value === null) {
    return null;
  }

  switch (field.type) {
    case 'text':
    case 'textarea':
    case 'email':
      return typeof value === 'string' ? value.trim() : String(value).trim();
    
    case 'number':
      return Number(value);
    
    case 'date':
      return new Date(value).toISOString();
    
    case 'checkbox':
      if (Array.isArray(value)) {
        return value;
      }
      return Boolean(value);
    
    default:
      return value;
  }
};

// =============================================
// VALIDATION DES COMMENTAIRES AVANCÉE
// =============================================

// Validation du contenu d'un commentaire avec filtres
const validateCommentContent = (content: string): { isValid: boolean; error?: string; sanitized?: string } => {
  if (!content || typeof content !== 'string') {
    return { isValid: false, error: 'Le contenu du commentaire est requis' };
  }

  const trimmed = content.trim();
  
  if (trimmed.length === 0) {
    return { isValid: false, error: 'Le commentaire ne peut pas être vide' };
  }
  
  if (trimmed.length > 2000) {
    return { isValid: false, error: 'Le commentaire ne peut pas dépasser 2000 caractères' };
  }

  // Filtrage basique des contenus inappropriés (à adapter selon vos besoins)
  const inappropriateWords = ['spam', 'hack', 'malware']; // Liste basique d'exemple
  const hasInappropriate = inappropriateWords.some(word => 
    trimmed.toLowerCase().includes(word.toLowerCase())
  );
  
  if (hasInappropriate) {
    return { isValid: false, error: 'Le contenu du commentaire contient des termes inappropriés' };
  }

  return { isValid: true, sanitized: trimmed };
};

// =============================================
// VALIDATION DES PERMISSIONS
// =============================================

// Validation des rôles autorisés pour une action
const validateUserPermission = (userRole: string, requiredRoles: string[]): boolean => {
  return requiredRoles.includes(userRole);
};

// Validation des permissions de formulaire
const validateFormPermissions = (
  userRole: string, 
  userId: string, 
  formCreatorId: string, 
  action: string
): boolean => {
  // Admin peut tout faire
  if (userRole === 'ADMINISTRATEUR') return true;
  
  // Créateur peut tout faire sur ses formulaires
  if (userId === formCreatorId) return true;
  
  // Définir les permissions par action et rôle
  const permissions: Record<string, string[]> = {
    'VIEW': ['CHERCHEUR', 'ASSISTANT_CHERCHEUR', 'TECHNICIEN_SUPERIEUR', 'ADMINISTRATEUR'],
    'CREATE': ['CHERCHEUR', 'ASSISTANT_CHERCHEUR', 'TECHNICIEN_SUPERIEUR', 'ADMINISTRATEUR'],
    'EDIT': ['CHERCHEUR', 'TECHNICIEN_SUPERIEUR', 'ADMINISTRATEUR'],
    'DELETE': ['CHERCHEUR', 'TECHNICIEN_SUPERIEUR', 'ADMINISTRATEUR'],
    'SUBMIT_RESPONSE': ['CHERCHEUR', 'ASSISTANT_CHERCHEUR', 'TECHNICIEN_SUPERIEUR', 'ADMINISTRATEUR'],
    'VIEW_RESPONSES': ['CHERCHEUR', 'TECHNICIEN_SUPERIEUR', 'ADMINISTRATEUR'],
    'EXPORT': ['CHERCHEUR', 'TECHNICIEN_SUPERIEUR', 'ADMINISTRATEUR'],
    'COMMENT': ['CHERCHEUR', 'ASSISTANT_CHERCHEUR', 'TECHNICIEN_SUPERIEUR', 'ADMINISTRATEUR'],
    'MANAGE_COMMENTS': ['CHERCHEUR', 'TECHNICIEN_SUPERIEUR', 'ADMINISTRATEUR'],
  };
  
  return permissions[action]?.includes(userRole) || false;
};

// =============================================
// VALIDATION DES DONNÉES D'EXPORT
// =============================================

// Schema pour les options d'export avancées
export const advancedExportSchema = z.object({
  format: z.enum(['xlsx', 'csv', 'json', 'pdf']).default('xlsx'),
  includeMetadata: z.boolean().default(false),
  includeComments: z.boolean().default(false),
  includeStatistics: z.boolean().default(false),
  dateRange: z.object({
    start: dateValidation.optional(),
    end: dateValidation.optional(),
  }).optional(),
  fields: z.array(z.string()).optional(), // Champs spécifiques à exporter
  groupBy: z.enum(['user', 'date', 'field']).optional(),
  anonymize: z.boolean().default(false), // Anonymiser les données personnelles
});

// =============================================
// VALIDATION DES FILTRES AVANCÉS
// =============================================

// Schema pour les filtres de recherche avancés
export const advancedSearchSchema = z.object({
  query: z.string().min(1).max(200),
  searchIn: z.array(z.enum(['title', 'description', 'content', 'comments'])).default(['title', 'description']),
  filters: z.object({
    createdAfter: dateValidation.optional(),
    createdBefore: dateValidation.optional(),
    hasResponses: z.boolean().optional(),
    hasComments: z.boolean().optional(),
    isActive: z.boolean().optional(),
    creatorIds: z.array(z.string().cuid()).optional(),
    activityIds: z.array(z.string().cuid()).optional(),
    responseCountMin: z.number().min(0).optional(),
    responseCountMax: z.number().min(0).optional(),
  }).optional(),
  sortBy: z.enum(['created', 'updated', 'title', 'responses', 'comments']).default('created'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

// =============================================
// VALIDATION DES MÉTRIQUES ET RAPPORTS
// =============================================

// Schema pour les rapports personnalisés
export const customReportSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  type: z.enum(['summary', 'detailed', 'comparison', 'trend']),
  parameters: z.object({
    formIds: z.array(z.string().cuid()).optional(),
    dateRange: z.object({
      start: dateValidation,
      end: dateValidation,
    }),
    includeCharts: z.boolean().default(true),
    includeRawData: z.boolean().default(false),
    grouping: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
  }),
  schedule: z.object({
    enabled: z.boolean().default(false),
    frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
    recipients: z.array(z.string().email()).optional(),
  }).optional(),
});

// =============================================
// EXPORTS FINAUX
// =============================================

// Exporter toutes les fonctions de validation
export {
  formFieldSchema,
  formSchemaSchema,
  validateFieldValue,
  validateFormResponse,
  validateCommentContent,
  validateUserPermission,
  validateFormPermissions,
};