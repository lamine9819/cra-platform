// src/services/form.service.ts - Version complète et fonctionnelle
import { PrismaClient } from '@prisma/client';
import { ValidationError, AuthError, NotFoundError } from '../utils/errors';
import { 
  CreateFormRequest, 
  UpdateFormRequest, 
  SubmitFormResponseRequest, 
  FormResponse, 
  FormSchema,
  FormResponseData,
  PhotoData,
  CollectorInfo,
  FormShare,
  PublicShareInfo,
  SyncResult,
  SyncSummary
} from '../types/form.types';
import { FormValidationService } from './formValidation.service';
import { FileStorageService } from './fileStorage.service';
import { generateShareToken } from '../utils/shareUtils';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// Type pour les formulaires avec relations incluses
type FormWithRelations = {
  id: string;
  title: string;
  description?: string | null;
  schema: any;
  isActive: boolean;
  isPublic: boolean;
  shareToken?: string | null;
  allowMultipleSubmissions: boolean;
  createdAt: Date;
  updatedAt: Date;
  creatorId: string;
  activityId?: string | null;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  activity?: {
    id: string;
    title: string;
    project: {
      id: string;
      title: string;
      creatorId: string;
      participants?: Array<{
        id: string;
        userId: string;
        role: string;
        isActive: boolean;
      }>;
    };
  } | null;
  shares?: Array<{
    id: string;
    shareType: string;
    shareToken?: string;
    canCollect: boolean;
    canExport: boolean;
    maxSubmissions?: number;
    expiresAt?: Date;
    sharedWith?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    } | null;
  }>;
  responses?: Array<{
    id: string;
    data: any;
    submittedAt: Date;
    collectorType: string;
    respondent?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
    } | null;
  }>;
  _count?: {
    responses: number;
    comments: number;
    shares: number;
  };
};

export class FormService {

  // =============================================
  // CRÉATION ET GESTION DES FORMULAIRES
  // =============================================

  async createForm(formData: CreateFormRequest, creatorId: string, creatorRole: string): Promise<FormResponse> {
    const allowedRoles = ['CHERCHEUR', 'ASSISTANT_CHERCHEUR', 'TECHNICIEN_SUPERIEUR', 'ADMINISTRATEUR'];
    if (!allowedRoles.includes(creatorRole)) {
      throw new AuthError('Permissions insuffisantes pour créer un formulaire');
    }

    // Vérifier l'accès à l'activité si fournie
    if (formData.activityId) {
      const activity = await prisma.activity.findUnique({
        where: { id: formData.activityId },
        include: {
          project: {
            include: {
              participants: {
                where: { userId: creatorId }
              }
            }
          }
        }
      });

      if (!activity) {
        throw new ValidationError('Activité non trouvée');
      }

      const hasAccess = this.checkProjectAccess(activity.project, creatorId, creatorRole);
      if (!hasAccess) {
        throw new AuthError('Accès refusé à cette activité');
      }
    }

    // Valider le schéma du formulaire
    const schemaValidation = FormValidationService.validateFormSchema(formData.schema);
    if (!schemaValidation.isValid) {
      throw new ValidationError(`Schéma invalide: ${schemaValidation.errors.join(', ')}`);
    }

    // S'assurer que allowMultipleSubmissions est activé par défaut selon votre logique
    const formSchema = formData.schema as FormSchema;
    if (!formSchema.settings) {
      formSchema.settings = {};
    }
    formSchema.settings.allowMultipleSubmissions = true;

    // Créer le formulaire
    const form = await prisma.form.create({
      data: {
        title: formData.title,
        description: formData.description,
        schema: formSchema as any,
        isActive: formData.isActive ?? true,
        isPublic: formData.enablePublicAccess ?? false,
        allowMultipleSubmissions: true,
        creatorId,
        activityId: formData.activityId,
      },
      include: this.getFormIncludes(false)
    });

    return this.formatFormResponse(form as FormWithRelations);
  }

  // =============================================
  // PARTAGE DE FORMULAIRES
  // =============================================

