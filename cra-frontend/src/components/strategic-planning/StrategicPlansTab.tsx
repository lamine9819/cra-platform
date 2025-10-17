// src/components/strategic-planning/StrategicPlansTab.tsx
import React, { useState, useEffect } from 'react';
import { Plus, ChevronRight, ChevronDown, Edit, Trash2, Target } from 'lucide-react';
import { strategicPlanningApi } from '../../services/strategicPlanningApi';
import { StrategicPlanWithRelations } from '../../types/strategic-planning.types';
import { toast } from 'react-hot-toast';
import StrategicPlanFormModal from './StrategicPlanFormModal';
import DeleteConfirmModal from '../admin/DeleteConfirmModal';

interface StrategicPlansTabProps {
  onUpdate?: () => void;
}

const StrategicPlansTab: React.FC<StrategicPlansTabProps> = ({ onUpdate }) => {
  const [plans, setPlans] = useState<StrategicPlanWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPlans, setExpandedPlans] = useState<Set<string>>(new Set());

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<StrategicPlanWithRelations | null>(null);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const hierarchy = await strategicPlanningApi.getStrategicHierarchy();
      setPlans(hierarchy);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement des plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const togglePlan = (planId: string) => {
    setExpandedPlans((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(planId)) {
        newSet.delete(planId);
      } else {
        newSet.add(planId);
      }
      return newSet;
    });
  };

  const handleCreate = async (planData: any) => {
    try {
      await strategicPlanningApi.createStrategicPlan(planData);
      toast.success('Plan stratégique créé avec succès');
      await loadPlans();
      onUpdate?.();
      setIsCreateModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création');
      throw error;
    }
  };

  const handleEdit = (plan: StrategicPlanWithRelations) => {
    setSelectedPlan(plan);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (planData: any) => {
    if (!selectedPlan) return;
    try {
      await strategicPlanningApi.updateStrategicPlan(selectedPlan.id, planData);
      toast.success('Plan stratégique modifié avec succès');
      await loadPlans();
      onUpdate?.();
      setIsEditModalOpen(false);
      setSelectedPlan(null);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la modification');
      throw error;
    }
  };

  const handleDeleteClick = (plan: StrategicPlanWithRelations) => {
    setSelectedPlan(plan);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPlan) return;
    try {
      await strategicPlanningApi.deleteStrategicPlan(selectedPlan.id);
      toast.success('Plan stratégique supprimé avec succès');
      await loadPlans();
      onUpdate?.();
      setIsDeleteModalOpen(false);
      setSelectedPlan(null);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 rounded"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header avec bouton d'ajout */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Plans Stratégiques</h3>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nouveau Plan
        </button>
      </div>

      {/* Liste des plans */}
      {plans.length === 0 ? (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Aucun plan stratégique trouvé</p>
        </div>
      ) : (
        <div className="space-y-2">
          {plans.map((plan) => (
            <div key={plan.id} className="border border-gray-200 rounded-lg bg-white">
              {/* En-tête du plan */}
              <div className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center flex-1">
                  <button
                    onClick={() => togglePlan(plan.id)}
                    className="p-1 hover:bg-gray-200 rounded mr-2"
                  >
                    {expandedPlans.has(plan.id) ? (
                      <ChevronDown className="h-5 w-5 text-gray-600" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-600" />
                    )}
                  </button>
                  <Target className="h-5 w-5 text-green-600 mr-3" />
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h4 className="font-semibold text-gray-900">{plan.name}</h4>
                      <span
                        className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${
                          plan.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {plan.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {plan.startYear} - {plan.endYear} • {plan.axes.length} axe(s)
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(plan)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                    title="Modifier"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(plan)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Détails du plan (axes) */}
              {expandedPlans.has(plan.id) && (
                <div className="border-t border-gray-200 bg-gray-50 p-4">
                  {plan.description && (
                    <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                  )}
                  {plan.axes.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">Aucun axe stratégique</p>
                  ) : (
                    <div className="space-y-2">
                      {plan.axes.map((axis, index) => (
                        <div
                          key={axis.id}
                          className="bg-white p-3 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-start">
                            <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-green-100 text-green-700 rounded-full text-sm font-semibold mr-3">
                              {index + 1}
                            </span>
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">{axis.name}</h5>
                              {axis.description && (
                                <p className="text-sm text-gray-600 mt-1">{axis.description}</p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                {axis.subAxes.length} sous-axe(s)
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <StrategicPlanFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        mode="create"
      />

      <StrategicPlanFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPlan(null);
        }}
        onSubmit={handleUpdate}
        plan={selectedPlan}
        mode="edit"
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedPlan(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Supprimer le plan stratégique"
        message={
          selectedPlan
            ? `Êtes-vous sûr de vouloir supprimer le plan "${selectedPlan.name}" ? Cette action est irréversible et supprimera également tous les axes, sous-axes et programmes associés.`
            : ''
        }
      />
    </div>
  );
};

export default StrategicPlansTab;
