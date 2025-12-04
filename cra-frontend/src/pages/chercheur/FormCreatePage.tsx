// src/pages/chercheur/FormCreatePage.tsx - Page de création de formulaire

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import FormBuilder from '../../components/forms/FormBuilder';
import { FormSchema, CreateFormRequest } from '../../types/form.types';
import formApi from '../../services/formApi';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Loader } from 'lucide-react';

export const FormCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activityId = searchParams.get('activityId');

  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activityLoading, setActivityLoading] = useState(false);

  // Charger l'activité si un ID est fourni
  useEffect(() => {
    const loadActivity = async () => {
      if (!activityId) return;

      setActivityLoading(true);
      try {
        // Supposons que vous avez une API pour charger l'activité
        // const activityData = await activityApi.getById(activityId);
        // setActivity(activityData);

        // Pour l'instant, simulons
        setActivity({
          id: activityId,
          title: 'Activité exemple',
        });
      } catch (err) {
        toast.error('Erreur lors du chargement de l\'activité');
      } finally {
        setActivityLoading(false);
      }
    };

    loadActivity();
  }, [activityId]);

  const handleSave = async (schema: FormSchema) => {
    setLoading(true);

    try {
      const formData: CreateFormRequest = {
        title: schema.title,
        description: schema.description,
        schema,
        activityId: activityId || undefined,
        isActive: true,
        enablePublicAccess: false,
      };

      const createdForm = await formApi.createForm(formData);

      toast.success('Formulaire créé avec succès!');
      navigate(`/chercheur/forms/${createdForm.id}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erreur lors de la création';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler? Les modifications seront perdues.')) {
      navigate('/chercheur/forms');
    }
  };

  if (activityLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/chercheur/forms')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour à la liste
          </button>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Créer un nouveau formulaire
            </h1>
            <p className="text-gray-600 mt-2">
              Configurez votre formulaire de collecte de données
            </p>

            {activity && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg inline-block">
                <div className="text-sm text-blue-700">
                  Formulaire lié à l'activité : <strong>{activity.title}</strong>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Formulaire de construction */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Loader className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-gray-600">Création du formulaire en cours...</p>
          </div>
        ) : (
          <FormBuilder onSave={handleSave} onCancel={handleCancel} />
        )}
      </div>
    </div>
  );
};

export default FormCreatePage;
