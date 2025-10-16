// src/routes/auth.routes.ts - Ajout de la route pour changer le mot de passe
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth'; // Votre middleware d'authentification

const router = Router();
const authController = new AuthController();

// Routes publiques (sans authentification)
router.post('/register', authController.register);
router.post('/login', authController.login);

// Routes protégées (avec authentification)
router.get('/profile', authenticate, authController.getProfile);
router.post('/change-password', authenticate, authController.changePassword); // NOUVELLE ROUTE
router.post('/logout', authenticate, authController.logout);

export default router;