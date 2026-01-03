// src/pages/chercheur/CreateKnowledgeTransfer.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, X, Save, Share2, ChevronLeft, ChevronRight, FileText, MapPin, Users, Activity, TrendingUp } from 'lucide-react';
import { knowledgeTransferApi, TransferType, CreateKnowledgeTransferData } from '../../services/knowledgeTransferApi';
import { activitiesApi } from '../../services/activitiesApi';
import toast from 'react-hot-toast';

interface Activity {
  id: string;
  title: string;
  code?: string;
}

const CreateKnowledgeTransfer: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const [currentStep, setCurrentStep] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditMode);
  const [activities, setActivities] = useState<Activity[]>([]);

  const [formData, setFormData] = useState<CreateKnowledgeTransferData>({
    title: '',
    description: '',
    type: 'FICHE_TECHNIQUE',
    targetAudience: [],
    location: '',
    date: new Date().toISOString().split('T')[0],
    participants: undefined,
    impact: '',
    feedback: '',
    activityId: undefined
  });

  const [newAudience, setNewAudience] = useState('');

  const steps = [
    { title: 'Informations de base', icon: FileText },
    { title: 'Localisation et public', icon: MapPin },
    { title: 'Activité liée', icon: Activity },
    { title: 'Impact et retours', icon: TrendingUp }
  ];

  useEffect(() => {
    loadInitialData();
  }, [id]);

  const loadInitialData = async () => {
    try {
      // Charger les activités
      const activitiesResponse = await activitiesApi.listActivities({ limit: 100 });
      setActivities(activitiesResponse.activities || []);

      // Si mode édition, charger le transfert
      if (isEditMode && id) {
        setLoadingData(true);
        const transfer = await knowledgeTransferApi.getKnowledgeTransferById(id);

        setFormData({
          title: transfer.title,
          description: transfer.description || '',
          type: transfer.type,
          targetAudience: transfer.targetAudience || [],
          location: transfer.location || '',
          date: new Date(transfer.date).toISOString().split('T')[0],
          participants: transfer.participants,
          impact: transfer.impact || '',
          feedback: transfer.feedback || '',
          activityId: transfer.activityId
        });
        setLoadingData(false);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement des données');
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Le titre est requis');
      setCurrentStep(0);
      return;
    }

    if (!formData.date) {
      toast.error('La date est requise');
      setCurrentStep(0);
      return;
    }

    try {
      setLoading(true);

      if (isEditMode && id) {
        await knowledgeTransferApi.updateKnowledgeTransfer(id, formData);
        toast.success('Transfert mis à jour avec succès');
      } else {
        await knowledgeTransferApi.createKnowledgeTransfer(formData);
        toast.success('Transfert créé avec succès');
      }

      navigate('/chercheur/knowledge-transfers');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAudience = () => {
    if (newAudience.trim() && !formData.targetAudience.includes(newAudience.trim())) {
      setFormData({
        ...formData,
        targetAudience: [...formData.targetAudience, newAudience.trim()]
      });
      setNewAudience('');
    }
  };

  const handleRemoveAudience = (audience: string) => {
    setFormData({
      ...formData,
      targetAudience: formData.targetAudience.filter(a => a !== audience)
    });
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

  if (loadingData) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-6">
      {/* En-tête */}
      <div className="mb-6">
        <Link
          to="/chercheur/knowledge-transfers"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour aux transferts de connaissances
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Share2 className="h-8 w-8 text-green-600" />
          {isEditMode ? 'Modifier le transfert' : 'Nouveau transfert de connaissances'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEditMode ? 'Modifiez les informations du transfert' : 'Créez une nouvelle activité de transfert'}
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
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  Informations de base
                </h2>

                {/* Titre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Formation sur les techniques de culture du riz"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Décrivez l'activité de transfert..."
                  />
                </div>

                {/* Type et Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type de transfert <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as TransferType })}
                    >
                      {knowledgeTransferApi.getTransferTypes().map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Localisation et public */}
            {currentStep === 1 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  Localisation et public
                </h2>

                {/* Lieu et Participants */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lieu
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Ex: Saint-Louis, Sénégal"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de participants
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={formData.participants || ''}
                      onChange={(e) => setFormData({ ...formData, participants: e.target.value ? parseInt(e.target.value) : undefined })}
                      placeholder="Ex: 50"
                    />
                  </div>
                </div>

                {/* Public cible */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Public cible
                    <span className="text-gray-500 text-xs ml-2">(Recommandé)</span>
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={newAudience}
                      onChange={(e) => setNewAudience(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAudience())}
                      placeholder="Ex: Producteurs de riz, Agriculteurs..."
                    />
                    <button
                      type="button"
                      onClick={handleAddAudience}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  {formData.targetAudience.length === 0 && (
                    <p className="text-sm text-amber-600 mb-2">
                      💡 Il est recommandé de spécifier au moins un public cible pour mieux cibler votre activité.
                    </p>
                  )}
                  {formData.targetAudience.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.targetAudience.map((audience, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                        >
                          {audience}
                          <button
                            type="button"
                            onClick={() => handleRemoveAudience(audience)}
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
            )}

            {/* Step 2: Activité liée */}
            {currentStep === 2 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  Activité liée
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Activité liée (optionnel)
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={formData.activityId || ''}
                    onChange={(e) => setFormData({ ...formData, activityId: e.target.value || undefined })}
                  >
                    <option value="">Aucune activité</option>
                    {activities.map(activity => (
                      <option key={activity.id} value={activity.id}>
                        {activity.code ? `[${activity.code}] ` : ''}{activity.title}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Associez ce transfert à une activité de recherche existante si applicable
                  </p>
                </div>

                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    💡 Astuce: Lier ce transfert à une activité permet de mieux suivre l'impact de vos recherches.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Impact et retours */}
            {currentStep === 3 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Impact et Retours
                </h2>

                {/* Impact */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Impact
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={formData.impact}
                    onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                    placeholder="Décrivez l'impact de cette activité..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Ex: Amélioration des rendements de 20%, adoption de nouvelles techniques par 30 agriculteurs...
                  </p>
                </div>

                {/* Feedback */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Retours/Feedback
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={formData.feedback}
                    onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                    placeholder="Retours des participants, observations..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Ex: Les participants ont apprécié la formation pratique, demande de sessions de suivi...
                  </p>
                </div>

                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    💡 Astuce: Documenter l'impact et les retours aide à mesurer l'efficacité de vos transferts de connaissances.
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
            <Link
              to="/chercheur/knowledge-transfers"
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annuler
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
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    {isEditMode ? 'Mettre à jour' : 'Créer'}
                  </>
                )}
              </button>
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

export default CreateKnowledgeTransfer;
