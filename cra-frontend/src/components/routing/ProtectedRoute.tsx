// =============================================
// 1. CORRECTION DU COMPOSANT DE PROTECTION DES ROUTES
// =============================================

// src/components/routing/ProtectedRoute.tsx (VERSION CORRIGÉE)
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types/auth.types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requireAuth = true
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // Afficher un loader pendant la vérification
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Vérifier l'authentification
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Vérifier les rôles autorisés seulement si des rôles sont spécifiés
  if (allowedRoles && allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-red-100">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Accès non autorisé</h1>
            <p className="text-gray-600 mb-6">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </p>
            <button
              onClick={() => window.history.back()}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Retour
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};