// src/controllers/form.controller.ts - Version complète
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { FormService } from '../services/form.service';
import { FormCommentService } from '../services/formComment.service';
import { AuthenticatedRequest } from '../types/auth.types';
import {
  createFormSchema,
  updateFormSchema,
  submitFormResponseSchema,
  shareFormSchema,
  publicShareSchema,
  uploadPhotoSchema,
  offlineDataSchema,
  syncOfflineSchema,
  exportQuerySchema,
  addCommentSchema
} from '../utils/formValidation';
import ExcelJS from 'exceljs';
import * as JSZip from 'jszip';
import * as path from 'path';
import * as fs from 'fs';

const prisma = new PrismaClient();
const formService = new FormService();
const commentService = new FormCommentService();

export class FormController {

  // =============================================
  // GESTION DES FORMULAIRES SELON VOTRE LOGIQUE
  // =============================================

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
  // PARTAGE DE FORMULAIRES
  // =============================================

  shareFormWithUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const validatedData = shareFormSchema.parse(req.body);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const share = await formService.shareFormWithUser(
        id,
        validatedData.targetUserId!,
        { 
          canCollect: validatedData.canCollect, 
          canExport: validatedData.canExport 
        },
        userId,
        userRole,
        validatedData.maxSubmissions,
        validatedData.expiresAt ? new Date(validatedData.expiresAt) : undefined
      );

