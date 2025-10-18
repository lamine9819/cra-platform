// src/components/admin/conventions/ConventionsTable.tsx
import React from 'react';
import { Eye, Edit, Trash2, FileText } from 'lucide-react';
import { Convention, ConventionTypeLabels, ConventionStatusLabels } from '../../../types/convention.types';
import { Button } from '../../ui/Button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ConventionsTableProps {
  conventions: Convention[];
  onView: (convention: Convention) => void;
  onEdit: (convention: Convention) => void;
  onDelete: (convention: Convention) => void;
  isLoading?: boolean;
}

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    EN_NEGOCIATION: 'bg-yellow-100 text-yellow-800',
    SIGNEE: 'bg-blue-100 text-blue-800',
    EN_COURS: 'bg-green-100 text-green-800',
    CLOTUREE: 'bg-gray-100 text-gray-800',
    SUSPENDUE: 'bg-orange-100 text-orange-800',
    RESILIEE: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const ConventionsTable: React.FC<ConventionsTableProps> = ({
  conventions,
  onView,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  const formatDate = (date?: string) => {
    if (!date) return '-';
    return format(new Date(date), 'dd MMM yyyy', { locale: fr });
  };

  const formatBudget = (budget?: number, currency: string = 'XOF') => {
    if (!budget) return '-';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(budget);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-2 text-sm text-gray-600">Chargement des conventions...</p>
        </div>
      </div>
    );
  }

  if (conventions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune convention</h3>
          <p className="mt-1 text-sm text-gray-500">
            Commencez par créer une nouvelle convention.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Convention
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Partenaire principal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Budget
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Période
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Responsable
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {conventions.map((convention) => (
              <tr key={convention.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {convention.title}
                      </div>
                      {convention.contractNumber && (
                        <div className="text-xs text-gray-500">
                          {convention.contractNumber}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {ConventionTypeLabels[convention.type]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      convention.status
                    )}`}
                  >
                    {ConventionStatusLabels[convention.status]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{convention.mainPartner}</div>
                  {convention.otherPartners && convention.otherPartners.length > 0 && (
                    <div className="text-xs text-gray-500">
                      +{convention.otherPartners.length} autre
                      {convention.otherPartners.length > 1 ? 's' : ''}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formatBudget(convention.totalBudget, convention.currency)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatDate(convention.startDate)}
                  </div>
                  {convention.endDate && (
                    <div className="text-xs text-gray-500">
                      au {formatDate(convention.endDate)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {convention.responsibleUser.firstName} {convention.responsibleUser.lastName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {convention.responsibleUser.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onView(convention)}
                      title="Voir les détails"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(convention)}
                      title="Modifier"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(convention)}
                      title="Supprimer"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
