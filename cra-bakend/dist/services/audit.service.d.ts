import { AuditLevel } from '@prisma/client';
import { Request } from 'express';
import { CreateAuditLogRequest, AuditLogEntry, AuditLogQuery, AuditLogResponse, AuditLogStats, AuditAction, EntityType } from '../types/audit.types';
export declare class AuditService {
    createAuditLog(request: CreateAuditLogRequest, req?: Request): Promise<AuditLogEntry>;
    getAuditLogs(query: AuditLogQuery, requesterId: string, requesterRole: string): Promise<{
        logs: AuditLogResponse[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    getAuditStats(requesterId: string, requesterRole: string, days?: number): Promise<AuditLogStats>;
    getAuditLogById(id: string, requesterId: string, requesterRole: string): Promise<AuditLogResponse>;
    exportAuditLogs(query: AuditLogQuery, requesterId: string, requesterRole: string, format?: 'csv' | 'json'): Promise<string>;
    cleanupOldLogs(daysToKeep?: number): Promise<{
        deleted: number;
    }>;
    private convertToAuditLogEntry;
    private parseMetadata;
    private getClientIP;
    private generateRequestId;
    private extractSessionId;
    private enrichLogWithEntityInfo;
    private formatAuditLogResponse;
    private formatGroupByStats;
    private formatLevelStats;
    private enrichUserStats;
    private getSecurityMetrics;
}
export declare const createAuditLog: (action: AuditAction, options?: {
    level?: AuditLevel;
    userId?: string;
    entityType?: EntityType;
    entityId?: string;
    details?: Record<string, any>;
    changes?: {
        before?: Record<string, any>;
        after?: Record<string, any>;
        fields?: string[];
    };
}, req?: Request) => Promise<AuditLogEntry>;
export declare const detectChanges: (before: any, after: any) => {
    before: any;
    after: any;
    fields: string[];
};
//# sourceMappingURL=audit.service.d.ts.map