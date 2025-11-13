export class PermissionService {
  
  static checkFormAccess(
    form: any,
    userId: string | null,
    userRole: string | null
  ): {
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
  } {
    
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