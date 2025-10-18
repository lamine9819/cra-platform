// src/pages/admin/ConventionsManagement.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, Search, Filter, FileText, X } from 'lucide-react';
import { conventionsApi } from '../../services/conventionsApi';
import {
  Convention,
  ConventionType,
  ConventionStatus,
  CreateConventionRequest,
  UpdateConventionRequest,
  ConventionTypeLabels,
  ConventionStatusLabels,
} from '../../types/convention.types';
import { ConventionsTable } from '../../components/admin/conventions/ConventionsTable';
import { ConventionForm } from '../../components/admin/conventions/ConventionForm';
import { Button } from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';

const ConventionsManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<ConventionType | ''>('');
  const [filterStatus, setFilterStatus] = useState<ConventionStatus | ''>('');
  const [showForm, setShowForm] = useState(false);
  const [selectedConvention, setSelectedConvention] = useState<Convention | undefined>();
  const [showFilters, setShowFilters] = useState(false);
  const [conventionToDelete, setConventionToDelete] = useState<Convention | null>(null);
  const pageSize = 10;

  // Fetch conventions
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['conventions', currentPage, search, filterType, filterStatus],
    queryFn: () =>
      conventionsApi.getConventions({
        page: currentPage,
        limit: pageSize,
        search: search || undefined,
        type: filterType || undefined,
        status: filterStatus || undefined,
      }),
  });

  // Create convention mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateConventionRequest) => conventionsApi.createConvention(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conventions'] });
      toast.success('Convention créée avec succès');
      setShowForm(false);
      setSelectedConvention(undefined);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la création de la convention');
    },
  });

  // Update convention mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateConventionRequest }) =>
      conventionsApi.updateConvention(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conventions'] });
      toast.success('Convention modifiée avec succès');
      setShowForm(false);
      setSelectedConvention(undefined);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Erreur lors de la modification de la convention'
      );
    },
  });

  // Delete convention mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => conventionsApi.deleteConvention(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conventions'] });
      toast.success('Convention supprimée avec succès');
      setConventionToDelete(null);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          'Erreur lors de la suppression de la convention. Elle est peut-être liée à des activités ou projets.'
      );
    },
  });

  const handleCreateNew = () => {
    setSelectedConvention(undefined);
    setShowForm(true);
  };

  const handleEdit = (convention: Convention) => {
    setSelectedConvention(convention);
    setShowForm(true);
  };

  const handleView = (convention: Convention) => {
    setSelectedConvention(convention);
    setShowForm(true);
  };

  const handleDelete = (convention: Convention) => {
    setConventionToDelete(convention);
  };

  const confirmDelete = () => {
    if (conventionToDelete) {
      deleteMutation.mutate(conventionToDelete.id);
    }
  };

  const handleFormSubmit = async (
    formData: CreateConventionRequest | UpdateConventionRequest
  ) => {
    if (selectedConvention) {
      await updateMutation.mutateAsync({
        id: selectedConvention.id,
        data: formData as UpdateConventionRequest,
      });
    } else {
      await createMutation.mutateAsync(formData as CreateConventionRequest);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setFilterType('');
    setFilterStatus('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Gestion des Conventions
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {data?.total || 0} convention{(data?.total || 0) > 1 ? 's' : ''} enregistrée
              {(data?.total || 0) > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Button onClick={handleCreateNew} size="lg">
          <Plus className="w-5 h-5 mr-2" />
          Nouvelle convention
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
              placeholder="Rechercher une convention..."
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
            {(filterType || filterStatus) && (
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
                  setFilterType(e.target.value as ConventionType | '');
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Tous les types</option>
                {Object.entries(ConventionTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value as ConventionStatus | '');
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Tous les statuts</option>
                {Object.entries(ConventionStatusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
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

      {/* Conventions Table */}
      {isError ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-red-600 mb-2">Erreur de chargement</div>
          <p className="text-gray-600 text-sm">
            {(error as any)?.response?.data?.message || 'Une erreur est survenue'}
          </p>
        </div>
      ) : (
        <>
          <ConventionsTable
            conventions={data?.conventions || []}
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

      {/* Convention Form Modal */}
      {showForm && (
        <ConventionForm
          convention={selectedConvention}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setSelectedConvention(undefined);
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}

      {/* Delete Confirmation Modal */}
      {conventionToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirmer la suppression
            </h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer la convention{' '}
              <span className="font-semibold">{conventionToDelete.title}</span> ?
              <br />
              <span className="text-sm text-red-600 mt-2 block">
                Cette action est irréversible et échouera si la convention est liée à des projets
                ou activités.
              </span>
            </p>
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setConventionToDelete(null)}
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

export default ConventionsManagement;
