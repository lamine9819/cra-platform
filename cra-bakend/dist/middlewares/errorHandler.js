"use strict";
// =============================================
// 11. MIDDLEWARE DE GESTION D'ERREURS
// =============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errors_1 = require("../utils/errors");
const zod_1 = require("zod");
const errorHandler = (error, _req, res, _next) => {
    console.error('Error:', error);
    // Erreur de validation Zod
    if (error instanceof zod_1.ZodError) {
        return res.status(400).json({
            success: false,
            message: 'Données invalides',
            errors: error.issues.map(err => ({
                field: err.path.join('.'),
                message: err.message,
            })),
        });
    }
    // Erreurs d'authentification
    if (error instanceof errors_1.AuthError) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message,
        });
    }
    // Erreurs de validation
    if (error instanceof errors_1.ValidationError) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message,
        });
    }
    // Erreur par défaut
    res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur',
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map