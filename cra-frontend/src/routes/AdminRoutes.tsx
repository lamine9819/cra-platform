// =============================================
// 5. ROUTES SPÉCIFIQUES PAR RÔLE
// =============================================

// src/routes/AdminRoutes.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminDashboard from '../pages/admin/AdminDashboard';
import UsersManagement from '@/pages/admin/UsersManagement';
//import UsersManagement from '../pages/admin/UsersManagement';
//import ProjectsManagement from '../pages/admin/ProjectsManagement';
//import DocumentsManagement from '../pages/admin/DocumentsManagement';
//import SystemConfig from '../pages/admin/SystemConfig';
//import SecurityManagement from '../pages/admin/SecurityManagement';

const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UsersManagement />} />
      
    </Routes>
  );
};

export default AdminRoutes;