// src/routes/user.routes.ts
import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/authorization';

const router = Router();
const userController = new UserController();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// =============================================
// ROUTES POUR LE PROFIL PERSONNEL 
// =============================================

// Obtenir son propre profil complet avec statistiques
router.get('/me', userController.getMyProfile);

// Mettre à jour son propre profil
router.patch('/me', userController.updateMyProfile);

// Mettre à jour son propre profil individuel (chercheurs uniquement)
router.patch('/me/individual-profile', 
  authorize(['CHERCHEUR']), 
  userController.updateMyIndividualProfile
);

// Télécharger sa propre fiche individuelle
router.get('/me/individual-profile/download',
  authorize(['CHERCHEUR']),
  userController.downloadMyIndividualProfile
);

// =============================================
// ROUTES DE GESTION DES UTILISATEURS
// =============================================

// Créer un utilisateur (avec profil individuel si chercheur)
router.post('/', 
  authorize(['ADMINISTRATEUR', 'CHERCHEUR']), 
  userController.createUser
);

// Obtenir la liste des utilisateurs avec filtres CRA
router.get('/', 
  authorize(['ADMINISTRATEUR', 'COORDONATEUR_PROJET', 'CHERCHEUR']), 
  userController.listUsers
);

// Obtenir les coordonateurs de projet actifs
router.get('/coordinators', 
  authorize(['ADMINISTRATEUR', 'COORDONATEUR_PROJET']), 
  userController.getProjectCoordinators
);

// Obtenir les chercheurs d'un thème de recherche spécifique
router.get('/researchers/theme/:themeId', 
  authorize(['ADMINISTRATEUR', 'COORDONATEUR_PROJET', 'CHERCHEUR']), 
  userController.getResearchersByTheme
);

// Obtenir les utilisateurs supervisés par l'utilisateur connecté
router.get('/supervised/me', 
  authorize(['CHERCHEUR', 'ADMINISTRATEUR', 'COORDONATEUR_PROJET']), 
  userController.getSupervisedUsers
);

// =============================================
// ROUTES POUR UN UTILISATEUR SPÉCIFIQUE
// =============================================

// Obtenir un utilisateur par ID
router.get('/:userId', userController.getUserById);

// Obtenir les statistiques d'un utilisateur
router.get('/:userId/stats', 
  authorize(['ADMINISTRATEUR', 'COORDONATEUR_PROJET', 'CHERCHEUR']), 
  userController.getUserStats
);

// Télécharger la fiche individuelle d'un chercheur
// Accessible par : ADMINISTRATEUR, COORDONATEUR_PROJET, et le CHERCHEUR lui-même
router.get('/:userId/individual-profile/download',
  authorize(['ADMINISTRATEUR', 'COORDONATEUR_PROJET', 'CHERCHEUR']),
  userController.downloadIndividualProfile
);

// Mettre à jour un utilisateur
router.patch('/:userId', 
  authorize(['ADMINISTRATEUR', 'CHERCHEUR']), 
  userController.updateUser
);

// Supprimer un utilisateur (administrateurs seulement)
router.delete('/:userId', 
  authorize(['ADMINISTRATEUR']), 
  userController.deleteUser
);

// =============================================
// GESTION DES SUPERVISEURS
// =============================================

// Assigner un superviseur à un utilisateur
router.patch('/:userId/supervisor', 
  authorize(['ADMINISTRATEUR', 'CHERCHEUR']), 
  userController.assignSupervisor
);

// =============================================
// GESTION DU STATUT D'ACTIVATION
// =============================================

// Activer un utilisateur
router.patch('/:userId/activate', 
  authorize(['ADMINISTRATEUR']), 
  userController.activateUser
);

// Désactiver un utilisateur
router.patch('/:userId/deactivate', 
  authorize(['ADMINISTRATEUR']), 
  userController.deactivateUser
);

// =============================================
// GESTION DES PROFILS INDIVIDUELS (CHERCHEURS)
// =============================================

// Mettre à jour le profil individuel d'un chercheur
router.patch('/:userId/individual-profile', 
  authorize(['ADMINISTRATEUR', 'CHERCHEUR']), 
  userController.updateIndividualProfile
);

// Mettre à jour l'allocation de temps pour une année donnée
router.patch('/:userId/time-allocation', 
  authorize(['ADMINISTRATEUR', 'COORDONATEUR_PROJET', 'CHERCHEUR']), 
  userController.updateTimeAllocation
);

// Valider un profil individuel ou une allocation de temps
router.post('/:userId/validate-profile', 
  authorize(['ADMINISTRATEUR','COORDONATEUR_PROJET']), 
  userController.validateIndividualProfile
);

export default router;