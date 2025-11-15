import { UserRole } from '@prisma/client';
import { CreateUserRequest, UpdateUserRequest, UserListQuery, UserResponse, UpdateIndividualProfileRequest, UserStatsResponse } from '../types/user.types';
export declare class UserService {
    /**
     * Créer un utilisateur avec ses spécificités CRA
     */
    createUser(userData: CreateUserRequest, creatorRole: string): Promise<UserResponse>;
    /**
     * Mettre à jour un utilisateur
     */
    updateUser(userId: string, updateData: UpdateUserRequest, requesterId: string): Promise<UserResponse>;
    /**
     * Mettre à jour le profil individuel d'un chercheur
     */
    updateIndividualProfile(userId: string, profileData: UpdateIndividualProfileRequest, requesterId: string): Promise<UserResponse>;
    /**
     * Créer ou mettre à jour l'allocation de temps pour une année donnée
     */
    updateTimeAllocation(userId: string, year: number, timeData: {
        tempsRecherche: number;
        tempsEnseignement: number;
        tempsFormation: number;
        tempsConsultation: number;
        tempsGestionScientifique: number;
        tempsAdministration: number;
    }, requesterId: string): Promise<{
        year: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tempsRecherche: number;
        tempsEnseignement: number;
        tempsFormation: number;
        tempsConsultation: number;
        tempsGestionScientifique: number;
        tempsAdministration: number;
        isValidated: boolean;
        validatedAt: Date | null;
        validatedBy: string | null;
        profileId: string;
    }>;
    /**
     * Valider un profil individuel
     */
    validateIndividualProfile(userId: string, year: number | null, validatorId: string): Promise<void>;
    /**
     * Lister les utilisateurs avec filtres spécifiques CRA
     */
    listUsers(query: UserListQuery): Promise<{
        users: UserResponse[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    /**
     * Obtenir les statistiques d'un utilisateur
     */
    getUserStats(userId: string): Promise<UserStatsResponse>;
    /**
     * Obtenir les chercheurs par thème de recherche
     */
    getResearchersByTheme(themeId: string): Promise<UserResponse[]>;
    /**
     * Obtenir les coordonateurs de projet
     */
    getProjectCoordinators(): Promise<{
        activeProjects: number;
        programs: {
            id: string;
            isActive: boolean;
            name: string;
        }[];
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: UserRole;
        phoneNumber?: string;
        dateOfBirth?: Date;
        dateOfHire?: Date;
        diploma?: string;
        specialization?: string;
        discipline?: string;
        department?: string;
        supervisorId?: string;
        isActive: boolean;
        profileImage?: string;
        orcidId?: string;
        researchGateId?: string;
        googleScholarId?: string;
        linkedinId?: string;
        notificationPrefs?: Record<string, any>;
        dashboardConfig?: Record<string, any>;
        createdAt: Date;
        updatedAt: Date;
        supervisor?: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
            role: string;
        };
        supervisedUsers?: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
            role: string;
            discipline?: string;
        }[];
        individualProfile?: import("../types/user.types").IndividualProfileResponse;
        stats?: UserStatsResponse;
    }[]>;
    /**
     * Supprimer un utilisateur (avec vérifications CRA)
     */
    deleteUser(userId: string, requesterId: string): Promise<void>;
    private validateCreationPermissions;
    private validateUpdatePermissions;
    private validateSupervisor;
    /**
     * Formater la réponse utilisateur en excluant le mot de passe
     */
    private formatUserResponse;
    /**
     * Obtenir un utilisateur par ID avec toutes ses relations
     */
    getUserById(userId: string): Promise<UserResponse>;
    /**
     * Obtenir les utilisateurs supervisés par un chercheur
     */
    getSupervisedUsers(supervisorId: string): Promise<UserResponse[]>;
    /**
     * Associer un superviseur à un utilisateur
     */
    assignSupervisor(userId: string, supervisorId: string, requesterId: string): Promise<UserResponse>;
    /**
     * Activer/désactiver un utilisateur
     */
    toggleUserStatus(userId: string, isActive: boolean, requesterId: string): Promise<UserResponse>;
}
//# sourceMappingURL=user.service.d.ts.map