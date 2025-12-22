import { CreateFundingDTO, UpdateFundingDTO, FundingFilters } from '../types/funding.types';
export declare class FundingService {
    /**
     * Créer une nouvelle ressource financière
     */
    createFunding(data: CreateFundingDTO, userId: string): Promise<{
        convention: {
            id: string;
            title: string;
            contractNumber: string;
        };
        activity: {
            id: string;
            code: string;
            title: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.FundingStatus;
        startDate: Date | null;
        endDate: Date | null;
        conventionId: string | null;
        contractNumber: string | null;
        currency: string;
        activityId: string;
        fundingSource: string;
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
    /**
     * Récupérer tous les financements avec filtres
     */
    getFundings(filters: FundingFilters, userId: string, userRole: string): Promise<{
        fundings: ({
            convention: {
                id: string;
                title: string;
                status: import(".prisma/client").$Enums.ConventionStatus;
                contractNumber: string;
            };
            activity: {
                id: string;
                code: string;
                title: string;
                responsible: {
                    id: string;
                    firstName: string;
                    lastName: string;
                };
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.FundingStatus;
            startDate: Date | null;
            endDate: Date | null;
            conventionId: string | null;
            contractNumber: string | null;
            currency: string;
            activityId: string;
            fundingSource: string;
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
        })[];
        stats: {
            total: number;
            totalRequested: number;
            totalApproved: number;
            totalReceived: number;
            byStatus: Record<string, number>;
            byType: Record<string, number>;
        };
    }>;
    /**
     * Récupérer un financement par ID
     */
    getFundingById(id: string, userId: string, userRole: string): Promise<{
        convention: {
            description: string | null;
            type: import(".prisma/client").$Enums.ConventionType;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            status: import(".prisma/client").$Enums.ConventionStatus;
            startDate: Date | null;
            endDate: Date | null;
            contractNumber: string | null;
            signatureDate: Date | null;
            totalBudget: number | null;
            currency: string;
            documentPath: string | null;
            mainPartner: string;
            otherPartners: string[];
            responsibleUserId: string;
        };
        activity: {
            participants: ({
                user: {
                    id: string;
                    firstName: string;
                    lastName: string;
                };
            } & {
                userId: string;
                role: import(".prisma/client").$Enums.ParticipantRole;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                startDate: Date;
                endDate: Date | null;
                timeAllocation: number | null;
                responsibilities: string | null;
                expertise: string | null;
                activityId: string;
            })[];
            responsible: {
                email: string;
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            description: string | null;
            type: import(".prisma/client").$Enums.ActivityType;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            code: string | null;
            title: string;
            objectives: string[];
            status: import(".prisma/client").$Enums.ActivityStatus;
            startDate: Date | null;
            endDate: Date | null;
            strategicPlan: string | null;
            strategicAxis: string | null;
            subAxis: string | null;
            conventionId: string | null;
            themeId: string;
            methodology: string | null;
            location: string | null;
            results: string | null;
            conclusions: string | null;
            interventionRegion: string | null;
            lifecycleStatus: import(".prisma/client").$Enums.ActivityLifecycleStatus;
            researchType: string | null;
            priority: import(".prisma/client").$Enums.TaskPriority;
            isRecurrent: boolean;
            parentActivityId: string | null;
            recurrenceReason: string | null;
            recurrenceNotes: string | null;
            recurrenceCount: number;
            originalStartDate: Date | null;
            justifications: string | null;
            constraints: string[];
            expectedResults: string[];
            transferMethods: string[];
            projectId: string | null;
            stationId: string | null;
            responsibleId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.FundingStatus;
        startDate: Date | null;
        endDate: Date | null;
        conventionId: string | null;
        contractNumber: string | null;
        currency: string;
        activityId: string;
        fundingSource: string;
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
    /**
     * Mettre à jour un financement
     */
    updateFunding(id: string, data: UpdateFundingDTO, userId: string, userRole: string): Promise<{
        convention: {
            id: string;
            title: string;
            contractNumber: string;
        };
        activity: {
            id: string;
            code: string;
            title: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.FundingStatus;
        startDate: Date | null;
        endDate: Date | null;
        conventionId: string | null;
        contractNumber: string | null;
        currency: string;
        activityId: string;
        fundingSource: string;
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
    /**
     * Supprimer un financement
     */
    deleteFunding(id: string, userId: string, userRole: string): Promise<{
        message: string;
    }>;
    /**
     * Récupérer les financements d'une activité spécifique
     */
    getFundingsByActivity(activityId: string, userId: string, userRole: string): Promise<{
        fundings: ({
            convention: {
                id: string;
                title: string;
                contractNumber: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.FundingStatus;
            startDate: Date | null;
            endDate: Date | null;
            conventionId: string | null;
            contractNumber: string | null;
            currency: string;
            activityId: string;
            fundingSource: string;
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
        })[];
        summary: {
            count: number;
            totalRequested: number;
            totalApproved: number;
            totalReceived: number;
            fundingGap: number;
        };
    }>;
}
//# sourceMappingURL=funding.service.d.ts.map