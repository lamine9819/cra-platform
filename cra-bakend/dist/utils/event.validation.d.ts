import { z } from 'zod';
export declare const createEventSchema: z.ZodObject<{
    body: z.ZodObject<{
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        type: z.ZodEnum<{
            REUNION: "REUNION";
            SEMINAIRE: "SEMINAIRE";
            FORMATION: "FORMATION";
            MISSION_TERRAIN: "MISSION_TERRAIN";
            CONFERENCE: "CONFERENCE";
            ATELIER: "ATELIER";
            DEMONSTRATION: "DEMONSTRATION";
            VISITE: "VISITE";
            SOUTENANCE: "SOUTENANCE";
            AUTRE: "AUTRE";
        }>;
        startDate: z.ZodPipe<z.ZodString, z.ZodTransform<Date, string>>;
        endDate: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<Date, string>>>;
        location: z.ZodOptional<z.ZodString>;
        isAllDay: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        isRecurring: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        recurrenceRule: z.ZodOptional<z.ZodString>;
        color: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
        stationId: z.ZodOptional<z.ZodString>;
        projectId: z.ZodOptional<z.ZodString>;
        activityId: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateEventSchema: z.ZodObject<{
    body: z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodEnum<{
            REUNION: "REUNION";
            SEMINAIRE: "SEMINAIRE";
            FORMATION: "FORMATION";
            MISSION_TERRAIN: "MISSION_TERRAIN";
            CONFERENCE: "CONFERENCE";
            ATELIER: "ATELIER";
            DEMONSTRATION: "DEMONSTRATION";
            VISITE: "VISITE";
            SOUTENANCE: "SOUTENANCE";
            AUTRE: "AUTRE";
        }>>;
        status: z.ZodOptional<z.ZodEnum<{
            PLANIFIE: "PLANIFIE";
            EN_COURS: "EN_COURS";
            TERMINE: "TERMINE";
            ANNULE: "ANNULE";
            REPORTE: "REPORTE";
        }>>;
        startDate: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<Date, string>>>;
        endDate: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<Date, string>>>;
        location: z.ZodOptional<z.ZodString>;
        isAllDay: z.ZodOptional<z.ZodBoolean>;
        isRecurring: z.ZodOptional<z.ZodBoolean>;
        recurrenceRule: z.ZodOptional<z.ZodString>;
        color: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
        stationId: z.ZodOptional<z.ZodString>;
        projectId: z.ZodOptional<z.ZodString>;
        activityId: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const createSeminarSchema: z.ZodObject<{
    body: z.ZodObject<{
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        location: z.ZodOptional<z.ZodString>;
        startDate: z.ZodPipe<z.ZodString, z.ZodTransform<Date, string>>;
        endDate: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<Date, string>>>;
        agenda: z.ZodOptional<z.ZodString>;
        maxParticipants: z.ZodOptional<z.ZodNumber>;
        calendarEventId: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateSeminarSchema: z.ZodObject<{
    body: z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        location: z.ZodOptional<z.ZodString>;
        startDate: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<Date, string>>>;
        endDate: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<Date, string>>>;
        status: z.ZodOptional<z.ZodEnum<{
            PLANIFIE: "PLANIFIE";
            EN_COURS: "EN_COURS";
            TERMINE: "TERMINE";
            ANNULE: "ANNULE";
        }>>;
        agenda: z.ZodOptional<z.ZodString>;
        maxParticipants: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const eventFilterSchema: z.ZodObject<{
    query: z.ZodObject<{
        startDate: z.ZodCatch<z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<Date | undefined, string | undefined>>>;
        endDate: z.ZodCatch<z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<Date | undefined, string | undefined>>>;
        type: z.ZodCatch<z.ZodOptional<z.ZodEnum<{
            REUNION: "REUNION";
            SEMINAIRE: "SEMINAIRE";
            FORMATION: "FORMATION";
            MISSION_TERRAIN: "MISSION_TERRAIN";
            CONFERENCE: "CONFERENCE";
            ATELIER: "ATELIER";
            DEMONSTRATION: "DEMONSTRATION";
            VISITE: "VISITE";
            SOUTENANCE: "SOUTENANCE";
            AUTRE: "AUTRE";
        }>>>;
        status: z.ZodCatch<z.ZodOptional<z.ZodEnum<{
            PLANIFIE: "PLANIFIE";
            EN_COURS: "EN_COURS";
            TERMINE: "TERMINE";
            ANNULE: "ANNULE";
            REPORTE: "REPORTE";
        }>>>;
        creatorId: z.ZodCatch<z.ZodOptional<z.ZodString>>;
        stationId: z.ZodCatch<z.ZodOptional<z.ZodString>>;
        projectId: z.ZodCatch<z.ZodOptional<z.ZodString>>;
        activityId: z.ZodCatch<z.ZodOptional<z.ZodString>>;
    }, z.core.$loose>;
    params: z.ZodOptional<z.ZodObject<{}, z.core.$strip>>;
    body: z.ZodOptional<z.ZodObject<{}, z.core.$strip>>;
}, z.core.$loose>;
export declare const seminarFilterSchema: z.ZodObject<{
    query: z.ZodObject<{
        status: z.ZodCatch<z.ZodOptional<z.ZodString>>;
        organizerId: z.ZodCatch<z.ZodOptional<z.ZodString>>;
        startDate: z.ZodCatch<z.ZodOptional<z.ZodString>>;
        endDate: z.ZodCatch<z.ZodOptional<z.ZodString>>;
    }, z.core.$loose>;
    params: z.ZodOptional<z.ZodObject<{}, z.core.$strip>>;
    body: z.ZodOptional<z.ZodObject<{}, z.core.$strip>>;
}, z.core.$loose>;
export declare const eventReportSchema: z.ZodObject<{
    query: z.ZodObject<{
        format: z.ZodEnum<{
            pdf: "pdf";
            docx: "docx";
        }>;
        startDate: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<Date | undefined, string | undefined>>;
        endDate: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<Date | undefined, string | undefined>>;
        type: z.ZodOptional<z.ZodEnum<{
            REUNION: "REUNION";
            SEMINAIRE: "SEMINAIRE";
            FORMATION: "FORMATION";
            MISSION_TERRAIN: "MISSION_TERRAIN";
            CONFERENCE: "CONFERENCE";
            ATELIER: "ATELIER";
            DEMONSTRATION: "DEMONSTRATION";
            VISITE: "VISITE";
            SOUTENANCE: "SOUTENANCE";
            AUTRE: "AUTRE";
        }>>;
        creatorId: z.ZodOptional<z.ZodString>;
    }, z.core.$loose>;
    params: z.ZodOptional<z.ZodObject<{}, z.core.$strip>>;
    body: z.ZodOptional<z.ZodObject<{}, z.core.$strip>>;
}, z.core.$loose>;
export declare const eventIdParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    query: z.ZodOptional<z.ZodObject<{}, z.core.$strip>>;
    body: z.ZodOptional<z.ZodObject<{}, z.core.$strip>>;
}, z.core.$loose>;
export declare const seminarIdParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    query: z.ZodOptional<z.ZodObject<{}, z.core.$strip>>;
    body: z.ZodOptional<z.ZodObject<{}, z.core.$strip>>;
}, z.core.$loose>;
//# sourceMappingURL=event.validation.d.ts.map