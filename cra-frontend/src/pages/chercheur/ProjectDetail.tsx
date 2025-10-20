// src/pages/chercheur/ProjectDetail.tsx
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Edit,
  Users,
  Handshake,
  DollarSign,
  BarChart3,
  Calendar,
  MapPin,
  Target,
  AlertCircle,
} from 'lucide-react';
import { projectsApi } from '../../services/projectsApi';
import { Button } from '../../components/ui/Button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ProjectStatusLabels,
  ProjectStatusColors,
  ResearchTypeLabels,
} from '../../types/project.types';
import ProjectParticipants from '../../components/projects/ProjectParticipants';
import ProjectPartnerships from '../../components/projects/ProjectPartnerships';
import ProjectFunding from '../../components/projects/ProjectFunding';
import ProjectAnalytics from '../../components/projects/ProjectAnalytics';

type TabType = 'overview' | 'participants' | 'partnerships' | 'funding' | 'analytics';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const { data: project, isLoading, isError, error } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsApi.getProjectById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-gray-200 rounded-lg"></div>
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <div className="text-red-600 mb-2">Erreur de chargement</div>
        <p className="text-gray-600 text-sm mb-6">
          {(error as any)?.message || 'Projet introuvable'}
        </p>
        <Link to="/chercheur/projects">
          <Button variant="outline">Retour à la liste</Button>
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'overview' as TabType, label: 'Vue d\'ensemble', icon: Target },
    { id: 'participants' as TabType, label: 'Participants', icon: Users, count: project.participants?.length || 0 },
    { id: 'partnerships' as TabType, label: 'Partenariats', icon: Handshake, count: project.partnerships?.length || 0 },
    { id: 'funding' as TabType, label: 'Financement', icon: DollarSign, count: project.fundings?.length || 0 },
    { id: 'analytics' as TabType, label: 'Analyse', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/chercheur/projects')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
              {project.code && (
                <p className="text-sm text-gray-600 mt-1">Code: {project.code}</p>
              )}
            </div>
          </div>
          <Link to={`/chercheur/projects/${id}/edit`}>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <Edit className="w-4 h-4 mr-2" />
              Modifier
            </Button>
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${ProjectStatusColors[project.status]}`}>
            {ProjectStatusLabels[project.status]}
          </span>
          {project.researchType && (
            <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
              {ResearchTypeLabels[project.researchType]}
            </span>
          )}
          {project.theme && (
            <span className="px-3 py-1 text-sm font-semibold rounded-full bg-purple-100 text-purple-800">
              {project.theme.name}
            </span>
          )}
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm whitespace-nowrap
                    ${isActive
                      ? 'border-green-600 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`px-2 py-0.5 text-xs rounded-full ${isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {project.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
                </div>
              )}

              {project.objectives && project.objectives.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Objectifs</h3>
                  <ul className="space-y-2">
                    {project.objectives.map((objective, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <span className="text-gray-700 pt-0.5">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations du projet</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {project.startDate && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Période</p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(project.startDate), 'dd MMMM yyyy', { locale: fr })}
                          {project.endDate && ` - ${format(new Date(project.endDate), 'dd MMMM yyyy', { locale: fr })}`}
                        </p>
                      </div>
                    </div>
                  )}

                  {project.budget && (
                    <div className="flex items-start gap-3">
                      <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Budget</p>
                        <p className="text-sm text-gray-600">
                          {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(project.budget)}
                        </p>
                      </div>
                    </div>
                  )}

                  {project.interventionRegion && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Région d'intervention</p>
                        <p className="text-sm text-gray-600">{project.interventionRegion}</p>
                      </div>
                    </div>
                  )}

                  {project.creator && (
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Créateur</p>
                        <p className="text-sm text-gray-600">
                          {project.creator.firstName} {project.creator.lastName}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {(project.strategicPlan || project.strategicAxis || project.subAxis || project.program) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Cadrage stratégique</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    {project.strategicPlan && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Plan stratégique</p>
                        <p className="text-sm text-gray-600">{project.strategicPlan}</p>
                      </div>
                    )}
                    {project.strategicAxis && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Axe stratégique</p>
                        <p className="text-sm text-gray-600">{project.strategicAxis}</p>
                      </div>
                    )}
                    {project.subAxis && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Sous-axe</p>
                        <p className="text-sm text-gray-600">{project.subAxis}</p>
                      </div>
                    )}
                    {project.program && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Programme</p>
                        <p className="text-sm text-gray-600">{project.program}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {project.keywords && project.keywords.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Mots-clés</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'participants' && (
            <ProjectParticipants
              projectId={id!}
              participants={project.participants || []}
            />
          )}

          {activeTab === 'partnerships' && (
            <ProjectPartnerships
              projectId={id!}
              partnerships={project.partnerships || []}
            />
          )}

          {activeTab === 'funding' && (
            <ProjectFunding
              projectId={id!}
              fundings={project.fundings || []}
            />
          )}

          {activeTab === 'analytics' && (
            <ProjectAnalytics projectId={id!} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
