// src/components/admin/partners/PartnerForm.tsx
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Partner, PartnerType, PartnerTypeLabels, CreatePartnerRequest, UpdatePartnerRequest } from '../../../types/partner.types';
import { Button } from '../../ui/Button';

interface PartnerFormProps {
  partner?: Partner;
  onSubmit: (data: CreatePartnerRequest | UpdatePartnerRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const PartnerForm: React.FC<PartnerFormProps> = ({
  partner,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<CreatePartnerRequest>({
    name: '',
    type: PartnerType.UNIVERSITE,
    category: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    contactPerson: '',
    contactTitle: '',
    contactEmail: '',
    contactPhone: '',
    expertise: [],
    services: []
  });

  const [expertiseInput, setExpertiseInput] = useState('');
  const [serviceInput, setServiceInput] = useState('');

  useEffect(() => {
    if (partner) {
      setFormData({
        name: partner.name,
        type: partner.type,
        category: partner.category || '',
        description: partner.description || '',
        address: partner.address || '',
        phone: partner.phone || '',
        email: partner.email || '',
        website: partner.website || '',
        contactPerson: partner.contactPerson || '',
        contactTitle: partner.contactTitle || '',
        contactEmail: partner.contactEmail || '',
        contactPhone: partner.contactPhone || '',
        expertise: partner.expertise || [],
        services: partner.services || []
      });
    }
  }, [partner]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addExpertise = () => {
    if (expertiseInput.trim() && !formData.expertise?.includes(expertiseInput.trim())) {
      setFormData(prev => ({
        ...prev,
        expertise: [...(prev.expertise || []), expertiseInput.trim()]
      }));
      setExpertiseInput('');
    }
  };

  const removeExpertise = (index: number) => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise?.filter((_, i) => i !== index) || []
    }));
  };

  const addService = () => {
    if (serviceInput.trim() && !formData.services?.includes(serviceInput.trim())) {
      setFormData(prev => ({
        ...prev,
        services: [...(prev.services || []), serviceInput.trim()]
      }));
      setServiceInput('');
    }
  };

  const removeService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h3 className="text-xl font-semibold text-gray-900">
            {partner ? 'Modifier le partenaire' : 'Nouveau partenaire'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="px-6 py-4 space-y-6">
            {/* Informations de base */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Informations de base</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du partenaire <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Nom de l'organisation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {Object.entries(PartnerTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catégorie
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ex: National, International, Public, Privé..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Description du partenaire et de ses activités"
                  />
                </div>
              </div>
            </div>

            {/* Coordonnées */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Coordonnées</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Adresse complète"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="+229 XX XX XX XX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="contact@organisation.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Site web
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="https://www.organisation.com"
                  />
                </div>
              </div>
            </div>

            {/* Personne de contact */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Personne de contact</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Prénom Nom"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fonction
                  </label>
                  <input
                    type="text"
                    name="contactTitle"
                    value={formData.contactTitle}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ex: Directeur, Responsable partenariats..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="email@organisation.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="+229 XX XX XX XX"
                  />
                </div>
              </div>
            </div>

            {/* Domaines d'expertise */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Domaines d'expertise</h4>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={expertiseInput}
                    onChange={(e) => setExpertiseInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExpertise())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ajouter un domaine d'expertise"
                  />
                  <Button
                    type="button"
                    onClick={addExpertise}
                    variant="outline"
                    size="md"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.expertise && formData.expertise.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.expertise.map((exp, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                      >
                        <span>{exp}</span>
                        <button
                          type="button"
                          onClick={() => removeExpertise(index)}
                          className="hover:text-green-900"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Services offerts */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Services offerts</h4>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={serviceInput}
                    onChange={(e) => setServiceInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ajouter un service"
                  />
                  <Button
                    type="button"
                    onClick={addService}
                    variant="outline"
                    size="md"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.services && formData.services.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.services.map((service, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        <span>{service}</span>
                        <button
                          type="button"
                          onClick={() => removeService(index)}
                          className="hover:text-blue-900"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Enregistrement...' : partner ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
