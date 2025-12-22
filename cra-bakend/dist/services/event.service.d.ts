import { UserRole } from '@prisma/client';
import { CreateEventDto, UpdateEventDto, CreateSeminarDto, UpdateSeminarDto, EventFilterDto, SeminarFilterDto } from '../types/event.types';
export declare class EventService {
    createEvent(userId: string, data: CreateEventDto): Promise<{
        documents: {
            type: import(".prisma/client").$Enums.DocumentType;
            id: string;
            createdAt: Date;
            title: string;
            size: bigint;
            filename: string;
        }[];
        creator: {
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
            firstName: string;
            lastName: string;
        };
        project: {
            id: string;
            code: string;
            title: string;
        };
        station: {
            name: string;
            description: string | null;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            location: string;
            surface: number | null;
        };
        activity: {
            type: import(".prisma/client").$Enums.ActivityType;
            id: string;
            code: string;
            title: string;
        };
    } & {
        description: string | null;
        type: import(".prisma/client").$Enums.EventType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        status: import(".prisma/client").$Enums.EventStatus;
        startDate: Date;
        endDate: Date | null;
        creatorId: string;
        location: string | null;
        projectId: string | null;
        stationId: string | null;
        activityId: string | null;
        color: string | null;
        isAllDay: boolean;
        isRecurring: boolean;
        recurrenceRule: string | null;
    }>;
    getEventById(eventId: string, userId: string, userRole: UserRole): Promise<{
        documents: {
            type: import(".prisma/client").$Enums.DocumentType;
            id: string;
            createdAt: Date;
            title: string;
            size: bigint;
            filename: string;
            filepath: string;
            mimeType: string;
            owner: {
                id: string;
                firstName: string;
                lastName: string;
            };
        }[];
        creator: {
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
            firstName: string;
            lastName: string;
        };
        project: {
            id: string;
            code: string;
            title: string;
        };
        station: {
            name: string;
            description: string | null;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            location: string;
            surface: number | null;
        };
        activity: {
            type: import(".prisma/client").$Enums.ActivityType;
            id: string;
            code: string;
            title: string;
        };
    } & {
        description: string | null;
        type: import(".prisma/client").$Enums.EventType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        status: import(".prisma/client").$Enums.EventStatus;
        startDate: Date;
        endDate: Date | null;
        creatorId: string;
        location: string | null;
        projectId: string | null;
        stationId: string | null;
        activityId: string | null;
        color: string | null;
        isAllDay: boolean;
        isRecurring: boolean;
        recurrenceRule: string | null;
    }>;
    listEvents(userId: string, userRole: UserRole, filters: EventFilterDto): Promise<({
        _count: {
            documents: number;
        };
        creator: {
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
            firstName: string;
            lastName: string;
        };
        project: {
            id: string;
            code: string;
            title: string;
        };
        station: {
            name: string;
            id: string;
            location: string;
        };
        activity: {
            type: import(".prisma/client").$Enums.ActivityType;
            id: string;
            code: string;
            title: string;
        };
    } & {
        description: string | null;
        type: import(".prisma/client").$Enums.EventType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        status: import(".prisma/client").$Enums.EventStatus;
        startDate: Date;
        endDate: Date | null;
        creatorId: string;
        location: string | null;
        projectId: string | null;
        stationId: string | null;
        activityId: string | null;
        color: string | null;
        isAllDay: boolean;
        isRecurring: boolean;
        recurrenceRule: string | null;
    })[]>;
    updateEvent(eventId: string, userId: string, userRole: UserRole, data: UpdateEventDto): Promise<{
        creator: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        };
        project: {
            id: string;
            code: string;
            title: string;
        };
        station: {
            name: string;
            description: string | null;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            location: string;
            surface: number | null;
        };
        activity: {
            id: string;
            code: string;
            title: string;
        };
    } & {
        description: string | null;
        type: import(".prisma/client").$Enums.EventType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        status: import(".prisma/client").$Enums.EventStatus;
        startDate: Date;
        endDate: Date | null;
        creatorId: string;
        location: string | null;
        projectId: string | null;
        stationId: string | null;
        activityId: string | null;
        color: string | null;
        isAllDay: boolean;
        isRecurring: boolean;
        recurrenceRule: string | null;
    }>;
    deleteEvent(eventId: string, userId: string, userRole: UserRole): Promise<{
        message: string;
    }>;
    addDocumentToEvent(eventId: string, userId: string, documentData: {
        title: string;
        filename: string;
        filepath: string;
        mimeType: string;
        size: bigint;
        type: any;
        description?: string;
    }): Promise<{
        owner: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        description: string | null;
        type: import(".prisma/client").$Enums.DocumentType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        version: number;
        title: string;
        projectId: string | null;
        activityId: string | null;
        size: bigint;
        filename: string;
        filepath: string;
        mimeType: string;
        tags: string[];
        isPublic: boolean;
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
    }>;
    createSeminar(userId: string, data: CreateSeminarDto): Promise<{
        documents: {
            type: import(".prisma/client").$Enums.DocumentType;
            id: string;
            createdAt: Date;
            title: string;
            size: bigint;
            filename: string;
        }[];
        calendarEvent: {
            description: string | null;
            type: import(".prisma/client").$Enums.EventType;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            status: import(".prisma/client").$Enums.EventStatus;
            startDate: Date;
            endDate: Date | null;
            creatorId: string;
            location: string | null;
            projectId: string | null;
            stationId: string | null;
            activityId: string | null;
            color: string | null;
            isAllDay: boolean;
            isRecurring: boolean;
            recurrenceRule: string | null;
        };
        organizer: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        status: import(".prisma/client").$Enums.SeminarStatus;
        startDate: Date;
        endDate: Date | null;
        location: string | null;
        organizerId: string;
        agenda: string | null;
        maxParticipants: number | null;
        calendarEventId: string | null;
    }>;
    getSeminarById(seminarId: string, userId: string, userRole: UserRole): Promise<{
        documents: {
            type: import(".prisma/client").$Enums.DocumentType;
            id: string;
            createdAt: Date;
            title: string;
            size: bigint;
            filename: string;
            filepath: string;
            mimeType: string;
            owner: {
                id: string;
                firstName: string;
                lastName: string;
            };
        }[];
        calendarEvent: {
            description: string | null;
            type: import(".prisma/client").$Enums.EventType;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            status: import(".prisma/client").$Enums.EventStatus;
            startDate: Date;
            endDate: Date | null;
            creatorId: string;
            location: string | null;
            projectId: string | null;
            stationId: string | null;
            activityId: string | null;
            color: string | null;
            isAllDay: boolean;
            isRecurring: boolean;
            recurrenceRule: string | null;
        };
        organizer: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        status: import(".prisma/client").$Enums.SeminarStatus;
        startDate: Date;
        endDate: Date | null;
        location: string | null;
        organizerId: string;
        agenda: string | null;
        maxParticipants: number | null;
        calendarEventId: string | null;
    }>;
    listSeminars(userId: string, userRole: UserRole, filters: SeminarFilterDto): Promise<({
        _count: {
            documents: number;
            participants: number;
        };
        calendarEvent: {
            type: import(".prisma/client").$Enums.EventType;
            id: string;
            title: string;
            startDate: Date;
            endDate: Date;
            location: string;
        };
        organizer: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        status: import(".prisma/client").$Enums.SeminarStatus;
        startDate: Date;
        endDate: Date | null;
        location: string | null;
        organizerId: string;
        agenda: string | null;
        maxParticipants: number | null;
        calendarEventId: string | null;
    })[]>;
    updateSeminar(seminarId: string, userId: string, data: UpdateSeminarDto): Promise<{
        documents: {
            type: import(".prisma/client").$Enums.DocumentType;
            id: string;
            createdAt: Date;
            title: string;
            size: bigint;
            filename: string;
        }[];
        calendarEvent: {
            description: string | null;
            type: import(".prisma/client").$Enums.EventType;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            status: import(".prisma/client").$Enums.EventStatus;
            startDate: Date;
            endDate: Date | null;
            creatorId: string;
            location: string | null;
            projectId: string | null;
            stationId: string | null;
            activityId: string | null;
            color: string | null;
            isAllDay: boolean;
            isRecurring: boolean;
            recurrenceRule: string | null;
        };
        organizer: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        status: import(".prisma/client").$Enums.SeminarStatus;
        startDate: Date;
        endDate: Date | null;
        location: string | null;
        organizerId: string;
        agenda: string | null;
        maxParticipants: number | null;
        calendarEventId: string | null;
    }>;
    deleteSeminar(seminarId: string, userId: string): Promise<{
        message: string;
    }>;
    addDocumentToSeminar(seminarId: string, userId: string, documentData: {
        title: string;
        filename: string;
        filepath: string;
        mimeType: string;
        size: bigint;
        type: any;
        description?: string;
    }): Promise<{
        owner: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        description: string | null;
        type: import(".prisma/client").$Enums.DocumentType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        version: number;
        title: string;
        projectId: string | null;
        activityId: string | null;
        size: bigint;
        filename: string;
        filepath: string;
        mimeType: string;
        tags: string[];
        isPublic: boolean;
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
    }>;
    getEventStatistics(userId: string, userRole: UserRole): Promise<{
        total: number;
        byType: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.CalendarEventGroupByOutputType, "type"[]> & {
            _count: number;
        })[];
        byStatus: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.CalendarEventGroupByOutputType, "status"[]> & {
            _count: number;
        })[];
        upcoming: number;
    }>;
}
declare const _default: EventService;
export default _default;
//# sourceMappingURL=event.service.d.ts.map