// src/components/admin/conventions/ConventionForm.tsx
import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import {
  Convention,
  CreateConventionRequest,
  UpdateConventionRequest,
  ConventionType,
  ConventionStatus,
  ConventionTypeLabels,
  ConventionStatusLabels,
} from '../../../types/convention.types';
import { Button } from '../../ui/Button';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../../../services/usersApi';

interface ConventionFormProps {
  convention?: Convention;
  onSubmit: (data: CreateConventionRequest | UpdateConventionRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConventionForm: React.FC<ConventionFormProps> = ({
  convention,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const isEditing = !!convention;

  // Fetch users for responsible user selection
  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.listUsers({ limit: 100 }),
  });

  const [formData, setFormData] = useState<CreateConventionRequest>({
    title: convention?.title || '',
    description: convention?.description || '',
    type: convention?.type || ConventionType.BILATERALE,
    status: convention?.status || ConventionStatus.EN_NEGOCIATION,
    contractNumber: convention?.contractNumber || '',
    signatureDate: convention?.signatureDate || '',
    startDate: convention?.startDate || '',
    endDate: convention?.endDate || '',
    totalBudget: convention?.totalBudget || 0,
    currency: convention?.currency || 'XOF',
    documentPath: convention?.documentPath || '',
    mainPartner: convention?.mainPartner || '',
    otherPartners: convention?.otherPartners || [],
    responsibleUserId: convention?.responsibleUser?.id || '',
  });

  const [newPartner, setNewPartner] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value ? parseFloat(value) : 0 }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddPartner = () => {
    if (newPartner.trim()) {
      setFormData((prev) => ({
        ...prev,
        otherPartners: [...(prev.otherPartners || []), newPartner.trim()],
      }));
      setNewPartner('');
    }
  };

  const handleRemovePartner = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      otherPartners: prev.otherPartners?.filter((_, i) => i !== index) || [],
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    }

    if (!formData.mainPartner.trim()) {
      newErrors.mainPartner = 'Le partenaire principal est requis';
    }

    if (!formData.responsibleUserId) {
      newErrors.responsibleUserId = 'Le responsable est requis';
    }

    if (formData.endDate && formData.startDate && formData.endDate < formData.startDate) {
      newErrors.endDate = 'La date de fin doit être postérieure à la date de début';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Modifier la convention' : 'Nouvelle convention'}
          </h2>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Section 1: Informations de base */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Informations de base
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Titre de la convention"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Description de la convention"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {Object.entries(ConventionTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {Object.entries(ConventionStatusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro de contrat
                </label>
                <input
                  type="text"
                  name="contractNumber"
                  value={formData.contractNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: CONV-2024-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de signature
                </label>
                <input
                  type="date"
                  name="signatureDate"
                  value={formData.signatureDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Période et budget */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Période et budget
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de début
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de fin
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.endDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget total
                </label>
                <input
                  type="number"
                  name="totalBudget"
                  value={formData.totalBudget}
                  onChange={handleNumberChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Devise</label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="XOF">XOF (Franc CFA)</option>
                  <option value="EUR">EUR (Euro)</option>
                  <option value="USD">USD (Dollar)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Partenaires */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Partenaires</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Partenaire principal <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="mainPartner"
                value={formData.mainPartner}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.mainPartner ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nom du partenaire principal"
              />
              {errors.mainPartner && (
                <p className="mt-1 text-sm text-red-600">{errors.mainPartner}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Autres partenaires
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPartner}
                  onChange={(e) => setNewPartner(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPartner())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Nom d'un partenaire"
                />
                <Button type="button" onClick={handleAddPartner} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter
                </Button>
              </div>

              {formData.otherPartners && formData.otherPartners.length > 0 && (
                <div className="mt-2 space-y-2">
                  {formData.otherPartners.map((partner, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md"
                    >
                      <span className="text-sm text-gray-700">{partner}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePartner(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Responsable */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Responsable</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Utilisateur responsable <span className="text-red-500">*</span>
              </label>
              <select
                name="responsibleUserId"
                value={formData.responsibleUserId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.responsibleUserId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Sélectionner un utilisateur</option>
                {usersData?.users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} ({user.email})
                  </option>
                ))}
              </select>
              {errors.responsibleUserId && (
                <p className="mt-1 text-sm text-red-600">{errors.responsibleUserId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chemin du document
              </label>
              <input
                type="text"
                name="documentPath"
                value={formData.documentPath}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="/uploads/conventions/..."
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 -mx-6 -mb-6">
            <Button variant="outline" onClick={onCancel} disabled={isLoading}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEditing ? 'Modification...' : 'Création...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? 'Modifier' : 'Créer'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
