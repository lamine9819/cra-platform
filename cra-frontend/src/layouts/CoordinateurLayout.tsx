// src/layouts/CoordinateurLayout.tsx
import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Sidebar, SidebarItem } from '../components/layout/Sidebar';
import {
  BarChart3,
  Clipboard,
  FileText,
  Upload,
  CheckSquare,
  FormInput,
  Download,
  Database,
  FolderKanban,
  Users
} from 'lucide-react';

// Import des pages
import ChercheurDashboard from '../pages/chercheur/ChercheurDashboard';
import ProjectsList from '../pages/chercheur/ProjectsList';
import ProjectDetail from '../pages/chercheur/ProjectDetail';
import CreateProject from '../pages/chercheur/CreateProject';
import EditProject from '../pages/chercheur/EditProject';
import ActivitiesList from '../pages/chercheur/ActivitiesList';
import ActivityDetail from '../pages/chercheur/ActivityDetail';
import CreateActivity from '../pages/chercheur/CreateActivity';
import EditActivity from '../pages/chercheur/EditActivity';
import TasksList from '../pages/chercheur/TasksList';
import CreateTask from '../pages/chercheur/CreateTask';
import EditTask from '../pages/chercheur/EditTask';
import FormsList from '../pages/chercheur/FormsList';
import CreateForm from '../pages/chercheur/CreateForm';
import FormCollectPage from '../pages/chercheur/FormCollectPage';
import CalendarPage from '../pages/chercheur/CalendarPage';
import SettingsPage from '../pages/chercheur/SettingsPage';

const CoordinateurLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigation: SidebarItem[] = [
    {
      name: 'Tableau de bord',
      href: '/coordonateur',
      icon: BarChart3,
    },
    {
      name: 'Projets',
      href: '/coordonateur/projects',
      icon: FolderKanban,
    },
    {
      name: 'Mes tâches',
      href: '/coordonateur/tasks',
      icon: CheckSquare,
      badge: '12',
    },
    {
      name: 'Équipes',
      href: '/coordonateur/teams',
      icon: Users,
    },
    {
      name: 'Formulaires',
      href: '/coordonateur/forms',
      icon: FormInput,
      children: [
        {
          name: 'Créer formulaire',
          href: '/coordonateur/forms/create',
          icon: FormInput,
        },
        {
          name: 'Mes formulaires',
          href: '/coordonateur/forms/mine',
          icon: Clipboard,
        },
        {
          name: 'Réponses collectées',
          href: '/coordonateur/forms/responses',
          icon: Database,
        },
      ],
    },
    {
      name: 'Collecte de données',
      href: '/coordonateur/data-collection',
      icon: Clipboard,
      badge: '6',
    },
    {
      name: 'Documents',
      href: '/coordonateur/documents',
      icon: FileText,
      children: [
        {
          name: 'Mes documents',
          href: '/coordonateur/documents/mine',
          icon: FileText,
        },
        {
          name: 'Téléverser',
          href: '/coordonateur/documents/upload',
          icon: Upload,
        },
        {
          name: 'Télécharger données',
          href: '/coordonateur/documents/download',
          icon: Download,
        },
      ],
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        navigation={navigation}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Espace Coordonateur de Projet"
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />

        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <Routes>
              <Route index element={<ChercheurDashboard />} />

              {/* Projets */}
              <Route path="projects">
                <Route index element={<ProjectsList />} />
                <Route path="new" element={<CreateProject />} />
                <Route path=":id" element={<ProjectDetail />} />
                <Route path=":id/edit" element={<EditProject />} />
              </Route>

              {/* Activités */}
              <Route path="activities">
                <Route index element={<ActivitiesList />} />
                <Route path="new" element={<CreateActivity />} />
                <Route path=":id" element={<ActivityDetail />} />
                <Route path=":id/edit" element={<EditActivity />} />
              </Route>

              {/* Tâches */}
              <Route path="tasks">
                <Route index element={<TasksList />} />
                <Route path="new" element={<CreateTask />} />
                <Route path=":id/edit" element={<EditTask />} />
              </Route>

              {/* Formulaires */}
              <Route path="forms">
                <Route index element={<FormsList />} />
                <Route path="new" element={<CreateForm />} />
                <Route path=":id/edit" element={<CreateForm />} />
                <Route path=":id/collect" element={<FormCollectPage />} />
                <Route path="create" element={<CreateForm />} />
                <Route path="mine" element={<FormsList />} />
                <Route path="responses" element={<div>Réponses collectées</div>} />
              </Route>

              {/* Calendrier */}
              <Route path="calendar" element={<CalendarPage />} />

              {/* Documents */}
              <Route path="documents">
                <Route index element={<div>Documents</div>} />
                <Route path="mine" element={<div>Mes documents</div>} />
                <Route path="upload" element={<div>Upload</div>} />
                <Route path="download" element={<div>Download</div>} />
              </Route>

              {/* Collecte de données */}
              <Route path="data-collection" element={<div>Collecte de données</div>} />

              {/* Équipes */}
              <Route path="teams" element={<div>Gestion des équipes</div>} />

              {/* Paramètres */}
              <Route path="settings" element={<SettingsPage />} />

              {/* Redirect par défaut */}
              <Route path="*" element={<Navigate to="/coordonateur" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CoordinateurLayout;
