// src/pages/chercheur/CreateActivity.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Plus, X, Save, Upload, FileText, ChevronLeft, ChevronRight, Target, Users, Link as LinkIcon, Settings, Award, AlertTriangle } from 'lucide-react';
import { activitiesApi } from '../../services/activitiesApi';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';
import {
  ActivityType,
  ActivityTypeLabels,
  TaskPriority,
  TaskPriorityLabels,
  type CreateActivityRequest,
} from '../../types/activity.types';
import { documentService } from '../../services/api/documentService';

const CreateActivity: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [objectives, setObjectives] = useState<string[]>(['']);
  const [constraints, setConstraints] = useState<string[]>(['']);
  const [expectedResults, setExpectedResults] = useState<string[]>(['']);
  const [transferMethods, setTransferMethods] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState<CreateActivityRequest>({
    title: '',
    description: '',
    type: ActivityType.RECHERCHE_EXPERIMENTALE,
    objectives: [],
    themeId: '',
    responsibleId: '',
    projectId: '',
    stationId: '',
    conventionId: '',
    methodology: '',
    location: '',
    startDate: '',
    endDate: '',
    interventionRegion: '',
    strategicPlan: '',
    strategicAxis: '',
    subAxis: '',
    priority: TaskPriority.NORMALE,
    justifications: '',
    constraints: [],
    expectedResults: [],
    transferMethods: [],
  });

  const steps = [
    { title: 'Informations de base', icon: Target },
    { title: 'Objectifs', icon: Award },
    { title: 'Liens', icon: LinkIcon },
    { title: 'Détails techniques', icon: Settings },
    { title: 'Résultats et contraintes', icon: AlertTriangle },
    { title: 'Document', icon: Upload }
  ];

  // Charger les données de référence
  const { data: themes = [] } = useQuery({
    queryKey: ['themes'],
    queryFn: async () => {
      try {
        const response = await api.get('/strategic-planning/themes');
        return response.data.data || [];
      } catch (error) {
        console.error('Erreur lors du chargement des thèmes:', error);
        return [];
      }
    },
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users');
      return response.data.data || [];
    },
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await api.get('/projects');
      return response.data.data || [];
    },
  });

  const { data: stations = [] } = useQuery({
    queryKey: ['stations'],
    queryFn: async () => {
      try {
        const response = await api.get('/strategic-planning/stations');
        return response.data.data || [];
      } catch (error) {
        console.error('Erreur lors du chargement des stations:', error);
        return [];
      }
    },
  });

  const { data: conventions = [] } = useQuery({
    queryKey: ['conventions'],
    queryFn: async () => {
      const response = await api.get('/conventions');
      return response.data.data || [];
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title || !formData.themeId || !formData.responsibleId) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      setCurrentStep(0);
      return;
    }

    const filteredObjectives = objectives.filter(obj => obj.trim() !== '');
    if (filteredObjectives.length === 0) {
      toast.error('Veuillez ajouter au moins un objectif');
      setCurrentStep(1);
      return;
    }

    try {
      setLoading(true);
      const activityData: CreateActivityRequest = {
        ...formData,
        projectId: formData.projectId || undefined,
        stationId: formData.stationId || undefined,
        conventionId: formData.conventionId || undefined,
        objectives: filteredObjectives,
        constraints: constraints.filter(c => c.trim() !== ''),
        expectedResults: expectedResults.filter(r => r.trim() !== ''),
        transferMethods: transferMethods.filter(m => m.trim() !== ''),
      };

      const activity = await activitiesApi.createActivity(activityData);

      // Si un fichier est sélectionné, l'uploader après la création
      if (uploadFile) {
        try {
          setIsUploading(true);
          toast.loading('Upload du document en cours...');
          await documentService.uploadDocument(uploadFile, {
            title: `Document de l'activité - ${activity.title}`,
            type: 'RAPPORT' as import('../../types/document.types').DocumentType,
            activityId: activity.id,
            isPublic: false,
          });
          toast.dismiss();
          toast.success('Activité créée et document uploadé avec succès');
        } catch (error: any) {
          toast.error('Activité créée mais erreur lors de l\'upload du document');
          console.error(error);
        } finally {
          setIsUploading(false);
        }
      } else {
        toast.success('Activité créée avec succès');
      }

      navigate(`/chercheur/activities/${activity.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création de l\'activité');
    } finally {
      setLoading(false);
    }
  };

  const addArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => [...prev, '']);
  };

  const removeArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const updateArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number, value: string) => {
    setter(prev => prev.map((item, i) => (i === index ? value : item)));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setSlideDirection('right');
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setSlideDirection('left');
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    setSlideDirection(step > currentStep ? 'right' : 'left');
    setCurrentStep(step);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link to="/chercheur/activities" className="text-green-600 hover:text-green-700 flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux activités
        </Link>
      </div>

      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Target className="h-8 w-8 text-green-600" />
          Créer une nouvelle activité
        </h1>
        <p className="text-gray-600 mt-2">
          Remplissez les informations de votre activité de recherche
        </p>
      </div>

      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={index} className="flex-1 flex items-center">
              <button
                type="button"
                onClick={() => goToStep(index)}
                className={`flex flex-col items-center gap-2 ${
                  index === currentStep
                    ? 'text-green-600'
                    : index < currentStep
                    ? 'text-green-500'
                    : 'text-gray-400'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    index === currentStep
                      ? 'bg-green-600 text-white ring-4 ring-green-100'
                      : index < currentStep
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {index < currentStep ? '✓' : index + 1}
                </div>
                <span className="text-xs font-medium hidden md:block">{step.title}</span>
              </button>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 transition-all ${
                    index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit}>
        {/* Slides Container */}
        <div className="relative overflow-hidden">
          <div
            className={`transition-all duration-500 ease-in-out ${
              slideDirection === 'right'
                ? 'animate-slide-in-right'
                : 'animate-slide-in-left'
            }`}
            key={currentStep}
          >
            {/* Step 0: Informations de base */}
            {currentStep === 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations de base</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre de l'activité *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type d'activité *
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as ActivityType })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        {Object.entries(ActivityTypeLabels).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Priorité</label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        {Object.entries(TaskPriorityLabels).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Thème *</label>
                      <select
                        value={formData.themeId}
                        onChange={(e) => setFormData({ ...formData, themeId: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">-- Sélectionner un thème --</option>
                        {themes.map((theme: any) => (
                          <option key={theme.id} value={theme.id}>
                            {theme.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Responsable *</label>
                      <select
                        value={formData.responsibleId}
                        onChange={(e) => setFormData({ ...formData, responsibleId: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">-- Sélectionner un responsable --</option>
                        {users.map((user: any) => (
                          <option key={user.id} value={user.id}>
                            {user.firstName} {user.lastName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Objectifs */}
            {currentStep === 1 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-green-600" />
                  Objectifs *
                </h2>
                <div className="space-y-3">
                  {objectives.map((obj, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="flex-shrink-0 w-8 h-10 flex items-center justify-center">
                        <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                      </div>
                      <input
                        type="text"
                        value={obj}
                        onChange={(e) => updateArrayItem(setObjectives, index, e.target.value)}
                        placeholder={`Objectif ${index + 1}`}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      {objectives.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeArrayItem(setObjectives, index)}
                          variant="outline"
                          className="border-red-600 text-red-600 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    onClick={() => addArrayItem(setObjectives)}
                    variant="outline"
                    className="border-green-600 text-green-600 hover:bg-green-50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un objectif
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Liens avec d'autres entités */}
            {currentStep === 2 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-green-600" />
                  Liens et associations
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Projet (optionnel - activité peut être indépendante)
                    </label>
                    <select
                      value={formData.projectId}
                      onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">-- Aucun projet (activité indépendante) --</option>
                      {projects.map((project: any) => (
                        <option key={project.id} value={project.id}>
                          {project.title}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Laissez vide si l'activité n'est pas liée à un projet
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Station</label>
                      <select
                        value={formData.stationId}
                        onChange={(e) => setFormData({ ...formData, stationId: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">-- Aucune station --</option>
                        {stations.map((station: any) => (
                          <option key={station.id} value={station.id}>
                            {station.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Convention</label>
                      <select
                        value={formData.conventionId}
                        onChange={(e) => setFormData({ ...formData, conventionId: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">-- Aucune convention --</option>
                        {conventions.map((convention: any) => (
                          <option key={convention.id} value={convention.id}>
                            {convention.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Détails techniques */}
            {currentStep === 3 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-green-600" />
                  Détails techniques
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Méthodologie</label>
                    <textarea
                      value={formData.methodology}
                      onChange={(e) => setFormData({ ...formData, methodology: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Décrivez la méthodologie de recherche..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Localisation</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Lieu de l'activité"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Région d'intervention</label>
                      <input
                        type="text"
                        value={formData.interventionRegion}
                        onChange={(e) => setFormData({ ...formData, interventionRegion: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Ex: Dakar, Thiès..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date de début</label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date de fin</label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Résultats attendus et Contraintes */}
            {currentStep === 4 && (
              <div className="space-y-6">
                {/* Résultats attendus */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Résultats attendus</h2>
                  <div className="space-y-3">
                    {expectedResults.map((result, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={result}
                          onChange={(e) => updateArrayItem(setExpectedResults, index, e.target.value)}
                          placeholder={`Résultat ${index + 1}`}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        {expectedResults.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => removeArrayItem(setExpectedResults, index)}
                            variant="outline"
                            className="border-red-600 text-red-600 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      onClick={() => addArrayItem(setExpectedResults)}
                      variant="outline"
                      className="border-green-600 text-green-600 hover:bg-green-50"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter un résultat
                    </Button>
                  </div>
                </div>

                {/* Contraintes */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-green-600" />
                    Contraintes
                  </h2>
                  <div className="space-y-3">
                    {constraints.map((constraint, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={constraint}
                          onChange={(e) => updateArrayItem(setConstraints, index, e.target.value)}
                          placeholder={`Contrainte ${index + 1}`}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        {constraints.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => removeArrayItem(setConstraints, index)}
                            variant="outline"
                            className="border-red-600 text-red-600 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      onClick={() => addArrayItem(setConstraints)}
                      variant="outline"
                      className="border-green-600 text-green-600 hover:bg-green-50"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter une contrainte
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Upload de document */}
            {currentStep === 5 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-green-600" />
                  Document de l'activité (optionnel)
                </h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Joindre un document
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-green-500 transition-colors">
                    <div className="flex flex-col items-center">
                      {uploadFile ? (
                        <div className="flex items-center gap-3 w-full">
                          <FileText className="w-10 h-10 text-green-600" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{uploadFile.name}</p>
                            <p className="text-xs text-gray-500">{(uploadFile.size / 1024).toFixed(2)} KB</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setUploadFile(null)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-12 h-12 text-gray-400 mb-3" />
                          <label className="cursor-pointer">
                            <span className="text-sm text-green-600 hover:text-green-700 font-medium">
                              Cliquez pour sélectionner un fichier
                            </span>
                            <input
                              type="file"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setUploadFile(file);
                              }}
                              className="hidden"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            />
                          </label>
                          <p className="text-xs text-gray-500 mt-2">
                            PDF, Word, Image (max 10MB)
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    💡 Astuce: Le document n'est pas obligatoire. Vous pouvez l'ajouter plus tard.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="mt-8 flex gap-4 justify-between">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Précédent
          </button>

          <div className="flex gap-4">
            <Link to="/chercheur/activities">
              <Button type="button" variant="outline" disabled={loading || isUploading}>
                Annuler
              </Button>
            </Link>

            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <Button
                type="submit"
                disabled={loading || isUploading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {isUploading ? 'Upload en cours...' : loading ? 'Création en cours...' : 'Créer l\'activité'}
              </Button>
            )}
          </div>
        </div>
      </form>

      <style>{`
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.5s ease-out;
        }

        .animate-slide-in-left {
          animation: slide-in-left 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CreateActivity;
