// src/routes/user.routes.ts
// Documentation à générer : créez user.openapi.ts pour ajouter ces routes à Swagger
import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/authorization';
import { uploadProfileImage } from '../utils/profileImageUpload.config';

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

// Upload de la photo de profil
router.post('/me/profile-image',
  uploadProfileImage.single('profileImage'),
  userController.uploadProfileImage
);

// Supprimer la photo de profil
router.delete('/me/profile-image',
  userController.deleteProfileImage
);

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
// ROUTES SPÉCIFIQUES (DOIVENT ÊTRE AVANT LES ROUTES AVEC PARAMÈTRES)
// =============================================

// Obtenir les utilisateurs supervisés
router.get('/supervised/me',
  authorize(['CHERCHEUR', 'COORDONATEUR_PROJET']),
  userController.getSupervisedUsers
);

// Obtenir les coordonateurs de projet actifs
router.get('/coordinators',
  authorize(['ADMINISTRATEUR', 'COORDONATEUR_PROJET']),
  userController.getProjectCoordinators
);

// Obtenir les chercheurs par thème de recherche
router.get('/themes/:themeId/researchers',
  authorize(['ADMINISTRATEUR', 'COORDONATEUR_PROJET', 'CHERCHEUR']),
  userController.getResearchersByTheme
);

// =============================================
// ROUTES DE GESTION DES UTILISATEURS (ADMIN/COORDONATEUR)
// =============================================

// Lister tous les utilisateurs avec filtres
router.get('/',
  authorize(['ADMINISTRATEUR', 'COORDONATEUR_PROJET', 'CHERCHEUR']),
  userController.listUsers
);

// Créer un utilisateur
router.post('/',
  authorize(['ADMINISTRATEUR', 'COORDONATEUR_PROJET']),
  userController.createUser
);

// Obtenir un utilisateur par ID
router.get('/:userId',
  authorize(['ADMINISTRATEUR', 'COORDONATEUR_PROJET', 'CHERCHEUR']),
  userController.getUserById
);

// Mettre à jour un utilisateur
router.patch('/:userId',
  authorize(['ADMINISTRATEUR', 'COORDONATEUR_PROJET']),
  userController.updateUser
);

// Supprimer un utilisateur
router.delete('/:userId',
  authorize(['ADMINISTRATEUR']),
  userController.deleteUser
);

// =============================================
// ROUTES POUR ACTIONS SPÉCIFIQUES SUR UN UTILISATEUR
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

// Assigner un superviseur
router.patch('/:userId/supervisor',
  authorize(['ADMINISTRATEUR', 'COORDONATEUR_PROJET']),
  userController.assignSupervisor
);

// Obtenir les statistiques d'un utilisateur
router.get('/:userId/stats',
  authorize(['ADMINISTRATEUR', 'COORDONATEUR_PROJET', 'CHERCHEUR']),
  userController.getUserStats
);

// =============================================
// ROUTES POUR LES PROFILS INDIVIDUELS (GESTION PAR ADMIN/COORD)
// =============================================

// Mettre à jour le profil individuel d'un chercheur
router.patch('/:userId/individual-profile',
  authorize(['ADMINISTRATEUR', 'COORDONATEUR_PROJET']),
  userController.updateIndividualProfile
);

// Télécharger la fiche individuelle d'un chercheur
router.get('/:userId/individual-profile/download',
  authorize(['ADMINISTRATEUR', 'COORDONATEUR_PROJET']),
  userController.downloadIndividualProfile
);

// Valider un profil individuel ou une année spécifique
router.post('/:userId/individual-profile/validate',
  authorize(['ADMINISTRATEUR', 'COORDONATEUR_PROJET']),
  userController.validateIndividualProfile
);

// =============================================
// ROUTES POUR L'ALLOCATION DE TEMPS
// =============================================

// Mettre à jour l'allocation de temps
router.patch('/:userId/time-allocation',
  authorize(['ADMINISTRATEUR', 'COORDONATEUR_PROJET']),
  userController.updateTimeAllocation
);

export default router;
