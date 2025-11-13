// src/pages/chercheur/CreateProject.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, Save, Target, Tag, Upload, FileText } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { projectsApi } from '../../services/projectsApi';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';
import {
  ResearchType,
  ResearchTypeLabels,
  ProjectStatus,
  ProjectStatusLabels,
  type CreateProjectRequest,
} from '../../types/project.types';
import api from '../../services/api';
import { documentService } from '../../services/api/documentService';

interface Theme {
  id: string;
  name: string;
  code?: string;
  programId: string;
}

interface Program {
  id: string;
  name: string;
  code?: string;
}

interface Convention {
  id: string;
  title: string;
  contractNumber?: string;
  type: string;
}

const CreateProject: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<CreateProjectRequest>({
    title: '',
    description: '',
    objectives: [''],
    startDate: '',
    endDate: '',
    budget: undefined,
    keywords: [],
    code: '',
    themeId: '',
    researchProgramId: '',
    conventionId: '',
    strategicPlan: '',
    strategicAxis: '',
    subAxis: '',
    program: '',
    researchType: undefined,
    interventionRegion: '',
    status: ProjectStatus.PLANIFIE,
  });

  const [newKeyword, setNewKeyword] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Charger les programmes de recherche
  const { data: programs = [] } = useQuery({
    queryKey: ['research-programs'],
    queryFn: async () => {
      const response = await api.get('/strategic-planning/programs');
      return response.data.data || [];
    },
  });

  // Charger les thèmes (filtrés par programme si sélectionné)
  const { data: themes = [] } = useQuery({
    queryKey: ['research-themes', formData.researchProgramId],
    queryFn: async () => {
      const response = await api.get('/strategic-planning/themes', {
        params: formData.researchProgramId ? { programId: formData.researchProgramId } : {},
      });
      return response.data.data || [];
    },
  });

  // Charger les conventions
  const { data: conventions = [] } = useQuery({
    queryKey: ['conventions'],
    queryFn: async () => {
      const response = await api.get('/conventions');
      return response.data.data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateProjectRequest) => projectsApi.createProject(data),
    onSuccess: async (project) => {
      // Si un fichier est sélectionné, l'uploader après la création
      if (uploadFile) {
        try {
          setIsUploading(true);
          toast.loading('Upload du document en cours...');
          await documentService.uploadDocument(uploadFile, {
            title: `Document du projet - ${project.title}`,
            type: 'RAPPORT',
            projectId: project.id,
            isPublic: false,
          });
          toast.dismiss();
          toast.success('Projet créé et document uploadé avec succès');
        } catch (error: any) {
          toast.error('Projet créé mais erreur lors de l\'upload du document');
          console.error(error);
        } finally {
          setIsUploading(false);
        }
      } else {
        toast.success('Projet créé avec succès');
      }
      navigate(`/chercheur/projects/${project.id}`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la création du projet');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title?.trim()) {
      toast.error('Le titre est obligatoire');
      return;
    }

    if (!formData.themeId) {
      toast.error('Le thème est obligatoire');
      return;
    }

    if (formData.objectives && formData.objectives.filter(obj => obj.trim()).length === 0) {
      toast.error('Au moins un objectif est requis');
      return;
    }

    const cleanData: CreateProjectRequest = {
      ...formData,
      objectives: formData.objectives?.filter(obj => obj.trim()),
      budget: formData.budget && formData.budget > 0 ? formData.budget : undefined,
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined,
      researchProgramId: formData.researchProgramId || undefined,
      conventionId: formData.conventionId || undefined,
    };

    createMutation.mutate(cleanData);
  };

  const addObjective = () => {
    setFormData({ ...formData, objectives: [...(formData.objectives || []), ''] });
  };

  const removeObjective = (index: number) => {
    const newObjectives = (formData.objectives || []).filter((_, i) => i !== index);
    setFormData({ ...formData, objectives: newObjectives });
  };

  const updateObjective = (index: number, value: string) => {
    const newObjectives = [...(formData.objectives || [])];
    newObjectives[index] = value;
    setFormData({ ...formData, objectives: newObjectives });
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.keywords?.includes(newKeyword.trim())) {
      setFormData({ ...formData, keywords: [...(formData.keywords || []), newKeyword.trim()] });
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData({ ...formData, keywords: (formData.keywords || []).filter(k => k !== keyword) });
  };

  // Réinitialiser le thème si le programme change
  const handleProgramChange = (programId: string) => {
    setFormData({
      ...formData,
      researchProgramId: programId,
      themeId: '', // Réinitialiser le thème
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/chercheur/projects')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Créer un nouveau projet</h1>
            <p className="text-sm text-gray-600 mt-1">Remplissez les informations du projet</p>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de base */}
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-green-600" />
            Informations de base
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre du projet <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Titre descriptif du projet"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code du projet</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Code unique du projet (optionnel)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Description détaillée du projet..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Objectifs <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              {(formData.objectives || []).map((objective, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-shrink-0 w-8 h-10 flex items-center justify-center">
                    <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={objective}
                    onChange={(e) => updateObjective(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder={`Objectif ${index + 1}`}
                  />
                  {(formData.objectives?.length || 0) > 1 && (
                    <button
                      type="button"
                      onClick={() => removeObjective(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <Button
              type="button"
              onClick={addObjective}
              variant="outline"
              className="mt-3 border-green-600 text-green-600 hover:bg-green-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un objectif
            </Button>
          </div>
        </div>

        {/* Catégorisation */}
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Catégorisation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Programme de recherche
              </label>
              <select
                value={formData.researchProgramId}
                onChange={(e) => handleProgramChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Sélectionnez un programme</option>
                {programs.map((program: Program) => (
                  <option key={program.id} value={program.id}>
                    {program.code ? `${program.code} - ` : ''}{program.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thème <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.themeId}
                onChange={(e) => setFormData({ ...formData, themeId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={!formData.researchProgramId && themes.length === 0}
              >
                <option value="">Sélectionnez un thème</option>
                {themes.map((theme: Theme) => (
                  <option key={theme.id} value={theme.id}>
                    {theme.code ? `${theme.code} - ` : ''}{theme.name}
                  </option>
                ))}
              </select>
              {!formData.researchProgramId && themes.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Sélectionnez d'abord un programme de recherche
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type de recherche</label>
              <select
                value={formData.researchType || ''}
                onChange={(e) =>
                  setFormData({ ...formData, researchType: e.target.value as ResearchType || undefined })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Sélectionnez un type</option>
                {Object.entries(ResearchTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                État du projet <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status || ProjectStatus.PLANIFIE}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as ProjectStatus })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {Object.entries(ProjectStatusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Convention</label>
              <select
                value={formData.conventionId}
                onChange={(e) => setFormData({ ...formData, conventionId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Aucune convention</option>
                {conventions.map((convention: Convention) => (
                  <option key={convention.id} value={convention.id}>
                    {convention.contractNumber ? `${convention.contractNumber} - ` : ''}{convention.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Région d'intervention</label>
              <input
                type="text"
                value={formData.interventionRegion}
                onChange={(e) => setFormData({ ...formData, interventionRegion: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: Dakar, Thiès, Kaolack..."
              />
            </div>
          </div>
        </div>

        {/* Planification et budget */}
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Planification et budget</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget (XOF)</label>
              <input
                type="number"
                value={formData.budget || ''}
                onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                min="0"
                step="1000"
                placeholder="Montant en Francs CFA"
              />
            </div>
          </div>
        </div>

        {/* Mots-clés */}
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Tag className="w-5 h-5 text-green-600" />
            Mots-clés
          </h2>

          <div>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ajouter un mot-clé..."
              />
              <Button
                type="button"
                onClick={addKeyword}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {(formData.keywords || []).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {(formData.keywords || []).map((keyword) => (
                  <span
                    key={keyword}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => removeKeyword(keyword)}
                      className="hover:bg-green-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upload de document */}
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-600" />
            Document du projet (optionnel)
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
        </div>

        {/* Boutons de soumission */}
        <div className="flex justify-end gap-3 bg-white rounded-lg shadow p-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/chercheur/projects')}
            disabled={createMutation.isPending || isUploading}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending || isUploading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {isUploading ? 'Upload en cours...' : createMutation.isPending ? 'Création...' : 'Créer le projet'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateProject;
