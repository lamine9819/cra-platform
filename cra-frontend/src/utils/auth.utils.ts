// =============================================
// 10. UTILITAIRES ET HELPERS
// =============================================

// src/utils/auth.utils.ts
import { UserRole } from '../types/auth.types';

export const roleLabels: Record<UserRole, string> = {
  [UserRole.ADMINISTRATEUR]: 'Administrateur',
  [UserRole.CHERCHEUR]: 'Chercheur',
  [UserRole.ASSISTANT_CHERCHEUR]: 'Assistant de Recherche',
  [UserRole.TECHNICIEN_SUPERIEUR]: 'Technicien Supérieur',
};

export const getRoleLabel = (role: UserRole): string => {
  return roleLabels[role] || role;
};

export const hasPermission = (userRole: UserRole, requiredRoles: UserRole[]): boolean => {
  return requiredRoles.includes(userRole);
};

export const isAdmin = (role: UserRole): boolean => {
  return role === UserRole.ADMINISTRATEUR;
};

export const isChercheur = (role: UserRole): boolean => {
  return role === UserRole.CHERCHEUR;
};
