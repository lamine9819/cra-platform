// src/components/strategic-planning/StrategicSubAxesTab.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { strategicPlanningApi } from '../../services/strategicPlanningApi';
import { StrategicAxis, StrategicSubAxis } from '../../types/strategic-planning.types';
import StrategicSubAxisFormModal from './StrategicSubAxisFormModal';

const StrategicSubAxesTab: React.FC = () => {
  const [axes, setAxes] = useState<StrategicAxis[]>([]);
  const [subAxes, setSubAxes] = useState<StrategicSubAxis[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAxes, setExpandedAxes] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubAxis, setSelectedSubAxis] = useState<StrategicSubAxis | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [axesResponse, subAxesResponse] = await Promise.all([
        strategicPlanningApi.getStrategicAxes({ limit: 100 }),
        strategicPlanningApi.getStrategicSubAxes(),
      ]);
      setAxes(axesResponse.data);
      setSubAxes(subAxesResponse.data);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const toggleAxis = (axisId: string) => {
    const newExpanded = new Set(expandedAxes);
    if (newExpanded.has(axisId)) {
      newExpanded.delete(axisId);
    } else {
      newExpanded.add(axisId);
    }
    setExpandedAxes(newExpanded);
  };

  const handleCreate = () => {
    setSelectedSubAxis(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEdit = (subAxis: StrategicSubAxis) => {
    setSelectedSubAxis(subAxis);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = async (subAxis: StrategicSubAxis) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le sous-axe "${subAxis.name}" ?`)) {
      return;
    }

    setDeletingId(subAxis.id);
    try {
      await strategicPlanningApi.deleteStrategicSubAxis(subAxis.id);
      toast.success('Sous-axe stratégique supprimé avec succès');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (subAxisData: any) => {
    try {
      if (modalMode === 'create') {
        await strategicPlanningApi.createStrategicSubAxis(subAxisData);
        toast.success('Sous-axe stratégique créé avec succès');
      } else if (selectedSubAxis) {
        await strategicPlanningApi.updateStrategicSubAxis(selectedSubAxis.id, subAxisData);
        toast.success('Sous-axe stratégique modifié avec succès');
      }
      loadData();
    } catch (error: any) {
      throw error;
    }
  };

  const getSubAxesByAxis = (axisId: string): StrategicSubAxis[] => {
    return subAxes
      .filter((subAxis) => subAxis.strategicAxisId === axisId)
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
          <h2 className="text-2xl font-bold text-gray-900">Sous-Axes Stratégiques</h2>
          <p className="mt-1 text-sm text-gray-500">
            Gérez les sous-axes stratégiques de vos axes
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nouveau Sous-Axe
        </button>
      </div>

      {axes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Aucun axe stratégique disponible</p>
          <p className="text-sm text-gray-400 mt-1">
            Créez d'abord un axe stratégique
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {axes.map((axis) => {
            const axisSubAxes = getSubAxesByAxis(axis.id);
            const isExpanded = expandedAxes.has(axis.id);

            return (
              <div
                key={axis.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <div
                  onClick={() => toggleAxis(axis.id)}
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                        {axis.order}
                      </span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {axis.name}
                        </h3>
                        {axis.code && (
                          <p className="text-sm text-gray-500">Code: {axis.code}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      {axisSubAxes.length} {axisSubAxes.length > 1 ? 'sous-axes' : 'sous-axe'}
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-200">
                    {axisSubAxes.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        Aucun sous-axe stratégique pour cet axe
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {axisSubAxes.map((subAxis) => (
                          <div
                            key={subAxis.id}
                            className="p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                  <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                                    {subAxis.order}
                                  </span>
                                  <div>
                                    <h4 className="text-base font-semibold text-gray-900">
                                      {subAxis.name}
                                    </h4>
                                    {subAxis.code && (
                                      <span className="text-sm text-gray-500">
                                        Code: {subAxis.code}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {subAxis.description && (
                                  <p className="mt-2 text-sm text-gray-600 ml-11">
                                    {subAxis.description}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center space-x-2 ml-4">
                                <button
                                  onClick={() => handleEdit(subAxis)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Modifier"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(subAxis)}
                                  disabled={deletingId === subAxis.id}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                  title="Supprimer"
                                >
                                  {deletingId === subAxis.id ? (
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

      <StrategicSubAxisFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        subAxis={selectedSubAxis}
        mode={modalMode}
        axes={axes}
      />
    </div>
  );
};

export default StrategicSubAxesTab;
