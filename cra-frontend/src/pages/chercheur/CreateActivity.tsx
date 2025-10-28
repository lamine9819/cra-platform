// src/pages/chercheur/CreateActivity.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Plus, X, Save } from 'lucide-react';
import { activitiesApi } from '../../services/activitiesApi';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';
import {
  ActivityType,
  ActivityTypeLabels,
  ActivityStatus,
  ActivityStatusLabels,
  TaskPriority,
  TaskPriorityLabels,
  type CreateActivityRequest,
} from '../../types/activity.types';

const CreateActivity: React.FC = () => {
  const navigate = useNavigate();
  const [objectives, setObjectives] = useState<string[]>(['']);
  const [constraints, setConstraints] = useState<string[]>(['']);
  const [expectedResults, setExpectedResults] = useState<string[]>(['']);
  const [transferMethods, setTransferMethods] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<CreateActivityRequest>({
    title: '',
    description: '',
    type: ActivityType.RECHERCHE_EXPERIMENTALE,
    status: ActivityStatus.PLANIFIEE,
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

  // Charger les données de référence
  const { data: themes = [] } = useQuery({
    queryKey: ['themes'],
    queryFn: async () => {
      try {
        // Essayer d'abord avec /api/strategic-planning/themes
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
      return;
    }

    const filteredObjectives = objectives.filter(obj => obj.trim() !== '');
    if (filteredObjectives.length === 0) {
      toast.error('Veuillez ajouter au moins un objectif');
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
      toast.success('Activité créée avec succès');
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link to="/chercheur/activities" className="text-green-600 hover:text-green-700 flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux activités
        </Link>
      </div>

      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Créer une nouvelle activité</h1>
        <p className="text-gray-600 mt-2">
          Remplissez les informations ci-dessous pour créer une nouvelle activité
        </p>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Informations de base */}
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ActivityStatus })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {Object.entries(ActivityStatusLabels).map(([key, label]) => (
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

        {/* Objectifs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Objectifs *</h2>
          <div className="space-y-3">
            {objectives.map((obj, index) => (
              <div key={index} className="flex gap-2">
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

        {/* Liens avec d'autres entités */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Liens et associations</h2>
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

        {/* Détails techniques */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Détails techniques</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Méthodologie</label>
              <textarea
                value={formData.methodology}
                onChange={(e) => setFormData({ ...formData, methodology: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Région d'intervention</label>
                <input
                  type="text"
                  value={formData.interventionRegion}
                  onChange={(e) => setFormData({ ...formData, interventionRegion: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Contraintes</h2>
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

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link to="/chercheur/activities">
            <Button type="button" variant="outline">
              Annuler
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Création en cours...' : 'Créer l\'activité'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateActivity;
