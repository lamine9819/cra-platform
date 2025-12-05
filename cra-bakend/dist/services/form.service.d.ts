import { CreateFormRequest, UpdateFormRequest, SubmitFormResponseRequest, FormResponse, FormResponseData, CollectorInfo, FormShare, PublicShareInfo, SyncSummary } from '../types/form.types';
export declare class FormService {
    createForm(formData: CreateFormRequest, creatorId: string, creatorRole: string): Promise<FormResponse>;
    shareFormWithUser(formId: string, targetUserId: string, permissions: {
        canCollect: boolean;
        canExport: boolean;
    }, userId: string, userRole: string, maxSubmissions?: number, expiresAt?: Date): Promise<FormShare>;
    createPublicShareLink(formId: string, userId: string, userRole: string, options?: {
        maxSubmissions?: number;
        expiresAt?: Date;
    }): Promise<PublicShareInfo>;
    getFormByPublicToken(shareToken: string): Promise<{
        form: {
            creator: {
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            description: string | null;
            creatorId: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            title: string;
            activityId: string | null;
            schema: import("@prisma/client/runtime/library").JsonValue;
            isPublic: boolean;
            shareToken: string | null;
            shareCount: number;
            allowMultipleSubmissions: boolean;
        };
        canCollect: boolean;
        remainingSubmissions: number | null;
    }>;
    submitFormResponse(formId: string, responseData: SubmitFormResponseRequest, respondentId: string | null, respondentRole: string | null, collectorInfo?: CollectorInfo): Promise<FormResponseData>;
    private processResponsePhotos;
    private createResponsePhotos;
    storeOfflineData(formId: string, deviceId: string, data: any): Promise<void>;
    syncOfflineData(deviceId: string): Promise<SyncSummary>;
    listForms(userId: string, userRole: string, query: any): Promise<{
        forms: FormResponse[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    getFormById(formId: string, userId: string, userRole: string, includeComments?: boolean): Promise<FormResponse>;
    updateForm(formId: string, updateData: UpdateFormRequest, userId: string, userRole: string): Promise<FormResponse>;
    deleteForm(formId: string, userId: string, userRole: string): Promise<void>;
    private deleteFormWithDependencies;
    private checkProjectAccess;
    private checkFormAccess;
    private checkFormEditPermissions;
    private checkFormDeletePermissions;
    private getSubmissionCount;
    private getFormIncludes;
    private formatFormResponse;
}
//# sourceMappingURL=form.service.d.ts.map