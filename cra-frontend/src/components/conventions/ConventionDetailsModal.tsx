// src/components/conventions/ConventionDetailsModal.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { conventionsApi } from '../../services/conventionsApi';
import Modal from '../ui/Modal';
import {
  FileText,
  Calendar,
  DollarSign,
  Users,
  Briefcase,
  Tag,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ConventionTypeLabels,
  ConventionStatusLabels,
  ConventionStatus,
} from '../../types/convention.types';

interface ConventionDetailsModalProps {
  conventionId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const ConventionDetailsModal: React.FC<ConventionDetailsModalProps> = ({
  conventionId,
  isOpen,
  onClose,
}) => {
  const { data: convention, isLoading, isError } = useQuery({
    queryKey: ['convention', conventionId],
    queryFn: () => conventionsApi.getConventionById(conventionId!),
    enabled: !!conventionId && isOpen,
  });

  const getStatusColor = (status: ConventionStatus) => {
    const colors = {
      EN_NEGOCIATION: 'bg-yellow-100 text-yellow-800',
      SIGNEE: 'bg-blue-100 text-blue-800',
      EN_COURS: 'bg-green-100 text-green-800',
      CLOTUREE: 'bg-gray-100 text-gray-800',
      SUSPENDUE: 'bg-orange-100 text-orange-800',
      RESILIEE: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: ConventionStatus) => {
    if (status === ConventionStatus.EN_COURS || status === ConventionStatus.SIGNEE) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
    if (status === ConventionStatus.RESILIEE || status === ConventionStatus.SUSPENDUE) {
      return <AlertCircle className="w-5 h-5 text-red-600" />;
    }
    return <FileText className="w-5 h-5 text-gray-600" />;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" title="Détails de la convention">
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          <span className="ml-3 text-gray-600">Chargement...</span>
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-red-600">Erreur lors du chargement de la convention</p>
        </div>
      )}

      {convention && (
        <div className="space-y-6">
          {/* En-tête avec titre et statut */}
          <div>
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-xl font-bold text-gray-900">{convention.title}</h3>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(convention.status)}`}>
                {ConventionStatusLabels[convention.status]}
              </span>
            </div>
            {convention.contractNumber && (
              <p className="text-sm text-gray-600">N° de contrat: {convention.contractNumber}</p>
            )}
          </div>

          {/* Description */}
          {convention.description && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Description</h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{convention.description}</p>
            </div>
          )}

          {/* Informations principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Tag className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Type de convention</p>
                <p className="text-sm text-gray-600">{ConventionTypeLabels[convention.type]}</p>
              </div>
            </div>

            {convention.signatureDate && (
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Date de signature</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(convention.signatureDate), 'dd MMMM yyyy', { locale: fr })}
                  </p>
                </div>
              </div>
            )}

            {(convention.startDate || convention.endDate) && (
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Période de validité</p>
                  <p className="text-sm text-gray-600">
                    {convention.startDate && format(new Date(convention.startDate), 'dd MMM yyyy', { locale: fr })}
                    {convention.startDate && convention.endDate && ' - '}
                    {convention.endDate && format(new Date(convention.endDate), 'dd MMM yyyy', { locale: fr })}
                  </p>
                </div>
              </div>
            )}

            {convention.totalBudget && (
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Budget total</p>
                  <p className="text-sm text-gray-600">
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: convention.currency || 'XOF'
                    }).format(convention.totalBudget)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Partenaires */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-gray-600" />
              Partenaires
            </h4>
            <div className="space-y-3">
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-700 mb-1">Partenaire principal</p>
                <p className="text-sm text-gray-900 font-medium">{convention.mainPartner}</p>
              </div>

              {convention.otherPartners && convention.otherPartners.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-700 mb-2">Autres partenaires</p>
                  <ul className="space-y-1">
                    {convention.otherPartners.map((partner, index) => (
                      <li key={index} className="text-sm text-gray-900 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                        {partner}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Responsable */}
          {convention.responsibleUser && (
            <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
              <Users className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Responsable de la convention</p>
                <p className="text-sm text-gray-900">
                  {convention.responsibleUser.firstName} {convention.responsibleUser.lastName}
                </p>
                <p className="text-xs text-gray-600">{convention.responsibleUser.email}</p>
              </div>
            </div>
          )}

          {/* Statistiques */}
          {convention._count && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Statistiques</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-blue-600">{convention._count.projects || 0}</p>
                  <p className="text-xs text-gray-600 mt-1">Projets</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-600">{convention._count.activities || 0}</p>
                  <p className="text-xs text-gray-600 mt-1">Activités</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {(convention._count.activityFundings || 0) + (convention._count.projectFundings || 0)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Financements</p>
                </div>
              </div>
            </div>
          )}

          {/* Document */}
          {convention.documentPath && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Document attaché</p>
              <a
                href={convention.documentPath}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-green-600 hover:text-green-700 flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Voir le document
              </a>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default ConventionDetailsModal;
