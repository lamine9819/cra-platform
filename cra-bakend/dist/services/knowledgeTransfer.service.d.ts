import { CreateKnowledgeTransferRequest, UpdateKnowledgeTransferRequest, KnowledgeTransferListQuery, KnowledgeTransferResponse } from '../types/knowledgeTransfer.types';
export declare class KnowledgeTransferService {
    createKnowledgeTransfer(data: CreateKnowledgeTransferRequest, userId: string, userRole: string): Promise<KnowledgeTransferResponse>;
    listKnowledgeTransfers(userId: string, userRole: string, query: KnowledgeTransferListQuery): Promise<{
        transfers: KnowledgeTransferResponse[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    getKnowledgeTransferById(transferId: string, userId: string, userRole: string): Promise<KnowledgeTransferResponse>;
    updateKnowledgeTransfer(transferId: string, updateData: UpdateKnowledgeTransferRequest, userId: string, userRole: string): Promise<KnowledgeTransferResponse>;
    deleteKnowledgeTransfer(transferId: string, userId: string, userRole: string): Promise<void>;
    private checkAccess;
    private formatResponse;
}
//# sourceMappingURL=knowledgeTransfer.service.d.ts.map