// src/components/projects/ProjectPartnerships.tsx
import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Users, Trash2, X, Calendar, Search } from 'lucide-react';
import { projectsApi } from '../../services/projectsApi';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { ProjectPartnership, AddPartnershipRequest } from '../../types/project.types';
import api from '../../services/api';

interface Partner {
  id: string;
  name: string;
  type: string;
  category?: string;
  expertise?: string[];
  contactPerson?: string;
  email?: string;
}

interface ProjectPartnershipsProps {
  projectId: string;
  partnerships: ProjectPartnership[];
}

const ProjectPartnerships: React.FC<ProjectPartnershipsProps> = ({ projectId, partnerships }) => {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newPartnership, setNewPartnership] = useState<AddPartnershipRequest>({
    partnerId: '',
    partnerType: '',
    contribution: '',
    benefits: '',
    startDate: '',
    endDate: '',
  });

  // Récupérer la liste des partenaires avec recherche
  const { data: partners = [], isLoading: isLoadingPartners } = useQuery({
    queryKey: ['partners', projectId, searchTerm],
    queryFn: async () => {
      const response = await api.get(`/projects/${projectId}/partners/search`, {
        params: { query: searchTerm },
      });
      return response.data.data || [];
    },
    enabled: showAddModal,
  });

  // Filtrer les partenaires déjà ajoutés
  const availablePartners = partners.filter((partner: Partner) =>
    !partnerships.some(p => p.partner.id === partner.id)
  );

  const addMutation = useMutation({
    mutationFn: (data: AddPartnershipRequest) => projectsApi.addPartnership(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast.success('Partenariat ajouté avec succès');
      setShowAddModal(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de l\'ajout');
    },
  });

  const removeMutation = useMutation({
    mutationFn: (partnershipId: string) => projectsApi.removePartnership(projectId, partnershipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast.success('Partenariat retiré avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors du retrait');
    },
  });

  const resetForm = () => {
    setNewPartnership({
      partnerId: '',
      partnerType: '',
      contribution: '',
      benefits: '',
      startDate: '',
      endDate: '',
    });
    setSearchTerm('');
  };

  const handleAdd = () => {
    if (!newPartnership.partnerId || !newPartnership.partnerType) {
      toast.error('Veuillez sélectionner un partenaire et spécifier le type');
      return;
    }
    addMutation.mutate(newPartnership);
  };

  const handleRemove = (partnershipId: string, partnerName: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir retirer le partenariat avec ${partnerName} ?`)) {
      removeMutation.mutate(partnershipId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Partenariats ({partnerships.length})</h3>
        <Button onClick={() => setShowAddModal(true)} className="bg-green-600 hover:bg-green-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un partenariat
        </Button>
      </div>

      {partnerships.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Aucun partenariat pour le moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {partnerships.map((partnership) => (
            <div
              key={partnership.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900">{partnership.partner.name}</h4>
                  <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {partnership.partnerType}
                  </span>
                </div>
                <button
                  onClick={() => handleRemove(partnership.id, partnership.partner.name)}
                  className="p-1 text-gray-600 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {partnership.contribution && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700">Contribution :</p>
                  <p className="text-sm text-gray-600">{partnership.contribution}</p>
                </div>
              )}

              {partnership.benefits && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700">Bénéfices :</p>
                  <p className="text-sm text-gray-600">{partnership.benefits}</p>
                </div>
              )}

              {(partnership.startDate || partnership.endDate) && (
                <div className="flex items-center text-sm text-gray-600 pt-3 border-t">
                  <Calendar className="w-4 h-4 mr-2" />
                  {partnership.startDate && format(new Date(partnership.startDate), 'dd MMM yyyy', { locale: fr })}
                  {partnership.endDate && ` - ${format(new Date(partnership.endDate), 'dd MMM yyyy', { locale: fr })}`}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Ajouter un partenariat</h3>
              <button onClick={() => { setShowAddModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Recherche et sélection de partenaire */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sélectionner un partenaire <span className="text-red-500">*</span>
                </label>

                {/* Barre de recherche */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher un partenaire..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Liste des partenaires */}
                <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                  {isLoadingPartners ? (
                    <div className="p-4 text-center text-gray-500">Chargement...</div>
                  ) : availablePartners.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      Aucun partenaire disponible
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {availablePartners.map((partner: Partner) => (
                        <button
                          key={partner.id}
                          type="button"
                          onClick={() => setNewPartnership({ ...newPartnership, partnerId: partner.id })}
                          className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                            newPartnership.partnerId === partner.id
                              ? 'bg-green-50 border-l-4 border-l-green-600'
                              : ''
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{partner.name}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                  {partner.type}
                                </span>
                                {partner.category && (
                                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                    {partner.category}
                                  </span>
                                )}
                              </div>
                              {partner.expertise && partner.expertise.length > 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {partner.expertise.slice(0, 3).join(', ')}
                                </p>
                              )}
                              {partner.contactPerson && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Contact: {partner.contactPerson} {partner.email && `(${partner.email})`}
                                </p>
                              )}
                            </div>
                            {newPartnership.partnerId === partner.id && (
                              <div className="ml-2">
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-600 text-white">
                                  ✓
                                </span>
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Type de partenariat */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de partenariat <span className="text-red-500">*</span>
                </label>
                <select
                  value={newPartnership.partnerType}
                  onChange={(e) => setNewPartnership({ ...newPartnership, partnerType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Sélectionnez un type</option>
                  <option value="Technique">Technique</option>
                  <option value="Financier">Financier</option>
                  <option value="Académique">Académique</option>
                  <option value="Logistique">Logistique</option>
                  <option value="Scientifique">Scientifique</option>
                  <option value="Institutionnel">Institutionnel</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              {/* Contribution */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contribution</label>
                <textarea
                  value={newPartnership.contribution}
                  onChange={(e) => setNewPartnership({ ...newPartnership, contribution: e.target.value })}
                  rows={3}
                  placeholder="Décrivez la contribution du partenaire au projet..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Bénéfices */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bénéfices</label>
                <textarea
                  value={newPartnership.benefits}
                  onChange={(e) => setNewPartnership({ ...newPartnership, benefits: e.target.value })}
                  rows={3}
                  placeholder="Décrivez les bénéfices attendus de ce partenariat..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                  <input
                    type="date"
                    value={newPartnership.startDate}
                    onChange={(e) => setNewPartnership({ ...newPartnership, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                  <input
                    type="date"
                    value={newPartnership.endDate}
                    onChange={(e) => setNewPartnership({ ...newPartnership, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
              <Button variant="outline" onClick={() => { setShowAddModal(false); resetForm(); }}>Annuler</Button>
              <Button
                onClick={handleAdd}
                disabled={addMutation.isPending || !newPartnership.partnerId}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {addMutation.isPending ? 'Ajout...' : 'Ajouter'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectPartnerships;
