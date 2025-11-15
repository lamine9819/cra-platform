import { UserRole } from '@prisma/client';
export interface CreateUserRequest {
    email: string;
    password: string;
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
    orcidId?: string;
    researchGateId?: string;
    googleScholarId?: string;
    linkedinId?: string;
    individualProfile?: CreateIndividualProfileRequest;
}
export interface CreateIndividualProfileRequest {
    matricule: string;
    grade: string;
    classe?: string;
    dateNaissance: Date;
    dateRecrutement: Date;
    localite: string;
    diplome: string;
    tempsRecherche?: number;
    tempsEnseignement?: number;
    tempsFormation?: number;
    tempsConsultation?: number;
    tempsGestionScientifique?: number;
    tempsAdministration?: number;
}
export interface UpdateUserRequest {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    specialization?: string;
    discipline?: string;
    department?: string;
    diploma?: string;
    dateOfBirth?: Date;
    dateOfHire?: Date;
    supervisorId?: string;
    isActive?: boolean;
    orcidId?: string;
    researchGateId?: string;
    googleScholarId?: string;
    linkedinId?: string;
    notificationPrefs?: Record<string, any>;
    dashboardConfig?: Record<string, any>;
}
export interface UpdateIndividualProfileRequest {
    matricule?: string;
    grade?: string;
    classe?: string;
    localite?: string;
    diplome?: string;
    tempsRecherche?: number;
    tempsEnseignement?: number;
    tempsFormation?: number;
    tempsConsultation?: number;
    tempsGestionScientifique?: number;
    tempsAdministration?: number;
}
export interface UserListQuery {
    page?: number;
    limit?: number;
    role?: UserRole;
    department?: string;
    discipline?: string;
    grade?: string;
    localite?: string;
    isActive?: boolean;
    search?: string;
    supervisorId?: string;
}
export interface UserResponse {
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
    individualProfile?: IndividualProfileResponse;
    stats?: UserStatsResponse;
}
export interface IndividualProfileResponse {
    id: string;
    matricule: string;
    grade: string;
    classe?: string;
    dateNaissance: Date;
    dateRecrutement: Date;
    localite: string;
    diplome: string;
    tempsRecherche: number;
    tempsEnseignement: number;
    tempsFormation: number;
    tempsConsultation: number;
    tempsGestionScientifique: number;
    tempsAdministration: number;
    isValidated: boolean;
    validatedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    timeAllocations?: TimeAllocationResponse[];
}
export interface TimeAllocationResponse {
    id: string;
    year: number;
    tempsRecherche: number;
    tempsEnseignement: number;
    tempsFormation: number;
    tempsConsultation: number;
    tempsGestionScientifique: number;
    tempsAdministration: number;
    isValidated: boolean;
    validatedAt?: Date;
    validatedBy?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface UserStatsResponse {
    totalProjects: number;
    activeProjects: number;
    totalActivities: number;
    activeActivities: number;
    supervisedUsers: number;
    ongoingSupervisions: number;
    publications: number;
    trainingsGiven: number;
    trainingsReceived: number;
    lastActivityDate?: Date;
}
//# sourceMappingURL=user.types.d.ts.map