export declare class PermissionService {
    static checkFormAccess(form: any, userId: string | null, userRole: string | null): {
        canAccess: boolean;
        accessType: 'CREATOR' | 'PROJECT_PARTICIPANT' | 'SHARED' | 'PUBLIC' | 'DENIED';
        permissions: {
            canView: boolean;
            canEdit: boolean;
            canDelete: boolean;
            canSubmit: boolean;
            canViewResponses: boolean;
            canExport: boolean;
            canShare: boolean;
            canComment: boolean;
        };
    };
}
//# sourceMappingURL=permissionService.d.ts.map