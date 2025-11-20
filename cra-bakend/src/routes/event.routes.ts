import { Router } from 'express';
import eventController from '../controllers/event.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validation.middleware';
import { upload } from '../middlewares/upload.middleware';
import {
  createEventSchema,
  updateEventSchema,
  createSeminarSchema,
  updateSeminarSchema,
  eventFilterSchema,
  seminarFilterSchema,
  eventIdParamSchema,
  seminarIdParamSchema
} from '../utils/event.validation';

const router = Router();

// Toutes les routes nécessitent l'authentification
router.use(authenticate);

// ==================== ROUTES SPÉCIFIQUES (AVANT LES ROUTES DYNAMIQUES) ====================

/**
 * @route   GET /api/events/report
 * @desc    Générer un rapport d'événements (PDF ou DOCX)
 * @access  Coordinateur uniquement
 */
router.get(
  '/report',
  validate(eventFilterSchema),
  eventController.generateEventReport
);

/**
 * @route   GET /api/events/statistics
 * @desc    Obtenir les statistiques des événements
 * @access  Chercheur, Coordinateur
 */
router.get(
  '/statistics',
  eventController.getEventStatistics
);

// ==================== ROUTES SÉMINAIRES ====================

/**
 * @route   POST /api/events/seminars
 * @desc    Créer un nouveau séminaire
 * @access  Chercheur, Coordinateur
 */
router.post(
  '/seminars',
  validate(createSeminarSchema),
  eventController.createSeminar
);

/**
 * @route   GET /api/events/seminars
 * @desc    Lister les séminaires (avec filtres optionnels)
 * @access  Chercheur (ses séminaires), Coordinateur (tous)
 */
router.get(
  '/seminars',
  validate(seminarFilterSchema),
  eventController.listSeminars
);

/**
 * @route   GET /api/events/seminars/:id
 * @desc    Récupérer un séminaire par ID
 * @access  Organisateur, Coordinateur
 */
router.get(
  '/seminars/:id',
  validate(seminarIdParamSchema),
  eventController.getSeminar
);

/**
 * @route   PUT /api/events/seminars/:id
 * @desc    Mettre à jour un séminaire
 * @access  Organisateur uniquement
 */
router.put(
  '/seminars/:id',
  validate(seminarIdParamSchema),
  validate(updateSeminarSchema),
  eventController.updateSeminar
);

/**
 * @route   DELETE /api/events/seminars/:id
 * @desc    Supprimer un séminaire
 * @access  Organisateur uniquement
 */
router.delete(
  '/seminars/:id',
  validate(seminarIdParamSchema),
  eventController.deleteSeminar
);

/**
 * @route   POST /api/events/seminars/:id/documents
 * @desc    Ajouter un document à un séminaire
 * @access  Organisateur uniquement
 */
router.post(
  '/seminars/:id/documents',
  validate(seminarIdParamSchema),
  upload.single('file'),
  eventController.addDocumentToSeminar
);

// ==================== ROUTES ÉVÉNEMENTS ====================

/**
 * @route   POST /api/events
 * @desc    Créer un nouvel événement
 * @access  Chercheur, Coordinateur
 */
router.post(
  '/',
  validate(createEventSchema),
  eventController.createEvent
);

/**
 * @route   GET /api/events
 * @desc    Lister les événements (avec filtres optionnels)
 * @access  Chercheur (ses événements), Coordinateur (tous)
 */
router.get(
  '/',
  validate(eventFilterSchema),
  eventController.listEvents
);

/**
 * @route   GET /api/events/:id
 * @desc    Récupérer un événement par ID
 * @access  Créateur, Coordinateur
 */
router.get(
  '/:id',
  validate(eventIdParamSchema),
  eventController.getEvent
);

/**
 * @route   PUT /api/events/:id
 * @desc    Mettre à jour un événement
 * @access  Créateur uniquement
 */
router.put(
  '/:id',
  validate(eventIdParamSchema),
  validate(updateEventSchema),
  eventController.updateEvent
);

/**
 * @route   DELETE /api/events/:id
 * @desc    Supprimer un événement
 * @access  Créateur uniquement
 */
router.delete(
  '/:id',
  validate(eventIdParamSchema),
  eventController.deleteEvent
);

/**
 * @route   POST /api/events/:id/documents
 * @desc    Ajouter un document à un événement
 * @access  Créateur uniquement
 */
router.post(
  '/:id/documents',
  validate(eventIdParamSchema),
  upload.single('file'),
  eventController.addDocumentToEvent
);

export default router;