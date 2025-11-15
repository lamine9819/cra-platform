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
                res.status(200).json({
                    success: true,
                    data: result,
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
         * Note: Côté client, il faut supprimer le token du localStorage/sessionStorage
         */
        this.logout = async (_req, res) => {
            // Côté client, supprimer le token du localStorage/sessionStorage
            res.status(200).json({
                success: true,
                message: 'Déconnexion réussie',
            });
        };
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map