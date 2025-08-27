// src/pages/chercheur/CreateTask.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, User, Calendar, Flag, Briefcase, Activity, Target } from 'lucide-react';
import tasksApi, { CreateTaskRequest } from '../../services/tasksApi';
import projectsApi, { Project } from '../../services/projectsApi';
import activitiesApi, { Activity as ActivityType } from '../../services/activitiesApi';
import usersApi, { User as UserType } from '../../services/usersApi';

interface FormData {
  title: string;
  description: string;
  priority: 'BASSE' | 'NORMALE' | 'HAUTE' | 'URGENTE';
  dueDate: string;
  assigneeId: string;
  projectId: string;
  activityId: string;
}

const CreateTask: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour les données de référence
  const [projects, setProjects] = useState<Project[]>([]);
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);

  // État du formulaire (comme dans CreateProject)
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    priority: 'NORMALE',
    dueDate: '',
    assigneeId: '',
    projectId: searchParams.get('projectId') || '',
    activityId: searchParams.get('activityId') || '',
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    // Charger les activités quand un projet est sélectionné
    if (formData.projectId) {
      loadActivitiesForProject(formData.projectId);
    } else {
      setActivities([]);
      setFormData(prev => ({ ...prev, activityId: '' }));
    }
  }, [formData.projectId]);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);
      setError(null);
      
      // Charger les projets et utilisateurs en parallèle
      const [projectsResponse, usersResponse] = await Promise.all([
        projectsApi.listProjects({ limit: 100 }),
        usersApi.listUsers({ limit: 100, roles: 'CHERCHEUR,ASSISTANT_CHERCHEUR,TECHNICIEN_SUPERIEUR' })
      ]);

      setProjects(projectsResponse.projects);
      setUsers(usersResponse.users);

      // Si un projet est pré-sélectionné, charger ses activités
      const preSelectedProjectId = searchParams.get('projectId');
      if (preSelectedProjectId) {
        await loadActivitiesForProject(preSelectedProjectId);
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingData(false);
    }
  };

  const loadActivitiesForProject = async (projectId: string) => {
    try {
      const response = await activitiesApi.getActivitiesByProject(projectId, { limit: 100 });
      setActivities(response.activities);
    } catch (err: any) {
      console.error('Erreur lors du chargement des activités:', err);
      setActivities([]);
    }
  };

  // Mise à jour des champs simples (comme dans CreateProject)
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Validation du formulaire
  const validateForm = (): string | null => {
    if (!formData.title.trim()) {
      return 'Le titre est obligatoire';
    }

    if (!formData.assigneeId) {
      return 'Veuillez sélectionner un assigné';
    }

    if (formData.dueDate) {
      const dueDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dueDate < today) {
        return 'La date d\'échéance ne peut pas être dans le passé';
      }
    }

    return null;
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const taskData: CreateTaskRequest = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        priority: formData.priority,
        dueDate: formData.dueDate || undefined,
        assigneeId: formData.assigneeId,
        projectId: formData.projectId || undefined,
        activityId: formData.activityId || undefined,
      };

      const newTask = await tasksApi.createTask(taskData);
      
      // Rediriger vers la page de détail de la tâche
      navigate(`/chercheur/tasks/${newTask.id}`);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Loading initial
  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/chercheur/tasks')}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nouvelle Tâche</h1>
          <p className="text-gray-600 mt-1">
            Créez une nouvelle tâche et assignez-la à un membre de l'équipe
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Informations de base */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Informations générales
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Titre */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre de la tâche *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Analyser les données de terrain..."
                required
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Décrivez la tâche en détail..."
              />
            </div>

            {/* Assigné */}
            <div>
              <label className="flex text-sm font-medium text-gray-700 mb-2 items-center gap-1">
                <User className="h-4 w-4" />
                Assigné à *
              </label>
              <select
                value={formData.assigneeId}
                onChange={(e) => handleInputChange('assigneeId', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Sélectionner un utilisateur</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} ({user.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Priorité */}
            <div>
              <label className="flex text-sm font-medium text-gray-700 mb-2 items-center gap-1">
                <Flag className="h-4 w-4" />
                Priorité
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value as any)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="BASSE">Basse</option>
                <option value="NORMALE">Normale</option>
                <option value="HAUTE">Haute</option>
                <option value="URGENTE">Urgente</option>
              </select>
            </div>
          </div>
        </div>

        {/* Planification */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Planification
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date d'échéance
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Contexte - Projet et Activité */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contexte (optionnel)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Projet */}
            <div>
              <label className="flex text-sm font-medium text-gray-700 mb-2 items-center gap-1">
                <Briefcase className="h-4 w-4" />
                Projet
              </label>
              <select
                value={formData.projectId}
                onChange={(e) => handleInputChange('projectId', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Aucun projet sélectionné</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Associer cette tâche à un projet existant
              </p>
            </div>

            {/* Activité */}
            <div>
              <label className="flex text-sm font-medium text-gray-700 mb-2 items-center gap-1">
                <Activity className="h-4 w-4" />
                Activité
              </label>
              <select
                value={formData.activityId}
                onChange={(e) => handleInputChange('activityId', e.target.value)}
                disabled={!formData.projectId}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Aucune activité sélectionnée</option>
                {activities.map((activity) => (
                  <option key={activity.id} value={activity.id}>
                    {activity.title}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                {formData.projectId 
                  ? "Associer cette tâche à une activité du projet sélectionné"
                  : "Sélectionnez d'abord un projet pour voir les activités"
                }
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-6">
          <button
            type="button"
            onClick={() => navigate('/chercheur/tasks')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="h-4 w-4" />
            )}
            {loading ? 'Création...' : 'Créer la tâche'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTask;