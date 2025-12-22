"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormationController = void 0;
const formation_service_1 = require("../services/formation.service");
const formation_report_service_1 = require("../utils/formation-report.service");
const formation_types_1 = require("../types/formation.types");
const zod_1 = require("zod");
const docx_1 = require("docx");
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
                // Par défaut on utilise docx
                const reportFormat = 'docx';
                let reportData;
                let filename;
                // Déterminer quel userId utiliser
                const effectiveUserId = targetUserId || currentUserId;
                const isGlobalReport = !targetUserId && isAdminOrCoordinator;
                if (isGlobalReport) {
                    // Rapport global pour admin/coordinateur
                    reportData = await this.formationService.getAllUsersFormationReport();
                    filename = this.reportService.generateFilename(reportData, reportFormat);
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
                    filename = this.reportService.generateFilename(reportData, reportFormat);
                }
                // Générer le rapport Word
                await this.generateWordReport(res, reportData, filename);
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
    // ============= MÉTHODE PRIVÉE POUR GÉNÉRATION WORD =============
    async generateWordReport(res, reportData, filename) {
        try {
            const { user, shortTrainingsReceived, diplomaticTrainingsReceived, trainingsGiven, supervisions } = reportData;
            // Helper pour créer des cellules d'en-tête en gras
            const createHeaderCell = (text) => new docx_1.TableCell({
                children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text, bold: true })] })]
            });
            const sections = [];
            // En-tête du document
            sections.push(new docx_1.Paragraph({
                text: "RAPPORT DE FORMATION ET ENCADREMENT",
                heading: docx_1.HeadingLevel.HEADING_1,
                alignment: docx_1.AlignmentType.CENTER,
                spacing: { after: 200 }
            }), new docx_1.Paragraph({
                text: "Centre de Recherche Agricole (CRA)",
                alignment: docx_1.AlignmentType.CENTER,
                spacing: { after: 400 }
            }));
            // Informations du chercheur
            sections.push(new docx_1.Paragraph({
                text: "Informations du Chercheur",
                heading: docx_1.HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 200 }
            }), new docx_1.Paragraph({
                children: [
                    new docx_1.TextRun({ text: "Nom: ", bold: true }),
                    new docx_1.TextRun(`${user.firstName} ${user.lastName}`)
                ],
                spacing: { after: 100 }
            }), new docx_1.Paragraph({
                children: [
                    new docx_1.TextRun({ text: "Email: ", bold: true }),
                    new docx_1.TextRun(user.email)
                ],
                spacing: { after: 100 }
            }), new docx_1.Paragraph({
                children: [
                    new docx_1.TextRun({ text: "Date de génération: ", bold: true }),
                    new docx_1.TextRun(new Date().toLocaleDateString('fr-FR'))
                ],
                spacing: { after: 400 }
            }));
            // Résumé
            sections.push(new docx_1.Paragraph({
                text: "Résumé",
                heading: docx_1.HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 200 }
            }), new docx_1.Paragraph({
                text: `Formations courtes reçues: ${shortTrainingsReceived?.length || 0}`,
                spacing: { after: 100 }
            }), new docx_1.Paragraph({
                text: `Formations diplômantes reçues: ${diplomaticTrainingsReceived?.length || 0}`,
                spacing: { after: 100 }
            }), new docx_1.Paragraph({
                text: `Formations dispensées: ${trainingsGiven?.length || 0}`,
                spacing: { after: 100 }
            }), new docx_1.Paragraph({
                text: `Encadrements: ${supervisions?.length || 0}`,
                spacing: { after: 400 }
            }));
            // Tableau des formations courtes reçues
            if (shortTrainingsReceived && shortTrainingsReceived.length > 0) {
                sections.push(new docx_1.Paragraph({
                    text: "Tableau 11: Formations de courtes durées reçues par les agents",
                    heading: docx_1.HeadingLevel.HEADING_2,
                    spacing: { before: 400, after: 200 }
                }));
                const shortTrainingRows = [
                    new docx_1.TableRow({
                        tableHeader: true,
                        children: [
                            createHeaderCell("Intitulé de la formation"),
                            createHeaderCell("Objectifs"),
                            createHeaderCell("Période/Durée"),
                            createHeaderCell("Lieu"),
                            createHeaderCell("Bénéficiaires")
                        ]
                    }),
                    ...shortTrainingsReceived.map((training) => new docx_1.TableRow({
                        children: [
                            new docx_1.TableCell({ children: [new docx_1.Paragraph(training.title)] }),
                            new docx_1.TableCell({ children: [new docx_1.Paragraph(Array.isArray(training.objectives) ? training.objectives.join('; ') : '')] }),
                            new docx_1.TableCell({ children: [new docx_1.Paragraph(training.period || 'Non spécifiée')] }),
                            new docx_1.TableCell({ children: [new docx_1.Paragraph(training.location)] }),
                            new docx_1.TableCell({ children: [new docx_1.Paragraph(Array.isArray(training.beneficiaries) && training.beneficiaries.length > 0 ? training.beneficiaries.join(', ') : 'Agent connecté')] })
                        ]
                    }))
                ];
                sections.push(new docx_1.Table({ rows: shortTrainingRows, width: { size: 100, type: docx_1.WidthType.PERCENTAGE } }));
            }
            // Tableau des formations diplômantes
            if (diplomaticTrainingsReceived && diplomaticTrainingsReceived.length > 0) {
                sections.push(new docx_1.Paragraph({
                    text: "c. Formations diplômantes reçues par les agents",
                    heading: docx_1.HeadingLevel.HEADING_2,
                    spacing: { before: 400, after: 200 }
                }));
                const diplomaticRows = [
                    new docx_1.TableRow({
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
                    ...diplomaticTrainingsReceived.map((training) => new docx_1.TableRow({
                        children: [
                            new docx_1.TableCell({ children: [new docx_1.Paragraph(training.studentName)] }),
                            new docx_1.TableCell({ children: [new docx_1.Paragraph(training.level)] }),
                            new docx_1.TableCell({ children: [new docx_1.Paragraph(training.specialty)] }),
                            new docx_1.TableCell({ children: [new docx_1.Paragraph(training.university)] }),
                            new docx_1.TableCell({ children: [new docx_1.Paragraph(training.period)] }),
                            new docx_1.TableCell({ children: [new docx_1.Paragraph(training.diplomaObtained === 'OUI' ? 'Oui' : training.diplomaObtained === 'EN_COURS' ? 'Non (en cours)' : 'Non')] })
                        ]
                    }))
                ];
                sections.push(new docx_1.Table({ rows: diplomaticRows, width: { size: 100, type: docx_1.WidthType.PERCENTAGE } }));
            }
            // Tableau des formations dispensées
            if (trainingsGiven && trainingsGiven.length > 0) {
                sections.push(new docx_1.Paragraph({
                    text: "b. Enseignements dispensés dans les universités et grandes écoles",
                    heading: docx_1.HeadingLevel.HEADING_2,
                    spacing: { before: 400, after: 200 }
                }));
                const trainingsGivenRows = [
                    new docx_1.TableRow({
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
                    ...trainingsGiven.map((training) => new docx_1.TableRow({
                        children: [
                            new docx_1.TableCell({ children: [new docx_1.Paragraph(training.title)] }),
                            new docx_1.TableCell({ children: [new docx_1.Paragraph(training.type || '-')] }),
                            new docx_1.TableCell({ children: [new docx_1.Paragraph(training.institution)] }),
                            new docx_1.TableCell({ children: [new docx_1.Paragraph(training.department || '-')] }),
                            new docx_1.TableCell({ children: [new docx_1.Paragraph(`${training.duration || '-'} heures`)] }),
                            new docx_1.TableCell({ children: [new docx_1.Paragraph('1')] })
                        ]
                    }))
                ];
                sections.push(new docx_1.Table({ rows: trainingsGivenRows, width: { size: 100, type: docx_1.WidthType.PERCENTAGE } }));
            }
            // Tableau des encadrements
            if (supervisions && supervisions.length > 0) {
                sections.push(new docx_1.Paragraph({
                    text: "Tableau 8: Encadrements",
                    heading: docx_1.HeadingLevel.HEADING_2,
                    spacing: { before: 400, after: 200 }
                }));
                const supervisionRows = [
                    new docx_1.TableRow({
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
                    ...supervisions.map((supervision) => new docx_1.TableRow({
                        children: [
                            new docx_1.TableCell({ children: [new docx_1.Paragraph(supervision.studentName)] }),
                            new docx_1.TableCell({ children: [new docx_1.Paragraph(supervision.title)] }),
                            new docx_1.TableCell({ children: [new docx_1.Paragraph(supervision.specialty)] }),
                            new docx_1.TableCell({ children: [new docx_1.Paragraph(supervision.type)] }),
                            new docx_1.TableCell({ children: [new docx_1.Paragraph(supervision.university)] }),
                            new docx_1.TableCell({ children: [new docx_1.Paragraph(`${new Date(supervision.startDate).getFullYear()} - ${supervision.endDate ? new Date(supervision.endDate).getFullYear() : 'En cours'}`)] }),
                            new docx_1.TableCell({ children: [new docx_1.Paragraph(supervision.expectedDefenseDate ? new Date(supervision.expectedDefenseDate).toLocaleDateString('fr-FR') : 'À définir')] }),
                            new docx_1.TableCell({ children: [new docx_1.Paragraph(`Dr. ${supervision.studentName}`)] }),
                            new docx_1.TableCell({ children: [new docx_1.Paragraph(supervision.status === 'SOUTENU' ? 'OUI' : 'NON')] })
                        ]
                    }))
                ];
                sections.push(new docx_1.Table({ rows: supervisionRows, width: { size: 100, type: docx_1.WidthType.PERCENTAGE } }));
            }
            // Pied de page
            sections.push(new docx_1.Paragraph({
                text: `Rapport généré automatiquement le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
                alignment: docx_1.AlignmentType.CENTER,
                spacing: { before: 600 }
            }));
            // Créer le document
            const doc = new docx_1.Document({
                sections: [{
                        properties: {},
                        children: sections
                    }]
            });
            // Générer le buffer
            const buffer = await docx_1.Packer.toBuffer(doc);
            // Envoyer la réponse
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Length', buffer.length.toString());
            res.send(buffer);
        }
        catch (error) {
            console.error('Erreur lors de la génération Word:', error);
            throw error;
        }
    }
}
exports.FormationController = FormationController;
//# sourceMappingURL=formation.controller.js.map