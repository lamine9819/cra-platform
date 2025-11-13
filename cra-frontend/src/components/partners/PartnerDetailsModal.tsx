// src/components/partners/PartnerDetailsModal.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { partnersApi } from '../../services/partnersApi';
import Modal from '../ui/Modal';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  User,
  Briefcase,
  Tag,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { PartnerTypeLabels } from '../../types/partner.types';

interface PartnerDetailsModalProps {
  partnerId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const PartnerDetailsModal: React.FC<PartnerDetailsModalProps> = ({
  partnerId,
  isOpen,
  onClose,
}) => {
  const { data: partner, isLoading, isError } = useQuery({
    queryKey: ['partner', partnerId],
    queryFn: () => partnersApi.getPartnerById(partnerId!),
    enabled: !!partnerId && isOpen,
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" title="Détails du partenaire">
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          <span className="ml-3 text-gray-600">Chargement...</span>
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-red-600">Erreur lors du chargement du partenaire</p>
        </div>
      )}

      {partner && (
        <div className="space-y-6">
          {/* En-tête */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{partner.name}</h3>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                {PartnerTypeLabels[partner.type]}
              </span>
              {partner.category && (
                <span className="px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-800">
                  {partner.category}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {partner.description && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Description</h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{partner.description}</p>
            </div>
          )}

          {/* Coordonnées */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-gray-600" />
              Coordonnées
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {partner.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-700">Adresse</p>
                    <p className="text-sm text-gray-600">{partner.address}</p>
                  </div>
                </div>
              )}

              {partner.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-700">Téléphone</p>
                    <p className="text-sm text-gray-600">{partner.phone}</p>
                  </div>
                </div>
              )}

              {partner.email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-700">Email</p>
                    <a
                      href={`mailto:${partner.email}`}
                      className="text-sm text-green-600 hover:text-green-700"
                    >
                      {partner.email}
                    </a>
                  </div>
                </div>
              )}

              {partner.website && (
                <div className="flex items-start gap-3">
                  <Globe className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-700">Site web</p>
                    <a
                      href={partner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-green-600 hover:text-green-700"
                    >
                      {partner.website}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Personne de contact */}
          {(partner.contactPerson || partner.contactEmail || partner.contactPhone) && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <User className="w-5 h-5 text-gray-600" />
                Personne de contact
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                {partner.contactPerson && (
                  <div>
                    <p className="text-sm font-medium text-gray-900">{partner.contactPerson}</p>
                    {partner.contactTitle && (
                      <p className="text-xs text-gray-600">{partner.contactTitle}</p>
                    )}
                  </div>
                )}
                {partner.contactEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <a
                      href={`mailto:${partner.contactEmail}`}
                      className="text-sm text-green-600 hover:text-green-700"
                    >
                      {partner.contactEmail}
                    </a>
                  </div>
                )}
                {partner.contactPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-600">{partner.contactPhone}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Expertises */}
          {partner.expertise && partner.expertise.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-gray-600" />
                Domaines d'expertise
              </h4>
              <div className="flex flex-wrap gap-2">
                {partner.expertise.map((exp, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {exp}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Services */}
          {partner.services && partner.services.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Tag className="w-5 h-5 text-gray-600" />
                Services offerts
              </h4>
              <div className="flex flex-wrap gap-2">
                {partner.services.map((service, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default PartnerDetailsModal;
