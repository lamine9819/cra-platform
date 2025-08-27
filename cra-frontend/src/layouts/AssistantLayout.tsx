// src/layouts/AssistantLayout.tsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Sidebar, SidebarItem } from '../components/layout/Sidebar';
import { 
  BarChart3, 
  CheckSquare, 
  FileText, 
  Upload,
  Inbox,
  Send,
  Users,
  MessageSquare
} from 'lucide-react';

const AssistantLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigation: SidebarItem[] = [
    {
      name: 'Tableau de bord',
      href: '/assistant',
      icon: BarChart3,
    },
    {
      name: 'Mes tâches',
      href: '/assistant/tasks',
      icon: CheckSquare,
      badge: '8',
    },
    {
      name: 'Projets assignés',
      href: '/assistant/projects',
      icon: Users,
      badge: '3',
    },
    {
      name: 'Documents',
      href: '/assistant/documents',
      icon: FileText,
      children: [
        {
          name: 'Reçus',
          href: '/assistant/documents/received',
          icon: Inbox,
        },
        {
          name: 'Envoyés',
          href: '/assistant/documents/sent',
          icon: Send,
        },
        {
          name: 'Téléverser',
          href: '/assistant/documents/upload',
          icon: Upload,
        },
      ],
    },
    {
      name: 'Données reçues',
      href: '/assistant/data',
      icon: Inbox,
      badge: '15',
    },
    {
      name: 'Communications',
      href: '/assistant/communications',
      icon: MessageSquare,
      badge: '7',
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
          title="Espace Assistant"
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

export default AssistantLayout;