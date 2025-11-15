import { EventType, EventStatus, SeminarStatus } from '@prisma/client';
export interface CreateEventDto {
    title: string;
    description?: string;
    type: EventType;
    startDate: Date;
    endDate?: Date;
    location?: string;
    isAllDay?: boolean;
    isRecurring?: boolean;
    recurrenceRule?: string;
    color?: string;
    stationId?: string;
    projectId?: string;
    activityId?: string;
}
export interface UpdateEventDto {
    title?: string;
    description?: string;
    type?: EventType;
    status?: EventStatus;
    startDate?: Date;
    endDate?: Date;
    location?: string;
    isAllDay?: boolean;
    isRecurring?: boolean;
    recurrenceRule?: string;
    color?: string;
    stationId?: string;
    projectId?: string;
    activityId?: string;
}
export interface CreateSeminarDto {
    title: string;
    description?: string;
    location?: string;
    startDate: Date;
    endDate?: Date;
    agenda?: string;
    maxParticipants?: number;
    calendarEventId?: string;
}
export interface UpdateSeminarDto {
    title?: string;
    description?: string;
    location?: string;
    startDate?: Date;
    endDate?: Date;
    status?: SeminarStatus;
    agenda?: string;
    maxParticipants?: number;
}
export interface EventFilterDto {
    startDate?: Date;
    endDate?: Date;
    type?: EventType;
    status?: EventStatus;
    creatorId?: string;
    stationId?: string;
    projectId?: string;
    activityId?: string;
}
export interface SeminarFilterDto {
    status?: SeminarStatus;
    organizerId?: string;
    startDate?: Date;
    endDate?: Date;
}
export interface EventReportDto {
    format: 'pdf' | 'docx';
    startDate?: Date;
    endDate?: Date;
    type?: EventType;
    creatorId?: string;
}
//# sourceMappingURL=event.types.d.ts.map