  async shareFormWithUser(
    formId: string, 
    targetUserId: string, 
    permissions: { canCollect: boolean; canExport: boolean }, 
    userId: string, 
    userRole: string,
    maxSubmissions?: number,
    expiresAt?: Date
  ): Promise<FormShare> {
    const form = await this.getFormById(formId, userId, userRole);
    
    // Seul le créateur peut partager
    if (form.creator.id !== userId && userRole !== 'ADMINISTRATEUR') {
      throw new AuthError('Seul le créateur peut partager ce formulaire');
    }

    // Vérifier que l'utilisateur cible existe
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId }
    });

    if (!targetUser) {
      throw new NotFoundError('Utilisateur non trouvé');
    }

    // Créer le partage
    const share = await prisma.formShare.create({
      data: {
        shareType: 'INTERNAL',
        canCollect: permissions.canCollect,
        canExport: permissions.canExport,
        maxSubmissions,
        expiresAt,
        formId,
        sharedWithId: targetUserId,
        createdById: userId
      },
      include: {
        sharedWith: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    return {
      id: share.id,
      shareType: share.shareType as 'INTERNAL' | 'EXTERNAL',
      shareToken: share.shareToken || undefined,
      canCollect: share.canCollect,
      canExport: share.canExport,
      maxSubmissions: share.maxSubmissions || undefined,
      expiresAt: share.expiresAt || undefined,
      createdAt: share.createdAt,
      lastAccessed: share.lastAccessed || undefined,
      sharedWith: share.sharedWith,
      createdBy: share.createdBy
    };
  }

  async createPublicShareLink(
    formId: string, 
    userId: string, 
    userRole: string,
    options: {
      maxSubmissions?: number;
      expiresAt?: Date;
    } = {}
  ): Promise<PublicShareInfo> {
    const form = await this.getFormById(formId, userId, userRole);
    
    // Seul le créateur peut créer un lien public
    if (form.creator.id !== userId && userRole !== 'ADMINISTRATEUR') {
      throw new AuthError('Seul le créateur peut créer un lien public');
    }

    const shareToken = generateShareToken();

    await prisma.formShare.create({
      data: {
        shareType: 'EXTERNAL',
        shareToken,
        canCollect: true,
        canExport: false,
        maxSubmissions: options.maxSubmissions,
        expiresAt: options.expiresAt,
        formId,
        createdById: userId
      }
    });

    // Mettre à jour le formulaire pour marquer comme public
    await prisma.form.update({
      where: { id: formId },
      data: {
        isPublic: true,
        shareToken: shareToken
      }
    });

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    return {
      shareToken,
      shareUrl: `${baseUrl}/forms/public/${shareToken}`,
      expiresAt: options.expiresAt,
      maxSubmissions: options.maxSubmissions
    };
  }

  async getFormByPublicToken(shareToken: string) {
    const share = await prisma.formShare.findUnique({
      where: { shareToken },
      include: {
        form: {
          include: {
            creator: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    if (!share) {
      throw new NotFoundError('Lien de partage invalide ou expiré');
    }

    // Vérifier l'expiration
    if (share.expiresAt && new Date() > share.expiresAt) {
      throw new ValidationError('Ce lien de partage a expiré');
    }

    // Vérifier la limite de soumissions si définie
    if (share.maxSubmissions) {
      const submissionCount = await prisma.formResponse.count({
        where: {
          formId: share.formId,
          collectorType: 'PUBLIC'
        }
      });

      if (submissionCount >= share.maxSubmissions) {
        throw new ValidationError('Limite de soumissions atteinte pour ce formulaire');
      }
    }

    // Mettre à jour le dernier accès
    await prisma.formShare.update({
      where: { id: share.id },
      data: { lastAccessed: new Date() }
    });

    return {
      form: share.form,
      canCollect: share.canCollect,
      remainingSubmissions: share.maxSubmissions 
        ? Math.max(0, share.maxSubmissions - await this.getSubmissionCount(share.formId, 'PUBLIC'))
        : null
    };
  }

  // =============================================
  // COLLECTE DE DONNÉES MULTIPLE
  // =============================================

  async submitFormResponse(
    formId: string,
    responseData: SubmitFormResponseRequest,
    respondentId: string | null,
    respondentRole: string | null,
    collectorInfo?: CollectorInfo
  ): Promise<FormResponseData> {
    let form;
    const collectorType = collectorInfo?.type || 'USER';

    // Obtenir le formulaire selon le type de collecte
    if (collectorType === 'PUBLIC') {
      form = await prisma.form.findUnique({
        where: { id: formId },
        include: {
          creator: {
            select: { id: true, firstName: true, lastName: true, email: true, role: true }
          }
        }
      });
    } else {
      form = await this.getFormById(formId, respondentId!, respondentRole!);
    }

    if (!form) {
      throw new NotFoundError('Formulaire non trouvé');
    }

    if (!form.isActive) {
      throw new ValidationError('Ce formulaire n\'est plus actif');
    }

    // Valider les données de réponse
    const formSchema = form.schema as unknown as FormSchema;
    const validation = FormValidationService.validateFormResponse(formSchema, responseData.data);
    if (!validation.isValid) {
      throw new ValidationError(`Données invalides: ${validation.errors.join(', ')}`);
    }

    // Traitement des photos s'il y en a
    const photos = await this.processResponsePhotos(responseData.photos || []);

    // Créer la réponse
    const response = await prisma.formResponse.create({
      data: {
        formId: formId,
        respondentId: respondentId,
        data: validation.sanitizedData as any,
        collectorType: collectorType,
        collectorInfo: collectorInfo ? {
          name: collectorInfo.name,
          email: collectorInfo.email,
          type: collectorInfo.type
        } as any : null,
        isOffline: responseData.isOffline || false
      },
      include: {
        respondent: respondentId ? {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          }
        } : undefined,
        form: {
          select: {
            id: true,
            title: true,
          }
        }
      }
    });

    // Créer les enregistrements de photos si nécessaire
    if (photos.length > 0) {
      await this.createResponsePhotos(response.id, photos);
    }

    return {
      id: response.id,
      data: response.data as Record<string, any>,
      submittedAt: response.submittedAt,
      collectorType: response.collectorType as 'USER' | 'SHARED_USER' | 'PUBLIC',
      collectorInfo: response.collectorInfo as unknown as CollectorInfo,
      respondent: response.respondent,
      form: response.form,
      photosCount: photos.length
    };
  }

  // =============================================
  // GESTION DES PHOTOS
  // =============================================

  private async processResponsePhotos(photos: PhotoData[]): Promise<Array<{
    fieldId: string;
    filename: string;
    originalName?: string;
    filepath: string;
    mimeType: string;
    size: number;
    width?: number;
    height?: number;
    caption?: string;
    latitude?: number;
    longitude?: number;
  }>> {
    const processedPhotos: any[] = [];

    for (const photoData of photos) {
      try {
        const savedPhoto = await FileStorageService.savePhoto(photoData.base64, {
          filename: photoData.filename,
          quality: 80
        });

        processedPhotos.push({
          fieldId: 'photo_field', // À adapter selon votre logique
          filename: savedPhoto.filename,
          originalName: photoData.filename,
          filepath: savedPhoto.filepath,
          mimeType: photoData.mimeType || 'image/jpeg',
          size: savedPhoto.size,
          width: savedPhoto.width,
          height: savedPhoto.height,
          caption: photoData.caption,
          latitude: photoData.latitude,
          longitude: photoData.longitude,
        });
      } catch (error) {
        console.error('Erreur traitement photo:', error);
      }
    }

    return processedPhotos;
  }

  private async createResponsePhotos(responseId: string, photos: any[]) {
    if (photos.length === 0) return;

    await prisma.responsePhoto.createMany({
      data: photos.map(photo => ({
        responseId,
        ...photo,
        size: BigInt(photo.size)
      }))
    });
  }

  // =============================================
  // SYNCHRONISATION OFFLINE
  // =============================================

  async storeOfflineData(formId: string, deviceId: string, data: any) {
    await prisma.offlineSync.create({
      data: {
        formId,
        deviceId,
        data: data as any,
        status: 'PENDING'
      }
    });
  }

  async syncOfflineData(deviceId: string): Promise<SyncSummary> {
    const pendingSync = await prisma.offlineSync.findMany({
      where: {
        deviceId,
        status: 'PENDING'
      }
    });

    const results: SyncResult[] = [];

    for (const sync of pendingSync) {
      try {
        const result = await this.submitFormResponse(
          sync.formId,
          { data: sync.data as any },
          null,
          null,
          { type: 'PUBLIC', name: 'Collecte Offline' }
        );

        await prisma.offlineSync.update({
          where: { id: sync.id },
          data: {
            status: 'SYNCED',
            syncedAt: new Date()
          }
        });

        results.push({ syncId: sync.id, success: true, responseId: result.id });

      } catch (error) {
        await prisma.offlineSync.update({
          where: { id: sync.id },
          data: {
            attempts: { increment: 1 },
            error: error instanceof Error ? error.message : 'Erreur inconnue'
          }
        });

        results.push({ 
          syncId: sync.id, 
          success: false, 
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
    }

    return {
      totalProcessed: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    };
  }

  // =============================================
  // GESTION PRINCIPALE DES FORMULAIRES
  // =============================================

  async listForms(userId: string, userRole: string, query: any) {
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Construire les filtres selon votre logique : créateur + formulaires des activités auxquelles je participe
    const where: any = {
      OR: [
        { creatorId: userId }, // Mes formulaires
        {
          activity: {
            project: {
              participants: {
                some: {
                  userId: userId,
                  isActive: true
                }
              }
            }
          }
        }, // Formulaires des projets où je participe
        {
          shares: {
            some: {
              sharedWithId: userId,
              OR: [
                { expiresAt: null },
                { expiresAt: { gt: new Date() } }
              ]
            }
          }
        } // Formulaires partagés avec moi
      ]
    };

    if (query.search) {
      where.AND = [
        where,
        {
          OR: [
            { title: { contains: query.search, mode: 'insensitive' } },
            { description: { contains: query.search, mode: 'insensitive' } }
          ]
        }
      ];
    }

    const [forms, total] = await Promise.all([
      prisma.form.findMany({
        where,
        skip,
        take: limit,
        include: this.getFormIncludes(false),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.form.count({ where })
    ]);

    return {
      forms: forms.map((form) => this.formatFormResponse(form as FormWithRelations)),
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

  async getFormById(formId: string, userId: string, userRole: string, includeComments: boolean = false): Promise<FormResponse> {
    const hasAccess = await this.checkFormAccess(formId, userId, userRole);
    if (!hasAccess) {
      throw new AuthError('Accès refusé à ce formulaire');
    }

    const form = await prisma.form.findUnique({
      where: { id: formId },
      include: this.getFormIncludes(includeComments)
    });

    if (!form) {
      throw new NotFoundError('Formulaire non trouvé');
    }

    return this.formatFormResponse(form as FormWithRelations);
  }

  async updateForm(formId: string, updateData: UpdateFormRequest, userId: string, userRole: string): Promise<FormResponse> {
    const form = await prisma.form.findUnique({
      where: { id: formId },
      include: {
        activity: {
          include: {
            project: true
          }
        }
      }
    });

    if (!form) {
      throw new ValidationError('Formulaire non trouvé');
    }

    const canEdit = this.checkFormEditPermissions(form, userId, userRole);
    if (!canEdit) {
      throw new AuthError('Permissions insuffisantes pour modifier ce formulaire');
    }

    if (updateData.schema) {
      const schemaValidation = FormValidationService.validateFormSchema(updateData.schema);
      if (!schemaValidation.isValid) {
        throw new ValidationError(`Schéma invalide: ${schemaValidation.errors.join(', ')}`);
      }
    }

    const updatedForm = await prisma.form.update({
      where: { id: formId },
      data: {
        title: updateData.title,
        description: updateData.description,
        schema: updateData.schema as any,
        isActive: updateData.isActive,
        isPublic: updateData.enablePublicAccess,
      },
      include: this.getFormIncludes(false)
    });

    return this.formatFormResponse(updatedForm as FormWithRelations);
  }

  async deleteForm(formId: string, userId: string, userRole: string): Promise<void> {
    const form = await prisma.form.findUnique({
      where: { id: formId },
      include: {
        _count: {
          select: { 
            responses: true,
            comments: true
          }
        },
        activity: {
          include: {
            project: true
          }
        }
      }
    });

    if (!form) {
      throw new ValidationError('Formulaire non trouvé');
    }

    const canDelete = this.checkFormDeletePermissions(form, userId, userRole);
    if (!canDelete) {
      throw new AuthError('Permissions insuffisantes pour supprimer ce formulaire');
    }

    const isCreator = form.creatorId === userId;
    const isAdmin = userRole === 'ADMINISTRATEUR';
    
    if (isAdmin || isCreator) {
      await this.deleteFormWithDependencies(formId);
      return;
    }

    if (form._count.responses > 0) {
      throw new ValidationError('Impossible de supprimer un formulaire ayant des réponses');
    }

    if (form._count.comments > 0) {
      throw new ValidationError('Impossible de supprimer un formulaire ayant des commentaires');
    }

    await prisma.form.delete({
      where: { id: formId }
    });
  }

  private async deleteFormWithDependencies(formId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // Supprimer les photos des réponses
      await tx.responsePhoto.deleteMany({
        where: { response: { formId } }
      });

      // Supprimer les réponses
      await tx.formResponse.deleteMany({
        where: { formId }
      });

      // Supprimer les commentaires liés
      await tx.comment.deleteMany({
        where: { formId }
      });

      // Supprimer les partages
      await tx.formShare.deleteMany({
        where: { formId }
      });

      // Supprimer le formulaire
      await tx.form.delete({
        where: { id: formId }
      });
    });
  }

  // =============================================
  // MÉTHODES UTILITAIRES PRIVÉES
  // =============================================

  private checkProjectAccess(project: any, userId: string, userRole: string): boolean {
    if (userRole === 'ADMINISTRATEUR') return true;
    if (project.creatorId === userId) return true;
    if (project.participants?.some((p: { userId: string; isActive: boolean }) => p.userId === userId && p.isActive)) return true;
    return false;
  }

  private async checkFormAccess(formId: string, userId: string, userRole: string): Promise<boolean> {
    const form = await prisma.form.findUnique({
      where: { id: formId },
      include: {
        activity: {
          include: {
            project: {
              include: {
                participants: {
                  where: { userId: userId }
                }
              }
            }
          }
        },
        shares: {
          where: {
            sharedWithId: userId,
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } }
            ]
          }
        }
      }
    });

    if (!form) return false;

    if (userRole === 'ADMINISTRATEUR') return true;
    if (form.creatorId === userId) return true;
    
    if (form.activity?.project) {
      const hasProjectAccess = this.checkProjectAccess(form.activity.project, userId, userRole);
      if (hasProjectAccess) return true;
    }
    
    if (form.shares.length > 0) return true;
    
    return false;
  }

  private checkFormEditPermissions(form: any, userId: string, userRole: string): boolean {
    if (userRole === 'ADMINISTRATEUR') return true;
    if (form.creatorId === userId) return true;
    if (form.activity?.project?.creatorId === userId && userRole === 'CHERCHEUR') return true;
    return false;
  }

  private checkFormDeletePermissions(form: any, userId: string, userRole: string): boolean {
    if (userRole === 'ADMINISTRATEUR') return true;
    if (form.creatorId === userId) return true;
    if (form.activity?.project?.creatorId === userId && userRole === 'CHERCHEUR') return true;
    return false;
  }

  private async getSubmissionCount(formId: string, collectorType: string): Promise<number> {
    return await prisma.formResponse.count({
      where: {
        formId,
        collectorType: collectorType as any // Cast to the expected Prisma enum type
      }
    });
  }

  private getFormIncludes(includeComments: boolean = false) {
    const baseIncludes = {
      creator: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        }
      },
      activity: {
        include: {
          project: {
            select: {
              id: true,
              title: true,
              description: true,
              creatorId: true,
            }
          }
        }
      },
      shares: {
        include: {
          sharedWith: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      },
      _count: {
        select: {
          responses: true,
          comments: true,
          shares: true
        }
      }
    };

    if (includeComments) {
      return {
        ...baseIncludes,
        comments: {
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
              }
            }
          },
          orderBy: { createdAt: 'desc' as const },
          take: 5
        }
      };
    }

    return baseIncludes;
  }

  private formatFormResponse(form: FormWithRelations): FormResponse {
    return {
      id: form.id,
      title: form.title,
      description: form.description || undefined,
      schema: form.schema as FormSchema,
      isActive: form.isActive,
      isPublic: form.isPublic || false,
      shareToken: form.shareToken || undefined,
      allowMultipleSubmissions: form.allowMultipleSubmissions,
      createdAt: form.createdAt,
      updatedAt: form.updatedAt,
      creator: form.creator,
      activity: form.activity ? {
        id: form.activity.id,
        title: form.activity.title,
        project: {
          id: form.activity.project.id,
          title: form.activity.project.title,
        }
      } : undefined,
      shares: form.shares?.map(share => ({
        id: share.id,
        shareType: share.shareType as 'INTERNAL' | 'EXTERNAL',
        shareToken: share.shareToken,
        canCollect: share.canCollect,
        canExport: share.canExport,
        maxSubmissions: share.maxSubmissions || undefined,
        expiresAt: share.expiresAt || undefined,
        createdAt: new Date(),
        lastAccessed: undefined,
        sharedWith: share.sharedWith || null,
        createdBy: {
          id: form.creator.id,
          firstName: form.creator.firstName,
          lastName: form.creator.lastName
        }
      })),
      _count: form._count,
    };
  }
}