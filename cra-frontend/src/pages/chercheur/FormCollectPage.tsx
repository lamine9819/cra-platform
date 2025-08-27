// src/pages/chercheur/FormCollectPage.tsx - Page pour que le créateur collecte des données
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Database, User, AlertTriangle, CheckCircle } from 'lucide-react';
import { useForm, useFormResponses } from '../../hooks/useForms';
import FormRenderer from '../../components/forms/FormRenderer';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const FormCollectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [submissionCount, setSubmissionCount] = useState(0);
  const [lastSubmissionTime, setLastSubmissionTime] = useState<string | null>(null);

  const { form, loading: formLoading, error: formError } = useForm(id);
  const { submitResponse, loading: submitLoading } = useFormResponses(id);

  // Soumission réelle des données
  const handleSubmit = async (data: any) => {
    try {
      const response = await submitResponse(data);
      
      if (response) {
        setSubmissionCount(prev => prev + 1);
        setLastSubmissionTime(new Date().toISOString());
        
        // Scroll vers le haut pour voir le message de confirmation
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      // L'erreur est gérée par le FormRenderer via le prop error
      console.error('Erreur lors de la collecte:', error);
    }
  };

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

  if (formError || !form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Erreur de chargement
          </h1>
          <ErrorMessage message={formError || 'Formulaire non trouvé'} />
          <div className="mt-6">
            <Link to={`/chercheur/forms/${id}`}>
              <Button variant="secondary">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au formulaire
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // Vérifier si le formulaire est actif
  if (!form.isActive) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Formulaire inactif
          </h1>
          <p className="text-gray-600 mb-6">
            Ce formulaire est actuellement désactivé. Activez-le pour commencer la collecte de données.
          </p>
          <div className="space-y-3">
            <Link to={`/chercheur/forms/${id}`}>
              <Button>
                Gérer le formulaire
              </Button>
            </Link>
            <Link to={`/chercheur/forms/${id}/edit`}>
              <Button variant="secondary">
                Modifier le formulaire
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête avec navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={`/chercheur/forms/${id}`}>
                <Button variant="secondary" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Collecte de données</h1>
                <p className="text-sm text-gray-600">{form.title}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span>Mode collecte</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Créateur</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Informations sur le mode collecte */}
        <Alert type="info" className="mb-6">
          <div>
            <h3 className="font-medium mb-2">Mode Collecte - Créateur</h3>
            <ul className="text-sm space-y-1">
              <li>• Vous collectez des données réelles qui seront sauvegardées</li>
              <li>• Ces réponses apparaîtront dans vos statistiques et exports</li>
              <li>• Idéal pour collecter des données vous-même lors d'entretiens ou d'observations</li>
              <li>• Soumissions effectuées par vous : <strong>{submissionCount}</strong></li>
              {lastSubmissionTime && (
                <li>• Dernière soumission : <strong>{new Date(lastSubmissionTime).toLocaleString('fr-FR')}</strong></li>
              )}
            </ul>
          </div>
        </Alert>

        {/* Vérification des paramètres de soumissions multiples */}
        {!form.schema.settings?.allowMultipleSubmissions && submissionCount > 0 && (
          <Alert type="warning" className="mb-6">
            <div>
              <h3 className="font-medium mb-2">Soumissions multiples non autorisées</h3>
              <p className="text-sm">
                Ce formulaire n'autorise qu'une seule soumission par utilisateur. 
                Vous avez déjà soumis une réponse. Pour permettre plusieurs soumissions, 
                modifiez les paramètres du formulaire.
              </p>
              <div className="mt-3">
                <Link to={`/chercheur/forms/${id}/edit`}>
                  <Button size="sm">
                    Modifier les paramètres
                  </Button>
                </Link>
              </div>
            </div>
          </Alert>
        )}

        {/* Formulaire de collecte */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                Collecte de données - {form.title}
              </h2>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-green-600 font-medium flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  Actif
                </span>
                {form.activity && (
                  <span className="text-gray-500">
                    Activité: {form.activity.title}
                  </span>
                )}
              </div>
            </div>
            {form.description && (
              <p className="text-gray-600 mt-2">{form.description}</p>
            )}
          </div>
          
          <div className="p-8">
            <FormRenderer
              form={{
                ...form,
                // Forcer l'autorisation des soumissions multiples pour le créateur
                schema: {
                  ...form.schema,
                  settings: {
                    ...form.schema.settings,
                    allowMultipleSubmissions: true,
                    successMessage: form.schema.settings?.successMessage || 'Données collectées avec succès !'
                  }
                }
              }}
              onSubmit={handleSubmit}
              loading={submitLoading}
            />
          </div>
        </div>

        {/* Informations utiles */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-medium text-gray-900 mb-3">Conseils pour la collecte</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>• Vérifiez les données avant de soumettre</p>
              <p>• Les réponses seront associées à votre compte</p>
              <p>• Vous pouvez collecter plusieurs réponses si autorisé</p>
              <p>• Les données apparaîtront dans l'onglet "Réponses"</p>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-medium text-gray-900 mb-3">Actions rapides</h3>
            <div className="space-y-3">
              <Link to={`/chercheur/forms/${id}`} className="block">
                <Button variant="secondary" size="sm" className="w-full justify-start">
                  Voir toutes les réponses
                </Button>
              </Link>
              <Link to={`/forms/${id}/submit`} target="_blank" className="block">
                <Button variant="secondary" size="sm" className="w-full justify-start">
                  Partager le lien public
                </Button>
              </Link>
              <Link to={`/chercheur/forms/${id}/edit`} className="block">
                <Button variant="secondary" size="sm" className="w-full justify-start">
                  Modifier le formulaire
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FormCollectPage;