      res.status(201).json({
        success: true,
        message: 'Formulaire partagé avec succès',
        data: share,
      });
    } catch (error) {
      next(error);
    }
  };

  createPublicShareLink = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const validatedData = publicShareSchema.parse(req.body);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const shareInfo = await formService.createPublicShareLink(id, userId, userRole, {
        maxSubmissions: validatedData.maxSubmissions,
        expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : undefined
      });

      res.status(201).json({
        success: true,
        message: 'Lien de partage créé avec succès',
        data: shareInfo,
      });
    } catch (error) {
      next(error);
    }
  };

  getFormByPublicLink = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { shareToken } = req.params;

      const formInfo = await formService.getFormByPublicToken(shareToken);

      res.status(200).json({
        success: true,
        data: formInfo,
      });
    } catch (error) {
      next(error);
    }
  };

  getFormShares = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      // Vérifier que l'utilisateur est le créateur
      const form = await prisma.form.findUnique({
        where: { id },
        select: { creatorId: true }
      });

      if (!form) {
        return res.status(404).json({
          success: false,
          message: 'Formulaire non trouvé'
        });
      }

      if (form.creatorId !== userId && userRole !== 'ADMINISTRATEUR') {
        return res.status(403).json({
          success: false,
          message: 'Seul le créateur peut voir les partages'
        });
      }

      const shares = await prisma.formShare.findMany({
        where: { formId: id },
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
        },
        orderBy: { createdAt: 'desc' }
      });

      res.status(200).json({
        success: true,
        data: shares
      });
    } catch (error) {
      next(error);
    }
  };

  removeFormShare = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { shareId } = req.params;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const share = await prisma.formShare.findUnique({
        where: { id: shareId },
        include: {
          form: {
            select: { creatorId: true }
          }
        }
      });

      if (!share) {
        return res.status(404).json({
          success: false,
          message: 'Partage non trouvé'
        });
      }

      if (share.form.creatorId !== userId && userRole !== 'ADMINISTRATEUR') {
        return res.status(403).json({
          success: false,
          message: 'Seul le créateur peut supprimer les partages'
        });
      }

      await prisma.formShare.delete({
        where: { id: shareId }
      });

      if (share.shareType === 'EXTERNAL') {
        await prisma.form.update({
          where: { id: share.formId },
          data: {
            isPublic: false,
            shareToken: null
          }
        });
      }

      res.status(200).json({
        success: true,
        message: 'Partage supprimé avec succès'
      });
    } catch (error) {
      next(error);
    }
  };

  // =============================================
  // COLLECTE DE DONNÉES MULTIPLE
  // =============================================

  submitFormResponse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const validatedData = submitFormResponseSchema.parse(req.body);
      const respondentId = authenticatedReq.user?.userId;
      const respondentRole = authenticatedReq.user?.role;

      let collectorInfo;
      if (respondentId) {
        const isShared = await this.checkIfFormIsShared(id, respondentId);
        collectorInfo = {
          type: isShared ? 'SHARED_USER' : 'USER'
        };
      } else {
        collectorInfo = {
          type: 'PUBLIC',
          name: validatedData.collectorName,
          email: validatedData.collectorEmail
        };
      }

      const response = await formService.submitFormResponse(
        id, 
        {
          ...validatedData,
          photos: validatedData.photos
            ? validatedData.photos.map(photo => ({
                ...photo,
                takenAt: photo.takenAt ? new Date(photo.takenAt) : undefined
              }))
            : undefined
        },
        respondentId, 
        respondentRole,
        collectorInfo as any
      );

      res.status(201).json({
        success: true,
        message: 'Réponse soumise avec succès',
        data: response,
      });
    } catch (error) {
      next(error);
    }
  };

  submitPublicFormResponse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { shareToken } = req.params;
      const validatedData = submitFormResponseSchema.parse(req.body);
      
      const formInfo = await formService.getFormByPublicToken(shareToken);
      const formId = formInfo.form.id;

      const collectorInfo = {
        type: 'PUBLIC' as const,
        name: validatedData.collectorName,
        email: validatedData.collectorEmail
      };

      const response = await formService.submitFormResponse(
        formId,
        {
          ...validatedData,
          photos: validatedData.photos
            ? validatedData.photos.map(photo => ({
                ...photo,
                takenAt: photo.takenAt ? new Date(photo.takenAt) : undefined
              }))
            : undefined
        },
        null,
        null,
        collectorInfo
      );

      res.status(201).json({
        success: true,
        message: 'Réponse soumise avec succès',
        data: response,
      });
    } catch (error) {
      next(error);
    }
  };

  getFormResponses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      // Vérifier l'accès
      await formService.getFormById(id, userId, userRole);

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const where: any = { formId: id };

      if (req.query.collectorType && req.query.collectorType !== 'ALL') {
        where.collectorType = req.query.collectorType;
      }

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
            },
            photos: {
              select: {
                id: true,
                filename: true,
                fieldId: true,
                caption: true,
                takenAt: true
              }
            }
          },
          orderBy: { submittedAt: 'desc' }
        }),
        prisma.formResponse.count({ where })
      ]);

      // Ajouter photosCount à chaque réponse
      const responsesWithCount = responses.map(response => ({
        ...response,
        photosCount: response.photos?.length || 0
      }));

      res.status(200).json({
        success: true,
        data: responsesWithCount,
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

  // =============================================
  // GESTION DES PHOTOS
  // =============================================

  uploadFieldPhoto = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Aucun fichier fourni'
        });
      }

      const photoInfo = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: `/uploads/photos/${req.file.filename}`
      };

      res.status(200).json({
        success: true,
        message: 'Photo uploadée avec succès',
        data: photoInfo
      });
    } catch (error) {
      next(error);
    }
  };

  uploadMultiplePhotos = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Aucun fichier fourni'
        });
      }

      const photoInfos = files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: `/uploads/photos/${file.filename}`
      }));

      res.status(200).json({
        success: true,
        message: `${files.length} photos uploadées avec succès`,
        data: photoInfos
      });
    } catch (error) {
      next(error);
    }
  };

  getResponsePhotos = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { responseId } = req.params;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const response = await prisma.formResponse.findUnique({
        where: { id: responseId },
        include: {
          form: {
            include: {
              creator: true,
              activity: {
                include: {
                  project: {
                    include: {
                      participants: { where: { userId } }
                    }
                  }
                }
              }
            }
          },
          photos: true
        }
      });

      if (!response) {
        return res.status(404).json({
          success: false,
          message: 'Réponse non trouvée'
        });
      }

      const hasAccess = this.checkResponseAccess(response, userId, userRole);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé'
        });
      }

      res.status(200).json({
        success: true,
        data: response.photos.map(photo => ({
          id: photo.id,
          filename: photo.filename,
          originalName: photo.originalName,
          url: `/uploads/photos/${photo.filename}`,
          fieldId: photo.fieldId,
          caption: photo.caption,
          takenAt: photo.takenAt,
          latitude: photo.latitude,
          longitude: photo.longitude,
          size: Number(photo.size)
        }))
      });
    } catch (error) {
      next(error);
    }
  };

  // =============================================
  // SYNCHRONISATION OFFLINE
  // =============================================

  storeOfflineData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = offlineDataSchema.parse(req.body);

      await formService.storeOfflineData(
        validatedData.formId, 
        validatedData.deviceId, 
        validatedData.data
      );

      res.status(201).json({
        success: true,
        message: 'Données stockées pour synchronisation'
      });
    } catch (error) {
      next(error);
    }
  };

  syncOfflineData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = syncOfflineSchema.parse(req.body);

      const results = await formService.syncOfflineData(validatedData.deviceId);

      res.status(200).json({
        success: true,
        message: 'Synchronisation terminée',
        data: results
      });
    } catch (error) {
      next(error);
    }
  };

  getOfflineSyncStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { deviceId } = req.params;

      const pendingSync = await prisma.offlineSync.findMany({
        where: { 
          deviceId,
          status: 'PENDING'
        },
        orderBy: { createdAt: 'desc' }
      });

      const failedSync = await prisma.offlineSync.findMany({
        where: { 
          deviceId,
          status: 'ERROR'
        },
        orderBy: { createdAt: 'desc' }
      });

      const lastSync = await prisma.offlineSync.findFirst({
        where: { 
          deviceId,
          status: 'SYNCED'
        },
        orderBy: { syncedAt: 'desc' }
      });

      res.status(200).json({
        success: true,
        data: {
          deviceId,
          pendingCount: pendingSync.length,
          failedCount: failedSync.length,
          lastSyncAt: lastSync?.syncedAt || null,
          pendingItems: pendingSync.slice(0, 5),
          failedItems: failedSync.slice(0, 5)
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // =============================================
  // EXPORT DES DONNÉES
  // =============================================

  exportResponses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const validatedQuery = exportQuerySchema.parse(req.query);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const form = await formService.getFormById(id, userId, userRole);
      
      const responses = await prisma.formResponse.findMany({
        where: { formId: id },
        include: {
          respondent: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              role: true
            }
          },
          photos: validatedQuery.includePhotos
        },
        orderBy: { submittedAt: 'desc' }
      });

      if (responses.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Aucune donnée à exporter'
        });
      }

      const exportData = this.formatResponsesForExport(responses, form, validatedQuery);

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Réponses');

      // Ajouter les en-têtes et les données
      if (exportData.length > 0) {
        const headers = Object.keys(exportData[0]);
        worksheet.addRow(headers);

        // Ajouter les données
        exportData.forEach(row => {
          const values = headers.map(header => row[header]);
          worksheet.addRow(values);
        });

        // Ajuster automatiquement la largeur des colonnes
        worksheet.columns.forEach((column, index) => {
          let maxLength = 0;
          column.eachCell?.({ includeEmpty: true }, (cell) => {
            const cellLength = cell.value ? cell.value.toString().length : 10;
            if (cellLength > maxLength) {
              maxLength = cellLength;
            }
          });
          column.width = Math.min(maxLength + 2, 50);
        });

        // Mettre en gras la première ligne (en-têtes)
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true };
      }

      const filename = `${form.title.replace(/[^a-zA-Z0-9]/g, '_')}_responses_${Date.now()}.${validatedQuery.format}`;

      // Générer le buffer selon le format
      let buffer: Buffer;
      if (validatedQuery.format === 'csv') {
        buffer = await workbook.csv.writeBuffer() as Buffer;
      } else {
        buffer = await workbook.xlsx.writeBuffer() as Buffer;
      }

      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 
        validatedQuery.format === 'csv' 
          ? 'text/csv' 
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );

      res.send(buffer);
    } catch (error) {
      next(error);
    }
  };

  // =============================================
  // GESTION DES COMMENTAIRES
  // =============================================

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

  getFormComments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;
      
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const orderBy = (req.query.orderBy as 'asc' | 'desc') || 'desc';

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

  // =============================================
  // DASHBOARD ET STATISTIQUES
  // =============================================

  getCollectorDashboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const userId = authenticatedReq.user.userId;

      const [myForms, sharedForms, totalResponses, totalPhotos] = await Promise.all([
        prisma.form.findMany({
          where: { creatorId: userId },
          include: {
            _count: {
              select: { responses: true, comments: true }
            }
          },
          orderBy: { updatedAt: 'desc' },
          take: 5
        }),
        prisma.form.findMany({
          where: {
            shares: {
              some: {
                sharedWithId: userId,
                OR: [
                  { expiresAt: null },
                  { expiresAt: { gt: new Date() } }
                ]
              }
            }
          },
          include: {
            creator: {
              select: { firstName: true, lastName: true }
            },
            _count: {
              select: { responses: true }
            }
          },
          take: 5
        }),
        prisma.formResponse.count({
          where: { respondentId: userId }
        }),
        prisma.responsePhoto.count({
          where: {
            response: {
              respondentId: userId
            }
          }
        })
      ]);

      res.status(200).json({
        success: true,
        data: {
          myForms,
          sharedForms,
          statistics: {
            myResponses: totalResponses,
            totalPhotos
          }
        }
      });
    } catch (error) {
      next(error);
    }
  };

  previewForm = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { schema } = req.body;
      
      const validatedSchema = createFormSchema.pick({ schema: true }).parse({ schema });
      const previewData = this.generatePreviewData(validatedSchema.schema);
      
      res.status(200).json({
        success: true,
        data: {
          schema: validatedSchema.schema,
          previewData,
          isValid: true
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // =============================================
  // MÉTHODES UTILITAIRES PRIVÉES
  // =============================================

  private async checkIfFormIsShared(formId: string, userId: string): Promise<boolean> {
    const share = await prisma.formShare.findFirst({
      where: {
        formId,
        sharedWithId: userId,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    });
    return !!share;
  }

  private checkResponseAccess(response: any, userId: string, userRole: string): boolean {
    if (userRole === 'ADMINISTRATEUR') return true;
    if (response.form.creatorId === userId) return true;
    if (response.respondentId === userId) return true;
    
    if (response.form.activity?.project?.participants?.some(
      (p: any) => p.userId === userId && p.isActive
    )) return true;
    
    return false;
  }

  private formatResponsesForExport(responses: any[], form: any, options: any) {
    const formSchema = form.schema;
    const formFields = formSchema.fields || [];

    // Fonction pour résoudre le label d'une option
    const resolveOptionLabel = (field: any, value: any): string => {
      if (!field.options || !Array.isArray(field.options)) {
        return value?.toString() || '';
      }
      const option = field.options.find((opt: any) => opt.value === value);
      return option ? option.label : value?.toString() || '';
    };

    return responses.map((response: any) => {
      const exportRow: any = {
        'ID Réponse': response.id,
        'Type Collecteur': response.collectorType,
        'Date de soumission': new Date(response.submittedAt).toLocaleString()
      };

      if (response.respondent) {
        exportRow['Répondant'] = `${response.respondent.firstName} ${response.respondent.lastName}`;
        exportRow['Email'] = response.respondent.email;
        exportRow['Rôle'] = response.respondent.role;
      } else if (response.collectorInfo) {
        const info = response.collectorInfo as any;
        exportRow['Répondant'] = info.name || 'Collecteur externe';
        exportRow['Email'] = info.email || '';
      }

      formFields.forEach((field: any) => {
        const value = (response.data as any)[field.id];

        // Gérer les différents types de champs
        if (value === undefined || value === null || value === '') {
          exportRow[field.label] = '';
        } else if (field.type === 'select' || field.type === 'radio') {
          // Pour select et radio, résoudre le label
          exportRow[field.label] = resolveOptionLabel(field, value);
        } else if (field.type === 'checkbox' && Array.isArray(value)) {
          // Pour checkbox avec options multiples, résoudre chaque label
          const labels = value.map((v: any) => resolveOptionLabel(field, v));
          exportRow[field.label] = labels.join(', ');
        } else if (Array.isArray(value)) {
          // Pour les autres tableaux
          exportRow[field.label] = value.join(', ');
        } else if (typeof value === 'object') {
          // Pour les objets (ex: photos)
          exportRow[field.label] = JSON.stringify(value);
        } else {
          // Pour les valeurs simples
          exportRow[field.label] = value.toString();
        }
      });

      if (options.includePhotos && response.photos) {
        exportRow['Nombre de photos'] = response.photos.length;
        exportRow['URLs des photos'] = response.photos.map((p: any) => `/uploads/photos/${p.filename}`).join(', ');
      }

      return exportRow;
    });
  }

  private generatePreviewData(schema: any): Record<string, any> {
    const previewData: Record<string, any> = {};
    
    if (schema.fields) {
      schema.fields.forEach((field: any) => {
        switch (field.type) {
          case 'text':
          case 'textarea':
            previewData[field.id] = `Exemple de ${field.label.toLowerCase()}`;
            break;
          case 'number':
            previewData[field.id] = 42;
            break;
          case 'email':
            previewData[field.id] = 'exemple@email.com';
            break;
          case 'date':
            previewData[field.id] = new Date().toISOString().split('T')[0];
            break;
          case 'select':
          case 'radio':
            if (field.options && field.options.length > 0) {
              previewData[field.id] = field.options[0].value;
            }
            break;
          case 'checkbox':
            if (field.options && field.options.length > 0) {
              previewData[field.id] = [field.options[0].value];
            } else {
              previewData[field.id] = true;
            }
            break;
          case 'photo':
            previewData[field.id] = {
              type: 'photo',
              filename: 'exemple_photo.jpg',
              url: '/placeholder-image.jpg'
            };
            break;
          default:
            previewData[field.id] = `Valeur d'exemple`;
        }
      });
    }
    
    return previewData;
  }
}

const formController = new FormController();
export default formController;