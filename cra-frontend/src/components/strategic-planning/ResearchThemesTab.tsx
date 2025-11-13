// src/components/strategic-planning/ResearchThemesTab.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight, Loader2, Target } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { strategicPlanningApi } from '../../services/strategicPlanningApi';
import { ResearchProgram, ResearchTheme } from '../../types/strategic-planning.types';
import ResearchThemeFormModal from './ResearchThemeFormModal';

const ResearchThemesTab: React.FC = () => {
  const [programs, setPrograms] = useState<ResearchProgram[]>([]);
  const [themes, setThemes] = useState<ResearchTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPrograms, setExpandedPrograms] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ResearchTheme | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [programsResponse, themesResponse] = await Promise.all([
        strategicPlanningApi.getResearchPrograms({ limit: 100 }),
        strategicPlanningApi.getResearchThemes({ limit: 100 }),
      ]);
      setPrograms(programsResponse.data);
      setThemes(themesResponse.data);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const toggleProgram = (programId: string) => {
    const newExpanded = new Set(expandedPrograms);
    if (newExpanded.has(programId)) {
      newExpanded.delete(programId);
    } else {
      newExpanded.add(programId);
    }
    setExpandedPrograms(newExpanded);
  };

  const handleCreate = () => {
    setSelectedTheme(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEdit = (theme: ResearchTheme) => {
    setSelectedTheme(theme);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = async (theme: ResearchTheme) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le thème "${theme.name}" ?`)) {
      return;
    }

    setDeletingId(theme.id);
    try {
      await strategicPlanningApi.deleteResearchTheme(theme.id);
      toast.success('Thème de recherche supprimé avec succès');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (themeData: any) => {
    try {
      if (modalMode === 'create') {
        await strategicPlanningApi.createResearchTheme(themeData);
        toast.success('Thème de recherche créé avec succès');
      } else if (selectedTheme) {
        await strategicPlanningApi.updateResearchTheme(selectedTheme.id, themeData);
        toast.success('Thème de recherche modifié avec succès');
      }
      loadData();
    } catch (error: any) {
      throw error;
    }
  };

  const getThemesByProgram = (programId: string): ResearchTheme[] => {
    return themes
      .filter((theme) => theme.programId === programId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Thèmes de Recherche</h2>
          <p className="mt-1 text-sm text-gray-500">
            Gérez les thèmes de recherche de vos programmes
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nouveau Thème
        </button>
      </div>

      {programs.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Aucun programme de recherche disponible</p>
          <p className="text-sm text-gray-400 mt-1">
            Créez d'abord un programme de recherche
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {programs.map((program) => {
            const programThemes = getThemesByProgram(program.id);
            const isExpanded = expandedPrograms.has(program.id);

            return (
              <div
                key={program.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <div
                  onClick={() => toggleProgram(program.id)}
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {program.name}
                        </h3>
                        {program.isActive ? (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                            Actif
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                            Inactif
                          </span>
                        )}
                      </div>
                      {program.code && (
                        <p className="text-sm text-gray-500">Code: {program.code}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      {programThemes.length} {programThemes.length > 1 ? 'thèmes' : 'thème'}
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-200">
                    {programThemes.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        Aucun thème de recherche pour ce programme
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {programThemes.map((theme) => (
                          <div
                            key={theme.id}
                            className="p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                  <span className="flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                                    {theme.order}
                                  </span>
                                  <div>
                                    <div className="flex items-center space-x-2">
                                      <h4 className="text-base font-semibold text-gray-900">
                                        {theme.name}
                                      </h4>
                                      {theme.isActive ? (
                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                                          Actif
                                        </span>
                                      ) : (
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                                          Inactif
                                        </span>
                                      )}
                                    </div>
                                    {theme.code && (
                                      <span className="text-sm text-gray-500">
                                        Code: {theme.code}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {theme.description && (
                                  <p className="mt-2 text-sm text-gray-600 ml-11">
                                    {theme.description}
                                  </p>
                                )}

                                {theme.objectives && theme.objectives.length > 0 && (
                                  <div className="mt-3 ml-11">
                                    <div className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                      <Target className="h-4 w-4 mr-1" />
                                      Objectifs:
                                    </div>
                                    <ul className="list-disc list-inside space-y-1">
                                      {theme.objectives.map((objective, index) => (
                                        <li key={index} className="text-sm text-gray-600">
                                          {objective}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center space-x-2 ml-4">
                                <button
                                  onClick={() => handleEdit(theme)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Modifier"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(theme)}
                                  disabled={deletingId === theme.id}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                  title="Supprimer"
                                >
                                  {deletingId === theme.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ResearchThemeFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        theme={selectedTheme}
        mode={modalMode}
        programs={programs}
      />
    </div>
  );
};

export default ResearchThemesTab;
