"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const validation_1 = require("../utils/validation");
const authService = new auth_service_1.AuthService();
class AuthController {
    constructor() {
        this.register = async (req, res, next) => {
            try {
                // Validation des données
                const validatedData = validation_1.registerSchema.parse(req.body);
                // Enregistrement de l'utilisateur
                const result = await authService.register(validatedData);
                res.status(201).json({
                    success: true,
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.login = async (req, res, next) => {
            try {
                // Validation des données
                const validatedData = validation_1.loginSchema.parse(req.body);
                // Connexion de l'utilisateur
                const result = await authService.login(validatedData);
                // Stocker le JWT dans un cookie HttpOnly
                res.cookie('auth_token', result.token, {
                    httpOnly: true, // Le cookie ne peut pas être lu par JavaScript
                    secure: process.env.NODE_ENV === 'production', // HTTPS uniquement en production
                    sameSite: 'strict', // Protection CSRF
                    maxAge: 24 * 60 * 60 * 1000, // 24 heures
                    path: '/',
                });
                // Ne plus renvoyer le token dans la réponse
                res.status(200).json({
                    success: true,
                    data: {
                        user: result.user,
                        message: result.message,
                    },
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.getProfile = async (req, res, next) => {
            try {
                // Cast vers AuthenticatedRequest après que le middleware authenticate ait ajouté user
                const authenticatedReq = req;
                const userProfile = await authService.getUserProfile(authenticatedReq.user.userId);
                res.status(200).json({
                    success: true,
                    data: userProfile,
                });
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * Changement de mot de passe de l'utilisateur
         */
        this.changePassword = async (req, res, next) => {
            try {
                // Cast vers AuthenticatedRequest
                const authenticatedReq = req;
                // Validation des données
                const validatedData = validation_1.changePasswordSchema.parse(req.body);
                // Changement du mot de passe
                const result = await authService.changePassword(authenticatedReq.user.userId, validatedData);
                res.status(200).json({
                    success: true,
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * Déconnexion de l'utilisateur
         * Supprime le cookie HttpOnly côté serveur
         */
        this.logout = async (_req, res) => {
            // Supprimer le cookie d'authentification
            res.clearCookie('auth_token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
            });
            res.status(200).json({
                success: true,
                message: 'Déconnexion réussie',
            });
        };
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map