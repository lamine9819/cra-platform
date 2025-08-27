// src/routes/user.routes.ts
import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/authorization';

const router = Router();
const userController = new UserController();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Routes sans wrapper - ça devrait maintenant fonctionner
// =============================================
// Routes pour les utilisateurs
// =============================================

// Créer un utilisateur
router.post('/', authorize(['ADMINISTRATEUR', 'CHERCHEUR']), userController.createUser);
// Obtenir la liste des utilisateurs
router.get('/', authorize(['ADMINISTRATEUR', 'CHERCHEUR']), userController.listUsers);
// Obtenir les utilisateurs supervisés par l'utilisateur connecté
router.get('/supervised/me', authorize(['CHERCHEUR', 'ADMINISTRATEUR']), userController.getSupervisedUsers);
// Obtenir un utilisateur par ID
router.get('/:userId', userController.getUserById);
// Mettre à jour un utilisateur
router.patch('/:userId', authorize(['ADMINISTRATEUR', 'CHERCHEUR']), userController.updateUser);
// Supprimer un utilisateur
router.delete('/:userId', authorize(['ADMINISTRATEUR']), userController.deleteUser);
// Assigner un superviseur à un utilisateur
router.patch('/:userId/supervisor', authorize(['ADMINISTRATEUR', 'CHERCHEUR']), userController.assignSupervisor);
// Activer un utilisateur
router.patch('/:userId/activate', authorize(['ADMINISTRATEUR']), userController.activateUser);
// Désactiver un utilisateur
router.patch('/:userId/deactivate', authorize(['ADMINISTRATEUR']), userController.deactivateUser);

export default router;