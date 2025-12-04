// src/routes/AppRoutes.tsx - Adaptation avec votre structure existante
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/routing/ProtectedRoute';
import { UserRole } from '../types/auth.types';
import { useAuth } from '../hooks/useAuth';

// Import des layouts existants
import AdminLayout from '../layouts/AdminLayout';
import ChercheurLayout from '../layouts/ChercheurLayout';
import CoordinateurLayout from '../layouts/CoordinateurLayout';

// Import des pages existantes
import LoginPage from '../pages/auth/LoginPage';
import HomePage from '../pages/public/HomePage';
import NotFoundPage from '../pages/errors/NotFoundPage';

// Import des pages publiques de formulaires
import PublicFormPage from '../pages/PublicFormPage';

// Composant pour redirection automatique basée sur le rôle
const RoleBasedRedirect: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const redirectPath = {
    [UserRole.ADMINISTRATEUR]: '/admin',
    [UserRole.CHERCHEUR]: '/chercheur',
    [UserRole.COORDONATEUR_PROJET]: '/coordonateur',
  }[user.role];

  return <Navigate to={redirectPath || '/login'} replace />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Formulaire public partagé (sans authentification) */}
      <Route path="/forms/public/:shareToken" element={<PublicFormPage />} />

      {/* Routes administrateur */}
      <Route 
        path="/admin/*" 
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMINISTRATEUR]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      />

      {/* Routes chercheur */}
      <Route
        path="/chercheur/*"
        element={
          <ProtectedRoute allowedRoles={[UserRole.CHERCHEUR]}>
            <ChercheurLayout />
          </ProtectedRoute>
        }
      />

      {/* Routes coordonateur de projet */}
      <Route
        path="/coordonateur/*"
        element={
          <ProtectedRoute allowedRoles={[UserRole.COORDONATEUR_PROJET]}>
            <CoordinateurLayout />
          </ProtectedRoute>
        }
      />

      {/* Redirection automatique basée sur le rôle */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <RoleBasedRedirect />
          </ProtectedRoute>
        } 
      />

      {/* Page 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;