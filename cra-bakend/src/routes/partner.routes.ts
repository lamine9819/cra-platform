// src/routes/partner.routes.ts - ROUTES DE GESTION DES PARTENAIRES
import { Router } from 'express';
import { PartnerController } from '../controllers/partner.controller';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/authorization';

const router = Router();
const partnerController = new PartnerController();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// =============================================
// ROUTES DE GESTION DES PARTENAIRES
// =============================================

// Créer un nouveau partenaire (Chercheur ou Admin)
router.post(
  '/',
  authorize(['CHERCHEUR', 'ADMINISTRATEUR']),
  partnerController.createPartner
);

// Lister les partenaires avec filtres
router.get('/', partnerController.listPartners);

// Rechercher des partenaires par expertise
router.get('/search/expertise', partnerController.searchByExpertise);

// Obtenir un partenaire par ID
router.get('/:id', partnerController.getPartnerById);

// Mettre à jour un partenaire (Chercheur ou Admin)
router.patch(
  '/:id',
  authorize(['CHERCHEUR', 'ADMINISTRATEUR']),
  partnerController.updatePartner
);

// Supprimer un partenaire (Admin seulement)
router.delete(
  '/:id',
  authorize(['ADMINISTRATEUR']),
  partnerController.deletePartner
);

export default router;