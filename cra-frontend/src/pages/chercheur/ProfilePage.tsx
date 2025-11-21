// src/pages/chercheur/ProfilePage.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  GraduationCap,
  Upload,
  Trash2,
  Save,
  X,
  Camera
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { usersApi } from '../../services/usersApi';
import { toast } from 'react-hot-toast';

const ProfilePage: React.FC = () => {
  const { user: authUser, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: authUser?.firstName || '',
    lastName: authUser?.lastName || '',
    email: authUser?.email || '',
    phoneNumber: authUser?.phoneNumber || '',
    department: authUser?.department || '',
    specialization: authUser?.specialization || '',
    diploma: authUser?.diploma || '',
    discipline: (authUser as any)?.discipline || '',
  });
  const [profileImage, setProfileImage] = useState<string | undefined>(authUser?.profileImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const profile = await usersApi.getMyProfile();
      setProfileData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phoneNumber: profile.phoneNumber || '',
        department: profile.department || '',
        specialization: profile.specialization || '',
        diploma: (profile as any).diploma || '',
        discipline: (profile as any).discipline || '',
      });
      setProfileImage(profile.profileImage);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement du profil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      const updatedUser = await usersApi.updateMyProfile(profileData);

      // Mettre à jour le contexte d'authentification
      if (updateUser) {
        updateUser(updatedUser);
      }

      toast.success('Profil mis à jour avec succès');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La taille de l\'image ne doit pas dépasser 5 MB');
      return;
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image valide');
      return;
    }

    try {
      setImageLoading(true);
      const result = await usersApi.uploadProfileImage(file);

      console.log('Upload response:', result);
      console.log('Profile image URL:', result.profileImage);

      setProfileImage(result.profileImage);

      // Mettre à jour le contexte d'authentification avec le profil complet
      if (updateUser && authUser) {
        const updatedUser = { ...authUser, profileImage: result.profileImage };
        console.log('Updating user context with:', updatedUser);
        updateUser(updatedUser);
      }

      toast.success('Photo de profil mise à jour avec succès');

      // Forcer un rechargement du profil pour synchroniser
      setTimeout(() => {
        loadProfile();
      }, 500);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Erreur lors de l\'upload de la photo');
    } finally {
      setImageLoading(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer votre photo de profil ?')) {
      return;
    }

    try {
      setImageLoading(true);
      await usersApi.deleteProfileImage();
      setProfileImage(undefined);

      // Mettre à jour le contexte d'authentification
      if (updateUser && authUser) {
        updateUser({ ...authUser, profileImage: undefined });
      }

      toast.success('Photo de profil supprimée avec succès');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression de la photo');
    } finally {
      setImageLoading(false);
    }
  };

  const getProfileImageUrl = () => {
    if (!profileImage) return null;
    if (profileImage.startsWith('http')) return profileImage;
    const fullUrl = `${API_BASE_URL}${profileImage}`;
    console.log('Profile image URL:', fullUrl);
    return fullUrl;
  };

  const getInitials = () => {
    return `${profileData.firstName?.[0] || ''}${profileData.lastName?.[0] || ''}`.toUpperCase();
  };

  if (isLoading && !profileData.firstName) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Mon Profil</h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-white text-green-700 rounded-lg hover:bg-green-50 transition-colors"
              >
                Modifier
              </button>
            )}
          </div>
        </div>

        {/* Profile Image Section */}
        <div className="px-6 py-6 border-b border-gray-200">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-green-600 flex items-center justify-center">
                {profileImage ? (
                  <img
                    src={getProfileImageUrl()!}
                    alt="Photo de profil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-4xl font-bold">{getInitials()}</span>
                )}
              </div>

              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={imageLoading}
                className="absolute bottom-0 right-0 p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors shadow-lg"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">
                {profileData.firstName} {profileData.lastName}
              </h2>
              <p className="text-gray-600">{profileData.email}</p>

              <div className="mt-4 flex space-x-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={imageLoading}
                  className="flex items-center px-4 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Changer la photo
                </button>

                {profileImage && (
                  <button
                    onClick={handleDeleteImage}
                    disabled={imageLoading}
                    className="flex items-center px-4 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </button>
                )}
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* Profile Information */}
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Prénom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <UserIcon className="w-4 h-4 inline mr-2" />
                Prénom
              </label>
              <input
                type="text"
                value={profileData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <UserIcon className="w-4 h-4 inline mr-2" />
                Nom
              </label>
              <input
                type="text"
                value={profileData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </label>
              <input
                type="email"
                value={profileData.email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Téléphone
              </label>
              <input
                type="tel"
                value={profileData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            {/* Département */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Briefcase className="w-4 h-4 inline mr-2" />
                Département
              </label>
              <input
                type="text"
                value={profileData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            {/* Spécialisation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <GraduationCap className="w-4 h-4 inline mr-2" />
                Spécialisation
              </label>
              <input
                type="text"
                value={profileData.specialization}
                onChange={(e) => handleInputChange('specialization', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            {/* Diplôme */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <GraduationCap className="w-4 h-4 inline mr-2" />
                Diplôme
              </label>
              <input
                type="text"
                value={profileData.diploma}
                onChange={(e) => handleInputChange('diploma', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            {/* Discipline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Briefcase className="w-4 h-4 inline mr-2" />
                Discipline scientifique
              </label>
              <input
                type="text"
                value={profileData.discipline}
                onChange={(e) => handleInputChange('discipline', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        {isEditing && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={() => {
                setIsEditing(false);
                loadProfile(); // Recharger les données originales
              }}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4 inline mr-2" />
              Annuler
            </button>
            <button
              onClick={handleSaveProfile}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-2"></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 inline mr-2" />
                  Enregistrer
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
