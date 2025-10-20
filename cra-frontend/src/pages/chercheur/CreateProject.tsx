// src/pages/chercheur/CreateProject.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, Save, Target, Tag } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { projectsApi } from '../../services/projectsApi';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';
import {
  ProjectStatus,
  ResearchType,
  ResearchTypeLabels,
  type CreateProjectRequest,
} from '../../types/project.types';

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
  });

  const [newKeyword, setNewKeyword] = useState('');

  const createMutation = useMutation({
    mutationFn: (data: CreateProjectRequest) => projectsApi.createProject(data),
    onSuccess: (project) => {
      toast.success('Projet créé avec succès');
      navigate(`/chercheur/projects/${project.id}`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la création du projet');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error('Le titre est obligatoire');
      return;
    }

    if (!formData.themeId) {
      toast.error('Le thème est obligatoire');
      return;
    }

    if (formData.objectives.filter(obj => obj.trim()).length === 0) {
      toast.error('Au moins un objectif est requis');
      return;
    }

    // Nettoyer les données
    const cleanData: CreateProjectRequest = {
      ...formData,
      objectives: formData.objectives.filter(obj => obj.trim()),
      budget: formData.budget && formData.budget > 0 ? formData.budget : undefined,
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined,
    };

    createMutation.mutate(cleanData);
  };

  const addObjective = () => {
    setFormData({ ...formData, objectives: [...formData.objectives, ''] });
  };

  const removeObjective = (index: number) => {
    const newObjectives = formData.objectives.filter((_, i) => i !== index);
    setFormData({ ...formData, objectives: newObjectives });
  };

  const updateObjective = (index: number, value: string) => {
    const newObjectives = [...formData.objectives];
    newObjectives[index] = value;
    setFormData({ ...formData, objectives: newObjectives });
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.keywords.includes(newKeyword.trim())) {
      setFormData({ ...formData, keywords: [...formData.keywords, newKeyword.trim()] });
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData({ ...formData, keywords: formData.keywords.filter(k => k !== keyword) });
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
              placeholder="Ex: Amélioration de la production de riz..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code du projet</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ex: PRJ-2024-001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Décrivez votre projet..."
            />
          </div>

          {/* Objectifs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Objectifs <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              {formData.objectives.map((objective, index) => (
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
                    placeholder="Décrivez l'objectif..."
                  />
                  {formData.objectives.length > 1 && (
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
                Thème <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.themeId}
                onChange={(e) => setFormData({ ...formData, themeId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="ID du thème"
              />
              <p className="mt-1 text-xs text-gray-500">Entrez l'ID du thème de recherche</p>
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
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Programme de recherche</label>
              <input
                type="text"
                value={formData.researchProgramId}
                onChange={(e) => setFormData({ ...formData, researchProgramId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="ID du programme (optionnel)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Convention</label>
              <input
                type="text"
                value={formData.conventionId}
                onChange={(e) => setFormData({ ...formData, conventionId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="ID de la convention (optionnel)"
              />
            </div>
          </div>
        </div>

        {/* Cadrage stratégique */}
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Cadrage stratégique</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan stratégique</label>
              <input
                type="text"
                value={formData.strategicPlan}
                onChange={(e) => setFormData({ ...formData, strategicPlan: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Axe stratégique</label>
              <input
                type="text"
                value={formData.strategicAxis}
                onChange={(e) => setFormData({ ...formData, strategicAxis: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sous-axe</label>
              <input
                type="text"
                value={formData.subAxis}
                onChange={(e) => setFormData({ ...formData, subAxis: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Programme</label>
              <input
                type="text"
                value={formData.program}
                onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Région d'intervention</label>
            <input
              type="text"
              value={formData.interventionRegion}
              onChange={(e) => setFormData({ ...formData, interventionRegion: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ex: Dakar, Thiès, etc."
            />
          </div>
        </div>

        {/* Informations temporelles et budgétaires */}
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
                placeholder="0"
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

            {formData.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.keywords.map((keyword) => (
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

        {/* Actions */}
        <div className="flex justify-end gap-3 bg-white rounded-lg shadow p-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/chercheur/projects')}
            disabled={createMutation.isPending}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {createMutation.isPending ? 'Création...' : 'Créer le projet'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateProject;
