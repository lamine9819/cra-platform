// src/controllers/form.controller.ts - Version propre sans doublons
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { FormService } from '../services/form.service';
import { FormCommentService } from '../services/formComment.service';
import { AuthenticatedRequest } from '../types/auth.types';
import {
  createFormSchema,
  updateFormSchema,
  submitFormResponseSchema,
  formResponseQuerySchema,
  addCommentSchema
} from '../utils/formValidation';
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();
const formService = new FormService();
const commentService = new FormCommentService();

class FormController {

  // =============================================
  // GESTION DES FORMULAIRES - MÉTHODES PRINCIPALES
  // =============================================

  // Créer un formulaire - MODIFIÉ: Permissions pour tous les utilisateurs
  createForm = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const validatedData = createFormSchema.parse(req.body);
      const creatorId = authenticatedReq.user.userId;
      const creatorRole = authenticatedReq.user.role;

      const form = await formService.createForm(validatedData, creatorId, creatorRole);

      res.status(201).json({
        success: true,
        message: 'Formulaire créé avec succès',
        data: form,
      });
    } catch (error) {
      next(error);
    }
  };

  // Lister les formulaires
  listForms = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const result = await formService.listForms(userId, userRole, req.query);

      res.status(200).json({
        success: true,
        data: result.forms,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  // Obtenir un formulaire par ID
  getFormById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;
      const includeComments = req.query.includeComments === 'true';

      const form = await formService.getFormById(id, userId, userRole, includeComments);

      res.status(200).json({
        success: true,
        data: form,
      });
    } catch (error) {
      next(error);
    }
  };

  // Mettre à jour un formulaire
  updateForm = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const validatedData = updateFormSchema.parse(req.body);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const form = await formService.updateForm(id, validatedData, userId, userRole);

      res.status(200).json({
        success: true,
        message: 'Formulaire mis à jour avec succès',
        data: form,
      });
    } catch (error) {
      next(error);
    }
  };

  // Supprimer un formulaire
  deleteForm = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      await formService.deleteForm(id, userId, userRole);

      res.status(200).json({
        success: true,
        message: 'Formulaire supprimé avec succès',
      });
    } catch (error) {
      next(error);
    }
  };

  // =============================================
  // GESTION DES RÉPONSES
  // =============================================

  // Soumettre une réponse
  submitFormResponse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const validatedData = submitFormResponseSchema.parse(req.body);
      const respondentId = authenticatedReq.user.userId;
      const respondentRole = authenticatedReq.user.role;

      const response = await formService.submitFormResponse(id, validatedData, respondentId, respondentRole);

      res.status(201).json({
        success: true,
        message: 'Réponse soumise avec succès',
        data: response,
      });
    } catch (error) {
      next(error);
    }
  };

  // Obtenir les réponses d'un formulaire
  getFormResponses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const queryParams = formResponseQuerySchema.parse(req.query);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const result = await formService.getFormResponses(id, userId, userRole, queryParams);

      res.status(200).json({
        success: true,
        data: result.responses,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  // =============================================
  // GESTION DES COMMENTAIRES
  // =============================================

  // Ajouter un commentaire sur un formulaire
  addComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const validatedData = addCommentSchema.parse(req.body);
      const authorId = authenticatedReq.user.userId;
      const authorRole = authenticatedReq.user.role;

      const comment = await commentService.addComment(id, validatedData.content, authorId, authorRole);

      res.status(201).json({
        success: true,
        message: 'Commentaire ajouté avec succès',
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  };

  // Obtenir les commentaires d'un formulaire
  getFormComments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;
      
      // Paramètres de pagination
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const orderBy = req.query.orderBy as 'asc' | 'desc' || 'desc';

      const result = await commentService.getFormComments(id, userId, userRole, {
        page,
        limit,
        orderBy
      });

      res.status(200).json({
        success: true,
        data: result.comments,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  // Obtenir un commentaire spécifique
  getCommentById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { commentId } = req.params;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const comment = await commentService.getCommentById(commentId, userId, userRole);

      res.status(200).json({
        success: true,
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  };

  // Modifier un commentaire
  updateComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { commentId } = req.params;
      const validatedData = addCommentSchema.parse(req.body);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const comment = await commentService.updateComment(
        commentId, 
        validatedData.content, 
        userId, 
        userRole
      );

      res.status(200).json({
        success: true,
        message: 'Commentaire modifié avec succès',
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  };

  // Supprimer un commentaire
  deleteComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { commentId } = req.params;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      await commentService.deleteComment(commentId, userId, userRole);

      res.status(200).json({
        success: true,
        message: 'Commentaire supprimé avec succès',
      });
    } catch (error) {
      next(error);
    }
  };

  // Obtenir les statistiques des commentaires
  getFormCommentStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const stats = await commentService.getFormCommentStats(id, userId, userRole);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };

  // Rechercher dans les commentaires
  searchFormComments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const { search } = req.query;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      if (!search || typeof search !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Terme de recherche requis',
        });
      }

      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      const result = await commentService.searchFormComments(
        id, 
        search, 
        userId, 
        userRole, 
        { page, limit }
      );

      res.status(200).json({
        success: true,
        data: result.comments,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  // =============================================
  // FONCTIONNALITÉS AVANCÉES
  // =============================================

  // Mes formulaires
  getMyForms = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const result = await formService.getMyForms(userId, userRole, req.query);

      res.status(200).json({
        success: true,
        data: result.forms,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  // Exporter les réponses en Excel/CSV
  exportResponses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const { format = 'xlsx' } = req.query;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const exportData = await formService.getFormResponsesForExport(id, userId, userRole);

      if (!exportData || exportData.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Aucune donnée à exporter'
        });
      }

      // Créer le fichier Excel
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Réponses');

      // Définir le nom du fichier
      const form = await formService.getFormById(id, userId, userRole);
      const filename = `${form.title.replace(/[^a-zA-Z0-9]/g, '_')}_responses.${format}`;

      // Générer le buffer
      const buffer = XLSX.write(workbook, { 
        bookType: format as any, 
        type: 'buffer' 
      });

      // Définir les headers
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 
        format === 'csv' 
          ? 'text/csv' 
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );

      res.send(buffer);
    } catch (error) {
      next(error);
    }
  };

  // Créer un template de formulaire
  createTemplate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { name, description, schema, category } = req.body;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const template = await formService.createTemplate(name, description, schema, category, userId, userRole);

      res.status(201).json({
        success: true,
        message: 'Template créé avec succès',
        data: template
      });
    } catch (error) {
      next(error);
    }
  };

  // Obtenir les templates
  getTemplates = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const templates = await formService.getTemplates(userId, userRole);

      res.status(200).json({
        success: true,
        data: templates
      });
    } catch (error) {
      next(error);
    }
  };

  // Dupliquer un formulaire
  duplicateForm = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const { title } = req.body;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const duplicatedForm = await formService.duplicateForm(id, title, userId, userRole);

      res.status(201).json({
        success: true,
        message: 'Formulaire dupliqué avec succès',
        data: duplicatedForm
      });
    } catch (error) {
      next(error);
    }
  };

  // Activer/désactiver un formulaire
  toggleFormStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const form = await formService.toggleFormStatus(id, userId, userRole);

      res.status(200).json({
        success: true,
        message: `Formulaire ${form.isActive ? 'activé' : 'désactivé'} avec succès`,
        data: form
      });
    } catch (error) {
      next(error);
    }
  };

  // Obtenir les statistiques d'un formulaire
  getFormStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const stats = await formService.getFormStats(userId, userRole);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  };

  // Prévisualiser un formulaire
  previewForm = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { schema } = req.body;
      
      // Valider le schéma
      const validatedSchema = createFormSchema.pick({ schema: true }).parse({ schema });
      
      res.status(200).json({
        success: true,
        data: {
          preview: validatedSchema.schema,
          isValid: true
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Valider un schéma de formulaire
  validateFormSchema = async (req: Request, res: Response, _next: NextFunction) => {
    try {
      const { schema } = req.body;
      
      // Valider le schéma
      const validatedSchema = createFormSchema.pick({ schema: true }).parse({ schema });
      
      res.status(200).json({
        success: true,
        message: 'Schéma valide',
        data: {
          isValid: true,
          schema: validatedSchema.schema
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Schéma invalide',
        errors: error instanceof Error ? [error.message] : ['Erreur de validation']
      });
    }
  };

  // =============================================
  // NOUVELLES MÉTHODES POUR LES PERMISSIONS ÉLARGIES
  // =============================================

  // Obtenir les formulaires publics
  getPublicForms = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // CORRECTION: Parser correctement les paramètres numériques
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;

      // Construire les filtres pour les formulaires publics
      const where: any = {
        isActive: true,
        activityId: null // Formulaires non liés à une activité spécifique
      };

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ];
      }

      const skip = (page - 1) * limit;

      const [forms, total] = await Promise.all([
        prisma.form.findMany({
          where,
          skip,
          take: limit,
          include: {
            creator: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
              }
            },
            _count: {
              select: {
                responses: true,
                comments: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.form.count({ where })
      ]);

      res.status(200).json({
        success: true,
        data: forms,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Statistiques globales pour les admins
  getGlobalStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const userRole = authenticatedReq.user.role;

      // Seuls les admins peuvent voir les stats globales
      if (userRole !== 'ADMINISTRATEUR') {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé - Administrateur requis'
        });
      }

      // Statistiques globales avancées
      const [
        totalUsers,
        totalForms,
        totalResponses,
        totalComments,
        activeUsers,
        formsCreatedToday,
        responsesToday,
        commentsToday
      ] = await Promise.all([
        prisma.user.count(),
        prisma.form.count(),
        prisma.formResponse.count(),
        prisma.comment.count({ where: { formId: { not: null } } }),
        prisma.user.count({ where: { isActive: true } }),
        prisma.form.count({
          where: {
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        }),
        prisma.formResponse.count({
          where: {
            submittedAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        }),
        prisma.comment.count({
          where: {
            formId: { not: null },
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        })
      ]);

      res.status(200).json({
        success: true,
        data: {
          users: {
            total: totalUsers,
            active: activeUsers
          },
          forms: {
            total: totalForms,
            createdToday: formsCreatedToday
          },
          responses: {
            total: totalResponses,
            today: responsesToday
          },
          comments: {
            total: totalComments,
            today: commentsToday
          },
          engagement: {
            avgResponsesPerForm: totalForms > 0 ? Math.round(totalResponses / totalForms) : 0,
            avgCommentsPerForm: totalForms > 0 ? Math.round(totalComments / totalForms) : 0
          }
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Audit des formulaires
  getFormAudit = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      // Vérifier l'accès au formulaire
      await formService.getFormById(id, userId, userRole);

      // Récupérer l'historique des modifications (simulé pour l'exemple)
      const auditLogs = await prisma.auditLog.findMany({
        where: {
          entityType: 'form',
          entityId: id
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 50
      });

      res.status(200).json({
        success: true,
        data: auditLogs
      });
    } catch (error) {
      next(error);
    }
  };

  // Cloner un formulaire avec ses réponses (admin seulement)
  cloneFormWithResponses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const { title, includeResponses = false } = req.body;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      // Seuls les admins peuvent cloner avec les réponses
      if (includeResponses && userRole !== 'ADMINISTRATEUR') {
        return res.status(403).json({
          success: false,
          message: 'Seuls les administrateurs peuvent cloner avec les réponses'
        });
      }

      // Pour l'instant, déléguer à duplicateForm (extension future)
      const clonedForm = await formService.duplicateForm(id, title, userId, userRole);

      res.status(201).json({
        success: true,
        message: 'Formulaire cloné avec succès',
        data: clonedForm
      });
    } catch (error) {
      next(error);
    }
  };
}

// =====================================
// EXPORTS
// =====================================

// Créer une instance unique du contrôleur
const formController = new FormController();

// Exporter la classe ET l'instance
export { FormController };
export default formController;