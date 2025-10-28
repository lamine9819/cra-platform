// src/components/activities/ActivityFunding.tsx
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, X, DollarSign, TrendingUp } from 'lucide-react';
import { activitiesApi } from '../../services/activitiesApi';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';
import {
  type ActivityFunding,
  type AddActivityFundingRequest,
  type UpdateActivityFundingRequest,
  FundingType,
  FundingTypeLabels,
  FundingStatus,
  FundingStatusLabels,
  FundingStatusColors,
} from '../../types/activity.types';

interface ActivityFundingProps {
  activityId: string;
  fundings: ActivityFunding[];
}

const ActivityFundingComponent: React.FC<ActivityFundingProps> = ({
  activityId,
  fundings,
}) => {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFunding, setSelectedFunding] = useState<ActivityFunding | null>(null);

  const [newFunding, setNewFunding] = useState<AddActivityFundingRequest>({
    fundingSource: '',
    fundingType: FundingType.SUBVENTION,
    requestedAmount: 0,
    currency: 'XOF',
    applicationDate: '',
    startDate: '',
    endDate: '',
    conditions: '',
    contractNumber: '',
  });

  // Mutations
  const addMutation = useMutation({
    mutationFn: (data: AddActivityFundingRequest) => activitiesApi.addFunding(activityId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity', activityId] });
      toast.success('Financement ajouté avec succès');
      setShowAddModal(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur lors de l'ajout du financement");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ fundingId, data }: { fundingId: string; data: UpdateActivityFundingRequest }) =>
      activitiesApi.updateFunding(activityId, fundingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity', activityId] });
      toast.success('Financement modifié avec succès');
      setShowEditModal(false);
      setSelectedFunding(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la modification');
    },
  });

  const removeMutation = useMutation({
    mutationFn: (fundingId: string) => activitiesApi.removeFunding(activityId, fundingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity', activityId] });
      toast.success('Financement retiré avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors du retrait');
    },
  });

  const resetForm = () => {
    setNewFunding({
      fundingSource: '',
      fundingType: FundingType.SUBVENTION,
      requestedAmount: 0,
      currency: 'XOF',
      applicationDate: '',
      startDate: '',
      endDate: '',
      conditions: '',
      contractNumber: '',
    });
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate(newFunding);
  };

  const handleEdit = (funding: ActivityFunding) => {
    setSelectedFunding(funding);
    setShowEditModal(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFunding) return;

    updateMutation.mutate({
      fundingId: selectedFunding.id,
      data: {
        fundingId: selectedFunding.id,
        status: selectedFunding.status,
        approvedAmount: selectedFunding.approvedAmount,
        receivedAmount: selectedFunding.receivedAmount,
        approvalDate: selectedFunding.approvalDate,
        conditions: selectedFunding.conditions,
      },
    });
  };

  const handleRemove = (fundingId: string) => {
    toast((t) => (
      <div>
        <p className="font-medium mb-2">Voulez-vous vraiment retirer ce financement ?</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              removeMutation.mutate(fundingId);
              toast.dismiss(t.id);
            }}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Confirmer
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Annuler
          </button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  // Calculer les totaux
  const totalRequested = fundings.reduce((sum, f) => sum + f.requestedAmount, 0);
  const totalApproved = fundings.reduce((sum, f) => sum + (f.approvedAmount || 0), 0);
  const totalReceived = fundings.reduce((sum, f) => sum + (f.receivedAmount || 0), 0);

  return (
    <div className="space-y-4">
      {/* En-tête avec statistiques */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-green-600" />
            Financements ({fundings.length})
          </h3>
          {fundings.length > 0 && (
            <div className="flex gap-4 mt-2 text-sm">
              <div className="flex items-center text-blue-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>Demandé: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: fundings[0]?.currency || 'XOF' }).format(totalRequested)}</span>
              </div>
              <div className="flex items-center text-green-600">
                <span>Approuvé: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: fundings[0]?.currency || 'XOF' }).format(totalApproved)}</span>
              </div>
              <div className="flex items-center text-purple-600">
                <span>Reçu: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: fundings[0]?.currency || 'XOF' }).format(totalReceived)}</span>
              </div>
            </div>
          )}
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un financement
        </Button>
      </div>

      {/* Liste des financements */}
      <div className="space-y-3">
        {fundings.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Aucun financement pour le moment</p>
          </div>
        ) : (
          fundings.map((funding) => (
            <div
              key={funding.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h4 className="font-medium text-gray-900">{funding.fundingSource}</h4>
                    <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {FundingTypeLabels[funding.fundingType]}
                    </span>
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${FundingStatusColors[funding.status]}`}>
                      {FundingStatusLabels[funding.status]}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mt-2">
                    <div>
                      <span className="font-medium">Montant demandé:</span>{' '}
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: funding.currency }).format(funding.requestedAmount)}
                    </div>
                    {funding.approvedAmount !== null && funding.approvedAmount !== undefined && (
                      <div>
                        <span className="font-medium">Montant approuvé:</span>{' '}
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: funding.currency }).format(funding.approvedAmount)}
                      </div>
                    )}
                    {funding.receivedAmount !== null && funding.receivedAmount !== undefined && (
                      <div>
                        <span className="font-medium">Montant reçu:</span>{' '}
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: funding.currency }).format(funding.receivedAmount)}
                      </div>
                    )}
                    {funding.contractNumber && (
                      <div>
                        <span className="font-medium">N° Contrat:</span> {funding.contractNumber}
                      </div>
                    )}
                  </div>

                  {(funding.startDate || funding.endDate) && (
                    <p className="text-sm text-gray-500 mt-2">
                      <span className="font-medium">Période:</span>{' '}
                      {funding.startDate ? new Date(funding.startDate).toLocaleDateString('fr-FR') : '?'}{' '}
                      →{' '}
                      {funding.endDate ? new Date(funding.endDate).toLocaleDateString('fr-FR') : 'En cours'}
                    </p>
                  )}

                  {funding.conditions && (
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="font-medium">Conditions:</span> {funding.conditions}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(funding)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRemove(funding.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Retirer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal d'ajout */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Ajouter un financement</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source de financement *
                </label>
                <input
                  type="text"
                  value={newFunding.fundingSource}
                  onChange={(e) => setNewFunding({ ...newFunding, fundingSource: e.target.value })}
                  required
                  placeholder="Ex: CORAF, BAD, USAID..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de financement *
                </label>
                <select
                  value={newFunding.fundingType}
                  onChange={(e) =>
                    setNewFunding({ ...newFunding, fundingType: e.target.value as FundingType })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {Object.entries(FundingTypeLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Montant demandé *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newFunding.requestedAmount}
                    onChange={(e) =>
                      setNewFunding({ ...newFunding, requestedAmount: parseFloat(e.target.value) })
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Devise</label>
                  <select
                    value={newFunding.currency}
                    onChange={(e) => setNewFunding({ ...newFunding, currency: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="XOF">XOF (Franc CFA)</option>
                    <option value="EUR">EUR (Euro)</option>
                    <option value="USD">USD (Dollar)</option>
                    <option value="GBP">GBP (Livre)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de contrat
                </label>
                <input
                  type="text"
                  value={newFunding.contractNumber || ''}
                  onChange={(e) =>
                    setNewFunding({ ...newFunding, contractNumber: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de demande
                  </label>
                  <input
                    type="date"
                    value={newFunding.applicationDate || ''}
                    onChange={(e) =>
                      setNewFunding({ ...newFunding, applicationDate: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={newFunding.startDate || ''}
                    onChange={(e) => setNewFunding({ ...newFunding, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={newFunding.endDate || ''}
                    onChange={(e) => setNewFunding({ ...newFunding, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Conditions</label>
                <textarea
                  value={newFunding.conditions || ''}
                  onChange={(e) => setNewFunding({ ...newFunding, conditions: e.target.value })}
                  rows={3}
                  placeholder="Conditions et modalités du financement..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={addMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {addMutation.isPending ? 'Ajout en cours...' : 'Ajouter'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de modification */}
      {showEditModal && selectedFunding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Modifier le financement</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedFunding(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">{selectedFunding.fundingSource}</p>
                <p className="text-sm text-gray-500">
                  {FundingTypeLabels[selectedFunding.fundingType]}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut *</label>
                <select
                  value={selectedFunding.status}
                  onChange={(e) =>
                    setSelectedFunding({
                      ...selectedFunding,
                      status: e.target.value as FundingStatus,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  {Object.entries(FundingStatusLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Montant approuvé
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={selectedFunding.approvedAmount || ''}
                    onChange={(e) =>
                      setSelectedFunding({
                        ...selectedFunding,
                        approvedAmount: parseFloat(e.target.value) || undefined,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Montant reçu
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={selectedFunding.receivedAmount || ''}
                    onChange={(e) =>
                      setSelectedFunding({
                        ...selectedFunding,
                        receivedAmount: parseFloat(e.target.value) || undefined,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date d'approbation
                </label>
                <input
                  type="date"
                  value={selectedFunding.approvalDate || ''}
                  onChange={(e) =>
                    setSelectedFunding({
                      ...selectedFunding,
                      approvalDate: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Conditions</label>
                <textarea
                  value={selectedFunding.conditions || ''}
                  onChange={(e) =>
                    setSelectedFunding({
                      ...selectedFunding,
                      conditions: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedFunding(null);
                  }}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {updateMutation.isPending ? 'Modification en cours...' : 'Modifier'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityFundingComponent;
