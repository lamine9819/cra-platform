// controllers/formation.controller.ts
import { Response } from 'express';
import { FormationService } from '../services/formation.service';
import { FormationReportService } from '../utils/formation-report.service';
import {
  createShortTrainingReceivedSchema,
  createDiplomaticTrainingReceivedSchema,
  createTrainingGivenSchema,
  createSupervisionSchema
} from '../types/formation.types';
import { AuthenticatedRequest } from '../types/auth.types';
import { z } from 'zod';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel } from 'docx';

export class FormationController {
  private formationService: FormationService;
  private reportService: FormationReportService;

  constructor() {
    this.formationService = new FormationService();
    this.reportService = new FormationReportService();
  }

  // ============= FORMATIONS COURTES REÇUES =============
  
  createShortTrainingReceived = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user.userId;
      if (!userId) {
        res.status(401).json({ error: 'Utilisateur non authentifié' });
        return;
      }

      const validatedData = createShortTrainingReceivedSchema.parse(req.body);
      const training = await this.formationService.createShortTrainingReceived(userId, validatedData);

      res.status(201).json({
        success: true,
        data: training,
        message: 'Formation courte reçue créée avec succès'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Données invalides',
          details: error.issues
        });
      } else {
        console.error('Erreur lors de la création de la formation courte reçue:', error);
        res.status(500).json({
          error: 'Erreur interne du serveur',
          message: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
    }
  };

  getUserShortTrainingsReceived = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user.userId;
      if (!userId) {
        res.status(401).json({ error: 'Utilisateur non authentifié' });
        return;
      }

      const trainings = await this.formationService.getUserShortTrainingsReceived(userId);

      res.status(200).json({
        success: true,
        data: trainings,
        count: trainings.length
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des formations courtes reçues:', error);
      res.status(500).json({
        error: 'Erreur interne du serveur',
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  };

  updateShortTrainingReceived = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user.userId;
      const { trainingId } = req.params;

      if (!userId) {
        res.status(401).json({ error: 'Utilisateur non authentifié' });
        return;
      }

      const validatedData = createShortTrainingReceivedSchema.partial().parse(req.body);
      const training = await this.formationService.updateShortTrainingReceived(trainingId, userId, validatedData);

      res.status(200).json({
        success: true,
        data: training,
        message: 'Formation courte reçue modifiée avec succès'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Données invalides',
          details: error.issues
        });
      } else {
        console.error('Erreur lors de la modification de la formation courte reçue:', error);
        res.status(500).json({
          error: 'Erreur interne du serveur',
          message: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
    }
  };

  deleteShortTrainingReceived = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user.userId;
      const { trainingId } = req.params;

      if (!userId) {
        res.status(401).json({ error: 'Utilisateur non authentifié' });
        return;
      }

      await this.formationService.deleteShortTrainingReceived(trainingId, userId);

      res.status(200).json({
        success: true,
        message: 'Formation courte reçue supprimée avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de la formation courte reçue:', error);
      res.status(500).json({
        error: 'Erreur interne du serveur',
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  };

  // ============= FORMATIONS DIPLÔMANTES REÇUES =============
  
  createDiplomaticTrainingReceived = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user.userId;
      if (!userId) {
        res.status(401).json({ error: 'Utilisateur non authentifié' });
        return;
      }

      const validatedData = createDiplomaticTrainingReceivedSchema.parse(req.body);
      const training = await this.formationService.createDiplomaticTrainingReceived(userId, validatedData);

      res.status(201).json({
        success: true,
        data: training,
        message: 'Formation diplômante reçue créée avec succès'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Données invalides',
          details: error.issues
        });
      } else {
        console.error('Erreur lors de la création de la formation diplômante reçue:', error);
        res.status(500).json({
          error: 'Erreur interne du serveur',
          message: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
    }
  };

  getUserDiplomaticTrainingsReceived = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user.userId;
      if (!userId) {
        res.status(401).json({ error: 'Utilisateur non authentifié' });
        return;
      }

      const trainings = await this.formationService.getUserDiplomaticTrainingsReceived(userId);

      res.status(200).json({
        success: true,
        data: trainings,
        count: trainings.length
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des formations diplômantes reçues:', error);
      res.status(500).json({
        error: 'Erreur interne du serveur',
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  };

  updateDiplomaticTrainingReceived = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user.userId;
      const { trainingId } = req.params;

      if (!userId) {
        res.status(401).json({ error: 'Utilisateur non authentifié' });
        return;
      }

      const validatedData = createDiplomaticTrainingReceivedSchema.partial().parse(req.body);
      const training = await this.formationService.updateDiplomaticTrainingReceived(trainingId, userId, validatedData);

      res.status(200).json({
        success: true,
        data: training,
        message: 'Formation diplômante reçue modifiée avec succès'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Données invalides',
          details: error.issues
        });
      } else {
        console.error('Erreur lors de la modification de la formation diplômante reçue:', error);
        res.status(500).json({
          error: 'Erreur interne du serveur',
          message: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
    }
  };

  deleteDiplomaticTrainingReceived = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user.userId;
      const { trainingId } = req.params;

      if (!userId) {
        res.status(401).json({ error: 'Utilisateur non authentifié' });
        return;
      }

      await this.formationService.deleteDiplomaticTrainingReceived(trainingId, userId);

      res.status(200).json({
        success: true,
        message: 'Formation diplômante reçue supprimée avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de la formation diplômante reçue:', error);
      res.status(500).json({
        error: 'Erreur interne du serveur',
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  };

  // ============= FORMATIONS DISPENSÉES =============
  
  createTrainingGiven = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user.userId;
      if (!userId) {
        res.status(401).json({ error: 'Utilisateur non authentifié' });
        return;
      }

      const validatedData = createTrainingGivenSchema.parse(req.body);
      const training = await this.formationService.createTrainingGiven(userId, validatedData);

      res.status(201).json({
        success: true,
        data: training,
        message: 'Formation dispensée créée avec succès'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Données invalides',
          details: error.issues
        });
      } else {
        console.error('Erreur lors de la création de la formation dispensée:', error);
        res.status(500).json({
          error: 'Erreur interne du serveur',
          message: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
    }
  };

  getUserTrainingsGiven = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user.userId;
      if (!userId) {
        res.status(401).json({ error: 'Utilisateur non authentifié' });
        return;
      }

      const trainings = await this.formationService.getUserTrainingsGiven(userId);

      res.status(200).json({
        success: true,
        data: trainings,
        count: trainings.length
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des formations dispensées:', error);
      res.status(500).json({
        error: 'Erreur interne du serveur',
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  };

  updateTrainingGiven = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user.userId;
      const { trainingId } = req.params;

      if (!userId) {
        res.status(401).json({ error: 'Utilisateur non authentifié' });
        return;
      }

      const validatedData = createTrainingGivenSchema.partial().parse(req.body);
      const training = await this.formationService.updateTrainingGiven(trainingId, userId, validatedData);

      res.status(200).json({
        success: true,
        data: training,
        message: 'Formation dispensée modifiée avec succès'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Données invalides',
          details: error.issues
        });
      } else {
        console.error('Erreur lors de la modification de la formation dispensée:', error);
        res.status(500).json({
          error: 'Erreur interne du serveur',
          message: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
    }
  };

  deleteTrainingGiven = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user.userId;
      const { trainingId } = req.params;

      if (!userId) {
        res.status(401).json({ error: 'Utilisateur non authentifié' });
        return;
      }

      await this.formationService.deleteTrainingGiven(trainingId, userId);

      res.status(200).json({
        success: true,
        message: 'Formation dispensée supprimée avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de la formation dispensée:', error);
      res.status(500).json({
        error: 'Erreur interne du serveur',
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  };

  // ============= ENCADREMENTS =============
  
  createSupervision = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user.userId;
      if (!userId) {
        res.status(401).json({ error: 'Utilisateur non authentifié' });
        return;
      }

      const validatedData = createSupervisionSchema.parse(req.body);
      const supervision = await this.formationService.createSupervision(userId, validatedData);

      res.status(201).json({
        success: true,
        data: supervision,
        message: 'Encadrement créé avec succès'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Données invalides',
          details: error.issues
        });
      } else {
        console.error('Erreur lors de la création de l\'encadrement:', error);
        res.status(500).json({
          error: 'Erreur interne du serveur',
          message: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
    }
  };

  getUserSupervisions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user.userId;
      if (!userId) {
        res.status(401).json({ error: 'Utilisateur non authentifié' });
        return;
      }

      const supervisions = await this.formationService.getUserSupervisions(userId);

      res.status(200).json({
        success: true,
        data: supervisions,
        count: supervisions.length
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des encadrements:', error);
      res.status(500).json({
        error: 'Erreur interne du serveur',
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  };

  updateSupervision = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user.userId;
      const { supervisionId } = req.params;

      if (!userId) {
        res.status(401).json({ error: 'Utilisateur non authentifié' });
        return;
      }

      const validatedData = createSupervisionSchema.partial().parse(req.body);
      const supervision = await this.formationService.updateSupervision(supervisionId, userId, validatedData);

      res.status(200).json({
        success: true,
        data: supervision,
        message: 'Encadrement modifié avec succès'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Données invalides',
          details: error.issues
        });
      } else {
        console.error('Erreur lors de la modification de l\'encadrement:', error);
        res.status(500).json({
          error: 'Erreur interne du serveur',
          message: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
    }
  };

  deleteSupervision = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user.userId;
      const { supervisionId } = req.params;

      if (!userId) {
        res.status(401).json({ error: 'Utilisateur non authentifié' });
        return;
      }

      await this.formationService.deleteSupervision(supervisionId, userId);

      res.status(200).json({
        success: true,
        message: 'Encadrement supprimé avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'encadrement:', error);
      res.status(500).json({
        error: 'Erreur interne du serveur',
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  };

  // ============= RAPPORTS (COORDINATEUR/ADMIN) =============
  
  getAllUsersFormationReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userRole = req.user.role;
      if (userRole !== 'COORDONATEUR_PROJET' && userRole !== 'ADMINISTRATEUR') {
        res.status(403).json({ error: 'Accès non autorisé' });
        return;
      }

      const reports = await this.formationService.getAllUsersFormationReport();

      res.status(200).json({
        success: true,
        data: reports,
        count: reports.length
      });
    } catch (error) {
      console.error('Erreur lors de la génération du rapport global:', error);
      res.status(500).json({
        error: 'Erreur interne du serveur',
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  };

  getUserFormationReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user.userId;
      const userRole = req.user.role;
      const { userId: targetUserId } = req.params;

      if (!userId) {
        res.status(401).json({ error: 'Utilisateur non authentifié' });
        return;
      }

      const requestedUserId = targetUserId || userId;
      if (requestedUserId !== userId && userRole !== 'COORDONATEUR_PROJET' && userRole !== 'ADMINISTRATEUR') {
        res.status(403).json({ error: 'Accès non autorisé' });
        return;
      }

      const shortTrainings = await this.formationService.getUserShortTrainingsReceived(requestedUserId);
      const diplomaticTrainings = await this.formationService.getUserDiplomaticTrainingsReceived(requestedUserId);
      const trainingsGiven = await this.formationService.getUserTrainingsGiven(requestedUserId);
      const supervisions = await this.formationService.getUserSupervisions(requestedUserId);
      const user = await this.formationService.getUserInfo(requestedUserId);

      const report = {
        user,
        shortTrainingsReceived: shortTrainings,
        diplomaticTrainingsReceived: diplomaticTrainings,
        trainingsGiven,
        supervisions
      };

      res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('Erreur lors de la génération du rapport utilisateur:', error);
      res.status(500).json({
        error: 'Erreur interne du serveur',
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  };

  downloadFormationReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userRole = req.user.role;
      const currentUserId = req.user.userId;
      const { format, userId: targetUserId } = req.query;

      // Vérification des permissions
      const isAdminOrCoordinator = userRole === 'COORDONATEUR_PROJET' || userRole === 'ADMINISTRATEUR';
      const isOwnReport = !targetUserId || targetUserId === currentUserId;

      // Un chercheur peut télécharger uniquement son propre rapport
      // Un admin/coordinateur peut télécharger n'importe quel rapport
      if (!isAdminOrCoordinator && !isOwnReport) {
        res.status(403).json({ error: 'Vous ne pouvez télécharger que votre propre rapport' });
        return;
      }

      // Par défaut on utilise docx
      const reportFormat = 'docx';

      let reportData;
      let filename: string;

      // Déterminer quel userId utiliser
      const effectiveUserId = targetUserId || currentUserId;
      const isGlobalReport = !targetUserId && isAdminOrCoordinator;

      if (isGlobalReport) {
        // Rapport global pour admin/coordinateur
        reportData = await this.formationService.getAllUsersFormationReport();
        filename = this.reportService.generateFilename(reportData, reportFormat);
      } else {
        // Rapport individuel
        const userId = effectiveUserId as string;
        const shortTrainings = await this.formationService.getUserShortTrainingsReceived(userId);
        const diplomaticTrainings = await this.formationService.getUserDiplomaticTrainingsReceived(userId);
        const trainingsGiven = await this.formationService.getUserTrainingsGiven(userId);
        const supervisions = await this.formationService.getUserSupervisions(userId);
        const user = await this.formationService.getUserInfo(userId);

        reportData = {
          user,
          shortTrainingsReceived: shortTrainings,
          diplomaticTrainingsReceived: diplomaticTrainings,
          trainingsGiven,
          supervisions
        };

        filename = this.reportService.generateFilename(reportData, reportFormat);
      }

      // Générer le rapport Word
      await this.generateWordReport(res, reportData, filename);

    } catch (error) {
      console.error('Erreur lors du téléchargement du rapport:', error);
      res.status(500).json({
        error: 'Erreur interne du serveur',
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  };

  // ============= MÉTHODE PRIVÉE POUR GÉNÉRATION WORD =============

  private async generateWordReport(res: Response, reportData: any, filename: string): Promise<void> {
    try {
      const { user, shortTrainingsReceived, diplomaticTrainingsReceived, trainingsGiven, supervisions } = reportData;

      // Helper pour créer des cellules d'en-tête en gras
      const createHeaderCell = (text: string) => new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text, bold: true })] })]
      });

      const sections = [];

      // En-tête du document
      sections.push(
        new Paragraph({
          text: "RAPPORT DE FORMATION ET ENCADREMENT",
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 }
        }),
        new Paragraph({
          text: "Centre de Recherche Agricole (CRA)",
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        })
      );

      // Informations du chercheur
      sections.push(
        new Paragraph({
          text: "Informations du Chercheur",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Nom: ", bold: true }),
            new TextRun(`${user.firstName} ${user.lastName}`)
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Email: ", bold: true }),
            new TextRun(user.email)
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Date de génération: ", bold: true }),
            new TextRun(new Date().toLocaleDateString('fr-FR'))
          ],
          spacing: { after: 400 }
        })
      );

      // Résumé
      sections.push(
        new Paragraph({
          text: "Résumé",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 200 }
        }),
        new Paragraph({
          text: `Formations courtes reçues: ${shortTrainingsReceived?.length || 0}`,
          spacing: { after: 100 }
        }),
        new Paragraph({
          text: `Formations diplômantes reçues: ${diplomaticTrainingsReceived?.length || 0}`,
          spacing: { after: 100 }
        }),
        new Paragraph({
          text: `Formations dispensées: ${trainingsGiven?.length || 0}`,
          spacing: { after: 100 }
        }),
        new Paragraph({
          text: `Encadrements: ${supervisions?.length || 0}`,
          spacing: { after: 400 }
        })
      );

      // Tableau des formations courtes reçues
      if (shortTrainingsReceived && shortTrainingsReceived.length > 0) {
        sections.push(
          new Paragraph({
            text: "Tableau 11: Formations de courtes durées reçues par les agents",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          })
        );

        const shortTrainingRows = [
          new TableRow({
            tableHeader: true,
            children: [
              createHeaderCell("Intitulé de la formation"),
              createHeaderCell("Objectifs"),
              createHeaderCell("Période/Durée"),
              createHeaderCell("Lieu"),
              createHeaderCell("Bénéficiaires")
            ]
          }),
          ...shortTrainingsReceived.map((training: any) => new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(training.title)] }),
              new TableCell({ children: [new Paragraph(Array.isArray(training.objectives) ? training.objectives.join('; ') : '')] }),
              new TableCell({ children: [new Paragraph(training.period || 'Non spécifiée')] }),
              new TableCell({ children: [new Paragraph(training.location)] }),
              new TableCell({ children: [new Paragraph(Array.isArray(training.beneficiaries) && training.beneficiaries.length > 0 ? training.beneficiaries.join(', ') : 'Agent connecté')] })
            ]
          }))
        ];

        sections.push(new Table({ rows: shortTrainingRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
      }

      // Tableau des formations diplômantes
      if (diplomaticTrainingsReceived && diplomaticTrainingsReceived.length > 0) {
        sections.push(
          new Paragraph({
            text: "c. Formations diplômantes reçues par les agents",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          })
        );

        const diplomaticRows = [
          new TableRow({
            tableHeader: true,
            children: [
              createHeaderCell("Prénom et nom"),
              createHeaderCell("Niveau"),
              createHeaderCell("Spécialité"),
              createHeaderCell("Universités/Écoles"),
              createHeaderCell("Période"),
              createHeaderCell("Diplôme obtenu")
            ]
          }),
          ...diplomaticTrainingsReceived.map((training: any) => new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(training.studentName)] }),
              new TableCell({ children: [new Paragraph(training.level)] }),
              new TableCell({ children: [new Paragraph(training.specialty)] }),
              new TableCell({ children: [new Paragraph(training.university)] }),
              new TableCell({ children: [new Paragraph(training.period)] }),
              new TableCell({ children: [new Paragraph(training.diplomaObtained === 'OUI' ? 'Oui' : training.diplomaObtained === 'EN_COURS' ? 'Non (en cours)' : 'Non')] })
            ]
          }))
        ];

        sections.push(new Table({ rows: diplomaticRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
      }

      // Tableau des formations dispensées
      if (trainingsGiven && trainingsGiven.length > 0) {
        sections.push(
          new Paragraph({
            text: "b. Enseignements dispensés dans les universités et grandes écoles",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          })
        );

        const trainingsGivenRows = [
          new TableRow({
            tableHeader: true,
            children: [
              createHeaderCell("Intitulé cours"),
              createHeaderCell("Niveau"),
              createHeaderCell("Université/Institut/École"),
              createHeaderCell("Département/Faculté"),
              createHeaderCell("Volume horaire (h)"),
              createHeaderCell("Chercheurs concernés")
            ]
          }),
          ...trainingsGiven.map((training: any) => new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(training.title)] }),
              new TableCell({ children: [new Paragraph(training.type || '-')] }),
              new TableCell({ children: [new Paragraph(training.institution)] }),
              new TableCell({ children: [new Paragraph(training.department || '-')] }),
              new TableCell({ children: [new Paragraph(`${training.duration || '-'} heures`)] }),
              new TableCell({ children: [new Paragraph('1')] })
            ]
          }))
        ];

        sections.push(new Table({ rows: trainingsGivenRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
      }

      // Tableau des encadrements
      if (supervisions && supervisions.length > 0) {
        sections.push(
          new Paragraph({
            text: "Tableau 8: Encadrements",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          })
        );

        const supervisionRows = [
          new TableRow({
            tableHeader: true,
            children: [
              createHeaderCell("Nom étudiant"),
              createHeaderCell("Intitulé thèse"),
              createHeaderCell("Spécialité"),
              createHeaderCell("Type"),
              createHeaderCell("Université"),
              createHeaderCell("Période"),
              createHeaderCell("Date soutenance prévue"),
              createHeaderCell("Doctorant"),
              createHeaderCell("Soutenu")
            ]
          }),
          ...supervisions.map((supervision: any) => new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(supervision.studentName)] }),
              new TableCell({ children: [new Paragraph(supervision.title)] }),
              new TableCell({ children: [new Paragraph(supervision.specialty)] }),
              new TableCell({ children: [new Paragraph(supervision.type)] }),
              new TableCell({ children: [new Paragraph(supervision.university)] }),
              new TableCell({ children: [new Paragraph(`${new Date(supervision.startDate).getFullYear()} - ${supervision.endDate ? new Date(supervision.endDate).getFullYear() : 'En cours'}`)] }),
              new TableCell({ children: [new Paragraph(supervision.expectedDefenseDate ? new Date(supervision.expectedDefenseDate).toLocaleDateString('fr-FR') : 'À définir')] }),
              new TableCell({ children: [new Paragraph(`Dr. ${supervision.studentName}`)] }),
              new TableCell({ children: [new Paragraph(supervision.status === 'SOUTENU' ? 'OUI' : 'NON')] })
            ]
          }))
        ];

        sections.push(new Table({ rows: supervisionRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
      }

      // Pied de page
      sections.push(
        new Paragraph({
          text: `Rapport généré automatiquement le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
          alignment: AlignmentType.CENTER,
          spacing: { before: 600 }
        })
      );

      // Créer le document
      const doc = new Document({
        sections: [{
          properties: {},
          children: sections
        }]
      });

      // Générer le buffer
      const buffer = await Packer.toBuffer(doc);

      // Envoyer la réponse
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length.toString());
      res.send(buffer);

    } catch (error) {
      console.error('Erreur lors de la génération Word:', error);
      throw error;
    }
  }
}