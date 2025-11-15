"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = void 0;
const client_1 = require("@prisma/client");
const errorHandler = (error, req, res, next) => {
    console.error('Error:', error);
    if (error instanceof client_1.Prisma.PrismaClientValidationError) {
        return res.status(400).json({
            success: false,
            message: 'Erreur de validation des données',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
    if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
            return res.status(409).json({
                success: false,
                message: 'Cette ressource existe déjà',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                message: 'Ressource non trouvée',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
    if (error.name === 'MulterError') {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'Le fichier est trop volumineux (limite: 50 MB)'
            });
        }
        return res.status(400).json({
            success: false,
            message: 'Erreur lors de l\'upload du fichier',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
    if (error.message) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message,
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
    res.status(500).json({
        success: false,
        message: 'Une erreur interne du serveur s\'est produite',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route non trouvée'
    });
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=error.middleware.js.map