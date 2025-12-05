"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/user.routes.ts
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
// ROUTES DE GESTION DES UTILISATEURS
// =============================================
// Créer un utilisateur (avec profil individuel si chercheur)
router.post('/', (0, authorization_1.authorize)(['ADMINISTRATEUR']), userController.createUser);
// Obtenir la liste des utilisateurs avec filtres CRA
router.get('/', (0, authorization_1.authorize)(['ADMINISTRATEUR', 'COORDONATEUR_PROJET', 'CHERCHEUR']), userController.listUsers);
// Obtenir les coordonateurs de projet actifs
router.get('/coordinators', (0, authorization_1.authorize)(['ADMINISTRATEUR', 'COORDONATEUR_PROJET']), userController.getProjectCoordinators);
// Obtenir les chercheurs d'un thème de recherche spécifique
router.get('/researchers/theme/:themeId', (0, authorization_1.authorize)(['ADMINISTRATEUR', 'COORDONATEUR_PROJET', 'CHERCHEUR']), userController.getResearchersByTheme);
// Obtenir les utilisateurs supervisés par l'utilisateur connecté
router.get('/supervised/me', (0, authorization_1.authorize)(['CHERCHEUR', 'ADMINISTRATEUR', 'COORDONATEUR_PROJET']), userController.getSupervisedUsers);
// =============================================
// ROUTES POUR UN UTILISATEUR SPÉCIFIQUE
// =============================================
// Obtenir un utilisateur par ID
router.get('/:userId', userController.getUserById);
// Obtenir les statistiques d'un utilisateur
router.get('/:userId/stats', (0, authorization_1.authorize)(['ADMINISTRATEUR', 'COORDONATEUR_PROJET', 'CHERCHEUR']), userController.getUserStats);
// Télécharger la fiche individuelle d'un chercheur
// Accessible par : ADMINISTRATEUR, COORDONATEUR_PROJET, et le CHERCHEUR lui-même
router.get('/:userId/individual-profile/download', (0, authorization_1.authorize)(['ADMINISTRATEUR', 'COORDONATEUR_PROJET', 'CHERCHEUR']), userController.downloadIndividualProfile);
// Mettre à jour un utilisateur
router.patch('/:userId', (0, authorization_1.authorize)(['ADMINISTRATEUR', 'CHERCHEUR']), userController.updateUser);
// Supprimer un utilisateur (administrateurs seulement)
router.delete('/:userId', (0, authorization_1.authorize)(['ADMINISTRATEUR']), userController.deleteUser);
// =============================================
// GESTION DES SUPERVISEURS
// =============================================
// Assigner un superviseur à un utilisateur
router.patch('/:userId/supervisor', (0, authorization_1.authorize)(['ADMINISTRATEUR']), userController.assignSupervisor);
// =============================================
// GESTION DU STATUT D'ACTIVATION
// =============================================
// Activer un utilisateur
router.patch('/:userId/activate', (0, authorization_1.authorize)(['ADMINISTRATEUR']), userController.activateUser);
// Désactiver un utilisateur
router.patch('/:userId/deactivate', (0, authorization_1.authorize)(['ADMINISTRATEUR']), userController.deactivateUser);
// =============================================
// GESTION DES PROFILS INDIVIDUELS (CHERCHEURS)
// =============================================
// Mettre à jour le profil individuel d'un chercheur
router.patch('/:userId/individual-profile', (0, authorization_1.authorize)(['ADMINISTRATEUR', 'CHERCHEUR']), userController.updateIndividualProfile);
// Mettre à jour l'allocation de temps pour une année donnée
router.patch('/:userId/time-allocation', (0, authorization_1.authorize)(['ADMINISTRATEUR', 'COORDONATEUR_PROJET']), userController.updateTimeAllocation);
// Valider un profil individuel ou une allocation de temps
router.post('/:userId/validate-profile', (0, authorization_1.authorize)(['ADMINISTRATEUR', 'COORDONATEUR_PROJET']), userController.validateIndividualProfile);
exports.default = router;
//# sourceMappingURL=user.routes.js.map