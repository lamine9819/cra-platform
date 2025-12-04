// src/pages/chercheur/FormDetailPage.tsx - Page de détails du formulaire

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from '../../hooks/useForm';
import FormResponseCollector from '../../components/forms/FormResponseCollector';
import FormResponsesView from '../../components/forms/FormResponsesView';
import FormShareManager from '../../components/forms/FormShareManager';
import {
  ArrowLeft,
  Edit,
  Copy,
  Trash2,
  Share2,
  FileText,
  BarChart3,
  MessageSquare,
  MoreVertical,
  Loader,
  AlertCircle,
  Power,
  PowerOff,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

type TabType = 'collect' | 'responses' | 'shares' | 'comments' | 'stats';

export const FormDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const {
    form,
    loading,
    error,
    shares,
    comments,
    refreshForm,
    updateForm,
    deleteForm,
    duplicateForm,
    loadShares,
    loadComments,
    addComment,
  } = useForm(id || null);

  const [activeTab, setActiveTab] = useState<TabType>('collect');
  const [showMenu, setShowMenu] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Détecter le paramètre tab dans l'URL et activer l'onglet correspondant
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['collect', 'responses', 'shares', 'comments', 'stats'].includes(tabParam)) {
      setActiveTab(tabParam as TabType);
    }
  }, [searchParams]);

  // Charger les données quand l'onglet change
  useEffect(() => {
    if (activeTab === 'shares') {
      loadShares();
    } else if (activeTab === 'comments') {
      loadComments();
    }
  }, [activeTab, loadShares, loadComments]);

  // Basculer le statut actif/inactif
  const handleToggleActive = async () => {
    if (!form) return;

    try {
      await updateForm({ isActive: !form.isActive });
      toast.success(
        form.isActive
          ? 'Formulaire désactivé'
          : 'Formulaire activé'
      );
    } catch (err) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  // Dupliquer le formulaire
  const handleDuplicate = async () => {
    try {
      const duplicated = await duplicateForm();
      toast.success('Formulaire dupliqué!');
      navigate(`/chercheur/forms/${duplicated.id}`);
    } catch (err) {
      toast.error('Erreur lors de la duplication');
    }
  };

  // Supprimer le formulaire
  const handleDelete = async () => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer "${form?.title}" ?`)) {
      return;
    }

    try {
      await deleteForm();
      toast.success('Formulaire supprimé');
      navigate('/chercheur/forms');
    } catch (err) {
      toast.error('Erreur lors de la suppression');
    }
  };

  // Soumettre un commentaire
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      await addComment(newComment);
      setNewComment('');
      await loadComments();
    } catch (err) {
      toast.error('Erreur lors de l\'ajout du commentaire');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
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
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/chercheur/forms')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour à la liste
            </button>

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <MoreVertical className="w-6 h-6 text-gray-600" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <button
                    onClick={() => {
                      navigate(`/chercheur/forms/${id}/edit`);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center px-4 py-3 hover:bg-gray-50 text-gray-700"
                  >
                    <Edit className="w-4 h-4 mr-3" />
                    Modifier
                  </button>
                  <button
                    onClick={() => {
                      handleToggleActive();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center px-4 py-3 hover:bg-gray-50 text-gray-700"
                  >
                    {form.isActive ? (
                      <>
                        <PowerOff className="w-4 h-4 mr-3" />
                        Désactiver
                      </>
                    ) : (
                      <>
                        <Power className="w-4 h-4 mr-3" />
                        Activer
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      handleDuplicate();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center px-4 py-3 hover:bg-gray-50 text-gray-700"
                  >
                    <Copy className="w-4 h-4 mr-3" />
                    Dupliquer
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('shares');
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center px-4 py-3 hover:bg-gray-50 text-gray-700"
                  >
                    <Share2 className="w-4 h-4 mr-3" />
                    Partager
                  </button>
                  <button
                    onClick={() => {
                      handleDelete();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center px-4 py-3 hover:bg-gray-50 text-red-600 border-t border-gray-200"
                  >
                    <Trash2 className="w-4 h-4 mr-3" />
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {form.title}
                </h1>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    form.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {form.isActive ? 'Actif' : 'Inactif'}
                </span>
              </div>

              {form.description && (
                <p className="text-gray-600 mb-4">{form.description}</p>
              )}

              {form.activity && (
                <div className="inline-flex items-center px-3 py-1 bg-blue-50 rounded-lg text-sm text-blue-700">
                  Lié à l'activité : <strong className="ml-1">{form.activity.title}</strong>
                </div>
              )}
            </div>

            {/* Statistiques */}
            <div className="flex space-x-6 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {form._count?.responses || 0}
                </div>
                <div className="text-sm text-gray-600">Réponses</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {form._count?.shares || 0}
                </div>
                <div className="text-sm text-gray-600">Partages</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {form._count?.comments || 0}
                </div>
                <div className="text-sm text-gray-600">Commentaires</div>
              </div>
            </div>
          </div>

          {/* Onglets */}
          <div className="mt-6 flex space-x-1 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('collect')}
              className={`px-4 py-2 font-medium text-sm border-b-2 ${
                activeTab === 'collect'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Collecter
            </button>
            <button
              onClick={() => setActiveTab('responses')}
              className={`px-4 py-2 font-medium text-sm border-b-2 ${
                activeTab === 'responses'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Réponses ({form._count?.responses || 0})
            </button>
            <button
              onClick={() => {
                setActiveTab('shares');
                loadShares();
              }}
              className={`px-4 py-2 font-medium text-sm border-b-2 ${
                activeTab === 'shares'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Share2 className="w-4 h-4 inline mr-2" />
              Partages ({form._count?.shares || 0})
            </button>
            <button
              onClick={() => {
                setActiveTab('comments');
                loadComments();
              }}
              className={`px-4 py-2 font-medium text-sm border-b-2 ${
                activeTab === 'comments'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Commentaires ({form._count?.comments || 0})
            </button>
          </div>
        </div>
      </div>

      {/* Contenu des onglets */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'collect' && (
          <FormResponseCollector
            form={form}
            onSubmitSuccess={() => {
              toast.success('Réponse enregistrée!');
              refreshForm();
            }}
          />
        )}

        {activeTab === 'responses' && <FormResponsesView form={form} />}

        {activeTab === 'shares' && (
          <FormShareManager
            form={form}
            shares={shares}
            onShareUpdated={() => {
              loadShares();
              refreshForm();
            }}
          />
        )}

        {activeTab === 'comments' && (
          <div className="space-y-6">
            {/* Formulaire d'ajout de commentaire */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Ajouter un commentaire
              </h3>
              <form onSubmit={handleSubmitComment}>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Écrivez votre commentaire..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <div className="mt-3 flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingComment || !newComment.trim()}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {submittingComment ? 'Envoi...' : 'Commenter'}
                  </button>
                </div>
              </form>
            </div>

            {/* Liste des commentaires */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Commentaires ({comments.length})
                </h3>
              </div>

              {comments.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Aucun commentaire pour le moment</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {comments.map((comment) => (
                    <div key={comment.id} className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-medium">
                            {comment.author.firstName[0]}
                            {comment.author.lastName[0]}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div>
                              <span className="font-medium text-gray-900">
                                {comment.author.firstName}{' '}
                                {comment.author.lastName}
                              </span>
                              <span className="text-sm text-gray-500 ml-2">
                                {new Date(comment.createdAt).toLocaleDateString(
                                  'fr-FR'
                                )}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-700">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormDetailPage;
