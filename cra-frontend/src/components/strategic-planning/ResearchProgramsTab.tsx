// src/components/strategic-planning/ResearchProgramsTab.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight, Loader2, Calendar, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { strategicPlanningApi } from '../../services/strategicPlanningApi';
import { StrategicSubAxis, ResearchProgram, EligibleCoordinator } from '../../types/strategic-planning.types';
import ResearchProgramFormModal from './ResearchProgramFormModal';

const ResearchProgramsTab: React.FC = () => {
  const [subAxes, setSubAxes] = useState<StrategicSubAxis[]>([]);
  const [programs, setPrograms] = useState<ResearchProgram[]>([]);
  const [coordinators, setCoordinators] = useState<EligibleCoordinator[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSubAxes, setExpandedSubAxes] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<ResearchProgram | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [subAxesResponse, programsResponse, coordinatorsResponse] = await Promise.all([
        strategicPlanningApi.getStrategicSubAxes(),
        strategicPlanningApi.getResearchPrograms({ limit: 100 }),
        strategicPlanningApi.getEligibleCoordinators(),
      ]);
      setSubAxes(subAxesResponse.data);
      setPrograms(programsResponse.data);
      setCoordinators(coordinatorsResponse);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const toggleSubAxis = (subAxisId: string) => {
    const newExpanded = new Set(expandedSubAxes);
    if (newExpanded.has(subAxisId)) {
      newExpanded.delete(subAxisId);
    } else {
      newExpanded.add(subAxisId);
    }
    setExpandedSubAxes(newExpanded);
  };

  const handleCreate = () => {
    setSelectedProgram(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEdit = (program: ResearchProgram) => {
    setSelectedProgram(program);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = async (program: ResearchProgram) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le programme "${program.name}" ?`)) {
      return;
    }

    setDeletingId(program.id);
    try {
      await strategicPlanningApi.deleteResearchProgram(program.id);
      toast.success('Programme de recherche supprimé avec succès');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (programData: any) => {
    try {
      if (modalMode === 'create') {
        await strategicPlanningApi.createResearchProgram(programData);
        toast.success('Programme de recherche créé avec succès');
      } else if (selectedProgram) {
        await strategicPlanningApi.updateResearchProgram(selectedProgram.id, programData);
        toast.success('Programme de recherche modifié avec succès');
      }
      loadData();
    } catch (error: any) {
      throw error;
    }
  };

  const getProgramsBySubAxis = (subAxisId: string): ResearchProgram[] => {
    return programs.filter((program) => program.strategicSubAxisId === subAxisId);
  };

  const getCoordinatorName = (coordinatorId: string): string => {
    const coordinator = coordinators.find((c) => c.id === coordinatorId);
    return coordinator ? `${coordinator.firstName} ${coordinator.lastName}` : 'Non défini';
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Non définie';
    return new Date(dateString).toLocaleDateString('fr-FR');
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
          <h2 className="text-2xl font-bold text-gray-900">Programmes de Recherche</h2>
          <p className="mt-1 text-sm text-gray-500">
            Gérez les programmes de recherche de vos sous-axes
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nouveau Programme
        </button>
      </div>

      {subAxes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Aucun sous-axe stratégique disponible</p>
          <p className="text-sm text-gray-400 mt-1">
            Créez d'abord un sous-axe stratégique
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {subAxes.map((subAxis) => {
            const subAxisPrograms = getProgramsBySubAxis(subAxis.id);
            const isExpanded = expandedSubAxes.has(subAxis.id);

            return (
              <div
                key={subAxis.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <div
                  onClick={() => toggleSubAxis(subAxis.id)}
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                        {subAxis.order}
                      </span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {subAxis.name}
                        </h3>
                        {subAxis.code && (
                          <p className="text-sm text-gray-500">Code: {subAxis.code}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      {subAxisPrograms.length}{' '}
                      {subAxisPrograms.length > 1 ? 'programmes' : 'programme'}
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-200">
                    {subAxisPrograms.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        Aucun programme de recherche pour ce sous-axe
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {subAxisPrograms.map((program) => (
                          <div
                            key={program.id}
                            className="p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                  <div>
                                    <div className="flex items-center space-x-2">
                                      <h4 className="text-base font-semibold text-gray-900">
                                        {program.name}
                                      </h4>
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
                                      <span className="text-sm text-gray-500">
                                        Code: {program.code}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="mt-2 ml-0 space-y-1">
                                  <div className="flex items-center text-sm text-gray-600">
                                    <User className="h-4 w-4 mr-2" />
                                    Coordinateur: {getCoordinatorName(program.coordinatorId)}
                                  </div>
                                  <div className="flex items-center text-sm text-gray-600">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    {formatDate(program.startDate)} - {formatDate(program.endDate)}
                                  </div>
                                </div>

                                {program.description && (
                                  <p className="mt-2 text-sm text-gray-600">
                                    {program.description}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center space-x-2 ml-4">
                                <button
                                  onClick={() => handleEdit(program)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Modifier"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(program)}
                                  disabled={deletingId === program.id}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                  title="Supprimer"
                                >
                                  {deletingId === program.id ? (
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

      <ResearchProgramFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        program={selectedProgram}
        mode={modalMode}
        subAxes={subAxes}
        coordinators={coordinators}
      />
    </div>
  );
};

export default ResearchProgramsTab;
