import { UserRole } from '@prisma/client';
import { CreatePublicationInput, UpdatePublicationInput, PublicationQuery } from '../types/publication.types';
export declare class PublicationService {
    createPublication(data: CreatePublicationInput, userId: string): Promise<{
        document: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.DocumentType;
            version: number;
            title: string;
            description: string | null;
            projectId: string | null;
            activityId: string | null;
            size: bigint;
            isPublic: boolean;
            filename: string;
            filepath: string;
            mimeType: string;
            tags: string[];
            deletedAt: Date | null;
            deletedBy: string | null;
            favoritedBy: string[];
            viewCount: number;
            downloadCount: number;
            lastViewedAt: Date | null;
            previousVersionId: string | null;
            ownerId: string;
            taskId: string | null;
            seminarId: string | null;
            trainingId: string | null;
            internshipId: string | null;
            supervisionId: string | null;
            knowledgeTransferId: string | null;
            eventId: string | null;
        } | null;
        authors: ({
            user: {
                email: string;
                id: string;
                firstName: string;
                lastName: string;
                department: string | null;
            };
        } & {
            userId: string;
            id: string;
            createdAt: Date;
            authorOrder: number;
            isCorresponding: boolean;
            affiliation: string | null;
            publicationId: string;
        })[];
        linkedProjects: {
            id: string;
            code: string;
            title: string;
        }[];
        linkedActivities: {
            id: string;
            code: string | null;
            title: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.PublicationType;
        title: string;
        status: string;
        keywords: string[];
        language: string;
        documentId: string | null;
        url: string | null;
        journal: string | null;
        isbn: string | null;
        doi: string | null;
        volume: string | null;
        issue: string | null;
        pages: string | null;
        publisher: string | null;
        impactFactor: number | null;
        quartile: string | null;
        citationsCount: number;
        isOpenAccess: boolean;
        submissionDate: Date | null;
        acceptanceDate: Date | null;
        publicationDate: Date | null;
        isInternational: boolean;
        abstract: string | null;
    }>;
    getPublications(query: PublicationQuery, userId: string, userRole: UserRole): Promise<{
        publications: ({
            document: {
                id: string;
                size: bigint;
                filename: string;
                filepath: string;
                mimeType: string;
            } | null;
            authors: ({
                user: {
                    email: string;
                    id: string;
                    firstName: string;
                    lastName: string;
                    department: string | null;
                };
            } & {
                userId: string;
                id: string;
                createdAt: Date;
                authorOrder: number;
                isCorresponding: boolean;
                affiliation: string | null;
                publicationId: string;
            })[];
            linkedProjects: {
                id: string;
                code: string;
                title: string;
            }[];
            linkedActivities: {
                id: string;
                code: string | null;
                title: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.PublicationType;
            title: string;
            status: string;
            keywords: string[];
            language: string;
            documentId: string | null;
            url: string | null;
            journal: string | null;
            isbn: string | null;
            doi: string | null;
            volume: string | null;
            issue: string | null;
            pages: string | null;
            publisher: string | null;
            impactFactor: number | null;
            quartile: string | null;
            citationsCount: number;
            isOpenAccess: boolean;
            submissionDate: Date | null;
            acceptanceDate: Date | null;
            publicationDate: Date | null;
            isInternational: boolean;
            abstract: string | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getPublicationById(id: string): Promise<{
        document: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.DocumentType;
            version: number;
            title: string;
            description: string | null;
            projectId: string | null;
            activityId: string | null;
            size: bigint;
            isPublic: boolean;
            filename: string;
            filepath: string;
            mimeType: string;
            tags: string[];
            deletedAt: Date | null;
            deletedBy: string | null;
            favoritedBy: string[];
            viewCount: number;
            downloadCount: number;
            lastViewedAt: Date | null;
            previousVersionId: string | null;
            ownerId: string;
            taskId: string | null;
            seminarId: string | null;
            trainingId: string | null;
            internshipId: string | null;
            supervisionId: string | null;
            knowledgeTransferId: string | null;
            eventId: string | null;
        } | null;
        authors: ({
            user: {
                email: string;
                id: string;
                firstName: string;
                lastName: string;
                department: string | null;
                discipline: string | null;
            };
        } & {
            userId: string;
            id: string;
            createdAt: Date;
            authorOrder: number;
            isCorresponding: boolean;
            affiliation: string | null;
            publicationId: string;
        })[];
        linkedProjects: {
            id: string;
            code: string;
            title: string;
            status: import(".prisma/client").$Enums.ProjectStatus;
        }[];
        linkedActivities: {
            id: string;
            type: import(".prisma/client").$Enums.ActivityType;
            code: string | null;
            title: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.PublicationType;
        title: string;
        status: string;
        keywords: string[];
        language: string;
        documentId: string | null;
        url: string | null;
        journal: string | null;
        isbn: string | null;
        doi: string | null;
        volume: string | null;
        issue: string | null;
        pages: string | null;
        publisher: string | null;
        impactFactor: number | null;
        quartile: string | null;
        citationsCount: number;
        isOpenAccess: boolean;
        submissionDate: Date | null;
        acceptanceDate: Date | null;
        publicationDate: Date | null;
        isInternational: boolean;
        abstract: string | null;
    }>;
    updatePublication(id: string, data: UpdatePublicationInput, userId: string): Promise<{
        document: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.DocumentType;
            version: number;
            title: string;
            description: string | null;
            projectId: string | null;
            activityId: string | null;
            size: bigint;
            isPublic: boolean;
            filename: string;
            filepath: string;
            mimeType: string;
            tags: string[];
            deletedAt: Date | null;
            deletedBy: string | null;
            favoritedBy: string[];
            viewCount: number;
            downloadCount: number;
            lastViewedAt: Date | null;
            previousVersionId: string | null;
            ownerId: string;
            taskId: string | null;
            seminarId: string | null;
            trainingId: string | null;
            internshipId: string | null;
            supervisionId: string | null;
            knowledgeTransferId: string | null;
            eventId: string | null;
        } | null;
        authors: ({
            user: {
                email: string;
                id: string;
                firstName: string;
                lastName: string;
                department: string | null;
            };
        } & {
            userId: string;
            id: string;
            createdAt: Date;
            authorOrder: number;
            isCorresponding: boolean;
            affiliation: string | null;
            publicationId: string;
        })[];
        linkedProjects: {
            id: string;
            code: string;
            title: string;
        }[];
        linkedActivities: {
            id: string;
            code: string | null;
            title: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.PublicationType;
        title: string;
        status: string;
        keywords: string[];
        language: string;
        documentId: string | null;
        url: string | null;
        journal: string | null;
        isbn: string | null;
        doi: string | null;
        volume: string | null;
        issue: string | null;
        pages: string | null;
        publisher: string | null;
        impactFactor: number | null;
        quartile: string | null;
        citationsCount: number;
        isOpenAccess: boolean;
        submissionDate: Date | null;
        acceptanceDate: Date | null;
        publicationDate: Date | null;
        isInternational: boolean;
        abstract: string | null;
    }>;
    deletePublication(id: string, userId: string, userRole: UserRole): Promise<{
        message: string;
    }>;
    getResearcherPublications(researcherId: string, year?: number): Promise<({
        document: {
            id: string;
            filename: string;
            mimeType: string;
        } | null;
        authors: ({
            user: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            userId: string;
            id: string;
            createdAt: Date;
            authorOrder: number;
            isCorresponding: boolean;
            affiliation: string | null;
            publicationId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.PublicationType;
        title: string;
        status: string;
        keywords: string[];
        language: string;
        documentId: string | null;
        url: string | null;
        journal: string | null;
        isbn: string | null;
        doi: string | null;
        volume: string | null;
        issue: string | null;
        pages: string | null;
        publisher: string | null;
        impactFactor: number | null;
        quartile: string | null;
        citationsCount: number;
        isOpenAccess: boolean;
        submissionDate: Date | null;
        acceptanceDate: Date | null;
        publicationDate: Date | null;
        isInternational: boolean;
        abstract: string | null;
    })[]>;
    getPublicationStats(userId?: string): Promise<{
        total: number;
        byType: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.PublicationGroupByOutputType, "type"[]> & {
            _count: number;
        })[];
        byYear: {
            [key: string]: number;
        };
        byQuartile: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.PublicationGroupByOutputType, "quartile"[]> & {
            _count: number;
        })[];
        international: number;
        nationalRate: string | number;
        internationalRate: string | number;
    }>;
    private groupByYear;
    attachDocument(publicationId: string, file: Express.Multer.File, userId: string): Promise<{
        document: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.DocumentType;
            version: number;
            title: string;
            description: string | null;
            projectId: string | null;
            activityId: string | null;
            size: bigint;
            isPublic: boolean;
            filename: string;
            filepath: string;
            mimeType: string;
            tags: string[];
            deletedAt: Date | null;
            deletedBy: string | null;
            favoritedBy: string[];
            viewCount: number;
            downloadCount: number;
            lastViewedAt: Date | null;
            previousVersionId: string | null;
            ownerId: string;
            taskId: string | null;
            seminarId: string | null;
            trainingId: string | null;
            internshipId: string | null;
            supervisionId: string | null;
            knowledgeTransferId: string | null;
            eventId: string | null;
        } | null;
        authors: ({
            user: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            userId: string;
            id: string;
            createdAt: Date;
            authorOrder: number;
            isCorresponding: boolean;
            affiliation: string | null;
            publicationId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.PublicationType;
        title: string;
        status: string;
        keywords: string[];
        language: string;
        documentId: string | null;
        url: string | null;
        journal: string | null;
        isbn: string | null;
        doi: string | null;
        volume: string | null;
        issue: string | null;
        pages: string | null;
        publisher: string | null;
        impactFactor: number | null;
        quartile: string | null;
        citationsCount: number;
        isOpenAccess: boolean;
        submissionDate: Date | null;
        acceptanceDate: Date | null;
        publicationDate: Date | null;
        isInternational: boolean;
        abstract: string | null;
    }>;
    downloadDocument(publicationId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.DocumentType;
        version: number;
        title: string;
        description: string | null;
        projectId: string | null;
        activityId: string | null;
        size: bigint;
        isPublic: boolean;
        filename: string;
        filepath: string;
        mimeType: string;
        tags: string[];
        deletedAt: Date | null;
        deletedBy: string | null;
        favoritedBy: string[];
        viewCount: number;
        downloadCount: number;
        lastViewedAt: Date | null;
        previousVersionId: string | null;
        ownerId: string;
        taskId: string | null;
        seminarId: string | null;
        trainingId: string | null;
        internshipId: string | null;
        supervisionId: string | null;
        knowledgeTransferId: string | null;
        eventId: string | null;
    }>;
}
export declare const publicationService: PublicationService;
//# sourceMappingURL=publication.service.d.ts.map