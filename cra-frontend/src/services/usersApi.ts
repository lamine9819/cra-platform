// src/services/usersApi.ts
import api from './api';
import { UserRole } from '../types/auth.types';

// =============================================
// TYPES ET INTERFACES
// =============================================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  profileImage?: string;
  phoneNumber?: string;
  specialization?: string;
  department?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserFilters {
  search?: string;
  roles?: string; // Comma-separated roles
  department?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'firstName' | 'lastName' | 'email' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

// =============================================
// SERVICE API USERS
// =============================================

class UsersApiService {
  private baseUrl = '/users';

  // Lister les utilisateurs avec filtres (pour admin)
  async listUsers(filters: UserFilters = {}): Promise<{
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`${this.baseUrl}?${params.toString()}`);
      return {
        users: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des utilisateurs');
    }
  }

  // Obtenir un utilisateur par ID
  async getUserById(id: string): Promise<User> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération de l\'utilisateur');
    }
  }

  // Rechercher des utilisateurs pour les projets (utilise l'endpoint existant avec filtres)
  async searchUsersForProject(query: string = '', excludeIds: string[] = [], limit: number = 20): Promise<User[]> {
    try {
      const params = new URLSearchParams({
        search: query,
        limit: limit.toString(),
        // Filtrer seulement les rôles qui peuvent participer aux projets
        roles: 'CHERCHEUR,COORDONATEUR_PROJET'
      });

      const response = await api.get(`${this.baseUrl}?${params.toString()}`);
      const users = response.data.data;
      
      // Filtrer côté client les utilisateurs déjà participants
      return users.filter((user: User) => 
        user.isActive && !excludeIds.includes(user.id)
      );
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la recherche d\'utilisateurs');
    }
  }

  // Obtenir les utilisateurs supervisés (pour chercheurs)
  async getSupervisedUsers(): Promise<User[]> {
    try {
      const response = await api.get(`${this.baseUrl}/supervised/me`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des utilisateurs supervisés');
    }
  }

  // Méthode helper pour obtenir les utilisateurs disponibles pour un projet
  async getAvailableUsersForProject(projectId: string, search: string = ''): Promise<User[]> {
    try {
      // On va d'abord récupérer le projet pour connaître les participants existants
      const projectResponse = await api.get(`/projects/${projectId}`);
      const project = projectResponse.data.data;
      
      // Extraire les IDs des participants existants
      const existingParticipantIds = project.participants?.map((p: any) => p.user.id) || [];
      
      // Rechercher les utilisateurs disponibles
      return await this.searchUsersForProject(search, existingParticipantIds);
    } catch (error: any) {
      // Si erreur pour récupérer le projet, on fait quand même la recherche
      console.warn('Impossible de récupérer les participants existants:', error.message);
      return await this.searchUsersForProject(search);
    }
  }

  // Créer un utilisateur (pour admin/chercheur)
  async createUser(userData: Partial<User>): Promise<User> {
    try {
      const response = await api.post(this.baseUrl, userData);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création de l\'utilisateur');
    }
  }

  // Mettre à jour un utilisateur
  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    try {
      const response = await api.patch(`${this.baseUrl}/${id}`, userData);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour de l\'utilisateur');
    }
  }

  // Activer un utilisateur
  async activateUser(id: string): Promise<User> {
    try {
      const response = await api.patch(`${this.baseUrl}/${id}/activate`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'activation de l\'utilisateur');
    }
  }

  // Désactiver un utilisateur
  async deactivateUser(id: string): Promise<User> {
    try {
      const response = await api.patch(`${this.baseUrl}/${id}/deactivate`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la désactivation de l\'utilisateur');
    }
  }

  // Assigner un superviseur
  async assignSupervisor(userId: string, supervisorId: string): Promise<User> {
    try {
      const response = await api.patch(`${this.baseUrl}/${userId}/supervisor`, {
        supervisorId
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'assignation du superviseur');
    }
  }

  // Supprimer un utilisateur (pour admin)
  async deleteUser(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression de l\'utilisateur');
    }
  }

  // =============================================
  // GESTION DU PROFIL PERSONNEL
  // =============================================

  // Obtenir son propre profil avec statistiques
  async getMyProfile(): Promise<User> {
    try {
      const response = await api.get(`${this.baseUrl}/me`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du profil');
    }
  }

  // Mettre à jour son propre profil
  async updateMyProfile(userData: Partial<User>): Promise<User> {
    try {
      const response = await api.patch(`${this.baseUrl}/me`, userData);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du profil');
    }
  }

  // Upload de la photo de profil
  async uploadProfileImage(file: File): Promise<{ profileImage: string }> {
    try {
      const formData = new FormData();
      formData.append('profileImage', file);

      const response = await api.post(`${this.baseUrl}/me/profile-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'upload de la photo de profil');
    }
  }

  // Supprimer la photo de profil
  async deleteProfileImage(): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/me/profile-image`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression de la photo de profil');
    }
  }

  // =============================================
  // PROFIL INDIVIDUEL (CHERCHEURS)
  // =============================================

  // Mettre à jour son propre profil individuel
  async updateMyIndividualProfile(profileData: any): Promise<any> {
    try {
      const response = await api.patch(`${this.baseUrl}/me/individual-profile`, profileData);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du profil individuel');
    }
  }

  // Télécharger sa propre fiche individuelle
  async downloadMyIndividualProfile(format: 'pdf' | 'word' = 'pdf'): Promise<Blob> {
    try {
      const response = await api.get(`${this.baseUrl}/me/individual-profile/download`, {
        params: { format },
        responseType: 'blob',
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors du téléchargement de la fiche individuelle');
    }
  }

  // =============================================
  // ALLOCATION DE TEMPS
  // =============================================

  // Mettre à jour l'allocation de temps (pour admin/coordonateur)
  async updateTimeAllocation(userId: string, year: number, allocation: any): Promise<any> {
    try {
      const response = await api.patch(`${this.baseUrl}/${userId}/time-allocation`, {
        year,
        ...allocation
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour de l\'allocation de temps');
    }
  }

  // Récupérer toutes ses allocations de temps
  async getMyTimeAllocations(): Promise<any[]> {
    try {
      const response = await api.get(`${this.baseUrl}/me/time-allocations`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des allocations de temps');
    }
  }

  // Récupérer son allocation de temps pour une année spécifique
  async getMyTimeAllocation(year: number): Promise<any> {
    try {
      const response = await api.get(`${this.baseUrl}/me/time-allocation/${year}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération de l\'allocation de temps');
    }
  }

  // Mettre à jour sa propre allocation de temps
  async updateMyTimeAllocation(year: number, allocation: any): Promise<any> {
    try {
      const response = await api.patch(`${this.baseUrl}/me/time-allocation`, {
        year,
        ...allocation
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour de l\'allocation de temps');
    }
  }

  // Créer son propre profil individuel
  async createMyIndividualProfile(profileData: any): Promise<any> {
    try {
      const response = await api.post(`${this.baseUrl}/me/individual-profile`, profileData);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création du profil individuel');
    }
  }

  // =============================================
  // STATISTIQUES
  // =============================================

  // Obtenir les statistiques d'un utilisateur
  async getUserStats(userId: string): Promise<any> {
    try {
      const response = await api.get(`${this.baseUrl}/${userId}/stats`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des statistiques');
    }
  }

  // =============================================
  // GESTION DES FICHES INDIVIDUELLES (COORDONATEUR/ADMIN)
  // =============================================

  // Lister les chercheurs avec leurs profils individuels
  async getResearchersWithProfiles(filters: UserFilters = {}): Promise<{
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const params = new URLSearchParams({
        role: 'CHERCHEUR',
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null && value !== '')
            .map(([key, value]) => [key, value.toString()])
        )
      });

      const response = await api.get(`${this.baseUrl}?${params.toString()}`);
      return {
        users: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des chercheurs');
    }
  }

  // Télécharger la fiche individuelle d'un chercheur
  async downloadIndividualProfile(userId: string, format: 'pdf' | 'word' = 'pdf'): Promise<Blob> {
    try {
      const response = await api.get(`${this.baseUrl}/${userId}/individual-profile/download`, {
        params: { format },
        responseType: 'blob',
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors du téléchargement de la fiche individuelle');
    }
  }

  // Récupérer les allocations de temps d'un utilisateur
  async getUserTimeAllocations(userId: string): Promise<any[]> {
    try {
      const response = await api.get(`${this.baseUrl}/${userId}/time-allocations`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des allocations de temps');
    }
  }

  // Valider un profil individuel ou une allocation de temps
  async validateIndividualProfile(userId: string, year?: number): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/${userId}/individual-profile/validate`, { year });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la validation');
    }
  }

  // Mettre à jour le profil individuel d'un chercheur
  async updateIndividualProfile(userId: string, profileData: any): Promise<any> {
    try {
      const response = await api.patch(`${this.baseUrl}/${userId}/individual-profile`, profileData);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du profil individuel');
    }
  }
}

// Export singleton
export const usersApi = new UsersApiService();
export default usersApi;