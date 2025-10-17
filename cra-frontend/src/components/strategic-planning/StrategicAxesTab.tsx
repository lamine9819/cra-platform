// src/components/strategic-planning/StrategicAxesTab.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { strategicPlanningApi } from '../../services/strategicPlanningApi';
import { StrategicPlan, StrategicAxis } from '../../types/strategic-planning.types';
import StrategicAxisFormModal from './StrategicAxisFormModal';

const StrategicAxesTab: React.FC = () => {
  const [plans, setPlans] = useState<StrategicPlan[]>([]);
  const [axes, setAxes] = useState<StrategicAxis[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPlans, setExpandedPlans] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAxis, setSelectedAxis] = useState<StrategicAxis | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [plansResponse, axesResponse] = await Promise.all([
        strategicPlanningApi.getStrategicPlans({ limit: 100 }),
        strategicPlanningApi.getStrategicAxes({ limit: 100 }),
      ]);
      setPlans(plansResponse.data);
      setAxes(axesResponse.data);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const togglePlan = (planId: string) => {
    const newExpanded = new Set(expandedPlans);
    if (newExpanded.has(planId)) {
      newExpanded.delete(planId);
    } else {
      newExpanded.add(planId);
    }
    setExpandedPlans(newExpanded);
  };

  const handleCreate = () => {
    setSelectedAxis(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEdit = (axis: StrategicAxis) => {
    setSelectedAxis(axis);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = async (axis: StrategicAxis) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'axe "${axis.name}" ?`)) {
      return;
    }

    setDeletingId(axis.id);
    try {
      await strategicPlanningApi.deleteStrategicAxis(axis.id);
      toast.success('Axe stratégique supprimé avec succès');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (axisData: any) => {
    try {
      if (modalMode === 'create') {
        await strategicPlanningApi.createStrategicAxis(axisData);
        toast.success('Axe stratégique créé avec succès');
      } else if (selectedAxis) {
        await strategicPlanningApi.updateStrategicAxis(selectedAxis.id, axisData);
        toast.success('Axe stratégique modifié avec succès');
      }
      loadData();
    } catch (error: any) {
      throw error;
    }
  };

  const getAxesByPlan = (planId: string): StrategicAxis[] => {
    return axes
      .filter((axis) => axis.strategicPlanId === planId)
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
          <h2 className="text-2xl font-bold text-gray-900">Axes Stratégiques</h2>
          <p className="mt-1 text-sm text-gray-500">
            Gérez les axes stratégiques de vos plans
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nouvel Axe
        </button>
      </div>

      {plans.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Aucun plan stratégique disponible</p>
          <p className="text-sm text-gray-400 mt-1">
            Créez d'abord un plan stratégique
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => {
            const planAxes = getAxesByPlan(plan.id);
            const isExpanded = expandedPlans.has(plan.id);

            return (
              <div
                key={plan.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <div
                  onClick={() => togglePlan(plan.id)}
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {plan.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {plan.startYear} - {plan.endYear}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      {planAxes.length} {planAxes.length > 1 ? 'axes' : 'axe'}
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-200">
                    {planAxes.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        Aucun axe stratégique pour ce plan
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {planAxes.map((axis) => (
                          <div
                            key={axis.id}
                            className="p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                  <span className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                                    {axis.order}
                                  </span>
                                  <div>
                                    <h4 className="text-base font-semibold text-gray-900">
                                      {axis.name}
                                    </h4>
                                    {axis.code && (
                                      <span className="text-sm text-gray-500">
                                        Code: {axis.code}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {axis.description && (
                                  <p className="mt-2 text-sm text-gray-600 ml-11">
                                    {axis.description}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center space-x-2 ml-4">
                                <button
                                  onClick={() => handleEdit(axis)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Modifier"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(axis)}
                                  disabled={deletingId === axis.id}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                  title="Supprimer"
                                >
                                  {deletingId === axis.id ? (
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

      <StrategicAxisFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        axis={selectedAxis}
        mode={modalMode}
        plans={plans}
      />
    </div>
  );
};

export default StrategicAxesTab;
