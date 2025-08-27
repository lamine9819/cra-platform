// =============================================
// 1. TYPES POUR LA GESTION DES UTILISATEURS
// =============================================

// src/types/user.types.ts
export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'CHERCHEUR' | 'ASSISTANT_CHERCHEUR' | 'TECHNICIEN_SUPERIEUR' | 'ADMINISTRATEUR';
  phoneNumber?: string;
  specialization?: string;
  department?: string;
  supervisorId?: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  specialization?: string;
  department?: string;
  supervisorId?: string;
  isActive?: boolean;
}

export interface AssignSupervisorRequest {
  supervisorId: string;
}

export interface UserListQuery {
  page?: number;
  limit?: number;
  role?: string;
  department?: string;
  isActive?: boolean;
  search?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phoneNumber?: string;
  specialization?: string;
  department?: string;
  isActive: boolean;
  supervisor?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  supervisedUsers?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}