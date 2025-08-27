// src/pages/chercheur/CreateSeminar.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  ArrowLeft,
  Save,
  X,
  Clock,
  MapPin,
  Users,
  FileText,
  AlertCircle
} from 'lucide-react';

import seminarsApi from '../../services/seminarsApi';
import { CreateSeminarRequest } from '../../types/seminar.types';

interface FormErrors {
  title?: string;
  description?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  agenda?: string;
  maxParticipants?: string;
  general?: string;
}

const CreateSeminar: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // État du formulaire
  const [formData, setFormData] = useState<CreateSeminarRequest>({
    title: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    agenda: '',
    maxParticipants: undefined,
  });

  // =============================================
  // GESTION DU FORMULAIRE
  // =============================================

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxParticipants' ? (value ? parseInt(value) : undefined) : value
    }));

    // Effacer l'erreur pour ce champ
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validation du titre
    if (!formData.title?.trim()) {
      newErrors.title = 'Le titre est requis';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Le titre doit contenir au moins 3 caractères';
    } else if (formData.title.trim().length > 200) {
      newErrors.title = 'Le titre ne peut pas dépasser 200 caractères';
    }

    // Validation de la description
    if (formData.description && formData.description.length > 2000) {
      newErrors.description = 'La description ne peut pas dépasser 2000 caractères';
    }

    // Validation du lieu
    if (formData.location && formData.location.length > 200) {
      newErrors.location = 'Le lieu ne peut pas dépasser 200 caractères';
    }

    // Validation de la date de début
    if (!formData.startDate) {
      newErrors.startDate = 'La date de début est requise';
    } else {
      const startDate = new Date(formData.startDate);
      const now = new Date();
      if (startDate <= now) {
        newErrors.startDate = 'La date de début doit être dans le futur';
      }
    }

    // Validation de la date de fin
    if (formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (endDate <= startDate) {
        newErrors.endDate = 'La date de fin doit être postérieure à la date de début';
      }
    }

    // Validation de l'agenda
    if (formData.agenda && formData.agenda.length > 5000) {
      newErrors.agenda = 'L\'agenda ne peut pas dépasser 5000 caractères';
    }

    // Validation du nombre maximum de participants
    if (formData.maxParticipants !== undefined) {
      if (formData.maxParticipants < 1) {
        newErrors.maxParticipants = 'Le nombre de participants doit être au moins 1';
      } else if (formData.maxParticipants > 1000) {
        newErrors.maxParticipants = 'Le nombre de participants ne peut pas dépasser 1000';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      // Préparer les données en nettoyant les champs vides
      const cleanedData: CreateSeminarRequest = {
        title: formData.title.trim(),
        description: formData.description?.trim() || undefined,
        location: formData.location?.trim() || undefined,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        agenda: formData.agenda?.trim() || undefined,
        maxParticipants: formData.maxParticipants,
      };

      console.log('🔍 Création du séminaire avec les données:', cleanedData);

      const createdSeminar = await seminarsApi.createSeminar(cleanedData);
      
      console.log('✅ Séminaire créé:', createdSeminar);

      // Rediriger vers le détail du séminaire créé
      navigate(`/chercheur/seminars/${createdSeminar.id}`);

    } catch (err: any) {
      console.error('❌ Erreur lors de la création du séminaire:', err);
      setErrors({ general: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler ? Toutes les modifications seront perdues.')) {
      navigate('/chercheur/seminars');
    }
  };

  // =============================================
  // FONCTIONS UTILITAIRES
  // =============================================

  const formatDateTimeLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Date minimale = maintenant + 1 heure
  const minDate = formatDateTimeLocal(new Date(Date.now() + 60 * 60 * 1000));

  // =============================================
  // RENDU
  // =============================================

  return (
    <div className="space-y-6">
      {/* Bouton retour */}
      <div>
        <Link
          to="/chercheur/seminars"
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux séminaires
        </Link>
      </div>

      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Créer un nouveau séminaire</h1>
        <p className="text-gray-600 mt-1">
          Organisez un séminaire de recherche pour votre équipe
        </p>
      </div>

      {/* Erreur générale */}
      {errors.general && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Erreur lors de la création
              </h3>
              <p className="mt-1 text-sm text-red-700">{errors.general}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setErrors(prev => ({ ...prev, general: undefined }))}
                className="inline-flex text-red-400 hover:text-red-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Informations générales
            </h2>
          </div>
          
          <div className="px-6 py-6 space-y-6">
            {/* Titre */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Titre du séminaire *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`block w-full border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ex: Séminaire sur l'intelligence artificielle"
                maxLength={200}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {formData.title.length}/200 caractères
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className={`block w-full border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Décrivez le contenu et les objectifs du séminaire..."
                maxLength={2000}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {formData.description?.length || 0}/2000 caractères
              </p>
            </div>

            {/* Lieu */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4 inline mr-1" />
                Lieu
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className={`block w-full border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.location ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Salle de conférence, amphithéâtre, en ligne..."
                maxLength={200}
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section Dates et horaires */}
        <div className="bg-white rounded-lg border border-gray-200 shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-600" />
              Dates et horaires
            </h2>
          </div>
          
          <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date de début */}
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Date et heure de début *
              </label>
              <input
                type="datetime-local"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                min={minDate}
                className={`block w-full border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.startDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
              )}
            </div>

            {/* Date de fin */}
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                Date et heure de fin
              </label>
              <input
                type="datetime-local"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                min={formData.startDate || minDate}
                className={`block w-full border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.endDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Optionnel - laissez vide si la durée n'est pas définie
              </p>
            </div>
          </div>
        </div>

        {/* Section Paramètres */}
        <div className="bg-white rounded-lg border border-gray-200 shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              Paramètres
            </h2>
          </div>
          
          <div className="px-6 py-6">
            {/* Nombre maximum de participants */}
            <div>
              <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre maximum de participants
              </label>
              <input
                type="number"
                id="maxParticipants"
                name="maxParticipants"
                value={formData.maxParticipants || ''}
                onChange={handleInputChange}
                min="1"
                max="1000"
                className={`block w-full md:w-48 border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.maxParticipants ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Illimité"
              />
              {errors.maxParticipants && (
                <p className="mt-1 text-sm text-red-600">{errors.maxParticipants}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Laissez vide pour un nombre illimité de participants
              </p>
            </div>
          </div>
        </div>

        {/* Section Agenda */}
        <div className="bg-white rounded-lg border border-gray-200 shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Agenda et programme
            </h2>
          </div>
          
          <div className="px-6 py-6">
            <div>
              <label htmlFor="agenda" className="block text-sm font-medium text-gray-700 mb-2">
                Agenda détaillé
              </label>
              <textarea
                id="agenda"
                name="agenda"
                rows={8}
                value={formData.agenda}
                onChange={handleInputChange}
                className={`block w-full border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.agenda ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Détaillez le programme du séminaire :
- 9h00 - 9h30 : Accueil et présentation
- 9h30 - 10h30 : Conférence principale
- 10h30 - 11h00 : Pause
- ..."
                maxLength={5000}
              />
              {errors.agenda && (
                <p className="mt-1 text-sm text-red-600">{errors.agenda}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {formData.agenda?.length || 0}/5000 caractères
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <X className="h-4 w-4 mr-2" />
            Annuler
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Création en cours...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Créer le séminaire
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSeminar;