// src/pages/chercheur/KnowledgeTransferDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Calendar,
  MapPin,
  Users,
  TrendingUp,
  MessageSquare,
  Share2,
  Activity as ActivityIcon,
  User
} from 'lucide-react';
import { knowledgeTransferApi, KnowledgeTransfer } from '../../services/knowledgeTransferApi';
import toast from 'react-hot-toast';

const KnowledgeTransferDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [transfer, setTransfer] = useState<KnowledgeTransfer | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (id) {
      loadTransfer();
    }
  }, [id]);

  const loadTransfer = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await knowledgeTransferApi.getKnowledgeTransferById(id);
      setTransfer(data);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement du transfert');
      navigate('/chercheur/knowledge-transfers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      await knowledgeTransferApi.deleteKnowledgeTransfer(id);
      toast.success('Transfert supprimé avec succès');
      navigate('/chercheur/knowledge-transfers');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      FICHE_TECHNIQUE: 'bg-blue-100 text-blue-800',
      DEMONSTRATION: 'bg-green-100 text-green-800',
      FORMATION_PRODUCTEUR: 'bg-purple-100 text-purple-800',
      VISITE_GUIDEE: 'bg-yellow-100 text-yellow-800',
      EMISSION_RADIO: 'bg-pink-100 text-pink-800',
      REPORTAGE_TV: 'bg-red-100 text-red-800',
      PUBLICATION_VULGARISATION: 'bg-indigo-100 text-indigo-800',
      SITE_WEB: 'bg-cyan-100 text-cyan-800',
      RESEAUX_SOCIAUX: 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!transfer) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Transfert non trouvé</h3>
        <Link
          to="/chercheur/knowledge-transfers"
          className="text-green-600 hover:text-green-700"
        >
          Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* En-tête avec actions */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <Link
            to="/chercheur/knowledge-transfers"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Share2 className="w-8 h-8 text-green-600" />
              <h1 className="text-2xl font-bold text-gray-900">{transfer.title}</h1>
            </div>
            <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getTypeColor(transfer.type)}`}>
              {knowledgeTransferApi.getTransferTypeLabel(transfer.type)}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            to={`/chercheur/knowledge-transfers/${id}/edit`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Modifier
          </Link>
          {deleteConfirm ? (
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Confirmer
              </button>
              <button
                onClick={() => setDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Annuler
              </button>
            </div>
          ) : (
            <button
              onClick={() => setDeleteConfirm(true)}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </button>
          )}
        </div>
      </div>

      {/* Informations principales */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations générales</h2>

          {transfer.description && (
            <div className="mb-6">
              <p className="text-gray-700 whitespace-pre-wrap">{transfer.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium text-gray-900">{formatDate(transfer.date)}</p>
              </div>
            </div>

            {transfer.location && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Lieu</p>
                  <p className="font-medium text-gray-900">{transfer.location}</p>
                </div>
              </div>
            )}

            {transfer.participants && (
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Participants</p>
                  <p className="font-medium text-gray-900">
                    {transfer.participants} personne{transfer.participants > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            )}

            {transfer.organizer && (
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Organisateur</p>
                  <p className="font-medium text-gray-900">
                    {transfer.organizer.firstName} {transfer.organizer.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{transfer.organizer.email}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Public cible */}
        {transfer.targetAudience && transfer.targetAudience.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Public cible</h3>
            <div className="flex flex-wrap gap-2">
              {transfer.targetAudience.map((audience, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                >
                  {audience}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Activité liée */}
        {transfer.activity && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-start gap-3">
              <ActivityIcon className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Activité liée</p>
                <Link
                  to={`/chercheur/activities/${transfer.activity.id}`}
                  className="font-medium text-green-600 hover:text-green-700"
                >
                  {transfer.activity.title}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Impact et Retours */}
      {(transfer.impact || transfer.feedback) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Impact et Retours</h2>

          {transfer.impact && (
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Impact</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{transfer.impact}</p>
              </div>
            </div>
          )}

          {transfer.feedback && (
            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Retours / Feedback</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{transfer.feedback}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Métadonnées */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Créé le :</span>
            <span className="ml-2 text-gray-900">{formatDate(transfer.createdAt)}</span>
          </div>
          <div>
            <span className="text-gray-500">Dernière modification :</span>
            <span className="ml-2 text-gray-900">{formatDate(transfer.updatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeTransferDetail;
