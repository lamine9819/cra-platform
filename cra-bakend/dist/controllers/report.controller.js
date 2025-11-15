"use strict";
// src/controllers/report.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportController = exports.ReportController = void 0;
const tslib_1 = require("tslib");
const report_service_1 = require("../services/report.service");
const document_generator_service_1 = require("../services/document-generator.service");
const quarter_service_1 = require("../services/quarter.service");
const report_validation_1 = require("../utils/report.validation");
const reports_types_1 = require("../types/reports.types");
const fs = tslib_1.__importStar(require("fs"));
const path = tslib_1.__importStar(require("path"));
class ReportController {
    /**
     * Génère un rapport trimestriel
     */
    async generateReport(req, res) {
        try {
            const validatedData = report_validation_1.generateReportSchema.parse(req.body);
            if (!validatedData.quarter && !validatedData.startDate) {
                const currentQuarter = quarter_service_1.quarterService.getCurrentQuarter();
                validatedData.quarter = currentQuarter.quarter;
                if (!validatedData.year) {
                    validatedData.year = currentQuarter.year;
                }
            }
            let filepath;
            switch (validatedData.reportType) {
                case reports_types_1.ReportType.ACTIVITIES:
                    filepath = await this.generateActivitiesReport(validatedData.format, validatedData);
                    break;
                case reports_types_1.ReportType.CONVENTIONS:
                    filepath = await this.generateConventionsReport(validatedData.format, validatedData);
                    break;
                case reports_types_1.ReportType.KNOWLEDGE_TRANSFERS:
                    filepath = await this.generateKnowledgeTransfersReport(validatedData.format, validatedData);
                    break;
                default:
                    res.status(400).json({
                        success: false,
                        message: 'Type de rapport non supporté'
                    });
                    return;
            }
            this.sendFile(res, filepath);
        }
        catch (error) {
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
    async generateAnnualReport(req, res) {
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
            const quarters = [reports_types_1.Quarter.Q1, reports_types_1.Quarter.Q2, reports_types_1.Quarter.Q3, reports_types_1.Quarter.Q4];
            for (const quarter of quarters) {
                const filters = {
                    reportType: reportType,
                    format: format,
                    year: targetYear,
                    quarter: quarter,
                    includeArchived: false,
                    includeCharts: false,
                    includeStatistics: false
                };
                let quarterData;
                switch (reportType) {
                    case reports_types_1.ReportType.ACTIVITIES:
                        quarterData = await report_service_1.reportService.getActivitiesData(filters);
                        break;
                    case reports_types_1.ReportType.CONVENTIONS:
                        quarterData = await report_service_1.reportService.getConventionsData(filters);
                        break;
                    case reports_types_1.ReportType.KNOWLEDGE_TRANSFERS:
                        quarterData = await report_service_1.reportService.getKnowledgeTransfersData(filters);
                        break;
                }
                dataByQuarter.set(quarter, quarterData || []);
            }
            // Récupérer les statistiques annuelles
            const statistics = await this.getAnnualStatistics(targetYear);
            // Générer le document
            let filepath;
            switch (reportType) {
                case reports_types_1.ReportType.ACTIVITIES:
                    if (format === reports_types_1.ReportFormat.PDF) {
                        filepath = await document_generator_service_1.documentGeneratorService.generateAnnualActivitiesPDF(dataByQuarter, targetYear, statistics);
                    }
                    else {
                        filepath = await document_generator_service_1.documentGeneratorService.generateAnnualActivitiesWORD(dataByQuarter, targetYear, statistics);
                    }
                    break;
                case reports_types_1.ReportType.CONVENTIONS:
                    if (format === reports_types_1.ReportFormat.PDF) {
                        filepath = await document_generator_service_1.documentGeneratorService.generateAnnualConventionsPDF(dataByQuarter, targetYear, statistics);
                    }
                    else {
                        filepath = await document_generator_service_1.documentGeneratorService.generateAnnualConventionsWORD(dataByQuarter, targetYear, statistics);
                    }
                    break;
                case reports_types_1.ReportType.KNOWLEDGE_TRANSFERS:
                    if (format === reports_types_1.ReportFormat.PDF) {
                        filepath = await document_generator_service_1.documentGeneratorService.generateAnnualKnowledgeTransfersPDF(dataByQuarter, targetYear, statistics);
                    }
                    else {
                        filepath = await document_generator_service_1.documentGeneratorService.generateAnnualKnowledgeTransfersWORD(dataByQuarter, targetYear, statistics);
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
        }
        catch (error) {
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
    async getAnnualStatistics(year) {
        const quarters = [reports_types_1.Quarter.Q1, reports_types_1.Quarter.Q2, reports_types_1.Quarter.Q3, reports_types_1.Quarter.Q4];
        const byQuarter = {};
        // Statistiques par trimestre
        for (const quarter of quarters) {
            const filters = {
                reportType: reports_types_1.ReportType.ACTIVITIES,
                format: reports_types_1.ReportFormat.PDF,
                year: year,
                quarter: quarter,
                includeArchived: false,
                includeCharts: false,
                includeStatistics: true
            };
            byQuarter[quarter] = await report_service_1.reportService.getQuarterlyStatistics(filters);
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
        const conventionsFilters = {
            reportType: reports_types_1.ReportType.CONVENTIONS,
            format: reports_types_1.ReportFormat.PDF,
            year: year,
            startDate: yearStartDate.toISOString(),
            endDate: yearEndDate.toISOString(),
            includeArchived: false,
            includeCharts: false,
            includeStatistics: false
        };
        const transfersFilters = {
            reportType: reports_types_1.ReportType.KNOWLEDGE_TRANSFERS,
            format: reports_types_1.ReportFormat.PDF,
            year: year,
            startDate: yearStartDate.toISOString(),
            endDate: yearEndDate.toISOString(),
            includeArchived: false,
            includeCharts: false,
            includeStatistics: false
        };
        const [totalConventions, totalTransfers] = await Promise.all([
            report_service_1.reportService.getConventionsData(conventionsFilters),
            report_service_1.reportService.getKnowledgeTransfersData(transfersFilters)
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
    async getAvailableQuarters(req, res) {
        try {
            const { year } = req.query;
            const targetYear = year ? parseInt(year) : new Date().getFullYear();
            const quarters = quarter_service_1.quarterService.getYearQuarters(targetYear);
            const currentQuarter = quarter_service_1.quarterService.getCurrentQuarter();
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
                        label: quarter_service_1.quarterService.formatQuarterLabel(q.year, q.quarter),
                        startDate: q.startDate,
                        endDate: q.endDate
                    }))
                }
            });
        }
        catch (error) {
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
    async getQuarterlyStats(req, res) {
        try {
            const { year, quarter } = req.query;
            const targetYear = year ? parseInt(year) : new Date().getFullYear();
            const targetQuarter = quarter ? parseInt(quarter) : quarter_service_1.quarterService.getCurrentQuarter().quarter;
            const filters = {
                reportType: reports_types_1.ReportType.ACTIVITIES,
                format: reports_types_1.ReportFormat.PDF,
                year: targetYear,
                quarter: targetQuarter,
                includeArchived: false,
                includeCharts: false,
                includeStatistics: true
            };
            const stats = await report_service_1.reportService.getQuarterlyStatistics(filters);
            res.json({
                success: true,
                data: stats
            });
        }
        catch (error) {
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
    async getAnnualStats(req, res) {
        try {
            const { year } = req.query;
            const targetYear = year ? parseInt(year) : new Date().getFullYear();
            const statistics = await this.getAnnualStatistics(targetYear);
            res.json({
                success: true,
                data: statistics
            });
        }
        catch (error) {
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
    async compareQuarters(req, res) {
        try {
            const { year1, quarter1, year2, quarter2 } = req.query;
            if (!year1 || !quarter1 || !year2 || !quarter2) {
                res.status(400).json({
                    success: false,
                    message: 'Paramètres manquants: year1, quarter1, year2, quarter2 requis'
                });
                return;
            }
            const filters1 = {
                reportType: reports_types_1.ReportType.ACTIVITIES,
                format: reports_types_1.ReportFormat.PDF,
                year: parseInt(year1),
                quarter: parseInt(quarter1),
                includeArchived: false,
                includeCharts: false,
                includeStatistics: true
            };
            const filters2 = {
                reportType: reports_types_1.ReportType.ACTIVITIES,
                format: reports_types_1.ReportFormat.PDF,
                year: parseInt(year2),
                quarter: parseInt(quarter2),
                includeArchived: false,
                includeCharts: false,
                includeStatistics: true
            };
            const [stats1, stats2] = await Promise.all([
                report_service_1.reportService.getQuarterlyStatistics(filters1),
                report_service_1.reportService.getQuarterlyStatistics(filters2)
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
        }
        catch (error) {
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
    async getAvailableReports(req, res) {
        try {
            const reports = [
                {
                    type: reports_types_1.ReportType.ACTIVITIES,
                    name: 'Rapport des activités',
                    description: 'Liste toutes les activités avec leurs responsables et statuts',
                    formats: [reports_types_1.ReportFormat.PDF, reports_types_1.ReportFormat.WORD],
                    periodicity: ['quarterly', 'annual']
                },
                {
                    type: reports_types_1.ReportType.CONVENTIONS,
                    name: 'Rapport des conventions',
                    description: 'Liste des conventions avec leurs financements',
                    formats: [reports_types_1.ReportFormat.PDF, reports_types_1.ReportFormat.WORD],
                    periodicity: ['quarterly', 'annual']
                },
                {
                    type: reports_types_1.ReportType.KNOWLEDGE_TRANSFERS,
                    name: 'Rapport des transferts de connaissances',
                    description: 'Liste des acquis transférables',
                    formats: [reports_types_1.ReportFormat.PDF, reports_types_1.ReportFormat.WORD],
                    periodicity: ['quarterly', 'annual']
                }
            ];
            res.json({
                success: true,
                data: reports
            });
        }
        catch (error) {
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
    async cleanOldReports(req, res) {
        try {
            await document_generator_service_1.documentGeneratorService.cleanOldReports();
            res.json({
                success: true,
                message: 'Anciens rapports nettoyés avec succès'
            });
        }
        catch (error) {
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
    async generateActivitiesReport(format, filters) {
        const activities = await report_service_1.reportService.getActivitiesData(filters);
        if (format === reports_types_1.ReportFormat.PDF) {
            return await document_generator_service_1.documentGeneratorService.generateActivitiesPDF(activities, filters);
        }
        else {
            return await document_generator_service_1.documentGeneratorService.generateActivitiesWORD(activities, filters);
        }
    }
    async generateConventionsReport(format, filters) {
        const conventions = await report_service_1.reportService.getConventionsData(filters);
        if (format === reports_types_1.ReportFormat.PDF) {
            return await document_generator_service_1.documentGeneratorService.generateConventionsPDF(conventions, filters);
        }
        else {
            return await document_generator_service_1.documentGeneratorService.generateConventionsWORD(conventions, filters);
        }
    }
    async generateKnowledgeTransfersReport(format, filters) {
        const transfers = await report_service_1.reportService.getKnowledgeTransfersData(filters);
        if (format === reports_types_1.ReportFormat.PDF) {
            return await document_generator_service_1.documentGeneratorService.generateKnowledgeTransfersPDF(transfers, filters);
        }
        else {
            return await document_generator_service_1.documentGeneratorService.generateKnowledgeTransfersWORD(transfers, filters);
        }
    }
    /**
     * Envoie le fichier généré au client
     */
    sendFile(res, filepath) {
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
exports.ReportController = ReportController;
exports.reportController = new ReportController();
//# sourceMappingURL=report.controller.js.map