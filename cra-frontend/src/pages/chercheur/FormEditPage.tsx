// src/pages/chercheur/FormEditPage.tsx - Page d'édition de formulaire

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FormBuilder from '../../components/forms/FormBuilder';
import { FormSchema, UpdateFormRequest } from '../../types/form.types';
import { useForm } from '../../hooks/useForm';
import formApi from '../../services/formApi';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Loader, AlertCircle } from 'lucide-react';

export const FormEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { form, loading: formLoading, error } = useForm(id || null);
  const [saving, setSaving] = useState(false);

  const handleSave = async (schema: FormSchema) => {
    if (!id) return;

    setSaving(true);

    try {
      const updateData: UpdateFormRequest = {
        title: schema.title,
        description: schema.description,
        schema,
      };

      await formApi.updateForm(id, updateData);

      toast.success('Formulaire mis à jour avec succès!');
      navigate(`/chercheur/forms/${id}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (
      window.confirm(
        'Êtes-vous sûr de vouloir annuler? Les modifications seront perdues.'
      )
    ) {
      navigate(`/chercheur/forms/${id}`);
    }
  };

  if (formLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement du formulaire...</p>
        </div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Erreur de chargement
          </h2>
          <p className="text-gray-600 mb-6">{error || 'Formulaire non trouvé'}</p>
          <button
            onClick={() => navigate('/chercheur/forms')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retour à la liste
          </button>
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
            onClick={() => navigate(`/chercheur/forms/${id}`)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour au formulaire
          </button>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Modifier le formulaire
            </h1>
            <p className="text-gray-600 mt-2">{form.title}</p>

            {form._count && form._count.responses > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg inline-block">
                <div className="flex items-center text-sm text-yellow-800">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Ce formulaire a déjà {form._count.responses} réponse(s). Les
                  modifications peuvent affecter l'analyse des données existantes.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Formulaire d'édition */}
        {saving ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Loader className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-gray-600">Enregistrement des modifications...</p>
          </div>
        ) : (
          <FormBuilder
            initialSchema={form.schema}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

export default FormEditPage;
