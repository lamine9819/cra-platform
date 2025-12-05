"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const event_controller_1 = tslib_1.__importDefault(require("../controllers/event.controller"));
const auth_1 = require("../middlewares/auth");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const notificationIntegration_middleware_1 = require("../middlewares/notificationIntegration.middleware");
const event_validation_1 = require("../utils/event.validation");
const router = (0, express_1.Router)();
// Toutes les routes nécessitent l'authentification
router.use(auth_1.authenticate);
// ==================== ROUTES SPÉCIFIQUES (AVANT LES ROUTES DYNAMIQUES) ====================
/**
 * @route   GET /api/events/report
 * @desc    Générer un rapport d'événements (PDF ou DOCX)
 * @access  Coordinateur uniquement
 */
router.get('/report', (0, validation_middleware_1.validate)(event_validation_1.eventFilterSchema), event_controller_1.default.generateEventReport);
/**
 * @route   GET /api/events/statistics
 * @desc    Obtenir les statistiques des événements
 * @access  Chercheur, Coordinateur
 */
router.get('/statistics', event_controller_1.default.getEventStatistics);
// ==================== ROUTES SÉMINAIRES ====================
/**
 * @route   POST /api/events/seminars
 * @desc    Créer un nouveau séminaire
 * @access  Chercheur, Coordinateur
 */
router.post('/seminars', notificationIntegration_middleware_1.notifySeminarCreated, (0, validation_middleware_1.validate)(event_validation_1.createSeminarSchema), event_controller_1.default.createSeminar);
/**
 * @route   GET /api/events/seminars
 * @desc    Lister les séminaires (avec filtres optionnels)
 * @access  Chercheur (ses séminaires), Coordinateur (tous)
 */
router.get('/seminars', (0, validation_middleware_1.validate)(event_validation_1.seminarFilterSchema), event_controller_1.default.listSeminars);
/**
 * @route   GET /api/events/seminars/:id
 * @desc    Récupérer un séminaire par ID
 * @access  Organisateur, Coordinateur
 */
router.get('/seminars/:id', (0, validation_middleware_1.validate)(event_validation_1.seminarIdParamSchema), event_controller_1.default.getSeminar);
/**
 * @route   PUT /api/events/seminars/:id
 * @desc    Mettre à jour un séminaire
 * @access  Organisateur uniquement
 */
router.put('/seminars/:id', (0, validation_middleware_1.validate)(event_validation_1.seminarIdParamSchema), (0, validation_middleware_1.validate)(event_validation_1.updateSeminarSchema), event_controller_1.default.updateSeminar);
/**
 * @route   DELETE /api/events/seminars/:id
 * @desc    Supprimer un séminaire
 * @access  Organisateur uniquement
 */
router.delete('/seminars/:id', (0, validation_middleware_1.validate)(event_validation_1.seminarIdParamSchema), event_controller_1.default.deleteSeminar);
/**
 * @route   POST /api/events/seminars/:id/documents
 * @desc    Ajouter un document à un séminaire
 * @access  Organisateur uniquement
 */
router.post('/seminars/:id/documents', (0, validation_middleware_1.validate)(event_validation_1.seminarIdParamSchema), upload_middleware_1.upload.single('file'), event_controller_1.default.addDocumentToSeminar);
// ==================== ROUTES ÉVÉNEMENTS ====================
/**
 * @route   POST /api/events
 * @desc    Créer un nouvel événement
 * @access  Chercheur, Coordinateur
 */
router.post('/', notificationIntegration_middleware_1.notifyEventCreated, (0, validation_middleware_1.validate)(event_validation_1.createEventSchema), event_controller_1.default.createEvent);
/**
 * @route   GET /api/events
 * @desc    Lister les événements (avec filtres optionnels)
 * @access  Chercheur (ses événements), Coordinateur (tous)
 */
router.get('/', (0, validation_middleware_1.validate)(event_validation_1.eventFilterSchema), event_controller_1.default.listEvents);
/**
 * @route   GET /api/events/:id
 * @desc    Récupérer un événement par ID
 * @access  Créateur, Coordinateur
 */
router.get('/:id', (0, validation_middleware_1.validate)(event_validation_1.eventIdParamSchema), event_controller_1.default.getEvent);
/**
 * @route   PUT /api/events/:id
 * @desc    Mettre à jour un événement
 * @access  Créateur uniquement
 */
router.put('/:id', (0, validation_middleware_1.validate)(event_validation_1.eventIdParamSchema), (0, validation_middleware_1.validate)(event_validation_1.updateEventSchema), event_controller_1.default.updateEvent);
/**
 * @route   DELETE /api/events/:id
 * @desc    Supprimer un événement
 * @access  Créateur uniquement
 */
router.delete('/:id', (0, validation_middleware_1.validate)(event_validation_1.eventIdParamSchema), event_controller_1.default.deleteEvent);
/**
 * @route   POST /api/events/:id/documents
 * @desc    Ajouter un document à un événement
 * @access  Créateur uniquement
 */
router.post('/:id/documents', (0, validation_middleware_1.validate)(event_validation_1.eventIdParamSchema), upload_middleware_1.upload.single('file'), event_controller_1.default.addDocumentToEvent);
exports.default = router;
//# sourceMappingURL=event.routes.js.map