// services/publication.service.ts
import { PrismaClient, PublicationType, UserRole } from '@prisma/client';
import { CreatePublicationInput, UpdatePublicationInput, PublicationQuery } from '../types/publication.types';
import fs from 'fs';
const prisma = new PrismaClient();

export class PublicationService {
  
  // Créer une publication
  async createPublication(data: CreatePublicationInput, userId: string) {
    const { authors, linkedProjectIds, linkedActivityIds, ...publicationData } = data;

    // Vérifier que l'utilisateur créateur est dans la liste des auteurs
    const isAuthor = authors.some(author => author.userId === userId);
    if (!isAuthor) {
      throw new Error("Vous devez être l'un des auteurs de la publication");
    }

    // Vérifier l'ordre des auteurs (doit commencer à 1 et être consécutif)
    const orders = authors.map(a => a.authorOrder).sort((a, b) => a - b);
    for (let i = 0; i < orders.length; i++) {
      if (orders[i] !== i + 1) {
        throw new Error("L'ordre des auteurs doit être consécutif à partir de 1");
      }
    }

    // Créer la publication avec ses relations
    const publication = await prisma.publication.create({
      data: {
        ...publicationData,
        submissionDate: publicationData.submissionDate ? new Date(publicationData.submissionDate) : undefined,
        acceptanceDate: publicationData.acceptanceDate ? new Date(publicationData.acceptanceDate) : undefined,
        publicationDate: publicationData.publicationDate ? new Date(publicationData.publicationDate) : undefined,
        authors: {
          create: authors.map(author => ({
            userId: author.userId,
            authorOrder: author.authorOrder,
            isCorresponding: author.isCorresponding,
            affiliation: author.affiliation
          }))
        },
        linkedProjects: linkedProjectIds.length > 0 ? {
          connect: linkedProjectIds.map(id => ({ id }))
        } : undefined,
        linkedActivities: linkedActivityIds.length > 0 ? {
          connect: linkedActivityIds.map(id => ({ id }))
        } : undefined
      },
      include: {
        authors: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                department: true
              }
            }
          },
          orderBy: {
            authorOrder: 'asc'
          }
        },
        linkedProjects: {
          select: {
            id: true,
            title: true,
            code: true
          }
        },
        linkedActivities: {
          select: {
            id: true,
            title: true,
            code: true
          }
        },
        document: true
      }
    });

    return publication;
  }

  // Récupérer les publications avec filtres et pagination
  async getPublications(query: PublicationQuery, userId: string, userRole: UserRole) {
    const { page, limit, type, year, authorId, status, isInternational, quartile, search } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Filtres
    if (type) where.type = type;
    if (status) where.status = status;
    if (isInternational !== undefined) where.isInternational = isInternational;
    if (quartile) where.quartile = quartile;

    // Filtre par année de publication
    if (year) {
      where.publicationDate = {
        gte: new Date(`${year}-01-01`),
        lte: new Date(`${year}-12-31`)
      };
    }

    // Filtre par auteur
    if (authorId) {
      where.authors = {
        some: {
          userId: authorId
        }
      };
    }

    // Recherche textuelle
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { abstract: { contains: search, mode: 'insensitive' } },
        { keywords: { has: search } },
        { journal: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [publications, total] = await Promise.all([
      prisma.publication.findMany({
        where,
        skip,
        take: limit,
        include: {
          authors: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  department: true
                }
              }
            },
            orderBy: {
              authorOrder: 'asc'
            }
          },
          linkedProjects: {
            select: {
              id: true,
              title: true,
              code: true
            }
          },
          linkedActivities: {
            select: {
              id: true,
              title: true,
              code: true
            }
          },
          document: {
            select: {
              id: true,
              filename: true,
              filepath: true,
              mimeType: true,
              size: true
            }
          }
        },
        orderBy: {
          publicationDate: 'desc'
        }
      }),
      prisma.publication.count({ where })
    ]);

    return {
      publications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // Récupérer une publication par ID
  async getPublicationById(id: string) {
    const publication = await prisma.publication.findUnique({
      where: { id },
      include: {
        authors: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                department: true,
                discipline: true
              }
            }
          },
          orderBy: {
            authorOrder: 'asc'
          }
        },
        linkedProjects: {
          select: {
            id: true,
            title: true,
            code: true,
            status: true
          }
        },
        linkedActivities: {
          select: {
            id: true,
            title: true,
            code: true,
            type: true
          }
        },
        document: true
      }
    });

    if (!publication) {
      throw new Error("Publication non trouvée");
    }

    return publication;
  }

  // Mettre à jour une publication
  async updatePublication(id: string, data: UpdatePublicationInput, userId: string) {
    // Vérifier que l'utilisateur est auteur de la publication
    const publication = await prisma.publication.findUnique({
      where: { id },
      include: {
        authors: true
      }
    });

    if (!publication) {
      throw new Error("Publication non trouvée");
    }

    const isAuthor = publication.authors.some(author => author.userId === userId);
    if (!isAuthor) {
      throw new Error("Vous n'êtes pas autorisé à modifier cette publication");
    }

    const { authors, linkedProjectIds, linkedActivityIds, ...publicationData } = data;

    // Préparer les données de mise à jour
    const updateData: any = {
      ...publicationData,
      submissionDate: publicationData.submissionDate ? new Date(publicationData.submissionDate) : undefined,
      acceptanceDate: publicationData.acceptanceDate ? new Date(publicationData.acceptanceDate) : undefined,
      publicationDate: publicationData.publicationDate ? new Date(publicationData.publicationDate) : undefined
    };

    // Mettre à jour les auteurs si fournis
    if (authors) {
      // Supprimer les anciens auteurs
      await prisma.publicationAuthor.deleteMany({
        where: { publicationId: id }
      });
      
      // Créer les nouveaux auteurs
      updateData.authors = {
        create: authors.map(author => ({
          userId: author.userId,
          authorOrder: author.authorOrder,
          isCorresponding: author.isCorresponding,
          affiliation: author.affiliation
        }))
      };
    }

    // Mettre à jour les projets liés
    if (linkedProjectIds !== undefined) {
      updateData.linkedProjects = {
        set: linkedProjectIds.map(id => ({ id }))
      };
    }

    // Mettre à jour les activités liées
    if (linkedActivityIds !== undefined) {
      updateData.linkedActivities = {
        set: linkedActivityIds.map(id => ({ id }))
      };
    }

    const updatedPublication = await prisma.publication.update({
      where: { id },
      data: updateData,
      include: {
        authors: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                department: true
              }
            }
          },
          orderBy: {
            authorOrder: 'asc'
          }
        },
        linkedProjects: {
          select: {
            id: true,
            title: true,
            code: true
          }
        },
        linkedActivities: {
          select: {
            id: true,
            title: true,
            code: true
          }
        },
        document: true
      }
    });

    return updatedPublication;
  }

  // Supprimer une publication
  async deletePublication(id: string, userId: string, userRole: UserRole) {
    const publication = await prisma.publication.findUnique({
      where: { id },
      include: {
        authors: true
      }
    });

    if (!publication) {
      throw new Error("Publication non trouvée");
    }

    // Seuls les auteurs ou les administrateurs peuvent supprimer
    const isAuthor = publication.authors.some(author => author.userId === userId);
    const isAdmin = userRole === UserRole.ADMINISTRATEUR;

    if (!isAuthor && !isAdmin) {
      throw new Error("Vous n'êtes pas autorisé à supprimer cette publication");
    }

    // Supprimer le document associé si existant
    if (publication.documentId) {
      await prisma.document.delete({
        where: { id: publication.documentId }
      });
    }

    await prisma.publication.delete({
      where: { id }
    });

    return { message: "Publication supprimée avec succès" };
  }

  // Récupérer les publications d'un chercheur
  async getResearcherPublications(researcherId: string, year?: number) {
    const where: any = {
      authors: {
        some: {
          userId: researcherId
        }
      }
    };

    if (year) {
      where.publicationDate = {
        gte: new Date(`${year}-01-01`),
        lte: new Date(`${year}-12-31`)
      };
    }

    const publications = await prisma.publication.findMany({
      where,
      include: {
        authors: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: {
            authorOrder: 'asc'
          }
        },
        document: {
          select: {
            id: true,
            filename: true,
            mimeType: true
          }
        }
      },
      orderBy: {
        publicationDate: 'desc'
      }
    });

    return publications;
  }

  // Statistiques des publications
  async getPublicationStats(userId?: string) {
    const where = userId ? {
      authors: {
        some: {
          userId
        }
      }
    } : {};

    const [
      total,
      byType,
      byYear,
      byQuartile,
      international
    ] = await Promise.all([
      prisma.publication.count({ where }),
      prisma.publication.groupBy({
        by: ['type'],
        where,
        _count: true
      }),
      prisma.publication.groupBy({
        by: ['publicationDate'],
        where,
        _count: true
      }),
      prisma.publication.groupBy({
        by: ['quartile'],
        where: { ...where, quartile: { not: null } },
        _count: true
      }),
      prisma.publication.count({
        where: { ...where, isInternational: true }
      })
    ]);

    return {
      total,
      byType,
      byYear: this.groupByYear(byYear),
      byQuartile,
      international,
      nationalRate: total > 0 ? ((total - international) / total * 100).toFixed(2) : 0,
      internationalRate: total > 0 ? (international / total * 100).toFixed(2) : 0
    };
  }

  private groupByYear(data: any[]) {
    const grouped: { [key: string]: number } = {};
    data.forEach(item => {
      if (item.publicationDate) {
        const year = new Date(item.publicationDate).getFullYear();
        grouped[year] = (grouped[year] || 0) + item._count;
      }
    });
    return grouped;
  }
    // Attacher un document PDF à une publication
  async attachDocument(
    publicationId: string,
    file: Express.Multer.File,
    userId: string
  ) {
    // Vérifier que la publication existe et que l'utilisateur est auteur
    const publication = await prisma.publication.findUnique({
      where: { id: publicationId },
      include: { authors: true }
    });

    if (!publication) {
      throw new Error("Publication non trouvée");
    }

    const isAuthor = publication.authors.some(author => author.userId === userId);
    if (!isAuthor) {
      throw new Error("Vous n'êtes pas autorisé à modifier cette publication");
    }

    // Supprimer l'ancien document s'il existe
    if (publication.documentId) {
      const oldDoc = await prisma.document.findUnique({
        where: { id: publication.documentId }
      });
      
      if (oldDoc) {
        // Supprimer le fichier physique
        if (fs.existsSync(oldDoc.filepath)) {
          fs.unlinkSync(oldDoc.filepath);
        }
        // Supprimer l'enregistrement
        await prisma.document.delete({
          where: { id: oldDoc.id }
        });
      }
    }

    // Créer le nouveau document
    const document = await prisma.document.create({
      data: {
        title: file.originalname,
        filename: file.filename,
        filepath: file.path,
        mimeType: file.mimetype,
        size: BigInt(file.size),
        type: 'PUBLICATION_SCIENTIFIQUE',
        ownerId: userId,
        isPublic: true // Les publications sont publiques
      }
    });

    // Lier le document à la publication
    const updatedPublication = await prisma.publication.update({
      where: { id: publicationId },
      data: { documentId: document.id },
      include: {
        authors: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        document: true
      }
    });

    return updatedPublication;
  }

  // Télécharger le document d'une publication
  async downloadDocument(publicationId: string) {
    const publication = await prisma.publication.findUnique({
      where: { id: publicationId },
      include: { document: true }
    });

    if (!publication) {
      throw new Error("Publication non trouvée");
    }

    if (!publication.document) {
      throw new Error("Aucun document associé à cette publication");
    }

    if (!fs.existsSync(publication.document.filepath)) {
      throw new Error("Fichier introuvable sur le serveur");
    }

    return publication.document;
  }
}

export const publicationService = new PublicationService();