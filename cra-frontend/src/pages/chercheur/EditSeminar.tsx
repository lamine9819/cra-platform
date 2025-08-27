// src/pages/chercheur/EditSeminar.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  ArrowLeft,
  Save,
  X,
  Clock,
  MapPin,
  Users,
  FileText,
  AlertCircle,
  XCircle
} from 'lucide-react';

import seminarsApi from '../../services/seminarsApi';
import { SeminarResponse, UpdateSeminarRequest } from '../../types/seminar.types';

interface FormErrors {
  title?: string;
  description?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  agenda?: string;
  maxParticipants?: string;
  status?: string;
  general?: string;
}

const EditSeminar: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [seminar, setSeminar] = useState<SeminarResponse | null>(null);

  // État du formulaire
  const [formData, setFormData] = useState<UpdateSeminarRequest>({
    title: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    status: 'PLANIFIE',
    agenda: '',
    maxParticipants: undefined,
  });

  // Données utilisateur
  const userData = JSON.parse(localStorage.getItem('cra_user_data') || '{}');
  const userRole = userData.role;

  // =============================================
  // CHARGEMENT DES DONNÉES
  // =============================================

  useEffect(() => {
    if (id) {
      loadSeminar();
    }
  }, [id]);

  const loadSeminar = async () => {
    if (!id) return;
    
    try {
      setLoadingData(true);
      
      const seminarData = await seminarsApi.getSeminarById(id);
      setSeminar(seminarData);
      
      // Vérifier les permissions
      if (seminarData.organizer.id !== userData.id && userRole !== 'ADMINISTRATEUR') {
        setErrors({ general: 'Vous n\'avez pas les droits pour modifier ce séminaire' });
        return;
      }
      
      // Pré-remplir le formulaire
      setFormData({
        title: seminarData.title,
        description: seminarData.description || '',
        location: seminarData.location || '',
        startDate: formatDateTimeLocal(new Date(seminarData.startDate)),
        endDate: seminarData.endDate ? formatDateTimeLocal(new Date(seminarData.endDate)) : '',
        status: seminarData.status as any,
        agenda: seminarData.agenda || '',
        maxParticipants: seminarData.maxParticipants || undefined,
      });
      
    } catch (err: any) {
      console.error('❌ Erreur lors du chargement du séminaire:', err);
      setErrors({ general: err.message });
    } finally {
      setLoadingData(false);
    }
  };

  // =============================================
  // GESTION DU FORMULAIRE
  // =============================================

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
    }

    // Validation de la date de fin
    if (formData.endDate && formData.startDate) {
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
      
      // Vérifier qu'on ne réduit pas en dessous du nombre actuel d'inscrits
      if (seminar && seminar._count?.participants && formData.maxParticipants < seminar._count.participants) {
        newErrors.maxParticipants = `Impossible de réduire à ${formData.maxParticipants}. Il y a déjà ${seminar._count.participants} inscrits.`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !id) {
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      // Préparer les données en nettoyant les champs vides
      const cleanedData: UpdateSeminarRequest = {
        title: formData.title?.trim(),
        description: formData.description?.trim() || undefined,
        location: formData.location?.trim() || undefined,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        status: formData.status,
        agenda: formData.agenda?.trim() || undefined,
        maxParticipants: formData.maxParticipants,
      };

      console.log('🔍 Mise à jour du séminaire avec les données:', cleanedData);

      const updatedSeminar = await seminarsApi.updateSeminar(id, cleanedData);
      
      console.log('✅ Séminaire mis à jour:', updatedSeminar);

      // Rediriger vers le détail du séminaire
      navigate(`/chercheur/seminars/${updatedSeminar.id}`);

    } catch (err: any) {
      console.error('❌ Erreur lors de la mise à jour du séminaire:', err);
      setErrors({ general: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler ? Toutes les modifications seront perdues.')) {
      navigate(`/chercheur/seminars/${id}`);
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

  const canEditDates = (): boolean => {
    // L'admin peut toujours modifier les dates
    if (userRole === 'ADMINISTRATEUR') return true;
    
    // Si le séminaire a déjà commencé, on ne peut plus modifier les dates
    if (seminar && seminar.status === 'EN_COURS') return false;
    if (seminar && seminar.status === 'TERMINE') return false;
    
    return true;
  };

  const canEditStatus = (): boolean => {
    return userRole === 'ADMINISTRATEUR';
  };

  // =============================================
  // RENDU
  // =============================================

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Chargement du séminaire...</span>
      </div>
    );
  }

  if (errors.general && !seminar) {
    return (
      <div className="text-center py-12">
        <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur</h3>
        <p className="text-gray-600 mb-4">{errors.general}</p>
        <Link
          to="/chercheur/seminars"
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux séminaires
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bouton retour */}
      <div>
        <Link
          to={`/chercheur/seminars/${id}`}
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour au séminaire
        </Link>
      </div>

      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Modifier le séminaire</h1>
        <p className="text-gray-600 mt-1">
          Modifiez les informations de votre séminaire
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
                Erreur lors de la modification
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
                {formData.title?.length || 0}/200 caractères
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

            {/* Statut (seulement pour admin) */}
            {canEditStatus() && (
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Statut
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={`block w-full border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.status ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="PLANIFIE">Planifié</option>
                  <option value="EN_COURS">En cours</option>
                  <option value="TERMINE">Terminé</option>
                  <option value="ANNULE">Annulé</option>
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Modification du statut réservée aux administrateurs
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Section Dates et horaires */}
        <div className="bg-white rounded-lg border border-gray-200 shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-600" />
              Dates et horaires
            </h2>
            {!canEditDates() && (
              <p className="text-sm text-yellow-600 mt-1">
                ⚠️ Les dates ne peuvent plus être modifiées car le séminaire a déjà commencé ou est terminé
              </p>
            )}
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
                disabled={!canEditDates()}
                className={`block w-full border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
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
                disabled={!canEditDates()}
                min={formData.startDate}
                className={`block w-full border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
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
                min={seminar?._count?.participants || 1}
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
                {seminar?._count?.participants ? 
                  `Minimum ${seminar._count.participants} (participants actuels). Laissez vide pour illimité.` :
                  'Laissez vide pour un nombre illimité de participants'
                }
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
                Modification en cours...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Enregistrer les modifications
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditSeminar;