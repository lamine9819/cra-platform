"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/auth.routes.ts - Ajout de la route pour changer le mot de passe
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middlewares/auth"); // Votre middleware d'authentification
const router = (0, express_1.Router)();
const authController = new auth_controller_1.AuthController();
// Routes publiques (sans authentification)
router.post('/register', authController.register);
router.post('/login', authController.login);
// Routes protégées (avec authentification)
router.get('/profile', auth_1.authenticate, authController.getProfile);
router.post('/change-password', auth_1.authenticate, authController.changePassword); // NOUVELLE ROUTE
router.post('/logout', auth_1.authenticate, authController.logout);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map