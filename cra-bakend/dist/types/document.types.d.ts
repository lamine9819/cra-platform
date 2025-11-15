export type DocumentType = 'RAPPORT' | 'FICHE_ACTIVITE' | 'FICHE_TECHNIQUE' | 'FICHE_INDIVIDUELLE' | 'DONNEES_EXPERIMENTALES' | 'FORMULAIRE' | 'PUBLICATION_SCIENTIFIQUE' | 'MEMOIRE' | 'THESE' | 'IMAGE' | 'PRESENTATION' | 'AUTRE';
export interface UploadFileRequest {
    title: string;
    description?: string;
    type?: DocumentType;
    tags?: string[];
    isPublic?: boolean;
    projectId?: string;
    activityId?: string;
    taskId?: string;
    seminarId?: string;
    trainingId?: string;
    internshipId?: string;
    supervisionId?: string;
    knowledgeTransferId?: string;
    eventId?: string;
}
export interface ShareDocumentRequest {
    userIds: string[];
    canEdit?: boolean;
    canDelete?: boolean;
}
export interface DocumentListQuery {
    page?: number;
    limit?: number;
    type?: DocumentType;
    ownerId?: string;
    projectId?: string;
    activityId?: string;
    taskId?: string;
    seminarId?: string;
    trainingId?: string;
    internshipId?: string;
    supervisionId?: string;
    knowledgeTransferId?: string;
    eventId?: string;
    search?: string;
    tags?: string[];
    isPublic?: boolean;
    mimeType?: string;
}
export interface DocumentResponse {
    id: string;
    title: string;
    filename: string;
    filepath: string;
    mimeType: string;
    size: number;
    type: string;
    description?: string | null;
    tags: string[];
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
    owner: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        role: string;
    };
    project?: {
        id: string;
        title: string;
        description?: string | null;
        creatorId: string;
        participants?: {
            userId: string;
            isActive: boolean;
        }[];
    };
    activity?: {
        id: string;
        title: string;
        projectId: string | null;
        project: {
            id: string;
            title: string;
            creatorId: string;
            participants?: {
                userId: string;
                isActive: boolean;
            }[];
        } | null;
    };
    task?: {
        id: string;
        title: string;
        creatorId: string;
        assigneeId?: string | null;
    };
    seminar?: {
        id: string;
        title: string;
        organizerId: string;
        organizer: {
            id: string;
            firstName: string;
            lastName: string;
        };
    };
    training?: {
        id: string;
        title: string;
        type: string;
    };
    internship?: {
        id: string;
        title: string;
        supervisorId: string;
        internId: string;
    };
    supervision?: {
        id: string;
        title: string;
        type: string;
        supervisorId: string;
        studentId: string;
    };
    knowledgeTransfer?: {
        id: string;
        title: string;
        type: string;
        organizerId: string;
    };
    event?: {
        id: string;
        title: string;
        type: string;
        creatorId: string;
    };
    shares?: {
        id: string;
        canEdit: boolean;
        canDelete: boolean;
        sharedAt: Date;
        sharedWith: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
        };
    }[];
}
//# sourceMappingURL=document.types.d.ts.map