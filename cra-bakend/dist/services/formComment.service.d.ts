import { FormComment } from '../types/form.types';
export declare class FormCommentService {
    private formService;
    /**
     * Ajouter un commentaire sur un formulaire
     */
    addComment(formId: string, content: string, authorId: string, authorRole: string): Promise<FormComment>;
    /**
     * Lister les commentaires d'un formulaire
     */
    getFormComments(formId: string, userId: string, userRole: string, options?: {
        page?: number;
        limit?: number;
        orderBy?: 'asc' | 'desc';
    }): Promise<{
        comments: FormComment[];
        pagination?: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    /**
     * Obtenir un commentaire spécifique
     */
    getCommentById(commentId: string, userId: string, userRole: string): Promise<FormComment>;
    /**
     * Modifier un commentaire
     */
    updateComment(commentId: string, newContent: string, userId: string, userRole: string): Promise<FormComment>;
    /**
     * Supprimer un commentaire
     */
    deleteComment(commentId: string, userId: string, userRole: string): Promise<void>;
    /**
     * Obtenir les statistiques des commentaires pour un formulaire
     */
    getFormCommentStats(formId: string, userId: string, userRole: string): Promise<{
        total: number;
        byAuthor: Array<{
            authorId: string;
            authorName: string;
            count: number;
        }>;
        recent: FormComment[];
    }>;
    /**
     * Rechercher dans les commentaires d'un formulaire
     */
    searchFormComments(formId: string, searchTerm: string, userId: string, userRole: string, options?: {
        page?: number;
        limit?: number;
    }): Promise<{
        comments: FormComment[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
}
//# sourceMappingURL=formComment.service.d.ts.map