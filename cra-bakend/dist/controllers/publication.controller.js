"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicationController = exports.PublicationController = void 0;
const tslib_1 = require("tslib");
const publication_service_1 = require("../services/publication.service");
const reportGenerator_1 = require("../utils/reportGenerator");
const fs_1 = tslib_1.__importDefault(require("fs"));
const publication_types_1 = require("../types/publication.types");
class PublicationController {
    async createPublication(req, res) {
        try {
            const validatedData = publication_types_1.createPublicationSchema.parse(req.body);
            const userId = req.user.userId;
            const publication = await publication_service_1.publicationService.createPublication(validatedData, userId);
            res.status(201).json({
                success: true,
                message: "Publication créée avec succès",
                data: publication
            });
        }
        catch (error) {
            console.error('Error creating publication:', error);
            res.status(400).json({
                success: false,
                message: error.message || "Erreur lors de la création de la publication"
            });
        }
    }
    async getPublications(req, res) {
        try {
            const query = publication_types_1.publicationQuerySchema.parse(req.query);
            const userId = req.user.userId;
            const userRole = req.user.role;
            const result = await publication_service_1.publicationService.getPublications(query, userId, userRole);
            res.status(200).json({
                success: true,
                data: result.publications,
                pagination: result.pagination
            });
        }
        catch (error) {
            console.error('Error fetching publications:', error);
            res.status(400).json({
                success: false,
                message: error.message || "Erreur lors de la récupération des publications"
            });
        }
    }
    async getPublicationById(req, res) {
        try {
            const { id } = req.params;
            const publication = await publication_service_1.publicationService.getPublicationById(id);
            res.status(200).json({
                success: true,
                data: publication
            });
        }
        catch (error) {
            console.error('Error fetching publication:', error);
            res.status(404).json({
                success: false,
                message: error.message || "Publication non trouvée"
            });
        }
    }
    async updatePublication(req, res) {
        try {
            const { id } = req.params;
            const validatedData = publication_types_1.updatePublicationSchema.parse(req.body);
            const userId = req.user.userId;
            const publication = await publication_service_1.publicationService.updatePublication(id, validatedData, userId);
            res.status(200).json({
                success: true,
                message: "Publication mise à jour avec succès",
                data: publication
            });
        }
        catch (error) {
            console.error('Error updating publication:', error);
            res.status(400).json({
                success: false,
                message: error.message || "Erreur lors de la mise à jour de la publication"
            });
        }
    }
    async deletePublication(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.userId;
            const userRole = req.user.role;
            const result = await publication_service_1.publicationService.deletePublication(id, userId, userRole);
            res.status(200).json({
                success: true,
                message: result.message
            });
        }
        catch (error) {
            console.error('Error deleting publication:', error);
            res.status(400).json({
                success: false,
                message: error.message || "Erreur lors de la suppression de la publication"
            });
        }
    }
    async getMyPublications(req, res) {
        try {
            const userId = req.user.userId;
            const year = req.query.year ? parseInt(req.query.year) : undefined;
            const publications = await publication_service_1.publicationService.getResearcherPublications(userId, year);
            res.status(200).json({
                success: true,
                data: publications
            });
        }
        catch (error) {
            console.error('Error fetching researcher publications:', error);
            res.status(400).json({
                success: false,
                message: error.message || "Erreur lors de la récupération des publications"
            });
        }
    }
    async getPublicationStats(req, res) {
        try {
            const userId = req.query.userId;
            const stats = await publication_service_1.publicationService.getPublicationStats(userId);
            res.status(200).json({
                success: true,
                data: stats
            });
        }
        catch (error) {
            console.error('Error fetching publication stats:', error);
            res.status(400).json({
                success: false,
                message: error.message || "Erreur lors du calcul des statistiques"
            });
        }
    }
    async uploadDocument(req, res) {
        try {
            const { id } = req.params;
            const file = req.file;
            const userId = req.user.userId;
            if (!file) {
                return res.status(400).json({
                    success: false,
                    message: "Aucun fichier fourni"
                });
            }
            const publication = await publication_service_1.publicationService.attachDocument(id, file, userId);
            res.status(200).json({
                success: true,
                message: "Document attaché avec succès",
                data: publication
            });
        }
        catch (error) {
            console.error('Error uploading document:', error);
            if (req.file && fs_1.default.existsSync(req.file.path)) {
                fs_1.default.unlinkSync(req.file.path);
            }
            res.status(400).json({
                success: false,
                message: error.message || "Erreur lors de l'upload du document"
            });
        }
    }
    async downloadDocument(req, res) {
        try {
            const { id } = req.params;
            const document = await publication_service_1.publicationService.downloadDocument(id);
            res.download(document.filepath, document.filename);
        }
        catch (error) {
            console.error('Error downloading document:', error);
            res.status(404).json({
                success: false,
                message: error.message || "Erreur lors du téléchargement"
            });
        }
    }
    async generateReport(req, res) {
        try {
            const { researcherId, year, format } = req.query;
            if (!researcherId || !year) {
                return res.status(400).json({
                    success: false,
                    message: "Les paramètres researcherId et year sont requis"
                });
            }
            const reportFormat = format || 'pdf';
            if (!['pdf', 'docx'].includes(reportFormat)) {
                return res.status(400).json({
                    success: false,
                    message: "Format invalide. Utilisez 'pdf' ou 'docx'"
                });
            }
            const filename = await reportGenerator_1.reportGenerator.generatePublicationReport(researcherId, parseInt(year), reportFormat);
            const filepath = `./reports/${filename}`;
            res.download(filepath, filename, (err) => {
                if (err) {
                    console.error('Error downloading report:', err);
                }
                fs_1.default.unlinkSync(filepath);
            });
        }
        catch (error) {
            console.error('Error generating report:', error);
            res.status(400).json({
                success: false,
                message: error.message || "Erreur lors de la génération du rapport"
            });
        }
    }
}
exports.PublicationController = PublicationController;
exports.publicationController = new PublicationController();
//# sourceMappingURL=publication.controller.js.map