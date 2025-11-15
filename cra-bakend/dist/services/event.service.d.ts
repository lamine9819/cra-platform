import { UserRole } from '@prisma/client';
import { CreateEventDto, UpdateEventDto, CreateSeminarDto, UpdateSeminarDto, EventFilterDto, SeminarFilterDto } from '../types/event.types';
export declare class EventService {
    createEvent(userId: string, data: CreateEventDto): Promise<{
        documents: {
            id: string;
            createdAt: Date;
            type: import(".prisma/client").$Enums.DocumentType;
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
        } | null;
        station: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            location: string;
            surface: number | null;
        } | null;
        activity: {
            id: string;
            type: import(".prisma/client").$Enums.ActivityType;
            code: string | null;
            title: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.EventType;
        title: string;
        description: string | null;
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
            id: string;
            createdAt: Date;
            type: import(".prisma/client").$Enums.DocumentType;
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
        } | null;
        station: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            location: string;
            surface: number | null;
        } | null;
        activity: {
            id: string;
            type: import(".prisma/client").$Enums.ActivityType;
            code: string | null;
            title: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.EventType;
        title: string;
        description: string | null;
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
        } | null;
        station: {
            id: string;
            name: string;
            location: string;
        } | null;
        activity: {
            id: string;
            type: import(".prisma/client").$Enums.ActivityType;
            code: string | null;
            title: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.EventType;
        title: string;
        description: string | null;
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
        } | null;
        station: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            location: string;
            surface: number | null;
        } | null;
        activity: {
            id: string;
            code: string | null;
            title: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.EventType;
        title: string;
        description: string | null;
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
    createSeminar(userId: string, data: CreateSeminarDto): Promise<{
        documents: {
            id: string;
            createdAt: Date;
            type: import(".prisma/client").$Enums.DocumentType;
            title: string;
            size: bigint;
            filename: string;
        }[];
        calendarEvent: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.EventType;
            title: string;
            description: string | null;
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
        } | null;
        organizer: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
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
            id: string;
            createdAt: Date;
            type: import(".prisma/client").$Enums.DocumentType;
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
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.EventType;
            title: string;
            description: string | null;
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
        } | null;
        organizer: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
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
            id: string;
            type: import(".prisma/client").$Enums.EventType;
            title: string;
            startDate: Date;
            endDate: Date | null;
            location: string | null;
        } | null;
        organizer: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
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
            id: string;
            createdAt: Date;
            type: import(".prisma/client").$Enums.DocumentType;
            title: string;
            size: bigint;
            filename: string;
        }[];
        calendarEvent: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.EventType;
            title: string;
            description: string | null;
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
        } | null;
        organizer: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
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