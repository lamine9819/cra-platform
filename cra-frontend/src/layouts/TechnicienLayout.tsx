// src/layouts/TechnicienLayout.tsx
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
  Database
} from 'lucide-react';

const TechnicienLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigation: SidebarItem[] = [
    {
      name: 'Tableau de bord',
      href: '/technicien',
      icon: BarChart3,
    },
    {
      name: 'Mes tâches',
      href: '/technicien/tasks',
      icon: CheckSquare,
      badge: '12',
    },
    {
      name: 'Formulaires',
      href: '/technicien/forms',
      icon: FormInput,
      children: [
        {
          name: 'Créer formulaire',
          href: '/technicien/forms/create',
          icon: FormInput,
        },
        {
          name: 'Mes formulaires',
          href: '/technicien/forms/mine',
          icon: Clipboard,
        },
        {
          name: 'Réponses collectées',
          href: '/technicien/forms/responses',
          icon: Database,
        },
      ],
    },
    {
      name: 'Collecte de données',
      href: '/technicien/data-collection',
      icon: Clipboard,
      badge: '6',
    },
    {
      name: 'Documents',
      href: '/technicien/documents',
      icon: FileText,
      children: [
        {
          name: 'Mes documents',
          href: '/technicien/documents/mine',
          icon: FileText,
        },
        {
          name: 'Téléverser',
          href: '/technicien/documents/upload',
          icon: Upload,
        },
        {
          name: 'Télécharger données',
          href: '/technicien/documents/download',
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
          title="Espace Technicien"
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

export default TechnicienLayout;