import { z } from 'zod';
declare const photoDataSchema: z.ZodObject<{
    type: z.ZodLiteral<"photo">;
    base64: z.ZodString;
    filename: z.ZodOptional<z.ZodString>;
    mimeType: z.ZodOptional<z.ZodString>;
    caption: z.ZodOptional<z.ZodString>;
    latitude: z.ZodOptional<z.ZodNumber>;
    longitude: z.ZodOptional<z.ZodNumber>;
    takenAt: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
declare const formFieldSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<{
        number: "number";
        email: "email";
        select: "select";
        date: "date";
        file: "file";
        text: "text";
        textarea: "textarea";
        checkbox: "checkbox";
        radio: "radio";
        time: "time";
        photo: "photo";
    }>;
    label: z.ZodString;
    placeholder: z.ZodOptional<z.ZodString>;
    required: z.ZodDefault<z.ZodBoolean>;
    validation: z.ZodOptional<z.ZodObject<{
        min: z.ZodOptional<z.ZodNumber>;
        max: z.ZodOptional<z.ZodNumber>;
        pattern: z.ZodOptional<z.ZodString>;
        message: z.ZodOptional<z.ZodString>;
        maxFileSize: z.ZodOptional<z.ZodNumber>;
        acceptedTypes: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
    options: z.ZodOptional<z.ZodArray<z.ZodObject<{
        value: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
        label: z.ZodString;
    }, z.core.$strip>>>;
    defaultValue: z.ZodOptional<z.ZodAny>;
    description: z.ZodOptional<z.ZodString>;
    photoConfig: z.ZodOptional<z.ZodObject<{
        maxSize: z.ZodDefault<z.ZodNumber>;
        quality: z.ZodDefault<z.ZodNumber>;
        enableGPS: z.ZodDefault<z.ZodBoolean>;
        enableCaption: z.ZodDefault<z.ZodBoolean>;
        maxPhotos: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>>;
}, z.core.$strip>;
declare const formSchemaSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    version: z.ZodDefault<z.ZodString>;
    fields: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<{
            number: "number";
            email: "email";
            select: "select";
            date: "date";
            file: "file";
            text: "text";
            textarea: "textarea";
            checkbox: "checkbox";
            radio: "radio";
            time: "time";
            photo: "photo";
        }>;
        label: z.ZodString;
        placeholder: z.ZodOptional<z.ZodString>;
        required: z.ZodDefault<z.ZodBoolean>;
        validation: z.ZodOptional<z.ZodObject<{
            min: z.ZodOptional<z.ZodNumber>;
            max: z.ZodOptional<z.ZodNumber>;
            pattern: z.ZodOptional<z.ZodString>;
            message: z.ZodOptional<z.ZodString>;
            maxFileSize: z.ZodOptional<z.ZodNumber>;
            acceptedTypes: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strip>>;
        options: z.ZodOptional<z.ZodArray<z.ZodObject<{
            value: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
            label: z.ZodString;
        }, z.core.$strip>>>;
        defaultValue: z.ZodOptional<z.ZodAny>;
        description: z.ZodOptional<z.ZodString>;
        photoConfig: z.ZodOptional<z.ZodObject<{
            maxSize: z.ZodDefault<z.ZodNumber>;
            quality: z.ZodDefault<z.ZodNumber>;
            enableGPS: z.ZodDefault<z.ZodBoolean>;
            enableCaption: z.ZodDefault<z.ZodBoolean>;
            maxPhotos: z.ZodDefault<z.ZodNumber>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    settings: z.ZodOptional<z.ZodObject<{
        allowMultipleSubmissions: z.ZodDefault<z.ZodBoolean>;
        showProgress: z.ZodDefault<z.ZodBoolean>;
        submitButtonText: z.ZodDefault<z.ZodString>;
        successMessage: z.ZodDefault<z.ZodString>;
        enableOfflineMode: z.ZodDefault<z.ZodBoolean>;
        maxSubmissionsPerUser: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const createFormSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    schema: z.ZodObject<{
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        version: z.ZodDefault<z.ZodString>;
        fields: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodEnum<{
                number: "number";
                email: "email";
                select: "select";
                date: "date";
                file: "file";
                text: "text";
                textarea: "textarea";
                checkbox: "checkbox";
                radio: "radio";
                time: "time";
                photo: "photo";
            }>;
            label: z.ZodString;
            placeholder: z.ZodOptional<z.ZodString>;
            required: z.ZodDefault<z.ZodBoolean>;
            validation: z.ZodOptional<z.ZodObject<{
                min: z.ZodOptional<z.ZodNumber>;
                max: z.ZodOptional<z.ZodNumber>;
                pattern: z.ZodOptional<z.ZodString>;
                message: z.ZodOptional<z.ZodString>;
                maxFileSize: z.ZodOptional<z.ZodNumber>;
                acceptedTypes: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strip>>;
            options: z.ZodOptional<z.ZodArray<z.ZodObject<{
                value: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
                label: z.ZodString;
            }, z.core.$strip>>>;
            defaultValue: z.ZodOptional<z.ZodAny>;
            description: z.ZodOptional<z.ZodString>;
            photoConfig: z.ZodOptional<z.ZodObject<{
                maxSize: z.ZodDefault<z.ZodNumber>;
                quality: z.ZodDefault<z.ZodNumber>;
                enableGPS: z.ZodDefault<z.ZodBoolean>;
                enableCaption: z.ZodDefault<z.ZodBoolean>;
                maxPhotos: z.ZodDefault<z.ZodNumber>;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
        settings: z.ZodOptional<z.ZodObject<{
            allowMultipleSubmissions: z.ZodDefault<z.ZodBoolean>;
            showProgress: z.ZodDefault<z.ZodBoolean>;
            submitButtonText: z.ZodDefault<z.ZodString>;
            successMessage: z.ZodDefault<z.ZodString>;
            enableOfflineMode: z.ZodDefault<z.ZodBoolean>;
            maxSubmissionsPerUser: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    activityId: z.ZodOptional<z.ZodString>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    enablePublicAccess: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export declare const updateFormSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    schema: z.ZodOptional<z.ZodObject<{
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        version: z.ZodDefault<z.ZodString>;
        fields: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodEnum<{
                number: "number";
                email: "email";
                select: "select";
                date: "date";
                file: "file";
                text: "text";
                textarea: "textarea";
                checkbox: "checkbox";
                radio: "radio";
                time: "time";
                photo: "photo";
            }>;
            label: z.ZodString;
            placeholder: z.ZodOptional<z.ZodString>;
            required: z.ZodDefault<z.ZodBoolean>;
            validation: z.ZodOptional<z.ZodObject<{
                min: z.ZodOptional<z.ZodNumber>;
                max: z.ZodOptional<z.ZodNumber>;
                pattern: z.ZodOptional<z.ZodString>;
                message: z.ZodOptional<z.ZodString>;
                maxFileSize: z.ZodOptional<z.ZodNumber>;
                acceptedTypes: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strip>>;
            options: z.ZodOptional<z.ZodArray<z.ZodObject<{
                value: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
                label: z.ZodString;
            }, z.core.$strip>>>;
            defaultValue: z.ZodOptional<z.ZodAny>;
            description: z.ZodOptional<z.ZodString>;
            photoConfig: z.ZodOptional<z.ZodObject<{
                maxSize: z.ZodDefault<z.ZodNumber>;
                quality: z.ZodDefault<z.ZodNumber>;
                enableGPS: z.ZodDefault<z.ZodBoolean>;
                enableCaption: z.ZodDefault<z.ZodBoolean>;
                maxPhotos: z.ZodDefault<z.ZodNumber>;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
        settings: z.ZodOptional<z.ZodObject<{
            allowMultipleSubmissions: z.ZodDefault<z.ZodBoolean>;
            showProgress: z.ZodDefault<z.ZodBoolean>;
            submitButtonText: z.ZodDefault<z.ZodString>;
            successMessage: z.ZodDefault<z.ZodString>;
            enableOfflineMode: z.ZodDefault<z.ZodBoolean>;
            maxSubmissionsPerUser: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    enablePublicAccess: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const submitFormResponseSchema: z.ZodObject<{
    data: z.ZodRecord<z.ZodString, z.ZodAny>;
    collectorName: z.ZodOptional<z.ZodString>;
    collectorEmail: z.ZodOptional<z.ZodString>;
    photos: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodLiteral<"photo">;
        base64: z.ZodString;
        filename: z.ZodOptional<z.ZodString>;
        mimeType: z.ZodOptional<z.ZodString>;
        caption: z.ZodOptional<z.ZodString>;
        latitude: z.ZodOptional<z.ZodNumber>;
        longitude: z.ZodOptional<z.ZodNumber>;
        takenAt: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    isOffline: z.ZodDefault<z.ZodBoolean>;
    deviceId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const shareFormSchema: z.ZodObject<{
    targetUserId: z.ZodOptional<z.ZodString>;
    canCollect: z.ZodDefault<z.ZodBoolean>;
    canExport: z.ZodDefault<z.ZodBoolean>;
    maxSubmissions: z.ZodOptional<z.ZodNumber>;
    expiresAt: z.ZodOptional<z.ZodString>;
    shareType: z.ZodEnum<{
        INTERNAL: "INTERNAL";
        EXTERNAL: "EXTERNAL";
    }>;
}, z.core.$strip>;
export declare const publicShareSchema: z.ZodObject<{
    maxSubmissions: z.ZodOptional<z.ZodNumber>;
    expiresAt: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const uploadPhotoSchema: z.ZodObject<{
    fieldId: z.ZodString;
    photoData: z.ZodObject<{
        type: z.ZodLiteral<"photo">;
        base64: z.ZodString;
        filename: z.ZodOptional<z.ZodString>;
        mimeType: z.ZodOptional<z.ZodString>;
        caption: z.ZodOptional<z.ZodString>;
        latitude: z.ZodOptional<z.ZodNumber>;
        longitude: z.ZodOptional<z.ZodNumber>;
        takenAt: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    formId: z.ZodString;
}, z.core.$strip>;
export declare const offlineDataSchema: z.ZodObject<{
    formId: z.ZodString;
    deviceId: z.ZodString;
    data: z.ZodRecord<z.ZodString, z.ZodAny>;
    photos: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodLiteral<"photo">;
        base64: z.ZodString;
        filename: z.ZodOptional<z.ZodString>;
        mimeType: z.ZodOptional<z.ZodString>;
        caption: z.ZodOptional<z.ZodString>;
        latitude: z.ZodOptional<z.ZodNumber>;
        longitude: z.ZodOptional<z.ZodNumber>;
        takenAt: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    submittedAt: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const syncOfflineSchema: z.ZodObject<{
    deviceId: z.ZodString;
    responses: z.ZodArray<z.ZodObject<{
        formId: z.ZodString;
        deviceId: z.ZodString;
        data: z.ZodRecord<z.ZodString, z.ZodAny>;
        photos: z.ZodOptional<z.ZodArray<z.ZodObject<{
            type: z.ZodLiteral<"photo">;
            base64: z.ZodString;
            filename: z.ZodOptional<z.ZodString>;
            mimeType: z.ZodOptional<z.ZodString>;
            caption: z.ZodOptional<z.ZodString>;
            latitude: z.ZodOptional<z.ZodNumber>;
            longitude: z.ZodOptional<z.ZodNumber>;
            takenAt: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>>;
        submittedAt: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const exportQuerySchema: z.ZodObject<{
    format: z.ZodDefault<z.ZodEnum<{
        json: "json";
        csv: "csv";
        xlsx: "xlsx";
    }>>;
    includePhotos: z.ZodDefault<z.ZodPipe<z.ZodString, z.ZodTransform<boolean, string>>>;
    includeMetadata: z.ZodDefault<z.ZodPipe<z.ZodString, z.ZodTransform<boolean, string>>>;
    includeCollectorInfo: z.ZodDefault<z.ZodPipe<z.ZodString, z.ZodTransform<boolean, string>>>;
    dateRange: z.ZodOptional<z.ZodObject<{
        start: z.ZodOptional<z.ZodString>;
        end: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    collectorTypes: z.ZodOptional<z.ZodArray<z.ZodEnum<{
        USER: "USER";
        SHARED_USER: "SHARED_USER";
        PUBLIC: "PUBLIC";
    }>>>;
}, z.core.$strip>;
export declare const addCommentSchema: z.ZodObject<{
    content: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
}, z.core.$strip>;
export declare const updateCommentSchema: z.ZodObject<{
    content: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
}, z.core.$strip>;
export declare const formSearchQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    limit: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    search: z.ZodOptional<z.ZodString>;
    activityId: z.ZodOptional<z.ZodString>;
    creatorId: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<boolean, string>>>;
    includeShared: z.ZodDefault<z.ZodPipe<z.ZodString, z.ZodTransform<boolean, string>>>;
    includePublic: z.ZodDefault<z.ZodPipe<z.ZodString, z.ZodTransform<boolean, string>>>;
    collectorType: z.ZodDefault<z.ZodEnum<{
        USER: "USER";
        SHARED_USER: "SHARED_USER";
        PUBLIC: "PUBLIC";
        ALL: "ALL";
    }>>;
}, z.core.$strip>;
export declare const statsQuerySchema: z.ZodObject<{
    period: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    type: z.ZodDefault<z.ZodEnum<{
        overview: "overview";
        responses: "responses";
        photos: "photos";
        detailed: "detailed";
        collection: "collection";
    }>>;
    includePhotos: z.ZodDefault<z.ZodBoolean>;
    groupBy: z.ZodDefault<z.ZodEnum<{
        week: "week";
        day: "day";
        month: "month";
    }>>;
}, z.core.$strip>;
export declare class PhotoValidationService {
    static validatePhotoUpload(photoData: any, maxSize?: number): {
        isValid: boolean;
        error?: string;
        processedPhoto?: any;
        sizeReduced?: boolean;
    };
    private static detectMimeType;
}
export declare class FormBusinessValidation {
    static validateSubmissionAccess(formData: any, userId: string | null, userRole: string | null, collectorType: 'USER' | 'SHARED_USER' | 'PUBLIC'): {
        canSubmit: boolean;
        reason?: string;
    };
    static validateViewResponsesAccess(formData: any, userId: string, userRole: string): {
        canView: boolean;
        reason?: string;
    };
    static validateFormSharing(formData: any, userId: string, userRole: string, shareData: any): {
        canShare: boolean;
        reason?: string;
    };
}
export declare const validateShareToken: (token: string) => boolean;
export declare const validateDeviceId: (deviceId: string) => boolean;
export { photoDataSchema, formFieldSchema, formSchemaSchema, };
//# sourceMappingURL=formValidation.d.ts.map