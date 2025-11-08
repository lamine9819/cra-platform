// src/pages/chercheur/EditActivity.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Plus, X, Save } from 'lucide-react';
import { activitiesApi } from '../../services/activitiesApi';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';
import {
  ActivityType,
  ActivityTypeLabels,
  ActivityLifecycleStatus,
  ActivityLifecycleStatusLabels,
  TaskPriority,
  TaskPriorityLabels,
  type UpdateActivityRequest,
} from '../../types/activity.types';

const EditActivity: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [objectives, setObjectives] = useState<string[]>(['']);
  const [constraints, setConstraints] = useState<string[]>(['']);
  const [expectedResults, setExpectedResults] = useState<string[]>(['']);
  const [transferMethods, setTransferMethods] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  const [formData, setFormData] = useState<UpdateActivityRequest>({
    title: '',
    description: '',
    type: ActivityType.RECHERCHE_EXPERIMENTALE,
    lifecycleStatus: ActivityLifecycleStatus.NOUVELLE,
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

  // Empêcher le chargement si l'ID est "create" (route réservée) ou invalide
  const isValidId = id && id !== 'create' && !id.includes('/');

  // Charger l'activité existante
  const { data: activity, isLoading: activityLoading, error } = useQuery({
    queryKey: ['activity', id],
    queryFn: () => activitiesApi.getActivityById(id!),
    enabled: !!isValidId,
  });

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

  // Pré-remplir le formulaire avec les données de l'activité
  useEffect(() => {
    if (activity && !dataLoaded) {
      setFormData({
        title: activity.title || '',
        description: activity.description || '',
        type: activity.type,
        lifecycleStatus: activity.lifecycleStatus || ActivityLifecycleStatus.NOUVELLE,
        objectives: activity.objectives || [],
        themeId: activity.themeId || '',
        responsibleId: activity.responsibleId || '',
        projectId: activity.projectId || '',
        stationId: activity.stationId || '',
        conventionId: activity.conventionId || '',
        methodology: activity.methodology || '',
        location: activity.location || '',
        startDate: activity.startDate ? new Date(activity.startDate).toISOString().split('T')[0] : '',
        endDate: activity.endDate ? new Date(activity.endDate).toISOString().split('T')[0] : '',
        interventionRegion: activity.interventionRegion || '',
        strategicPlan: activity.strategicPlan || '',
        strategicAxis: activity.strategicAxis || '',
        subAxis: activity.subAxis || '',
        priority: activity.priority || TaskPriority.NORMALE,
        justifications: activity.justifications || '',
        constraints: activity.constraints || [],
        expectedResults: activity.expectedResults || [],
        transferMethods: activity.transferMethods || [],
      });

      setObjectives(activity.objectives && activity.objectives.length > 0 ? activity.objectives : ['']);
      setConstraints(activity.constraints && activity.constraints.length > 0 ? activity.constraints : ['']);
      setExpectedResults(activity.expectedResults && activity.expectedResults.length > 0 ? activity.expectedResults : ['']);
      setTransferMethods(activity.transferMethods && activity.transferMethods.length > 0 ? activity.transferMethods : ['']);

      setDataLoaded(true);
    }
  }, [activity, dataLoaded]);

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
      const activityData: UpdateActivityRequest = {
        ...formData,
        projectId: formData.projectId || undefined,
        stationId: formData.stationId || undefined,
        conventionId: formData.conventionId || undefined,
        objectives: filteredObjectives,
        constraints: constraints.filter(c => c.trim() !== ''),
        expectedResults: expectedResults.filter(r => r.trim() !== ''),
        transferMethods: transferMethods.filter(m => m.trim() !== ''),
      };

      await activitiesApi.updateActivity(id!, activityData);
      toast.success('Activité mise à jour avec succès');
      navigate(`/chercheur/activities/${id}`);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour de l\'activité');
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

  if (activityLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-red-600">Erreur lors du chargement de l'activité</p>
          <Link to="/chercheur/activities">
            <Button className="mt-4 bg-green-600 hover:bg-green-700">
              Retour aux activités
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link to={`/chercheur/activities/${id}`} className="text-green-600 hover:text-green-700 flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à l'activité
        </Link>
      </div>

      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Modifier l'activité</h1>
        <p className="text-gray-600 mt-2">
          Modifiez les informations de l'activité "{activity.title}"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cycle *
                </label>
                <select
                  value={formData.lifecycleStatus}
                  onChange={(e) => setFormData({ ...formData, lifecycleStatus: e.target.value as ActivityLifecycleStatus })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {Object.entries(ActivityLifecycleStatusLabels).map(([key, label]) => (
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
          <Link to={`/chercheur/activities/${id}`}>
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
            {loading ? 'Mise à jour en cours...' : 'Enregistrer les modifications'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditActivity;