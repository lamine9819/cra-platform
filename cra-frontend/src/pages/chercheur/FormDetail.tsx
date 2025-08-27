// Mise à jour du FormDetail avec ResponseViewer
// src/pages/chercheur/FormDetailEnhanced.tsx
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Copy, 
  Download, 
  Share2, 
  Trash2,
  Play,
  Pause,
  Users,
  MessageSquare,
  BarChart3,
  Calendar,
  ExternalLink,
  Plus, Database 
} from 'lucide-react';
import { 
  useForm, 
  useFormActions, 
  useFormResponses, 
  useFormComments 
} from '../../hooks/useForms';
import ResponseViewer from '../../components/forms/ResponseViewer';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import Modal from '../../components/ui/Modal';
import Alert from '../../components/ui/Alert';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';

const FormDetailEnhanced: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // États locaux
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [responseFilters, setResponseFilters] = useState({
    page: 1,
    limit: 20
  });

  // Hooks
  const { form, loading: formLoading, error: formError, refetch } = useForm(id, true);
  const { 
    responses, 
    loading: responsesLoading, 
    pagination: responsesPagination,
    refetch: refetchResponses
  } = useFormResponses(id);
  
  const {
    comments,
    loading: commentsLoading,
    addComment
  } = useFormComments(id);
  
  const {
    loading: actionLoading,
    error: actionError,
    deleteForm,
    duplicateForm,
    toggleFormStatus,
    exportResponses
  } = useFormActions();

  // Gestionnaires d'événements
  const handleDelete = async () => {
    if (!id) return;
    const success = await deleteForm(id);
    if (success) navigate('/chercheur/forms');
  };

  const handleDuplicate = async () => {
    if (!form) return;
    const duplicated = await duplicateForm(form.id, `Copie de ${form.title}`);
    if (duplicated) navigate(`/chercheur/forms/${duplicated.id}/edit`);
  };

  const handleToggleStatus = async () => {
    if (!form) return;
    const updated = await toggleFormStatus(form.id);
    if (updated) refetch();
  };

  const handleExport = async () => {
    if (!id) return;
    const blob = await exportResponses(id, 'xlsx');
    if (blob) {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${form?.title.replace(/[^a-zA-Z0-9]/g, '_')}_responses.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    const result = await addComment(newComment);
    if (result) setNewComment('');
  };

  const handleResponsePageChange = (page: number) => {
    setResponseFilters(prev => ({ ...prev, page }));
    refetchResponses({ ...responseFilters, page });
  };

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/forms/${form?.id}/submit`;
    navigator.clipboard.writeText(shareUrl);
  };

  if (formLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (formError || !form) {
    return (
      <div className="text-center py-12">
        <ErrorMessage message={formError || 'Formulaire non trouvé'} />
        <Link to="/chercheur/forms" className="mt-4 inline-block">
          <Button variant="secondary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux formulaires
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4 flex-1">
          <Button variant="secondary" onClick={() => navigate('/chercheur/forms')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{form.title}</h1>
              <Badge variant={form.isActive ? 'success' : 'secondary'}>
                {form.isActive ? 'Actif' : 'Inactif'}
              </Badge>
              {form.activity && (
                <Badge variant="secondary">{form.activity.title}</Badge>
              )}
            </div>
            
            {form.description && <p className="text-gray-600">{form.description}</p>}
            
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span>Créé par {form.creator.firstName} {form.creator.lastName}</span>
              <span>•</span>
              <span>{new Date(form.createdAt).toLocaleDateString('fr-FR')}</span>
              {form.updatedAt !== form.createdAt && (
                <>
                  <span>•</span>
                  <span>Modifié le {new Date(form.updatedAt).toLocaleDateString('fr-FR')}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={handleToggleStatus} loading={actionLoading}>
            {form.isActive ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {form.isActive ? 'Désactiver' : 'Activer'}
          </Button>
          
          <Button variant="secondary" onClick={() => setShowShareModal(true)}>
            <Share2 className="h-4 w-4 mr-2" />Partager
          </Button>
          
          <Button variant="secondary" onClick={handleDuplicate} loading={actionLoading}>
            <Copy className="h-4 w-4 mr-2" />Dupliquer
          </Button>
          
          <Link to={`/chercheur/forms/${form.id}/edit`}>
            <Button variant="secondary">
              <Edit className="h-4 w-4 mr-2" />Modifier
            </Button>
          </Link>
          
          <Button variant="secondary" onClick={handleExport} disabled={!form._count?.responses} loading={actionLoading}>
            <Download className="h-4 w-4 mr-2" />Exporter
          </Button>
          
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
            <Trash2 className="h-4 w-4 mr-2" />Supprimer
          </Button>
        </div>
      </div>

      {/* Messages d'erreur */}
      {actionError && <ErrorMessage message={actionError} />}

      {/* Métriques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Réponses</p>
              <p className="text-2xl font-bold text-gray-900">{form._count?.responses || 0}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <MessageSquare className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Commentaires</p>
              <p className="text-2xl font-bold text-gray-900">{form._count?.comments || 0}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Champs</p>
              <p className="text-2xl font-bold text-gray-900">{form.schema.fields.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-orange-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Dernière réponse</p>
              <p className="text-sm font-bold text-gray-900">
                {responses.length > 0 ? new Date(responses[0].submittedAt).toLocaleDateString('fr-FR') : 'Aucune'}
              </p>
            </div>
          </div>
        </Card>
      </div>
        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={handleToggleStatus} loading={actionLoading}>
            {form.isActive ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {form.isActive ? 'Désactiver' : 'Activer'}
          </Button>
          
          {/* Bouton de collecte de données */}
          <Link to={`/chercheur/forms/${form.id}/collect`}>
            <Button variant="primary">
              <Database className="h-4 w-4 mr-2" />
              Collecter
            </Button>
          </Link>
          
          <Button variant="secondary" onClick={() => setShowShareModal(true)}>
            <Share2 className="h-4 w-4 mr-2" />Partager
          </Button>
          
          <Button variant="secondary" onClick={handleDuplicate} loading={actionLoading}>
            <Copy className="h-4 w-4 mr-2" />Dupliquer
          </Button>
          
          <Link to={`/chercheur/forms/${form.id}/edit`}>
            <Button variant="secondary">
              <Edit className="h-4 w-4 mr-2" />Modifier
            </Button>
          </Link>
          
          <Button variant="secondary" onClick={handleExport} disabled={!form._count?.responses} loading={actionLoading}>
            <Download className="h-4 w-4 mr-2" />Exporter
          </Button>
          
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
            <Trash2 className="h-4 w-4 mr-2" />Supprimer
          </Button>
        </div>

      {/* Contenu principal avec onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="responses">Réponses ({form._count?.responses || 0})</TabsTrigger>
          <TabsTrigger value="comments">Commentaires ({form._count?.comments || 0})</TabsTrigger>
          <TabsTrigger value="analytics">Analytiques</TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Informations</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Titre</label>
                  <p className="text-gray-900">{form.title}</p>
                </div>
                
                {form.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Description</label>
                    <p className="text-gray-900">{form.description}</p>
                  </div>
                )}
                
                {form.activity && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Activité</label>
                    <div className="flex items-center gap-2">
                      <p className="text-gray-900">{form.activity.title}</p>
                      <Link to={`/chercheur/activities/${form.activity.id}`} className="text-blue-600 hover:text-blue-700">
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Statut</label>
                  <p>
                    <Badge variant={form.isActive ? 'success' : 'secondary'}>
                      {form.isActive ? 'Actif' : 'Inactif'}
                    </Badge>
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Structure du formulaire</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {form.schema.fields.map((field, index) => (
                  <div key={field.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">#{index + 1}</span>
                      <div>
                        <p className="font-medium text-gray-900">{field.label}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" size="sm">{field.type}</Badge>
                          {field.required && <Badge variant="danger" size="sm">Requis</Badge>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Réponses avec ResponseViewer */}
        <TabsContent value="responses" className="space-y-6">
          <ResponseViewer
            form={form}
            responses={responses}
            pagination={responsesPagination}
            loading={responsesLoading}
            onPageChange={handleResponsePageChange}
            onExport={handleExport}
          />
        </TabsContent>

        {/* Commentaires */}
        <TabsContent value="comments" className="space-y-6">
          <Card className="p-4">
            <div className="space-y-4">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Ajouter un commentaire..."
                rows={3}
              />
              <div className="flex justify-end">
                <Button onClick={handleAddComment} disabled={!newComment.trim()} loading={commentsLoading}>
                  <Plus className="h-4 w-4 mr-2" />Publier
                </Button>
              </div>
            </div>
          </Card>

          {comments.length === 0 ? (
            <Card className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Aucun commentaire</h4>
              <p className="text-gray-600">Soyez le premier à commenter ce formulaire.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <Card key={comment.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {comment.author.firstName[0]}{comment.author.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{comment.author.firstName} {comment.author.lastName}</p>
                        <p className="text-sm text-gray-500">{new Date(comment.createdAt).toLocaleString('fr-FR')}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">{comment.author.role}</Badge>
                  </div>
                  <p className="text-gray-900 whitespace-pre-wrap">{comment.content}</p>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Analytiques */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Répartition par rôle</h3>
              <div className="space-y-3">
                {responses.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Aucune donnée disponible</p>
                ) : (
                  Object.entries(responses.reduce((acc, response) => {
                    const role = response.respondent.role;
                    acc[role] = (acc[role] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)).map(([role, count]) => (
                    <div key={role} className="flex items-center justify-between">
                      <span className="text-gray-600">{role}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(count / responses.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Activité récente</h3>
              <div className="space-y-3">
                {responses.slice(0, 5).map((response) => (
                  <div key={response.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-900">
                      {response.respondent.firstName} {response.respondent.lastName}
                    </span>
                    <span className="text-gray-500">
                      {new Date(response.submittedAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                ))}
                {responses.length === 0 && (
                  <p className="text-gray-500 text-center py-4">Aucune activité récente</p>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Supprimer le formulaire">
        <div className="space-y-4">
          <Alert type="warning">
            <p>Êtes-vous sûr de vouloir supprimer définitivement ce formulaire ? Cette action supprimera également toutes les réponses et commentaires associés.</p>
          </Alert>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Annuler</Button>
            <Button variant="danger" onClick={handleDelete} loading={actionLoading}>Supprimer définitivement</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showShareModal} onClose={() => setShowShareModal(false)} title="Partager le formulaire">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lien de partage</label>
            <div className="flex gap-2">
              <Input
                value={`${window.location.origin}/forms/${form.id}/submit`}
                readOnly
                className="flex-1"
              />
              <Button variant="secondary" onClick={copyShareLink}>
                Copier
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Partagez ce lien pour permettre aux utilisateurs de répondre au formulaire.
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Conseils de partage:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Le formulaire doit être actif pour recevoir des réponses</li>
              <li>• Les utilisateurs n'ont pas besoin de compte pour répondre</li>
              <li>• Vous recevrez une notification pour chaque nouvelle réponse</li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FormDetailEnhanced;