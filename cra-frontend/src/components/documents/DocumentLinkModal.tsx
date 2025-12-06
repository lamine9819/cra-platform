// src/components/documents/DocumentLinkModal.tsx - Version améliorée
import React, { useState, useEffect } from 'react';
import { X, Link as LinkIcon, Unlink, Search, FolderOpen, CheckSquare, Trash2 } from 'lucide-react';
import { DocumentLinkModalProps, DocumentContext } from '../../types/document.types';
import { Project } from '../../services/projectsApi';
import { Activity as ActivityType } from '../../services/activitiesApi';
import projectsApi from '../../services/projectsApi';
import activitiesApi from '../../services/activitiesApi';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

// Icône Activity renommée pour éviter le conflit
import { Activity as ActivityIcon } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
}

export const DocumentLinkModal: React.FC<DocumentLinkModalProps> = ({
  document,
  isOpen,
  onClose,
  onLink,
  onUnlink
}) => {
  const [contextType, setContextType] = useState<'project' | 'activity' | 'task'>('project');
  const [projects, setProjects] = useState<Project[]>([]);
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedContext, setSelectedContext] = useState<DocumentContext | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Charger les projets et activités
  useEffect(() => {
    if (isOpen) {
      loadContexts();
    }
  }, [isOpen, contextType, searchTerm]);

  const loadContexts = async () => {
    try {
      setLoading(true);

      if (contextType === 'project') {
        const response = await projectsApi.listProjects({
          search: searchTerm,
          limit: 20
        });
        setProjects(response.projects);
      } else if (contextType === 'activity') {
        const response = await activitiesApi.listActivities({
          search: searchTerm,
          limit: 20
        });
        setActivities(response.activities);
      } else if (contextType === 'task') {
        const response = await api.get<{ success: boolean; data: Task[] }>('/tasks', {
          params: { search: searchTerm, limit: 20 }
        });
        setTasks(response.data.data || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast.error('Erreur lors du chargement des éléments');
    } finally {
      setLoading(false);
    }
  };

  // Récupérer toutes les liaisons actuelles du document
  const getCurrentLinks = (): DocumentContext[] => {
    const links: DocumentContext[] = [];

    if (document.project) {
      links.push({
        type: 'project',
        id: document.project.id,
        title: document.project.title
      });
    }
    if (document.activity) {
      links.push({
        type: 'activity',
        id: document.activity.id,
        title: document.activity.title
      });
    }
    if (document.task) {
      links.push({
        type: 'task',
        id: document.task.id,
        title: document.task.title
      });
    }

    return links;
  };

  const currentLinks = getCurrentLinks();

  const handleLink = async () => {
    if (!selectedContext) {
      toast.error('Veuillez sélectionner un élément');
      return;
    }

    try {
      setSubmitting(true);
      await onLink(selectedContext);
      onClose();
    } catch (error) {
      // L'erreur est déjà gérée par le contexte
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnlinkSpecific = async (link: DocumentContext) => {
    try {
      setSubmitting(true);
      await onUnlink();
      toast.success(`Liaison avec ${link.type === 'project' ? 'le projet' : link.type === 'activity' ? 'l\'activité' : 'la tâche'} supprimée`);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la déliaison');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Gérer les liaisons du document
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {document.title}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white px-6 py-4">
            {/* Liaisons actuelles */}
            {currentLinks.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Liaisons actuelles ({currentLinks.length})
                </h4>
                <div className="space-y-2">
                  {currentLinks.map((link) => (
                    <div
                      key={`${link.type}-${link.id}`}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center space-x-3">
                        {link.type === 'project' && <FolderOpen className="h-5 w-5 text-blue-600" />}
                        {link.type === 'activity' && <ActivityIcon className="h-5 w-5 text-green-600" />}
                        {link.type === 'task' && <CheckSquare className="h-5 w-5 text-purple-600" />}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{link.title}</p>
                          <p className="text-xs text-gray-500 capitalize">
                            {link.type === 'project' ? 'Projet' : link.type === 'activity' ? 'Activité' : 'Tâche'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleUnlinkSpecific(link)}
                        disabled={submitting}
                        className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 disabled:opacity-50 transition-colors"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Délier
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sélection du type de contexte */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Ajouter une nouvelle liaison
              </h4>
              <div className="flex space-x-2">
                <button
                  onClick={() => setContextType('project')}
                  className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                    contextType === 'project'
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Projet
                </button>
                <button
                  onClick={() => setContextType('activity')}
                  className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                    contextType === 'activity'
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <ActivityIcon className="h-4 w-4 mr-2" />
                  Activité
                </button>
                <button
                  onClick={() => setContextType('task')}
                  className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                    contextType === 'task'
                      ? 'bg-purple-50 border-purple-200 text-purple-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Tâche
                </button>
              </div>
            </div>

            {/* Recherche */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={`Rechercher des ${contextType === 'project' ? 'projets' : contextType === 'activity' ? 'activités' : 'tâches'}...`}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Liste des éléments */}
            <div className="mb-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-sm text-gray-600">Chargement...</span>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {contextType === 'project' ? (
                    projects.length === 0 ? (
                      <div className="text-center py-8">
                        <FolderOpen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">
                          {searchTerm ? 'Aucun projet trouvé' : 'Aucun projet disponible'}
                        </p>
                      </div>
                    ) : (
                      projects.map((project) => (
                        <div
                          key={project.id}
                          className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedContext?.id === project.id && selectedContext?.type === 'project'
                              ? 'bg-blue-50 border-blue-200'
                              : 'bg-white border-gray-200 hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedContext({
                            type: 'project',
                            id: project.id,
                            title: project.title
                          })}
                        >
                          <div className="flex items-center space-x-3">
                            <FolderOpen className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{project.title}</p>
                              {project.description && (
                                <p className="text-xs text-gray-500 line-clamp-1">{project.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {project._count?.participants || 0} participant{(project._count?.participants || 0) > 1 ? 's' : ''}
                          </div>
                        </div>
                      ))
                    )
                  ) : contextType === 'activity' ? (
                    activities.length === 0 ? (
                      <div className="text-center py-8">
                        <ActivityIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">
                          {searchTerm ? 'Aucune activité trouvée' : 'Aucune activité disponible'}
                        </p>
                      </div>
                    ) : (
                      activities.map((activity) => (
                        <div
                          key={activity.id}
                          className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedContext?.id === activity.id && selectedContext?.type === 'activity'
                              ? 'bg-green-50 border-green-200'
                              : 'bg-white border-gray-200 hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedContext({
                            type: 'activity',
                            id: activity.id,
                            title: activity.title
                          })}
                        >
                          <div className="flex items-center space-x-3">
                            <ActivityIcon className="h-5 w-5 text-green-600" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                              {activity.project && (
                                <p className="text-xs text-gray-500">Projet: {activity.project.title}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )
                  ) : (
                    tasks.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">
                          {searchTerm ? 'Aucune tâche trouvée' : 'Aucune tâche disponible'}
                        </p>
                      </div>
                    ) : (
                      tasks.map((task) => (
                        <div
                          key={task.id}
                          className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedContext?.id === task.id && selectedContext?.type === 'task'
                              ? 'bg-purple-50 border-purple-200'
                              : 'bg-white border-gray-200 hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedContext({
                            type: 'task',
                            id: task.id,
                            title: task.title
                          })}
                        >
                          <div className="flex items-center space-x-3">
                            <CheckSquare className="h-5 w-5 text-purple-600" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{task.title}</p>
                              {task.description && (
                                <p className="text-xs text-gray-500 line-clamp-1">{task.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              task.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                              task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {task.status}
                            </span>
                          </div>
                        </div>
                      ))
                    )
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={handleLink}
              disabled={!selectedContext || submitting}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Liaison...
                </>
              ) : (
                <>
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Lier {contextType === 'project' ? 'au projet' : contextType === 'activity' ? 'à l\'activité' : 'à la tâche'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};