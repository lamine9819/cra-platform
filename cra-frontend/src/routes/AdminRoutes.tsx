// =============================================
// 5. ROUTES SPÉCIFIQUES PAR RÔLE
// =============================================

// src/routes/AdminRoutes.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminDashboard from '../pages/admin/AdminDashboard';
import UsersManagement from '@/pages/admin/UsersManagement';
import StrategicPlanningManagement from '../pages/admin/StrategicPlanningManagement';

const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<AdminDashboard />} />
      <Route path="users" element={<UsersManagement />} />
      <Route path="strategic-planning" element={<StrategicPlanningManagement />} />
    </Routes>
  );
};

export default AdminRoutes;