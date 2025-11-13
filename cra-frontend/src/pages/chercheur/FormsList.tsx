// src/pages/chercheur/FormsList.tsx - Version optimisée
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Copy, 
  Trash2, 
  MoreVertical,
  MessageSquare,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Activity,
  FileText
} from 'lucide-react';
import { useForms, useFormActions, useFormStats } from '../../hooks/useForms';
import { useActivities } from '../../hooks/useActivities';
import { Form } from '../../services/formsApi';

// Components
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import Card from '../../components/ui/Card';
import Dropdown from '../../components/ui/Dropdown';
import Modal from '../../components/ui/Modal';
import Alert from '../../components/ui/Alert';
import Pagination from '../../components/ui/Pagination';

const FormsList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // ✅ OPTIMISATION 1: Mémoriser les valeurs des filtres depuis l'URL
  const initialFilters = useMemo(() => ({
    search: searchParams.get('search') || '',
    activityId: searchParams.get('activityId') || '',
    status: searchParams.get('status') || 'all',
    page: parseInt(searchParams.get('page') || '1')
  }), [searchParams]);

  // États locaux - initialisés avec les valeurs de l'URL
  const [searchTerm, setSearchTerm] = useState(initialFilters.search);
  const [selectedActivity, setSelectedActivity] = useState(initialFilters.activityId);
  const [statusFilter, setStatusFilter] = useState(initialFilters.status);
  const [viewMode, setViewMode] = useState<'my' | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedForms, setSelectedForms] = useState<string[]>([]);
  const [formToDelete, setFormToDelete] = useState<Form | null>(null);
  const [bulkAction, setBulkAction] = useState<'delete' | 'export' | null>(null);

  // ✅ OPTIMISATION 2: Construire les filtres de manière stable
  const formFilters = useMemo(() => ({
    search: searchTerm || undefined,
    activityId: selectedActivity || undefined,
    isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
    page: initialFilters.page,
    limit: 12
  }), [searchTerm, selectedActivity, statusFilter, initialFilters.page]);

  // ✅ OPTIMISATION 3: Charger les activités une seule fois
  const { 
    activities,
    loading: activitiesLoading 
  } = useActivities({ limit: 100 });

  // ✅ OPTIMISATION 4: Utiliser les filtres mémorisés
  const { 
    forms, 
    loading: formsLoading, 
    error: formsError, 
    pagination, 
    refetch: refetchForms 
  } = useForms(formFilters);

  // Hooks pour les stats (chargées une seule fois)
  const { 
    stats, 
    loading: statsLoading 
  } = useFormStats();

  const { 
    loading: actionLoading, 
    error: actionError, 
    deleteForm, 
    duplicateForm, 
    toggleFormStatus, 
    exportResponses,
    clearError 
  } = useFormActions();

  // ✅ OPTIMISATION 5: Debounce pour la recherche
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // Débounce de 500ms

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ✅ OPTIMISATION 6: Mettre à jour l'URL seulement quand nécessaire
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (debouncedSearchTerm) params.set('search', debouncedSearchTerm);
    if (selectedActivity) params.set('activityId', selectedActivity);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (pagination.page > 1) params.set('page', pagination.page.toString());
    
    // ✅ Éviter les mises à jour inutiles de l'URL
    const currentParams = searchParams.toString();
    const newParams = params.toString();
    
    if (currentParams !== newParams) {
      setSearchParams(params, { replace: true });
    }
  }, [debouncedSearchTerm, selectedActivity, statusFilter, pagination.page, searchParams, setSearchParams]);

  // ✅ OPTIMISATION 7: Gestionnaires d'événements optimisés avec useCallback
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleActivityFilter = useCallback((activityId: string) => {
    setSelectedActivity(activityId);
  }, []);

  const handleStatusFilter = useCallback((status: string) => {
    setStatusFilter(status);
  }, []);

  const handleDeleteForm = useCallback(async () => {
    if (!formToDelete) return;

    const success = await deleteForm(formToDelete.id);
    if (success) {
      setFormToDelete(null);
      refetchForms();
    }
  }, [formToDelete, deleteForm, refetchForms]);

  const handleDuplicateForm = useCallback(async (form: Form) => {
    const newTitle = `Copie de ${form.title}`;
    const duplicated = await duplicateForm(form.id, newTitle);
    if (duplicated) {
      refetchForms();
      navigate(`/chercheur/forms/${duplicated.id}/edit`);
    }
  }, [duplicateForm, refetchForms, navigate]);

  const handleToggleStatus = useCallback(async (form: Form) => {
    const updated = await toggleFormStatus(form.id);
    if (updated) {
      refetchForms();
    }
  }, [toggleFormStatus, refetchForms]);

  const handleExportResponses = useCallback(async (form: Form) => {
    const blob = await exportResponses(form.id, 'xlsx');
    if (blob) {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${form.title.replace(/[^a-zA-Z0-9]/g, '_')}_responses.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  }, [exportResponses]);

  const handleSelectForm = useCallback((formId: string, checked: boolean) => {
    if (checked) {
      setSelectedForms(prev => [...prev, formId]);
    } else {
      setSelectedForms(prev => prev.filter(id => id !== formId));
    }
  }, []);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedForms(forms.map(f => f.id));
    } else {
      setSelectedForms([]);
    }
  }, [forms]);

  // ✅ OPTIMISATION 8: Mémoriser les options des activités
  const activityOptions = useMemo(() => 
    activities.map(activity => ({
      value: activity.id,
      label: activity.title
    }))
  , [activities]);

  // Rendu conditionnel de chargement
  if (formsLoading && !forms.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      {stats && !statsLoading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Actifs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Réponses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalResponses}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-orange-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Taux de réponse</p>
                <p className="text-2xl font-bold text-gray-900">{stats.responseRate}%</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* En-tête de page */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Formulaires</h1>
          <p className="text-gray-600">
            Gérez vos formulaires de collecte de données
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtres
          </Button>
          
          <Link to="/chercheur/forms/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau formulaire
            </Button>
          </Link>
        </div>
      </div>

      {/* Filtres */}
      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recherche
              </label>
              <Input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                icon={<Search className="h-4 w-4" />}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Activité
              </label>
              <Select
                value={selectedActivity}
                onValueChange={handleActivityFilter}
                placeholder="Toutes les activités"
                disabled={activitiesLoading}
              >
                <option value="">Toutes les activités</option>
                {activityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <Select
                value={statusFilter}
                onValueChange={handleStatusFilter}
              >
                <option value="all">Tous</option>
                <option value="active">Actifs</option>
                <option value="inactive">Inactifs</option>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vue
              </label>
              <Select
                value={viewMode}
                onValueChange={(value: string) => setViewMode(value as 'my' | 'all')}
              >
                <option value="all">Tous les formulaires</option>
                <option value="my">Mes formulaires</option>
              </Select>
            </div>
          </div>
        </Card>
      )}

      {/* Messages d'erreur */}
      {(formsError || actionError) && (
        <ErrorMessage message={formsError || actionError || ''} />
      )}

      {/* Liste des formulaires */}
      {forms.length === 0 && !formsLoading ? (
        <Card className="p-8 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun formulaire trouvé
          </h3>
          <p className="text-gray-600 mb-4">
            Commencez par créer votre premier formulaire de collecte de données.
          </p>
          <Link to="/chercheur/forms/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Créer un formulaire
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* En-tête de sélection */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedForms.length === forms.length && forms.length > 0}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSelectAll(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-600">
              Sélectionner tout
            </span>
          </div>

          {/* Grille des formulaires */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => (
              <FormCard
                key={form.id}
                form={form}
                selected={selectedForms.includes(form.id)}
                onSelect={(checked) => handleSelectForm(form.id, checked)}
                onView={() => navigate(`/chercheur/forms/${form.id}`)}
                onEdit={() => navigate(`/chercheur/forms/${form.id}/edit`)}
                onDuplicate={() => handleDuplicateForm(form)}
                onToggleStatus={() => handleToggleStatus(form)}
                onDelete={() => setFormToDelete(form)}
                onExport={() => handleExportResponses(form)}
                loading={actionLoading}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(page: number) => {
                setSearchParams(prev => {
                  prev.set('page', page.toString());
                  return prev;
                });
              }}
            />
          )}
        </div>
      )}

      {/* Modals */}
      <Modal
        isOpen={!!formToDelete}
        onClose={() => setFormToDelete(null)}
        title="Supprimer le formulaire"
      >
        <div className="space-y-4">
          <Alert type="warning">
            <p>
              Êtes-vous sûr de vouloir supprimer le formulaire "{formToDelete?.title}" ?
              Cette action est irréversible et supprimera également toutes les réponses associées.
            </p>
          </Alert>
          
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setFormToDelete(null)}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteForm}
              loading={actionLoading}
            >
              Supprimer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ✅ OPTIMISATION 9: Mémoriser FormCard pour éviter les re-rendus
