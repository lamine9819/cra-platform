"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventController = void 0;
const tslib_1 = require("tslib");
const event_service_1 = tslib_1.__importDefault(require("../services/event.service"));
const reportEvent_service_1 = tslib_1.__importDefault(require("../services/reportEvent.service"));
const client_1 = require("@prisma/client");
const fs = tslib_1.__importStar(require("fs"));
class EventController {
    // ==================== ÉVÉNEMENTS ====================
    async createEvent(req, res, next) {
        try {
            const userId = req.user.id;
            const eventData = req.body;
            const event = await event_service_1.default.createEvent(userId, eventData);
            res.status(201).json({
                success: true,
                message: 'Événement créé avec succès',
                data: event
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getEvent(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const userRole = req.user.role;
            const event = await event_service_1.default.getEventById(id, userId, userRole);
            res.status(200).json({
                success: true,
                data: event
            });
        }
        catch (error) {
            next(error);
        }
    }
    async listEvents(req, res, next) {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;
            const filters = req.query;
            const events = await event_service_1.default.listEvents(userId, userRole, filters);
            res.status(200).json({
                success: true,
                count: events.length,
                data: events
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateEvent(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const userRole = req.user.role;
            const updateData = req.body;
            const event = await event_service_1.default.updateEvent(id, userId, userRole, updateData);
            res.status(200).json({
                success: true,
                message: 'Événement mis à jour avec succès',
                data: event
            });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteEvent(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const userRole = req.user.role;
            const result = await event_service_1.default.deleteEvent(id, userId, userRole);
            res.status(200).json({
                success: true,
                message: result.message
            });
        }
        catch (error) {
            next(error);
        }
    }
    async addDocumentToEvent(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Aucun fichier fourni'
                });
            }
            const documentData = {
                title: req.body.title || req.file.originalname,
                filename: req.file.filename,
                filepath: req.file.path,
                mimeType: req.file.mimetype,
                size: BigInt(req.file.size),
                type: req.body.type || client_1.DocumentType.AUTRE,
                description: req.body.description
            };
            const document = await event_service_1.default.addDocumentToEvent(id, userId, documentData);
            res.status(201).json({
                success: true,
                message: 'Document ajouté avec succès',
                data: document
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getEventStatistics(req, res, next) {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;
            const stats = await event_service_1.default.getEventStatistics(userId, userRole);
            res.status(200).json({
                success: true,
                data: stats
            });
        }
        catch (error) {
            next(error);
        }
    }
    // ==================== SÉMINAIRES ====================
    async createSeminar(req, res, next) {
        try {
            const userId = req.user.id;
            const seminarData = req.body;
            const seminar = await event_service_1.default.createSeminar(userId, seminarData);
            res.status(201).json({
                success: true,
                message: 'Séminaire créé avec succès',
                data: seminar
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getSeminar(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const userRole = req.user.role;
            const seminar = await event_service_1.default.getSeminarById(id, userId, userRole);
            res.status(200).json({
                success: true,
                data: seminar
            });
        }
        catch (error) {
            next(error);
        }
    }
    async listSeminars(req, res, next) {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;
            const filters = req.query;
            const seminars = await event_service_1.default.listSeminars(userId, userRole, filters);
            res.status(200).json({
                success: true,
                count: seminars.length,
                data: seminars
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateSeminar(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const updateData = req.body;
            const seminar = await event_service_1.default.updateSeminar(id, userId, updateData);
            res.status(200).json({
                success: true,
                message: 'Séminaire mis à jour avec succès',
                data: seminar
            });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteSeminar(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const result = await event_service_1.default.deleteSeminar(id, userId);
            res.status(200).json({
                success: true,
                message: result.message
            });
        }
        catch (error) {
            next(error);
        }
    }
    async addDocumentToSeminar(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Aucun fichier fourni'
                });
            }
            const documentData = {
                title: req.body.title || req.file.originalname,
                filename: req.file.filename,
                filepath: req.file.path,
                mimeType: req.file.mimetype,
                size: BigInt(req.file.size),
                type: req.body.type || client_1.DocumentType.AUTRE,
                description: req.body.description
            };
            const document = await event_service_1.default.addDocumentToSeminar(id, userId, documentData);
            res.status(201).json({
                success: true,
                message: 'Document ajouté avec succès',
                data: document
            });
        }
        catch (error) {
            next(error);
        }
    }
    // =================== RAPPORTS ===================
    async generateEventReport(req, res, next) {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;
            // Map and validate query parameters to EventReportDto
            const filters = {
                format: req.query.format,
                startDate: req.query.startDate ? new Date(req.query.startDate) : undefined,
                endDate: req.query.endDate ? new Date(req.query.endDate) : undefined,
                type: req.query.type, // Cast as needed to EventType
                creatorId: req.query.creatorId
            };
            if (!filters.format || (filters.format !== 'pdf' && filters.format !== 'docx')) {
                return res.status(400).json({
                    success: false,
                    message: "Le paramètre 'format' est requis et doit être 'pdf' ou 'docx'."
                });
            }
            const result = await reportEvent_service_1.default.generateEventReport(userId, userRole, filters);
            res.download(result.filepath, result.filename, (err) => {
                if (err) {
                    next(err);
                }
                // Supprimer le fichier après téléchargement
                fs.unlink(result.filepath, (unlinkErr) => {
                    if (unlinkErr) {
                        console.error('Erreur lors de la suppression du fichier:', unlinkErr);
                    }
                });
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.EventController = EventController;
exports.default = new EventController();
//# sourceMappingURL=event.controller.js.map