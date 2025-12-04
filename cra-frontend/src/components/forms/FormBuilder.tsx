// src/components/forms/FormBuilder.tsx - Constructeur de formulaire

import React, { useState } from 'react';
import {
  FormField,
  FormSchema,
} from '../../types/form.types';
import {
  Plus,
  Trash2,
  GripVertical,
  Eye,
  Settings,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface FormBuilderProps {
  initialSchema?: FormSchema;
  onSave: (schema: FormSchema) => void;
  onCancel?: () => void;
}

const FIELD_TYPES = [
  { value: 'text', label: 'Texte court' },
  { value: 'textarea', label: 'Texte long' },
  { value: 'number', label: 'Nombre' },
  { value: 'email', label: 'Email' },
  { value: 'date', label: 'Date' },
  { value: 'time', label: 'Heure' },
  { value: 'select', label: 'Liste déroulante' },
  { value: 'radio', label: 'Boutons radio' },
  { value: 'checkbox', label: 'Cases à cocher' },
  { value: 'photo', label: 'Photo' },
] as const;

export const FormBuilder: React.FC<FormBuilderProps> = ({
  initialSchema,
  onSave,
  onCancel,
}) => {
  const [schema, setSchema] = useState<FormSchema>(
    initialSchema || {
      title: '',
      description: '',
      version: '1.0',
      fields: [],
      settings: {
        allowMultipleSubmissions: true,
        showProgress: false,
        submitButtonText: 'Soumettre',
        successMessage: 'Merci pour votre réponse!',
        enableOfflineMode: true,
      },
    }
  );

  const [expandedField, setExpandedField] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Ajouter un nouveau champ
  const addField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type: 'text',
      label: 'Nouveau champ',
      placeholder: '',
      required: false,
      options: [],
    };

    setSchema((prev) => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));

    setExpandedField(newField.id);
  };

  // Supprimer un champ
  const removeField = (fieldId: string) => {
    setSchema((prev) => ({
      ...prev,
      fields: prev.fields.filter((f) => f.id !== fieldId),
    }));
  };

  // Mettre à jour un champ
  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setSchema((prev) => ({
      ...prev,
      fields: prev.fields.map((f) =>
        f.id === fieldId ? { ...f, ...updates } : f
      ),
    }));
  };

  // Déplacer un champ vers le haut
  const moveFieldUp = (index: number) => {
    if (index === 0) return;

    setSchema((prev) => {
      const newFields = [...prev.fields];
      [newFields[index - 1], newFields[index]] = [
        newFields[index],
        newFields[index - 1],
      ];
      return { ...prev, fields: newFields };
    });
  };

  // Déplacer un champ vers le bas
  const moveFieldDown = (index: number) => {
    if (index === schema.fields.length - 1) return;

    setSchema((prev) => {
      const newFields = [...prev.fields];
      [newFields[index], newFields[index + 1]] = [
        newFields[index + 1],
        newFields[index],
      ];
      return { ...prev, fields: newFields };
    });
  };

  // Ajouter une option pour select/radio/checkbox
  const addOption = (fieldId: string) => {
    const field = schema.fields.find((f) => f.id === fieldId);
    if (!field) return;

    const newOption = {
      value: `option_${Date.now()}`,
      label: 'Nouvelle option',
    };

    updateField(fieldId, {
      options: [...(field.options || []), newOption],
    });
  };

  // Supprimer une option
  const removeOption = (fieldId: string, optionValue: string) => {
    const field = schema.fields.find((f) => f.id === fieldId);
    if (!field) return;

    updateField(fieldId, {
      options: (field.options || []).filter((o) => o.value !== optionValue),
    });
  };

  // Mettre à jour une option
  const updateOption = (
    fieldId: string,
    optionValue: string,
    updates: { value?: string; label?: string }
  ) => {
    const field = schema.fields.find((f) => f.id === fieldId);
    if (!field) return;

    updateField(fieldId, {
      options: (field.options || []).map((o) =>
        o.value === optionValue ? { ...o, ...updates } : o
      ),
    });
  };

  // Valider le schéma
  const validateSchema = (): boolean => {
    if (!schema.title.trim()) {
      toast.error('Le titre du formulaire est requis');
      return false;
    }

    if (schema.fields.length === 0) {
      toast.error('Ajoutez au moins un champ au formulaire');
      return false;
    }

    for (const field of schema.fields) {
      if (!field.label.trim()) {
        toast.error(`Le label du champ est requis`);
        return false;
      }

      if (
        ['select', 'radio', 'checkbox'].includes(field.type) &&
        (!field.options || field.options.length === 0)
      ) {
        toast.error(`Le champ "${field.label}" nécessite au moins une option`);
        return false;
      }
    }

    return true;
  };

  // Sauvegarder le schéma
  const handleSave = () => {
    if (!validateSchema()) return;
    onSave(schema);
  };

  // Rendre l'éditeur d'un champ
  const renderFieldEditor = (field: FormField, index: number) => {
    const isExpanded = expandedField === field.id;

    return (
      <div
        key={field.id}
        className="bg-white border border-gray-200 rounded-lg mb-4"
      >
        {/* En-tête du champ */}
        <div className="flex items-center justify-between p-4 bg-gray-50">
          <div className="flex items-center space-x-3 flex-1">
            <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
            <div className="flex-1">
              <div className="font-medium text-gray-900">
                {field.label || 'Champ sans titre'}
              </div>
              <div className="text-sm text-gray-500">
                {FIELD_TYPES.find((t) => t.value === field.type)?.label}
                {field.required && (
                  <span className="ml-2 text-red-500">Requis</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => moveFieldUp(index)}
              disabled={index === 0}
              className="p-2 hover:bg-gray-200 rounded disabled:opacity-30"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => moveFieldDown(index)}
              disabled={index === schema.fields.length - 1}
              className="p-2 hover:bg-gray-200 rounded disabled:opacity-30"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() =>
                setExpandedField(isExpanded ? null : field.id)
              }
              className="p-2 hover:bg-gray-200 rounded"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => removeField(field.id)}
              className="p-2 hover:bg-red-100 rounded text-red-600"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Configuration du champ */}
        {isExpanded && (
          <div className="p-4 space-y-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Label du champ
              </label>
              <input
                type="text"
                value={field.label}
                onChange={(e) =>
                  updateField(field.id, { label: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de champ
              </label>
              <select
                value={field.type}
                onChange={(e) =>
                  updateField(field.id, {
                    type: e.target.value as FormField['type'],
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                {FIELD_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Placeholder
              </label>
              <input
                type="text"
                value={field.placeholder || ''}
                onChange={(e) =>
                  updateField(field.id, { placeholder: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={field.description || ''}
                onChange={(e) =>
                  updateField(field.id, { description: e.target.value })
                }
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id={`required-${field.id}`}
                checked={field.required}
                onChange={(e) =>
                  updateField(field.id, { required: e.target.checked })
                }
                className="mr-2"
              />
              <label
                htmlFor={`required-${field.id}`}
                className="text-sm text-gray-700"
              >
                Champ requis
              </label>
            </div>

            {/* Options pour select, radio, checkbox */}
            {['select', 'radio', 'checkbox'].includes(field.type) && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Options
                  </label>
                  <button
                    type="button"
                    onClick={() => addOption(field.id)}
                    className="text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    + Ajouter une option
                  </button>
                </div>

                <div className="space-y-2">
                  {(field.options || []).map((option) => (
                    <div
                      key={option.value}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="text"
                        value={option.label}
                        onChange={(e) =>
                          updateOption(field.id, option.value, {
                            label: e.target.value,
                          })
                        }
                        placeholder="Label de l'option"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeOption(field.id, option.value)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Configuration photo */}
            {field.type === 'photo' && (
              <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700">
                  Configuration photo
                </h4>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`gps-${field.id}`}
                    checked={field.photoConfig?.enableGPS || false}
                    onChange={(e) =>
                      updateField(field.id, {
                        photoConfig: {
                          ...field.photoConfig,
                          enableGPS: e.target.checked,
                        },
                      })
                    }
                    className="mr-2"
                  />
                  <label
                    htmlFor={`gps-${field.id}`}
                    className="text-sm text-gray-700"
                  >
                    Activer la géolocalisation GPS
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`caption-${field.id}`}
                    checked={field.photoConfig?.enableCaption || false}
                    onChange={(e) =>
                      updateField(field.id, {
                        photoConfig: {
                          ...field.photoConfig,
                          enableCaption: e.target.checked,
                        },
                      })
                    }
                    className="mr-2"
                  />
                  <label
                    htmlFor={`caption-${field.id}`}
                    className="text-sm text-gray-700"
                  >
                    Permettre l'ajout de légendes
                  </label>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Nombre maximum de photos
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={field.photoConfig?.maxPhotos || 1}
                    onChange={(e) =>
                      updateField(field.id, {
                        photoConfig: {
                          ...field.photoConfig,
                          maxPhotos: parseInt(e.target.value) || 1,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* Validation pour nombre */}
            {field.type === 'number' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Valeur minimum
                  </label>
                  <input
                    type="number"
                    value={field.validation?.min || ''}
                    onChange={(e) =>
                      updateField(field.id, {
                        validation: {
                          ...field.validation,
                          min: e.target.value ? parseFloat(e.target.value) : undefined,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Valeur maximum
                  </label>
                  <input
                    type="number"
                    value={field.validation?.max || ''}
                    onChange={(e) =>
                      updateField(field.id, {
                        validation: {
                          ...field.validation,
                          max: e.target.value ? parseFloat(e.target.value) : undefined,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Éditeur */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Configuration du formulaire
            </h2>
            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center px-3 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
            >
              <Eye className="w-4 h-4 mr-2" />
              {previewMode ? 'Éditer' : 'Aperçu'}
            </button>
          </div>

          {!previewMode && (
            <>
              {/* Informations générales */}
              <div className="mb-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre du formulaire *
                  </label>
                  <input
                    type="text"
                    value={schema.title}
                    onChange={(e) =>
                      setSchema((prev) => ({ ...prev, title: e.target.value }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Ex: Enquête de satisfaction"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={schema.description}
                    onChange={(e) =>
                      setSchema((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Décrivez l'objectif de ce formulaire..."
                  />
                </div>
              </div>

              {/* Liste des champs */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Champs du formulaire
                  </h3>
                  <button
                    type="button"
                    onClick={addField}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un champ
                  </button>
                </div>

                {schema.fields.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-gray-500 mb-4">
                      Aucun champ ajouté. Commencez par ajouter un champ.
                    </p>
                    <button
                      type="button"
                      onClick={addField}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Ajouter le premier champ
                    </button>
                  </div>
                ) : (
                  <div>
                    {schema.fields.map((field, index) =>
                      renderFieldEditor(field, index)
                    )}
                  </div>
                )}
              </div>

              {/* Paramètres */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Paramètres
                </h3>
                <div className="space-y-3 bg-white p-4 rounded-lg">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="multiple-submissions"
                      checked={schema.settings?.allowMultipleSubmissions}
                      onChange={(e) =>
                        setSchema((prev) => ({
                          ...prev,
                          settings: {
                            ...prev.settings,
                            allowMultipleSubmissions: e.target.checked,
                          },
                        }))
                      }
                      className="mr-2"
                    />
                    <label
                      htmlFor="multiple-submissions"
                      className="text-sm text-gray-700"
                    >
                      Autoriser plusieurs soumissions
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="offline-mode"
                      checked={schema.settings?.enableOfflineMode}
                      onChange={(e) =>
                        setSchema((prev) => ({
                          ...prev,
                          settings: {
                            ...prev.settings,
                            enableOfflineMode: e.target.checked,
                          },
                        }))
                      }
                      className="mr-2"
                    />
                    <label
                      htmlFor="offline-mode"
                      className="text-sm text-gray-700"
                    >
                      Activer le mode offline
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="show-progress"
                      checked={schema.settings?.showProgress}
                      onChange={(e) =>
                        setSchema((prev) => ({
                          ...prev,
                          settings: {
                            ...prev.settings,
                            showProgress: e.target.checked,
                          },
                        }))
                      }
                      className="mr-2"
                    />
                    <label
                      htmlFor="show-progress"
                      className="text-sm text-gray-700"
                    >
                      Afficher la barre de progression
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Texte du bouton de soumission
                    </label>
                    <input
                      type="text"
                      value={schema.settings?.submitButtonText || 'Soumettre'}
                      onChange={(e) =>
                        setSchema((prev) => ({
                          ...prev,
                          settings: {
                            ...prev.settings,
                            submitButtonText: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Message de succès
                    </label>
                    <input
                      type="text"
                      value={
                        schema.settings?.successMessage ||
                        'Merci pour votre réponse!'
                      }
                      onChange={(e) =>
                        setSchema((prev) => ({
                          ...prev,
                          settings: {
                            ...prev.settings,
                            successMessage: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Aperçu */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 sticky top-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Aperçu du formulaire
          </h3>

          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {schema.title || 'Titre du formulaire'}
              </h2>
              {schema.description && (
                <p className="text-gray-600 mt-2">{schema.description}</p>
              )}
            </div>

            {schema.fields.length === 0 ? (
              <p className="text-gray-400 italic py-8 text-center">
                Ajoutez des champs pour voir l'aperçu
              </p>
            ) : (
              schema.fields.map((field) => (
                <div key={field.id} className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  {field.description && (
                    <p className="text-sm text-gray-500 mb-2">
                      {field.description}
                    </p>
                  )}

                  {/* Aperçu selon le type */}
                  {field.type === 'textarea' ? (
                    <textarea
                      disabled
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      rows={3}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    >
                      <option>Sélectionnez une option</option>
                      {(field.options || []).map((opt) => (
                        <option key={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : field.type === 'radio' ? (
                    <div className="space-y-2">
                      {(field.options || []).map((opt) => (
                        <label key={opt.value} className="flex items-center">
                          <input
                            type="radio"
                            disabled
                            className="mr-2"
                            name={field.id}
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  ) : field.type === 'checkbox' ? (
                    <div className="space-y-2">
                      {(field.options || []).map((opt) => (
                        <label key={opt.value} className="flex items-center">
                          <input type="checkbox" disabled className="mr-2" />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  ) : field.type === 'photo' ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500">
                      Champ photo - {field.photoConfig?.maxPhotos || 1} photo(s)
                      max
                      {field.photoConfig?.enableGPS && ' • GPS activé'}
                    </div>
                  ) : (
                    <input
                      type={field.type}
                      disabled
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  )}
                </div>
              ))
            )}

            <button
              type="button"
              disabled
              className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg opacity-50 cursor-not-allowed"
            >
              {schema.settings?.submitButtonText || 'Soumettre'}
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex justify-end space-x-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Annuler
          </button>
        )}
        <button
          type="button"
          onClick={handleSave}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Enregistrer le formulaire
        </button>
      </div>
    </div>
  );
};

export default FormBuilder;
