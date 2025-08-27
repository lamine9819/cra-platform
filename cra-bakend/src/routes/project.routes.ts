// src/routes/project.routes.ts
import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/authorization';

const router = Router();
const projectController = new ProjectController();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Créer un projet (Chercheur ou Admin)
router.post(
  '/',
  authorize(['CHERCHEUR', 'ADMINISTRATEUR']),
  projectController.createProject
);

// Lister les projets accessibles
router.get('/', projectController.listProjects);

// Obtenir un projet spécifique
router.get('/:id', projectController.getProjectById);

// Mettre à jour un projet
router.patch('/:id', projectController.updateProject);

// Supprimer un projet
router.delete('/:id', projectController.deleteProject);

// Ajouter un participant au projet
router.post('/:id/participants', projectController.addParticipant);

// Retirer un participant du projet
router.delete('/:id/participants/:participantId', projectController.removeParticipant);

export default router;