// =============================================
// 3. CORRECTION DES LAYOUTS
// =============================================

// src/layouts/AdminLayout.tsx (VERSION CORRIGÉE)
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Sidebar, SidebarItem } from '../components/layout/Sidebar';
import { 
  BarChart3, 
  Users, 
  Settings, 
  Shield, 
  FileText, 
  Database

} from 'lucide-react';

// Import des pages admin
import AdminDashboard from '../pages/admin/AdminDashboard';
import UsersManagement from '../pages/admin/UsersManagement';
import ProjectsManagement from '../pages/admin/ProjectsManagement';
import DocumentsManagement from '../pages/admin/DocumentsManagement';
import SystemConfig from '../pages/admin/SystemConfig';
import SecurityManagement from '../pages/admin/SecurityManagement';

const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigation: SidebarItem[] = [
    {
      name: 'Tableau de bord',
      href: '/admin',
      icon: BarChart3,
    },
    {
      name: 'Gestion des utilisateurs',
      href: '/admin/users',
      icon: Users,
      badge: '24',
    },
    {
      name: 'Projets & Activités',
      href: '/admin/projects',
      icon: FileText,
    },
    {
      name: 'Documents',
      href: '/admin/documents',
      icon: Database,
    },
    {
      name: 'Système',
      href: '/admin/system',
      icon: Settings,
    },
    {
      name: 'Sécurité',
      href: '/admin/security',
      icon: Shield,
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
          title="Administration"
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
        
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <Routes>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<UsersManagement />} />
              <Route path="projects" element={<ProjectsManagement />} />
              <Route path="documents" element={<DocumentsManagement />} />
              <Route path="system" element={<SystemConfig />} />
              <Route path="security" element={<SecurityManagement />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;