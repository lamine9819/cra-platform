"use strict";
// src/middlewares/adminAuth.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdminOrCoordinator = exports.requireAdmin = void 0;
const errors_1 = require("../utils/errors");
/**
 * Middleware pour vérifier que l'utilisateur a le rôle ADMINISTRATEUR
 * Doit être utilisé après le middleware authenticate
 */
const requireAdmin = (req, res, next) => {
    try {
        // Vérifier que req.user existe (devrait être défini par le middleware authenticate)
        if (!req.user) {
            throw new errors_1.AuthorizationError('Authentification requise');
        }
        // Vérifier que l'utilisateur a le rôle ADMINISTRATEUR
        if (req.user.role !== 'ADMINISTRATEUR') {
            throw new errors_1.AuthorizationError('Accès refusé. Privilèges administrateur requis.');
        }
        // L'utilisateur est un administrateur, continuer
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.requireAdmin = requireAdmin;
/**
 * Middleware pour vérifier que l'utilisateur a le rôle ADMINISTRATEUR ou COORDONATEUR_PROJET
 */
const requireAdminOrCoordinator = (req, res, next) => {
    try {
        if (!req.user) {
            throw new errors_1.AuthorizationError('Authentification requise');
        }
        if (req.user.role !== 'ADMINISTRATEUR' && req.user.role !== 'COORDONATEUR_PROJET') {
            throw new errors_1.AuthorizationError('Accès refusé. Privilèges administrateur ou coordinateur requis.');
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.requireAdminOrCoordinator = requireAdminOrCoordinator;
//# sourceMappingURL=adminAuth.js.map