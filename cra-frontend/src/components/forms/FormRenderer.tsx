// src/components/forms/FormRenderer.tsx - Composant pour remplir les formulaires
import React, { useState, useEffect, useCallback } from 'react';
import { Form, FormField, SubmitFormResponseRequest } from '../../services/formsApi';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Alert from '../ui/Alert';

interface FormRendererProps {
  form: Form;
  onSubmit: (data: SubmitFormResponseRequest) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  readonly?: boolean;
  initialData?: Record<string, any>;
}

interface FieldError {
  field: string;
  message: string;
}

const FormRenderer: React.FC<FormRendererProps> = ({
  form,
  onSubmit,
  loading = false,
  error = null,
  readonly = false,
  initialData = {}
}) => {
  const [responses, setResponses] = useState<Record<string, any>>(initialData);
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showProgress = form.schema.settings?.showProgress && form.schema.fields.length > 3;
  const fieldsPerStep = showProgress ? Math.ceil(form.schema.fields.length / 3) : form.schema.fields.length;

  // Initialiser les réponses avec les valeurs par défaut
  useEffect(() => {
    const defaultValues: Record<string, any> = {};
    form.schema.fields.forEach(field => {
      if (field.defaultValue !== undefined) {
        defaultValues[field.id] = field.defaultValue;
      }
    });
    setResponses(prev => ({ ...defaultValues, ...prev }));
  }, [form.schema.fields]);

  // Validation d'un champ
  const validateField = useCallback((field: FormField, value: any): string | null => {
    // Champ requis
    if (field.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return `${field.label} est requis`;
    }

    if (!value && !field.required) return null;

    // Validation par type
    switch (field.type) {
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Veuillez entrer une adresse email valide';
        }
        break;

      case 'number':
        if (value && isNaN(Number(value))) {
          return 'Veuillez entrer un nombre valide';
        }
        break;

      case 'text':
      case 'textarea':
        if (field.validation?.min && value.length < field.validation.min) {
          return `Minimum ${field.validation.min} caractères requis`;
        }
        if (field.validation?.max && value.length > field.validation.max) {
          return `Maximum ${field.validation.max} caractères autorisés`;
        }
        if (field.validation?.pattern) {
          const regex = new RegExp(field.validation.pattern);
          if (!regex.test(value)) {
            return field.validation.message || 'Format invalide';
          }
        }
        break;

      case 'checkbox':
        if (field.required && (!Array.isArray(value) || value.length === 0)) {
          return 'Veuillez sélectionner au moins une option';
        }
        break;
    }

    return null;
  }, []);

  // Validation de toutes les réponses
  const validateForm = useCallback((): boolean => {
    const errors: FieldError[] = [];
    
    form.schema.fields.forEach(field => {
      const value = responses[field.id];
      const error = validateField(field, value);
      if (error) {
        errors.push({ field: field.id, message: error });
      }
    });

    setFieldErrors(errors);
    return errors.length === 0;
  }, [form.schema.fields, responses, validateField]);

  // Gestion du changement de valeur
  const handleFieldChange = useCallback((fieldId: string, value: any) => {
    setResponses(prev => ({ ...prev, [fieldId]: value }));
    
    // Supprimer l'erreur du champ si elle existe
    setFieldErrors(prev => prev.filter(error => error.field !== fieldId));
  }, []);

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit({ data: responses });
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Navigation entre les étapes
  const nextStep = () => {
    const currentFields = getCurrentStepFields();
    const currentErrors: FieldError[] = [];
    
    currentFields.forEach(field => {
      const value = responses[field.id];
      const error = validateField(field, value);
      if (error) {
        currentErrors.push({ field: field.id, message: error });
      }
    });

    if (currentErrors.length === 0) {
      setCurrentStep(prev => Math.min(prev + 1, getTotalSteps() - 1));
    } else {
      setFieldErrors(currentErrors);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const getCurrentStepFields = (): FormField[] => {
    if (!showProgress) return form.schema.fields;
    
    const startIndex = currentStep * fieldsPerStep;
    const endIndex = startIndex + fieldsPerStep;
    return form.schema.fields.slice(startIndex, endIndex);
  };

  const getTotalSteps = (): number => {
    return showProgress ? Math.ceil(form.schema.fields.length / fieldsPerStep) : 1;
  };

  // Rendu d'un champ
  const renderField = (field: FormField) => {
    const value = responses[field.id] || '';
    const fieldError = fieldErrors.find(e => e.field === field.id);
    const hasError = !!fieldError;

    const commonProps = {
      id: field.id,
      required: field.required,
      disabled: readonly || loading || isSubmitting,
      placeholder: field.placeholder,
      className: hasError ? 'border-red-500' : ''
    };

    const handleChange = (newValue: any) => {
      handleFieldChange(field.id, newValue);
    };

    switch (field.type) {
      case 'text':
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            {...commonProps}
          />
        );

      case 'email':
        return (
          <Input
            type="email"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            {...commonProps}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            {...commonProps}
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            rows={4}
            {...commonProps}
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            {...commonProps}
          />
        );

      case 'time':
        return (
          <Input
            type="time"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            {...commonProps}
          />
        );

      case 'select':
        return (
          <Select
            value={value}
            onValueChange={handleChange}
            {...commonProps}
          >
            <option value="">Sélectionner une option</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={field.id}
                  id={`${field.id}-${index}`}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => handleChange(e.target.value)}
                  disabled={commonProps.disabled}
                  className="rounded-full border-gray-300"
                />
                <label 
                  htmlFor={`${field.id}-${index}`}
                  className="text-sm text-gray-700"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => {
              const isChecked = Array.isArray(value) && value.includes(option.value);
              return (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`${field.id}-${index}`}
                    checked={isChecked}
                    onChange={(e) => {
                      const currentValues = Array.isArray(value) ? value : [];
                      if (e.target.checked) {
                        handleChange([...currentValues, option.value]);
                      } else {
                        handleChange(currentValues.filter(v => v !== option.value));
                      }
                    }}
                    disabled={commonProps.disabled}
                    className="rounded border-gray-300"
                  />
                  <label 
                    htmlFor={`${field.id}-${index}`}
                    className="text-sm text-gray-700"
                  >
                    {option.label}
                  </label>
                </div>
              );
            })}
          </div>
        );

      case 'file':
        return (
          <input
            type="file"
            id={field.id}
            onChange={(e) => handleChange(e.target.files?.[0] || null)}
            disabled={commonProps.disabled}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        );

      default:
        return (
          <div className="text-red-500 text-sm">
            Type de champ non supporté: {field.type}
          </div>
        );
    }
  };

  const currentFields = getCurrentStepFields();
  const totalSteps = getTotalSteps();
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="max-w-2xl mx-auto">
      {/* En-tête du formulaire */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {form.title}
        </h1>
        {form.description && (
          <p className="text-gray-600 text-lg">
            {form.description}
          </p>
        )}
      </div>

      {/* Barre de progression */}
      {showProgress && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              Étape {currentStep + 1} sur {totalSteps}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(((currentStep + 1) / totalSteps) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Messages d'erreur globaux */}
      {error && (
        <Alert type="error" className="mb-6">
          {error}
        </Alert>
      )}

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {currentFields.map((field) => {
          const fieldError = fieldErrors.find(e => e.field === field.id);
          
          return (
            <div key={field.id}>
              <label 
                htmlFor={field.id}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              
              {field.description && (
                <p className="text-sm text-gray-600 mb-2">
                  {field.description}
                </p>
              )}
              
              {renderField(field)}
              
              {fieldError && (
                <p className="text-red-500 text-sm mt-1">
                  {fieldError.message}
                </p>
              )}
            </div>
          );
        })}

        {/* Boutons de navigation */}
        <div className="flex justify-between pt-6">
          <div>
            {showProgress && currentStep > 0 && (
              <Button
                type="button"
                variant="secondary"
                onClick={prevStep}
                disabled={isSubmitting}
              >
                Précédent
              </Button>
            )}
          </div>

          <div className="flex gap-3">
            {showProgress && !isLastStep ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={isSubmitting}
              >
                Suivant
              </Button>
            ) : (
              <Button
                type="submit"
                loading={isSubmitting}
                disabled={readonly}
              >
                {form.schema.settings?.submitButtonText || 'Soumettre'}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default FormRenderer;