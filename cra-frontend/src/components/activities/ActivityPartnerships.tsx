// src/components/activities/ActivityPartnerships.tsx
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, X, Handshake, Eye, Upload, FileText } from 'lucide-react';
import { activitiesApi } from '../../services/activitiesApi';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';
import {
  type ActivityPartnership,
  type AddActivityPartnershipRequest,
  type UpdateActivityPartnershipRequest,
  PartnerType,
  PartnerTypeLabels,
} from '../../types/activity.types';
import { documentService } from '../../services/api/documentService';

interface ActivityPartnershipsProps {
  activityId: string;
  partnerships: ActivityPartnership[];
  canManage?: boolean;
}

const ActivityPartnerships: React.FC<ActivityPartnershipsProps> = ({
  activityId,
  partnerships,
  canManage = false,
}) => {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPartnership, setSelectedPartnership] = useState<ActivityPartnership | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [newPartnership, setNewPartnership] = useState<AddActivityPartnershipRequest>({
    partnerName: '',
    partnerType: PartnerType.ASSOCIATION,
    contactPerson: '',
    contactEmail: '',
    contribution: '',
    startDate: '',
    endDate: '',
  });

  // Mutations
  const addMutation = useMutation({
    mutationFn: (data: AddActivityPartnershipRequest) =>
      activitiesApi.addPartnership(activityId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity', activityId] });
      toast.success('Partenariat ajouté avec succès');
      setShowAddModal(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur lors de l'ajout du partenariat");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ partnershipId, data }: { partnershipId: string; data: UpdateActivityPartnershipRequest }) =>
      activitiesApi.updatePartnership(activityId, partnershipId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity', activityId] });
      toast.success('Partenariat modifié avec succès');
      setShowEditModal(false);
      setSelectedPartnership(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la modification');
    },
  });

  const removeMutation = useMutation({
    mutationFn: (partnershipId: string) =>
      activitiesApi.removePartnership(activityId, partnershipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity', activityId] });
      toast.success('Partenariat retiré avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors du retrait');
    },
  });

  const resetForm = () => {
    setNewPartnership({
      partnerName: '',
      partnerType: PartnerType.ASSOCIATION,
      contactPerson: '',
      contactEmail: '',
      contribution: '',
      startDate: '',
      endDate: '',
    });
    setUploadFile(null);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsUploading(true);

      // Si un fichier est sélectionné, l'uploader d'abord
      if (uploadFile) {
        toast.loading('Upload du document en cours...');
        await documentService.uploadDocument(uploadFile, {
          title: `Document de partenariat - ${newPartnership.partnerName}`,
          type: 'CONTRAT' as import('../../types/document.types').DocumentType,
          activityId: activityId,
          isPublic: false,
        });
        toast.dismiss();
      }

      // Ensuite créer le partenariat
      addMutation.mutate(newPartnership);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'upload du document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (partnership: ActivityPartnership) => {
    setSelectedPartnership(partnership);
    setShowEditModal(true);
  };

  const handleViewDetails = (partnership: ActivityPartnership) => {
    setSelectedPartnership(partnership);
    setShowDetailsModal(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartnership) return;

    updateMutation.mutate({
      partnershipId: selectedPartnership.id,
      data: {
        partnerId: selectedPartnership.id,
        contactPerson: selectedPartnership.contactPerson,
        contactEmail: selectedPartnership.contactEmail,
        contribution: selectedPartnership.contribution,
        endDate: selectedPartnership.endDate,
        isActive: selectedPartnership.isActive,
      },
    });
  };

  const handleRemove = (partnershipId: string) => {
    toast((t) => (
      <div>
        <p className="font-medium mb-2">Voulez-vous vraiment retirer ce partenariat ?</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              removeMutation.mutate(partnershipId);
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

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Handshake className="w-5 h-5 mr-2 text-green-600" />
          Partenariats ({partnerships.length})
        </h3>
        {canManage && (
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un partenariat
          </Button>
        )}
      </div>

      {/* Liste des partenariats */}
      <div className="space-y-3">
        {partnerships.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <Handshake className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Aucun partenariat pour le moment</p>
          </div>
        ) : (
          partnerships.map((partnership) => (
            <div
              key={partnership.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h4 className="font-medium text-gray-900">{partnership.partnerName || partnership.partner?.name}</h4>
                    <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {PartnerTypeLabels[partnership.partnerType as PartnerType] || partnership.partnerType}
                    </span>
                    {!partnership.isActive && (
                      <span className="ml-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                        Inactif
                      </span>
                    )}
                  </div>
                  {partnership.contactPerson && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Contact:</span> {partnership.contactPerson}
                    </p>
                  )}
                  {partnership.contactEmail && (
                    <p className="text-sm text-gray-600">{partnership.contactEmail}</p>
                  )}
                  {partnership.contribution && (
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="font-medium">Contribution:</span> {partnership.contribution}
                    </p>
                  )}
                  {(partnership.startDate || partnership.endDate) && (
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Période:</span>{' '}
                      {partnership.startDate
                        ? new Date(partnership.startDate).toLocaleDateString('fr-FR')
                        : '?'}{' '}
                      →{' '}
                      {partnership.endDate
                        ? new Date(partnership.endDate).toLocaleDateString('fr-FR')
                        : 'En cours'}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleViewDetails(partnership)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                    title="Voir les détails"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {canManage && (
                    <>
                      <button
                        onClick={() => handleEdit(partnership)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemove(partnership.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Retirer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
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
              <h3 className="text-lg font-semibold text-gray-900">Ajouter un partenariat</h3>
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
                  Nom du partenaire *
                </label>
                <input
                  type="text"
                  value={newPartnership.partnerName}
                  onChange={(e) =>
                    setNewPartnership({ ...newPartnership, partnerName: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de partenaire *
                </label>
                <select
                  value={newPartnership.partnerType}
                  onChange={(e) =>
                    setNewPartnership({ ...newPartnership, partnerType: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {Object.entries(PartnerTypeLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Personne de contact
                </label>
                <input
                  type="text"
                  value={newPartnership.contactPerson || ''}
                  onChange={(e) =>
                    setNewPartnership({ ...newPartnership, contactPerson: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email de contact
                </label>
                <input
                  type="email"
                  value={newPartnership.contactEmail || ''}
                  onChange={(e) =>
                    setNewPartnership({ ...newPartnership, contactEmail: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contribution du partenaire
                </label>
                <textarea
                  value={newPartnership.contribution || ''}
                  onChange={(e) =>
                    setNewPartnership({ ...newPartnership, contribution: e.target.value })
                  }
                  rows={3}
                  placeholder="Décrivez la contribution du partenaire..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={newPartnership.startDate || ''}
                    onChange={(e) =>
                      setNewPartnership({ ...newPartnership, startDate: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={newPartnership.endDate || ''}
                    onChange={(e) =>
                      setNewPartnership({ ...newPartnership, endDate: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  disabled={addMutation.isPending || isUploading}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={addMutation.isPending || isUploading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isUploading ? 'Upload en cours...' : addMutation.isPending ? 'Ajout en cours...' : 'Ajouter'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de modification */}
      {showEditModal && selectedPartnership && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Modifier le partenariat</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedPartnership(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">{selectedPartnership.partnerName || selectedPartnership.partner?.name}</p>
                <p className="text-sm text-gray-500">{PartnerTypeLabels[selectedPartnership.partnerType as PartnerType] || selectedPartnership.partnerType}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Personne de contact
                </label>
                <input
                  type="text"
                  value={selectedPartnership.contactPerson || ''}
                  onChange={(e) =>
                    setSelectedPartnership({
                      ...selectedPartnership,
                      contactPerson: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email de contact
                </label>
                <input
                  type="email"
                  value={selectedPartnership.contactEmail || ''}
                  onChange={(e) =>
                    setSelectedPartnership({
                      ...selectedPartnership,
                      contactEmail: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contribution du partenaire
                </label>
                <textarea
                  value={selectedPartnership.contribution || ''}
                  onChange={(e) =>
                    setSelectedPartnership({
                      ...selectedPartnership,
                      contribution: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date de fin</label>
                <input
                  type="date"
                  value={selectedPartnership.endDate || ''}
                  onChange={(e) =>
                    setSelectedPartnership({
                      ...selectedPartnership,
                      endDate: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={selectedPartnership.isActive}
                  onChange={(e) =>
                    setSelectedPartnership({
                      ...selectedPartnership,
                      isActive: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                  Partenariat actif
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedPartnership(null);
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

      {/* Modal de détails */}
      {showDetailsModal && selectedPartnership && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-green-50">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Handshake className="w-5 h-5 mr-2 text-green-600" />
                Détails du Partenariat
              </h3>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedPartnership(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Informations principales */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Informations du partenaire</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Nom du partenaire:</span>
                    <span className="text-sm text-gray-900 font-semibold">
                      {selectedPartnership.partnerName || selectedPartnership.partner?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Type:</span>
                    <span className="text-sm">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {PartnerTypeLabels[selectedPartnership.partnerType as PartnerType] || selectedPartnership.partnerType}
                      </span>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Statut:</span>
                    <span className="text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedPartnership.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedPartnership.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Informations de contact */}
              {(selectedPartnership.contactPerson || selectedPartnership.contactEmail) && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Contact</h4>
                  <div className="space-y-2">
                    {selectedPartnership.contactPerson && (
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Personne de contact:</span>
                        <span className="text-sm text-gray-900">{selectedPartnership.contactPerson}</span>
                      </div>
                    )}
                    {selectedPartnership.contactEmail && (
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Email:</span>
                        <a
                          href={`mailto:${selectedPartnership.contactEmail}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {selectedPartnership.contactEmail}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Période de collaboration */}
              {(selectedPartnership.startDate || selectedPartnership.endDate) && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Période de collaboration</h4>
                  <div className="space-y-2">
                    {selectedPartnership.startDate && (
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Date de début:</span>
                        <span className="text-sm text-gray-900">
                          {new Date(selectedPartnership.startDate).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                    {selectedPartnership.endDate && (
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Date de fin:</span>
                        <span className="text-sm text-gray-900">
                          {new Date(selectedPartnership.endDate).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Contribution */}
              {selectedPartnership.contribution && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Contribution du partenaire</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedPartnership.contribution}</p>
                </div>
              )}

              {/* Bénéfices */}
              {selectedPartnership.benefits && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Bénéfices attendus</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedPartnership.benefits}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedPartnership(null);
                }}
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityPartnerships;
