// src/services/report.service.ts - Version corrigée
import { PrismaClient } from '@prisma/client';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

export interface ReportOptions {
  type: 'project' | 'activity' | 'user' | 'global';
  entityId?: string;
  userId: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  includeGraphics?: boolean;
  language?: 'fr' | 'en';
}

export class ReportService {
  private readonly templatesPath = path.join(__dirname, '../templates/reports');

  constructor() {
    // Créer le dossier des templates s'il n'existe pas
    if (!fs.existsSync(this.templatesPath)) {
      fs.mkdirSync(this.templatesPath, { recursive: true });
    }
  }

  // Générer un rapport PDF
  async generateReport(options: ReportOptions): Promise<Buffer> {
    try {
      console.log(`📊 Début génération rapport ${options.type} pour entityId: ${options.entityId}`);
      switch (options.type) {
        case 'project':
          return await this.generateProjectReport(options);
        case 'activity':
          return await this.generateActivityReport(options);
        case 'user':
          return await this.generateUserReport(options);
        case 'global':
          return await this.generateGlobalReport(options);
        default:
          throw new Error('Type de rapport non supporté');
      }
    } catch (error) {
      console.error('❌ Erreur génération rapport:', error);
      throw error;
    }
  }


  // Rapport de projet
  private async generateProjectReport(options: ReportOptions): Promise<Buffer> {
    if (!options.entityId) {
      throw new Error('ID du projet requis');
    }

    const project = await prisma.project.findUnique({
      where: { id: options.entityId },
      include: {
        creator: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        participants: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                role: true
              }
            }
          }
        },
        activities: {
          include: {
            tasks: {
              select: {
                id: true,
                title: true,
                status: true,
                priority: true,
                createdAt: true,
                completedAt: true
              }
            },
            forms: {
              select: {
                id: true,
                title: true,
                _count: {
                  select: {
                    responses: true
                  }
                }
              }
            },
            documents: {
              select: {
                id: true,
                title: true,
                type: true,
                createdAt: true
              }
            }
          }
        },
        documents: {
          select: {
            id: true,
            title: true,
            type: true,
            createdAt: true
          }
        }
      }
    });

    if (!project) {
      throw new Error('Projet non trouvé');
    }

    const doc = new PDFDocument({
      margins: { top: 50, bottom: 70, left: 50, right: 50 }, // Plus de marge en bas pour le footer
      bufferPages: true // Important pour pouvoir ajouter des footers
    });

    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));

    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        console.log(`✅ Rapport projet généré: ${Buffer.concat(buffers).length} bytes`);
        resolve(Buffer.concat(buffers));
      });

      doc.on('error', (error) => {
        console.error('❌ Erreur PDFKit projet:', error);
        reject(error);
      });

      try {
        // En-tête
        this.addReportHeader(doc, 'Rapport de Projet');
        
        // Informations du projet
        doc.fontSize(18).text(`Projet: ${project.title}`, 50, 120);
        doc.fontSize(12).text(`Statut: ${project.status}`, 50, 150);
        doc.text(`Créateur: ${project.creator.firstName} ${project.creator.lastName}`, 50, 170);
        doc.text(`Email: ${project.creator.email}`, 50, 190);
        
        if (project.description) {
          doc.text(`Description: ${project.description}`, 50, 220);
        }

        if (project.startDate) {
          doc.text(`Date de début: ${new Date(project.startDate).toLocaleDateString()}`, 50, 250);
        }

        if (project.endDate) {
          doc.text(`Date de fin: ${new Date(project.endDate).toLocaleDateString()}`, 50, 270);
        }

        // Participants
        let yPosition = 310;
        doc.fontSize(16).text('Participants:', 50, yPosition);
        yPosition += 25;

        project.participants.forEach((participant: any, index: number) => {
          doc.fontSize(10).text(
            `${index + 1}. ${participant.user.firstName} ${participant.user.lastName} (${participant.user.role}) - ${participant.role}`,
            60, yPosition
          );
          yPosition += 15;
        });

        // Activités
        yPosition += 20;
        doc.fontSize(16).text('Activités:', 50, yPosition);
        yPosition += 25;

        project.activities.forEach((activity: any, index: number) => {
          if (yPosition > 650) { // Laisser plus de place pour le footer
            doc.addPage();
            yPosition = 50;
          }

          doc.fontSize(12).text(`${index + 1}. ${activity.title}`, 60, yPosition);
          yPosition += 20;

          // Tâches de l'activité
          if (activity.tasks.length > 0) {
            doc.fontSize(10).text(`Tâches (${activity.tasks.length}):`, 80, yPosition);
            yPosition += 15;

            activity.tasks.forEach((task: any, taskIndex: number) => {
              if (yPosition > 650) {
                doc.addPage();
                yPosition = 50;
              }
              doc.text(`   ${taskIndex + 1}. ${task.title} - ${task.status}`, 90, yPosition);
              yPosition += 12;
            });
          }

          // Formulaires
          if (activity.forms.length > 0) {
            doc.fontSize(10).text(`Formulaires (${activity.forms.length}):`, 80, yPosition);
            yPosition += 15;

            activity.forms.forEach((form: any, formIndex: number) => {
              if (yPosition > 650) {
                doc.addPage();
                yPosition = 50;
              }
              doc.text(`   ${formIndex + 1}. ${form.title} - ${form._count.responses} réponses`, 90, yPosition);
              yPosition += 12;
            });
          }

          yPosition += 10;
        });

        // Statistiques
        yPosition += 20;
        if (yPosition > 550) {
          doc.addPage();
          yPosition = 50;
        }

        doc.fontSize(16).text('Statistiques:', 50, yPosition);
        yPosition += 25;

        const totalTasks = project.activities.reduce((sum: number, activity: any) => sum + activity.tasks.length, 0);
        const completedTasks = project.activities.reduce((sum: number, activity: any) =>
          sum + activity.tasks.filter((t: any) => t.status === 'TERMINEE').length, 0
        );
        const totalForms = project.activities.reduce((sum: number, activity: any) => sum + activity.forms.length, 0);
        const totalDocuments = project.documents.length +
          project.activities.reduce((sum: number, activity: any) => sum + activity.documents.length, 0);

        doc.fontSize(12).text(`Nombre total de tâches: ${totalTasks}`, 60, yPosition);
        yPosition += 20;
        doc.text(`Tâches terminées: ${completedTasks}`, 60, yPosition);
        yPosition += 20;
        doc.text(`Taux de completion: ${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%`, 60, yPosition);
        yPosition += 20;
        doc.text(`Nombre de formulaires: ${totalForms}`, 60, yPosition);
        yPosition += 20;
        doc.text(`Nombre de documents: ${totalDocuments}`, 60, yPosition);

        // Pied de page
        this.addReportFooter(doc, 'Rapport de Projet', project.title);

        doc.end();
      } catch (error) {
        console.error('❌ Erreur lors de la génération du rapport projet:', error);
        reject(error);
      }
    });
  }

  // Rapport d'activité
  private async generateActivityReport(options: ReportOptions): Promise<Buffer> {
    if (!options.entityId) {
      throw new Error('ID de l\'activité requis');
    }

    const activity = await prisma.activity.findUnique({
      where: { id: options.entityId },
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
        tasks: {
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
            }
          }
        },
        forms: {
          include: {
            creator: {
              select: {
                firstName: true,
                lastName: true
              }
            },
            responses: {
              select: {
                id: true,
                submittedAt: true,
                respondent: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        },
        documents: {
          select: {
            title: true,
            type: true,
            createdAt: true,
            owner: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    if (!activity) {
      throw new Error('Activité non trouvée');
    }

    const doc = new PDFDocument({
      margins: { top: 50, bottom: 70, left: 50, right: 50 },
      bufferPages: true
    });

    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));

    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        console.log(`✅ Rapport activité généré: ${Buffer.concat(buffers).length} bytes`);
        resolve(Buffer.concat(buffers));
      });

      doc.on('error', (error) => {
        console.error('❌ Erreur PDFKit activité:', error);
        reject(error);
      });

      try {
        // En-tête
        this.addReportHeader(doc, 'Rapport d\'Activité');
        
        // Informations de l'activité
        doc.fontSize(18).text(`Activité: ${activity.title}`, 50, 120);
        doc.fontSize(12).text(`Projet: ${activity.project.title}`, 50, 150);
        doc.text(`Responsable projet: ${activity.project.creator.firstName} ${activity.project.creator.lastName}`, 50, 170);
        
        if (activity.description) {
          doc.text(`Description: ${activity.description}`, 50, 200);
        }

        if (activity.methodology) {
          doc.text(`Méthodologie: ${activity.methodology}`, 50, 230);
        }

        if (activity.location) {
          doc.text(`Lieu: ${activity.location}`, 50, 260);
        }

        let yPosition = 300;

        // Objectifs
        if (activity.objectives && activity.objectives.length > 0) {
          doc.fontSize(16).text('Objectifs:', 50, yPosition);
          yPosition += 25;

          activity.objectives.forEach((objective: any, index: number) => {
            if (yPosition > 650) {
              doc.addPage();
              yPosition = 50;
            }
            doc.fontSize(10).text(`${index + 1}. ${objective}`, 60, yPosition);
            yPosition += 15;
          });
          yPosition += 10;
        }

        // Tâches
        if (activity.tasks.length > 0) {
          if (yPosition > 600) {
            doc.addPage();
            yPosition = 50;
          }

          doc.fontSize(16).text('Tâches:', 50, yPosition);
          yPosition += 25;

          activity.tasks.forEach((task: any, index: number) => {
            if (yPosition > 650) {
              doc.addPage();
              yPosition = 50;
            }

            doc.fontSize(12).text(`${index + 1}. ${task.title}`, 60, yPosition);
            yPosition += 15;
            doc.fontSize(10).text(`   Statut: ${task.status} | Priorité: ${task.priority}`, 70, yPosition);
            yPosition += 12;
            doc.text(`   Créateur: ${task.creator.firstName} ${task.creator.lastName}`, 70, yPosition);
            yPosition += 12;
            
            if (task.assignee) {
              doc.text(`   Assigné à: ${task.assignee.firstName} ${task.assignee.lastName}`, 70, yPosition);
              yPosition += 12;
            }

            if (task.dueDate) {
              doc.text(`   Échéance: ${new Date(task.dueDate).toLocaleDateString()}`, 70, yPosition);
              yPosition += 12;
            }

            yPosition += 10;
          });
        }

        // Formulaires et données collectées
        if (activity.forms.length > 0) {
          if (yPosition > 500) {
            doc.addPage();
            yPosition = 50;
          }

          doc.fontSize(16).text('Formulaires de collecte:', 50, yPosition);
          yPosition += 25;

          activity.forms.forEach((form: any, index: number) => {
            if (yPosition > 650) {
              doc.addPage();
              yPosition = 50;
            }

            doc.fontSize(12).text(`${index + 1}. ${form.title}`, 60, yPosition);
            yPosition += 15;
            doc.fontSize(10).text(`   Créateur: ${form.creator.firstName} ${form.creator.lastName}`, 70, yPosition);
            yPosition += 12;
            doc.text(`   Réponses collectées: ${form.responses.length}`, 70, yPosition);
            yPosition += 12;

            if (form.responses.length > 0) {
              const lastResponse = form.responses[form.responses.length - 1];
              doc.text(`   Dernière réponse: ${new Date(lastResponse.submittedAt).toLocaleDateString()}`, 70, yPosition);
              yPosition += 12;
            }

            yPosition += 10;
          });
        }

        // Documents
        if (activity.documents.length > 0) {
          if (yPosition > 500) {
            doc.addPage();
            yPosition = 50;
          }

          doc.fontSize(16).text('Documents:', 50, yPosition);
          yPosition += 25;

          activity.documents.forEach((document: any, index: number) => {
            if (yPosition > 650) {
              doc.addPage();
              yPosition = 50;
            }

            doc.fontSize(12).text(`${index + 1}. ${document.title}`, 60, yPosition);
            yPosition += 15;
            doc.fontSize(10).text(`   Type: ${document.type}`, 70, yPosition);
            yPosition += 12;
            doc.text(`   Propriétaire: ${document.owner.firstName} ${document.owner.lastName}`, 70, yPosition);
            yPosition += 12;
            doc.text(`   Date: ${new Date(document.createdAt).toLocaleDateString()}`, 70, yPosition);
            yPosition += 15;
          });
        }

        // Résultats et conclusions
        if (activity.results || activity.conclusions) {
          if (yPosition > 500) {
            doc.addPage();
            yPosition = 50;
          }

          doc.fontSize(16).text('Résultats et Conclusions:', 50, yPosition);
          yPosition += 25;

          if (activity.results) {
            doc.fontSize(12).text('Résultats:', 60, yPosition);
            yPosition += 15;
            doc.fontSize(10).text(activity.results, 70, yPosition, { width: 450 });
            yPosition += 30;
          }

          if (activity.conclusions) {
            doc.fontSize(12).text('Conclusions:', 60, yPosition);
            yPosition += 15;
            doc.fontSize(10).text(activity.conclusions, 70, yPosition, { width: 450 });
            yPosition += 30;
          }
        }

        // Pied de page
        this.addReportFooter(doc, 'Rapport d\'Activité', activity.title);

        doc.end();
      } catch (error) {
        console.error('❌ Erreur lors de la génération du rapport activité:', error);
        reject(error);
      }
    });
  }

  // Rapport utilisateur
  private async generateUserReport(options: ReportOptions): Promise<Buffer> {
    if (!options.entityId) {
      throw new Error('ID de l\'utilisateur requis');
    }

    const user = await prisma.user.findUnique({
      where: { id: options.entityId },
      include: {
        createdProjects: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
            _count: {
              select: {
                activities: true,
                tasks: true,
                documents: true
              }
            }
          }
        },
        assignedTasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            createdAt: true,
            completedAt: true,
            project: {
              select: {
                title: true
              }
            }
          }
        },
        documents: {
          select: {
            id: true,
            title: true,
            type: true,
            createdAt: true
          }
        },
        forms: {
          select: {
            id: true,
            title: true,
            createdAt: true,
            _count: {
              select: {
                responses: true
              }
            }
          }
        },
        organizedSeminars: {
          select: {
            id: true,
            title: true,
            startDate: true,
            status: true,
            _count: {
              select: {
                participants: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    const doc = new PDFDocument({
      margins: { top: 50, bottom: 70, left: 50, right: 50 },
      bufferPages: true
    });

    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));

    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        console.log(`✅ Rapport utilisateur généré: ${Buffer.concat(buffers).length} bytes`);
        resolve(Buffer.concat(buffers));
      });

      doc.on('error', (error) => {
        console.error('❌ Erreur PDFKit utilisateur:', error);
        reject(error);
      });

      try {
        // En-tête
        this.addReportHeader(doc, 'Rapport d\'Activité Utilisateur');
        
        // Informations utilisateur
        doc.fontSize(18).text(`${user.firstName} ${user.lastName}`, 50, 120);
        doc.fontSize(12).text(`Email: ${user.email}`, 50, 150);
        doc.text(`Rôle: ${user.role}`, 50, 170);
        doc.text(`Département: ${user.department || 'Non spécifié'}`, 50, 190);
        doc.text(`Spécialisation: ${user.specialization || 'Non spécifiée'}`, 50, 210);

        let yPosition = 260;

        // Projets créés (pour chercheurs)
        if (user.createdProjects.length > 0) {
          doc.fontSize(16).text('Projets dirigés:', 50, yPosition);
          yPosition += 25;

          user.createdProjects.forEach((project: any, index: number) => {
            if (yPosition > 650) {
              doc.addPage();
              yPosition = 50;
            }

            doc.fontSize(12).text(`${index + 1}. ${project.title}`, 60, yPosition);
            yPosition += 15;
            doc.fontSize(10).text(`   Statut: ${project.status}`, 70, yPosition);
            yPosition += 12;
            doc.text(`   Créé le: ${new Date(project.createdAt).toLocaleDateString()}`, 70, yPosition);
            yPosition += 12;
            doc.text(`   Activités: ${project._count.activities} | Tâches: ${project._count.tasks} | Documents: ${project._count.documents}`, 70, yPosition);
            yPosition += 20;
          });
        }

        // Tâches assignées
        if (user.assignedTasks.length > 0) {
          if (yPosition > 500) {
            doc.addPage();
            yPosition = 50;
          }

          doc.fontSize(16).text('Tâches assignées:', 50, yPosition);
          yPosition += 25;

          const tasksByStatus = user.assignedTasks.reduce((acc: any, task: any) => {
            acc[task.status] = (acc[task.status] || 0) + 1;
            return acc;
          }, {} as any);

          doc.fontSize(12).text('Répartition par statut:', 60, yPosition);
          yPosition += 15;

          Object.entries(tasksByStatus).forEach(([status, count]) => {
            doc.fontSize(10).text(`   ${status}: ${count}`, 70, yPosition);
            yPosition += 12;
          });

          yPosition += 10;

          // Tâches récentes
          const recentTasks = user.assignedTasks.slice(0, 10);
          doc.fontSize(12).text('Tâches récentes:', 60, yPosition);
          yPosition += 15;

          recentTasks.forEach((task: any, index: number) => {
            if (yPosition > 650) {
              doc.addPage();
              yPosition = 50;
            }

            doc.fontSize(10).text(`${index + 1}. ${task.title}`, 70, yPosition);
            yPosition += 12;
            doc.text(`   Projet: ${task.project?.title || 'Non spécifié'}`, 80, yPosition);
            yPosition += 10;
            doc.text(`   Statut: ${task.status} | Priorité: ${task.priority}`, 80, yPosition);
            yPosition += 15;
          });
        }

        // Formulaires créés (pour techniciens)
        if (user.forms.length > 0) {
          if (yPosition > 500) {
            doc.addPage();
            yPosition = 50;
          }

          doc.fontSize(16).text('Formulaires créés:', 50, yPosition);
          yPosition += 25;

          user.forms.forEach((form: any, index: number) => {
            if (yPosition > 650) {
              doc.addPage();
              yPosition = 50;
            }

            doc.fontSize(12).text(`${index + 1}. ${form.title}`, 60, yPosition);
            yPosition += 15;
            doc.fontSize(10).text(`   Créé le: ${new Date(form.createdAt).toLocaleDateString()}`, 70, yPosition);
            yPosition += 12;
            doc.text(`   Réponses: ${form._count.responses}`, 70, yPosition);
            yPosition += 15;
          });
        }

        // Séminaires organisés
        if (user.organizedSeminars.length > 0) {
          if (yPosition > 500) {
            doc.addPage();
            yPosition = 50;
          }

          doc.fontSize(16).text('Séminaires organisés:', 50, yPosition);
          yPosition += 25;

          user.organizedSeminars.forEach((seminar: any, index: number) => {
            if (yPosition > 650) {
              doc.addPage();
              yPosition = 50;
            }

            doc.fontSize(12).text(`${index + 1}. ${seminar.title}`, 60, yPosition);
            yPosition += 15;
            doc.fontSize(10).text(`   Date: ${new Date(seminar.startDate).toLocaleDateString()}`, 70, yPosition);
            yPosition += 12;
            doc.text(`   Statut: ${seminar.status}`, 70, yPosition);
            yPosition += 12;
            doc.text(`   Participants: ${seminar._count.participants}`, 70, yPosition);
            yPosition += 15;
          });
        }

        // Documents
        if (user.documents.length > 0) {
          if (yPosition > 500) {
            doc.addPage();
            yPosition = 50;
          }

          doc.fontSize(16).text('Documents créés:', 50, yPosition);
          yPosition += 25;

          const documentsByType = user.documents.reduce((acc: any, doc: any) => {
            acc[doc.type] = (acc[doc.type] || 0) + 1;
            return acc;
          }, {} as any);

          doc.fontSize(12).text('Répartition par type:', 60, yPosition);
          yPosition += 15;

          Object.entries(documentsByType).forEach(([type, count]) => {
            doc.fontSize(10).text(`   ${type}: ${count}`, 70, yPosition);
            yPosition += 12;
          });

          yPosition += 10;
          doc.fontSize(12).text(`Total: ${user.documents.length} documents`, 60, yPosition);
        }

        // Pied de page
        this.addReportFooter(doc, 'Rapport Utilisateur', `${user.firstName} ${user.lastName}`);

        doc.end();
      } catch (error) {
        console.error('❌ Erreur lors de la génération du rapport utilisateur:', error);
        reject(error);
      }
    });
  }

  // Rapport global
  private async generateGlobalReport(_options: ReportOptions): Promise<Buffer> {
    const [
      usersStats,
      projectsStats,
      tasksStats,
      documentsStats,
      formsStats,
      seminarsStats
    ] = await Promise.all([
      prisma.user.groupBy({
        by: ['role'],
        _count: true
      }),
      prisma.project.groupBy({
        by: ['status'],
        _count: true
      }),
      prisma.task.groupBy({
        by: ['status'],
        _count: true
      }),
      prisma.document.groupBy({
        by: ['type'],
        _count: true
      }),
      prisma.form.count(),
      prisma.seminar.groupBy({
        by: ['status'],
        _count: true
      })
    ]);

    const doc = new PDFDocument({
      margins: { top: 50, bottom: 70, left: 50, right: 50 },
      bufferPages: true
    });

    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));

    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        console.log(`✅ Rapport global généré: ${Buffer.concat(buffers).length} bytes`);
        resolve(Buffer.concat(buffers));
      });

      doc.on('error', (error) => {
        console.error('❌ Erreur PDFKit global:', error);
        reject(error);
      });

      try {
        // En-tête
        this.addReportHeader(doc, 'Rapport Global de la Plateforme');
        
        let yPosition = 120;

        // Statistiques utilisateurs
        doc.fontSize(18).text('Statistiques des Utilisateurs', 50, yPosition);
        yPosition += 30;

        const totalUsers = usersStats.reduce((sum: number, stat: any) => sum + stat._count, 0);
        doc.fontSize(12).text(`Total utilisateurs: ${totalUsers}`, 60, yPosition);
        yPosition += 20;

        usersStats.forEach((stat: any) => {
          doc.fontSize(10).text(`${stat.role}: ${stat._count}`, 70, yPosition);
          yPosition += 15;
        });

        yPosition += 20;

        // Statistiques projets
        doc.fontSize(18).text('Statistiques des Projets', 50, yPosition);
        yPosition += 30;

        const totalProjects = projectsStats.reduce((sum: number, stat: any) => sum + stat._count, 0);
        doc.fontSize(12).text(`Total projets: ${totalProjects}`, 60, yPosition);
        yPosition += 20;

        projectsStats.forEach((stat: any) => {
          doc.fontSize(10).text(`${stat.status}: ${stat._count}`, 70, yPosition);
          yPosition += 15;
        });

        yPosition += 20;

        // Statistiques tâches
        doc.fontSize(18).text('Statistiques des Tâches', 50, yPosition);
        yPosition += 30;

        const totalTasks = tasksStats.reduce((sum: number, stat: any) => sum + stat._count, 0);
        doc.fontSize(12).text(`Total tâches: ${totalTasks}`, 60, yPosition);
        yPosition += 20;

        tasksStats.forEach((stat: any) => {
          doc.fontSize(10).text(`${stat.status}: ${stat._count}`, 70, yPosition);
          yPosition += 15;
        });

        yPosition += 20;

        // Nouvelle page si nécessaire
        if (yPosition > 550) {
          doc.addPage();
          yPosition = 50;
        }

        // Statistiques documents
        doc.fontSize(18).text('Statistiques des Documents', 50, yPosition);
        yPosition += 30;

        const totalDocuments = documentsStats.reduce((sum: number, stat: any) => sum + stat._count, 0);
        doc.fontSize(12).text(`Total documents: ${totalDocuments}`, 60, yPosition);
        yPosition += 20;

        documentsStats.forEach((stat: any) => {
          doc.fontSize(10).text(`${stat.type}: ${stat._count}`, 70, yPosition);
          yPosition += 15;
        });

        yPosition += 20;

        // Statistiques formulaires
        doc.fontSize(18).text('Statistiques des Formulaires', 50, yPosition);
        yPosition += 30;

        doc.fontSize(12).text(`Total formulaires: ${formsStats}`, 60, yPosition);
        yPosition += 40;

        // Statistiques séminaires
        doc.fontSize(18).text('Statistiques des Séminaires', 50, yPosition);
        yPosition += 30;

        const totalSeminars = seminarsStats.reduce((sum: number, stat: any) => sum + stat._count, 0);
        doc.fontSize(12).text(`Total séminaires: ${totalSeminars}`, 60, yPosition);
        yPosition += 20;

        seminarsStats.forEach((stat: any) => {
          doc.fontSize(10).text(`${stat.status}: ${stat._count}`, 70, yPosition);
          yPosition += 15;
        });

        // Pied de page
        this.addReportFooter(doc, 'Rapport Global', 'Plateforme CRA');

        doc.end();
      } catch (error) {
        console.error('❌ Erreur lors de la génération du rapport global:', error);
        reject(error);
      }
    });
  }

  // Méthodes utilitaires CORRIGÉES
  private addReportHeader(doc: PDFKit.PDFDocument, title: string) {
    try {
      // Logo ou en-tête
      doc.fontSize(20).text('Centre de Recherches Agricoles - Saint-Louis', 50, 30);
      doc.fontSize(16).text(title, 50, 60);
      doc.fontSize(10).text(`Généré le: ${new Date().toLocaleDateString()}`, 50, 85);
      
      // Ligne de séparation
      doc.moveTo(50, 100).lineTo(550, 100).stroke();
    } catch (error) {
      console.error('❌ Erreur dans addReportHeader:', error);
    }
  }

  private addReportFooter(doc: PDFKit.PDFDocument, reportType: string = '', entityTitle: string = '') {
    try {
      const pages = doc.bufferedPageRange();
      console.log(`📄 Ajout footer sur ${pages.count} page(s)`);
      
      // S'assurer qu'il y a au moins une page
      if (pages.count === 0) {
        console.log('⚠️ Aucune page trouvée, création d\'une page');
        doc.addPage();
        return;
      }
      
      // Parcourir toutes les pages pour ajouter le footer
      for (let i = 0; i < pages.count; i++) {
        try {
          // Aller à la page i (index basé sur 0)
          doc.switchToPage(i);
          
          // Ligne de séparation
          doc.strokeColor('#e5e7eb')
             .lineWidth(0.5)
             .moveTo(50, 730)
             .lineTo(550, 730)
             .stroke();
          
          // Pied de page
          doc.fontSize(8)
             .fillColor('#6b7280')
             .text(
               `${reportType}${entityTitle ? ` - ${entityTitle}` : ''}`,
               50,
               740,
               { align: 'left', width: 300 }
             )
             .text(
               `Page ${i + 1} sur ${pages.count}`,
               350,
               740,
               { align: 'center', width: 100 }
             )
             .text(
               `CRA Saint-Louis - ${new Date().toLocaleDateString('fr-FR')}`,
               450,
               740,
               { align: 'right', width: 100 }
             );
        } catch (pageError) {
          console.error(`❌ Erreur ajout footer page ${i + 1}:`, pageError);
        }
      }
      
      // Retourner à la première page
      if (pages.count > 0) {
        doc.switchToPage(0);
      }
      
    } catch (error) {
      console.error('❌ Erreur dans addReportFooter:', error);
      // Ne pas faire échouer le rapport pour un problème de footer
    }
  }

  // Obtenir les templates disponibles
  async getAvailableTemplates(): Promise<any[]> {
    return [
      {
        id: 'project_report',
        name: 'Rapport de Projet',
        description: 'Rapport détaillé d\'un projet avec activités, tâches et documents',
        type: 'project'
      },
      {
        id: 'activity_report',
        name: 'Rapport d\'Activité',
        description: 'Rapport détaillé d\'une activité avec formulaires et résultats',
        type: 'activity'
      },
      {
        id: 'user_report',
        name: 'Rapport d\'Utilisateur',
        description: 'Rapport d\'activité d\'un utilisateur avec ses projets, tâches et contributions',
        type: 'user'
      },
      {
        id: 'global_report',
        name: 'Rapport Global',
        description: 'Rapport global de la plateforme avec toutes les statistiques',
        type: 'global'
      }
    ];
  }
}