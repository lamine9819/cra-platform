// src/pages/admin/PartnersManagement.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, Search, Filter, Building2, X } from 'lucide-react';
import { partnersApi } from '../../services/partnersApi';
import { Partner, PartnerType, PartnerTypeLabels, CreatePartnerRequest, UpdatePartnerRequest } from '../../types/partner.types';
import { PartnersTable } from '../../components/admin/partners/PartnersTable';
import { PartnerForm } from '../../components/admin/partners/PartnerForm';
import { Button } from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';

const PartnersManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<PartnerType | ''>('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | undefined>();
  const [showFilters, setShowFilters] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState<Partner | null>(null);
  const pageSize = 10;

  // Fetch partners
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['partners', currentPage, search, filterType, filterCategory],
    queryFn: () =>
      partnersApi.getPartners({
        page: currentPage,
        limit: pageSize,
        search: search || undefined,
        type: filterType || undefined,
        category: filterCategory || undefined,
      }),
  });

  // Create partner mutation
  const createMutation = useMutation({
    mutationFn: (data: CreatePartnerRequest) => partnersApi.createPartner(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      toast.success('Partenaire créé avec succès');
      setShowForm(false);
      setSelectedPartner(undefined);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la création du partenaire');
    },
  });

  // Update partner mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePartnerRequest }) =>
      partnersApi.updatePartner(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      toast.success('Partenaire modifié avec succès');
      setShowForm(false);
      setSelectedPartner(undefined);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification du partenaire');
    },
  });

  // Delete partner mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => partnersApi.deletePartner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      toast.success('Partenaire supprimé avec succès');
      setPartnerToDelete(null);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          'Erreur lors de la suppression du partenaire. Il est peut-être lié à des projets ou activités.'
      );
    },
  });

  const handleCreateNew = () => {
    setSelectedPartner(undefined);
    setShowForm(true);
  };

  const handleEdit = (partner: Partner) => {
    setSelectedPartner(partner);
    setShowForm(true);
  };

  const handleView = (partner: Partner) => {
    setSelectedPartner(partner);
    setShowForm(true);
  };

  const handleDelete = (partner: Partner) => {
    setPartnerToDelete(partner);
  };

  const confirmDelete = () => {
    if (partnerToDelete) {
      deleteMutation.mutate(partnerToDelete.id);
    }
  };

  const handleFormSubmit = async (formData: CreatePartnerRequest | UpdatePartnerRequest) => {
    if (selectedPartner) {
      await updateMutation.mutateAsync({
        id: selectedPartner.id,
        data: formData as UpdatePartnerRequest,
      });
    } else {
      await createMutation.mutateAsync(formData as CreatePartnerRequest);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setFilterType('');
    setFilterCategory('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Gestion des Partenaires
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {data?.total || 0} partenaire{(data?.total || 0) > 1 ? 's' : ''} enregistré
              {(data?.total || 0) > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Button onClick={handleCreateNew} size="lg">
          <Plus className="w-5 h-5 mr-2" />
          Nouveau partenaire
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Rechercher un partenaire..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="sm:w-auto"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtres
            {(filterType || filterCategory) && (
              <span className="ml-2 bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">
                Actifs
              </span>
            )}
          </Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="border-t pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value as PartnerType | '');
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Tous les types</option>
                {Object.entries(PartnerTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <input
                type="text"
                value={filterCategory}
                onChange={(e) => {
                  setFilterCategory(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Ex: National, International..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} className="w-full">
                <X className="w-4 h-4 mr-2" />
                Réinitialiser
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Partners Table */}
      {isError ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-red-600 mb-2">Erreur de chargement</div>
          <p className="text-gray-600 text-sm">
            {(error as any)?.response?.data?.message || 'Une erreur est survenue'}
          </p>
        </div>
      ) : (
        <>
          <PartnersTable
            partners={data?.partners || []}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isLoading}
          />

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={data.totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}

      {/* Partner Form Modal */}
      {showForm && (
        <PartnerForm
          partner={selectedPartner}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setSelectedPartner(undefined);
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}

      {/* Delete Confirmation Modal */}
      {partnerToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirmer la suppression
            </h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer le partenaire{' '}
              <span className="font-semibold">{partnerToDelete.name}</span> ?
              <br />
              <span className="text-sm text-red-600 mt-2 block">
                Cette action est irréversible et échouera si le partenaire est lié à des projets ou
                activités.
              </span>
            </p>
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setPartnerToDelete(null)}
                disabled={deleteMutation.isPending}
              >
                Annuler
              </Button>
              <Button
                variant="outline"
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {deleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnersManagement;
