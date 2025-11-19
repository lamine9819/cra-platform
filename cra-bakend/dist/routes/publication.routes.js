"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/publication.routes.ts
const express_1 = require("express");
const publication_controller_1 = require("../controllers/publication.controller");
const auth_1 = require("../middlewares/auth");
const authorization_1 = require("../middlewares/authorization");
const fileUpload_config_1 = require("../utils/fileUpload.config");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
router.use(auth_1.authenticate);
// Routes de consultation (tous les utilisateurs authentifiés)
// IMPORTANT: Routes spécifiques AVANT les routes avec paramètres
// Route pour lister les publications
router.get('/', asyncHandler(publication_controller_1.publicationController.getPublications.bind(publication_controller_1.publicationController)));
// Routes spécifiques (doivent être avant /:id)
router.get('/stats', asyncHandler(publication_controller_1.publicationController.getPublicationStats.bind(publication_controller_1.publicationController)));
router.get('/me', asyncHandler(publication_controller_1.publicationController.getMyPublications.bind(publication_controller_1.publicationController)));
// Génération de rapport
router.get('/report/generate', (0, authorization_1.authorize)([client_1.UserRole.COORDONATEUR_PROJET, client_1.UserRole.ADMINISTRATEUR]), asyncHandler(publication_controller_1.publicationController.generateReport.bind(publication_controller_1.publicationController)));
// Routes avec paramètres :id (doivent être après les routes spécifiques)
router.get('/:id', asyncHandler(publication_controller_1.publicationController.getPublicationById.bind(publication_controller_1.publicationController)));
// Téléchargement de document
router.get('/:id/download', asyncHandler(publication_controller_1.publicationController.downloadDocument.bind(publication_controller_1.publicationController)));
// Routes de création/modification
router.post('/', (0, authorization_1.authorize)([client_1.UserRole.CHERCHEUR, client_1.UserRole.COORDONATEUR_PROJET, client_1.UserRole.ADMINISTRATEUR]), asyncHandler(publication_controller_1.publicationController.createPublication.bind(publication_controller_1.publicationController)));
router.put('/:id', (0, authorization_1.authorize)([client_1.UserRole.CHERCHEUR, client_1.UserRole.COORDONATEUR_PROJET, client_1.UserRole.ADMINISTRATEUR]), asyncHandler(publication_controller_1.publicationController.updatePublication.bind(publication_controller_1.publicationController)));
router.delete('/:id', (0, authorization_1.authorize)([client_1.UserRole.CHERCHEUR, client_1.UserRole.COORDONATEUR_PROJET, client_1.UserRole.ADMINISTRATEUR]), asyncHandler(publication_controller_1.publicationController.deletePublication.bind(publication_controller_1.publicationController)));
// Upload de document PDF
router.post('/:id/upload', (0, authorization_1.authorize)([client_1.UserRole.CHERCHEUR, client_1.UserRole.COORDONATEUR_PROJET, client_1.UserRole.ADMINISTRATEUR]), fileUpload_config_1.uploadPublication.single('document'), asyncHandler(publication_controller_1.publicationController.uploadDocument.bind(publication_controller_1.publicationController)));
exports.default = router;
//# sourceMappingURL=publication.routes.js.map