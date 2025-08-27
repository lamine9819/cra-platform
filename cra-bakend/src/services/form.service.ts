// src/services/form.service.ts - Version modifiée avec permissions pour tous les utilisateurs
import { PrismaClient } from '@prisma/client';
import { ValidationError, AuthError } from '../utils/errors';
import { CreateFormRequest, UpdateFormRequest, SubmitFormResponseRequest, FormResponseQuery, FormResponse, FormResponseData, FormSchema } from '../types/form.types';
import { FormValidationService } from './formValidation.service';

const prisma = new PrismaClient();

// Type pour les formulaires avec relations incluses - Version corrigée
type FormWithRelations = {
  id: string;
  title: string;
  description?: string | null;
  schema: any;
  isActive: boolean;
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
    description?: string | null;
    objectives?: string[];
    methodology?: string | null;
    location?: string | null;
    startDate?: Date | null;
    endDate?: Date | null;
    results?: string | null;
    conclusions?: string | null;
    createdAt: Date;
    updatedAt: Date;
    projectId: string;
    project: {
      id: string;
      title: string;
      description?: string | null;
      objectives?: string[];
      status?: string;
      startDate?: Date | null;
      endDate?: Date | null;
      budget?: number | null;
      keywords?: string[];
      createdAt: Date;
      updatedAt: Date;
      creatorId: string;
      participants?: {
        id: string;
        userId: string;
        role: string;
        isActive: boolean;
        projectId: string;
        joinedAt: Date;
        leftAt?: Date | null;
      }[];
    };
  } | null;
  responses?: {
    id: string;
    data: any;
    submittedAt: Date;
    respondent: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
    };
  }[];
  _count?: {
    responses: number;
    comments: number;
  };
  comments?: {
    id: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    authorId: string;
    projectId: string | null;
    activityId: string | null;
    taskId: string | null;
    formId: string | null;
    author: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
    };
  }[];
};

export class FormService {

  // Créer un formulaire - MODIFIÉ: Tous les utilisateurs peuvent créer
  async createForm(formData: CreateFormRequest, creatorId: string, creatorRole: string): Promise<FormResponse> {
    // MODIFICATION: Permettre à tous les utilisateurs de créer des formulaires
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

    // Créer le formulaire
    const form = await prisma.form.create({
      data: {
        title: formData.title,
        description: formData.description,
        schema: formData.schema as any,
        isActive: formData.isActive ?? true,
        creatorId,
        activityId: formData.activityId,
      },
      include: this.getFormIncludes(false)
    });

    return this.formatFormResponse(form as FormWithRelations);
  }

  // Lister les formulaires accessibles - MODIFIÉ: Amélioration des filtres
  async listForms(userId: string, userRole: string, query: any) {
    // CORRECTION: Parser correctement les paramètres numériques
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Construire les filtres
    const where: any = {};

    if (query.activityId) where.activityId = query.activityId;
    if (query.creatorId) where.creatorId = query.creatorId;
    if (query.isActive !== undefined) {
      // Convertir la chaîne en booléen si nécessaire
      if (typeof query.isActive === 'string') {
        where.isActive = query.isActive === 'true';
      } else {
        where.isActive = query.isActive;
      }
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // MODIFICATION: Filtrer selon les droits d'accès (plus permissif pour les assistants et chercheurs)
    if (userRole === 'ADMINISTRATEUR') {
      // Les admins voient tout
    } else if (userRole === 'CHERCHEUR') {
      // Les chercheurs voient leurs formulaires + ceux des projets qu'ils dirigent ou participent
      where.OR = [
        { creatorId: userId }, // Mes formulaires
        {
          activity: {
            project: {
              OR: [
                { creatorId: userId }, // Projets que je dirige
                {
                  participants: {
                    some: {
                      userId: userId,
                      isActive: true
                    }
                  }
                } // Projets où je participe
              ]
            }
          }
        },
        { 
          AND: [
            { isActive: true }, // Formulaires actifs publics
            { activityId: null } // Non liés à une activité spécifique
          ]
        }
      ];
    } else {
      // Assistants, techniciens : mes formulaires + ceux des projets où je participe + formulaires publics
      where.OR = [
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
          AND: [
            { isActive: true }, // Formulaires actifs publics
            { activityId: null } // Non liés à une activité spécifique
          ]
        }
      ];
    }

    // Exécuter la requête
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

  // Obtenir un formulaire par ID - MODIFIÉ: Amélioration des permissions
  async getFormById(formId: string, userId: string, userRole: string, includeComments: boolean = false): Promise<FormResponse> {
    const form = await prisma.form.findUnique({
      where: { id: formId },
      include: {
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
              include: {
                participants: {
                  where: { userId: userId }
                }
              }
            }
          }
        },
        responses: {
          include: {
            respondent: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
              }
            }
          },
          orderBy: { submittedAt: 'desc' },
          take: 10
        },
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
          orderBy: { createdAt: 'desc' },
          take: includeComments ? 5 : undefined
        },
        _count: {
          select: {
            responses: true,
            comments: true
          }
        }
      }
    });

    if (!form) {
      throw new ValidationError('Formulaire non trouvé');
    }

    // MODIFICATION: Vérifier les droits d'accès (plus permissif)
    const hasAccess = this.checkFormAccess(form as FormWithRelations, userId, userRole);
    if (!hasAccess) {
      throw new AuthError('Accès refusé à ce formulaire');
    }

    return this.formatFormResponse(form as FormWithRelations);
  }

  // Mettre à jour un formulaire - MODIFIÉ: Permissions ajustées
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

    // MODIFICATION: Amélioration des droits de modification
    const canEdit = this.checkFormEditPermissions(form, userId, userRole);
    if (!canEdit) {
      throw new AuthError('Permissions insuffisantes pour modifier ce formulaire');
    }

    // Valider le schéma si fourni
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
      },
      include: this.getFormIncludes(false)
    });

    return this.formatFormResponse(updatedForm as FormWithRelations);
  }

