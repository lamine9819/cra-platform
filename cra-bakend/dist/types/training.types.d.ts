export interface CreateTrainingRequest {
    title: string;
    description?: string;
    type: TrainingType;
    location?: string;
    startDate: string;
    endDate?: string;
    duration?: number;
    objectives: string[];
    participantCount?: number;
    targetAudience?: string;
    isInternal?: boolean;
    organizer?: string;
    activityId?: string;
}
export interface UpdateTrainingRequest {
    title?: string;
    description?: string;
    type?: TrainingType;
    location?: string;
    startDate?: string;
    endDate?: string;
    duration?: number;
    objectives?: string[];
    participantCount?: number;
    targetAudience?: string;
    isInternal?: boolean;
    organizer?: string;
    activityId?: string;
}
export interface TrainingListQuery {
    page?: number;
    limit?: number;
    search?: string;
    type?: TrainingType;
    startDate?: string;
    endDate?: string;
    isInternal?: boolean;
    activityId?: string;
    participantId?: string;
}
export interface AddTrainingParticipantRequest {
    userId: string;
    role: string;
}
export interface UpdateTrainingParticipantRequest {
    role?: string;
    attendedAt?: string;
    certificate?: boolean;
    evaluation?: number;
}
export interface TrainingResponse {
    id: string;
    title: string;
    description?: string;
    type: string;
    location?: string;
    startDate: Date;
    endDate?: Date;
    duration?: number;
    objectives: string[];
    participantCount?: number;
    targetAudience?: string;
    isInternal: boolean;
    organizer?: string;
    createdAt: Date;
    updatedAt: Date;
    activity?: {
        id: string;
        title: string;
        code?: string;
    };
    documents?: {
        id: string;
        title: string;
        filename: string;
        type: string;
        createdAt: Date;
    }[];
    _count?: {
        documents: number;
    };
}
export interface CreateInternshipRequest {
    title: string;
    description?: string;
    institution: string;
    startDate: string;
    endDate: string;
    objectives: string[];
    supervisorId: string;
    internId: string;
    activityId?: string;
}
export interface UpdateInternshipRequest {
    title?: string;
    description?: string;
    institution?: string;
    startDate?: string;
    endDate?: string;
    objectives?: string[];
    results?: string;
    supervisorId?: string;
    internId?: string;
    activityId?: string;
}
export interface InternshipListQuery {
    page?: number;
    limit?: number;
    search?: string;
    supervisorId?: string;
    internId?: string;
    startDate?: string;
    endDate?: string;
    activityId?: string;
}
export interface InternshipResponse {
    id: string;
    title: string;
    description?: string;
    institution: string;
    startDate: Date;
    endDate: Date;
    objectives: string[];
    results?: string;
    createdAt: Date;
    updatedAt: Date;
    supervisor: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    intern: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    activity?: {
        id: string;
        title: string;
        code?: string;
    };
    documents?: {
        id: string;
        title: string;
        filename: string;
        type: string;
        createdAt: Date;
    }[];
    _count?: {
        documents: number;
    };
}
export interface CreateSupervisionRequest {
    title: string;
    type: string;
    university: string;
    startDate: string;
    endDate?: string;
    abstract?: string;
    supervisorId: string;
    studentId: string;
    activityId?: string;
}
export interface UpdateSupervisionRequest {
    title?: string;
    type?: string;
    university?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    abstract?: string;
    supervisorId?: string;
    studentId?: string;
    activityId?: string;
}
export interface SupervisionListQuery {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    status?: string;
    supervisorId?: string;
    studentId?: string;
    university?: string;
    startDate?: string;
    endDate?: string;
    activityId?: string;
}
export interface SupervisionResponse {
    id: string;
    title: string;
    type: string;
    university: string;
    startDate: Date;
    endDate?: Date;
    status: string;
    abstract?: string;
    createdAt: Date;
    updatedAt: Date;
    supervisor: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    student: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    activity?: {
        id: string;
        title: string;
        code?: string;
    };
    documents?: {
        id: string;
        title: string;
        filename: string;
        type: string;
        createdAt: Date;
    }[];
    _count?: {
        documents: number;
    };
}
export interface TrainingStats {
    totalTrainings: number;
    totalParticipants: number;
    byType: Record<string, number>;
    byMonth: Record<string, number>;
    byRole: Record<string, number>;
    recent: TrainingResponse[];
}
export interface InternshipStats {
    totalInternships: number;
    bySupervisor: Record<string, {
        count: number;
        name: string;
    }>;
    byInstitution: Record<string, number>;
    byStatus: Record<string, number>;
    recent: InternshipResponse[];
}
export interface SupervisionStats {
    totalSupervisions: number;
    bySupervisor: Record<string, {
        count: number;
        name: string;
    }>;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    byUniversity: Record<string, number>;
    recent: SupervisionResponse[];
}
export declare enum TrainingType {
    FORMATION_COURTE = "FORMATION_COURTE",
    FORMATION_DIPLOMANTE = "FORMATION_DIPLOMANTE",
    STAGE_ADAPTATION = "STAGE_ADAPTATION",
    STAGE_RECHERCHE = "STAGE_RECHERCHE",
    ATELIER_TECHNIQUE = "ATELIER_TECHNIQUE",
    SEMINAIRE_FORMATION = "SEMINAIRE_FORMATION"
}
export declare enum SupervisionStatus {
    EN_COURS = "EN_COURS",
    SOUTENU = "SOUTENU",
    ABANDONNE = "ABANDONNE"
}
export declare enum SupervisionType {
    DOCTORAT = "DOCTORAT",
    MASTER = "MASTER",
    LICENCE = "LICENCE",
    INGENIEUR = "INGENIEUR"
}
//# sourceMappingURL=training.types.d.ts.map