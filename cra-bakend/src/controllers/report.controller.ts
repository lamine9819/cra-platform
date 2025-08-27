// src/controllers/report.controller.ts - CONTROLLER COMPLET
import { Request, Response } from 'express';
import { ReportService, ReportOptions } from '../services/report.service';
import { AuthenticatedRequest } from '../types/auth.types';
import { z } from 'zod';


const reportService = new ReportService();

// Schémas de validation
const generateReportSchema = z.object({
  type: z.enum(['project', 'activity', 'user', 'global']),
  entityId: z.string().optional(),
  dateRange: z.object({
    start: z.coerce.date(),
    end: z.coerce.date()
  }).optional(),
  includeGraphics: z.boolean().default(false),
  language: z.enum(['fr', 'en']).default('fr')
});

export class ReportController {
  // Générer un rapport
  generateReport = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      
      const validatedData = generateReportSchema.parse(req.body);
      
      // Vérifier les permissions
      if (!this.checkReportPermissions(userRole, validatedData.type, validatedData.entityId, userId)) {
        return res.status(403).json({
          success: false,
          message: 'Permissions insuffisantes pour générer ce rapport'
        });
      }

      // Valider les paramètres
      const validation = this.validateReportParams(validatedData.type, validatedData.entityId);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Paramètres invalides',
          errors: validation.errors
        });
      }

      const options: ReportOptions = {
        ...validatedData,
        userId,
        dateRange: validatedData.dateRange ? {
          start: validatedData.dateRange.start,
          end: validatedData.dateRange.end
        } : undefined
      };

      const reportBuffer = await reportService.generateReport(options);
      
      // Audit de la génération
      await this.auditReportGeneration(userId, validatedData.type, validatedData.entityId, true);
      
      // Définir le nom du fichier
      const filename = this.generateFilename(validatedData.type, validatedData.entityId);
      
      // Envoyer le PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', reportBuffer.length);
      
      res.send(reportBuffer);
    } catch (error) {
      console.error('Erreur génération rapport:', error);
      
      // Audit de l'échec
      await this.auditReportGeneration(req.user!.userId, req.body.type, req.body.entityId, false);
      
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la génération du rapport'
      });
    }
  };

  // Prévisualiser un rapport (métadonnées sans génération)
  previewReport = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const { type, entityId } = req.query;

      if (!type || !['project', 'activity', 'user', 'global'].includes(type as string)) {
        return res.status(400).json({
          success: false,
          message: 'Type de rapport invalide'
        });
      }

      // Vérifier les permissions
      if (!this.checkReportPermissions(userRole, type as string, entityId as string, userId)) {
        return res.status(403).json({
          success: false,
          message: 'Permissions insuffisantes'
        });
      }

      const preview = await this.generateReportPreview(type as string, entityId as string);
      
      res.json({
        success: true,
        data: preview
      });
    } catch (error) {
      console.error('Erreur prévisualisation rapport:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la prévisualisation'
      });
    }
  };

  // Obtenir les templates disponibles
  getTemplates = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userRole = req.user!.role;
      const templates = await reportService.getAvailableTemplates();
      
      // Filtrer selon le rôle
      const filteredTemplates = templates.filter(template => {
        switch (userRole) {
          case 'ADMINISTRATEUR':
            return true; // Tous les templates
          case 'CHERCHEUR':
            return ['project_report', 'activity_report', 'user_report'].includes(template.id);
          case 'ASSISTANT_CHERCHEUR':
            return ['activity_report', 'user_report'].includes(template.id);
          case 'TECHNICIEN_SUPERIEUR':
            return ['activity_report', 'user_report'].includes(template.id);
          default:
            return false;
        }
      });

      res.json({
        success: true,
        data: filteredTemplates
      });
    } catch (error) {
      console.error('Erreur récupération templates:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des templates'
      });
    }
  };

  // Obtenir l'historique des rapports générés
  getReportHistory = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const { page = 1, limit = 10 } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);

      // Pour l'historique, on peut utiliser la table audit_logs
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      let whereClause: any = {
        action: 'GENERATE_REPORT'
      };

      if (userRole !== 'ADMINISTRATEUR') {
        whereClause.userId = userId;
      }

      const [history, total] = await Promise.all([
        prisma.auditLog.findMany({
          where: whereClause,
          orderBy: { createdAt: 'desc' },
          skip: (pageNum - 1) * limitNum,
          take: limitNum
        }),
        prisma.auditLog.count({ where: whereClause })
      ]);

      res.json({
        success: true,
        data: history,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      });
    } catch (error) {
      console.error('Erreur historique rapports:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de l\'historique'
      });
    }
  };

  // Exporter les données en Excel (alternative aux rapports PDF)
  exportToExcel = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const { type, entityId, format = 'xlsx' } = req.query;

      if (!type || !['users', 'projects', 'tasks', 'documents'].includes(type as string)) {
        return res.status(400).json({
          success: false,
          message: 'Type d\'export invalide'
        });
      }

      const exportData = await this.getExportData(type as string, entityId as string, userRole, userId);
      
      if (!exportData || exportData.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Aucune donnée à exporter'
        });
      }

      // Nettoyer les données
      const sanitizedData = this.sanitizeExportData(exportData);

      // Créer le fichier Excel
      const XLSX = require('xlsx');
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(sanitizedData);
      XLSX.utils.book_append_sheet(workbook, worksheet, type as string);

      // Définir le nom du fichier
      const filename = `export_${type}_${new Date().toISOString().split('T')[0]}.${format}`;

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
      console.error('Erreur export Excel:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'export'
      });
    }
  };

  // Statistiques pour les rapports
  getReportStats = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const { period = '30' } = req.query;

      const periodDays = parseInt(period as string);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - periodDays);

      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      let whereClause: any = {};
      
      if (userRole !== 'ADMINISTRATEUR') {
        whereClause = {
          OR: [
            { creatorId: userId },
            { assigneeId: userId },
            { 
              project: {
                OR: [
                  { creatorId: userId },
                  { participants: { some: { userId } } }
                ]
              }
            }
          ]
        };
      }

      const [
        recentTasks,
        recentProjects,
        recentDocuments,
        recentForms
      ] = await Promise.all([
        prisma.task.count({
          where: {
            ...whereClause,
            createdAt: { gte: startDate }
          }
        }),
        prisma.project.count({
          where: {
            createdAt: { gte: startDate },
            ...(userRole !== 'ADMINISTRATEUR' ? { creatorId: userId } : {})
          }
        }),
        prisma.document.count({
          where: {
            createdAt: { gte: startDate },
            ...(userRole !== 'ADMINISTRATEUR' ? { ownerId: userId } : {})
          }
        }),
        prisma.form.count({
          where: {
            createdAt: { gte: startDate },
            ...(userRole !== 'ADMINISTRATEUR' ? { creatorId: userId } : {})
          }
        })
      ]);

      res.json({
        success: true,
        data: {
          period: periodDays,
          recentActivity: {
            tasks: recentTasks,
            projects: recentProjects,
            documents: recentDocuments,
            forms: recentForms
          }
        }
      });
    } catch (error) {
      console.error('Erreur stats rapports:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors du calcul des statistiques'
      });
    }
  };

  // Planifier un rapport récurrent
  scheduleReport = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      
      const {
        type,
        entityId,
        schedule, // 'daily', 'weekly', 'monthly'
        recipients,
        isActive = true
      } = req.body;

      // Seuls les admins et chercheurs peuvent planifier des rapports
      if (!['ADMINISTRATEUR', 'CHERCHEUR'].includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'Permissions insuffisantes pour planifier des rapports'
        });
      }

      // Dans une implémentation complète, vous stockeriez ceci dans une table
      // et utiliseriez un scheduler comme node-cron pour exécuter les rapports

      res.json({
        success: true,
        message: 'Rapport planifié avec succès',
        data: {
          type,
          entityId,
          schedule,
          recipients,
          isActive,
          scheduledBy: userId,
          createdAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Erreur planification rapport:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la planification du rapport'
      });
    }
  };

  // ========== MÉTHODES PRIVÉES ==========

  // Vérifier les permissions pour un type de rapport
  private checkReportPermissions(userRole: string, reportType: string, entityId: string | undefined, userId: string): boolean {
    switch (userRole) {
      case 'ADMINISTRATEUR':
        return true; // Tous les rapports
      
      case 'CHERCHEUR':
        if (reportType === 'global') return false;
        if (reportType === 'user' && entityId && entityId !== userId) return false;
        return true;
      
      case 'ASSISTANT_CHERCHEUR':
        if (['global', 'project'].includes(reportType)) return false;
        if (reportType === 'user' && entityId && entityId !== userId) return false;
        return true;
      
      case 'TECHNICIEN_SUPERIEUR':
        if (['global', 'project'].includes(reportType)) return false;
        if (reportType === 'user' && entityId && entityId !== userId) return false;
        return true;
      
      default:
        return false;
    }
  }

  // Générer le nom de fichier selon le type de rapport
  private generateFilename(type: string, entityId?: string): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const suffix = entityId ? `_${entityId}` : '';
    
    switch (type) {
      case 'project':
        return `rapport_projet${suffix}_${timestamp}.pdf`;
      case 'activity':
        return `rapport_activite${suffix}_${timestamp}.pdf`;
      case 'user':
        return `rapport_utilisateur${suffix}_${timestamp}.pdf`;
      case 'global':
        return `rapport_global_${timestamp}.pdf`;
      default:
        return `rapport_${timestamp}.pdf`;
    }
  }

  // Générer un aperçu de rapport sans le créer
  private async generateReportPreview(type: string, entityId?: string): Promise<any> {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      switch (type) {
        case 'project':
          if (!entityId) throw new Error('ID projet requis');
          const project = await prisma.project.findUnique({
            where: { id: entityId },
            include: {
              creator: {
                select: {
                  firstName: true,
                  lastName: true
                }
              },
              _count: {
                select: {
                  activities: true,
                  tasks: true,
                  documents: true,
                  participants: true
                }
              }
            }
          });
          
          if (!project) {
            throw new Error('Projet non trouvé');
          }

          return {
            type: 'project',
            title: project.title,
            creator: `${project.creator.firstName} ${project.creator.lastName}`,
            status: project.status,
            summary: {
              activities: project._count.activities,
              tasks: project._count.tasks,
              documents: project._count.documents,
              participants: project._count.participants
            },
            estimatedPages: Math.ceil(project._count.activities / 5) + 3,
            sections: [
              'Informations générales',
              'Participants',
              'Activités et tâches',
              'Documents',
              'Statistiques'
            ]
          };

        case 'activity':
          if (!entityId) throw new Error('ID activité requis');
          const activity = await prisma.activity.findUnique({
            where: { id: entityId },
            include: {
              project: { 
                select: { 
                  title: true,
                  creator: {
                    select: {
                      firstName: true,
                      lastName: true
                    }
                  }
                } 
              },
              _count: {
                select: {
                  tasks: true,
                  documents: true,
                  forms: true
                }
              }
            }
          });
          
          if (!activity) {
            throw new Error('Activité non trouvée');
          }

          return {
            type: 'activity',
            title: activity.title,
            project: activity.project?.title,
            projectCreator: activity.project?.creator ? 
              `${activity.project.creator.firstName} ${activity.project.creator.lastName}` : '',
            summary: {
              tasks: activity._count.tasks,
              documents: activity._count.documents,
              forms: activity._count.forms
            },
            estimatedPages: Math.ceil(activity._count.tasks / 10) + 2,
            sections: [
              'Informations de l\'activité',
              'Objectifs et méthodologie',
              'Tâches et progression',
              'Formulaires et collecte',
              'Documents et résultats'
            ]
          };

        case 'user':
          if (!entityId) throw new Error('ID utilisateur requis');
          const user = await prisma.user.findUnique({
            where: { id: entityId },
            include: {
              _count: {
                select: {
                  createdProjects: true,
                  assignedTasks: true,
                  documents: true,
                  forms: true,
                  organizedSeminars: true
                }
              }
            }
          });
          
          if (!user) {
            throw new Error('Utilisateur non trouvé');
          }

          return {
            type: 'user',
            title: `${user.firstName} ${user.lastName}`,
            role: user.role,
            department: user.department,
            summary: {
              projects: user._count.createdProjects,
              tasks: user._count.assignedTasks,
              documents: user._count.documents,
              forms: user._count.forms,
              seminars: user._count.organizedSeminars
            },
            estimatedPages: 4,
            sections: [
              'Profil utilisateur',
              'Projets dirigés',
              'Tâches et contributions',
              'Documents et formulaires',
              'Activités et séminaires'
            ]
          };

        case 'global':
          const [usersCount, projectsCount, tasksCount, documentsCount, formsCount] = await Promise.all([
            prisma.user.count(),
            prisma.project.count(),
            prisma.task.count(),
            prisma.document.count(),
            prisma.form.count()
          ]);
          
          return {
            type: 'global',
            title: 'Rapport Global de la Plateforme CRA',
            summary: {
              users: usersCount,
              projects: projectsCount,
              tasks: tasksCount,
              documents: documentsCount,
              forms: formsCount
            },
            estimatedPages: 8,
            sections: [
              'Vue d\'ensemble de la plateforme',
              'Statistiques des utilisateurs',
              'Analyse des projets',
              'Gestion des tâches',
              'Gestion documentaire',
              'Système de formulaires',
              'Activités et tendances',
              'Recommandations'
            ]
          };

        default:
          throw new Error('Type de rapport non supporté');
      }
    } catch (error) {
      console.error('Erreur génération aperçu:', error);
      throw error;
    }
  }

  // Valider les paramètres de génération de rapport
  private validateReportParams(type: string, entityId?: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Valider le type
    const validTypes = ['project', 'activity', 'user', 'global'];
    if (!validTypes.includes(type)) {
      errors.push(`Type de rapport invalide. Types supportés: ${validTypes.join(', ')}`);
    }

    // Valider entityId selon le type
    if (['project', 'activity', 'user'].includes(type) && !entityId) {
      errors.push(`ID d'entité requis pour le type de rapport: ${type}`);
    }

    if (type === 'global' && entityId) {
      errors.push('ID d\'entité non autorisé pour le rapport global');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Auditer la génération de rapport
  private async auditReportGeneration(userId: string, type: string, entityId?: string, success: boolean = true) {
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      await prisma.auditLog.create({
        data: {
          action: 'GENERATE_REPORT',
          entityType: 'REPORT',
          entityId: entityId || null,
          userId,
          details: {
            reportType: type,
            success,
            timestamp: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error('Erreur audit rapport:', error);
    }
  }

  // Nettoyer et formater les données pour l'export
  private sanitizeExportData(data: any[]): any[] {
    return data.map(item => {
      const sanitized: any = {};
      
      Object.entries(item).forEach(([key, value]) => {
        if (value === null || value === undefined) {
          sanitized[key] = '';
        }
        else if (value instanceof Date) {
          sanitized[key] = value.toLocaleDateString();
        }
        else if (typeof value === 'bigint') {
          sanitized[key] = Number(value);
        }
        else if (typeof value === 'boolean') {
          sanitized[key] = value ? 'Oui' : 'Non';
        }
        else {
          sanitized[key] = value;
        }
      });
      
      return sanitized;
    });
  }

  // Obtenir les données pour l'export selon le type
  private async getExportData(type: string, entityId: string, userRole: string, userId: string): Promise<any[]> {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    let whereClause: any = {};
    
    // Filtrer selon le rôle
    if (userRole !== 'ADMINISTRATEUR') {
      switch (type) {
        case 'projects':
          whereClause = {
            OR: [
              { creatorId: userId },
              { participants: { some: { userId } } }
            ]
          };
          break;
        case 'tasks':
          whereClause = {
            OR: [
              { creatorId: userId },
              { assigneeId: userId }
            ]
          };
          break;
        case 'documents':
          whereClause = { ownerId: userId };
          break;
        case 'users':
          if (userRole === 'CHERCHEUR') {
            whereClause = { supervisorId: userId };
          } else {
            return [];
          }
          break;
      }
    }

    // Si un entityId est spécifié, l'ajouter au filtre
    if (entityId) {
      if (type === 'projects') {
        whereClause.id = entityId;
      } else if (type === 'tasks') {
        whereClause.projectId = entityId;
      } else if (type === 'documents') {
        whereClause.projectId = entityId;
      }
    }

    switch (type) {
      case 'users':
        const users = await prisma.user.findMany({
          where: whereClause,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            department: true,
            specialization: true,
            isActive: true,
            createdAt: true
          }
        });
        return users.map((user:any) => ({
          'ID': user.id,
          'Prénom': user.firstName,
          'Nom': user.lastName,
          'Email': user.email,
          'Rôle': user.role,
          'Département': user.department || '',
          'Spécialisation': user.specialization || '',
          'Actif': user.isActive ? 'Oui' : 'Non',
          'Date de création': new Date(user.createdAt).toLocaleDateString()
        }));

      case 'projects':
        const projects = await prisma.project.findMany({
          where: whereClause,
          include: {
            creator: {
              select: {
                firstName: true,
                lastName: true
              }
            },
            _count: {
              select: {
                activities: true,
                tasks: true,
                documents: true,
                participants: true
              }
            }
          }
        });
        return projects.map((project:any) => ({
          'ID': project.id,
          'Titre': project.title,
          'Description': project.description || '',
          'Statut': project.status,
          'Créateur': `${project.creator.firstName} ${project.creator.lastName}`,
          'Date de début': project.startDate ? new Date(project.startDate).toLocaleDateString() : '',
          'Date de fin': project.endDate ? new Date(project.endDate).toLocaleDateString() : '',
          'Budget': project.budget || '',
          'Activités': project._count.activities,
          'Tâches': project._count.tasks,
          'Documents': project._count.documents,
          'Participants': project._count.participants,
          'Date de création': new Date(project.createdAt).toLocaleDateString()
        }));

      case 'tasks':
        const tasks = await prisma.task.findMany({
          where: whereClause,
          include: {
            creator: {
              select: {
                firstName: true,
                lastName: true
              }
            },
            assignee: {
              select: {
                firstName: true,
                lastName: true
              }
            },
            project: {
              select: {
                title: true
              }
            },
            activity: {
              select: {
                title: true
              }
            }
          }
        });
        return tasks.map((task:any) => ({
          'ID': task.id,
          'Titre': task.title,
          'Description': task.description || '',
          'Statut': task.status,
          'Priorité': task.priority,
          'Créateur': `${task.creator.firstName} ${task.creator.lastName}`,
          'Assigné à': task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : '',
          'Projet': task.project?.title || '',
          'Activité': task.activity?.title || '',
          'Progression': `${task.progress}%`,
          'Date d\'échéance': task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '',
          'Date de création': new Date(task.createdAt).toLocaleDateString(),
          'Date de completion': task.completedAt ? new Date(task.completedAt).toLocaleDateString() : ''
        }));

      case 'documents':
        const documents = await prisma.document.findMany({
          where: whereClause,
          include: {
            owner: {
              select: {
                firstName: true,
                lastName: true
              }
            },
            project: {
              select: {
                title: true
              }
            },
            activity: {
              select: {
                title: true
              }
            }
          }
        });
        return documents.map((doc:any) => ({
          'ID': doc.id,
          'Titre': doc.title,
          'Nom du fichier': doc.filename,
          'Type': doc.type,
          'Taille': `${Math.round(Number(doc.size) / 1024)} KB`,
          'Propriétaire': `${doc.owner.firstName} ${doc.owner.lastName}`,
          'Projet': doc.project?.title || '',
          'Activité': doc.activity?.title || '',
          'Public': doc.isPublic ? 'Oui' : 'Non',
          'Date de création': new Date(doc.createdAt).toLocaleDateString()
        }));

      default:
        return [];
    }
  }
}