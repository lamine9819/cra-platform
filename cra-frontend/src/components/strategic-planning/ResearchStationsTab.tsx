// src/components/strategic-planning/ResearchStationsTab.tsx
import React, { useState, useEffect } from 'react';
import { Plus, MapPin, Edit, Trash2, Search } from 'lucide-react';
import { strategicPlanningApi } from '../../services/strategicPlanningApi';
import { ResearchStation } from '../../types/strategic-planning.types';
import { toast } from 'react-hot-toast';
import ResearchStationFormModal from './ResearchStationFormModal';
import DeleteConfirmModal from '../admin/DeleteConfirmModal';

interface ResearchStationsTabProps {
  onUpdate?: () => void;
}

const ResearchStationsTab: React.FC<ResearchStationsTabProps> = ({ onUpdate }) => {
  const [stations, setStations] = useState<ResearchStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState<ResearchStation | null>(null);

  const loadStations = async () => {
    try {
      setLoading(true);
      const result = await strategicPlanningApi.getResearchStations({ search: searchTerm });
      setStations(result.data);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement des stations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStations();
  }, [searchTerm]);

  const handleCreate = async (stationData: any) => {
    try {
      await strategicPlanningApi.createResearchStation(stationData);
      toast.success('Station de recherche créée avec succès');
      await loadStations();
      onUpdate?.();
      setIsCreateModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création');
      throw error;
    }
  };

  const handleEdit = (station: ResearchStation) => {
    setSelectedStation(station);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (stationData: any) => {
    if (!selectedStation) return;
    try {
      await strategicPlanningApi.updateResearchStation(selectedStation.id, stationData);
      toast.success('Station de recherche modifiée avec succès');
      await loadStations();
      onUpdate?.();
      setIsEditModalOpen(false);
      setSelectedStation(null);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la modification');
      throw error;
    }
  };

  const handleDeleteClick = (station: ResearchStation) => {
    setSelectedStation(station);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedStation) return;
    try {
      await strategicPlanningApi.deleteResearchStation(selectedStation.id);
      toast.success('Station de recherche supprimée avec succès');
      await loadStations();
      onUpdate?.();
      setIsDeleteModalOpen(false);
      setSelectedStation(null);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header avec recherche et bouton d'ajout */}
      <div className="flex justify-between items-center gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une station..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nouvelle Station
        </button>
      </div>

      {/* Liste des stations */}
      {stations.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Aucune station de recherche trouvée</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stations.map((station) => (
            <div
              key={station.id}
              className="border border-gray-200 rounded-lg bg-white p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start flex-1 min-w-0">
                  <MapPin className="h-5 w-5 text-green-600 mr-2 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4
                      className="font-semibold text-gray-900 truncate"
                      title={station.name}
                    >
                      {station.name}
                    </h4>
                    <p className="text-sm text-gray-600 flex items-center mt-1">
                      <span className="truncate" title={station.location}>
                        {station.location}
                      </span>
                    </p>
                  </div>
                </div>
                <span
                  className={`ml-2 px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 whitespace-nowrap ${
                    station.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {station.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {station.surface && (
                <p className="text-sm text-gray-500 mb-2">
                  Surface: {station.surface} ha
                </p>
              )}

              {station.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {station.description}
                </p>
              )}

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-200">
                <button
                  onClick={() => handleEdit(station)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                  title="Modifier"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteClick(station)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  title="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <ResearchStationFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        mode="create"
      />

      <ResearchStationFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedStation(null);
        }}
        onSubmit={handleUpdate}
        station={selectedStation}
        mode="edit"
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedStation(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Supprimer la station de recherche"
        message={
          selectedStation
            ? `Êtes-vous sûr de vouloir supprimer la station "${selectedStation.name}" ? Cette action est irréversible.`
            : ''
        }
      />
    </div>
  );
};

export default ResearchStationsTab;
