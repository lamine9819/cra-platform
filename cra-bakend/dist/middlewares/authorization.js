"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireCoordinateurOrAdmin = exports.requireChercheurCoordinateurOrAdmin = exports.requireChercheurOrAdmin = exports.requireAdmin = exports.authorize = void 0;
const authorize = (allowedRoles) => {
    return (req, res, next) => {
        try {
            // Cast vers AuthenticatedRequest après que le middleware authenticate ait ajouté user
            const authenticatedReq = req;
            const userRole = authenticatedReq.user.role;
            if (!allowedRoles.includes(userRole)) {
                return res.status(403).json({
                    success: false,
                    message: 'Accès refusé. Permissions insuffisantes',
                });
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.authorize = authorize;
// Middleware pour vérifier si l'utilisateur est admin
exports.requireAdmin = (0, exports.authorize)(['ADMINISTRATEUR']);
// Middleware pour vérifier si l'utilisateur est chercheur ou admin
exports.requireChercheurOrAdmin = (0, exports.authorize)(['CHERCHEUR', 'ADMINISTRATEUR']);
// Middleware pour vérifier si l'utilisateur est coordinateur, chercheur ou admin
exports.requireChercheurCoordinateurOrAdmin = (0, exports.authorize)(['CHERCHEUR', 'COORDONATEUR_PROJET', 'ADMINISTRATEUR']);
// Middleware pour vérifier si l'utilisateur est coordinateur ou admin
exports.requireCoordinateurOrAdmin = (0, exports.authorize)(['COORDONATEUR_PROJET', 'ADMINISTRATEUR']);
//# sourceMappingURL=authorization.js.map