// Modification de la méthode submitFormResponse dans votre FormService
// Remplacez cette partie dans votre méthode submitFormResponse :

async submitFormResponse(
  formId: string,
  responseData: SubmitFormResponseRequest,
  respondentId: string,
  respondentRole: string
): Promise<FormResponseData> {
  // MODIFICATION: Tous les utilisateurs authentifiés peuvent soumettre des réponses
  const allowedRoles = ['CHERCHEUR', 'ASSISTANT_CHERCHEUR', 'TECHNICIEN_SUPERIEUR', 'ADMINISTRATEUR'];
  if (!allowedRoles.includes(respondentRole)) {
    throw new AuthError('Permissions insuffisantes pour soumettre une réponse');
  }

  const form = await prisma.form.findUnique({
    where: { id: formId },
    include: {
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
            include: {
              participants: {
                where: { userId: respondentId }
              }
            }
          }
        }
      }
    }
  });

  if (!form) {
    throw new ValidationError('Formulaire non trouvé');
  }

  if (!form.isActive) {
    throw new ValidationError('Ce formulaire n\'est plus actif');
  }

  // Vérifier l'accès au formulaire
  const hasAccess = this.checkFormAccess(form as FormWithRelations, respondentId, respondentRole);
  if (!hasAccess) {
    throw new AuthError('Accès refusé à ce formulaire');
  }

  // MODIFICATION PRINCIPALE: Vérifier si des réponses multiples sont autorisées
  const formSchema = form.schema as unknown as FormSchema;
  const isCreator = form.creatorId === respondentId;
  
  // Le créateur peut toujours soumettre plusieurs fois, sinon respecter les paramètres du formulaire
  if (!isCreator && !formSchema.settings?.allowMultipleSubmissions) {
    const existingResponse = await prisma.formResponse.findFirst({
      where: {
        formId: formId,
        respondentId: respondentId
      }
    });

    if (existingResponse) {
      throw new ValidationError('Vous avez déjà soumis une réponse à ce formulaire');
    }
  }

  // Valider les données de réponse
  const validation = FormValidationService.validateFormResponse(formSchema, responseData.data);
  if (!validation.isValid) {
    throw new ValidationError(`Données invalides: ${validation.errors.join(', ')}`);
  }

  // Créer la réponse
  const response = await prisma.formResponse.create({
    data: {
      formId: formId,
      respondentId: respondentId,
      data: validation.sanitizedData as any,
    },
    include: {
      respondent: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        }
      },
      form: {
        select: {
          id: true,
          title: true,
        }
      }
    }
  });

  return {
    id: response.id,
    data: response.data as Record<string, any>,
    submittedAt: response.submittedAt,
    respondent: response.respondent,
    form: response.form,
  };
}

  // Lister les réponses d'un formulaire
  async getFormResponses(formId: string, userId: string, userRole: string, query: FormResponseQuery) {
    // Vérifier l'accès au formulaire
    const form = await this.getFormById(formId, userId, userRole);
    if (!form) {
      throw new ValidationError('Formulaire non trouvé');
    }
    
    // CORRECTION: Parser correctement les paramètres numériques
    const page = parseInt(query.page as any) || 1;
    const limit = parseInt(query.limit as any) || 10;
    const skip = (page - 1) * limit;

    // Construire les filtres
    const where: any = { formId: formId };

    if (query.respondentId) where.respondentId = query.respondentId;
    if (query.startDate) where.submittedAt = { gte: new Date(query.startDate) };
    if (query.endDate) {
      where.submittedAt = {
        ...where.submittedAt,
        lte: new Date(query.endDate)
      };
    }

    // Exécuter la requête
    const [responses, total] = await Promise.all([
      prisma.formResponse.findMany({
        where,
        skip,
        take: limit,
        include: {
          respondent: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            }
          }
        },
        orderBy: { submittedAt: 'desc' }
      }),
      prisma.formResponse.count({ where })
    ]);

    return {
      responses: responses.map((response: any) => ({
        id: response.id,
        data: response.data as Record<string, any>,
        submittedAt: response.submittedAt,
        respondent: response.respondent,
      })),
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

  // Modification de la méthode deleteForm dans votre FormService
// Remplacez cette méthode dans votre service :

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

  // MODIFICATION: Amélioration des droits de suppression
  const canDelete = this.checkFormDeletePermissions(form, userId, userRole);
  if (!canDelete) {
    throw new AuthError('Permissions insuffisantes pour supprimer ce formulaire');
  }

  // MODIFICATION PRINCIPALE: Logique de suppression plus flexible
  const isCreator = form.creatorId === userId;
  const isAdmin = userRole === 'ADMINISTRATEUR';
  
  // Cas 1: Admin peut toujours supprimer
  if (isAdmin) {
    await this.deleteFormWithDependencies(formId);
    return;
  }

  // Cas 2: Créateur peut supprimer avec avertissement si il y a des réponses
  if (isCreator) {
    if (form._count.responses > 0) {
      // Option A: Permettre la suppression avec cascade (recommandé)
      await this.deleteFormWithDependencies(formId);
      return;
      
      // Option B: Si vous préférez empêcher la suppression, décommentez ces lignes :
      // throw new ValidationError(
      //   `Impossible de supprimer ce formulaire car il contient ${form._count.responses} réponse(s). ` +
      //   'Les données des répondants seraient perdues.'
      // );
    }
    
    if (form._count.comments > 0) {
      // Permettre la suppression des commentaires avec le formulaire
      await this.deleteFormWithDependencies(formId);
      return;
    }
  }

  // Cas 3: Autres utilisateurs autorisés
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

// NOUVELLE MÉTHODE: Suppression avec cascade pour nettoyer toutes les dépendances
private async deleteFormWithDependencies(formId: string): Promise<void> {
  // Utiliser une transaction pour assurer la cohérence
  await prisma.$transaction(async (tx) => {
    // Supprimer d'abord les réponses
    await tx.formResponse.deleteMany({
      where: { formId }
    });

    // Supprimer les commentaires liés
    await tx.comment.deleteMany({
      where: { formId }
    });

    // Supprimer le formulaire
    await tx.form.delete({
      where: { id: formId }
    });
  });
}

  // =============================================
  // MÉTHODES EXISTANTES MAINTENUES
  // =============================================

  // Mes formulaires
  async getMyForms(userId: string, userRole: string, query: any) {
    // CORRECTION: Parser correctement les paramètres numériques
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const where: any = { creatorId: userId };
    
    if (query.status === 'active') {
      where.isActive = true;
    } else if (query.status === 'inactive') {
      where.isActive = false;
    }

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

  // Obtenir les données pour l'export Excel/CSV
  async getFormResponsesForExport(formId: string, userId: string, userRole: string): Promise<any[]> {
    const form = await this.getFormById(formId, userId, userRole);

    const responses = await prisma.formResponse.findMany({
      where: { formId },
      include: {
        respondent: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });

    if (responses.length === 0) {
      return [];
    }

    const formSchema = form.schema as FormSchema;
    const formFields = formSchema.fields || [];
    
    return responses.map((response: any) => {
      const exportRow: any = {
        'ID Réponse': response.id,
        'Répondant': `${response.respondent.firstName} ${response.respondent.lastName}`,
        'Email': response.respondent.email,
        'Rôle': response.respondent.role,
        'Date de soumission': new Date(response.submittedAt).toLocaleString()
      };

      formFields.forEach(field => {
        const value = (response.data as any)[field.id];
        exportRow[field.label] = value !== undefined && value !== null ? value : '';
      });

      return exportRow;
    });
  }

  // Créer un template de formulaire - MODIFIÉ: Permissions ajustées
  async createTemplate(name: string, description: string, schema: any, category: string, userId: string, userRole: string): Promise<FormResponse> {
    // MODIFICATION: Chercheurs peuvent aussi créer des templates
    const allowedRoles = ['CHERCHEUR', 'TECHNICIEN_SUPERIEUR', 'ADMINISTRATEUR'];
    if (!allowedRoles.includes(userRole)) {
      throw new AuthError('Permissions insuffisantes pour créer un template');
    }

    // Valider le schéma
    const schemaValidation = FormValidationService.validateFormSchema(schema);
    if (!schemaValidation.isValid) {
      throw new ValidationError(`Schéma invalide: ${schemaValidation.errors.join(', ')}`);
    }

    const template = await prisma.form.create({
      data: {
        title: `[TEMPLATE] ${name}`,
        description,
        schema: schema as any,
        isActive: false,
        creatorId: userId
      },
      include: this.getFormIncludes(false)
    });

    return this.formatFormResponse(template as FormWithRelations);
  }

  // Obtenir les templates
  async getTemplates(userId: string, userRole: string): Promise<FormResponse[]> {
    let where: any = {
      title: { startsWith: '[TEMPLATE]' }
    };

    // MODIFICATION: Les chercheurs voient leurs templates + ceux publics
    if (userRole === 'ADMINISTRATEUR') {
      // Les admins voient tout
    } else if (userRole === 'CHERCHEUR') {
      where.OR = [
        { creatorId: userId }, // Mes templates
        { 
          creator: { 
            role: { in: ['ADMINISTRATEUR', 'TECHNICIEN_SUPERIEUR'] }
          }
        } // Templates des admins et techniciens
      ];
    } else {
      where.creatorId = userId; // Assistants ne voient que leurs templates
    }

    const templates = await prisma.form.findMany({
      where,
      include: this.getFormIncludes(false),
      orderBy: { createdAt: 'desc' }
    });

    return templates.map((template) => this.formatFormResponse(template as FormWithRelations));
  }

  // Dupliquer un formulaire - MODIFIÉ: Permissions ajustées
  async duplicateForm(formId: string, newTitle: string, userId: string, userRole: string): Promise<FormResponse> {
    const originalForm = await this.getFormById(formId, userId, userRole);

    // MODIFICATION: Tous les utilisateurs peuvent dupliquer les formulaires auxquels ils ont accès
    const allowedRoles = ['CHERCHEUR', 'ASSISTANT_CHERCHEUR', 'TECHNICIEN_SUPERIEUR', 'ADMINISTRATEUR'];
    if (!allowedRoles.includes(userRole)) {
      throw new AuthError('Permissions insuffisantes pour dupliquer un formulaire');
    }

    const duplicatedForm = await prisma.form.create({
      data: {
        title: newTitle || `Copie de ${originalForm.title}`,
        description: originalForm.description,
        schema: originalForm.schema as any,
        isActive: false,
        creatorId: userId,
        activityId: originalForm.activity?.id
      },
      include: this.getFormIncludes(false)
    });

    return this.formatFormResponse(duplicatedForm as FormWithRelations);
  }

  // Activer/désactiver un formulaire
  async toggleFormStatus(formId: string, userId: string, userRole: string): Promise<FormResponse> {
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

    // Vérifier les permissions
    const canEdit = this.checkFormEditPermissions(form, userId, userRole);
    if (!canEdit) {
      throw new AuthError('Permissions insuffisantes pour modifier le statut de ce formulaire');
    }

    const updatedForm = await prisma.form.update({
      where: { id: formId },
      data: {
        isActive: !form.isActive
      },
      include: this.getFormIncludes(false)
    });

    return this.formatFormResponse(updatedForm as FormWithRelations);
  }

  // Obtenir les statistiques des formulaires
  async getFormStats(userId: string, userRole: string): Promise<any> {
    let whereClause: any = {};
    
    if (userRole === 'ADMINISTRATEUR') {
      // Les admins voient tout
    } else if (userRole === 'CHERCHEUR') {
      whereClause = {
        OR: [
          { creatorId: userId },
          {
            activity: {
              project: {
                OR: [
                  { creatorId: userId },
                  { participants: { some: { userId, isActive: true } } }
                ]
              }
            }
          },
          { 
            AND: [
              { isActive: true },
              { activityId: null }
            ]
          }
        ]
      };
    } else {
      whereClause = {
        OR: [
          { creatorId: userId },
          {
            activity: {
              project: {
                participants: { some: { userId, isActive: true } }
              }
            }
          },
          { 
            AND: [
              { isActive: true },
              { activityId: null }
            ]
          }
        ]
      };
    }

    const [
      totalForms,
      activeForms,
      myForms,
      totalResponses,
      formsWithResponses,
      recentForms
    ] = await Promise.all([
      prisma.form.count({ where: whereClause }),
      prisma.form.count({ 
        where: { ...whereClause, isActive: true } 
      }),
      prisma.form.count({ 
        where: { creatorId: userId } 
      }),
      prisma.formResponse.count({
        where: {
          form: whereClause
        }
      }),
      prisma.form.count({
        where: {
          ...whereClause,
          responses: {
            some: {}
          }
        }
      }),
      prisma.form.findMany({
        where: {
          ...whereClause,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        select: {
          id: true,
          title: true,
          createdAt: true,
          _count: {
            select: { 
              responses: true,
              comments: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    return {
      total: totalForms,
      active: activeForms,
      inactive: totalForms - activeForms,
      myForms,
      totalResponses,
      formsWithResponses,
      responseRate: totalForms > 0 ? Math.round((formsWithResponses / totalForms) * 100) : 0,
      recentForms
    };
  }

  // =============================================
  // MÉTHODES UTILITAIRES PRIVÉES - MODIFIÉES
  // =============================================

  private checkProjectAccess(project: any, userId: string, userRole: string): boolean {
    if (userRole === 'ADMINISTRATEUR') return true;
    if (project.creatorId === userId) return true;
    if (project.participants?.some((p: { userId: string; isActive: boolean }) => p.userId === userId && p.isActive)) return true;
    return false;
  }

  // NOUVELLE MÉTHODE: Vérifier l'accès aux formulaires (plus permissif)
  private checkFormAccess(form: FormWithRelations, userId: string, userRole: string): boolean {
    // Admin a accès à tout
    if (userRole === 'ADMINISTRATEUR') return true;
    
    // Créateur a accès
    if (form.creatorId === userId) return true;
    
    // Accès via activité/projet
    if (form.activity?.project) {
      const hasProjectAccess = this.checkProjectAccess(form.activity.project, userId, userRole);
      if (hasProjectAccess) return true;
    }
    
    // NOUVEAU: Formulaires publics (sans activité et actifs)
    if (!form.activityId && form.isActive) {
      return true;
    }
    
    return false;
  }

  // NOUVELLE MÉTHODE: Vérifier les permissions d'édition
  private checkFormEditPermissions(form: any, userId: string, userRole: string): boolean {
    // Admin peut tout modifier
    if (userRole === 'ADMINISTRATEUR') return true;
    
    // Créateur peut modifier
    if (form.creatorId === userId) return true;
    
    // NOUVEAU: Chef de projet peut modifier les formulaires des activités de son projet
    if (form.activity?.project?.creatorId === userId && userRole === 'CHERCHEUR') {
      return true;
    }
    
    return false;
  }

  // NOUVELLE MÉTHODE: Vérifier les permissions de suppression
  private checkFormDeletePermissions(form: any, userId: string, userRole: string): boolean {
    // Admin peut tout supprimer
    if (userRole === 'ADMINISTRATEUR') return true;
    
    // Créateur peut supprimer ses formulaires
    if (form.creatorId === userId) return true;
    
    // Chef de projet peut supprimer les formulaires de ses projets (si pas de réponses)
    if (form.activity?.project?.creatorId === userId && userRole === 'CHERCHEUR') {
      return true;
    }
    
    return false;
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
              objectives: true,
              status: true,
              startDate: true,
              endDate: true,
              budget: true,
              keywords: true,
              createdAt: true,
              updatedAt: true,
              creatorId: true,
            }
          }
        }
      },
      _count: {
        select: {
          responses: true,
          comments: true,
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
    const response: FormResponse = {
      id: form.id,
      title: form.title,
      description: form.description || undefined,
      schema: form.schema as FormSchema,
      isActive: form.isActive,
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
      responses: form.responses,
      _count: form._count,
    };

    // Ajouter les commentaires seulement s'ils sont présents
    if (form.comments && form.comments.length > 0) {
      response.comments = form.comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        author: comment.author,
        formId: form.id
      }));
    }

    return response;
  }
}