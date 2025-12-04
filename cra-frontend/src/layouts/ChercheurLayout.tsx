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
  Activity,
  GraduationCap,
  BookOpen,
  MessageCircle,
  ClipboardList,
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

// Import de la page calendrier (événements et séminaires)
import CalendarPage from '../pages/chercheur/CalendarPage';

// Import de la page formations
import Formations from '../pages/chercheur/Formations';

// Import des pages publications
import PublicationsList from '../pages/chercheur/PublicationsList';
import PublicationDetail from '../pages/chercheur/PublicationDetail';
import CreatePublication from '../pages/chercheur/CreatePublication';

// Import de la page profil complète
import CompleteProfilePage from '../pages/chercheur/CompleteProfilePage';

// Import de la page paramètres
import SettingsPage from '../pages/chercheur/SettingsPage';

// Import de la page Chat
import ChatPage from '../pages/ChatPage';

// Import des pages formulaires
import FormsPage from '../pages/chercheur/FormsPage';
import FormCreatePage from '../pages/chercheur/FormCreatePage';
import FormEditPage from '../pages/chercheur/FormEditPage';
import FormDetailPage from '../pages/chercheur/FormDetailPage';

// Import du provider documents (existant)
import { DocumentProvider } from '../contexts/DocumentContext';
import { useAuth } from '../hooks/useAuth';

const ChercheurLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();

  const navigation: SidebarItem[] = [
    {
      name: 'Tableau de bord',
      href: '/chercheur',
      icon: BarChart3,
    },
    {
      name: 'Mon Profil',
      href: '/chercheur/profile',
      icon: Users,
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
    {
      name: 'Formulaires',
      href: '/chercheur/forms',
      icon: ClipboardList,
    },
    {
      name: 'Publications',
      href: '/chercheur/publications',
      icon: BookOpen,
    },
    {
      name: 'Calendrier',
      href: '/chercheur/calendar',
      icon: Calendar,
    },
    {
      name: 'Formations',
      href: '/chercheur/formations',
      icon: GraduationCap,
    },
    {
      name: 'Chat',
      href: '/chercheur/chat',
      icon: MessageCircle,
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

                {/* ROUTES DES PUBLICATIONS */}
                <Route path="publications">
                  <Route index element={<PublicationsList />} />
                  <Route path="create" element={<CreatePublication />} />
                  <Route path=":id" element={<PublicationDetail />} />
                  <Route path=":id/edit" element={<CreatePublication />} />
                </Route>

                {/* ROUTES DES FORMULAIRES */}
                <Route path="forms">
                  <Route index element={<FormsPage />} />
                  <Route path="create" element={<FormCreatePage />} />
                  <Route path=":id" element={<FormDetailPage />} />
                  <Route path=":id/edit" element={<FormEditPage />} />
                </Route>

                {/* ROUTE DU CALENDRIER (événements et séminaires) */}
                <Route path="calendar" element={<CalendarPage />} />

                {/* ROUTE DES FORMATIONS */}
                <Route path="formations" element={<Formations />} />

                {/* ROUTE DU PROFIL */}
                <Route path="profile" element={<CompleteProfilePage />} />

                {/* ROUTE DES PARAMÈTRES */}
                <Route path="settings" element={<SettingsPage />} />

                {/* ROUTE DU CHAT */}
                <Route path="chat" element={
                  <ChatPage
                    currentUserId={user?.id || ''}
                    currentUserName={user ? `${user.firstName} ${user.lastName}` : ''}
                  />
                } />

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