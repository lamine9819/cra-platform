// src/pages/coordonateur/ResearcherProfilesManagement.tsx
import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Download,
  Eye,
  CheckCircle,
  AlertCircle,
  X,
  FileText,
  Clock,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  User,
  Calendar,
  MapPin,
  GraduationCap,
  Building2
} from 'lucide-react';
import { usersApi } from '../../services/usersApi';
import { toast } from 'react-hot-toast';

interface Researcher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department?: string;
  specialization?: string;
  discipline?: string;
  profileImage?: string;
  individualProfile?: {
    id: string;
    matricule: string;
    grade?: string;
    classe?: string;
    localite?: string;
    diplome?: string;
    dateNaissance?: string;
    dateRecrutement?: string;
    isValidated: boolean;
    validatedAt?: string;
    tempsRecherche: number;
    tempsEnseignement: number;
    tempsFormation: number;
    tempsConsultation: number;
    tempsGestionScientifique: number;
    tempsAdministration: number;
  };
}

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

const ResearcherProfilesManagement: React.FC = () => {
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'validated' | 'pending'>('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Modal pour voir les détails d'un chercheur
  const [selectedResearcher, setSelectedResearcher] = useState<Researcher | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [researcherAllocations, setResearcherAllocations] = useState<TimeAllocation[]>([]);
  const [loadingAllocations, setLoadingAllocations] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    loadResearchers();
  }, [pagination.page, searchQuery]);

  const loadResearchers = async () => {
    try {
      setIsLoading(true);
      const result = await usersApi.getResearchersWithProfiles({
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery || undefined
      });

      setResearchers(result.users);
      setPagination(prev => ({
        ...prev,
        total: result.pagination.total,
        totalPages: result.pagination.totalPages
      }));
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement des chercheurs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    loadResearchers();
  };

  const handleViewDetails = async (researcher: Researcher) => {
    setSelectedResearcher(researcher);
    setIsDetailModalOpen(true);

    // Charger les allocations de temps
    if (researcher.individualProfile) {
      setLoadingAllocations(true);
      try {
        const allocations = await usersApi.getUserTimeAllocations(researcher.id);
        setResearcherAllocations(allocations || []);
      } catch (error) {
        console.error('Erreur lors du chargement des allocations:', error);
        setResearcherAllocations([]);
      } finally {
        setLoadingAllocations(false);
      }
    }
  };

  const handleDownloadProfile = async (researcher: Researcher, format: 'pdf' | 'word') => {
    try {
      toast.loading(`Génération de la fiche ${format.toUpperCase()}...`);
      const blob = await usersApi.downloadIndividualProfile(researcher.id, format);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const extension = format === 'pdf' ? 'pdf' : 'docx';
      a.download = `Fiche_Individuelle_${researcher.lastName}_${researcher.firstName}.${extension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.dismiss();
      toast.success(`Fiche téléchargée avec succès`);
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message || 'Erreur lors du téléchargement');
    }
  };

  const handleValidateProfile = async (researcher: Researcher) => {
    if (!confirm(`Êtes-vous sûr de vouloir valider le profil de ${researcher.firstName} ${researcher.lastName} ?`)) {
      return;
    }

    try {
      await usersApi.validateIndividualProfile(researcher.id);
      toast.success('Profil validé avec succès');
      loadResearchers();

      // Mettre à jour le modal si ouvert
      if (selectedResearcher?.id === researcher.id) {
        setSelectedResearcher({
          ...selectedResearcher,
          individualProfile: selectedResearcher.individualProfile ? {
            ...selectedResearcher.individualProfile,
            isValidated: true,
            validatedAt: new Date().toISOString()
          } : undefined
        });
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la validation');
    }
  };

  const handleValidateTimeAllocation = async (researcher: Researcher, year: number) => {
    if (!confirm(`Êtes-vous sûr de vouloir valider l'allocation de temps ${year} de ${researcher.firstName} ${researcher.lastName} ?`)) {
      return;
    }

    try {
      await usersApi.validateIndividualProfile(researcher.id, year);
      toast.success(`Allocation de temps ${year} validée avec succès`);

      // Recharger les allocations
      const allocations = await usersApi.getUserTimeAllocations(researcher.id);
      setResearcherAllocations(allocations || []);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la validation');
    }
  };

  const getProfileImageUrl = (researcher: Researcher) => {
    if (!researcher.profileImage) return null;
    if (researcher.profileImage.startsWith('http')) return researcher.profileImage;
    return `${API_BASE_URL}${researcher.profileImage}`;
  };

  const getInitials = (researcher: Researcher) => {
    return `${researcher.firstName?.[0] || ''}${researcher.lastName?.[0] || ''}`.toUpperCase();
  };

  const filteredResearchers = researchers.filter(researcher => {
    if (filterStatus === 'validated') {
      return researcher.individualProfile?.isValidated === true;
    }
    if (filterStatus === 'pending') {
      return researcher.individualProfile && !researcher.individualProfile.isValidated;
    }
    return true;
  });

  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 6 }, (_, i) => currentYear - i);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Users className="w-7 h-7 mr-3 text-green-600" />
          Gestion des Fiches Individuelles
        </h1>
        <p className="text-gray-600 mt-1">
          Consultez, téléchargez et validez les fiches individuelles des chercheurs
        </p>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Recherche */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par nom, matricule, spécialisation..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </form>

          {/* Filtres */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="validated">Validés</option>
              <option value="pending">En attente</option>
            </select>

            <button
              onClick={loadResearchers}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Actualiser"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Liste des chercheurs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : filteredResearchers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun chercheur trouvé</h3>
            <p className="text-gray-600">Modifiez vos critères de recherche</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Chercheur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Matricule / Grade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Localité
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Profil
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredResearchers.map((researcher) => (
                    <tr key={researcher.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-green-100 flex items-center justify-center">
                            {researcher.profileImage ? (
                              <img
                                src={getProfileImageUrl(researcher)!}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-green-600 font-medium">{getInitials(researcher)}</span>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {researcher.firstName} {researcher.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{researcher.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {researcher.individualProfile ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {researcher.individualProfile.matricule}
                            </div>
                            <div className="text-sm text-gray-500">
                              {researcher.individualProfile.grade || '-'} {researcher.individualProfile.classe && `/ ${researcher.individualProfile.classe}`}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Non configuré</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {researcher.individualProfile?.localite || researcher.department || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {researcher.individualProfile ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <FileText className="w-3 h-3 mr-1" />
                            Configuré
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Non configuré
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {researcher.individualProfile?.isValidated ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Validé
                          </span>
                        ) : researcher.individualProfile ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            <Clock className="w-3 h-3 mr-1" />
                            En attente
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleViewDetails(researcher)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Voir les détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {researcher.individualProfile && (
                            <>
                              <button
                                onClick={() => handleDownloadProfile(researcher, 'pdf')}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Télécharger PDF"
                              >
                                <Download className="w-4 h-4" />
                              </button>

                              {!researcher.individualProfile.isValidated && (
                                <button
                                  onClick={() => handleValidateProfile(researcher)}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Valider le profil"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Affichage de {((pagination.page - 1) * pagination.limit) + 1} à{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} sur {pagination.total} chercheurs
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg font-medium">
                    {pagination.page}
                  </span>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.totalPages}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de détails */}
      {isDetailModalOpen && selectedResearcher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header du modal */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-white flex items-center justify-center">
                  {selectedResearcher.profileImage ? (
                    <img
                      src={getProfileImageUrl(selectedResearcher)!}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-green-600 font-bold">{getInitials(selectedResearcher)}</span>
                  )}
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-bold text-white">
                    {selectedResearcher.firstName} {selectedResearcher.lastName}
                  </h2>
                  <p className="text-green-100 text-sm">{selectedResearcher.email}</p>
                </div>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenu du modal */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {!selectedResearcher.individualProfile ? (
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Profil individuel non configuré</h3>
                  <p className="text-gray-600">Ce chercheur n'a pas encore créé son profil individuel.</p>
                </div>
              ) : (
                <>
                  {/* Actions rapides */}
                  <div className="flex justify-end space-x-3 mb-6">
                    <button
                      onClick={() => handleDownloadProfile(selectedResearcher, 'pdf')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Télécharger PDF
                    </button>
                    <button
                      onClick={() => handleDownloadProfile(selectedResearcher, 'word')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Télécharger DOCX
                    </button>
                    {!selectedResearcher.individualProfile.isValidated && (
                      <button
                        onClick={() => handleValidateProfile(selectedResearcher)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Valider le profil
                      </button>
                    )}
                  </div>

                  {/* Informations du profil */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <User className="w-5 h-5 mr-2 text-green-600" />
                        Informations administratives
                      </h3>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Matricule</p>
                          <p className="font-medium">{selectedResearcher.individualProfile.matricule}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Grade</p>
                          <p className="font-medium">{selectedResearcher.individualProfile.grade || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Classe</p>
                          <p className="font-medium">{selectedResearcher.individualProfile.classe || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Localité</p>
                          <p className="font-medium flex items-center">
                            <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                            {selectedResearcher.individualProfile.localite || '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Diplôme</p>
                          <p className="font-medium flex items-center">
                            <GraduationCap className="w-4 h-4 mr-1 text-gray-400" />
                            {selectedResearcher.individualProfile.diplome || '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Date de recrutement</p>
                          <p className="font-medium flex items-center">
                            <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                            {selectedResearcher.individualProfile.dateRecrutement
                              ? new Date(selectedResearcher.individualProfile.dateRecrutement).toLocaleDateString('fr-FR')
                              : '-'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Building2 className="w-5 h-5 mr-2 text-green-600" />
                        Informations professionnelles
                      </h3>

                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Département</p>
                          <p className="font-medium">{selectedResearcher.department || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Spécialisation</p>
                          <p className="font-medium">{selectedResearcher.specialization || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Discipline</p>
                          <p className="font-medium">{selectedResearcher.discipline || '-'}</p>
                        </div>
                      </div>

                      {/* Statut de validation */}
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          {selectedResearcher.individualProfile.isValidated ? (
                            <>
                              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                              <span className="text-green-700 font-medium">Profil validé</span>
                              {selectedResearcher.individualProfile.validatedAt && (
                                <span className="text-gray-500 text-sm ml-2">
                                  le {new Date(selectedResearcher.individualProfile.validatedAt).toLocaleDateString('fr-FR')}
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
                    </div>
                  </div>

                  {/* Allocations de temps */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                      <Clock className="w-5 h-5 mr-2 text-green-600" />
                      Allocations de temps
                    </h3>

                    {loadingAllocations ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                      </div>
                    ) : researcherAllocations.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-600">Aucune allocation de temps configurée</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Année</th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Recherche</th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Enseign.</th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Formation</th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Consult.</th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Gestion</th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Admin.</th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Statut</th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {researcherAllocations.map((allocation) => (
                              <tr key={allocation.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {allocation.year}
                                  {allocation.year === currentYear && (
                                    <span className="ml-2 text-xs text-green-600">(Actuelle)</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-500">
                                  {allocation.tempsRecherche}%
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-500">
                                  {allocation.tempsEnseignement}%
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-500">
                                  {allocation.tempsFormation}%
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-500">
                                  {allocation.tempsConsultation}%
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-500">
                                  {allocation.tempsGestionScientifique}%
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-500">
                                  {allocation.tempsAdministration}%
                                </td>
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
                                <td className="px-4 py-3 whitespace-nowrap text-center">
                                  {!allocation.isValidated && (
                                    <button
                                      onClick={() => handleValidateTimeAllocation(selectedResearcher, allocation.year)}
                                      className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                      title="Valider cette allocation"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Allocation de temps par défaut du profil */}
                  <div className="border-t border-gray-200 pt-6 mt-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Allocation de temps par défaut (profil)</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[
                        { label: 'Recherche', value: selectedResearcher.individualProfile.tempsRecherche, color: 'bg-blue-500' },
                        { label: 'Enseignement', value: selectedResearcher.individualProfile.tempsEnseignement, color: 'bg-green-500' },
                        { label: 'Formation', value: selectedResearcher.individualProfile.tempsFormation, color: 'bg-yellow-500' },
                        { label: 'Consultation', value: selectedResearcher.individualProfile.tempsConsultation, color: 'bg-purple-500' },
                        { label: 'Gestion scientifique', value: selectedResearcher.individualProfile.tempsGestionScientifique, color: 'bg-pink-500' },
                        { label: 'Administration', value: selectedResearcher.individualProfile.tempsAdministration, color: 'bg-red-500' },
                      ].map((item, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className={`w-3 h-3 rounded-full ${item.color} mr-2`}></div>
                              <span className="text-sm text-gray-600">{item.label}</span>
                            </div>
                            <span className="font-bold text-gray-900">{item.value}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearcherProfilesManagement;
