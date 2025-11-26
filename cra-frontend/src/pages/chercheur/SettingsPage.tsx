// src/pages/chercheur/SettingsPage.tsx
import React, { useState } from 'react';
import {
  Lock,
  Key,
  Save,
  X,
  Shield,
  Bell,
  Globe,
  User
} from 'lucide-react';
import { authService } from '../../services/auth.service';
import { toast } from 'react-hot-toast';

const SettingsPage: React.FC = () => {
  // États pour le changement de mot de passe
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handleChangePassword = async () => {
    // Validation côté client
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Tous les champs sont requis');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Le nouveau mot de passe doit contenir au moins 8 caractères');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      setIsChangingPassword(true);
      await authService.changePassword(passwordData);

      toast.success('Mot de passe modifié avec succès');

      // Réinitialiser le formulaire
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleResetPassword = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-600 mt-1">Gérez vos préférences et votre sécurité</p>
      </div>

      <div className="space-y-6">
        {/* Section Sécurité et Mot de passe */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-green-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Sécurité et mot de passe</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Modifiez votre mot de passe pour sécuriser votre compte
            </p>
          </div>

          <div className="px-6 py-6">
            <div className="max-w-2xl">
              <div className="space-y-4">
                {/* Mot de passe actuel */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Lock className="w-4 h-4 inline mr-2" />
                    Mot de passe actuel
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                    disabled={isChangingPassword}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="Entrez votre mot de passe actuel"
                  />
                </div>

                {/* Nouveau mot de passe */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Key className="w-4 h-4 inline mr-2" />
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    disabled={isChangingPassword}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="Entrez votre nouveau mot de passe (min. 8 caractères)"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Le mot de passe doit contenir au moins 8 caractères
                  </p>
                </div>

                {/* Confirmation du nouveau mot de passe */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Key className="w-4 h-4 inline mr-2" />
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    disabled={isChangingPassword}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="Confirmez votre nouveau mot de passe"
                  />
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={handleResetPassword}
                  disabled={isChangingPassword}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4 inline mr-2" />
                  Réinitialiser
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={isChangingPassword}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isChangingPassword ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-2"></div>
                      Changement en cours...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 inline mr-2" />
                      Changer le mot de passe
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section Notifications (pour usage futur) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center">
              <Bell className="w-5 h-5 text-green-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Gérez vos préférences de notifications
            </p>
          </div>

          <div className="px-6 py-6">
            <p className="text-gray-500 text-sm">
              Les paramètres de notifications seront bientôt disponibles.
            </p>
          </div>
        </div>

        {/* Section Préférences (pour usage futur) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center">
              <Globe className="w-5 h-5 text-green-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Préférences</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Personnalisez votre expérience
            </p>
          </div>

          <div className="px-6 py-6">
            <p className="text-gray-500 text-sm">
              Les paramètres de préférences seront bientôt disponibles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
