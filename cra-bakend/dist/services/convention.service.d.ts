import { CreateConventionRequest, UpdateConventionRequest, ConventionListQuery, ConventionResponse } from '../types/convention.types';
export declare class ConventionService {
    createConvention(data: CreateConventionRequest, userId: string, userRole: string): Promise<ConventionResponse>;
    listConventions(userId: string, userRole: string, query: ConventionListQuery): Promise<{
        conventions: ConventionResponse[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    getConventionById(conventionId: string, userId: string, userRole: string): Promise<ConventionResponse>;
    updateConvention(conventionId: string, updateData: UpdateConventionRequest, userId: string, userRole: string): Promise<ConventionResponse>;
    deleteConvention(conventionId: string, userId: string, userRole: string): Promise<void>;
    private formatConventionResponse;
}
//# sourceMappingURL=convention.service.d.ts.map