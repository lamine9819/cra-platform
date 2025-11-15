"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/partner.routes.ts - ROUTES DE GESTION DES PARTENAIRES
const express_1 = require("express");
const partner_controller_1 = require("../controllers/partner.controller");
const auth_1 = require("../middlewares/auth");
const authorization_1 = require("../middlewares/authorization");
const router = (0, express_1.Router)();
const partnerController = new partner_controller_1.PartnerController();
// Toutes les routes nécessitent une authentification
router.use(auth_1.authenticate);
// =============================================
// ROUTES DE GESTION DES PARTENAIRES
// =============================================
// Créer un nouveau partenaire (Chercheur ou Admin)
router.post('/', (0, authorization_1.authorize)(['CHERCHEUR', 'ADMINISTRATEUR']), partnerController.createPartner);
// Lister les partenaires avec filtres
router.get('/', partnerController.listPartners);
// Rechercher des partenaires par expertise
router.get('/search/expertise', partnerController.searchByExpertise);
// Obtenir un partenaire par ID
router.get('/:id', partnerController.getPartnerById);
// Mettre à jour un partenaire (Chercheur ou Admin)
router.patch('/:id', (0, authorization_1.authorize)(['CHERCHEUR', 'ADMINISTRATEUR']), partnerController.updatePartner);
// Supprimer un partenaire (Admin seulement)
router.delete('/:id', (0, authorization_1.authorize)(['ADMINISTRATEUR']), partnerController.deletePartner);
exports.default = router;
//# sourceMappingURL=partner.routes.js.map