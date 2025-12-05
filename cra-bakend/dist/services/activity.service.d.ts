import { CreateActivityRequest, UpdateActivityRequest, ActivityListQuery, ActivityResponse, ActivityRecurrenceRequest, CRAActivityStats } from '../types/activity.types';
import { AddActivityPartnerInput, UpdateFundingInput, AddFundingInput, UpdateActivityPartnerInput, CreateTaskInput, UpdateTaskInput, CreateCommentInput, UpdateCommentInput, ReassignTaskInput, AddParticipantInput, UpdateParticipantInput } from '@/utils/activityValidation';
export declare class ActivityService {
    createActivity(activityData: CreateActivityRequest, userId: string, userRole: string): Promise<ActivityResponse>;
    listActivities(userId: string, userRole: string, query: ActivityListQuery): Promise<{
        activities: ActivityResponse[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    getActivityById(activityId: string, userId: string, userRole: string): Promise<ActivityResponse>;
    updateActivity(activityId: string, updateData: UpdateActivityRequest, userId: string, userRole: string): Promise<ActivityResponse>;
    deleteActivity(activityId: string, userId: string, userRole: string): Promise<void>;
    createActivityRecurrence(activityId: string, userId: string, userRole: string, recurrenceData: ActivityRecurrenceRequest): Promise<ActivityResponse>;
    duplicateActivity(activityId: string, userId: string, userRole: string, newTitle?: string): Promise<ActivityResponse>;
    getActivityStats(userId: string, userRole: string): Promise<CRAActivityStats>;
    linkForm(activityId: string, formId: string, userId: string, userRole: string): Promise<{
        message: string;
    }>;
    unlinkForm(activityId: string, formId: string, userId: string, userRole: string): Promise<{
        message: string;
    }>;
    linkDocument(activityId: string, documentId: string, userId: string, userRole: string): Promise<{
        message: string;
    }>;
    private validateCRAActivity;
    private generateActivityCode;
    private validateProjectThemeConsistency;
    private checkActivityAccess;
    private checkProjectAccess;
    private checkActivityModifyRights;
    private checkActivityDeleteRights;
    private formatActivityResponse;
    addParticipant(activityId: string, participantData: AddParticipantInput, userId: string, userRole: string): Promise<{
        user: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        userId: string;
        role: import(".prisma/client").$Enums.ParticipantRole;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        startDate: Date;
        endDate: Date | null;
        timeAllocation: number | null;
        responsibilities: string | null;
        expertise: string | null;
        activityId: string;
    }>;
    updateParticipant(activityId: string, participantId: string, updateData: UpdateParticipantInput, userId: string, userRole: string): Promise<{
        user: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        userId: string;
        role: import(".prisma/client").$Enums.ParticipantRole;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        startDate: Date;
        endDate: Date | null;
        timeAllocation: number | null;
        responsibilities: string | null;
        expertise: string | null;
        activityId: string;
    }>;
    removeParticipant(activityId: string, participantId: string, userId: string, userRole: string): Promise<void>;
    listParticipants(activityId: string, userId: string, userRole: string): Promise<({
        user: {
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        userId: string;
        role: import(".prisma/client").$Enums.ParticipantRole;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        startDate: Date;
        endDate: Date | null;
        timeAllocation: number | null;
        responsibilities: string | null;
        expertise: string | null;
        activityId: string;
    })[]>;
    addFunding(activityId: string, fundingData: AddFundingInput, userId: string, userRole: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.FundingStatus;
        startDate: Date | null;
        endDate: Date | null;
        conventionId: string | null;
        activityId: string;
        fundingSource: string;
        contractNumber: string | null;
        currency: string;
        contactPerson: string | null;
        contactEmail: string | null;
        fundingType: import(".prisma/client").$Enums.FundingType;
        requestedAmount: number;
        approvedAmount: number | null;
        receivedAmount: number | null;
        applicationDate: Date | null;
        approvalDate: Date | null;
        conditions: string | null;
        notes: string | null;
        reportingReqs: string[];
        restrictions: string[];
    }>;
    updateFunding(activityId: string, fundingId: string, updateData: UpdateFundingInput, userId: string, userRole: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.FundingStatus;
        startDate: Date | null;
        endDate: Date | null;
        conventionId: string | null;
        activityId: string;
        fundingSource: string;
        contractNumber: string | null;
        currency: string;
        contactPerson: string | null;
        contactEmail: string | null;
        fundingType: import(".prisma/client").$Enums.FundingType;
        requestedAmount: number;
        approvedAmount: number | null;
        receivedAmount: number | null;
        applicationDate: Date | null;
        approvalDate: Date | null;
        conditions: string | null;
        notes: string | null;
        reportingReqs: string[];
        restrictions: string[];
    }>;
    removeFunding(activityId: string, fundingId: string, userId: string, userRole: string): Promise<void>;
    listFundings(activityId: string, userId: string, userRole: string): Promise<({
        convention: {
            id: string;
            type: import(".prisma/client").$Enums.ConventionType;
            title: string;
            status: import(".prisma/client").$Enums.ConventionStatus;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.FundingStatus;
        startDate: Date | null;
        endDate: Date | null;
        conventionId: string | null;
        activityId: string;
        fundingSource: string;
        contractNumber: string | null;
        currency: string;
        contactPerson: string | null;
        contactEmail: string | null;
        fundingType: import(".prisma/client").$Enums.FundingType;
        requestedAmount: number;
        approvedAmount: number | null;
        receivedAmount: number | null;
        applicationDate: Date | null;
        approvalDate: Date | null;
        conditions: string | null;
        notes: string | null;
        reportingReqs: string[];
        restrictions: string[];
    })[]>;
    addPartner(activityId: string, partnerData: AddActivityPartnerInput, userId: string, userRole: string): Promise<{
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
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        startDate: Date;
        endDate: Date | null;
        activityId: string;
        partnerType: string;
        contribution: string | null;
        benefits: string | null;
        partnerId: string;
    }>;
    updatePartner(activityId: string, partnershipId: string, updateData: UpdateActivityPartnerInput, userId: string, userRole: string): Promise<{
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
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        startDate: Date;
        endDate: Date | null;
        activityId: string;
        partnerType: string;
        contribution: string | null;
        benefits: string | null;
        partnerId: string;
    }>;
    removePartner(activityId: string, partnershipId: string, userId: string, userRole: string): Promise<void>;
    listPartners(activityId: string, userId: string, userRole: string): Promise<({
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
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        startDate: Date;
        endDate: Date | null;
        activityId: string;
        partnerType: string;
        contribution: string | null;
        benefits: string | null;
        partnerId: string;
    })[]>;
    /**
     * Enregistrer un historique de modification de tâche
     */
    private logTaskHistory;
    /**
     * Envoyer une notification pour un changement de tâche
     */
    private notifyTaskChange;
    createTask(activityId: string, taskData: CreateTaskInput, userId: string, userRole: string): Promise<{
        creator: {
            id: string;
            firstName: string;
            lastName: string;
        };
        assignee: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        description: string | null;
        projectId: string | null;
        creatorId: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        priority: import(".prisma/client").$Enums.TaskPriority;
        activityId: string | null;
        dueDate: Date | null;
        assigneeId: string | null;
        progress: number;
        completedAt: Date | null;
    }>;
    updateTask(activityId: string, taskId: string, updateData: UpdateTaskInput, userId: string, userRole: string): Promise<{
        creator: {
            id: string;
            firstName: string;
            lastName: string;
        };
        assignee: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        description: string | null;
        projectId: string | null;
        creatorId: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        priority: import(".prisma/client").$Enums.TaskPriority;
        activityId: string | null;
        dueDate: Date | null;
        assigneeId: string | null;
        progress: number;
        completedAt: Date | null;
    }>;
    deleteTask(activityId: string, taskId: string, userId: string, userRole: string): Promise<void>;
    listTasks(activityId: string, userId: string, userRole: string): Promise<({
        creator: {
            id: string;
            firstName: string;
            lastName: string;
        };
        _count: {
            comments: number;
            documents: number;
        };
        assignee: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        description: string | null;
        projectId: string | null;
        creatorId: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        priority: import(".prisma/client").$Enums.TaskPriority;
        activityId: string | null;
        dueDate: Date | null;
        assigneeId: string | null;
        progress: number;
        completedAt: Date | null;
    })[]>;
    getTaskById(activityId: string, taskId: string, userId: string, userRole: string): Promise<{
        creator: {
            id: string;
            firstName: string;
            lastName: string;
        };
        comments: ({
            author: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            projectId: string | null;
            createdAt: Date;
            updatedAt: Date;
            activityId: string | null;
            formId: string | null;
            content: string;
            taskId: string | null;
            authorId: string;
        })[];
        documents: ({
            owner: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            description: string | null;
            type: import(".prisma/client").$Enums.DocumentType;
            projectId: string | null;
            createdAt: Date;
            updatedAt: Date;
            version: number;
            title: string;
            activityId: string | null;
            size: bigint;
            isPublic: boolean;
            filename: string;
            filepath: string;
            mimeType: string;
            tags: string[];
            ownerId: string;
            taskId: string | null;
            seminarId: string | null;
            trainingId: string | null;
            internshipId: string | null;
            supervisionId: string | null;
            knowledgeTransferId: string | null;
            eventId: string | null;
            deletedAt: Date | null;
            deletedBy: string | null;
            downloadCount: number;
            favoritedBy: string[];
            lastViewedAt: Date | null;
            previousVersionId: string | null;
            viewCount: number;
        })[];
        assignee: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        description: string | null;
        projectId: string | null;
        creatorId: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        priority: import(".prisma/client").$Enums.TaskPriority;
        activityId: string | null;
        dueDate: Date | null;
        assigneeId: string | null;
        progress: number;
        completedAt: Date | null;
    }>;
    reassignTask(activityId: string, taskId: string, reassignData: ReassignTaskInput, userId: string, userRole: string): Promise<{
        creator: {
            id: string;
            firstName: string;
            lastName: string;
        };
        activity: {
            id: string;
            code: string | null;
            title: string;
        } | null;
        assignee: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        description: string | null;
        projectId: string | null;
        creatorId: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        priority: import(".prisma/client").$Enums.TaskPriority;
        activityId: string | null;
        dueDate: Date | null;
        assigneeId: string | null;
        progress: number;
        completedAt: Date | null;
    }>;
    listCreatedTasks(activityId: string, userId: string, userRole: string): Promise<({
        creator: {
            id: string;
            firstName: string;
            lastName: string;
        };
        _count: {
            comments: number;
            documents: number;
        };
        assignee: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        description: string | null;
        projectId: string | null;
        creatorId: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        priority: import(".prisma/client").$Enums.TaskPriority;
        activityId: string | null;
        dueDate: Date | null;
        assigneeId: string | null;
        progress: number;
        completedAt: Date | null;
    })[]>;
    listAssignedTasks(activityId: string, userId: string, userRole: string): Promise<({
        creator: {
            id: string;
            firstName: string;
            lastName: string;
        };
        _count: {
            comments: number;
            documents: number;
        };
        assignee: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        description: string | null;
        projectId: string | null;
        creatorId: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        priority: import(".prisma/client").$Enums.TaskPriority;
        activityId: string | null;
        dueDate: Date | null;
        assigneeId: string | null;
        progress: number;
        completedAt: Date | null;
    })[]>;
    createComment(activityId: string, commentData: CreateCommentInput, userId: string, userRole: string): Promise<{
        author: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        projectId: string | null;
        createdAt: Date;
        updatedAt: Date;
        activityId: string | null;
        formId: string | null;
        content: string;
        taskId: string | null;
        authorId: string;
    }>;
    updateComment(activityId: string, commentId: string, updateData: UpdateCommentInput, userId: string, userRole: string): Promise<{
        author: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        projectId: string | null;
        createdAt: Date;
        updatedAt: Date;
        activityId: string | null;
        formId: string | null;
        content: string;
        taskId: string | null;
        authorId: string;
    }>;
    deleteComment(activityId: string, commentId: string, userId: string, userRole: string): Promise<void>;
    listComments(activityId: string, userId: string, userRole: string): Promise<({
        author: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
            profileImage: string | null;
        };
    } & {
        id: string;
        projectId: string | null;
        createdAt: Date;
        updatedAt: Date;
        activityId: string | null;
        formId: string | null;
        content: string;
        taskId: string | null;
        authorId: string;
    })[]>;
    linkKnowledgeTransfer(activityId: string, transferId: string, userId: string, userRole: string): Promise<{
        message: string;
    }>;
    unlinkKnowledgeTransfer(activityId: string, transferId: string, userId: string, userRole: string): Promise<{
        message: string;
    }>;
    listKnowledgeTransfers(activityId: string, userId: string, userRole: string): Promise<({
        _count: {
            documents: number;
        };
        organizer: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        description: string | null;
        type: import(".prisma/client").$Enums.TransferType;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        title: string;
        participants: number | null;
        location: string | null;
        activityId: string | null;
        targetAudience: string[];
        impact: string | null;
        feedback: string | null;
        organizerId: string;
    })[]>;
}
//# sourceMappingURL=activity.service.d.ts.map