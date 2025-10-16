// src/services/partner.service.ts - SERVICE DE GESTION DES PARTENAIRES
import { PrismaClient, PartnerType } from '@prisma/client';
import { ValidationError } from '../utils/errors';

const prisma = new PrismaClient();

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

export class PartnerService {

  // Créer un nouveau partenaire
  async createPartner(partnerData: CreatePartnerRequest): Promise<any> {
    // Vérifier que le nom n'existe pas déjà
    const existingPartner = await prisma.partner.findFirst({
      where: { name: partnerData.name }
    });

    if (existingPartner) {
      throw new ValidationError('Un partenaire avec ce nom existe déjà');
    }

    // Valider l'email si fourni
    if (partnerData.email || partnerData.contactEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (partnerData.email && !emailRegex.test(partnerData.email)) {
        throw new ValidationError('Format d\'email invalide');
      }
      if (partnerData.contactEmail && !emailRegex.test(partnerData.contactEmail)) {
        throw new ValidationError('Format d\'email de contact invalide');
      }
    }

    const partner = await prisma.partner.create({
      data: {
        name: partnerData.name,
        type: partnerData.type,
        category: partnerData.category,
        description: partnerData.description,
        address: partnerData.address,
        phone: partnerData.phone,
        email: partnerData.email,
        website: partnerData.website,
        contactPerson: partnerData.contactPerson,
        contactTitle: partnerData.contactTitle,
        contactEmail: partnerData.contactEmail,
        contactPhone: partnerData.contactPhone,
        expertise: partnerData.expertise || [],
        services: partnerData.services || []
      }
    });

    return this.formatPartnerResponse(partner);
  }

  // Lister les partenaires avec filtres
  async listPartners(query: PartnerListQuery) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.type) {
      where.type = query.type;
    }

    if (query.category) {
      where.category = { contains: query.category, mode: 'insensitive' };
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { contactPerson: { contains: query.search, mode: 'insensitive' } },
        { expertise: { hasSome: [query.search] } },
        { services: { hasSome: [query.search] } }
      ];
    }

    const [partners, total] = await Promise.all([
      prisma.partner.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' }
      }),
      prisma.partner.count({ where })
    ]);

    return {
      partners: partners.map((partner: any) => this.formatPartnerResponse(partner)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      }
    };
  }

  // Obtenir un partenaire par ID
  async getPartnerById(partnerId: string): Promise<any> {
    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
      include: {
        projectPartnerships: {
          include: {
            project: {
              select: {
                id: true,
                title: true,
                code: true,
                status: true
              }
            }
          }
        },
        activityPartnerships: {
          include: {
            activity: {
              select: {
                id: true,
                title: true,
                code: true,
                status: true
              }
            }
          }
        }
      }
    });

    if (!partner) {
      throw new ValidationError('Partenaire non trouvé');
    }

    return this.formatPartnerResponse(partner);
  }

  // Mettre à jour un partenaire
  async updatePartner(partnerId: string, updateData: UpdatePartnerRequest): Promise<any> {
    const partner = await prisma.partner.findUnique({
      where: { id: partnerId }
    });

    if (!partner) {
      throw new ValidationError('Partenaire non trouvé');
    }

    // Vérifier l'unicité du nom si modifié
    if (updateData.name && updateData.name !== partner.name) {
      const existingPartner = await prisma.partner.findFirst({
        where: { 
          name: updateData.name,
          id: { not: partnerId }
        }
      });

      if (existingPartner) {
        throw new ValidationError('Un partenaire avec ce nom existe déjà');
      }
    }

    // Valider les emails si fournis
    if (updateData.email || updateData.contactEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (updateData.email && !emailRegex.test(updateData.email)) {
        throw new ValidationError('Format d\'email invalide');
      }
      if (updateData.contactEmail && !emailRegex.test(updateData.contactEmail)) {
        throw new ValidationError('Format d\'email de contact invalide');
      }
    }

    const updatedPartner = await prisma.partner.update({
      where: { id: partnerId },
      data: updateData
    });

    return this.formatPartnerResponse(updatedPartner);
  }

  // Supprimer un partenaire
  async deletePartner(partnerId: string): Promise<void> {
    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
      include: {
        _count: {
          select: {
            projectPartnerships: true,
            activityPartnerships: true
          }
        }
      }
    });

    if (!partner) {
      throw new ValidationError('Partenaire non trouvé');
    }

    // Empêcher la suppression si le partenaire est lié à des projets ou activités
    if (partner._count.projectPartnerships > 0 || partner._count.activityPartnerships > 0) {
      throw new ValidationError('Impossible de supprimer un partenaire lié à des projets ou activités');
    }

    await prisma.partner.delete({
      where: { id: partnerId }
    });
  }

  // Rechercher des partenaires par expertise ou services
  async searchPartnersByExpertise(expertise: string[]): Promise<any[]> {
    const partners = await prisma.partner.findMany({
      where: {
        OR: [
          { expertise: { hasSome: expertise } },
          { services: { hasSome: expertise } }
        ]
      },
      orderBy: { name: 'asc' }
    });

    return partners.map((partner: any) => this.formatPartnerResponse(partner));
  }

  // MÉTHODES UTILITAIRES PRIVÉES

  private formatPartnerResponse(partner: any) {
    return {
      id: partner.id,
      name: partner.name,
      type: partner.type,
      category: partner.category || undefined,
      description: partner.description || undefined,
      address: partner.address || undefined,
      phone: partner.phone || undefined,
      email: partner.email || undefined,
      website: partner.website || undefined,
      contactPerson: partner.contactPerson || undefined,
      contactTitle: partner.contactTitle || undefined,
      contactEmail: partner.contactEmail || undefined,
      contactPhone: partner.contactPhone || undefined,
      expertise: partner.expertise || [],
      services: partner.services || [],
      createdAt: partner.createdAt,
      updatedAt: partner.updatedAt,
      
      // Relations si incluses
      projectPartnerships: partner.projectPartnerships?.map((pp: any) => ({
        id: pp.id,
        partnerType: pp.partnerType,
        isActive: pp.isActive,
        project: pp.project
      })) || [],
      
      activityPartnerships: partner.activityPartnerships?.map((ap: any) => ({
        id: ap.id,
        partnerType: ap.partnerType,
        isActive: ap.isActive,
        activity: ap.activity
      })) || []
    };
  }
}