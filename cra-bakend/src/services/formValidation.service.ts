// src/services/formValidation.service.ts - Service amélioré
import { FormField, FormSchema, FormValidationResult, FieldValidationResult } from '../types/form.types';

export class FormValidationService {
  
  /**
   * Valide une réponse complète de formulaire
   */
  static validateFormResponse(formSchema: FormSchema, responseData: Record<string, any>): FormValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const sanitizedData: Record<string, any> = {};

    if (!formSchema.fields || !Array.isArray(formSchema.fields)) {
      return {
        isValid: false,
        errors: ['Schéma de formulaire invalide'],
        sanitizedData: {},
        warnings: []
      };
    }

    // Valider chaque champ défini dans le schéma
    for (const field of formSchema.fields) {
      // Les champs photo sont validés séparément via le tableau photos[]
      // Ils ne sont pas stockés dans responseData
      if (field.type === 'photo') {
        // Ignorer la validation des champs photo ici
        // Ils sont validés via submitFormResponseSchema.photos
        continue;
      }

      const value = responseData[field.id];
      const validation = this.validateField(field, value);

      if (!validation.isValid && validation.error) {
        errors.push(validation.error);
      } else {
        sanitizedData[field.id] = validation.sanitizedValue;
      }
    }

    // Vérifier les champs non définis dans le schéma
    const definedFields = new Set(formSchema.fields.map(f => f.id));
    const extraFields = Object.keys(responseData).filter(key => !definedFields.has(key));
    
    if (extraFields.length > 0) {
      warnings.push(`Champs non définis détectés: ${extraFields.join(', ')}`);
    }

