// src/components/projects/ProjectFunding.tsx
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, DollarSign, X, Info, Eye, Edit, Trash2, Upload, FileText } from 'lucide-react';
import { projectsApi } from '../../services/projectsApi';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';
import {
  FundingType,
  FundingTypeLabels,
  FundingStatus,
  FundingStatusLabels,
  FundingStatusColors,
  type ProjectFunding as Funding,
  type AddFundingRequest,
  type UpdateFundingRequest
} from '../../types/project.types';
import { documentService } from '../../services/api/documentService';

interface ProjectFundingProps {
  projectId: string;
  fundings?: Funding[];
  canManage?: boolean;
}

// Suggestions de sources de financement courantes
const COMMON_FUNDING_SOURCES = [
  'Budget National',
  'Fonds Compétitif',
  'Partenaire International',
  'Banque Mondiale',
  'Union Européenne',
  'AFD (Agence Française de Développement)',
  'BAD (Banque Africaine de Développement)',
  'USAID',
  'Fondation Privée',
  'Entreprise Privée',
  'ONG Internationale',
  'Coopération Bilatérale',
  'Autre'
];

const ProjectFunding: React.FC<ProjectFundingProps> = ({ projectId, fundings = [], canManage = false }) => {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedFunding, setSelectedFunding] = useState<Funding | null>(null);
  const [customSource, setCustomSource] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [newFunding, setNewFunding] = useState<AddFundingRequest>({
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
  const [editingFunding, setEditingFunding] = useState<UpdateFundingRequest>({
    fundingId: '',
    status: undefined,
    approvedAmount: undefined,
    receivedAmount: undefined,
    approvalDate: '',
    conditions: '',
    notes: '',
  });

  const addMutation = useMutation({
    mutationFn: (data: AddFundingRequest) => projectsApi.addFunding(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast.success('Financement ajouté avec succès');
      setShowAddModal(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de l\'ajout');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateFundingRequest) => projectsApi.updateFunding(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast.success('Financement modifié avec succès');
      setShowEditModal(false);
      resetEditForm();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la modification');
    },
  });

  const removeMutation = useMutation({
    mutationFn: (fundingId: string) => projectsApi.removeFunding(projectId, fundingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
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
    setCustomSource('');
    setShowCustomInput(false);
    setUploadFile(null);
  };

  const resetEditForm = () => {
    setEditingFunding({
      fundingId: '',
      status: undefined,
      approvedAmount: undefined,
      receivedAmount: undefined,
      approvalDate: '',
      conditions: '',
      notes: '',
    });
  };

  const handleSourceChange = (value: string) => {
    if (value === 'Autre') {
      setShowCustomInput(true);
      setNewFunding({ ...newFunding, fundingSource: '' });
    } else {
      setShowCustomInput(false);
      setNewFunding({ ...newFunding, fundingSource: value });
    }
  };

  const handleAdd = async () => {
    const finalSource = showCustomInput ? customSource : newFunding.fundingSource;

    if (!finalSource || newFunding.requestedAmount <= 0) {
      toast.error('Veuillez remplir la source de financement et le montant demandé');
      return;
    }

    try {
      setIsUploading(true);

      // Si un fichier est sélectionné, l'uploader d'abord
      if (uploadFile) {
        toast.loading('Upload du document en cours...');
        await documentService.uploadDocument(uploadFile, {
          title: `Document de financement - ${finalSource}`,
          type: 'CONTRAT',
          projectId: projectId,
          isPublic: false,
        });
        toast.dismiss();
      }

      // Ensuite créer le financement
      addMutation.mutate({
        ...newFunding,
        fundingSource: finalSource,
      });
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'upload du document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (funding: Funding) => {
    setEditingFunding({
      fundingId: funding.id,
      status: funding.status,
      approvedAmount: funding.approvedAmount || undefined,
      receivedAmount: funding.receivedAmount || undefined,
      approvalDate: funding.approvalDate ? funding.approvalDate.split('T')[0] : '',
      conditions: funding.conditions || '',
      notes: funding.notes || '',
    });
    setShowEditModal(true);
  };

  const handleUpdate = () => {
    if (!editingFunding.fundingId) {
      toast.error('Erreur: financement non identifié');
      return;
    }
    updateMutation.mutate(editingFunding);
  };

  const handleViewDetails = (funding: Funding) => {
    setSelectedFunding(funding);
    setShowDetailsModal(true);
  };

  const handleRemove = (fundingId: string, fundingSource: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir retirer le financement "${fundingSource}" ?`)) {
      removeMutation.mutate(fundingId);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: currency || 'XOF' }).format(amount);
  };

  const totalRequested = fundings.reduce((sum, f) => sum + f.requestedAmount, 0);
  const totalApproved = fundings.reduce((sum, f) => sum + (f.approvedAmount || 0), 0);
  const totalReceived = fundings.reduce((sum, f) => sum + (f.receivedAmount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Financements ({fundings.length})</h3>
        {canManage && (
          <Button onClick={() => setShowAddModal(true)} className="bg-green-600 hover:bg-green-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un financement
          </Button>
        )}
      </div>

      {/* Résumé financier */}
      {fundings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-600 font-medium">Montant demandé</p>
            <p className="text-2xl font-bold text-blue-900">{formatAmount(totalRequested, 'XOF')}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-600 font-medium">Montant approuvé</p>
            <p className="text-2xl font-bold text-green-900">{formatAmount(totalApproved, 'XOF')}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-purple-600 font-medium">Montant reçu</p>
            <p className="text-2xl font-bold text-purple-900">{formatAmount(totalReceived, 'XOF')}</p>
          </div>
        </div>
      )}

      {fundings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Aucun financement pour le moment</p>
        </div>
      ) : (
        <div className="space-y-4">
          {fundings.map((funding) => (
            <div key={funding.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900">{funding.fundingSource}</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {FundingTypeLabels[funding.fundingType]}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${FundingStatusColors[funding.status]}`}>
                      {FundingStatusLabels[funding.status]}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewDetails(funding)}
                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                    title="Voir les détails"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {canManage && (
                    <>
                      <button
                        onClick={() => handleEdit(funding)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Modifier le financement"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemove(funding.id, funding.fundingSource)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Retirer le financement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Montant demandé</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatAmount(funding.requestedAmount, funding.currency)}
                  </p>
                </div>
                {funding.approvedAmount && (
                  <div>
                    <p className="text-sm text-gray-600">Montant approuvé</p>
                    <p className="text-lg font-semibold text-green-600">
                      {formatAmount(funding.approvedAmount, funding.currency)}
                    </p>
                  </div>
                )}
                {funding.receivedAmount && (
                  <div>
                    <p className="text-sm text-gray-600">Montant reçu</p>
                    <p className="text-lg font-semibold text-purple-600">
                      {formatAmount(funding.receivedAmount, funding.currency)}
                    </p>
                  </div>
                )}
              </div>

              {funding.contractNumber && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600">Numéro de contrat: <span className="font-medium text-gray-900">{funding.contractNumber}</span></p>
                </div>
              )}

              {funding.conditions && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium text-gray-700">Conditions :</p>
                  <p className="text-sm text-gray-600 mt-1">{funding.conditions}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Ajouter un financement</h3>
              <button onClick={() => { setShowAddModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Info box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                  Enregistrez les informations sur les sources de financement de votre projet.
                  Vous pourrez mettre à jour les montants approuvés et reçus ultérieurement.
                </p>
              </div>

              {/* Source de financement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source de financement <span className="text-red-500">*</span>
                </label>

                {!showCustomInput ? (
                  <select
                    value={newFunding.fundingSource}
                    onChange={(e) => handleSourceChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Sélectionnez une source</option>
                    {COMMON_FUNDING_SOURCES.map((source) => (
                      <option key={source} value={source}>{source}</option>
                    ))}
                  </select>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={customSource}
                      onChange={(e) => setCustomSource(e.target.value)}
                      placeholder="Entrez le nom de la source de financement..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomInput(false);
                        setCustomSource('');
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      ← Retour à la liste
                    </button>
                  </div>
                )}
              </div>

              {/* Type de financement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de financement <span className="text-red-500">*</span>
                </label>
                <select
                  value={newFunding.fundingType}
                  onChange={(e) => setNewFunding({ ...newFunding, fundingType: e.target.value as FundingType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                >
                  {Object.entries(FundingTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Montant et devise */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Montant demandé <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={newFunding.requestedAmount || ''}
                    onChange={(e) => setNewFunding({ ...newFunding, requestedAmount: Number(e.target.value) })}
                    min="0"
                    step="1000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Devise</label>
                  <select
                    value={newFunding.currency}
                    onChange={(e) => setNewFunding({ ...newFunding, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  >
                    <option value="XOF">XOF (Franc CFA)</option>
                    <option value="EUR">EUR (Euro)</option>
                    <option value="USD">USD (Dollar)</option>
                  </select>
                </div>
              </div>

              {/* Numéro de contrat */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de contrat / Référence</label>
                <input
                  type="text"
                  value={newFunding.contractNumber}
                  onChange={(e) => setNewFunding({ ...newFunding, contractNumber: e.target.value })}
                  placeholder="Ex: CTR-2024-001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de demande</label>
                  <input
                    type="date"
                    value={newFunding.applicationDate}
                    onChange={(e) => setNewFunding({ ...newFunding, applicationDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                  <input
                    type="date"
                    value={newFunding.startDate}
                    onChange={(e) => setNewFunding({ ...newFunding, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                  <input
                    type="date"
                    value={newFunding.endDate}
                    onChange={(e) => setNewFunding({ ...newFunding, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Conditions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Conditions et modalités</label>
                <textarea
                  value={newFunding.conditions}
                  onChange={(e) => setNewFunding({ ...newFunding, conditions: e.target.value })}
                  rows={4}
                  placeholder="Décrivez les conditions du financement, les modalités de versement, les obligations, etc..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Upload de document */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document joint (optionnel)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-green-500 transition-colors">
                  <div className="flex flex-col items-center">
                    {uploadFile ? (
                      <div className="flex items-center gap-3 w-full">
                        <FileText className="w-8 h-8 text-green-600" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{uploadFile.name}</p>
                          <p className="text-xs text-gray-500">{(uploadFile.size / 1024).toFixed(2)} KB</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setUploadFile(null)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-10 h-10 text-gray-400 mb-3" />
                        <label className="cursor-pointer">
                          <span className="text-sm text-green-600 hover:text-green-700 font-medium">
                            Cliquez pour sélectionner un fichier
                          </span>
                          <input
                            type="file"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) setUploadFile(file);
                            }}
                            className="hidden"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-2">
                          PDF, Word, Image (max 10MB)
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
              <Button variant="outline" onClick={() => { setShowAddModal(false); resetForm(); }}>Annuler</Button>
              <Button
                onClick={handleAdd}
                disabled={addMutation.isPending || isUploading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isUploading ? 'Upload en cours...' : addMutation.isPending ? 'Ajout...' : 'Ajouter'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de modification */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Modifier le financement</h3>
              <button onClick={() => { setShowEditModal(false); resetEditForm(); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select
                  value={editingFunding.status || ''}
                  onChange={(e) => setEditingFunding({ ...editingFunding, status: e.target.value as FundingStatus })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                >
                  {Object.entries(FundingStatusLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Montant approuvé</label>
                  <input
                    type="number"
                    value={editingFunding.approvedAmount || ''}
                    onChange={(e) => setEditingFunding({ ...editingFunding, approvedAmount: Number(e.target.value) })}
                    min="0"
                    step="1000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Montant reçu</label>
                  <input
                    type="number"
                    value={editingFunding.receivedAmount || ''}
                    onChange={(e) => setEditingFunding({ ...editingFunding, receivedAmount: Number(e.target.value) })}
                    min="0"
                    step="1000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date d'approbation</label>
                <input
                  type="date"
                  value={editingFunding.approvalDate}
                  onChange={(e) => setEditingFunding({ ...editingFunding, approvalDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Conditions</label>
                <textarea
                  value={editingFunding.conditions}
                  onChange={(e) => setEditingFunding({ ...editingFunding, conditions: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={editingFunding.notes}
                  onChange={(e) => setEditingFunding({ ...editingFunding, notes: e.target.value })}
                  rows={3}
                  placeholder="Notes internes sur le financement..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
              <Button variant="outline" onClick={() => { setShowEditModal(false); resetEditForm(); }}>Annuler</Button>
              <Button
                onClick={handleUpdate}
                disabled={updateMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {updateMutation.isPending ? 'Modification...' : 'Modifier'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal des détails */}
      {showDetailsModal && selectedFunding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Détails du financement</h3>
              <button onClick={() => { setShowDetailsModal(false); setSelectedFunding(null); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">{selectedFunding.fundingSource}</h4>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                    {FundingTypeLabels[selectedFunding.fundingType]}
                  </span>
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${FundingStatusColors[selectedFunding.status]}`}>
                    {FundingStatusLabels[selectedFunding.status]}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Montant demandé</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatAmount(selectedFunding.requestedAmount, selectedFunding.currency)}
                  </p>
                </div>
                {selectedFunding.approvedAmount && (
                  <div>
                    <p className="text-sm text-gray-600">Montant approuvé</p>
                    <p className="text-lg font-semibold text-green-600">
                      {formatAmount(selectedFunding.approvedAmount, selectedFunding.currency)}
                    </p>
                  </div>
                )}
                {selectedFunding.receivedAmount && (
                  <div>
                    <p className="text-sm text-gray-600">Montant reçu</p>
                    <p className="text-lg font-semibold text-purple-600">
                      {formatAmount(selectedFunding.receivedAmount, selectedFunding.currency)}
                    </p>
                  </div>
                )}
              </div>

              {selectedFunding.contractNumber && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Numéro de contrat</p>
                  <p className="text-sm text-gray-900">{selectedFunding.contractNumber}</p>
                </div>
              )}

              {selectedFunding.conditions && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Conditions</p>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{selectedFunding.conditions}</p>
                </div>
              )}

              {selectedFunding.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Notes</p>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{selectedFunding.notes}</p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end border-t">
              <Button variant="outline" onClick={() => { setShowDetailsModal(false); setSelectedFunding(null); }}>Fermer</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectFunding;
