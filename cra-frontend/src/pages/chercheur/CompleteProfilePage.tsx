// src/pages/chercheur/CompleteProfilePage.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  User as UserIcon,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Save,
  X,
  Camera,
  Download,
  Clock,
  FileText,
  Plus,
  Calendar,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { usersApi } from '../../services/usersApi';
import { toast } from 'react-hot-toast';

type TabType = 'personal' | 'individual' | 'timeAllocation';

interface TimeAllocation {
  id: string;
  year: number;
  tempsRecherche: number;
  tempsEnseignement: number;
  tempsFormation: number;
  tempsConsultation: number;
  tempsGestionScientifique: number;
  tempsAdministration: number;
  isValidated: boolean;
  validatedAt?: string;
  validatedBy?: string;
}

const CompleteProfilePage: React.FC = () => {
  const { user: authUser, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingIndividual, setIsEditingIndividual] = useState(false);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [isEditingTimeAllocation, setIsEditingTimeAllocation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  // Gestion de l'année pour l'allocation de temps
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

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

  // Allocations de temps
  const [timeAllocations, setTimeAllocations] = useState<TimeAllocation[]>([]);
  const [currentTimeAllocation, setCurrentTimeAllocation] = useState<TimeAllocation | null>(null);
  const [timeAllocationFormData, setTimeAllocationFormData] = useState({
    tempsRecherche: 0,
    tempsEnseignement: 0,
    tempsFormation: 0,
    tempsConsultation: 0,
    tempsGestionScientifique: 0,
    tempsAdministration: 0,
  });

  const [profileImage, setProfileImage] = useState<string | undefined>(authUser?.profileImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    // Charger l'allocation de l'année sélectionnée
    const allocation = timeAllocations.find(a => a.year === selectedYear);
    setCurrentTimeAllocation(allocation || null);
    if (allocation) {
      setTimeAllocationFormData({
        tempsRecherche: allocation.tempsRecherche,
        tempsEnseignement: allocation.tempsEnseignement,
        tempsFormation: allocation.tempsFormation,
        tempsConsultation: allocation.tempsConsultation,
        tempsGestionScientifique: allocation.tempsGestionScientifique,
        tempsAdministration: allocation.tempsAdministration,
      });
    } else {
      setTimeAllocationFormData({
        tempsRecherche: 0,
        tempsEnseignement: 0,
        tempsFormation: 0,
        tempsConsultation: 0,
        tempsGestionScientifique: 0,
        tempsAdministration: 0,
      });
    }
  }, [selectedYear, timeAllocations]);

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
        diploma: ((profile as any)?.diploma) || '',
        discipline: ((profile as any)?.discipline) || '',
      });

      setProfileImage(profile.profileImage);
      setIndividualProfile(((profile as any)?.individualProfile) || null);

      // Charger les données du profil individuel dans le formulaire
      if (((profile as any)?.individualProfile)) {
        setIndividualProfileData({
          matricule: ((profile as any)?.individualProfile).matricule || '',
          grade: ((profile as any)?.individualProfile).grade || '',
          classe: ((profile as any)?.individualProfile).classe || '',
          dateNaissance: ((profile as any)?.individualProfile).dateNaissance ? ((profile as any)?.individualProfile).dateNaissance.split('T')[0] : '',
          dateRecrutement: ((profile as any)?.individualProfile).dateRecrutement ? ((profile as any)?.individualProfile).dateRecrutement.split('T')[0] : '',
          localite: ((profile as any)?.individualProfile).localite || '',
          diplome: ((profile as any)?.individualProfile).diplome || '',
          tempsRecherche: ((profile as any)?.individualProfile).tempsRecherche || 0,
          tempsEnseignement: ((profile as any)?.individualProfile).tempsEnseignement || 0,
          tempsFormation: ((profile as any)?.individualProfile).tempsFormation || 0,
          tempsConsultation: ((profile as any)?.individualProfile).tempsConsultation || 0,
          tempsGestionScientifique: ((profile as any)?.individualProfile).tempsGestionScientifique || 0,
          tempsAdministration: ((profile as any)?.individualProfile).tempsAdministration || 0,
        });

        // Charger les allocations de temps
        try {
          const allocations = await usersApi.getMyTimeAllocations();
          setTimeAllocations(allocations || []);
        } catch (err) {
          console.warn('Erreur lors du chargement des allocations:', err);
          setTimeAllocations([]);
        }
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

  const handleCreateIndividualProfile = async () => {
    try {
      setIsLoading(true);

      // Validation : le matricule est obligatoire
      if (!individualProfileData.matricule.trim()) {
        toast.error('Le matricule est obligatoire');
        return;
      }

      await usersApi.createMyIndividualProfile(individualProfileData);

      toast.success('Profil individuel créé avec succès');
      setIsCreatingProfile(false);

      // Recharger le profil
      loadProfile();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création du profil individuel');
    } finally {
      setIsLoading(false);
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

  const handleSaveTimeAllocation = async () => {
    try {
      setIsLoading(true);

      // Validation : la somme des temps doit être = 100%
      const totalTemps =
        timeAllocationFormData.tempsRecherche +
        timeAllocationFormData.tempsEnseignement +
        timeAllocationFormData.tempsFormation +
        timeAllocationFormData.tempsConsultation +
        timeAllocationFormData.tempsGestionScientifique +
        timeAllocationFormData.tempsAdministration;

      if (totalTemps !== 100) {
        toast.error('La somme des allocations de temps doit être égale à 100%');
        return;
      }

      await usersApi.updateMyTimeAllocation(selectedYear, timeAllocationFormData);

      toast.success(`Allocation de temps pour ${selectedYear} mise à jour avec succès`);
      setIsEditingTimeAllocation(false);

      // Recharger les allocations
      const allocations = await usersApi.getMyTimeAllocations();
      setTimeAllocations(allocations || []);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour de l\'allocation de temps');
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

  // Années disponibles pour la sélection (5 ans dans le passé et futur)
  const availableYears = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

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

            {activeTab === 'individual' && !isEditingIndividual && individualProfile && !isCreatingProfile && (
              <button
                onClick={() => setIsEditingIndividual(true)}
                className="px-4 py-2 bg-white text-green-700 rounded-lg hover:bg-green-50 transition-colors"
              >
                Modifier
              </button>
            )}

            {activeTab === 'timeAllocation' && !isEditingTimeAllocation && individualProfile && (
              <button
                onClick={() => setIsEditingTimeAllocation(true)}
                className="px-4 py-2 bg-white text-green-700 rounded-lg hover:bg-green-50 transition-colors"
              >
                {currentTimeAllocation ? 'Modifier' : 'Configurer'}
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
                    setIsEditingIndividual(false);
                    setIsEditingTimeAllocation(false);
                    setIsCreatingProfile(false);
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
              isCreating={isCreatingProfile}
              onChange={(field, value) => setIndividualProfileData((prev: any) => ({ ...prev, [field]: value }))}
              onDownload={handleDownloadFiche}
              onStartCreate={() => setIsCreatingProfile(true)}
            />
          )}

          {activeTab === 'timeAllocation' && (
            <TimeAllocationTab
              individualProfile={individualProfile}
              allocations={timeAllocations}
              currentAllocation={currentTimeAllocation}
              selectedYear={selectedYear}
              availableYears={availableYears}
              isEditing={isEditingTimeAllocation}
              formData={timeAllocationFormData}
              onYearChange={setSelectedYear}
              onChange={(field, value) => setTimeAllocationFormData(prev => ({ ...prev, [field]: value }))}
            />
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

        {/* Actions pour onglet profil individuel - Création */}
        {activeTab === 'individual' && isCreatingProfile && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={() => {
                setIsCreatingProfile(false);
                setIndividualProfileData({
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
              }}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4 inline mr-2" />
              Annuler
            </button>
            <button
              onClick={handleCreateIndividualProfile}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-2"></div>
                  Création...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 inline mr-2" />
                  Créer mon profil
                </>
              )}
            </button>
          </div>
        )}

        {/* Actions pour onglet profil individuel - Modification */}
        {activeTab === 'individual' && isEditingIndividual && !isCreatingProfile && (
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

        {/* Actions pour onglet allocation de temps */}
        {activeTab === 'timeAllocation' && isEditingTimeAllocation && individualProfile && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={() => {
                setIsEditingTimeAllocation(false);
                // Restaurer les données
                const allocation = timeAllocations.find(a => a.year === selectedYear);
                if (allocation) {
                  setTimeAllocationFormData({
                    tempsRecherche: allocation.tempsRecherche,
                    tempsEnseignement: allocation.tempsEnseignement,
                    tempsFormation: allocation.tempsFormation,
                    tempsConsultation: allocation.tempsConsultation,
                    tempsGestionScientifique: allocation.tempsGestionScientifique,
                    tempsAdministration: allocation.tempsAdministration,
                  });
                } else {
                  setTimeAllocationFormData({
                    tempsRecherche: 0,
                    tempsEnseignement: 0,
                    tempsFormation: 0,
                    tempsConsultation: 0,
                    tempsGestionScientifique: 0,
                    tempsAdministration: 0,
                  });
                }
              }}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4 inline mr-2" />
              Annuler
            </button>
            <button
              onClick={handleSaveTimeAllocation}
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
  isCreating: boolean;
  onChange: (field: string, value: any) => void;
  onDownload: (format: 'pdf' | 'word') => void;
  onStartCreate: () => void;
}> = ({ data, formData, isEditing, isCreating, onChange, onDownload, onStartCreate }) => {

  // Si pas de profil et pas en mode création, afficher le bouton de création
  if (!data && !isCreating) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Profil individuel non configuré</h3>
        <p className="text-gray-600 mb-6">Votre profil individuel n'a pas encore été créé. Créez-le pour accéder à toutes les fonctionnalités.</p>
        <button
          onClick={onStartCreate}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors inline-flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Créer mon profil individuel
        </button>
      </div>
    );
  }

  const displayData = (isEditing || isCreating) ? formData : data;
  const isFormMode = isEditing || isCreating;

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
      {!isFormMode && (
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Matricule {isCreating && <span className="text-red-500">*</span>}
            </label>
            {isFormMode ? (
              <input
                type="text"
                value={formData.matricule}
                onChange={(e) => onChange('matricule', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ex: MAT12345"
                required={isCreating}
              />
            ) : (
              <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900 font-medium">
                {displayData.matricule || 'Non renseigné'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
            {isFormMode ? (
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
            {isFormMode ? (
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
            {isFormMode ? (
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
            {isFormMode ? (
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
            {isFormMode ? (
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
            {isFormMode ? (
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

      {/* Allocation de temps par défaut (dans le profil) - Seulement pour édition */}
      {isFormMode && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Allocation de temps par défaut (en %)</h3>
            <span className={`text-sm font-medium ${totalTemps > 100 ? 'text-red-600' : totalTemps === 100 ? 'text-green-600' : 'text-gray-600'}`}>
              Total: {totalTemps}% {totalTemps > 100 && '(Dépasse 100%)'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Recherche (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.tempsRecherche}
                onChange={(e) => onChange('tempsRecherche', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Enseignement (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.tempsEnseignement}
                onChange={(e) => onChange('tempsEnseignement', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Formation (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.tempsFormation}
                onChange={(e) => onChange('tempsFormation', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Consultation (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.tempsConsultation}
                onChange={(e) => onChange('tempsConsultation', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Gestion scientifique (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.tempsGestionScientifique}
                onChange={(e) => onChange('tempsGestionScientifique', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Administration (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.tempsAdministration}
                onChange={(e) => onChange('tempsAdministration', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Statut de validation - Seulement en mode affichage */}
      {!isFormMode && data && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            {data.isValidated ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-green-700 font-medium">Profil validé</span>
                {data.validatedAt && (
                  <span className="text-gray-500 text-sm ml-2">
                    le {new Date(data.validatedAt).toLocaleDateString('fr-FR')}
                  </span>
                )}
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-orange-500 mr-2" />
                <span className="text-orange-700 font-medium">En attente de validation</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Composant pour l'onglet Allocation de temps
const TimeAllocationTab: React.FC<{
  individualProfile: any;
  allocations: TimeAllocation[];
  currentAllocation: TimeAllocation | null;
  selectedYear: number;
  availableYears: number[];
  isEditing: boolean;
  formData: any;
  onYearChange: (year: number) => void;
  onChange: (field: string, value: number) => void;
}> = ({
  individualProfile,
  allocations,
  currentAllocation,
  selectedYear,
  availableYears,
  isEditing,
  formData,
  onYearChange,
  onChange
}) => {
  const currentYear = new Date().getFullYear();

  // Si pas de profil individuel, afficher un message
  if (!individualProfile) {
    return (
      <div className="text-center py-12">
        <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Profil individuel requis</h3>
        <p className="text-gray-600">Vous devez d'abord créer votre profil individuel pour gérer vos allocations de temps.</p>
      </div>
    );
  }

  const displayData = isEditing ? formData : currentAllocation;

  const allocationFields = [
    { key: 'tempsRecherche', label: 'Recherche', color: 'bg-blue-500', bgColor: 'bg-blue-50' },
    { key: 'tempsEnseignement', label: 'Enseignement', color: 'bg-green-500', bgColor: 'bg-green-50' },
    { key: 'tempsFormation', label: 'Formation', color: 'bg-yellow-500', bgColor: 'bg-yellow-50' },
    { key: 'tempsConsultation', label: 'Consultation', color: 'bg-purple-500', bgColor: 'bg-purple-50' },
    { key: 'tempsGestionScientifique', label: 'Gestion scientifique', color: 'bg-pink-500', bgColor: 'bg-pink-50' },
    { key: 'tempsAdministration', label: 'Administration', color: 'bg-red-500', bgColor: 'bg-red-50' },
  ];

  const total = allocationFields.reduce((sum, field) => {
    return sum + (displayData?.[field.key] || 0);
  }, 0);

  return (
    <div>
      {/* Sélecteur d'année */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Allocation de temps par année
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onYearChange(selectedYear - 1)}
              disabled={selectedYear <= availableYears[0]}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <select
              value={selectedYear}
              onChange={(e) => onYearChange(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>
                  {year} {year === currentYear && '(Année courante)'}
                </option>
              ))}
            </select>
            <button
              onClick={() => onYearChange(selectedYear + 1)}
              disabled={selectedYear >= availableYears[availableYears.length - 1]}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Indicateur des années avec allocations */}
        <div className="flex flex-wrap gap-2 mb-4">
          {availableYears.map(year => {
            const hasAllocation = allocations.some(a => a.year === year);
            const isSelected = year === selectedYear;
            return (
              <button
                key={year}
                onClick={() => onYearChange(year)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  isSelected
                    ? 'bg-green-600 text-white'
                    : hasAllocation
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {year}
                {hasAllocation && !isSelected && (
                  <CheckCircle className="w-3 h-3 inline ml-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenu de l'allocation */}
      {!displayData && !isEditing ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 mb-2">Aucune allocation configurée pour {selectedYear}</p>
          <p className="text-sm text-gray-500">Cliquez sur "Configurer" pour définir votre allocation de temps.</p>
        </div>
      ) : (
        <>
          {/* Barre de progression */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">
                Total: <span className={`font-bold ${total === 100 ? 'text-green-600' : total > 100 ? 'text-red-600' : 'text-gray-900'}`}>{total}%</span>
              </p>
              {isEditing && total !== 100 && (
                <p className={`text-sm ${total > 100 ? 'text-red-600' : 'text-orange-600'}`}>
                  {total > 100 ? `Dépasse de ${total - 100}%` : `Manque ${100 - total}%`}
                </p>
              )}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden flex">
              {allocationFields.map((field) => {
                const value = displayData?.[field.key] || 0;
                return value > 0 ? (
                  <div
                    key={field.key}
                    className={`${field.color} h-full transition-all duration-300`}
                    style={{ width: `${Math.min(value, 100)}%` }}
                    title={`${field.label}: ${value}%`}
                  />
                ) : null;
              })}
            </div>
          </div>

          {/* Formulaire ou affichage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allocationFields.map((field) => (
              <div key={field.key} className={`${isEditing ? '' : field.bgColor} border border-gray-200 rounded-lg p-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${field.color} mr-3`}></div>
                    <span className="text-sm font-medium text-gray-700">{field.label}</span>
                  </div>
                  {isEditing ? (
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData[field.key]}
                      onChange={(e) => onChange(field.key, parseInt(e.target.value) || 0)}
                      className="w-20 px-3 py-1 text-right border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <span className="text-lg font-bold text-gray-900">{displayData?.[field.key] || 0}%</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Statut de validation */}
          {!isEditing && currentAllocation && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                {currentAllocation.isValidated ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-green-700 font-medium">Allocation validée</span>
                    {currentAllocation.validatedAt && (
                      <span className="text-gray-500 text-sm ml-2">
                        le {new Date(currentAllocation.validatedAt).toLocaleDateString('fr-FR')}
                        {currentAllocation.validatedBy && ` par ${currentAllocation.validatedBy}`}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-orange-500 mr-2" />
                    <span className="text-orange-700 font-medium">En attente de validation</span>
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Historique des allocations */}
      {allocations.length > 0 && (
        <div className="mt-8">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Historique des allocations</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Année</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Recherche</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Enseign.</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Formation</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Consult.</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Gestion</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Admin.</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allocations.map((allocation) => (
                  <tr
                    key={allocation.id}
                    className={`${allocation.year === selectedYear ? 'bg-green-50' : ''} hover:bg-gray-50 cursor-pointer`}
                    onClick={() => onYearChange(allocation.year)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {allocation.year}
                      {allocation.year === currentYear && (
                        <span className="ml-2 text-xs text-green-600">(Actuelle)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-500">{allocation.tempsRecherche}%</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-500">{allocation.tempsEnseignement}%</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-500">{allocation.tempsFormation}%</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-500">{allocation.tempsConsultation}%</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-500">{allocation.tempsGestionScientifique}%</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-500">{allocation.tempsAdministration}%</td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      {allocation.isValidated ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Validé
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          En attente
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompleteProfilePage;
