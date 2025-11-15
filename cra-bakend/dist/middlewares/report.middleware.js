"use strict";
// src/middlewares/report.middleware.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkReportAccess = void 0;
const client_1 = require("@prisma/client");
/**
 * Vérifie que l'utilisateur est coordinateur de projet ou administrateur
 */
const checkReportAccess = (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentification requise'
            });
            return;
        }
        const allowedRoles = [
            client_1.UserRole.COORDONATEUR_PROJET,
            client_1.UserRole.ADMINISTRATEUR
        ];
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: 'Accès non autorisé. Seuls les coordinateurs de projet et les administrateurs peuvent générer des rapports.'
            });
            return;
        }
        next();
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la vérification des permissions',
            error: error.message
        });
    }
};
exports.checkReportAccess = checkReportAccess;
//# sourceMappingURL=report.middleware.js.map