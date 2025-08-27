// src/pages/public/PublicFormPage.tsx - Page publique pour remplir les formulaires
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useForm, useFormResponses } from '../../hooks/useForms';
import FormRenderer from '../../components/forms/FormRenderer';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const PublicFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { form, loading: formLoading, error: formError } = useForm(id);
  const { submitResponse, loading: submitLoading } = useFormResponses(id);

  const handleSubmit = async (data: any) => {
    try {
      setSubmitError(null);
      const response = await submitResponse(data);
      
      if (response) {
        setIsSubmitted(true);
      }
    } catch (error: any) {
      setSubmitError(error.message || 'Une erreur est survenue lors de la soumission');
    }
  };

  // État de chargement
  if (formLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 mt-4">Chargement du formulaire...</p>
        </div>
      </div>
    );
  }

  // Erreur de chargement du formulaire
  if (formError || !form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Formulaire introuvable
          </h1>
          <p className="text-gray-600 mb-6">
            Le formulaire que vous cherchez n'existe pas ou n'est plus disponible.
          </p>
          <ErrorMessage message={formError || 'Formulaire non trouvé'} />
        </Card>
      </div>
    );
  }

  // Formulaire inactif
  if (!form.isActive) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Formulaire fermé
          </h1>
          <p className="text-gray-600 mb-6">
            Ce formulaire n'accepte plus de nouvelles réponses.
          </p>
          <Button variant="secondary" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Button>
        </Card>
      </div>
    );
  }

  // Confirmation de soumission
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Merci !
          </h1>
          <p className="text-gray-600 mb-6">
            {form.schema.settings?.successMessage || 'Votre réponse a été enregistrée avec succès.'}
          </p>
          
          {/* Informations sur l'activité liée */}
          {form.activity && (
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-blue-800">
                <strong>Activité:</strong> {form.activity.title}
              </p>
              {form.activity.project && (
                <p className="text-sm text-blue-600 mt-1">
                  <strong>Projet:</strong> {form.activity.project.title}
                </p>
              )}
            </div>
          )}

          <div className="space-y-3">
            {/* Permet de soumettre une nouvelle réponse si autorisé */}
            {form.schema.settings?.allowMultipleSubmissions && (
              <Button 
                onClick={() => {
                  setIsSubmitted(false);
                  setSubmitError(null);
                }}
              >
                Soumettre une nouvelle réponse
              </Button>
            )}
            
            <Button variant="secondary" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Formulaire principal
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {/* En-tête avec informations sur l'activité */}
      {form.activity && (
        <div className="max-w-2xl mx-auto mb-6">
          <Alert type="info">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Activité: {form.activity.title}</p>
                {form.activity.project && (
                  <p className="text-sm opacity-90">Projet: {form.activity.project.title}</p>
                )}
              </div>
            </div>
          </Alert>
        </div>
      )}

      {/* Formulaire */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <FormRenderer
          form={form}
          onSubmit={handleSubmit}
          loading={submitLoading}
          error={submitError}
        />
      </div>

      {/* Footer avec informations */}
      <div className="max-w-2xl mx-auto mt-8 text-center">
        <p className="text-sm text-gray-500">
          Créé par {form.creator.firstName} {form.creator.lastName}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Dernière modification: {new Date(form.updatedAt).toLocaleDateString('fr-FR')}
        </p>
      </div>
    </div>
  );
};

export default PublicFormPage;