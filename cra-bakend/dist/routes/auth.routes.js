"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/auth.routes.ts - Routes d'authentification
// La documentation est générée automatiquement depuis auth.openapi.ts
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
const authController = new auth_controller_1.AuthController();
// Routes publiques (sans authentification)
router.post('/register', authController.register);
router.post('/login', authController.login);
// Routes protégées (avec authentification)
router.get('/profile', auth_1.authenticate, authController.getProfile);
router.post('/change-password', auth_1.authenticate, authController.changePassword);
router.post('/logout', auth_1.authenticate, authController.logout);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map