// src/pages/chercheur/CompleteProfilePage.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  User as UserIcon,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Upload,
  Trash2,
  Save,
  X,
  Camera,
  Download,
  Clock,
  FileText
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { usersApi } from '../../services/usersApi';
import { toast } from 'react-hot-toast';

type TabType = 'personal' | 'individual' | 'timeAllocation';

const CompleteProfilePage: React.FC = () => {
  const { user: authUser, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingIndividual, setIsEditingIndividual] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  // Données du profil personnel
  const [profileData, setProfileData] = useState({
    firstName: authUser?.firstName || '',
    lastName: authUser?.lastName || '',
    email: authUser?.email || '',
    phoneNumber: authUser?.phoneNumber || '',
    department: authUser?.department || '',
    specialization: authUser?.specialization || '',
    diploma: authUser?.diploma || '',
    discipline: authUser?.discipline || '',
  });

  // Données du profil individuel
  const [individualProfile, setIndividualProfile] = useState<any>(null);
  const [individualProfileData, setIndividualProfileData] = useState<any>({
    matricule: '',
    grade: '',
    classe: '',
    dateNaissance: '',
    dateRecrutement: '',
    localite: '',
    diplome: '',
    tempsRecherche: 0,
    tempsEnseignement: 0,
    tempsFormation: 0,
    tempsConsultation: 0,
    tempsGestionScientifique: 0,
    tempsAdministration: 0,
  });
  const [timeAllocation, setTimeAllocation] = useState<any>(null);

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
        diploma: profile.diploma || '',
        discipline: profile.discipline || '',
      });

      setProfileImage(profile.profileImage);
      setIndividualProfile(profile.individualProfile || null);

      // Charger les données du profil individuel dans le formulaire
      if (profile.individualProfile) {
        setIndividualProfileData({
          matricule: profile.individualProfile.matricule || '',
          grade: profile.individualProfile.grade || '',
          classe: profile.individualProfile.classe || '',
          dateNaissance: profile.individualProfile.dateNaissance ? profile.individualProfile.dateNaissance.split('T')[0] : '',
          dateRecrutement: profile.individualProfile.dateRecrutement ? profile.individualProfile.dateRecrutement.split('T')[0] : '',
          localite: profile.individualProfile.localite || '',
          diplome: profile.individualProfile.diplome || '',
          tempsRecherche: profile.individualProfile.tempsRecherche || 0,
          tempsEnseignement: profile.individualProfile.tempsEnseignement || 0,
          tempsFormation: profile.individualProfile.tempsFormation || 0,
          tempsConsultation: profile.individualProfile.tempsConsultation || 0,
          tempsGestionScientifique: profile.individualProfile.tempsGestionScientifique || 0,
          tempsAdministration: profile.individualProfile.tempsAdministration || 0,
        });
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement du profil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      const updatedUser = await usersApi.updateMyProfile(profileData);

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

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La taille de l\'image ne doit pas dépasser 5 MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image valide');
      return;
    }

    try {
      setImageLoading(true);
      const result = await usersApi.uploadProfileImage(file);
      setProfileImage(result.profileImage);

      if (updateUser && authUser) {
        updateUser({ ...authUser, profileImage: result.profileImage });
      }

      toast.success('Photo de profil mise à jour avec succès');
      setTimeout(() => loadProfile(), 500);
    } catch (error: any) {
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

  const handleSaveIndividualProfile = async () => {
    try {
      setIsLoading(true);

      // Validation simple : la somme des temps doit être <= 100%
      const totalTemps =
        individualProfileData.tempsRecherche +
        individualProfileData.tempsEnseignement +
        individualProfileData.tempsFormation +
        individualProfileData.tempsConsultation +
        individualProfileData.tempsGestionScientifique +
        individualProfileData.tempsAdministration;

      if (totalTemps > 100) {
        toast.error('La somme des allocations de temps ne peut pas dépasser 100%');
        return;
      }

      await usersApi.updateMyIndividualProfile(individualProfileData);

      toast.success('Profil individuel mis à jour avec succès');
      setIsEditingIndividual(false);

      // Recharger le profil
      loadProfile();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour du profil individuel');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadFiche = async (format: 'pdf' | 'word') => {
    try {
      toast.loading('Génération de la fiche en cours...');
      const blob = await usersApi.downloadMyIndividualProfile(format);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // Extension correcte selon le format
      const extension = format === 'pdf' ? 'pdf' : 'docx';
      a.download = `Fiche_Individuelle_${authUser?.lastName}.${extension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.dismiss();
      toast.success(`Fiche téléchargée avec succès (${format === 'pdf' ? 'PDF' : 'DOCX'})`);
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message || 'Erreur lors du téléchargement de la fiche');
    }
  };

  const getProfileImageUrl = () => {
    if (!profileImage) return null;
    if (profileImage.startsWith('http')) return profileImage;
    return `${API_BASE_URL}${profileImage}`;
  };

  const getInitials = () => {
    return `${profileData.firstName?.[0] || ''}${profileData.lastName?.[0] || ''}`.toUpperCase();
  };

  const tabs = [
    { id: 'personal' as TabType, label: 'Informations personnelles', icon: UserIcon },
    { id: 'individual' as TabType, label: 'Profil individuel', icon: FileText },
    { id: 'timeAllocation' as TabType, label: 'Allocation de temps', icon: Clock },
  ];

  if (isLoading && !profileData.firstName) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header avec Photo */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Photo de profil */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-green-600 flex items-center justify-center border-4 border-white shadow-lg">
                  {profileImage ? (
                    <img
                      src={getProfileImageUrl()!}
                      alt="Photo de profil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-3xl font-bold">{getInitials()}</span>
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
                  className="absolute bottom-0 right-0 p-2 bg-white text-green-600 rounded-full hover:bg-green-50 transition-colors shadow-lg"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Infos */}
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {profileData.firstName} {profileData.lastName}
                </h1>
                <p className="text-green-100">{profileData.email}</p>
                <p className="text-green-100 text-sm mt-1">{profileData.specialization || 'Chercheur'}</p>
              </div>
            </div>

            {activeTab === 'personal' && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-white text-green-700 rounded-lg hover:bg-green-50 transition-colors"
              >
                Modifier
              </button>
            )}

            {activeTab === 'individual' && !isEditingIndividual && individualProfile && (
              <button
                onClick={() => setIsEditingIndividual(true)}
                className="px-4 py-2 bg-white text-green-700 rounded-lg hover:bg-green-50 transition-colors"
              >
                Modifier
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* Onglets */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsEditing(false);
                  }}
                  className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-green-600 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenu des onglets */}
        <div className="p-6">
          {activeTab === 'personal' && (
            <PersonalInfoTab
              data={profileData}
              isEditing={isEditing}
              onChange={(field, value) => setProfileData(prev => ({ ...prev, [field]: value }))}
            />
          )}

          {activeTab === 'individual' && (
            <IndividualProfileTab
              data={individualProfile}
              formData={individualProfileData}
              isEditing={isEditingIndividual}
              onChange={(field, value) => setIndividualProfileData(prev => ({ ...prev, [field]: value }))}
              onDownload={handleDownloadFiche}
            />
          )}

          {activeTab === 'timeAllocation' && (
            <TimeAllocationTab data={timeAllocation} />
          )}
        </div>

        {/* Actions pour onglet personnel */}
        {activeTab === 'personal' && isEditing && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={() => {
                setIsEditing(false);
                loadProfile();
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

        {/* Actions pour onglet profil individuel */}
        {activeTab === 'individual' && isEditingIndividual && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={() => {
                setIsEditingIndividual(false);
                loadProfile();
              }}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4 inline mr-2" />
              Annuler
            </button>
            <button
              onClick={handleSaveIndividualProfile}
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

// Composant pour l'onglet Informations personnelles
const PersonalInfoTab: React.FC<{
  data: any;
  isEditing: boolean;
  onChange: (field: string, value: string) => void;
}> = ({ data, isEditing, onChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <UserIcon className="w-4 h-4 inline mr-2" />
          Prénom
        </label>
        <input
          type="text"
          value={data.firstName}
          onChange={(e) => onChange('firstName', e.target.value)}
          disabled={!isEditing}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <UserIcon className="w-4 h-4 inline mr-2" />
          Nom
        </label>
        <input
          type="text"
          value={data.lastName}
          onChange={(e) => onChange('lastName', e.target.value)}
          disabled={!isEditing}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Mail className="w-4 h-4 inline mr-2" />
          Email
        </label>
        <input
          type="email"
          value={data.email}
          disabled
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Phone className="w-4 h-4 inline mr-2" />
          Téléphone
        </label>
        <input
          type="tel"
          value={data.phoneNumber}
          onChange={(e) => onChange('phoneNumber', e.target.value)}
          disabled={!isEditing}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Briefcase className="w-4 h-4 inline mr-2" />
          Département
        </label>
        <input
          type="text"
          value={data.department}
          onChange={(e) => onChange('department', e.target.value)}
          disabled={!isEditing}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <GraduationCap className="w-4 h-4 inline mr-2" />
          Spécialisation
        </label>
        <input
          type="text"
          value={data.specialization}
          onChange={(e) => onChange('specialization', e.target.value)}
          disabled={!isEditing}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <GraduationCap className="w-4 h-4 inline mr-2" />
          Diplôme
        </label>
        <input
          type="text"
          value={data.diploma}
          onChange={(e) => onChange('diploma', e.target.value)}
          disabled={!isEditing}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Briefcase className="w-4 h-4 inline mr-2" />
          Discipline scientifique
        </label>
        <input
          type="text"
          value={data.discipline}
          onChange={(e) => onChange('discipline', e.target.value)}
          disabled={!isEditing}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
        />
      </div>
    </div>
  );
};

// Composant pour l'onglet Profil individuel
const IndividualProfileTab: React.FC<{
  data: any;
  formData: any;
  isEditing: boolean;
  onChange: (field: string, value: any) => void;
  onDownload: (format: 'pdf' | 'word') => void;
}> = ({ data, formData, isEditing, onChange, onDownload }) => {
  if (!data && !isEditing) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Profil individuel non configuré</h3>
        <p className="text-gray-600">Votre profil individuel n'a pas encore été créé.</p>
      </div>
    );
  }

  const displayData = isEditing ? formData : data;

  // Calculer le total des allocations de temps
  const totalTemps =
    (parseInt(formData.tempsRecherche) || 0) +
    (parseInt(formData.tempsEnseignement) || 0) +
    (parseInt(formData.tempsFormation) || 0) +
    (parseInt(formData.tempsConsultation) || 0) +
    (parseInt(formData.tempsGestionScientifique) || 0) +
    (parseInt(formData.tempsAdministration) || 0);

  return (
    <div>
      {!isEditing && (
        <div className="flex justify-end mb-6 space-x-3">
          <button
            onClick={() => onDownload('pdf')}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Télécharger PDF
          </button>
          <button
            onClick={() => onDownload('word')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Télécharger DOCX
          </button>
        </div>
      )}

      {/* Informations administratives */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations administratives</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Matricule</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.matricule}
                onChange={(e) => onChange('matricule', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ex: MAT12345"
              />
            ) : (
              <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900 font-medium">
                {displayData.matricule || 'Non renseigné'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.grade}
                onChange={(e) => onChange('grade', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ex: CR, CST, 7..."
              />
            ) : (
              <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900 font-medium">
                {displayData.grade || 'Non renseigné'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Classe</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.classe}
                onChange={(e) => onChange('classe', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ex: 1, 6.3..."
              />
            ) : (
              <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900 font-medium">
                {displayData.classe || 'Non renseigné'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Localité</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.localite}
                onChange={(e) => onChange('localite', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Lieu d'affectation"
              />
            ) : (
              <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900 font-medium">
                {displayData.localite || 'Non renseigné'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date de naissance</label>
            {isEditing ? (
              <input
                type="date"
                value={formData.dateNaissance}
                onChange={(e) => onChange('dateNaissance', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            ) : (
              <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900 font-medium">
                {displayData.dateNaissance ? new Date(displayData.dateNaissance).toLocaleDateString('fr-FR') : 'Non renseigné'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date de recrutement</label>
            {isEditing ? (
              <input
                type="date"
                value={formData.dateRecrutement}
                onChange={(e) => onChange('dateRecrutement', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            ) : (
              <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900 font-medium">
                {displayData.dateRecrutement ? new Date(displayData.dateRecrutement).toLocaleDateString('fr-FR') : 'Non renseigné'}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Diplôme</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.diplome}
                onChange={(e) => onChange('diplome', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ex: DOCTORAT, MASTER, INGÉNIEUR..."
              />
            ) : (
              <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900 font-medium">
                {displayData.diplome || 'Non renseigné'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Allocation de temps */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Allocation de temps (en %)</h3>
          {isEditing && (
            <span className={`text-sm font-medium ${totalTemps > 100 ? 'text-red-600' : totalTemps === 100 ? 'text-green-600' : 'text-gray-600'}`}>
              Total: {totalTemps}% {totalTemps > 100 && '(Dépasse 100%)'}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-2" />
              Recherche (%)
            </label>
            {isEditing ? (
              <input
                type="number"
                min="0"
                max="100"
                value={formData.tempsRecherche}
                onChange={(e) => onChange('tempsRecherche', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            ) : (
              <p className="px-4 py-2 bg-blue-50 rounded-lg text-gray-900 font-medium">
                {displayData.tempsRecherche}%
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-2" />
              Enseignement (%)
            </label>
            {isEditing ? (
              <input
                type="number"
                min="0"
                max="100"
                value={formData.tempsEnseignement}
                onChange={(e) => onChange('tempsEnseignement', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            ) : (
              <p className="px-4 py-2 bg-green-50 rounded-lg text-gray-900 font-medium">
                {displayData.tempsEnseignement}%
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-2" />
              Formation (%)
            </label>
            {isEditing ? (
              <input
                type="number"
                min="0"
                max="100"
                value={formData.tempsFormation}
                onChange={(e) => onChange('tempsFormation', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            ) : (
              <p className="px-4 py-2 bg-yellow-50 rounded-lg text-gray-900 font-medium">
                {displayData.tempsFormation}%
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-2" />
              Consultation (%)
            </label>
            {isEditing ? (
              <input
                type="number"
                min="0"
                max="100"
                value={formData.tempsConsultation}
                onChange={(e) => onChange('tempsConsultation', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            ) : (
              <p className="px-4 py-2 bg-purple-50 rounded-lg text-gray-900 font-medium">
                {displayData.tempsConsultation}%
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-2" />
              Gestion scientifique (%)
            </label>
            {isEditing ? (
              <input
                type="number"
                min="0"
                max="100"
                value={formData.tempsGestionScientifique}
                onChange={(e) => onChange('tempsGestionScientifique', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            ) : (
              <p className="px-4 py-2 bg-pink-50 rounded-lg text-gray-900 font-medium">
                {displayData.tempsGestionScientifique}%
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-2" />
              Administration (%)
            </label>
            {isEditing ? (
              <input
                type="number"
                min="0"
                max="100"
                value={formData.tempsAdministration}
                onChange={(e) => onChange('tempsAdministration', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            ) : (
              <p className="px-4 py-2 bg-red-50 rounded-lg text-gray-900 font-medium">
                {displayData.tempsAdministration}%
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant pour l'onglet Allocation de temps
const TimeAllocationTab: React.FC<{ data: any }> = ({ data }) => {
  const currentYear = new Date().getFullYear();

  if (!data) {
    return (
      <div className="text-center py-12">
        <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Allocation de temps non configurée</h3>
        <p className="text-gray-600">Votre allocation de temps pour {currentYear} n'a pas encore été configurée.</p>
      </div>
    );
  }

  const allocations = [
    { label: 'Recherche', value: data.tempsRecherche || 0, color: 'bg-blue-500' },
    { label: 'Enseignement', value: data.tempsEnseignement || 0, color: 'bg-green-500' },
    { label: 'Formation', value: data.tempsFormation || 0, color: 'bg-yellow-500' },
    { label: 'Consultation', value: data.tempsConsultation || 0, color: 'bg-purple-500' },
    { label: 'Gestion scientifique', value: data.tempsGestionScientifique || 0, color: 'bg-pink-500' },
    { label: 'Administration', value: data.tempsAdministration || 0, color: 'bg-red-500' },
  ];

  const total = allocations.reduce((sum, item) => sum + item.value, 0);

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Répartition du temps - Année {currentYear}
        </h3>
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <p className="text-sm text-gray-600 mb-2">Total: <span className="font-bold text-gray-900">{total}%</span></p>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden flex">
            {allocations.map((item, index) => (
              item.value > 0 && (
                <div
                  key={index}
                  className={`${item.color} h-full`}
                  style={{ width: `${item.value}%` }}
                  title={`${item.label}: ${item.value}%`}
                />
              )
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allocations.map((item, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full ${item.color} mr-3`}></div>
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{item.value}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompleteProfilePage;
