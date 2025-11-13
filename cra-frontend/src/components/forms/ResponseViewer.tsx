// src/components/forms/ResponseViewer.tsx - Composant pour visualiser les réponses
import React, { useState } from 'react';
import { Eye, Download,  Search, Calendar, User, MessageSquare } from 'lucide-react';
import { Form, FormResponse, FormField } from '../../services/formsApi';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';
import Pagination from '../ui/Pagination';

interface ResponseViewerProps {
  form: Form;
  responses: FormResponse[];
  pagination: {
    page: number;
    totalPages: number;
    total: number;
  };
  loading?: boolean;
  onPageChange: (page: number) => void;
  onExport?: () => void;
  onFilter?: (filters: any) => void;
}

const ResponseViewer: React.FC<ResponseViewerProps> = ({
  form,
  responses,
  pagination,
  loading = false,
  onPageChange,
  onExport,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filtrage des réponses
  const filteredResponses = responses.filter(response => {
    const matchesSearch = searchTerm === '' || 
      `${response.respondent.firstName} ${response.respondent.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      response.respondent.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === 'all' || response.respondent.role === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  // Obtenir les rôles uniques des répondants
  const uniqueRoles = Array.from(new Set(responses.map(r => r.respondent.role)));

  // Formater une valeur de réponse pour l'affichage
  const formatResponseValue = (field: FormField, value: any): string => {
    if (value === null || value === undefined || value === '') {
      return 'Non renseigné';
    }

    switch (field.type) {
      case 'checkbox':
        if (Array.isArray(value)) {
          return value.join(', ');
        }
        return String(value);
        
      case 'select':
      case 'radio':
        // Essayer de trouver le label correspondant
        const option = field.options?.find(opt => opt.value === value);
        return option ? option.label : String(value);
        
      case 'date':
        return new Date(value).toLocaleDateString('fr-FR');
        
      case 'file':
        return value ? 'Fichier téléchargé' : 'Aucun fichier';
        
      default:
        return String(value);
    }
  };

  // Rendu en mode grille (cartes)
  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredResponses.map((response) => (
        <Card key={response.id} className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">
                {response.respondent.firstName} {response.respondent.lastName}
              </h3>
              <p className="text-sm text-gray-600">{response.respondent.email}</p>
            </div>
            <div className="text-right">
              <Badge variant="secondary">{response.respondent.role}</Badge>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(response.submittedAt).toLocaleString('fr-FR')}
              </p>
            </div>
          </div>

          {/* Aperçu des réponses principales */}
          <div className="space-y-2 mb-4">
            {form.schema.fields.slice(0, 3).map((field) => {
              const value = response.data[field.id];
              return (
                <div key={field.id}>
                  <span className="text-xs font-medium text-gray-600">
                    {field.label}:
                  </span>
                  <p className="text-sm text-gray-900 truncate">
                    {formatResponseValue(field, value)}
                  </p>
                </div>
              );
            })}
            {form.schema.fields.length > 3 && (
              <p className="text-xs text-gray-500">
                +{form.schema.fields.length - 3} autres champs...
              </p>
            )}
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setSelectedResponse(response)}
            className="w-full"
          >
            <Eye className="h-4 w-4 mr-2" />
            Voir les détails
          </Button>
        </Card>
      ))}
    </div>
  );

  // Rendu en mode tableau
  const renderTableView = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Répondant
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rôle
            </th>
            {form.schema.fields.slice(0, 3).map((field) => (
              <th key={field.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {field.label}
              </th>
            ))}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredResponses.map((response) => (
            <tr key={response.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant="secondary">{response.respondent.role}</Badge>
              </td>
              {form.schema.fields.slice(0, 3).map((field) => (
                <td key={field.id} className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 max-w-32 truncate">
                    {formatResponseValue(field, response.data[field.id])}
                  </div>
                </td>
              ))}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(response.submittedAt).toLocaleDateString('fr-FR')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedResponse(response)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Filtres et contrôles */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>

          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <option value="all">Tous les rôles</option>
            {uniqueRoles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            Grille
          </Button>
          <Button
            variant={viewMode === 'table' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            Tableau
          </Button>
          
          {onExport && (
            <Button variant="secondary" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          )}
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <MessageSquare className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Réponses totales</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <User className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Répondants uniques</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(responses.map(r => r.respondent.email)).size}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Dernière réponse</p>
              <p className="text-sm font-bold text-gray-900">
                {responses.length > 0 
                  ? new Date(responses[0].submittedAt).toLocaleDateString('fr-FR')
                  : 'Aucune'
                }
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Liste des réponses */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredResponses.length === 0 ? (
        <Card className="p-8 text-center">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune réponse trouvée
          </h3>
          <p className="text-gray-600">
            {responses.length === 0 
              ? 'Ce formulaire n\'a pas encore reçu de réponses.'
              : 'Aucune réponse ne correspond aux critères de recherche.'
            }
          </p>
        </Card>
      ) : (
        <div>
          {viewMode === 'grid' ? renderGridView() : renderTableView()}
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={onPageChange}
              />
            </div>
          )}
        </div>
      )}

      {/* Modal de détail de réponse */}
      {selectedResponse && (
        <ResponseDetailModal
          response={selectedResponse}
          form={form}
          onClose={() => setSelectedResponse(null)}
        />
      )}
    </div>
  );
};

// Modal pour afficher les détails d'une réponse
interface ResponseDetailModalProps {
  response: FormResponse;
  form: Form;
  onClose: () => void;
}

const ResponseDetailModal: React.FC<ResponseDetailModalProps> = ({
  response,
  form,
  onClose
}) => {
  const formatResponseValue = (field: FormField, value: any): string => {
    if (value === null || value === undefined || value === '') {
      return 'Non renseigné';
    }

    switch (field.type) {
      case 'checkbox':
        if (Array.isArray(value)) {
          return value.join(', ');
        }
        return String(value);
        
      case 'select':
      case 'radio':
        const option = field.options?.find(opt => opt.value === value);
        return option ? option.label : String(value);
        
      case 'date':
        return new Date(value).toLocaleDateString('fr-FR');
        
      case 'file':
        return value ? 'Fichier téléchargé' : 'Aucun fichier';
        
      default:
        return String(value);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Détails de la réponse" size="lg">
      <div className="space-y-6">
        {/* Informations du répondant */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Répondant</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Nom</p>
              <p className="font-medium">
                {response.respondent.firstName} {response.respondent.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{response.respondent.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Rôle</p>
              <Badge variant="secondary">{response.respondent.role}</Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date de soumission</p>
              <p className="font-medium">
                {new Date(response.submittedAt).toLocaleString('fr-FR')}
              </p>
            </div>
          </div>
        </div>

        {/* Réponses */}
        <div>
          <h3 className="font-medium text-gray-900 mb-4">Réponses</h3>
          <div className="space-y-4">
            {form.schema.fields.map((field) => {
              const value = response.data[field.id];
              return (
                <div key={field.id} className="border-b border-gray-200 pb-4">
                  <div className="flex items-start justify-between mb-2">
                    <label className="font-medium text-gray-700">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <Badge variant="secondary" size="sm">
                      {field.type}
                    </Badge>
                  </div>
                  
                  {field.description && (
                    <p className="text-sm text-gray-600 mb-2">
                      {field.description}
                    </p>
                  )}
                  
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-gray-900">
                      {formatResponseValue(field, value)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>Fermer</Button>
        </div>
      </div>
    </Modal>
  );
};

export default ResponseViewer;