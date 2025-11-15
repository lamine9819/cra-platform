import { AuditLevel } from '@prisma/client';
export interface AuditLogMetadata {
    ip?: string;
    userAgent?: string;
    source?: string;
    [key: string]: any;
}
export interface AuditLogChanges {
    before?: any;
    after?: any;
    fields?: string[];
}
export interface CreateAuditLogParams {
    action: string;
    level?: AuditLevel;
    userId?: string;
    entityType?: string;
    entityId?: string;
    details?: any;
    metadata?: AuditLogMetadata;
    changes?: AuditLogChanges;
}
export declare class AuditLogService {
    /**
     * Créer un log d'audit
     */
    static createLog(params: CreateAuditLogParams): Promise<{
        userId: string | null;
        id: string;
        createdAt: Date;
        action: string;
        level: import(".prisma/client").$Enums.AuditLevel;
        entityType: string | null;
        entityId: string | null;
        details: import("@prisma/client/runtime/library").JsonValue | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        changes: import("@prisma/client/runtime/library").JsonValue | null;
    } | null>;
    /**
     * Log pour une création d'entité
     */
    static logCreate(entityType: string, entityId: string, data: any, userId?: string, metadata?: AuditLogMetadata): Promise<{
        userId: string | null;
        id: string;
        createdAt: Date;
        action: string;
        level: import(".prisma/client").$Enums.AuditLevel;
        entityType: string | null;
        entityId: string | null;
        details: import("@prisma/client/runtime/library").JsonValue | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        changes: import("@prisma/client/runtime/library").JsonValue | null;
    } | null>;
    /**
     * Log pour une mise à jour d'entité
     */
    static logUpdate(entityType: string, entityId: string, before: any, after: any, userId?: string, metadata?: AuditLogMetadata): Promise<{
        userId: string | null;
        id: string;
        createdAt: Date;
        action: string;
        level: import(".prisma/client").$Enums.AuditLevel;
        entityType: string | null;
        entityId: string | null;
        details: import("@prisma/client/runtime/library").JsonValue | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        changes: import("@prisma/client/runtime/library").JsonValue | null;
    } | null>;
    /**
     * Log pour une suppression d'entité
     */
    static logDelete(entityType: string, entityId: string, data: any, userId?: string, metadata?: AuditLogMetadata): Promise<{
        userId: string | null;
        id: string;
        createdAt: Date;
        action: string;
        level: import(".prisma/client").$Enums.AuditLevel;
        entityType: string | null;
        entityId: string | null;
        details: import("@prisma/client/runtime/library").JsonValue | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        changes: import("@prisma/client/runtime/library").JsonValue | null;
    } | null>;
    /**
     * Log pour une connexion utilisateur
     */
    static logLogin(userId: string, success: boolean, metadata?: AuditLogMetadata): Promise<{
        userId: string | null;
        id: string;
        createdAt: Date;
        action: string;
        level: import(".prisma/client").$Enums.AuditLevel;
        entityType: string | null;
        entityId: string | null;
        details: import("@prisma/client/runtime/library").JsonValue | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        changes: import("@prisma/client/runtime/library").JsonValue | null;
    } | null>;
    /**
     * Log pour une déconnexion utilisateur
     */
    static logLogout(userId: string, metadata?: AuditLogMetadata): Promise<{
        userId: string | null;
        id: string;
        createdAt: Date;
        action: string;
        level: import(".prisma/client").$Enums.AuditLevel;
        entityType: string | null;
        entityId: string | null;
        details: import("@prisma/client/runtime/library").JsonValue | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        changes: import("@prisma/client/runtime/library").JsonValue | null;
    } | null>;
    /**
     * Log pour une consultation/vue d'entité
     */
    static logView(entityType: string, entityId: string, userId?: string, metadata?: AuditLogMetadata): Promise<{
        userId: string | null;
        id: string;
        createdAt: Date;
        action: string;
        level: import(".prisma/client").$Enums.AuditLevel;
        entityType: string | null;
        entityId: string | null;
        details: import("@prisma/client/runtime/library").JsonValue | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        changes: import("@prisma/client/runtime/library").JsonValue | null;
    } | null>;
    /**
     * Log pour une erreur
     */
    static logError(error: Error, userId?: string, entityType?: string, entityId?: string, metadata?: AuditLogMetadata): Promise<{
        userId: string | null;
        id: string;
        createdAt: Date;
        action: string;
        level: import(".prisma/client").$Enums.AuditLevel;
        entityType: string | null;
        entityId: string | null;
        details: import("@prisma/client/runtime/library").JsonValue | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        changes: import("@prisma/client/runtime/library").JsonValue | null;
    } | null>;
    /**
     * Log critique pour des actions sensibles
     */
    static logCritical(action: string, details: any, userId?: string, metadata?: AuditLogMetadata): Promise<{
        userId: string | null;
        id: string;
        createdAt: Date;
        action: string;
        level: import(".prisma/client").$Enums.AuditLevel;
        entityType: string | null;
        entityId: string | null;
        details: import("@prisma/client/runtime/library").JsonValue | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        changes: import("@prisma/client/runtime/library").JsonValue | null;
    } | null>;
    /**
     * Récupérer les logs avec filtres et pagination
     */
    static getLogs(params: {
        page?: number;
        limit?: number;
        userId?: string;
        action?: string;
        entityType?: string;
        level?: AuditLevel;
        startDate?: Date;
        endDate?: Date;
    }): Promise<{
        logs: ({
            user: {
                email: string;
                id: string;
                firstName: string;
                lastName: string;
            } | null;
        } & {
            userId: string | null;
            id: string;
            createdAt: Date;
            action: string;
            level: import(".prisma/client").$Enums.AuditLevel;
            entityType: string | null;
            entityId: string | null;
            details: import("@prisma/client/runtime/library").JsonValue | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            changes: import("@prisma/client/runtime/library").JsonValue | null;
        })[];
        total: number;
        page: number;
        totalPages: number;
        limit: number;
    }>;
    /**
     * Récupérer les statistiques des logs
     */
    static getStats(params?: {
        userId?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<{
        totalLogs: number;
        byLevel: Record<string, number>;
        byAction: {
            action: string;
            count: number;
        }[];
        byEntityType: {
            entityType: string | null;
            count: number;
        }[];
    }>;
    /**
     * Récupérer l'historique d'une entité spécifique
     */
    static getEntityHistory(entityType: string, entityId: string): Promise<({
        user: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        userId: string | null;
        id: string;
        createdAt: Date;
        action: string;
        level: import(".prisma/client").$Enums.AuditLevel;
        entityType: string | null;
        entityId: string | null;
        details: import("@prisma/client/runtime/library").JsonValue | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        changes: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    /**
     * Nettoyer les anciens logs (à exécuter périodiquement)
     */
    static cleanOldLogs(daysToKeep?: number): Promise<{
        deletedCount: number;
        cutoffDate: Date;
    }>;
}
export default AuditLogService;
//# sourceMappingURL=auditLog.service.d.ts.map