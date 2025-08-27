// src/pages/chercheur/EditActivity.tsx - Version finale avec modification du projet
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, Save, Calendar, MapPin, Target, FileText, Lightbulb, AlertCircle } from 'lucide-react';
import activitiesApi, { UpdateActivityRequest, Activity } from '../../services/activitiesApi';
import projectsApi, { Project } from '../../services/projectsApi';

interface FormData {
  title: string;
  description: string;
  objectives: string[];
  methodology: string;
  location: string;
  startDate: string;
  endDate: string;
  results: string;
  conclusions: string;
  projectId: string;
}

const EditActivity: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    objectives: [''],
    methodology: '',
    location: '',
    startDate: '',
    endDate: '',
    results: '',
    conclusions: '',
    projectId: ''
  });

  // Charger l'activité à modifier
  useEffect(() => {
    const loadActivity = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const activityData = await activitiesApi.getActivityById(id);
        setActivity(activityData);
        
        // Pré-remplir le formulaire
        setFormData({
          title: activityData.title,
          description: activityData.description || '',
          objectives: activityData.objectives.length > 0 ? activityData.objectives : [''],
          methodology: activityData.methodology || '',
          location: activityData.location || '',
          startDate: activityData.startDate ? activityData.startDate.split('T')[0] : '',
          endDate: activityData.endDate ? activityData.endDate.split('T')[0] : '',
          results: activityData.results || '',
          conclusions: activityData.conclusions || '',
          projectId: activityData.projectId
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadActivity();
  }, [id]);

  // Charger les projets disponibles
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoadingProjects(true);
        const response = await projectsApi.listProjects({
          limit: 100,
          sortBy: 'title',
          sortOrder: 'asc'
        });
        setProjects(response.projects);
      } catch (err) {
        console.error('Erreur lors du chargement des projets:', err);
      } finally {
        setLoadingProjects(false);
      }
    };

    loadProjects();
  }, []);

  // Mise à jour des champs simples
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Gestion des objectifs
  const addObjective = () => {
    setFormData(prev => ({
      ...prev,
      objectives: [...prev.objectives, '']
    }));
  };

  const updateObjective = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.map((obj, i) => i === index ? value : obj)
    }));
  };

  const removeObjective = (index: number) => {
    if (formData.objectives.length > 1) {
      setFormData(prev => ({
        ...prev,
        objectives: prev.objectives.filter((_, i) => i !== index)
      }));
    }
  };

  // Validation du formulaire
  const validateForm = (): string | null => {
    if (!formData.title.trim()) {
      return 'Le titre est obligatoire';
    }
    
    if (!formData.projectId) {
      return 'Le projet est obligatoire';
    }
    
    if (formData.objectives.some(obj => !obj.trim())) {
      return 'Tous les objectifs doivent être renseignés';
    }

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      return 'La date de fin doit être postérieure à la date de début';
    }

    return null;
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) return;
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // ✅ CORRECTION: Inclure le projectId dans les données de mise à jour
      const activityData: UpdateActivityRequest = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        objectives: formData.objectives.filter(obj => obj.trim()),
        methodology: formData.methodology.trim() || undefined,
        location: formData.location.trim() || undefined,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        results: formData.results.trim() || undefined,
        conclusions: formData.conclusions.trim() || undefined,
        projectId: formData.projectId // ✅ MAINTENANT INCLUS
      };

      await activitiesApi.updateActivity(id, activityData);
      navigate(`/chercheur/activities/${id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const getSelectedProject = () => {
    return projects.find(p => p.id === formData.projectId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !activity) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Erreur de chargement
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => navigate('/chercheur/activities')}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Retour aux activités
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/chercheur/activities/${id}`)}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Modifier l'activité</h1>
          <p className="text-gray-600 mt-1">
            Modifiez les informations de votre activité de recherche
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
                Titre de l'activité *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Collecte de données terrain sur les variétés de riz..."
                required
              />
            </div>

            {/* ✅ PROJET MODIFIABLE - Version corrigée */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Projet associé *
              </label>
              <select
                value={formData.projectId}
                onChange={(e) => handleInputChange('projectId', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={loadingProjects}
              >
                <option value="">
                  {loadingProjects ? 'Chargement des projets...' : 'Sélectionner un projet'}
                </option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
              {getSelectedProject() && (
                <p className="text-sm text-gray-500 mt-1">
                  Statut du projet: {getSelectedProject()?.status}
                </p>
              )}
              <p className="text-sm text-blue-600 mt-1">
                ✅ Vous pouvez maintenant changer le projet associé à cette activité
              </p>
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
                placeholder="Décrivez le contexte et les objectifs de cette activité..."
              />
            </div>

            {/* Lieu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Lieu de l'activité
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Parcelles expérimentales de Saint-Louis"
              />
            </div>

            {/* Méthodologie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Lightbulb className="h-4 w-4" />
                Méthodologie
              </label>
              <textarea
                value={formData.methodology}
                onChange={(e) => handleInputChange('methodology', e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Décrivez la méthodologie utilisée..."
              />
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Planification
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de début
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin prévue
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Objectifs */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Objectifs de l'activité
          </h2>
          
          <div className="space-y-3">
            {formData.objectives.map((objective, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    value={objective}
                    onChange={(e) => updateObjective(index, e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`Objectif ${index + 1}`}
                    required
                  />
                </div>
                {formData.objectives.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeObjective(index)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            
            <button
              type="button"
              onClick={addObjective}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <Plus className="h-4 w-4" />
              Ajouter un objectif
            </button>
          </div>
        </div>

        {/* Résultats et conclusions */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Résultats et conclusions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Résultats observés
              </label>
              <textarea
                value={formData.results}
                onChange={(e) => handleInputChange('results', e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Décrivez les résultats obtenus..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conclusions
              </label>
              <textarea
                value={formData.conclusions}
                onChange={(e) => handleInputChange('conclusions', e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Quelles conclusions tirez-vous de cette activité..."
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-6">
          <button
            type="button"
            onClick={() => navigate(`/chercheur/activities/${id}`)}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditActivity;