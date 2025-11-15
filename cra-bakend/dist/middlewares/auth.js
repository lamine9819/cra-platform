"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flexibleAuth = exports.optionalAuth = exports.authenticate = void 0;
const tslib_1 = require("tslib");
const jwt_1 = require("../config/jwt");
const errors_1 = require("../utils/errors");
const jsonwebtoken_1 = tslib_1.__importDefault(require("jsonwebtoken"));
const authenticate = (req, res, next) => {
    try {
        // Accès sécurisé au header authorization
        const authHeader = req.get('authorization') || req.get('Authorization');
        if (!authHeader) {
            throw new errors_1.AuthError('Token d\'authentification manquant');
        }
        const token = authHeader.split(' ')[1]; // Bearer TOKEN
        if (!token) {
            throw new errors_1.AuthError('Format de token invalide');
        }
        // Vérifier et décoder le token
        const decoded = (0, jwt_1.verifyToken)(token);
        // Ajouter les informations utilisateur à la requête
        req.user = decoded;
        next();
    }
    catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token invalide',
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expiré',
            });
        }
        next(error);
    }
};
exports.authenticate = authenticate;
// Authentification optionnelle (pour les routes publiques avec amélioration si connecté)
const optionalAuth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
        }
        catch (error) {
            // Ignorer les erreurs d'authentification pour l'auth optionnelle
        }
    }
    next();
};
exports.optionalAuth = optionalAuth;
// Authentification flexible : accepte le token dans le header OU en query parameter
// Utile pour les routes comme preview/download qui peuvent être ouvertes dans un nouvel onglet
const flexibleAuth = (req, res, next) => {
    try {
        // Essayer d'abord le header Authorization
        const authHeader = req.get('authorization') || req.get('Authorization');
        let token;
        if (authHeader) {
            token = authHeader.split(' ')[1]; // Bearer TOKEN
        }
        else {
            // Si pas de header, essayer le query parameter
            token = req.query.token;
        }
        if (!token) {
            throw new errors_1.AuthError('Token d\'authentification manquant');
        }
        // Vérifier et décoder le token
        const decoded = (0, jwt_1.verifyToken)(token);
        // Ajouter les informations utilisateur à la requête
        req.user = decoded;
        next();
    }
    catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token invalide',
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expiré',
            });
        }
        next(error);
    }
};
exports.flexibleAuth = flexibleAuth;
//# sourceMappingURL=auth.js.map