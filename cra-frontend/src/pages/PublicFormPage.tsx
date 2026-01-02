// src/pages/PublicFormPage.tsx - Page publique pour les formulaires partagés

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FormResponseCollector from '../components/forms/FormResponseCollector';
import formApi from '../services/formApi';
import { Form } from '../types/form.types';
import { Loader, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';

export const PublicFormPage: React.FC = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<{
    form: Form;
    canCollect: boolean;
    remainingSubmissions: number | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const loadForm = async () => {
      if (!shareToken) return;

      setLoading(true);
      try {
        const data = await formApi.getFormByPublicLink(shareToken);
        setFormData(data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Erreur lors du chargement';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadForm();
  }, [shareToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-16 h-16 animate-spin text-green-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Chargement du formulaire...
          </h2>
          <p className="text-gray-600">Veuillez patienter</p>
        </div>
      </div>
    );
  }

  if (error || !formData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Lien invalide ou expiré
          </h2>
          <p className="text-gray-600 mb-6">
            {error ||
              'Ce lien de partage n\'est plus valide. Il a peut-être expiré ou a été supprimé.'}
          </p>
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
            <p className="mb-2">
              <strong>Que faire ?</strong>
            </p>
            <ul className="text-left list-disc list-inside space-y-1">
              <li>Vérifiez que vous avez le bon lien</li>
              <li>Contactez la personne qui vous a partagé le formulaire</li>
              <li>Demandez un nouveau lien de partage</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Merci pour votre contribution !
          </h2>
          <p className="text-gray-600 mb-6">
            {formData.form.schema.settings?.successMessage ||
              'Votre réponse a été enregistrée avec succès.'}
          </p>

          {formData.form.schema.settings?.allowMultipleSubmissions && (
            <div className="space-y-4">
              <div className="bg-green-50 rounded-lg p-4 text-sm text-green-900">
                Vous pouvez soumettre une nouvelle réponse si vous le souhaitez.
              </div>
              <button
                onClick={() => setSubmitted(false)}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Soumettre une nouvelle réponse
              </button>
            </div>
          )}

          {formData.remainingSubmissions !== null &&
            formData.remainingSubmissions > 0 && (
              <div className="mt-4 text-sm text-gray-600">
                Encore {formData.remainingSubmissions} soumission(s) autorisée(s)
              </div>
            )}
        </div>
      </div>
    );
  }

  if (!formData.canCollect) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <AlertCircle className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Collecte terminée
          </h2>
          <p className="text-gray-600 mb-6">
            Ce formulaire n'accepte plus de nouvelles soumissions.
          </p>
          {formData.remainingSubmissions === 0 && (
            <div className="bg-yellow-50 rounded-lg p-4 text-sm text-yellow-900">
              La limite maximale de soumissions a été atteinte.
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-50 to-green-100">
      {/* En-tête */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <img
                  src="/isra.png"
                  alt="ISRA Logo"
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Formulaire partagé
                  </h1>
                  <p className="text-sm text-gray-600">
                    Complétez ce formulaire pour contribuer
                  </p>
                </div>
              </div>
            </div>

            {formData.remainingSubmissions !== null && (
              <div className="text-right">
                <div className="text-sm text-gray-600">
                  Soumissions restantes
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {formData.remainingSubmissions}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bannière d'informations */}
        <div className="mb-6 bg-white rounded-lg border border-green-200 p-4 flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-green-900 mb-1">
              Formulaire public
            </h3>
            <p className="text-sm text-green-700">
              Vous accédez à ce formulaire via un lien de partage. Vos réponses
              seront collectées de manière anonyme ou avec les informations que
              vous fournirez.
            </p>
            {formData.form.schema.settings?.enableOfflineMode && (
              <p className="text-sm text-blue-700 mt-2">
                💡 Mode offline disponible - Vous pouvez remplir ce formulaire
                sans connexion internet.
              </p>
            )}
          </div>
        </div>

        {/* Formulaire de collecte */}
        <FormResponseCollector
          form={formData.form}
          isPublic={true}
          shareToken={shareToken}
          onSubmitSuccess={() => setSubmitted(true)}
        />

        {/* Pied de page */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Ce formulaire est hébergé sur une plateforme sécurisée. Vos données
            sont protégées.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicFormPage;
