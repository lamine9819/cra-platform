// src/components/admin/partners/PartnersTable.tsx
import React from 'react';
import { Edit2, Trash2, Eye, Mail, Phone, Globe, Building2 } from 'lucide-react';
import { Partner, PartnerTypeLabels } from '../../../types/partner.types';
import { Badge } from '../../ui/Badge';

interface PartnersTableProps {
  partners: Partner[];
  onView: (partner: Partner) => void;
  onEdit: (partner: Partner) => void;
  onDelete: (partner: Partner) => void;
  isLoading?: boolean;
}

export const PartnersTable: React.FC<PartnersTableProps> = ({
  partners,
  onView,
  onEdit,
  onDelete,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-2 text-sm text-gray-600">Chargement des partenaires...</p>
        </div>
      </div>
    );
  }

  if (partners.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun partenaire</h3>
          <p className="mt-1 text-sm text-gray-500">
            Commencez par créer un nouveau partenaire.
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
                Partenaire
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Catégorie
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expertises
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {partners.map((partner) => (
              <tr key={partner.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {partner.name}
                      </div>
                      {partner.website && (
                        <a
                          href={partner.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-green-600 hover:text-green-800 flex items-center gap-1 mt-1"
                        >
                          <Globe className="h-3 w-3" />
                          {partner.website.replace(/^https?:\/\//, '')}
                        </a>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant="primary" size="sm">
                    {PartnerTypeLabels[partner.type]}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {partner.category || '-'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 space-y-1">
                    {partner.contactPerson && (
                      <div className="font-medium">{partner.contactPerson}</div>
                    )}
                    {partner.email && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <Mail className="h-3 w-3" />
                        <span className="text-xs">{partner.email}</span>
                      </div>
                    )}
                    {partner.phone && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <Phone className="h-3 w-3" />
                        <span className="text-xs">{partner.phone}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {partner.expertise.slice(0, 2).map((exp, idx) => (
                      <Badge key={idx} variant="secondary" size="sm">
                        {exp}
                      </Badge>
                    ))}
                    {partner.expertise.length > 2 && (
                      <Badge variant="outline" size="sm">
                        +{partner.expertise.length - 2}
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onView(partner)}
                      className="text-gray-600 hover:text-gray-900 transition-colors p-1 rounded hover:bg-gray-100"
                      title="Voir les détails"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEdit(partner)}
                      className="text-green-600 hover:text-green-900 transition-colors p-1 rounded hover:bg-green-50"
                      title="Modifier"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(partner)}
                      className="text-red-600 hover:text-red-900 transition-colors p-1 rounded hover:bg-red-50"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
