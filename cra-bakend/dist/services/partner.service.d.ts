import { PartnerType } from '@prisma/client';
export interface CreatePartnerRequest {
    name: string;
    type: PartnerType;
    category?: string;
    description?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    contactPerson?: string;
    contactTitle?: string;
    contactEmail?: string;
    contactPhone?: string;
    expertise?: string[];
    services?: string[];
}
export interface UpdatePartnerRequest {
    name?: string;
    type?: PartnerType;
    category?: string;
    description?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    contactPerson?: string;
    contactTitle?: string;
    contactEmail?: string;
    contactPhone?: string;
    expertise?: string[];
    services?: string[];
}
export interface PartnerListQuery {
    page?: number;
    limit?: number;
    type?: PartnerType;
    category?: string;
    search?: string;
}
export declare class PartnerService {
    createPartner(partnerData: CreatePartnerRequest): Promise<any>;
    listPartners(query: PartnerListQuery): Promise<{
        partners: {
            id: any;
            name: any;
            type: any;
            category: any;
            description: any;
            address: any;
            phone: any;
            email: any;
            website: any;
            contactPerson: any;
            contactTitle: any;
            contactEmail: any;
            contactPhone: any;
            expertise: any;
            services: any;
            createdAt: any;
            updatedAt: any;
            projectPartnerships: any;
            activityPartnerships: any;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    getPartnerById(partnerId: string): Promise<any>;
    updatePartner(partnerId: string, updateData: UpdatePartnerRequest): Promise<any>;
    deletePartner(partnerId: string): Promise<void>;
    searchPartnersByExpertise(expertise: string[]): Promise<any[]>;
    private formatPartnerResponse;
}
//# sourceMappingURL=partner.service.d.ts.map