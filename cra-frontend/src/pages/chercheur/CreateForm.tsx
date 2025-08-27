
// src/pages/chercheur/CreateForm.tsx - Corrections pour la validation
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Save, 
  Eye, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Move,
  Settings,
  Copy
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useForm, useFormActions, useFormValidation } from '../../hooks/useForms';
import { useActivities } from '../../hooks/useActivities';
import { FormField, FormSchema } from '../../services/formsApi';
import { sanitizeFormData, isValidCuid } from '../../utils/validation';

// Components
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';

const FIELD_TYPES = [
  { value: 'text', label: 'Texte', icon: '📝' },
  { value: 'textarea', label: 'Zone de texte', icon: '📄' },
  { value: 'number', label: 'Nombre', icon: '🔢' },
  { value: 'email', label: 'Email', icon: '✉️' },
  { value: 'date', label: 'Date', icon: '📅' },
  { value: 'time', label: 'Heure', icon: '🕒' },
  { value: 'select', label: 'Liste déroulante', icon: '📋' },
  { value: 'radio', label: 'Boutons radio', icon: '🔘' },
  { value: 'checkbox', label: 'Cases à cocher', icon: '☑️' },
  { value: 'file', label: 'Fichier', icon: '📎' }
];

const CreateForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  // États du formulaire
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    activityId: '',
    isActive: true
  });

  const [schema, setSchema] = useState<FormSchema>({
    title: '',
    description: '',
    version: '1.0.0',
    fields: [],
    settings: {
      allowMultipleSubmissions: false,
      showProgress: false,
      submitButtonText: 'Soumettre',
      successMessage: 'Formulaire soumis avec succès'
    }
  });

  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Hooks
  const { form, loading: formLoading } = useForm(id);
  const { activities, loading: activitiesLoading } = useActivities({ limit: 100 });
  const { 
    loading: actionLoading, 
    error: actionError, 
    createForm, 
    updateForm
  } = useFormActions();
  const { validateSchema } = useFormValidation();

  // Validation des activités disponibles
  const validActivities = useMemo(() => {
    return activities.filter(activity => 
      activity.id && isValidCuid(activity.id)
    );
  }, [activities]);

  // Chargement des données en mode édition
  useEffect(() => {
    if (isEditing && form) {
      setFormData({
        title: form.title,
        description: form.description || '',
        activityId: form.activity?.id || '',
        isActive: form.isActive
      });
      setSchema(form.schema);
    }
  }, [isEditing, form]);

  // Synchronisation du schéma
  useEffect(() => {
    setSchema(prev => ({
      ...prev,
      title: formData.title,
      description: formData.description
    }));
  }, [formData.title, formData.description]);

  // Validation en temps réel de l'activityId
  const isActivityIdValid = useMemo(() => {
    if (!formData.activityId) return true; // Optionnel
    return isValidCuid(formData.activityId);
  }, [formData.activityId]);

  // Gestionnaire pour changer l'activité avec validation
  const handleActivityChange = useCallback((activityId: string) => {
    console.log('Changing activity to:', activityId, 'Valid:', isValidCuid(activityId));
    
    setFormData(prev => ({
      ...prev,
      activityId: activityId
    }));

    // Effacer les erreurs de validation si l'ID devient valide
    if (isValidCuid(activityId) || !activityId) {
      setValidationErrors(prev => prev.filter(error => 
        !error.includes('activityId') && !error.includes('activité')
      ));
    }
  }, []);

  // Validation complète avant sauvegarde
  const validateFormData = useCallback(() => {
    const errors: string[] = [];

    if (!formData.title.trim()) {
      errors.push('Le titre est requis');
    }

    if (schema.fields.length === 0) {
      errors.push('Au moins un champ est requis');
    }

    // Validation spécifique de l'activityId
    if (formData.activityId && !isValidCuid(formData.activityId)) {
      errors.push('L\'ID de l\'activité sélectionnée n\'est pas valide');
    }

    // Vérifier que l'activité existe réellement
    if (formData.activityId && !validActivities.find(a => a.id === formData.activityId)) {
      errors.push('L\'activité sélectionnée n\'existe pas ou n\'est plus disponible');
    }

    return errors;
  }, [formData, schema.fields, validActivities]);

  const handleSave = async () => {
    // Validation côté client
    const clientErrors = validateFormData();
    if (clientErrors.length > 0) {
      setValidationErrors(clientErrors);
      return;
    }

    // Validation du schéma
    const validation = await validateSchema(schema);
    if (!validation?.isValid) {
      setValidationErrors(['Le schéma du formulaire contient des erreurs']);
      return;
    }

    // Nettoyer et préparer les données
    const cleanedFormData = sanitizeFormData({
      ...formData,
      schema: validation.schema
    });

    console.log('Sending form data:', cleanedFormData);

    let result;
    if (isEditing) {
      result = await updateForm(id!, cleanedFormData);
    } else {
      result = await createForm(cleanedFormData);
    }

    if (result) {
      navigate('/chercheur/forms');
    } else {
      // Vérifier si c'est une erreur de validation du backend
      if (actionError?.includes('activityId') || actionError?.includes('cuid')) {
        setValidationErrors(['Erreur avec l\'activité sélectionnée. Veuillez en choisir une autre ou laisser vide.']);
        // Réinitialiser l'activityId en cas d'erreur
        setFormData(prev => ({ ...prev, activityId: '' }));
      }
    }
  };

  // Gestionnaires d'événements pour les champs (inchangés)
  const handleAddField = (type: string) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type: type as any,
      label: `Nouveau champ ${type}`,
      placeholder: '',
      required: false,
      validation: {},
      options: type === 'select' || type === 'radio' || type === 'checkbox' ? [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' }
      ] : undefined
    };

    setSchema(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
    setSelectedField(newField);
  };

  const handleUpdateField = (updatedField: FormField) => {
    setSchema(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === updatedField.id ? updatedField : field
      )
    }));
    setSelectedField(updatedField);
  };

  const handleDeleteField = (fieldId: string) => {
    setSchema(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    }));
    if (selectedField?.id === fieldId) {
      setSelectedField(null);
    }
  };

  const handleDuplicateField = (field: FormField) => {
    const duplicatedField: FormField = {
      ...field,
      id: `field_${Date.now()}`,
      label: `${field.label} (copie)`
    };

    const fieldIndex = schema.fields.findIndex(f => f.id === field.id);
    const newFields = [...schema.fields];
    newFields.splice(fieldIndex + 1, 0, duplicatedField);

    setSchema(prev => ({
      ...prev,
      fields: newFields
    }));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(schema.fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSchema(prev => ({
      ...prev,
      fields: items
    }));
  };

  const handlePreview = async () => {
    const clientErrors = validateFormData();
    if (clientErrors.length > 0) {
      setValidationErrors(clientErrors);
      return;
    }

    const validation = await validateSchema(schema);
    if (validation?.isValid) {
      setShowPreview(true);
      setValidationErrors([]);
    } else {
      setValidationErrors(['Le schéma du formulaire contient des erreurs']);
    }
  };

  if (formLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            onClick={() => navigate('/chercheur/forms')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Modifier le formulaire' : 'Nouveau formulaire'}
            </h1>
            <p className="text-gray-600">
              Créez et configurez votre formulaire de collecte de données
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={handlePreview}
          >
            <Eye className="h-4 w-4 mr-2" />
            Aperçu
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Paramètres
          </Button>
          <Button
            onClick={handleSave}
            loading={actionLoading}
            variant="primary"
          >
            <Save className="h-4 w-4 mr-2" />
            {isEditing ? 'Mettre à jour' : 'Créer'}
          </Button>
        </div>
      </div>

      {/* Messages d'erreur */}
      {(actionError || validationErrors.length > 0) && (
        <Alert type="error">
          <div>
            {actionError && <p>{actionError}</p>}
            {validationErrors.map((error, index) => (
              <p key={index}>{error}</p>
            ))}
          </div>
        </Alert>
      )}

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Panneau de configuration */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-4">
            <h3 className="font-medium text-gray-900 mb-4">Informations générales</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Titre du formulaire"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description du formulaire"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Activité (optionnel)
                  {!isActivityIdValid && (
                    <span className="text-red-500 text-xs ml-1">- ID invalide</span>
                  )}
                </label>
                <Select
                  value={formData.activityId}
                  onValueChange={handleActivityChange}
                  placeholder="Sélectionner une activité"
                  disabled={activitiesLoading}
                  className={!isActivityIdValid ? 'border-red-500' : ''}
                >
                  <option value="">Aucune activité</option>
                  {validActivities.map((activity) => (
                    <option key={activity.id} value={activity.id}>
                      {activity.title}
                    </option>
                  ))}
                </Select>
                {activitiesLoading && (
                  <p className="text-xs text-gray-500 mt-1">Chargement des activités...</p>
                )}
                {!activitiesLoading && validActivities.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">Aucune activité disponible</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Formulaire actif
                </label>
              </div>
            </div>
          </Card>

          {/* Palette des champs */}
          <Card className="p-4">
            <h3 className="font-medium text-gray-900 mb-4">Ajouter un champ</h3>
            <div className="grid grid-cols-2 gap-2">
              {FIELD_TYPES.map((fieldType) => (
                <button
                  key={fieldType.value}
                  onClick={() => handleAddField(fieldType.value)}
                  className="p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="text-lg mb-1">{fieldType.icon}</div>
                  <div className="text-sm font-medium text-gray-900">
                    {fieldType.label}
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Constructeur de formulaire - reste identique */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-medium text-gray-900">Constructeur de formulaire</h3>
              <Badge variant="secondary">
                {schema.fields.length} champ(s)
              </Badge>
            </div>

            {schema.fields.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <Plus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun champ ajouté
                </h4>
                <p className="text-gray-600">
                  Ajoutez des champs depuis la palette à gauche pour commencer
                </p>
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="form-fields">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                      {schema.fields.map((field, index) => (
                        <Draggable key={field.id} draggableId={field.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`
                                border border-gray-200 rounded-lg p-4 bg-white
                                ${snapshot.isDragging ? 'shadow-lg' : 'hover:border-gray-300'}
                                ${selectedField?.id === field.id ? 'ring-2 ring-blue-500' : ''}
                              `}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="cursor-move text-gray-400 hover:text-gray-600"
                                  >
                                    <Move className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-900">
                                      {field.label}
                                    </span>
                                    <Badge variant="secondary" className="ml-2">
                                      {FIELD_TYPES.find(t => t.value === field.type)?.label}
                                    </Badge>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setSelectedField(field)}
                                  >
                                    <Settings className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleDuplicateField(field)}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleDeleteField(field.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              {/* Aperçu du champ */}
                              <FieldPreview field={field} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </Card>
        </div>

        {/* Panneau de propriétés - reste identique */}
        <div className="lg:col-span-1">
          {selectedField ? (
            <FieldEditor
              field={selectedField}
              onUpdate={handleUpdateField}
              onClose={() => setSelectedField(null)}
            />
          ) : (
            <Card className="p-4">
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="font-medium text-gray-900 mb-2">
                  Propriétés du champ
                </h4>
                <p className="text-sm text-gray-600">
                  Sélectionnez un champ pour modifier ses propriétés
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Modals - restent identiques */}
      <FormPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        schema={schema}
      />

      <FormSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={schema.settings || {}}
        onUpdate={(settings: FormSchema['settings']) => setSchema(prev => ({ ...prev, settings }))}
      />
    </div>
  );
};

// Composants helper - restent identiques mais j'ajoute les imports nécessaires
const FieldPreview: React.FC<{ field: FormField }> = ({ field }) => {
  const renderField = () => {
    const commonProps = {
      placeholder: field.placeholder,
      required: field.required,
      disabled: true,
      className: 'opacity-60'
    };

    switch (field.type) {
      case 'text':
      case 'email':
        return <Input type={field.type} {...commonProps} />;
      case 'number':
        return <Input type="number" {...commonProps} />;
      case 'textarea':
        return <Textarea {...commonProps} rows={3} />;
      case 'date':
        return <Input type="date" {...commonProps} />;
      case 'time':
        return <Input type="time" {...commonProps} />;
      case 'select':
        return (
          <Select {...commonProps}>
            {field.options?.map((option, index) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        );
      default:
        return <Input {...commonProps} />;
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {field.description && (
        <p className="text-sm text-gray-600 mb-2">{field.description}</p>
      )}
      {renderField()}
    </div>
  );
};

// Composant d'édition de champ complet
interface FieldEditorProps {
  field: FormField;
  onUpdate: (field: FormField) => void;
  onClose: () => void;
}

const FieldEditor: React.FC<FieldEditorProps> = ({ field, onUpdate, onClose }) => {
  const [localField, setLocalField] = useState(field);

  useEffect(() => {
    setLocalField(field);
  }, [field]);

  const handleUpdate = (updates: Partial<FormField>) => {
    const updatedField = { ...localField, ...updates };
    setLocalField(updatedField);
    onUpdate(updatedField);
  };

  const handleAddOption = () => {
    const newOption = {
      value: `option_${Date.now()}`,
      label: 'Nouvelle option'
    };
    handleUpdate({
      options: [...(localField.options || []), newOption]
    });
  };

  const handleUpdateOption = (index: number, updates: { value?: string; label?: string }) => {
    const newOptions = [...(localField.options || [])];
    newOptions[index] = { ...newOptions[index], ...updates };
    handleUpdate({ options: newOptions });
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = [...(localField.options || [])];
    newOptions.splice(index, 1);
    handleUpdate({ options: newOptions });
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">Propriétés du champ</h3>
        <Button variant="secondary" size="sm" onClick={onClose}>
          ×
        </Button>
      </div>

      <div className="space-y-4">
        {/* Label */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Label *
          </label>
          <Input
            value={localField.label}
            onChange={(e) => handleUpdate({ label: e.target.value })}
            placeholder="Label du champ"
          />
        </div>

        {/* Placeholder */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Placeholder
          </label>
          <Input
            value={localField.placeholder || ''}
            onChange={(e) => handleUpdate({ placeholder: e.target.value })}
            placeholder="Texte d'aide"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <Textarea
            value={localField.description || ''}
            onChange={(e) => handleUpdate({ description: e.target.value })}
            placeholder="Description du champ"
            rows={2}
          />
        </div>

        {/* Requis */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="required"
            checked={localField.required}
            onChange={(e) => handleUpdate({ required: e.target.checked })}
            className="rounded border-gray-300"
          />
          <label htmlFor="required" className="text-sm text-gray-700">
            Champ requis
          </label>
        </div>

        {/* Options pour select, radio, checkbox */}
        {(['select', 'radio', 'checkbox'].includes(localField.type)) && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Options
              </label>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleAddOption}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </div>
            
            <div className="space-y-2">
              {localField.options?.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={option.label}
                    onChange={(e) => handleUpdateOption(index, { label: e.target.value })}
                    placeholder="Label de l'option"
                    className="flex-1"
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleRemoveOption(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Validation */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Validation</h4>
          
          {(['text', 'textarea'].includes(localField.type)) && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Min. caractères</label>
                <Input
                  type="number"
                  value={localField.validation?.min || ''}
                  onChange={(e) => handleUpdate({
                    validation: {
                      ...localField.validation,
                      min: e.target.value ? parseInt(e.target.value) : undefined
                    }
                  })}
                  placeholder="Min"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Max. caractères</label>
                <Input
                  type="number"
                  value={localField.validation?.max || ''}
                  onChange={(e) => handleUpdate({
                    validation: {
                      ...localField.validation,
                      max: e.target.value ? parseInt(e.target.value) : undefined
                    }
                  })}
                  placeholder="Max"
                />
              </div>
            </div>
          )}

          <div className="mt-2">
            <label className="block text-xs text-gray-600 mb-1">Message d'erreur personnalisé</label>
            <Input
              value={localField.validation?.message || ''}
              onChange={(e) => handleUpdate({
                validation: {
                  ...localField.validation,
                  message: e.target.value
                }
              })}
              placeholder="Message d'erreur"
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

const FormPreviewModal: React.FC<any> = ({ isOpen, onClose, schema }) => {
  if (!isOpen) return null;
  return <div>Preview Modal</div>;
};

const FormSettingsModal: React.FC<any> = ({ isOpen, onClose, settings, onUpdate }) => {
  if (!isOpen) return null;
  return <div>Settings Modal</div>;
};

export default CreateForm;