// src/routes/auth.routes.ts - Routes d'authentification
// La documentation est générée automatiquement depuis auth.openapi.ts
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();
const authController = new AuthController();

// Routes publiques (sans authentification)
router.post('/register', authController.register);
router.post('/login', authController.login);

// Routes protégées (avec authentification)
router.get('/profile', authenticate, authController.getProfile);
router.post('/change-password', authenticate, authController.changePassword);
router.post('/logout', authenticate, authController.logout);

export default router;
