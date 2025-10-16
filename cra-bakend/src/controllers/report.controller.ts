// src/controllers/report.controller.ts

import { Request, Response } from 'express';
import { reportService } from '../services/report.service';
import { documentGeneratorService } from '../services/document-generator.service';
import { quarterService } from '../services/quarter.service';
import { generateReportSchema } from '../utils/report.validation';
import { ReportType, ReportFormat, Quarter } from '../types/reports.types';
import { GenerateReportInput } from '../utils/report.validation';
import * as fs from 'fs';
import * as path from 'path';

export class ReportController {
  /**
   * Génère un rapport trimestriel
   */
  async generateReport(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = generateReportSchema.parse(req.body);

      if (!validatedData.quarter && !validatedData.startDate) {
        const currentQuarter = quarterService.getCurrentQuarter();
        validatedData.quarter = currentQuarter.quarter;
        if (!validatedData.year) {
          validatedData.year = currentQuarter.year;
        }
      }

      let filepath: string;

      switch (validatedData.reportType) {
        case ReportType.ACTIVITIES:
          filepath = await this.generateActivitiesReport(
            validatedData.format,
            validatedData
          );
          break;

        case ReportType.CONVENTIONS:
          filepath = await this.generateConventionsReport(
            validatedData.format,
            validatedData
          );
          break;

        case ReportType.KNOWLEDGE_TRANSFERS:
          filepath = await this.generateKnowledgeTransfersReport(
            validatedData.format,
            validatedData
          );
          break;

        default:
          res.status(400).json({
            success: false,
            message: 'Type de rapport non supporté'
          });
          return;
      }

      this.sendFile(res, filepath);
    } catch (error: any) {
      console.error('Erreur lors de la génération du rapport:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la génération du rapport',
        error: error.message
      });
    }
  }

  /**
   * Génère un rapport annuel (tous les trimestres)
   */
  async generateAnnualReport(req: Request, res: Response): Promise<void> {
    try {
      const { year, reportType, format } = req.body;

      if (!year || !reportType || !format) {
        res.status(400).json({
          success: false,
          message: 'Paramètres manquants: year, reportType, format requis'
        });
        return;
      }

      const targetYear = parseInt(year);

      // Collecter les données de tous les trimestres
      const dataByQuarter = new Map();
      const quarters = [Quarter.Q1, Quarter.Q2, Quarter.Q3, Quarter.Q4];

      for (const quarter of quarters) {
        const filters: GenerateReportInput = {
          reportType: reportType as ReportType,
          format: format as ReportFormat,
          year: targetYear,
          quarter: quarter,
          includeArchived: false,
          includeCharts: false,
          includeStatistics: false
        };

        let quarterData;
        switch (reportType) {
          case ReportType.ACTIVITIES:
            quarterData = await reportService.getActivitiesData(filters);
            break;
          case ReportType.CONVENTIONS:
            quarterData = await reportService.getConventionsData(filters);
            break;
          case ReportType.KNOWLEDGE_TRANSFERS:
            quarterData = await reportService.getKnowledgeTransfersData(filters);
            break;
        }

        dataByQuarter.set(quarter, quarterData || []);
      }

      // Récupérer les statistiques annuelles
      const statistics = await this.getAnnualStatistics(targetYear);

      // Générer le document
      let filepath: string;

      switch (reportType) {
        case ReportType.ACTIVITIES:
          if (format === ReportFormat.PDF) {
            filepath = await documentGeneratorService.generateAnnualActivitiesPDF(
              dataByQuarter,
              targetYear,
              statistics
            );
          } else {
            filepath = await documentGeneratorService.generateAnnualActivitiesWORD(
              dataByQuarter,
              targetYear,
              statistics
            );
          }
          break;

        case ReportType.CONVENTIONS:
          if (format === ReportFormat.PDF) {
            filepath = await documentGeneratorService.generateAnnualConventionsPDF(
              dataByQuarter,
              targetYear,
              statistics
            );
          } else {
            filepath = await documentGeneratorService.generateAnnualConventionsWORD(
              dataByQuarter,
              targetYear,
              statistics
            );
          }
          break;

        case ReportType.KNOWLEDGE_TRANSFERS:
          if (format === ReportFormat.PDF) {
            filepath = await documentGeneratorService.generateAnnualKnowledgeTransfersPDF(
              dataByQuarter,
              targetYear,
              statistics
            );
          } else {
            filepath = await documentGeneratorService.generateAnnualKnowledgeTransfersWORD(
              dataByQuarter,
              targetYear,
              statistics
            );
          }
          break;

        default:
          res.status(400).json({
            success: false,
            message: 'Type de rapport non supporté'
          });
          return;
      }

      this.sendFile(res, filepath);
    } catch (error: any) {
      console.error('Erreur lors de la génération du rapport annuel:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la génération du rapport annuel',
        error: error.message
      });
    }
  }

  /**
   * Récupère les statistiques annuelles
   */
  private async getAnnualStatistics(year: number): Promise<any> {
    const quarters = [Quarter.Q1, Quarter.Q2, Quarter.Q3, Quarter.Q4];
    const byQuarter: any = {};

    // Statistiques par trimestre
    for (const quarter of quarters) {
      const filters: GenerateReportInput = {
        reportType: ReportType.ACTIVITIES,
        format: ReportFormat.PDF,
        year: year,
        quarter: quarter,
        includeArchived: false,
        includeCharts: false,
        includeStatistics: true
      };
      byQuarter[quarter] = await reportService.getQuarterlyStatistics(filters);
    }

    // Statistiques annuelles (agrégation)
    const annual = {
      activities: {
        total: 0,
        new: 0,
        reconducted: 0,
        closed: 0
      },
      conventions: {
        total: 0
      },
      transfers: {
        total: 0
      },
      budget: {
        totalGlobal: 0,
        totalMobilized: 0
      }
    };

    for (const quarter of quarters) {
      const qStats = byQuarter[quarter];
      
      annual.activities.new += qStats.activities.new;
      annual.activities.reconducted += qStats.activities.reconducted;
      annual.activities.closed += qStats.activities.closed;
      
      annual.budget.totalGlobal += qStats.budget?.totalGlobal || 0;
      annual.budget.totalMobilized += qStats.budget?.totalMobilized || 0;
    }

    annual.activities.total = annual.activities.new + annual.activities.reconducted;

    // Pour obtenir le nombre exact de conventions et transferts uniques sur l'année
    const yearStartDate = new Date(year, 0, 1);
    const yearEndDate = new Date(year, 11, 31, 23, 59, 59);

    const conventionsFilters: GenerateReportInput = {
      reportType: ReportType.CONVENTIONS,
      format: ReportFormat.PDF,
      year: year,
      startDate: yearStartDate.toISOString(),
      endDate: yearEndDate.toISOString(),
      includeArchived: false,
      includeCharts: false,
      includeStatistics: false
    };

    const transfersFilters: GenerateReportInput = {
      reportType: ReportType.KNOWLEDGE_TRANSFERS,
      format: ReportFormat.PDF,
      year: year,
      startDate: yearStartDate.toISOString(),
      endDate: yearEndDate.toISOString(),
      includeArchived: false,
      includeCharts: false,
      includeStatistics: false
    };

    const [totalConventions, totalTransfers] = await Promise.all([
      reportService.getConventionsData(conventionsFilters),
      reportService.getKnowledgeTransfersData(transfersFilters)
    ]);

    annual.conventions.total = totalConventions.length;
    annual.transfers.total = totalTransfers.length;

    return {
      annual,
      byQuarter
    };
  }

  /**
   * Récupère les trimestres disponibles pour les rapports
   */
  async getAvailableQuarters(req: Request, res: Response): Promise<void> {
    try {
      const { year } = req.query;
      const targetYear = year ? parseInt(year as string) : new Date().getFullYear();

      const quarters = quarterService.getYearQuarters(targetYear);
      const currentQuarter = quarterService.getCurrentQuarter();

      res.json({
        success: true,
        data: {
          year: targetYear,
          currentQuarter: {
            quarter: currentQuarter.quarter,
            year: currentQuarter.year,
            label: currentQuarter.label
          },
          quarters: quarters.map(q => ({
            quarter: q.quarter,
            label: quarterService.formatQuarterLabel(q.year, q.quarter),
            startDate: q.startDate,
            endDate: q.endDate
          }))
        }
      });
    } catch (error: any) {
      console.error('Erreur lors de la récupération des trimestres:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des trimestres',
        error: error.message
      });
    }
  }

  /**
   * Récupère les statistiques trimestrielles
   */
  async getQuarterlyStats(req: Request, res: Response): Promise<void> {
    try {
      const { year, quarter } = req.query;
      
      const targetYear = year ? parseInt(year as string) : new Date().getFullYear();
      const targetQuarter = quarter ? parseInt(quarter as string) as Quarter : quarterService.getCurrentQuarter().quarter;

      const filters: GenerateReportInput = {
        reportType: ReportType.ACTIVITIES,
        format: ReportFormat.PDF,
        year: targetYear,
        quarter: targetQuarter,
        includeArchived: false,
        includeCharts: false,
        includeStatistics: true
      };

      const stats = await reportService.getQuarterlyStatistics(filters);

      res.json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des statistiques',
        error: error.message
      });
    }
  }

  /**
   * Récupère les statistiques annuelles
   */
  async getAnnualStats(req: Request, res: Response): Promise<void> {
    try {
      const { year } = req.query;
      const targetYear = year ? parseInt(year as string) : new Date().getFullYear();

      const statistics = await this.getAnnualStatistics(targetYear);

      res.json({
        success: true,
        data: statistics
      });
    } catch (error: any) {
      console.error('Erreur lors de la récupération des statistiques annuelles:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des statistiques annuelles',
        error: error.message
      });
    }
  }

  /**
   * Compare les statistiques entre deux trimestres
   */
  async compareQuarters(req: Request, res: Response): Promise<void> {
    try {
      const { year1, quarter1, year2, quarter2 } = req.query;

      if (!year1 || !quarter1 || !year2 || !quarter2) {
        res.status(400).json({
          success: false,
          message: 'Paramètres manquants: year1, quarter1, year2, quarter2 requis'
        });
        return;
      }

      const filters1: GenerateReportInput = {
        reportType: ReportType.ACTIVITIES,
        format: ReportFormat.PDF,
        year: parseInt(year1 as string),
        quarter: parseInt(quarter1 as string) as Quarter,
        includeArchived: false,
        includeCharts: false,
        includeStatistics: true
      };

      const filters2: GenerateReportInput = {
        reportType: ReportType.ACTIVITIES,
        format: ReportFormat.PDF,
        year: parseInt(year2 as string),
        quarter: parseInt(quarter2 as string) as Quarter,
        includeArchived: false,
        includeCharts: false,
        includeStatistics: true
      };

      const [stats1, stats2] = await Promise.all([
        reportService.getQuarterlyStatistics(filters1),
        reportService.getQuarterlyStatistics(filters2)
      ]);

      // Calcul des variations
      const comparison = {
        period1: stats1.period,
        period2: stats2.period,
        activities: {
          total: {
            value1: stats1.activities.total,
            value2: stats2.activities.total,
            variation: stats2.activities.total - stats1.activities.total,
            variationPercent: stats1.activities.total > 0 
              ? ((stats2.activities.total - stats1.activities.total) / stats1.activities.total * 100).toFixed(2)
              : 'N/A'
          },
          new: {
            value1: stats1.activities.new,
            value2: stats2.activities.new,
            variation: stats2.activities.new - stats1.activities.new
          },
          reconducted: {
            value1: stats1.activities.reconducted,
            value2: stats2.activities.reconducted,
            variation: stats2.activities.reconducted - stats1.activities.reconducted
          },
          closed: {
            value1: stats1.activities.closed,
            value2: stats2.activities.closed,
            variation: stats2.activities.closed - stats1.activities.closed
          }
        },
        conventions: {
          total: {
            value1: stats1.conventions.total,
            value2: stats2.conventions.total,
            variation: stats2.conventions.total - stats1.conventions.total
          }
        },
        transfers: {
          total: {
            value1: stats1.transfers.total,
            value2: stats2.transfers.total,
            variation: stats2.transfers.total - stats1.transfers.total
          }
        },
        budget: {
          totalMobilized: {
            value1: stats1.budget.totalMobilized,
            value2: stats2.budget.totalMobilized,
            variation: stats2.budget.totalMobilized - stats1.budget.totalMobilized,
            variationPercent: stats1.budget.totalMobilized > 0
              ? ((stats2.budget.totalMobilized - stats1.budget.totalMobilized) / stats1.budget.totalMobilized * 100).toFixed(2)
              : 'N/A'
          }
        }
      };

      res.json({
        success: true,
        data: comparison
      });
    } catch (error: any) {
      console.error('Erreur lors de la comparaison des trimestres:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la comparaison des trimestres',
        error: error.message
      });
    }
  }

  /**
   * Récupère la liste des rapports disponibles
   */
  async getAvailableReports(req: Request, res: Response): Promise<void> {
    try {
      const reports = [
        {
          type: ReportType.ACTIVITIES,
          name: 'Rapport des activités',
          description: 'Liste toutes les activités avec leurs responsables et statuts',
          formats: [ReportFormat.PDF, ReportFormat.WORD],
          periodicity: ['quarterly', 'annual']
        },
        {
          type: ReportType.CONVENTIONS,
          name: 'Rapport des conventions',
          description: 'Liste des conventions avec leurs financements',
          formats: [ReportFormat.PDF, ReportFormat.WORD],
          periodicity: ['quarterly', 'annual']
        },
        {
          type: ReportType.KNOWLEDGE_TRANSFERS,
          name: 'Rapport des transferts de connaissances',
          description: 'Liste des acquis transférables',
          formats: [ReportFormat.PDF, ReportFormat.WORD],
          periodicity: ['quarterly', 'annual']
        }
      ];

      res.json({
        success: true,
        data: reports
      });
    } catch (error: any) {
      console.error('Erreur lors de la récupération des rapports:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des rapports',
        error: error.message
      });
    }
  }

  /**
   * Nettoie les anciens rapports
   */
  async cleanOldReports(req: Request, res: Response): Promise<void> {
    try {
      await documentGeneratorService.cleanOldReports();

      res.json({
        success: true,
        message: 'Anciens rapports nettoyés avec succès'
      });
    } catch (error: any) {
      console.error('Erreur lors du nettoyage des rapports:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors du nettoyage des rapports',
        error: error.message
      });
    }
  }

  /**
   * Méthodes privées pour générer les rapports trimestriels
   */
  private async generateActivitiesReport(
    format: ReportFormat,
    filters: GenerateReportInput
  ): Promise<string> {
    const activities = await reportService.getActivitiesData(filters);

    if (format === ReportFormat.PDF) {
      return await documentGeneratorService.generateActivitiesPDF(
        activities,
        filters
      );
    } else {
      return await documentGeneratorService.generateActivitiesWORD(
        activities,
        filters
      );
    }
  }

  private async generateConventionsReport(
    format: ReportFormat,
    filters: GenerateReportInput
  ): Promise<string> {
    const conventions = await reportService.getConventionsData(filters);

    if (format === ReportFormat.PDF) {
      return await documentGeneratorService.generateConventionsPDF(
        conventions,
        filters
      );
    } else {
      return await documentGeneratorService.generateConventionsWORD(
        conventions,
        filters
      );
    }
  }

  private async generateKnowledgeTransfersReport(
    format: ReportFormat,
    filters: GenerateReportInput
  ): Promise<string> {
    const transfers = await reportService.getKnowledgeTransfersData(filters);

    if (format === ReportFormat.PDF) {
      return await documentGeneratorService.generateKnowledgeTransfersPDF(
        transfers,
        filters
      );
    } else {
      return await documentGeneratorService.generateKnowledgeTransfersWORD(
        transfers,
        filters
      );
    }
  }

  /**
   * Envoie le fichier généré au client
   */
  private sendFile(res: Response, filepath: string): void {
    const filename = path.basename(filepath);
    const ext = path.extname(filepath);
    const mimeType = ext === '.pdf' 
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const fileStream = fs.createReadStream(filepath);
    fileStream.pipe(res);

    fileStream.on('end', () => {
      // Nettoyer le fichier après envoi
      fs.unlinkSync(filepath);
    });

    fileStream.on('error', (error) => {
      console.error('Erreur lors de l\'envoi du fichier:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Erreur lors de l\'envoi du fichier'
        });
      }
    });
  }
}

export const reportController = new ReportController();