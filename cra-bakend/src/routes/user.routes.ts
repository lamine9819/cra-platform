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

// Reste du fichier inchangé...
export default router;
