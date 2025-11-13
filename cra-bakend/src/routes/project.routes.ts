// src/routes/project.routes.ts - ROUTES COMPLÈTES AVEC PARTENARIATS
import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/authorization';

const router = Router();
const projectController = new ProjectController();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// =============================================
// ROUTES PRINCIPALES DE GESTION DES PROJETS
// =============================================

// Créer un projet (Chercheur ou Admin)
router.post(
  '/',
  authorize(['CHERCHEUR', 'ADMINISTRATEUR']),
  projectController.createProject
);

// Lister les projets accessibles (avec filtres CRA)
router.get('/', projectController.listProjects);

// Recherche avancée de projets
router.get('/search/advanced', projectController.advancedSearch);

// Obtenir un projet spécifique
router.get('/:id', projectController.getProjectById);

// Mettre à jour un projet
router.patch('/:id', projectController.updateProject);

// Supprimer un projet
router.delete('/:id', projectController.deleteProject);

// Archiver un projet
router.patch('/:id/archive', projectController.archiveProject);

// Restaurer un projet archivé
router.patch('/:id/restore', projectController.restoreProject);

// Dupliquer un projet (utile pour les reconductions)
router.post('/:id/duplicate', projectController.duplicateProject);

// =============================================
// ROUTES DE GESTION DES PARTICIPANTS
// =============================================

// Ajouter un participant au projet
router.post('/:id/participants', projectController.addParticipant);

// Mettre à jour un participant
router.patch('/:id/participants', projectController.updateParticipant);

// Retirer un participant du projet
router.delete('/:id/participants/:participantId', projectController.removeParticipant);

// =============================================
// ROUTES DE GESTION DES PARTENARIATS - COMPLÈTES
// =============================================

// Lister les partenariats d'un projet
router.get('/:id/partnerships', projectController.getProjectPartnerships);

// Ajouter un partenariat au projet
router.post('/:id/partnerships', projectController.addPartnership);

// Mettre à jour un partenariat
router.patch('/:id/partnerships', projectController.updatePartnership);

// Retirer un partenariat du projet
router.delete('/:id/partnerships/:partnershipId', projectController.removePartnership);

// Rechercher des partenaires potentiels pour un projet
router.get('/:id/partners/search', projectController.searchPotentialPartners);

// =============================================
// ROUTES DE GESTION DU FINANCEMENT
// =============================================

// Ajouter un financement au projet
router.post('/:id/funding', projectController.addFunding);

// Mettre à jour un financement
router.patch('/:id/funding', projectController.updateFunding);

// Retirer un financement du projet
router.delete('/:id/funding/:fundingId', projectController.removeFunding);

// =============================================
// ROUTES D'ANALYSE ET DE RAPPORTS
// =============================================

// Obtenir les statistiques d'un projet
router.get('/:id/statistics', projectController.getProjectStatistics);

// Générer un rapport de projet
router.get('/:id/reports', projectController.generateProjectReport);

// =============================================
// ROUTES DE RECHERCHE PAR CRITÈRES CRA
// =============================================

// Obtenir les projets par thème
router.get('/theme/:themeId', projectController.getProjectsByTheme);

// Obtenir les projets par programme de recherche
router.get('/program/:programId', projectController.getProjectsByProgram);

// Obtenir les projets par convention
router.get('/convention/:conventionId', projectController.getProjectsByConvention);

export default router;