    // Validation des règles métier spécifiques
    const businessValidation = this.validateBusinessRules(formSchema, sanitizedData);
    errors.push(...businessValidation.errors);
    warnings.push(...businessValidation.warnings);

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData,
      warnings
    };
  }

  /**
   * Valide un champ individuel
   */
  static validateField(field: FormField, value: any): FieldValidationResult {
    // Si le champ n'est pas requis et la valeur est vide
    if (!field.required && this.isEmpty(value)) {
      return { 
        isValid: true, 
        sanitizedValue: this.getDefaultValue(field)
      };
    }

    // Si le champ est requis et la valeur est vide
    if (field.required && this.isEmpty(value)) {
      return { 
        isValid: false, 
        error: `Le champ "${field.label}" est requis` 
      };
    }

    // Validation par type de champ
    const typeValidation = this.validateByType(field, value);
    if (!typeValidation.isValid) {
      return typeValidation;
    }

    // Validation des contraintes personnalisées
    const constraintValidation = this.validateConstraints(field, value);
    if (!constraintValidation.isValid) {
      return constraintValidation;
    }

    // Sanitization de la valeur
    const sanitizedValue = this.sanitizeValue(field, value);

    return { 
      isValid: true, 
      sanitizedValue 
    };
  }

  /**
   * Validation par type de champ
   */
  private static validateByType(field: FormField, value: any): FieldValidationResult {
    switch (field.type) {
      case 'email':
        return this.validateEmail(field, value);
      
      case 'number':
        return this.validateNumber(field, value);
      
      case 'date':
        return this.validateDate(field, value);
      
      case 'time':
        return this.validateTime(field, value);
      
      case 'select':
      case 'radio':
        return this.validateSelection(field, value);
      
      case 'checkbox':
        return this.validateCheckbox(field, value);
      
      case 'file':
      case 'photo':
        return this.validateFile(field, value);

      case 'text':
      case 'textarea':
        return this.validateText(field, value);
      
      default:
        return { isValid: true, sanitizedValue: value };
    }
  }

  /**
   * Validation des contraintes personnalisées
   */
  private static validateConstraints(field: FormField, value: any): FieldValidationResult {
    if (!field.validation) {
      return { isValid: true, sanitizedValue: value };
    }

    const validation = field.validation;

    // Validation de longueur pour les chaînes
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

    // Validation de plage pour les nombres
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

    // Validation par pattern regex
    if (validation.pattern && typeof value === 'string') {
      try {
        const regex = new RegExp(validation.pattern);
        if (!regex.test(value)) {
          return {
            isValid: false,
            error: validation.message || `Le champ "${field.label}" ne respecte pas le format requis`
          };
        }
      } catch (error) {
        return {
          isValid: false,
          error: `Pattern de validation invalide pour le champ "${field.label}"`
        };
      }
    }

    return { isValid: true, sanitizedValue: value };
  }

  /**
   * Validations spécifiques par type
   */
  private static validateEmail(field: FormField, value: any): FieldValidationResult {
    if (typeof value !== 'string') {
      return {
        isValid: false,
        error: `Le champ "${field.label}" doit être une chaîne de caractères`
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return {
        isValid: false,
        error: `Le champ "${field.label}" doit être un email valide`
      };
    }

    return { isValid: true, sanitizedValue: value.toLowerCase().trim() };
  }

  private static validateNumber(field: FormField, value: any): FieldValidationResult {
    const numValue = Number(value);
    if (isNaN(numValue)) {
      return {
        isValid: false,
        error: `Le champ "${field.label}" doit être un nombre valide`
      };
    }

    return { isValid: true, sanitizedValue: numValue };
  }

  private static validateDate(field: FormField, value: any): FieldValidationResult {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return {
        isValid: false,
        error: `Le champ "${field.label}" doit être une date valide`
      };
    }

    return { isValid: true, sanitizedValue: date.toISOString().split('T')[0] };
  }

  private static validateTime(field: FormField, value: any): FieldValidationResult {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (typeof value !== 'string' || !timeRegex.test(value)) {
      return {
        isValid: false,
        error: `Le champ "${field.label}" doit être une heure valide (HH:MM)`
      };
    }

    return { isValid: true, sanitizedValue: value };
  }

  private static validateSelection(field: FormField, value: any): FieldValidationResult {
    if (!field.options || !Array.isArray(field.options)) {
      return {
        isValid: false,
        error: `Configuration invalide pour le champ "${field.label}"`
      };
    }

    const validOptions = field.options.map(opt => opt.value);
    if (!validOptions.includes(value)) {
      return {
        isValid: false,
        error: `La valeur sélectionnée pour "${field.label}" n'est pas valide`
      };
    }

    return { isValid: true, sanitizedValue: value };
  }

  private static validateCheckbox(field: FormField, value: any): FieldValidationResult {
    // Pour une case à cocher simple
    if (typeof value === 'boolean') {
      return { isValid: true, sanitizedValue: value };
    }

    // Pour des cases à cocher multiples
    if (Array.isArray(value)) {
      if (field.options) {
        const validOptions = field.options.map(opt => opt.value);
        const invalidValues = value.filter(v => !validOptions.includes(v));
        
        if (invalidValues.length > 0) {
          return {
            isValid: false,
            error: `Valeurs invalides pour "${field.label}": ${invalidValues.join(', ')}`
          };
        }
      }
      
      return { isValid: true, sanitizedValue: value };
    }

    return {
      isValid: false,
      error: `Le champ "${field.label}" doit être un booléen ou un tableau`
    };
  }

  private static validateFile(field: FormField, value: any): FieldValidationResult {
    // Dans le contexte d'une API, les fichiers sont généralement des strings (URLs ou base64)
    if (typeof value !== 'string') {
      return {
        isValid: false,
        error: `Le champ "${field.label}" doit être un fichier valide`
      };
    }

    // Validation basique de l'URL ou du chemin de fichier
    if (value.length === 0) {
      return {
        isValid: false,
        error: `Le champ "${field.label}" nécessite un fichier`
      };
    }

    return { isValid: true, sanitizedValue: value };
  }

  private static validateText(field: FormField, value: any): FieldValidationResult {
    if (typeof value !== 'string') {
      return {
        isValid: false,
        error: `Le champ "${field.label}" doit être du texte`
      };
    }

    return { isValid: true, sanitizedValue: value.trim() };
  }

  /**
   * Validation des règles métier
   */
  private static validateBusinessRules(_formSchema: FormSchema, _data: Record<string, any>): {
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    

    return { errors, warnings };
  }

  /**
   * Méthodes utilitaires
   */
  private static isEmpty(value: any): boolean {
    return value === undefined || 
           value === null || 
           value === '' || 
           (Array.isArray(value) && value.length === 0);
  }

  private static getDefaultValue(field: FormField): any {
    if (field.defaultValue !== undefined) {
      return field.defaultValue;
    }

    switch (field.type) {
      case 'text':
      case 'textarea':
      case 'email':
        return '';
      case 'number':
        return 0;
      case 'checkbox':
        return field.options ? [] : false;
      case 'select':
      case 'radio':
        return field.options?.[0]?.value || null;
      default:
        return null;
    }
  }

  private static sanitizeValue(field: FormField, value: any): any {
    if (this.isEmpty(value)) {
      return this.getDefaultValue(field);
    }

    switch (field.type) {
      case 'text':
      case 'textarea':
        return String(value).trim();
      
      case 'email':
        return String(value).toLowerCase().trim();
      
      case 'number':
        return Number(value);
      
      case 'date':
        return new Date(value).toISOString().split('T')[0];
      
      case 'time':
        return String(value).trim();
      
      case 'checkbox':
        if (Array.isArray(value)) {
          return value.filter(v => v !== null && v !== undefined);
        }
        return Boolean(value);
      
      default:
        return value;
    }
  }

  /**
   * Valide la structure d'un schéma de formulaire
   */
  static validateFormSchema(schema: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!schema || typeof schema !== 'object') {
      errors.push('Le schéma doit être un objet valide');
      return { isValid: false, errors };
    }

    if (!schema.title || typeof schema.title !== 'string') {
      errors.push('Le titre du formulaire est requis');
    }

    if (!schema.fields || !Array.isArray(schema.fields)) {
      errors.push('Les champs du formulaire sont requis et doivent être un tableau');
      return { isValid: false, errors };
    }

    if (schema.fields.length === 0) {
      errors.push('Le formulaire doit contenir au moins un champ');
    }

    // Valider chaque champ
    const fieldIds = new Set();
    schema.fields.forEach((field: any, index: number) => {
      const fieldErrors = this.validateFieldSchema(field, index);
      errors.push(...fieldErrors);

      // Vérifier l'unicité des IDs
      if (field.id) {
        if (fieldIds.has(field.id)) {
          errors.push(`ID de champ dupliqué: ${field.id}`);
        }
        fieldIds.add(field.id);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valide la structure d'un champ de formulaire
   */
  private static validateFieldSchema(field: any, index: number): string[] {
    const errors: string[] = [];
    const fieldRef = `Champ ${index + 1}`;

    if (!field || typeof field !== 'object') {
      errors.push(`${fieldRef}: doit être un objet valide`);
      return errors;
    }

    if (!field.id || typeof field.id !== 'string') {
      errors.push(`${fieldRef}: ID requis et doit être une chaîne`);
    }

    if (!field.label || typeof field.label !== 'string') {
      errors.push(`${fieldRef}: Label requis et doit être une chaîne`);
    }

    const validTypes = ['text', 'number', 'email', 'textarea', 'select', 'checkbox', 'radio', 'date', 'time', 'file', 'photo'];
    if (!field.type || !validTypes.includes(field.type)) {
      errors.push(`${fieldRef}: Type invalide. Types autorisés: ${validTypes.join(', ')}`);
    }

    // Validation spécifique pour les champs avec options
    if (['select', 'radio', 'checkbox'].includes(field.type)) {
      if (!field.options || !Array.isArray(field.options) || field.options.length === 0) {
        errors.push(`${fieldRef}: Les champs de type ${field.type} doivent avoir des options`);
      } else {
        field.options.forEach((option: any, optIndex: number) => {
          if (!option || typeof option !== 'object') {
            errors.push(`${fieldRef}, Option ${optIndex + 1}: doit être un objet`);
          } else {
            if (option.value === undefined || option.value === null) {
              errors.push(`${fieldRef}, Option ${optIndex + 1}: valeur requise`);
            }
            if (!option.label || typeof option.label !== 'string') {
              errors.push(`${fieldRef}, Option ${optIndex + 1}: label requis`);
            }
          }
        });
      }
    }

    return errors;
  }
}