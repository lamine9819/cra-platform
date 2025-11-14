// src/layouts/ChercheurLayout.tsx - Version adaptée à votre structure
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Sidebar, SidebarItem } from '../components/layout/Sidebar';
import {
  BarChart3,
  Briefcase,
  FileText,
  Users,
  Calendar,
  CheckSquare,
  Presentation,
  MessageSquare,
  Activity,
  Archive,
  GraduationCap,
} from 'lucide-react';

// Import des pages chercheur existantes
import ChercheurDashboard from '../pages/chercheur/ChercheurDashboard';

// Import des pages projets
import ProjectsList from '../pages/chercheur/ProjectsList';
import ProjectDetail from '../pages/chercheur/ProjectDetail';
import CreateProject from '../pages/chercheur/CreateProject';
import EditProject from '../pages/chercheur/EditProject';

// Import des pages activités
import ActivitiesList from '../pages/chercheur/ActivitiesList';
import CreateActivity from '../pages/chercheur/CreateActivity';
import ActivityDetail from '../pages/chercheur/ActivityDetail';
import EditActivity from '../pages/chercheur/EditActivity';

// Import des pages tâches
import TasksList from '../pages/chercheur/TasksList';
import CreateTask from '../pages/chercheur/CreateTask';
import TaskDetail from '../pages/chercheur/TaskDetail';
import EditTask from '../pages/chercheur/EditTask';

// Import des pages documents
import { DocumentsHub } from '../pages/chercheur/DocumentsHub';

// Import des pages formulaires (nouvelles)
import FormsList from '../pages/chercheur/FormsList';
import FormDetail from '../pages/chercheur/FormDetail';
import CreateForm from '../pages/chercheur/CreateForm';
import FormCollectPage from '../pages/chercheur/FormCollectPage';

// Import des pages séminaires
import SeminarsList from '../pages/chercheur/SeminarsList';
import SeminarDetail from '../pages/chercheur/SeminarDetail';
import CreateSeminar from '../pages/chercheur/CreateSeminar';
import EditSeminar from '../pages/chercheur/EditSeminar';

// Import des pages rapports et discussions
import ReportsPage from '../pages/chercheur/ReportsPage';
import DiscussionsPage from '../pages/chercheur/DiscussionsPages';

// Import de la page formations
import Formations from '../pages/chercheur/Formations';

// Import du provider documents (existant)
import { DocumentProvider } from '../contexts/DocumentContext';

const ChercheurLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigation: SidebarItem[] = [
    {
      name: 'Tableau de bord',
      href: '/chercheur',
      icon: BarChart3,
    },
    {
      name: 'Mes projets',
      href: '/chercheur/projects',
      icon: Briefcase,
    },
    {
      name: 'Activités',
      href: '/chercheur/activities',
      icon: Activity,
    },
    {
      name: 'Documents',
      href: '/chercheur/documents',
      icon: FileText,
    },
    // Ajout des formulaires dans la navigation
    {
      name: 'Formulaires',
      href: '/chercheur/forms',
      icon: Archive,
    },
    {
      name: 'Séminaires',
      href: '/chercheur/seminars',
      icon: Calendar,
    },
    {
      name: 'Formations',
      href: '/chercheur/formations',
      icon: GraduationCap,
    },
    {
      name: 'Rapports',
      href: '/chercheur/reports',
      icon: Presentation,
    },
    {
      name: 'Discussions',
      href: '/chercheur/discussions',
      icon: MessageSquare,
    },
  ];

  return (
    <DocumentProvider>
      <div className="flex h-screen bg-gray-50">
        <Sidebar 
          navigation={navigation}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            title="Espace Chercheur"
            onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            isSidebarOpen={isSidebarOpen}
          />
          
          <main className="flex-1 overflow-auto">
            <div className="p-6">
              <Routes>
                {/* Dashboard */}
                <Route index element={<ChercheurDashboard />} />
                
                {/* ROUTES DES PROJETS (existantes) */}
                <Route path="projects">
                  <Route index element={<ProjectsList />} />
                  <Route path="active" element={<ProjectsList />} />
                  <Route path="new" element={<CreateProject />} />
                  <Route path=":id" element={<ProjectDetail />} />
                  <Route path=":id/edit" element={<EditProject />} />
                  <Route path=":id/activities/new" element={<CreateActivity />} />
                  <Route path=":id/tasks/new" element={<CreateTask />} />
                </Route>
                
                {/* ROUTES DES ACTIVITÉS (existantes) */}
                <Route path="activities" element={<ActivitiesList />} />
                <Route path="activities/create" element={<CreateActivity />} />
                <Route path="activities/:id" element={<ActivityDetail />} />
                <Route path="activities/:id/edit" element={<EditActivity />} />
                <Route path="activities/:id/tasks/new" element={<CreateTask />} />
                
                {/* ROUTES DES DOCUMENTS (mise à jour avec DocumentsHub) */}
                <Route path="documents" element={<DocumentsHub />} />
                
                {/* ROUTES DES FORMULAIRES (nouvelles - intégrées) */}
                <Route path="forms">
                  <Route index element={<FormsList />} />
                  <Route path="new" element={<CreateForm />} />
                  <Route path=":id" element={<FormDetail />} />
                  <Route path=":id/edit" element={<CreateForm />} />
                  <Route path=":id/collect" element={<FormCollectPage />} />
                </Route>
                
                {/* ROUTES DES SÉMINAIRES (existantes) */}
                <Route path="seminars">
                  <Route index element={<SeminarsList />} />
                  <Route path="new" element={<CreateSeminar />} />
                  <Route path=":id" element={<SeminarDetail />} />
                  <Route path=":id/edit" element={<EditSeminar />} />
                </Route>
                
                {/* ROUTES DES RAPPORTS ET DISCUSSIONS (existantes) */}
                <Route path="reports" element={<ReportsPage />} />
                <Route path="discussions" element={<DiscussionsPage />} />

                {/* ROUTE DES FORMATIONS */}
                <Route path="formations" element={<Formations />} />

                {/* ROUTE 404 pour les sous-routes */}
                <Route path="*" element={
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Page non trouvée</h3>
                    <p className="text-gray-600">La page que vous cherchez n'existe pas dans l'espace chercheur.</p>
                  </div>
                } />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </DocumentProvider>
  );
};

export default ChercheurLayout;