interface FormCardProps {
  form: Form;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onView: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
  onExport: () => void;
  loading: boolean;
}

const FormCard: React.FC<FormCardProps> = React.memo(({
  form,
  selected,
  onSelect,
  onView,
  onEdit,
  onDuplicate,
  onToggleStatus,
  onDelete,
  onExport,
  loading
}) => {
  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect(e.target.checked)}
            className="rounded border-gray-300"
          />
          <div>
            <h3 className="font-semibold text-gray-900 line-clamp-2">
              {form.title}
            </h3>
            {form.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {form.description}
              </p>
            )}
          </div>
        </div>
        
        <Dropdown
          trigger={
            <Button variant="secondary" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          }
          items={[
            {
              label: 'Voir',
              icon: <Eye className="h-4 w-4" />,
              onClick: onView
            },
            {
              label: 'Modifier',
              icon: <Edit className="h-4 w-4" />,
              onClick: onEdit
            },
            {
              label: 'Dupliquer',
              icon: <Copy className="h-4 w-4" />,
              onClick: onDuplicate
            },
            {
              label: form.isActive ? 'Désactiver' : 'Activer',
              icon: form.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />,
              onClick: onToggleStatus
            },
            {
              label: 'Exporter',
              icon: <Download className="h-4 w-4" />,
              onClick: onExport,
              disabled: !form._count?.responses
            },
            {
              type: 'separator'
            },
            {
              label: 'Supprimer',
              icon: <Trash2 className="h-4 w-4" />,
              onClick: onDelete,
              className: 'text-red-600 hover:text-red-700'
            }
          ]}
        />
      </div>

      {/* Statut et activité */}
      <div className="flex items-center gap-2 mb-4">
        <Badge variant={form.isActive ? 'success' : 'secondary'}>
          {form.isActive ? 'Actif' : 'Inactif'}
        </Badge>
        
        {form.activity && (
          <Badge variant="secondary">
            {form.activity.title}
          </Badge>
        )}
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600">
            {form._count?.responses || 0} réponses
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600">
            {form._count?.comments || 0} commentaires
          </span>
        </div>
      </div>

      {/* Créateur et date */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Par {form.creator.firstName} {form.creator.lastName}
          </span>
          <span>
            {new Date(form.createdAt).toLocaleDateString('fr-FR')}
          </span>
        </div>
      </div>
    </Card>
  );
});

FormCard.displayName = 'FormCard';

export default FormsList;