// src/layouts/ChercheurLayout.tsx - Layout unique pour CHERCHEUR et COORDONATEUR_PROJET
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
  Activity,
  GraduationCap,
  BookOpen,
  MessageCircle,
  ClipboardList,
  FileBarChart,
} from 'lucide-react';

// Import des pages
import ChercheurDashboard from '../pages/chercheur/ChercheurDashboard';
import ProjectsList from '../pages/chercheur/ProjectsList';
import ProjectDetail from '../pages/chercheur/ProjectDetail';
import CreateProject from '../pages/chercheur/CreateProject';
import EditProject from '../pages/chercheur/EditProject';
import ActivitiesList from '../pages/chercheur/ActivitiesList';
import CreateActivity from '../pages/chercheur/CreateActivity';
import ActivityDetail from '../pages/chercheur/ActivityDetail';
import EditActivity from '../pages/chercheur/EditActivity';
import TasksList from '../pages/chercheur/TasksList';
import CreateTask from '../pages/chercheur/CreateTask';
import TaskDetail from '../pages/chercheur/TaskDetail';
import EditTask from '../pages/chercheur/EditTask';
import { DocumentsHub } from '../pages/chercheur/DocumentsHub';
import CalendarPage from '../pages/chercheur/CalendarPage';
import Formations from '../pages/chercheur/Formations';
import PublicationsList from '../pages/chercheur/PublicationsList';
import PublicationDetail from '../pages/chercheur/PublicationDetail';
import CreatePublication from '../pages/chercheur/CreatePublication';
import CompleteProfilePage from '../pages/chercheur/CompleteProfilePage';
import SettingsPage from '../pages/chercheur/SettingsPage';
import ChatPage from '../pages/ChatPage';
import FormsPage from '../pages/chercheur/FormsPage';
import FormCreatePage from '../pages/chercheur/FormCreatePage';
import FormEditPage from '../pages/chercheur/FormEditPage';
import FormDetailPage from '../pages/chercheur/FormDetailPage';
import ReportsPage from '../pages/chercheur/ReportsPage';
import { DocumentProvider } from '../contexts/DocumentContext';
import { useAuth } from '../hooks/useAuth';

const ChercheurLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();
  const isCoordinator = user?.role === 'COORDONATEUR_PROJET';

  const baseNavigation: SidebarItem[] = [
    { name: 'Tableau de bord', href: '/chercheur', icon: BarChart3 },
    { name: 'Mon Profil', href: '/chercheur/profile', icon: Users },
    { name: isCoordinator ? 'Tous les projets' : 'Mes projets', href: '/chercheur/projects', icon: Briefcase },
    { name: 'Activités', href: '/chercheur/activities', icon: Activity },
    { name: 'Documents', href: '/chercheur/documents', icon: FileText },
    { name: 'Formulaires', href: '/chercheur/forms', icon: ClipboardList },
    { name: 'Publications', href: '/chercheur/publications', icon: BookOpen },
    { name: 'Calendrier', href: '/chercheur/calendar', icon: Calendar },
    { name: 'Formations', href: '/chercheur/formations', icon: GraduationCap },
    { name: 'Chat', href: '/chercheur/chat', icon: MessageCircle },
  ];

  const navigation = isCoordinator
    ? [...baseNavigation, { name: 'Rapports', href: '/chercheur/reports', icon: FileBarChart }]
    : baseNavigation;

  const headerTitle = isCoordinator ? 'Espace Coordinateur de Projet' : 'Espace Chercheur';

  return (
    <DocumentProvider>
      <div className="flex h-screen bg-gray-50">
        <Sidebar navigation={navigation} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title={headerTitle} onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />
          <main className="flex-1 overflow-auto">
            <div className="p-6">
              <Routes>
                <Route index element={<ChercheurDashboard />} />
                <Route path="projects">
                  <Route index element={<ProjectsList />} />
                  <Route path="active" element={<ProjectsList />} />
                  <Route path="new" element={<CreateProject />} />
                  <Route path=":id" element={<ProjectDetail />} />
                  <Route path=":id/edit" element={<EditProject />} />
                  <Route path=":id/activities/new" element={<CreateActivity />} />
                  <Route path=":id/tasks/new" element={<CreateTask />} />
                </Route>
                <Route path="activities" element={<ActivitiesList />} />
                <Route path="activities/create" element={<CreateActivity />} />
                <Route path="activities/:id" element={<ActivityDetail />} />
                <Route path="activities/:id/edit" element={<EditActivity />} />
                <Route path="activities/:id/tasks/new" element={<CreateTask />} />
                <Route path="documents" element={<DocumentsHub />} />
                <Route path="publications">
                  <Route index element={<PublicationsList />} />
                  <Route path="create" element={<CreatePublication />} />
                  <Route path=":id" element={<PublicationDetail />} />
                  <Route path=":id/edit" element={<CreatePublication />} />
                </Route>
                <Route path="forms">
                  <Route index element={<FormsPage />} />
                  <Route path="create" element={<FormCreatePage />} />
                  <Route path=":id" element={<FormDetailPage />} />
                  <Route path=":id/edit" element={<FormEditPage />} />
                </Route>
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="formations" element={<Formations />} />
                <Route path="profile" element={<CompleteProfilePage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="chat" element={<ChatPage currentUserId={user?.id || ''} currentUserName={user ? `${user.firstName} ${user.lastName}` : ''} />} />
                {isCoordinator && <Route path="reports" element={<ReportsPage />} />}
                <Route path="*" element={<div className="text-center py-12"><h3 className="text-lg font-medium text-gray-900 mb-2">Page non trouvée</h3><p className="text-gray-600">La page que vous cherchez n'existe pas.</p></div>} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </DocumentProvider>
  );
};

export default ChercheurLayout;
