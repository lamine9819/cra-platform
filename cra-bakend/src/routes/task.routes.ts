// src/routes/task.routes.ts
import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/authorization';

const router = Router();
const taskController = new TaskController();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Obtenir les tâches assignées à l'utilisateur connecté - DOIT être avant /:id
router.get('/assigned/me', taskController.getAssignedTasks);

// Obtenir les statistiques des tâches de l'utilisateur connecté - DOIT être avant /:id
router.get('/stats/me', taskController.getTaskStats);

// Obtenir les tâches d'un projet - DOIT être avant /:id
router.get('/project/:projectId', taskController.getProjectTasks);

// Obtenir les tâches d'une activité - DOIT être avant /:id
router.get('/activity/:activityId', taskController.getActivityTasks);

// Créer une tâche (Chercheur, Assistant, Admin)
router.post(
  '/',
  authorize(['CHERCHEUR', 'ASSISTANT_CHERCHEUR', 'ADMINISTRATEUR']),
  taskController.createTask
);

// Obtenir une tâche spécifique
router.get('/:id', taskController.getTaskById);

// Mettre à jour une tâche
router.patch('/:id', taskController.updateTask);

// Supprimer une tâche
router.delete('/:id', taskController.deleteTask);

export default router;