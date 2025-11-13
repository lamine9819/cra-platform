// controllers/publication.controller.ts
import { Response } from 'express';
import { publicationService } from '../services/publication.service';
import { reportGenerator } from '../utils/reportGenerator';
import fs from 'fs';
import {
  createPublicationSchema,
  updatePublicationSchema,
  publicationQuerySchema
} from '../types/publication.types';
import { UserRole } from '@prisma/client';
import { AuthenticatedRequest } from '../types/auth.types';

export class PublicationController {
  
  async createPublication(req: AuthenticatedRequest, res: Response) {
    try {
      const validatedData = createPublicationSchema.parse(req.body);
      const userId = req.user!.userId;

      const publication = await publicationService.createPublication(validatedData, userId);

      res.status(201).json({
        success: true,
        message: "Publication créée avec succès",
        data: publication
      });
    } catch (error: any) {
      console.error('Error creating publication:', error);
      res.status(400).json({
        success: false,
        message: error.message || "Erreur lors de la création de la publication"
      });
    }
  }

  async getPublications(req: AuthenticatedRequest, res: Response) {
    try {
      const query = publicationQuerySchema.parse(req.query);
      const userId = req.user!.userId;
      const userRole = req.user!.role as UserRole;

      const result = await publicationService.getPublications(query, userId, userRole);

      res.status(200).json({
        success: true,
        data: result.publications,
        pagination: result.pagination
      });
    } catch (error: any) {
      console.error('Error fetching publications:', error);
      res.status(400).json({
        success: false,
        message: error.message || "Erreur lors de la récupération des publications"
      });
    }
  }

  async getPublicationById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const publication = await publicationService.getPublicationById(id);

      res.status(200).json({
        success: true,
        data: publication
      });
    } catch (error: any) {
      console.error('Error fetching publication:', error);
      res.status(404).json({
        success: false,
        message: error.message || "Publication non trouvée"
      });
    }
  }

  async updatePublication(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = updatePublicationSchema.parse(req.body);
      const userId = req.user!.userId;

      const publication = await publicationService.updatePublication(id, validatedData, userId);

      res.status(200).json({
        success: true,
        message: "Publication mise à jour avec succès",
        data: publication
      });
    } catch (error: any) {
      console.error('Error updating publication:', error);
      res.status(400).json({
        success: false,
        message: error.message || "Erreur lors de la mise à jour de la publication"
      });
    }
  }

  async deletePublication(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const userRole = req.user!.role as UserRole;

      const result = await publicationService.deletePublication(id, userId, userRole);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error: any) {
      console.error('Error deleting publication:', error);
      res.status(400).json({
        success: false,
        message: error.message || "Erreur lors de la suppression de la publication"
      });
    }
  }

  async getMyPublications(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;

      const publications = await publicationService.getResearcherPublications(userId, year);

      res.status(200).json({
        success: true,
        data: publications
      });
    } catch (error: any) {
      console.error('Error fetching researcher publications:', error);
      res.status(400).json({
        success: false,
        message: error.message || "Erreur lors de la récupération des publications"
      });
    }
  }

  async getPublicationStats(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.query.userId as string | undefined;
      const stats = await publicationService.getPublicationStats(userId);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      console.error('Error fetching publication stats:', error);
      res.status(400).json({
        success: false,
        message: error.message || "Erreur lors du calcul des statistiques"
      });
    }
  }

  async uploadDocument(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const file = req.file;
      const userId = req.user!.userId;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: "Aucun fichier fourni"
        });
      }

      const publication = await publicationService.attachDocument(id, file, userId);

      res.status(200).json({
        success: true,
        message: "Document attaché avec succès",
        data: publication
      });
    } catch (error: any) {
      console.error('Error uploading document:', error);
      
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(400).json({
        success: false,
        message: error.message || "Erreur lors de l'upload du document"
      });
    }
  }

  async downloadDocument(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const document = await publicationService.downloadDocument(id);

      res.download(document.filepath, document.filename);
    } catch (error: any) {
      console.error('Error downloading document:', error);
      res.status(404).json({
        success: false,
        message: error.message || "Erreur lors du téléchargement"
      });
    }
  }

  async generateReport(req: AuthenticatedRequest, res: Response) {
    try {
      const { researcherId, year, format } = req.query;
      
      if (!researcherId || !year) {
        return res.status(400).json({
          success: false,
          message: "Les paramètres researcherId et year sont requis"
        });
      }

      const reportFormat = (format as string) || 'pdf';
      
      if (!['pdf', 'docx'].includes(reportFormat)) {
        return res.status(400).json({
          success: false,
          message: "Format invalide. Utilisez 'pdf' ou 'docx'"
        });
      }

      const filename = await reportGenerator.generatePublicationReport(
        researcherId as string,
        parseInt(year as string),
        reportFormat as 'pdf' | 'docx'
      );

      const filepath = `./reports/${filename}`;
      
      res.download(filepath, filename as string, (err) => {
        if (err) {
          console.error('Error downloading report:', err);
        }
        fs.unlinkSync(filepath);
      });
    } catch (error: any) {
      console.error('Error generating report:', error);
      res.status(400).json({
        success: false,
        message: error.message || "Erreur lors de la génération du rapport"
      });
    }
  }
}

export const publicationController = new PublicationController();