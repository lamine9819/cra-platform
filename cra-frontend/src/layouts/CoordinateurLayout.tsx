// src/layouts/CoordinateurLayout.tsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
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
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default CoordinateurLayout;
