// src/components/forms/FormResponseCollector.tsx - Composant de collecte de réponses avec photos

import React, { useState } from 'react';
import {
  Form,
  FormField,
  PhotoData,
  SubmitFormResponseRequest,
} from '../../types/form.types';
import {
  Camera,
  X,
  MapPin,
  Calendar,
  Save,
  Send,
  AlertCircle,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import formApi from '../../services/formApi';
import { capturePhoto, capturePhotoWithCamera } from '../../services/offlineFormService';
import offlineFormService from '../../services/offlineFormService';
import { useOfflineSync } from '../../hooks/useOfflineSync';

interface FormResponseCollectorProps {
  form: Form;
  isPublic?: boolean;
  shareToken?: string;
  onSubmitSuccess?: () => void;
}

export const FormResponseCollector: React.FC<FormResponseCollectorProps> = ({
  form,
  isPublic = false,
  shareToken,
  onSubmitSuccess,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [photos, setPhotos] = useState<Record<string, PhotoData[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [collectorName, setCollectorName] = useState('');
  const [collectorEmail, setCollectorEmail] = useState('');

  const { isOnline } = useOfflineSync();

  // Gérer le changement de valeur d'un champ
  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));

    // Supprimer l'erreur si le champ est maintenant valide
    if (errors[fieldId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  // Capturer une photo
  const handleCapturePhoto = async (field: FormField) => {
    try {
      let photo: PhotoData;

      // Essayer d'utiliser la caméra avec prévisualisation en temps réel
      try {
        photo = await capturePhotoWithCamera({
          enableGPS: field.photoConfig?.enableGPS,
          quality: field.photoConfig?.quality || 0.8,
          facingMode: 'environment', // Caméra arrière par défaut
        });
      } catch (cameraError: any) {
        // Si l'API caméra n'est pas disponible, utiliser le sélecteur de fichiers
        console.log('API caméra non disponible, utilisation du fallback:', cameraError.message);
        photo = await capturePhoto({
          enableGPS: field.photoConfig?.enableGPS,
          quality: field.photoConfig?.quality || 0.8,
        });
      }

      setPhotos((prev) => ({
        ...prev,
        [field.id]: [...(prev[field.id] || []), photo],
      }));

      toast.success('Photo capturée avec succès');
    } catch (err: any) {
      // Ne pas afficher d'erreur si l'utilisateur a annulé
      if (!err.message?.includes('annulée')) {
        toast.error('Erreur lors de la capture de la photo');
      }
    }
  };

  // Supprimer une photo
  const handleRemovePhoto = (fieldId: string, index: number) => {
    setPhotos((prev) => ({
      ...prev,
      [fieldId]: prev[fieldId].filter((_, i) => i !== index),
    }));
  };

  // Ajouter une légende à une photo
  const handlePhotoCaption = (fieldId: string, index: number, caption: string) => {
    setPhotos((prev) => ({
      ...prev,
      [fieldId]: prev[fieldId].map((photo, i) =>
        i === index ? { ...photo, caption } : photo
      ),
    }));
  };

  // Valider le formulaire
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Valider les informations du collecteur pour les formulaires publics
    if (isPublic) {
      if (!collectorName.trim()) {
        newErrors.collectorName = 'Le nom est requis';
      }
      if (!collectorEmail.trim()) {
        newErrors.collectorEmail = 'L\'email est requis';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(collectorEmail)) {
        newErrors.collectorEmail = 'Email invalide';
      }
    }

    form.schema.fields.forEach((field) => {
      // Validation générique pour les champs requis (sauf photo qui a sa propre validation)
      if (field.required && field.type !== 'photo') {
        const value = formData[field.id];

        if (value === undefined || value === null || value === '') {
          newErrors[field.id] = `${field.label} est requis`;
        } else if (Array.isArray(value) && value.length === 0) {
          newErrors[field.id] = `${field.label} est requis`;
        }
      }

      // Validation spécifique aux photos
      if (field.type === 'photo' && field.required) {
        if (!photos[field.id] || photos[field.id].length === 0) {
          newErrors[field.id] = `Au moins une photo est requise pour ${field.label}`;
        }
      }

      // Validation des nombres
      if (field.type === 'number' && formData[field.id] !== undefined) {
        const num = Number(formData[field.id]);
        if (isNaN(num)) {
          newErrors[field.id] = 'Valeur numérique invalide';
        } else if (field.validation?.min !== undefined && num < field.validation.min) {
          newErrors[field.id] = `La valeur doit être au moins ${field.validation.min}`;
        } else if (field.validation?.max !== undefined && num > field.validation.max) {
          newErrors[field.id] = `La valeur ne peut pas dépasser ${field.validation.max}`;
        }
      }

      // Validation des emails
      if (field.type === 'email' && formData[field.id]) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData[field.id])) {
          newErrors[field.id] = 'Email invalide';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs du formulaire');
      return;
    }

    setIsSubmitting(true);

    try {
      // Préparer toutes les photos avec leur fieldId
      const allPhotos: PhotoData[] = [];
      Object.entries(photos).forEach(([fieldId, photoArray]) => {
        photoArray.forEach(photo => {
          allPhotos.push({
            ...photo,
            fieldId, // Ajouter le fieldId à chaque photo
          });
        });
      });

      // Nettoyer les base64 (retirer le préfixe data:image/...;base64,)
      const cleanedPhotos = allPhotos.map(photo => {
        let cleanBase64 = photo.base64;
        // Extraire uniquement la partie base64 si elle contient le préfixe
        if (cleanBase64.includes(';base64,')) {
          cleanBase64 = cleanBase64.split(';base64,')[1];
        }
        return {
          ...photo,
          base64: cleanBase64,
        };
      });

      const responseData: SubmitFormResponseRequest = {
        data: formData,
        photos: cleanedPhotos,
        ...(isPublic && {
          collectorName,
          collectorEmail,
        }),
      };

      if (isOnline) {
        // Soumettre en ligne
        if (isPublic && shareToken) {
          await formApi.submitPublicFormResponse(shareToken, responseData);
        } else {
          await formApi.submitFormResponse(form.id, responseData);
        }

        toast.success('Réponse soumise avec succès');
      } else {
        // Sauvegarder en mode offline avec le schema du formulaire
        await offlineFormService.saveOfflineResponse(form.id, responseData, form.schema);
        toast.success('Réponse sauvegardée (sera synchronisée en ligne)');
      }

      // Réinitialiser le formulaire
      setFormData({});
      setPhotos({});
      setCollectorName('');
      setCollectorEmail('');

      if (onSubmitSuccess) {
        onSubmitSuccess();
      }

      // Scroll vers le haut
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la soumission';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Rendre un champ selon son type
  const renderField = (field: FormField) => {
    const hasError = !!errors[field.id];
    const errorMessage = errors[field.id];

    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <div key={field.id} className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {field.description && (
              <p className="text-sm text-gray-500 mb-2">{field.description}</p>
            )}
            <input
              type={field.type}
              value={formData[field.id] || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                hasError ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {hasError && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errorMessage}
              </p>
            )}
          </div>
        );

      case 'number':
        return (
          <div key={field.id} className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {field.description && (
              <p className="text-sm text-gray-500 mb-2">{field.description}</p>
            )}
            <input
              type="number"
              value={formData[field.id] || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              min={field.validation?.min}
              max={field.validation?.max}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                hasError ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {hasError && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errorMessage}
              </p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {field.description && (
              <p className="text-sm text-gray-500 mb-2">{field.description}</p>
            )}
            <textarea
              value={formData[field.id] || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              rows={4}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                hasError ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {hasError && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errorMessage}
              </p>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {field.description && (
              <p className="text-sm text-gray-500 mb-2">{field.description}</p>
            )}
            <select
              value={formData[field.id] || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                hasError ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Sélectionnez une option</option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {hasError && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errorMessage}
              </p>
            )}
          </div>
        );

      case 'radio':
        return (
          <div key={field.id} className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {field.description && (
              <p className="text-sm text-gray-500 mb-2">{field.description}</p>
            )}
            <div className="space-y-2">
              {field.options?.map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    name={field.id}
                    value={option.value}
                    checked={formData[field.id] === option.value}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
            {hasError && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errorMessage}
              </p>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {field.description && (
              <p className="text-sm text-gray-500 mb-2">{field.description}</p>
            )}
            <div className="space-y-2">
              {field.options?.map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    value={option.value}
                    checked={(formData[field.id] || []).includes(option.value)}
                    onChange={(e) => {
                      const currentValues = formData[field.id] || [];
                      const newValues = e.target.checked
                        ? [...currentValues, option.value]
                        : currentValues.filter((v: any) => v !== option.value);
                      handleFieldChange(field.id, newValues);
                    }}
                    className="mr-2"
                  />
                  <span className="text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
            {hasError && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errorMessage}
              </p>
            )}
          </div>
        );

      case 'date':
        return (
          <div key={field.id} className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {field.description && (
              <p className="text-sm text-gray-500 mb-2">{field.description}</p>
            )}
            <input
              type="date"
              value={formData[field.id] || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                hasError ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {hasError && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errorMessage}
              </p>
            )}
          </div>
        );

      case 'photo':
        return (
          <div key={field.id} className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {field.description && (
              <p className="text-sm text-gray-500 mb-2">{field.description}</p>
            )}

            {/* Bouton de capture */}
            <button
              type="button"
              onClick={() => handleCapturePhoto(field)}
              className="mb-4 flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Camera className="w-5 h-5 mr-2" />
              Prendre une photo
            </button>

            {/* Grille de photos */}
            {photos[field.id] && photos[field.id].length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {photos[field.id].map((photo, index) => (
                  <div key={index} className="relative bg-gray-100 rounded-lg p-2">
                    <img
                      src={photo.base64}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-32 object-cover rounded"
                    />

                    {/* Bouton supprimer */}
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(field.id, index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    {/* Informations GPS */}
                    {photo.latitude && photo.longitude && (
                      <div className="mt-1 flex items-center text-xs text-gray-600">
                        <MapPin className="w-3 h-3 mr-1" />
                        GPS: {photo.latitude.toFixed(4)}, {photo.longitude.toFixed(4)}
                      </div>
                    )}

                    {/* Date de prise */}
                    {photo.takenAt && (
                      <div className="mt-1 flex items-center text-xs text-gray-600">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(photo.takenAt).toLocaleString('fr-FR')}
                      </div>
                    )}

                    {/* Champ légende */}
                    {field.photoConfig?.enableCaption && (
                      <input
                        type="text"
                        value={photo.caption || ''}
                        onChange={(e) =>
                          handlePhotoCaption(field.id, index, e.target.value)
                        }
                        placeholder="Ajouter une légende..."
                        className="mt-2 w-full px-2 py-1 text-xs border border-gray-300 rounded"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {hasError && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errorMessage}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
      {/* En-tête avec logo */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <img
              src="/isra.png"
              alt="ISRA Logo"
              className="w-16 h-16 rounded-xl object-cover mr-4"
            />
            <h2 className="text-2xl font-bold text-gray-900">{form.title}</h2>
          </div>
          <div className="flex items-center">
            {isOnline ? (
              <div className="flex items-center text-green-600">
                <Wifi className="w-5 h-5 mr-1" />
                <span className="text-sm">En ligne</span>
              </div>
            ) : (
              <div className="flex items-center text-orange-600">
                <WifiOff className="w-5 h-5 mr-1" />
                <span className="text-sm">Mode offline</span>
              </div>
            )}
          </div>
        </div>

        {form.description && (
          <p className="text-gray-600">{form.description}</p>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Informations du collecteur (pour formulaire public) */}
        {isPublic && (
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Vos informations
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom complet <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={collectorName}
                onChange={(e) => setCollectorName(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg ${
                  errors.collectorName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.collectorName && (
                <p className="mt-1 text-sm text-red-600">{errors.collectorName}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={collectorEmail}
                onChange={(e) => setCollectorEmail(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg ${
                  errors.collectorEmail ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.collectorEmail && (
                <p className="mt-1 text-sm text-red-600">{errors.collectorEmail}</p>
              )}
            </div>
          </div>
        )}

        {/* Champs du formulaire */}
        {form.schema.fields.map((field) => renderField(field))}

        {/* Bouton de soumission */}
        <div className="mt-8 flex justify-end space-x-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Envoi en cours...
              </>
            ) : isOnline ? (
              <>
                <Send className="w-5 h-5 mr-2" />
                Soumettre
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Sauvegarder (offline)
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormResponseCollector;
