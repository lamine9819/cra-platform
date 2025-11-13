// src/services/tasksApi.ts
import api from './api';

// =============================================
// TYPES ET INTERFACES
// =============================================

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'A_FAIRE' | 'EN_COURS' | 'EN_REVISION' | 'TERMINEE' | 'ANNULEE';
  priority: 'BASSE' | 'NORMALE' | 'HAUTE' | 'URGENTE';
  dueDate?: string;
  completedAt?: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  assignee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    specialization?: string;
  };
  project?: {
    id: string;
    title: string;
    description?: string;
    objectives?: string[];
    status: string;
    startDate?: string;
    endDate?: string;
    budget?: number;
    keywords?: string[];
    createdAt: string;
    updatedAt: string;
    creatorId: string;
    creator: {
      id: string;
      firstName: string;
      lastName: string;
    };
    participants?: {
      userId: string;
      isActive: boolean;
      role: string;
    }[];
  };
  activity?: {
    id: string;
    title: string;
    description?: string;
    objectives?: string[];
    methodology?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    results?: string;
    conclusions?: string;
    createdAt: string;
    updatedAt: string;
    projectId: string;
    project: {
      id: string;
      title: string;
      description?: string;
      objectives?: string[];
      status?: string;
      startDate?: string;
      endDate?: string;
      budget?: number;
      keywords?: string[];
      createdAt: string;
      updatedAt: string;
      creatorId: string;
      participants?: {
        userId: string;
        isActive: boolean;
        role: string;
      }[];
    };
  };
  documents?: {
    id: string;
    title: string;
    filename: string;
    type: string;
    createdAt: string;
  }[];
  _count?: {
    documents: number;
    comments: number;
  };
}

export interface TaskFilters {
  search?: string;
  status?: string;
  priority?: string;
  creatorId?: string;
  assigneeId?: string;
  projectId?: string;
  activityId?: string;
  dueDate?: string;
  overdue?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'title' | 'createdAt' | 'updatedAt' | 'dueDate' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: 'BASSE' | 'NORMALE' | 'HAUTE' | 'URGENTE';
  dueDate?: string;
  assigneeId?: string;
  projectId?: string;
  activityId?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: 'A_FAIRE' | 'EN_COURS' | 'EN_REVISION' | 'TERMINEE' | 'ANNULEE';
  priority?: 'BASSE' | 'NORMALE' | 'HAUTE' | 'URGENTE';
  progress?: number;
  dueDate?: string;
  assigneeId?: string;
}

export interface TaskStats {
  total: number;
  byStatus: {
    A_FAIRE: number;
    EN_COURS: number;
    EN_REVISION: number;
    TERMINEE: number;
    ANNULEE: number;
  };
  byPriority: {
    BASSE: number;
    NORMALE: number;
    HAUTE: number;
    URGENTE: number;
  };
  overdue: number;
  dueToday: number;
  dueThisWeek: number;
}

// =============================================
// SERVICE API TASKS
// =============================================

class TasksApiService {
  private baseUrl = '/tasks';

  // Créer une nouvelle tâche
  async createTask(data: CreateTaskRequest): Promise<Task> {
    try {
      const response = await api.post(this.baseUrl, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création de la tâche');
    }
  }

  // Obtenir les tâches assignées à l'utilisateur connecté
  async getAssignedTasks(filters: Omit<TaskFilters, 'assigneeId'> = {}): Promise<{
    tasks: Task[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`${this.baseUrl}/assigned/me?${params.toString()}`);
      
      return {
        tasks: response.data.data || [],
        pagination: response.data.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des tâches assignées');
    }
  }

  // Obtenir les tâches d'un projet
  async getProjectTasks(projectId: string, filters: Omit<TaskFilters, 'projectId'> = {}): Promise<{
    tasks: Task[];
    pagination: any;
  }> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`${this.baseUrl}/project/${projectId}?${params.toString()}`);
      
      return {
        tasks: response.data.data || [],
        pagination: response.data.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des tâches du projet');
    }
  }

  // Obtenir les tâches d'une activité
  async getActivityTasks(activityId: string, filters: Omit<TaskFilters, 'activityId'> = {}): Promise<{
    tasks: Task[];
    pagination: any;
  }> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`${this.baseUrl}/activity/${activityId}?${params.toString()}`);
      
      return {
        tasks: response.data.data || [],
        pagination: response.data.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des tâches de l\'activité');
    }
  }

  // Obtenir une tâche par ID
  async getTaskById(id: string): Promise<Task> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération de la tâche');
    }
  }

  // Mettre à jour une tâche
  async updateTask(id: string, data: UpdateTaskRequest): Promise<Task> {
    try {
      const response = await api.patch(`${this.baseUrl}/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour de la tâche');
    }
  }

  // Supprimer une tâche
  async deleteTask(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression de la tâche');
    }
  }

  // Obtenir les statistiques des tâches
  async getTaskStats(): Promise<TaskStats> {
    try {
      const response = await api.get(`${this.baseUrl}/stats/me`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des statistiques');
    }
  }

  // Recherche de tâches
  async searchTasks(query: string, limit: number = 10): Promise<Task[]> {
    try {
      const response = await this.getAssignedTasks({
        search: query,
        limit,
        sortBy: 'updatedAt',
        sortOrder: 'desc'
      });
      return response.tasks;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la recherche de tâches');
    }
  }

  // Obtenir les tâches en retard
  async getOverdueTasks(limit: number = 10): Promise<Task[]> {
    try {
      const response = await this.getAssignedTasks({
        overdue: true,
        limit,
        sortBy: 'dueDate',
        sortOrder: 'asc'
      });
      return response.tasks;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des tâches en retard');
    }
  }

  // Obtenir les tâches dues aujourd'hui
  async getTodayTasks(): Promise<Task[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await this.getAssignedTasks({
        dueDate: today,
        sortBy: 'priority',
        sortOrder: 'desc'
      });
      return response.tasks;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des tâches du jour');
    }
  }

  // Marquer une tâche comme terminée
  async markAsCompleted(id: string): Promise<Task> {
    return this.updateTask(id, { 
      status: 'TERMINEE', 
      progress: 100 
    });
  }

  // Marquer une tâche en cours
  async markAsInProgress(id: string): Promise<Task> {
    return this.updateTask(id, { status: 'EN_COURS' });
  }

  // Mettre à jour le progrès d'une tâche
  async updateProgress(id: string, progress: number): Promise<Task> {
    return this.updateTask(id, { progress });
  }
}

// Export singleton
export const tasksApi = new TasksApiService();
export default tasksApi;