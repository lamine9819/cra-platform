"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionService = void 0;
class PermissionService {
    static checkFormAccess(form, userId, userRole) {
        const defaultPermissions = {
            canView: false,
            canEdit: false,
            canDelete: false,
            canSubmit: false,
            canViewResponses: false,
            canExport: false,
            canShare: false,
            canComment: false
        };
        if (!userId) {
            if (form.isPublic && form.shareToken) {
                return {
                    canAccess: true,
                    accessType: 'PUBLIC',
                    permissions: {
                        ...defaultPermissions,
                        canView: true,
                        canSubmit: true
                    }
                };
            }
            return {
                canAccess: false,
                accessType: 'DENIED',
                permissions: defaultPermissions
            };
        }
        if (userRole === 'ADMINISTRATEUR') {
            return {
                canAccess: true,
                accessType: 'CREATOR',
                permissions: {
                    canView: true,
                    canEdit: true,
                    canDelete: true,
                    canSubmit: true,
                    canViewResponses: true,
                    canExport: true,
                    canShare: true,
                    canComment: true
                }
            };
        }
        if (form.creatorId === userId) {
            return {
                canAccess: true,
                accessType: 'CREATOR',
                permissions: {
                    canView: true,
                    canEdit: true,
                    canDelete: true,
                    canSubmit: true,
                    canViewResponses: true,
                    canExport: true,
                    canShare: true,
                    canComment: true
                }
            };
        }
        return {
            canAccess: false,
            accessType: 'DENIED',
            permissions: defaultPermissions
        };
    }
}
exports.PermissionService = PermissionService;
//# sourceMappingURL=permissionService.js.map