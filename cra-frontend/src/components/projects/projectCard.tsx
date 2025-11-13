// src/components/projects/ProjectCard.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MoreVertical,
  Edit,
  Trash2,
  Archive,
  Copy,
  Users,
  Calendar,
  CheckSquare,
  FileText,
  Eye,
  Target,
  DollarSign
} from 'lucide-react';
import { Project } from '../../services/projectsApi';

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (projectId: string) => void;
  onArchive?: (projectId: string) => void;
  onDuplicate?: (projectId: string) => void;
  showActions?: boolean;
}

// Status colors mapping
const statusColors = {
  PLANIFIE: 'bg-gray-100 text-gray-800',
  EN_COURS: 'bg-blue-100 text-blue-800',
  SUSPENDU: 'bg-yellow-100 text-yellow-800',
  TERMINE: 'bg-green-100 text-green-800',
  ARCHIVE: 'bg-red-100 text-red-800'
};

const statusLabels = {
  PLANIFIE: 'Planifié',
  EN_COURS: 'En cours',
  SUSPENDU: 'Suspendu',
  TERMINE: 'Terminé',
  ARCHIVE: 'Archivé'
};

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEdit,
  onDelete,
  onArchive,
  onDuplicate,
  showActions = true
}) => {
  const [openDropdown, setOpenDropdown] = useState(false);

  const handleAction = (action: string) => {
    setOpenDropdown(false);
    
    switch (action) {
      case 'edit':
        onEdit?.(project);
        break;
      case 'delete':
        onDelete?.(project.id);
        break;
      case 'archive':
        onArchive?.(project.id);
        break;
      case 'duplicate':
        onDuplicate?.(project.id);
        break;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatBudget = (budget: number) => {
    return new Intl.NumberFormat('fr-FR').format(budget) + ' FCFA';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 group">
      {/* Header de la carte */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <Link
              to={`/chercheur/projects/${project.id}`}
              className="block hover:text-blue-600 transition-colors"
            >
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {project.title}
              </h3>
            </Link>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
                {statusLabels[project.status]}
              </span>
              {project.budget && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {formatBudget(project.budget)}
                </span>
              )}
            </div>
          </div>
          
          {/* Menu actions */}
          {showActions && (
            <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setOpenDropdown(!openDropdown)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              
              {openDropdown && (
                <>
                  {/* Overlay pour fermer le dropdown */}
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setOpenDropdown(false)}
                  />
                  
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border z-20">
                    <div className="py-1">
                      <Link
                        to={`/chercheur/projects/${project.id}`}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setOpenDropdown(false)}
                      >
                        <Eye className="h-4 w-4" />
                        Voir le détail
                      </Link>
                      {onEdit && (
                        <button
                          onClick={() => handleAction('edit')}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                        >
                          <Edit className="h-4 w-4" />
                          Modifier
                        </button>
                      )}
                      {onDuplicate && (
                        <button
                          onClick={() => handleAction('duplicate')}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                        >
                          <Copy className="h-4 w-4" />
                          Dupliquer
                        </button>
                      )}
                      {onArchive && project.status !== 'ARCHIVE' && (
                        <button
                          onClick={() => handleAction('archive')}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                        >
                          <Archive className="h-4 w-4" />
                          Archiver
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => handleAction('delete')}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                        >
                          <Trash2 className="h-4 w-4" />
                          Supprimer
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Corps de la carte */}
      <div className="p-4">
        {/* Description */}
        {project.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        )}

        {/* Objectifs (premiers 2) */}
        {project.objectives.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Objectifs</span>
            </div>
            <div className="space-y-1">
              {project.objectives.slice(0, 2).map((objective, index) => (
                <div key={index} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-xs font-medium min-w-[20px] text-center">
                    {index + 1}
                  </span>
                  <span className="line-clamp-1">{objective}</span>
                </div>
              ))}
              {project.objectives.length > 2 && (
                <div className="text-xs text-gray-500 mt-1">
                  +{project.objectives.length - 2} autre(s) objectif(s)
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mots-clés */}
        {project.keywords.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {project.keywords.slice(0, 3).map((keyword, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                >
                  {keyword}
                </span>
              ))}
              {project.keywords.length > 3 && (
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                  +{project.keywords.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>{project._count?.participants || 0} participants</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckSquare className="h-4 w-4" />
            <span>{project._count?.activities || 0} activités</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FileText className="h-4 w-4" />
            <span>{project._count?.documents || 0} documents</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckSquare className="h-4 w-4" />
            <span>{project._count?.tasks || 0} tâches</span>
          </div>
        </div>

        {/* Dates et créateur */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>
              {project.startDate 
                ? `Début: ${formatDate(project.startDate)}`
                : `Créé le ${formatDate(project.createdAt)}`
              }
            </span>
          </div>
          {project.endDate && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>Fin prévue: {formatDate(project.endDate)}</span>
            </div>
          )}
          {project.creator && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users className="h-4 w-4" />
              <span>
                Créé par {project.creator.firstName} {project.creator.lastName}
              </span>
            </div>
          )}
        </div>

        {/* Barre de progression (simulée pour l'instant) */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700">Progression</span>
            <span className="text-sm text-gray-500">
              {project.status === 'TERMINE' ? '100%' : 
               project.status === 'EN_COURS' ? '65%' : 
               project.status === 'PLANIFIE' ? '0%' : '45%'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                project.status === 'TERMINE' ? 'bg-green-500' :
                project.status === 'EN_COURS' ? 'bg-blue-500' :
                project.status === 'SUSPENDU' ? 'bg-yellow-500' :
                'bg-gray-400'
              }`}
              style={{
                width: project.status === 'TERMINE' ? '100%' : 
                      project.status === 'EN_COURS' ? '65%' : 
                      project.status === 'PLANIFIE' ? '0%' : '45%'
              }}
            />
          </div>
        </div>

        {/* Actions principales */}
        <div className="flex gap-2">
          <Link
            to={`/chercheur/projects/${project.id}`}
            className="flex-1 bg-blue-600 text-white text-center py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Ouvrir
          </Link>
          {onEdit && (
            <button
              onClick={() => onEdit(project)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Footer avec dernière mise à jour */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 rounded-b-lg">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Mis à jour le {formatDate(project.updatedAt)}</span>
          {project.status === 'EN_COURS' && (
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Actif
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;