// =============================================
// 1. TYPES POUR LA GESTION DES PROJETS
// =============================================

// src/types/project.types.ts
export interface CreateProjectRequest {
  title: string;
  description?: string;
  objectives: string[];
  startDate?: string; // Changé de Date à string pour correspondre à la validation Zod
  endDate?: string;   // Changé de Date à string pour correspondre à la validation Zod
  budget?: number;
  keywords: string[];
}

export interface UpdateProjectRequest {
  title?: string;
  description?: string;
  objectives?: string[];
  status?: 'PLANIFIE' | 'EN_COURS' | 'SUSPENDU' | 'TERMINE' | 'ARCHIVE';
  startDate?: string; // Changé de Date à string
  endDate?: string;   // Changé de Date à string
  budget?: number;
  keywords?: string[];
}

export interface ProjectListQuery {
  page?: number;
  limit?: number;
  status?: 'PLANIFIE' | 'EN_COURS' | 'SUSPENDU' | 'TERMINE' | 'ARCHIVE';
  creatorId?: string;
  search?: string;
  startDate?: string; // Changé de Date à string
  endDate?: string;   // Changé de Date à string
}

export interface AddParticipantRequest {
  userId: string;
  role: string; // Rôle dans le projet
}

export interface RemoveParticipantRequest {
  userId: string;
  projectId: string;
  isActive?: boolean; // Indique si le participant est actif ou non
}

export interface UpdateParticipantRequest {
  userId: string;
  projectId: string;
  role?: string; // Rôle dans le projet
  isActive?: boolean; // Indique si le participant est actif ou non
}

export interface ProjectResponse {
  id: string;
  title: string;
  description?: string;
  objectives: string[];
  status: string;
  startDate?: Date;   // Les réponses gardent Date car c'est ce que retourne la DB
  endDate?: Date;     // Les réponses gardent Date car c'est ce que retourne la DB
  budget?: number;
  keywords: string[];
  createdAt: Date;
  updatedAt: Date;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  participants?: {
    id: string;
    role: string;
    joinedAt: Date;
    isActive: boolean;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
      specialization?: string;
    };
  }[];
  activities?: {
    id: string;
    title: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    createdAt: Date;
  }[];
  _count?: {
    participants: number;
    activities: number;
    tasks: number;
    documents: number;
  };
}