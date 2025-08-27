// src/services/projectsApi.ts
import api from './api';

// =============================================
// TYPES ET INTERFACES
// =============================================

export interface Project {
  id: string;
  title: string;
  description?: string;
  objectives: string[];
  status: 'PLANIFIE' | 'EN_COURS' | 'SUSPENDU' | 'TERMINE' | 'ARCHIVE';
  startDate?: string;
  endDate?: string;
  budget?: number;
  keywords: string[];
  createdAt: string;
  updatedAt: string;
  creatorId: string;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  participants: ProjectParticipant[];
  activities: any[];
  tasks: any[];
  documents: any[];
  _count?: {
    participants: number;
    activities: number;
    tasks: number;
    documents: number;
  };
}

export interface ProjectParticipant {
  id: string;
  role: string;
  joinedAt: string;
  leftAt?: string;
  isActive: boolean;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    department?: string;
    specialization?: string;
  };
}

export interface CreateProjectRequest {
  title: string;
  description?: string;
  objectives: string[];
  status?: 'PLANIFIE' | 'EN_COURS' | 'SUSPENDU' | 'TERMINE' | 'ARCHIVE';
  startDate?: string;
  endDate?: string;
  budget?: number;
  keywords: string[];
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {}

export interface AddParticipantRequest {
  userId: string;
  role: string;
}

export interface ProjectFilters {
  status?: string;
  search?: string;
  creatorId?: string;
  participantId?: string;
  page?: number;
  limit?: number;
  sortBy?: 'title' | 'createdAt' | 'updatedAt' | 'startDate';
  sortOrder?: 'asc' | 'desc';
}

// =============================================
// SERVICE API PROJECTS
// =============================================

class ProjectsApiService {
  private baseUrl = '/projects';

  // Créer un nouveau projet
  async createProject(data: CreateProjectRequest): Promise<Project> {
    try {
      const response = await api.post(this.baseUrl, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création du projet');
    }
  }

  // Dans projectsApi.ts, assure-toi que listProjects gère bien la réponse vide :
async listProjects(filters: ProjectFilters = {}): Promise<{
  projects: Project[];
  pagination: any;
}> {
  try {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    console.log('🔍 [API] URL appelée:', `${this.baseUrl}?${params.toString()}`);
    
    const response = await api.get(`${this.baseUrl}?${params.toString()}`);
    
    console.log('🔍 [API] Réponse complète:', response);
    console.log('🔍 [API] Réponse data:', response.data);
    
    // Gérer différents formats de réponse
    let projects = [];
    let pagination = { page: 1, limit: 12, total: 0, totalPages: 0 };
    
    if (response.data) {
      // Format: { success: true, data: [...], pagination: {...} }
      if (response.data.data) {
        projects = response.data.data;
        pagination = response.data.pagination || pagination;
      }
      // Format alternatif: { projects: [...], pagination: {...} }
      else if (response.data.projects) {
        projects = response.data.projects;
        pagination = response.data.pagination || pagination;
      }
      // Format direct: [...]
      else if (Array.isArray(response.data)) {
        projects = response.data;
      }
    }
    
    console.log('🔍 [API] Projets extraits:', {
      count: projects.length,
      projects: projects.slice(0, 2) // Premiers projets seulement
    });

    return { projects, pagination };
  } catch (error: any) {
    console.error('❌ [API] Erreur:', error);
    console.error('❌ [API] Réponse erreur:', error.response?.data);
    throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des projets');
  }
}

  // Obtenir un projet par ID
  async getProjectById(id: string): Promise<Project> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du projet');
    }
  }

  // Mettre à jour un projet
  async updateProject(id: string, data: UpdateProjectRequest): Promise<Project> {
    try {
      const response = await api.patch(`${this.baseUrl}/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du projet');
    }
  }

  // Supprimer un projet
  async deleteProject(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression du projet');
    }
  }

  // Ajouter un participant au projet
  async addParticipant(projectId: string, data: AddParticipantRequest): Promise<ProjectParticipant> {
    try {
      const response = await api.post(`${this.baseUrl}/${projectId}/participants`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'ajout du participant');
    }
  }

  // Retirer un participant du projet (au lieu de supprimer)
  async removeParticipant(projectId: string, participantId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${projectId}/participants/${participantId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors du retrait du participant');
    }
  }

  // Obtenir les statistiques des projets
  async getProjectStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    recent: Project[];
    myProjects: number;
    participatingProjects: number;
  }> {
    try {
      const response = await api.get(`${this.baseUrl}/stats`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des statistiques');
    }
  }

  // Dupliquer un projet
  async duplicateProject(id: string, newTitle?: string): Promise<Project> {
    try {
      const response = await api.post(`${this.baseUrl}/${id}/duplicate`, {
        title: newTitle
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la duplication du projet');
    }
  }

  // Archiver un projet
  async archiveProject(id: string): Promise<Project> {
    try {
      const response = await api.patch(`${this.baseUrl}/${id}/archive`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'archivage du projet');
    }
  }

  // Restaurer un projet archivé
  async restoreProject(id: string): Promise<Project> {
    try {
      const response = await api.patch(`${this.baseUrl}/${id}/restore`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la restauration du projet');
    }
  }
}

// Export singleton
export const projectsApi = new ProjectsApiService();
export default projectsApi;