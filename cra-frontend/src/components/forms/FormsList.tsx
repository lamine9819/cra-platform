// src/components/forms/FormsList.tsx - Liste des formulaires

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForms } from '../../hooks/useForms';
import {
  Search,
  Plus,
  FileText,
  Users,
  MessageSquare,
  Calendar,
  MoreVertical,
  Eye,
  Edit,
  Copy,
  Trash2,
  Share2,
  Download,
} from 'lucide-react';
import { Form } from '../../types/form.types';
import { toast } from 'react-hot-toast';
import formApi from '../../services/formApi';

interface FormsListProps {
  onCreateForm?: () => void;
  onEditForm?: (form: Form) => void;
}

export const FormsList: React.FC<FormsListProps> = ({
  onCreateForm,
  onEditForm,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const { forms, loading, error, refreshForms, loadMore, hasMore } = useForms({
    search: searchTerm,
  });

  const handleDuplicate = async (form: Form) => {
    try {
      await formApi.duplicateForm(form.id);
      toast.success('Formulaire dupliqué avec succès');
      refreshForms();
    } catch (err) {
      toast.error('Erreur lors de la duplication');
    }
    setActiveMenu(null);
  };

  const handleDelete = async (form: Form) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer "${form.title}" ?`)) {
      return;
    }

    try {
      await formApi.deleteForm(form.id);
      toast.success('Formulaire supprimé avec succès');
      refreshForms();
    } catch (err) {
      toast.error('Erreur lors de la suppression');
    }
    setActiveMenu(null);
  };

  const handleExport = async (form: Form) => {
    try {
      await formApi.downloadExport(form.id, { format: 'xlsx', includePhotos: true });
      toast.success('Export téléchargé avec succès');
    } catch (err) {
      toast.error('Erreur lors de l\'export');
    }
    setActiveMenu(null);
  };

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4">Erreur : {error}</div>
        <button
          onClick={refreshForms}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes Formulaires</h1>
            <p className="text-gray-600 mt-2">
              Créez et gérez vos formulaires de collecte de données
            </p>
          </div>

          <button
            onClick={onCreateForm}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouveau formulaire
          </button>
        </div>

        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un formulaire..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Liste des formulaires */}
      {loading && forms.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : forms.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun formulaire
          </h3>
          <p className="text-gray-600 mb-6">
            Commencez par créer votre premier formulaire de collecte de données
          </p>
          <button
            onClick={onCreateForm}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Créer un formulaire
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => (
            <div
              key={form.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200"
            >
              <div className="p-6">
                {/* Header du formulaire */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <Link
                      to={`/chercheur/forms/${form.id}`}
                      className="text-lg font-semibold text-gray-900 hover:text-indigo-600"
                    >
                      {form.title}
                    </Link>
                    {form.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {form.description}
                      </p>
                    )}
                  </div>

                  <div className="relative">
                    <button
                      onClick={() =>
                        setActiveMenu(activeMenu === form.id ? null : form.id)
                      }
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <MoreVertical className="w-5 h-5 text-gray-500" />
                    </button>

                    {activeMenu === form.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                        <Link
                          to={`/chercheur/forms/${form.id}`}
                          className="flex items-center px-4 py-2 hover:bg-gray-50 text-gray-700"
                        >
                          <Eye className="w-4 h-4 mr-3" />
                          Voir
                        </Link>
                        <button
                          onClick={() => onEditForm?.(form)}
                          className="w-full flex items-center px-4 py-2 hover:bg-gray-50 text-gray-700"
                        >
                          <Edit className="w-4 h-4 mr-3" />
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDuplicate(form)}
                          className="w-full flex items-center px-4 py-2 hover:bg-gray-50 text-gray-700"
                        >
                          <Copy className="w-4 h-4 mr-3" />
                          Dupliquer
                        </button>
                        <button
                          onClick={() => handleExport(form)}
                          className="w-full flex items-center px-4 py-2 hover:bg-gray-50 text-gray-700"
                        >
                          <Download className="w-4 h-4 mr-3" />
                          Exporter
                        </button>
                        <Link
                          to={`/chercheur/forms/${form.id}?tab=shares`}
                          className="flex items-center px-4 py-2 hover:bg-gray-50 text-gray-700"
                        >
                          <Share2 className="w-4 h-4 mr-3" />
                          Partager
                        </Link>
                        <button
                          onClick={() => handleDelete(form)}
                          className="w-full flex items-center px-4 py-2 hover:bg-gray-50 text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-3" />
                          Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Statistiques */}
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-1" />
                    {form._count?.responses || 0} réponses
                  </div>
                  {form._count && form._count.shares > 0 && (
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {form._count.shares} partages
                    </div>
                  )}
                  {form._count && form._count.comments > 0 && (
                    <div className="flex items-center">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      {form._count.comments}
                    </div>
                  )}
                </div>

                {/* Activité liée */}
                {form.activity && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <div className="text-xs text-blue-600 font-medium mb-1">
                      Activité liée
                    </div>
                    <div className="text-sm text-blue-900">{form.activity.title}</div>
                    <div className="text-xs text-blue-700 mt-1">
                      {form.activity.project.title}
                    </div>
                  </div>
                )}

                {/* Statut et date */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      form.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {form.isActive ? 'Actif' : 'Inactif'}
                  </span>

                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(form.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bouton Charger plus */}
      {hasMore && !loading && (
        <div className="mt-8 text-center">
          <button
            onClick={loadMore}
            className="px-6 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
          >
            Charger plus
          </button>
        </div>
      )}

      {loading && forms.length > 0 && (
        <div className="mt-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      )}
    </div>
  );
};

export default FormsList;
