"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormationController = void 0;
const tslib_1 = require("tslib");
const formation_service_1 = require("../services/formation.service");
const formation_report_service_1 = require("../utils/formation-report.service");
const formation_types_1 = require("../types/formation.types");
const zod_1 = require("zod");
const puppeteer_1 = tslib_1.__importDefault(require("puppeteer"));
class FormationController {
    constructor() {
        // ============= FORMATIONS COURTES REÇUES =============
        this.createShortTrainingReceived = async (req, res) => {
            try {
                const userId = req.user.userId;
                if (!userId) {
                    res.status(401).json({ error: 'Utilisateur non authentifié' });
                    return;
                }
                const validatedData = formation_types_1.createShortTrainingReceivedSchema.parse(req.body);
                const training = await this.formationService.createShortTrainingReceived(userId, validatedData);
                res.status(201).json({
                    success: true,
                    data: training,
                    message: 'Formation courte reçue créée avec succès'
                });
            }
            catch (error) {
                if (error instanceof zod_1.z.ZodError) {
                    res.status(400).json({
                        error: 'Données invalides',
                        details: error.issues
                    });
                }
                else {
                    console.error('Erreur lors de la création de la formation courte reçue:', error);
                    res.status(500).json({
                        error: 'Erreur interne du serveur',
                        message: error instanceof Error ? error.message : 'Erreur inconnue'
                    });
                }
            }
        };
        this.getUserShortTrainingsReceived = async (req, res) => {
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
            }
            catch (error) {
                console.error('Erreur lors de la récupération des formations courtes reçues:', error);
                res.status(500).json({
                    error: 'Erreur interne du serveur',
                    message: error instanceof Error ? error.message : 'Erreur inconnue'
                });
            }
        };
        this.updateShortTrainingReceived = async (req, res) => {
            try {
                const userId = req.user.userId;
                const { trainingId } = req.params;
                if (!userId) {
                    res.status(401).json({ error: 'Utilisateur non authentifié' });
                    return;
                }
                const validatedData = formation_types_1.createShortTrainingReceivedSchema.partial().parse(req.body);
                const training = await this.formationService.updateShortTrainingReceived(trainingId, userId, validatedData);
                res.status(200).json({
                    success: true,
                    data: training,
                    message: 'Formation courte reçue modifiée avec succès'
                });
            }
            catch (error) {
                if (error instanceof zod_1.z.ZodError) {
                    res.status(400).json({
                        error: 'Données invalides',
                        details: error.issues
                    });
                }
                else {
                    console.error('Erreur lors de la modification de la formation courte reçue:', error);
                    res.status(500).json({
                        error: 'Erreur interne du serveur',
                        message: error instanceof Error ? error.message : 'Erreur inconnue'
                    });
                }
            }
        };
        this.deleteShortTrainingReceived = async (req, res) => {
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
            }
            catch (error) {
                console.error('Erreur lors de la suppression de la formation courte reçue:', error);
                res.status(500).json({
                    error: 'Erreur interne du serveur',
                    message: error instanceof Error ? error.message : 'Erreur inconnue'
                });
            }
        };
        // ============= FORMATIONS DIPLÔMANTES REÇUES =============
        this.createDiplomaticTrainingReceived = async (req, res) => {
            try {
                const userId = req.user.userId;
                if (!userId) {
                    res.status(401).json({ error: 'Utilisateur non authentifié' });
                    return;
                }
                const validatedData = formation_types_1.createDiplomaticTrainingReceivedSchema.parse(req.body);
                const training = await this.formationService.createDiplomaticTrainingReceived(userId, validatedData);
                res.status(201).json({
                    success: true,
                    data: training,
                    message: 'Formation diplômante reçue créée avec succès'
                });
            }
            catch (error) {
                if (error instanceof zod_1.z.ZodError) {
                    res.status(400).json({
                        error: 'Données invalides',
                        details: error.issues
                    });
                }
                else {
                    console.error('Erreur lors de la création de la formation diplômante reçue:', error);
                    res.status(500).json({
                        error: 'Erreur interne du serveur',
                        message: error instanceof Error ? error.message : 'Erreur inconnue'
                    });
                }
            }
        };
        this.getUserDiplomaticTrainingsReceived = async (req, res) => {
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
            }
            catch (error) {
                console.error('Erreur lors de la récupération des formations diplômantes reçues:', error);
                res.status(500).json({
                    error: 'Erreur interne du serveur',
                    message: error instanceof Error ? error.message : 'Erreur inconnue'
                });
            }
        };
        this.updateDiplomaticTrainingReceived = async (req, res) => {
            try {
                const userId = req.user.userId;
                const { trainingId } = req.params;
                if (!userId) {
                    res.status(401).json({ error: 'Utilisateur non authentifié' });
                    return;
                }
                const validatedData = formation_types_1.createDiplomaticTrainingReceivedSchema.partial().parse(req.body);
                const training = await this.formationService.updateDiplomaticTrainingReceived(trainingId, userId, validatedData);
                res.status(200).json({
                    success: true,
                    data: training,
                    message: 'Formation diplômante reçue modifiée avec succès'
                });
            }
            catch (error) {
                if (error instanceof zod_1.z.ZodError) {
                    res.status(400).json({
                        error: 'Données invalides',
                        details: error.issues
                    });
                }
                else {
                    console.error('Erreur lors de la modification de la formation diplômante reçue:', error);
                    res.status(500).json({
                        error: 'Erreur interne du serveur',
                        message: error instanceof Error ? error.message : 'Erreur inconnue'
                    });
                }
            }
        };
        this.deleteDiplomaticTrainingReceived = async (req, res) => {
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
            }
            catch (error) {
                console.error('Erreur lors de la suppression de la formation diplômante reçue:', error);
                res.status(500).json({
                    error: 'Erreur interne du serveur',
                    message: error instanceof Error ? error.message : 'Erreur inconnue'
                });
            }
        };
        // ============= FORMATIONS DISPENSÉES =============
        this.createTrainingGiven = async (req, res) => {
            try {
                const userId = req.user.userId;
                if (!userId) {
                    res.status(401).json({ error: 'Utilisateur non authentifié' });
                    return;
                }
                const validatedData = formation_types_1.createTrainingGivenSchema.parse(req.body);
                const training = await this.formationService.createTrainingGiven(userId, validatedData);
                res.status(201).json({
                    success: true,
                    data: training,
                    message: 'Formation dispensée créée avec succès'
                });
            }
            catch (error) {
                if (error instanceof zod_1.z.ZodError) {
                    res.status(400).json({
                        error: 'Données invalides',
                        details: error.issues
                    });
                }
                else {
                    console.error('Erreur lors de la création de la formation dispensée:', error);
                    res.status(500).json({
                        error: 'Erreur interne du serveur',
                        message: error instanceof Error ? error.message : 'Erreur inconnue'
                    });
                }
            }
        };
        this.getUserTrainingsGiven = async (req, res) => {
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
            }
            catch (error) {
                console.error('Erreur lors de la récupération des formations dispensées:', error);
                res.status(500).json({
                    error: 'Erreur interne du serveur',
                    message: error instanceof Error ? error.message : 'Erreur inconnue'
                });
            }
        };
        this.updateTrainingGiven = async (req, res) => {
            try {
                const userId = req.user.userId;
                const { trainingId } = req.params;
                if (!userId) {
                    res.status(401).json({ error: 'Utilisateur non authentifié' });
                    return;
                }
                const validatedData = formation_types_1.createTrainingGivenSchema.partial().parse(req.body);
                const training = await this.formationService.updateTrainingGiven(trainingId, userId, validatedData);
                res.status(200).json({
                    success: true,
                    data: training,
                    message: 'Formation dispensée modifiée avec succès'
                });
            }
            catch (error) {
                if (error instanceof zod_1.z.ZodError) {
                    res.status(400).json({
                        error: 'Données invalides',
                        details: error.issues
                    });
                }
                else {
                    console.error('Erreur lors de la modification de la formation dispensée:', error);
                    res.status(500).json({
                        error: 'Erreur interne du serveur',
                        message: error instanceof Error ? error.message : 'Erreur inconnue'
                    });
                }
            }
        };
        this.deleteTrainingGiven = async (req, res) => {
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
            }
            catch (error) {
                console.error('Erreur lors de la suppression de la formation dispensée:', error);
                res.status(500).json({
                    error: 'Erreur interne du serveur',
                    message: error instanceof Error ? error.message : 'Erreur inconnue'
                });
            }
        };
        // ============= ENCADREMENTS =============
        this.createSupervision = async (req, res) => {
            try {
                const userId = req.user.userId;
                if (!userId) {
                    res.status(401).json({ error: 'Utilisateur non authentifié' });
                    return;
                }
                const validatedData = formation_types_1.createSupervisionSchema.parse(req.body);
                const supervision = await this.formationService.createSupervision(userId, validatedData);
                res.status(201).json({
                    success: true,
                    data: supervision,
                    message: 'Encadrement créé avec succès'
                });
            }
            catch (error) {
                if (error instanceof zod_1.z.ZodError) {
                    res.status(400).json({
                        error: 'Données invalides',
                        details: error.issues
                    });
                }
                else {
                    console.error('Erreur lors de la création de l\'encadrement:', error);
                    res.status(500).json({
                        error: 'Erreur interne du serveur',
                        message: error instanceof Error ? error.message : 'Erreur inconnue'
                    });
                }
            }
        };
        this.getUserSupervisions = async (req, res) => {
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
            }
            catch (error) {
                console.error('Erreur lors de la récupération des encadrements:', error);
                res.status(500).json({
                    error: 'Erreur interne du serveur',
                    message: error instanceof Error ? error.message : 'Erreur inconnue'
                });
            }
        };
        this.updateSupervision = async (req, res) => {
            try {
                const userId = req.user.userId;
                const { supervisionId } = req.params;
                if (!userId) {
                    res.status(401).json({ error: 'Utilisateur non authentifié' });
                    return;
                }
                const validatedData = formation_types_1.createSupervisionSchema.partial().parse(req.body);
                const supervision = await this.formationService.updateSupervision(supervisionId, userId, validatedData);
                res.status(200).json({
                    success: true,
                    data: supervision,
                    message: 'Encadrement modifié avec succès'
                });
            }
            catch (error) {
                if (error instanceof zod_1.z.ZodError) {
                    res.status(400).json({
                        error: 'Données invalides',
                        details: error.issues
                    });
                }
                else {
                    console.error('Erreur lors de la modification de l\'encadrement:', error);
                    res.status(500).json({
                        error: 'Erreur interne du serveur',
                        message: error instanceof Error ? error.message : 'Erreur inconnue'
                    });
                }
            }
        };
        this.deleteSupervision = async (req, res) => {
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
            }
            catch (error) {
                console.error('Erreur lors de la suppression de l\'encadrement:', error);
                res.status(500).json({
                    error: 'Erreur interne du serveur',
                    message: error instanceof Error ? error.message : 'Erreur inconnue'
                });
            }
        };
        // ============= RAPPORTS (COORDINATEUR/ADMIN) =============
        this.getAllUsersFormationReport = async (req, res) => {
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
            }
            catch (error) {
                console.error('Erreur lors de la génération du rapport global:', error);
                res.status(500).json({
                    error: 'Erreur interne du serveur',
                    message: error instanceof Error ? error.message : 'Erreur inconnue'
                });
            }
        };
        this.getUserFormationReport = async (req, res) => {
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
            }
            catch (error) {
                console.error('Erreur lors de la génération du rapport utilisateur:', error);
                res.status(500).json({
                    error: 'Erreur interne du serveur',
                    message: error instanceof Error ? error.message : 'Erreur inconnue'
                });
            }
        };
        this.downloadFormationReport = async (req, res) => {
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
                if (!format || format !== 'pdf') {
                    res.status(400).json({ error: 'Format invalide. Seul le PDF est supporté actuellement' });
                    return;
                }
                let reportData;
                let htmlContent;
                let filename;
                // Déterminer quel userId utiliser
                const effectiveUserId = targetUserId || currentUserId;
                const isGlobalReport = !targetUserId && isAdminOrCoordinator;
                if (isGlobalReport) {
                    // Rapport global pour admin/coordinateur
                    reportData = await this.formationService.getAllUsersFormationReport();
                    htmlContent = this.reportService.generateGlobalHTMLContent(reportData);
                    filename = this.reportService.generateFilename(reportData, 'pdf');
                }
                else {
                    // Rapport individuel
                    const userId = effectiveUserId;
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
                }
                await this.generatePDFReport(res, htmlContent, filename);
            }
            catch (error) {
                console.error('Erreur lors du téléchargement du rapport:', error);
                res.status(500).json({
                    error: 'Erreur interne du serveur',
                    message: error instanceof Error ? error.message : 'Erreur inconnue'
                });
            }
        };
        this.formationService = new formation_service_1.FormationService();
        this.reportService = new formation_report_service_1.FormationReportService();
    }
    // ============= MÉTHODE PRIVÉE POUR GÉNÉRATION PDF =============
    async generatePDFReport(res, htmlContent, filename) {
        let browser;
        try {
            browser = await puppeteer_1.default.launch({
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
        }
        catch (error) {
            console.error('Erreur lors de la génération PDF:', error);
            throw error;
        }
        finally {
            if (browser) {
                await browser.close();
            }
        }
    }
}
exports.FormationController = FormationController;
//# sourceMappingURL=formation.controller.js.map