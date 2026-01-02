// src/components/forms/FormShareManager.tsx - Gestionnaire de partages

import React, { useState, useEffect } from 'react';
import {
  Form,
  FormShare,
  ShareFormRequest,
  PublicShareInfo,
} from '../../types/form.types';
import {
  Share2,
  Link as LinkIcon,
  Copy,
  Trash2,
  Plus,
  Users,
  Globe,
  Calendar,
  CheckCircle,
  X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import formApi from '../../services/formApi';
import usersApi, { User } from '../../services/usersApi';

interface FormShareManagerProps {
  form: Form;
  shares: FormShare[];
  onShareUpdated: () => void;
}

export const FormShareManager: React.FC<FormShareManagerProps> = ({
  form,
  shares,
  onShareUpdated,
}) => {
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showPublicLinkDialog, setShowPublicLinkDialog] = useState(false);
  const [publicLink, setPublicLink] = useState<PublicShareInfo | null>(null);

  // Copier le lien dans le presse-papier
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Lien copié dans le presse-papier!');
  };

  // Dialogue de partage avec utilisateur
  const ShareWithUserDialog: React.FC<{ onClose: () => void }> = ({
    onClose,
  }) => {
    const [targetUserId, setTargetUserId] = useState('');
    const [canCollect, setCanCollect] = useState(true);
    const [canExport, setCanExport] = useState(false);
    const [maxSubmissions, setMaxSubmissions] = useState<number | undefined>();
    const [expiresAt, setExpiresAt] = useState('');
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);

    // Charger la liste des utilisateurs
    useEffect(() => {
      const loadUsers = async () => {
        try {
          setLoadingUsers(true);
          const response = await usersApi.listUsers({});
          // Filtrer les utilisateurs actifs côté client
          const activeUsers = response.users.filter(user => user.isActive);
          setUsers(activeUsers);
        } catch (error) {
          console.error('Erreur lors du chargement des utilisateurs:', error);
          toast.error('Impossible de charger la liste des utilisateurs');
        } finally {
          setLoadingUsers(false);
        }
      };

      loadUsers();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!targetUserId.trim()) {
        toast.error('Veuillez sélectionner un utilisateur');
        return;
      }

      setLoading(true);
      try {
        const shareData: ShareFormRequest = {
          targetUserId,
          canCollect,
          canExport,
          maxSubmissions,
          expiresAt: expiresAt || undefined,
          shareType: 'INTERNAL',
        };

        await formApi.shareFormWithUser(form.id, shareData);
        toast.success('Formulaire partagé avec succès!');
        onShareUpdated();
        onClose();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur lors du partage';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Partager avec un utilisateur
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Utilisateur
                </label>
                {loadingUsers ? (
                  <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                    Chargement des utilisateurs...
                  </div>
                ) : (
                  <select
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="">Sélectionnez un utilisateur</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} ({user.email}) - {user.role}
                      </option>
                    ))}
                  </select>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Sélectionnez l'utilisateur avec qui partager le formulaire
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900">
                  Permissions
                </h4>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="canCollect"
                    checked={canCollect}
                    onChange={(e) => setCanCollect(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="canCollect" className="text-sm text-gray-700">
                    Peut collecter des réponses
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="canExport"
                    checked={canExport}
                    onChange={(e) => setCanExport(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="canExport" className="text-sm text-gray-700">
                    Peut exporter les données
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Limite de soumissions (optionnel)
                </label>
                <input
                  type="number"
                  min="1"
                  value={maxSubmissions || ''}
                  onChange={(e) =>
                    setMaxSubmissions(
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  placeholder="Illimité"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date d'expiration (optionnel)
                </label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Partage...' : 'Partager'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // Dialogue de lien public
  const PublicLinkDialog: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [maxSubmissions, setMaxSubmissions] = useState<number | undefined>();
    const [expiresAt, setExpiresAt] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreate = async (e: React.FormEvent) => {
      e.preventDefault();

      setLoading(true);
      try {
        const linkInfo = await formApi.createPublicShareLink(form.id, {
          maxSubmissions,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        });

        setPublicLink(linkInfo);
        toast.success('Lien public créé avec succès!');
        onShareUpdated();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur lors de la création du lien';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Créer un lien public
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {publicLink ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-green-900 font-medium">
                      Lien créé avec succès!
                    </span>
                  </div>
                  <p className="text-sm text-green-700">
                    Partagez ce lien avec les personnes externes à la plateforme
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lien de partage
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={publicLink.shareUrl}
                      readOnly
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                    <button
                      onClick={() => copyToClipboard(publicLink.shareUrl)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {publicLink.maxSubmissions && (
                  <div className="text-sm text-gray-600">
                    Limite: {publicLink.maxSubmissions} soumission(s)
                  </div>
                )}

                {publicLink.expiresAt && (
                  <div className="text-sm text-gray-600">
                    Expire le:{' '}
                    {new Date(publicLink.expiresAt).toLocaleString('fr-FR')}
                  </div>
                )}

                <button
                  onClick={onClose}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Limite de soumissions (optionnel)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={maxSubmissions || ''}
                    onChange={(e) =>
                      setMaxSubmissions(
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                    placeholder="Illimité"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date d'expiration (optionnel)
                  </label>
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-900">
                    <strong>Note:</strong> Les personnes avec ce lien pourront
                    soumettre des réponses sans se connecter.
                  </p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? 'Création...' : 'Créer le lien'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex space-x-4">
        <button
          onClick={() => setShowShareDialog(true)}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Users className="w-5 h-5 mr-2" />
          Partager avec un utilisateur
        </button>

        <button
          onClick={() => setShowPublicLinkDialog(true)}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Globe className="w-5 h-5 mr-2" />
          Créer un lien public
        </button>
      </div>

      {/* Liste des partages */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Partages actifs ({shares.length})
          </h3>
        </div>

        {shares.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Share2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Aucun partage pour le moment</p>
            <p className="text-sm mt-1">
              Partagez ce formulaire pour collaborer
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {shares.map((share) => (
              <div key={share.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      {share.shareType === 'INTERNAL' ? (
                        <Users className="w-5 h-5 text-green-600 mr-2" />
                      ) : (
                        <Globe className="w-5 h-5 text-green-600 mr-2" />
                      )}
                      <span className="font-medium text-gray-900">
                        {share.shareType === 'INTERNAL'
                          ? share.sharedWith
                            ? `${share.sharedWith.firstName} ${share.sharedWith.lastName}`
                            : 'Utilisateur interne'
                          : 'Lien public'}
                      </span>
                      {share.shareType === 'INTERNAL' &&
                        share.sharedWith?.email && (
                          <span className="ml-2 text-sm text-gray-500">
                            ({share.sharedWith.email})
                          </span>
                        )}
                    </div>

                    {/* Permissions */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      {share.canCollect && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Peut collecter
                        </span>
                      )}
                      {share.canExport && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Peut exporter
                        </span>
                      )}
                    </div>

                    {/* Informations supplémentaires */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      {share.maxSubmissions && (
                        <div className="flex items-center">
                          <span>Max: {share.maxSubmissions} soumissions</span>
                        </div>
                      )}
                      {share.expiresAt && (
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Expire le:{' '}
                          {new Date(share.expiresAt).toLocaleDateString('fr-FR')}
                        </div>
                      )}
                      <div className="flex items-center text-gray-500">
                        Créé le:{' '}
                        {new Date(share.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                    </div>

                    {/* Lien pour partage externe */}
                    {share.shareType === 'EXTERNAL' && share.shareToken && (
                      <div className="mt-3 flex items-center space-x-2">
                        <input
                          type="text"
                          value={`${window.location.origin}/forms/public/${share.shareToken}`}
                          readOnly
                          className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded bg-gray-50"
                        />
                        <button
                          onClick={() =>
                            copyToClipboard(
                              `${window.location.origin}/forms/public/${share.shareToken}`
                            )
                          }
                          className="p-2 text-green-600 hover:bg-green-50 rounded"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          'Êtes-vous sûr de vouloir supprimer ce partage?'
                        )
                      ) {
                        // Appeler l'API
                        toast.success('Partage supprimé');
                        onShareUpdated();
                      }
                    }}
                    className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialogues */}
      {showShareDialog && (
        <ShareWithUserDialog onClose={() => setShowShareDialog(false)} />
      )}
      {showPublicLinkDialog && (
        <PublicLinkDialog onClose={() => setShowPublicLinkDialog(false)} />
      )}
    </div>
  );
};

export default FormShareManager;
