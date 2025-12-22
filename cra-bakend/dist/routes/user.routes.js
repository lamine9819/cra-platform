"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/user.routes.ts
// Documentation à générer : créez user.openapi.ts pour ajouter ces routes à Swagger
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_1 = require("../middlewares/auth");
const authorization_1 = require("../middlewares/authorization");
const profileImageUpload_config_1 = require("../utils/profileImageUpload.config");
const router = (0, express_1.Router)();
const userController = new user_controller_1.UserController();
// Toutes les routes nécessitent une authentification
router.use(auth_1.authenticate);
// =============================================
// ROUTES POUR LE PROFIL PERSONNEL
// =============================================
// Obtenir son propre profil complet avec statistiques
router.get('/me', userController.getMyProfile);
// Mettre à jour son propre profil
router.patch('/me', userController.updateMyProfile);
// Upload de la photo de profil
router.post('/me/profile-image', profileImageUpload_config_1.uploadProfileImage.single('profileImage'), userController.uploadProfileImage);
// Supprimer la photo de profil
router.delete('/me/profile-image', userController.deleteProfileImage);
// Mettre à jour son propre profil individuel (chercheurs uniquement)
router.patch('/me/individual-profile', (0, authorization_1.authorize)(['CHERCHEUR']), userController.updateMyIndividualProfile);
// Télécharger sa propre fiche individuelle
router.get('/me/individual-profile/download', (0, authorization_1.authorize)(['CHERCHEUR']), userController.downloadMyIndividualProfile);
// =============================================
// ROUTES SPÉCIFIQUES (DOIVENT ÊTRE AVANT LES ROUTES AVEC PARAMÈTRES)
// =============================================
// Obtenir les utilisateurs supervisés
router.get('/supervised/me', (0, authorization_1.authorize)(['CHERCHEUR', 'COORDONATEUR_PROJET']), userController.getSupervisedUsers);
// Obtenir les coordonateurs de projet actifs
router.get('/coordinators', (0, authorization_1.authorize)(['ADMINISTRATEUR', 'COORDONATEUR_PROJET']), userController.getProjectCoordinators);
// Obtenir les chercheurs par thème de recherche
router.get('/themes/:themeId/researchers', (0, authorization_1.authorize)(['ADMINISTRATEUR', 'COORDONATEUR_PROJET', 'CHERCHEUR']), userController.getResearchersByTheme);
// =============================================
// ROUTES DE GESTION DES UTILISATEURS (ADMIN/COORDONATEUR)
// =============================================
// Lister tous les utilisateurs avec filtres
router.get('/', (0, authorization_1.authorize)(['ADMINISTRATEUR', 'COORDONATEUR_PROJET', 'CHERCHEUR']), userController.listUsers);
// Créer un utilisateur
router.post('/', (0, authorization_1.authorize)(['ADMINISTRATEUR', 'COORDONATEUR_PROJET']), userController.createUser);
// Obtenir un utilisateur par ID
router.get('/:userId', (0, authorization_1.authorize)(['ADMINISTRATEUR', 'COORDONATEUR_PROJET', 'CHERCHEUR']), userController.getUserById);
// Mettre à jour un utilisateur
router.patch('/:userId', (0, authorization_1.authorize)(['ADMINISTRATEUR', 'COORDONATEUR_PROJET']), userController.updateUser);
// Supprimer un utilisateur
router.delete('/:userId', (0, authorization_1.authorize)(['ADMINISTRATEUR']), userController.deleteUser);
// =============================================
// ROUTES POUR ACTIONS SPÉCIFIQUES SUR UN UTILISATEUR
// =============================================
// Activer un utilisateur
router.patch('/:userId/activate', (0, authorization_1.authorize)(['ADMINISTRATEUR']), userController.activateUser);
// Désactiver un utilisateur
router.patch('/:userId/deactivate', (0, authorization_1.authorize)(['ADMINISTRATEUR']), userController.deactivateUser);
// Assigner un superviseur
router.patch('/:userId/supervisor', (0, authorization_1.authorize)(['ADMINISTRATEUR', 'COORDONATEUR_PROJET']), userController.assignSupervisor);
// Obtenir les statistiques d'un utilisateur
router.get('/:userId/stats', (0, authorization_1.authorize)(['ADMINISTRATEUR', 'COORDONATEUR_PROJET', 'CHERCHEUR']), userController.getUserStats);
// =============================================
// ROUTES POUR LES PROFILS INDIVIDUELS (GESTION PAR ADMIN/COORD)
// =============================================
// Mettre à jour le profil individuel d'un chercheur
router.patch('/:userId/individual-profile', (0, authorization_1.authorize)(['ADMINISTRATEUR', 'COORDONATEUR_PROJET']), userController.updateIndividualProfile);
// Télécharger la fiche individuelle d'un chercheur
router.get('/:userId/individual-profile/download', (0, authorization_1.authorize)(['ADMINISTRATEUR', 'COORDONATEUR_PROJET']), userController.downloadIndividualProfile);
// Valider un profil individuel ou une année spécifique
router.post('/:userId/individual-profile/validate', (0, authorization_1.authorize)(['ADMINISTRATEUR', 'COORDONATEUR_PROJET']), userController.validateIndividualProfile);
// =============================================
// ROUTES POUR L'ALLOCATION DE TEMPS
// =============================================
// Mettre à jour l'allocation de temps
router.patch('/:userId/time-allocation', (0, authorization_1.authorize)(['ADMINISTRATEUR', 'COORDONATEUR_PROJET']), userController.updateTimeAllocation);
exports.default = router;
//# sourceMappingURL=user.routes.js.map