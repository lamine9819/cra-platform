// controllers/formation.controller.ts
import { Request, Response } from 'express';
import { FormationService } from '../services/formation.service';
import { FormationReportService } from '../utils/formation-report.service';
import {
  createShortTrainingReceivedSchema,
  createDiplomaticTrainingReceivedSchema,
  createTrainingGivenSchema,
  createSupervisionSchema
} from '../types/formation.types';
import { z } from 'zod';
import puppeteer from 'puppeteer';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    email: string;
  };
}

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
      const userId = req.user?.id;
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
      const userId = req.user?.id;
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

  deleteShortTrainingReceived = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
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
      const userId = req.user?.id;
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
      const userId = req.user?.id;
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

  deleteDiplomaticTrainingReceived = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
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
      const userId = req.user?.id;
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
      const userId = req.user?.id;
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

  deleteTrainingGiven = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
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
      const userId = req.user?.id;
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
      const userId = req.user?.id;
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

  deleteSupervision = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
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
      const userRole = req.user?.role;
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
      const userId = req.user?.id;
      const userRole = req.user?.role;
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
      const userRole = req.user?.role;
      const { format, userId: targetUserId } = req.query;

      if (userRole !== 'COORDONATEUR_PROJET' && userRole !== 'ADMINISTRATEUR') {
        res.status(403).json({ error: 'Accès non autorisé' });
        return;
      }

      if (!format || format !== 'pdf') {
        res.status(400).json({ error: 'Format invalide. Seul le PDF est supporté actuellement' });
        return;
      }

      let reportData;
      let htmlContent: string;
      let filename: string;

      if (targetUserId) {
        const userId = targetUserId as string;
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
        
        htmlContent = this.reportService.generateHTMLContent(reportData);
        filename = this.reportService.generateFilename(reportData, 'pdf');
      } else {
        reportData = await this.formationService.getAllUsersFormationReport();
        htmlContent = this.reportService.generateGlobalHTMLContent(reportData);
        filename = this.reportService.generateFilename(reportData, 'pdf');
      }

      await this.generatePDFReport(res, htmlContent, filename);

    } catch (error) {
      console.error('Erreur lors du téléchargement du rapport:', error);
      res.status(500).json({
        error: 'Erreur interne du serveur',
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  };

  // ============= MÉTHODE PRIVÉE POUR GÉNÉRATION PDF =============

  private async generatePDFReport(res: Response, htmlContent: string, filename: string): Promise<void> {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });
      
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '1cm',
          right: '1cm',
          bottom: '1cm',
          left: '1cm'
        }
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length.toString());
      res.send(pdfBuffer);

    } catch (error) {
      console.error('Erreur lors de la génération PDF:', error);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}