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
  Database,
  Target,
  Building2,
  ScrollText
} from 'lucide-react';

// Import des pages admin
import AdminDashboard from '../pages/admin/AdminDashboard';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import UsersManagement from '../pages/admin/UsersManagement';
import StrategicPlanningManagement from '../pages/admin/StrategicPlanningManagement';
import ProjectsManagement from '../pages/admin/ProjectsManagement';
import DocumentsManagement from '../pages/admin/DocumentsManagement';
import SystemConfig from '../pages/admin/SystemConfig';
import SecurityManagement from '../pages/admin/SecurityManagement';
import PartnersManagement from '../pages/admin/PartnersManagement';
import ConventionsManagement from '../pages/admin/ConventionsManagement';

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
    },
    {
      name: 'Planification stratégique',
      href: '/admin/strategic-planning',
      icon: Target,
    },
    {
      name: 'Projets & Activités',
      href: '/admin/projects',
      icon: FileText,
    },
    {
      name: 'Partenaires',
      href: '/admin/partners',
      icon: Building2,
    },
    {
      name: 'Conventions',
      href: '/admin/conventions',
      icon: ScrollText,
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
              <Route index element={<AdminDashboardPage />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="users" element={<UsersManagement />} />
              <Route path="strategic-planning" element={<StrategicPlanningManagement />} />
              <Route path="projects" element={<ProjectsManagement />} />
              <Route path="partners" element={<PartnersManagement />} />
              <Route path="conventions" element={<ConventionsManagement />} />
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