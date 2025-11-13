// src/pages/chercheur/EditTask.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, Calendar, Flag, Briefcase, Activity, Target, AlertTriangle } from 'lucide-react';
import { Task, UpdateTaskRequest } from '../../services/tasksApi';
import usersApi, { User as UserType } from '../../services/usersApi';
import { useTask, useTaskActions } from '../../hooks/useTasks';

interface FormData {
  title: string;
  description: string;
  status: Task['status'];
  priority: Task['priority'];
  progress: number;
  dueDate: string;
  assigneeId: string;
}

const EditTask: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour les données de référence
  const [users, setUsers] = useState<UserType[]>([]);

  // Hooks personnalisés
  const { task, loading: taskLoading } = useTask(id!);
  const { updating, updateTaskStatus, updateTaskProgress } = useTaskActions();

  // État du formulaire
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    status: 'A_FAIRE',
    priority: 'NORMALE',
    progress: 0,
    dueDate: '',
    assigneeId: '',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (task) {
      // Remplir le formulaire avec les données de la tâche
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        progress: task.progress,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        assigneeId: task.assignee?.id || '',
      });
    }
  }, [task]);

  const loadUsers = async () => {
    try {
      setLoadingData(true);
      setError(null);
      
      const response = await usersApi.listUsers({ 
        limit: 100, 
        roles: 'CHERCHEUR,ASSISTANT_CHERCHEUR,TECHNICIEN_SUPERIEUR' 
      });
      setUsers(response.users);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingData(false);
    }
  };

  // Mise à jour des champs simples
  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const progress = parseInt(e.target.value);
    handleInputChange('progress', progress);
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
      
      if (dueDate < today && formData.status !== 'TERMINEE') {
        return 'La date d\'échéance ne peut pas être dans le passé pour une tâche non terminée';
      }
    }

    if (formData.progress < 0 || formData.progress > 100) {
      return 'Le progrès doit être entre 0 et 100';
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

    if (!task) return;

    try {
      setError(null);

      const updateData: UpdateTaskRequest = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        status: formData.status,
        priority: formData.priority,
        progress: formData.progress,
        dueDate: formData.dueDate || undefined,
        assigneeId: formData.assigneeId,
      };

      // Utiliser les hooks pour mettre à jour
      if (formData.status !== task.status) {
        await updateTaskStatus(task.id, formData.status);
      }
      
      if (formData.progress !== task.progress) {
        await updateTaskProgress(task.id, formData.progress);
      }

      // Pour les autres champs, on peut utiliser directement l'API
      // ou étendre les hooks selon les besoins
      
      // Rediriger vers la page de détail de la tâche
      navigate(`/chercheur/tasks/${task.id}`);
      
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Loading states
  if (taskLoading || loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Error state
  if (!task) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <h3 className="text-lg font-medium text-red-900 mb-2">Tâche non trouvée</h3>
          <p className="text-red-700">La tâche que vous cherchez n'existe pas ou a été supprimée.</p>
        </div>
        <button
          onClick={() => navigate('/chercheur/tasks')}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux tâches
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/chercheur/tasks/${task.id}`)}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Modifier la tâche</h1>
          <p className="text-gray-600 mt-1">
            Modifiez les détails de la tâche "{task.title}"
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
                placeholder="Entrez le titre de la tâche"
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

            {/* Statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as Task['status'])}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="A_FAIRE">À faire</option>
                <option value="EN_COURS">En cours</option>
                <option value="EN_REVISION">En révision</option>
                <option value="TERMINEE">Terminée</option>
                <option value="ANNULEE">Annulée</option>
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
                onChange={(e) => handleInputChange('priority', e.target.value as Task['priority'])}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="BASSE">Basse</option>
                <option value="NORMALE">Normale</option>
                <option value="HAUTE">Haute</option>
                <option value="URGENTE">Urgente</option>
              </select>
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

            {/* Progrès */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Progrès ({formData.progress}%)
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={handleProgressChange}
                  className="w-full"
                />
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-blue-500 transition-all"
                    style={{ width: `${formData.progress}%` }}
                  />
                </div>
              </div>
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Informations contextuelles (lecture seule) */}
        {(task.project || task.activity) && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contexte</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Projet */}
              {task.project && (
                <div>
                  <label className="flex text-sm font-medium text-gray-700 mb-2 items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    Projet
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600">
                    {task.project.title}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Le contexte projet ne peut pas être modifié
                  </p>
                </div>
              )}

              {/* Activité */}
              {task.activity && (
                <div>
                  <label className="flex text-sm font-medium text-gray-700 mb-2 items-center gap-1">
                    <Activity className="h-4 w-4" />
                    Activité
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600">
                    {task.activity.title}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Le contexte activité ne peut pas être modifié
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-6">
          <button
            type="button"
            onClick={() => navigate(`/chercheur/tasks/${task.id}`)}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={updating}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {updating ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="h-4 w-4" />
            )}
            {updating ? 'Mise à jour...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTask;