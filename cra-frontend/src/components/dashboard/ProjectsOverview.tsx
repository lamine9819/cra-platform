// src/components/dashboard/ProjectsOverview.tsx
import React from 'react';
import { Briefcase, Users,  Plus } from 'lucide-react';
import { ProjectStats } from '../../services/dashboard.api';

interface ProjectsOverviewProps {
  projects: ProjectStats;
  onViewAll: () => void;
  onCreateNew: () => void;
}

const ProjectsOverview: React.FC<ProjectsOverviewProps> = ({
  projects,
  onViewAll,
  onCreateNew
}) => {
  const statusLabels = {
    PLANIFIE: 'Planifié',
    EN_COURS: 'En cours',
    SUSPENDU: 'Suspendu',
    TERMINE: 'Terminé',
    ARCHIVE: 'Archivé'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANIFIE': return 'bg-gray-100 text-gray-800';
      case 'EN_COURS': return 'bg-blue-100 text-blue-800';
      case 'SUSPENDU': return 'bg-yellow-100 text-yellow-800';
      case 'TERMINE': return 'bg-green-100 text-green-800';
      case 'ARCHIVE': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Mes projets</h3>
        <div className="flex gap-2">
          <button
            onClick={onCreateNew}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Nouveau
          </button>
          <button
            onClick={onViewAll}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Voir tout →
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mx-auto mb-2">
            <Briefcase className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-lg font-semibold text-gray-900">{projects.total}</div>
          <div className="text-xs text-gray-600">Total projets</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mx-auto mb-2">
            <Users className="h-4 w-4 text-green-600" />
          </div>
          <div className="text-lg font-semibold text-gray-900">{projects.userProjects}</div>
          <div className="text-xs text-gray-600">Mes projets</div>
        </div>
      </div>

      {/* Répartition par statut */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Répartition par statut</h4>
        <div className="flex flex-wrap gap-2">
          {Object.entries(projects.byStatus).map(([status, count]) => (
            <span
              key={status}
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}
            >
              {statusLabels[status as keyof typeof statusLabels]}: {count}
            </span>
          ))}
        </div>
      </div>

      {/* Projets récents */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Projets récents</h4>
        <div className="space-y-2">
          {projects.recentProjects.slice(0, 3).map((project) => (
            <div key={project.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {project.title}
                </div>
                <div className="text-xs text-gray-600 flex items-center gap-2">
                  <Users className="h-3 w-3" />
                  {project.participantCount} participant(s)
                </div>
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                {statusLabels[project.status as keyof typeof statusLabels]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default ProjectsOverview;
