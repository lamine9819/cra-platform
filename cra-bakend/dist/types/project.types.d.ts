export interface CreateProjectRequest {
    title: string;
    description?: string;
    objectives: string[];
    status?: 'PLANIFIE' | 'EN_COURS' | 'SUSPENDU' | 'TERMINE' | 'ARCHIVE';
    startDate?: string;
    endDate?: string;
    budget?: number;
    keywords: string[];
    code?: string;
    themeId: string;
    researchProgramId?: string;
    conventionId?: string;
    strategicPlan?: string;
    strategicAxis?: string;
    subAxis?: string;
    program?: string;
    researchType?: 'RECHERCHE_FONDAMENTALE' | 'RECHERCHE_APPLIQUEE' | 'RECHERCHE_DEVELOPPEMENT' | 'PRODUCTION_SEMENCES';
    interventionRegion?: string;
}
export interface UpdateProjectRequest {
    title?: string;
    description?: string;
    objectives?: string[];
    status?: 'PLANIFIE' | 'EN_COURS' | 'SUSPENDU' | 'TERMINE' | 'ARCHIVE';
    startDate?: string;
    endDate?: string;
    budget?: number;
    keywords?: string[];
    themeId?: string;
    researchProgramId?: string;
    conventionId?: string;
    strategicPlan?: string;
    strategicAxis?: string;
    subAxis?: string;
    program?: string;
    researchType?: 'RECHERCHE_FONDAMENTALE' | 'RECHERCHE_APPLIQUEE' | 'RECHERCHE_DEVELOPPEMENT' | 'PRODUCTION_SEMENCES';
    interventionRegion?: string;
}
export interface ProjectListQuery {
    page?: number;
    limit?: number;
    status?: 'PLANIFIE' | 'EN_COURS' | 'SUSPENDU' | 'TERMINE' | 'ARCHIVE';
    creatorId?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    themeId?: string;
    researchProgramId?: string;
    conventionId?: string;
    researchType?: string;
    interventionRegion?: string;
    strategicAxis?: string;
}
export interface AddParticipantRequest {
    userId: string;
    role: 'RESPONSABLE' | 'CO_RESPONSABLE' | 'CHERCHEUR_PRINCIPAL' | 'CHERCHEUR_ASSOCIE' | 'TECHNICIEN' | 'STAGIAIRE' | 'PARTENAIRE_EXTERNE' | 'CONSULTANT';
    timeAllocation?: number;
    responsibilities?: string;
    expertise?: string;
}
export interface UpdateParticipantRequest {
    participantId: string;
    role?: 'RESPONSABLE' | 'CO_RESPONSABLE' | 'CHERCHEUR_PRINCIPAL' | 'CHERCHEUR_ASSOCIE' | 'TECHNICIEN' | 'STAGIAIRE' | 'PARTENAIRE_EXTERNE' | 'CONSULTANT';
    timeAllocation?: number;
    responsibilities?: string;
    expertise?: string;
    isActive?: boolean;
}
export interface ProjectResponse {
    id: string;
    code?: string;
    title: string;
    description?: string;
    objectives: string[];
    status: string;
    startDate?: Date;
    endDate?: Date;
    budget?: number;
    keywords: string[];
    createdAt: Date;
    updatedAt: Date;
    researchType?: string;
    interventionRegion?: string;
    strategicPlan?: string;
    strategicAxis?: string;
    subAxis?: string;
    program?: string;
    creator: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        role: string;
        specialization?: string;
    };
    theme: {
        id: string;
        name: string;
        code?: string;
        description?: string;
    };
    researchProgram?: {
        id: string;
        name: string;
        code?: string;
        description?: string;
    };
    convention?: {
        id: string;
        title: string;
        type: string;
        status: string;
        contractNumber?: string;
    };
    participants?: {
        id: string;
        role: string;
        timeAllocation?: number;
        responsibilities?: string;
        expertise?: string;
        joinedAt: Date;
        isActive: boolean;
        userId: string;
        user: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
            role: string;
            specialization?: string;
            discipline?: string;
        };
    }[];
    activities?: {
        id: string;
        code?: string;
        title: string;
        description?: string;
        type: string;
        status: string;
        startDate?: Date;
        endDate?: Date;
        createdAt: Date;
    }[];
    partnerships?: {
        id: string;
        partnerType: string;
        contribution?: string;
        isActive: boolean;
        partner: {
            id: string;
            name: string;
            type: string;
            category?: string;
        };
    }[];
    fundings?: {
        id: string;
        fundingSource: string;
        fundingType: string;
        status: string;
        requestedAmount: number;
        approvedAmount?: number;
        receivedAmount?: number;
        currency: string;
        contractNumber?: string;
        conditions?: string;
    }[];
    _count?: {
        participants: number;
        activities: number;
        tasks: number;
        documents: number;
        partnerships: number;
    };
}
export interface AddPartnershipRequest {
    partnerId: string;
    partnerType: string;
    contribution?: string;
    benefits?: string;
    startDate?: string;
    endDate?: string;
}
export interface UpdatePartnershipRequest {
    partnershipId: string;
    partnerType?: string;
    contribution?: string;
    benefits?: string;
    endDate?: string;
    isActive?: boolean;
}
export interface AddFundingRequest {
    fundingSource: string;
    fundingType: 'SUBVENTION' | 'CONTRAT' | 'PARTENARIAT' | 'BUDGET_INTERNE' | 'COOPERATION_INTERNATIONALE' | 'SECTEUR_PRIVE';
    requestedAmount: number;
    currency?: string;
    applicationDate?: string;
    startDate?: string;
    endDate?: string;
    conditions?: string;
    contractNumber?: string;
    conventionId?: string;
}
export interface UpdateFundingRequest {
    fundingId: string;
    status?: 'DEMANDE' | 'APPROUVE' | 'REJETE' | 'EN_COURS' | 'TERMINE' | 'SUSPENDU';
    approvedAmount?: number;
    receivedAmount?: number;
    approvalDate?: string;
    conditions?: string;
    notes?: string;
}
export interface ProjectStatistics {
    participants: {
        total: number;
        byRole: Record<string, number>;
        activeCount: number;
    };
    activities: {
        total: number;
        byType: Record<string, number>;
        byStatus: Record<string, number>;
        completion: number;
    };
    budget: {
        allocated: number;
        approved: number;
        received: number;
        remaining: number;
    };
    timeline: {
        startDate: Date | null;
        endDate: Date | null;
        duration: number;
        progress: number;
    };
}
//# sourceMappingURL=project.types.d.ts.map