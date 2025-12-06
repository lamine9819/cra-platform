import { CreateProjectRequest, UpdateProjectRequest, ProjectListQuery, ProjectResponse, AddParticipantRequest, UpdateParticipantRequest, AddPartnershipRequest, UpdatePartnershipRequest, AddFundingRequest, UpdateFundingRequest, ProjectStatistics } from '../types/project.types';
export declare class ProjectService {
    createProject(projectData: CreateProjectRequest, creatorId: string): Promise<ProjectResponse>;
    listProjects(userId: string, userRole: string, query: ProjectListQuery): Promise<{
        projects: ProjectResponse[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    getProjectById(projectId: string, userId: string, userRole: string): Promise<ProjectResponse>;
    updateProject(projectId: string, updateData: UpdateProjectRequest, userId: string, userRole: string): Promise<ProjectResponse>;
    deleteProject(projectId: string, userId: string, userRole: string): Promise<void>;
    addParticipant(projectId: string, participantData: AddParticipantRequest, requesterId: string, requesterRole: string): Promise<{
        message: string;
    }>;
    updateParticipant(projectId: string, updateData: UpdateParticipantRequest, requesterId: string, requesterRole: string): Promise<{
        message: string;
    }>;
    removeParticipant(projectId: string, participantId: string, requesterId: string, requesterRole: string): Promise<{
        message: string;
    }>;
    addPartnership(projectId: string, partnershipData: AddPartnershipRequest, requesterId: string, requesterRole: string): Promise<{
        message: string;
        partnership: {
            partner: {
                email: string | null;
                id: string;
                name: string;
                description: string | null;
                type: import(".prisma/client").$Enums.PartnerType;
                createdAt: Date;
                updatedAt: Date;
                expertise: string[];
                category: string | null;
                address: string | null;
                phone: string | null;
                website: string | null;
                contactPerson: string | null;
                contactTitle: string | null;
                contactEmail: string | null;
                contactPhone: string | null;
                services: string[];
            };
        } & {
            id: string;
            projectId: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            startDate: Date;
            endDate: Date | null;
            partnerType: string;
            contribution: string | null;
            benefits: string | null;
            partnerId: string;
        };
    }>;
    addFunding(projectId: string, fundingData: AddFundingRequest, requesterId: string, requesterRole: string): Promise<{
        message: string;
    }>;
    updateFunding(projectId: string, fundingData: UpdateFundingRequest, requesterId: string, requesterRole: string): Promise<{
        message: string;
    }>;
    removeFunding(projectId: string, fundingId: string, requesterId: string, requesterRole: string): Promise<{
        message: string;
    }>;
    getProjectStatistics(projectId: string, userId: string, userRole: string): Promise<ProjectStatistics>;
    private checkProjectAccess;
    private checkProjectEditRights;
    private canManageParticipants;
    getProjectPartnerships(projectId: string, userId: string, userRole: string): Promise<{
        id: any;
        partnerType: any;
        contribution: any;
        benefits: any;
        startDate: any;
        endDate: any;
        isActive: any;
        createdAt: any;
        updatedAt: any;
        partner: {
            id: any;
            name: any;
            type: any;
            category: any;
            description: any;
            address: any;
            phone: any;
            email: any;
            website: any;
            contactPerson: any;
            contactTitle: any;
            contactEmail: any;
            contactPhone: any;
            expertise: any;
            services: any;
        };
    }[]>;
    updatePartnership(projectId: string, updateData: UpdatePartnershipRequest, requesterId: string, requesterRole: string): Promise<{
        message: string;
        partnership: {
            id: any;
            partnerType: any;
            contribution: any;
            benefits: any;
            startDate: any;
            endDate: any;
            isActive: any;
            createdAt: any;
            updatedAt: any;
            partner: {
                id: any;
                name: any;
                type: any;
                category: any;
                description: any;
                address: any;
                phone: any;
                email: any;
                website: any;
                contactPerson: any;
                contactTitle: any;
                contactEmail: any;
                contactPhone: any;
                expertise: any;
                services: any;
            };
        };
    }>;
    removePartnership(projectId: string, partnershipId: string, requesterId: string, requesterRole: string): Promise<{
        message: string;
    }>;
    searchPotentialPartners(projectId: string, query?: string, expertise?: string[], type?: string): Promise<{
        id: string;
        name: string;
        description: string;
        type: import(".prisma/client").$Enums.PartnerType;
        expertise: string[];
        category: string;
        contactPerson: string;
        contactEmail: string;
        services: string[];
    }[]>;
    private canManagePartnerships;
    private formatPartnershipResponse;
    private getProjectIncludes;
    private formatProjectResponse;
}
//# sourceMappingURL=project.service.d.ts.map