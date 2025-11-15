"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditErrorMiddleware = exports.auditLogMiddleware = void 0;
const tslib_1 = require("tslib");
const auditLog_service_1 = tslib_1.__importDefault(require("../services/auditLog.service"));
// Actions à ignorer pour éviter trop de logs
const IGNORED_ACTIONS = [
    'GET /api/audit-logs',
    'GET /api/health',
    'GET /api/ping',
];
// Méthodes HTTP à logger
const LOGGED_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];
/**
 * Middleware pour capturer automatiquement les actions HTTP
 */
const auditLogMiddleware = async (req, res, next) => {
    // Ignorer certaines routes
    const action = `${req.method} ${req.path}`;
    if (IGNORED_ACTIONS.some((ignored) => action.includes(ignored))) {
        return next();
    }
    // Ne logger que certaines méthodes HTTP
    if (!LOGGED_METHODS.includes(req.method)) {
        return next();
    }
    // Capturer les métadonnées de la requête
    const metadata = {
        ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        method: req.method,
        path: req.path,
        query: req.query,
        source: 'http',
    };
    // Récupérer l'utilisateur connecté (si authentifié)
    const userId = req.user?.id;
    // Capturer la réponse pour extraire l'entité créée/modifiée
    const originalJson = res.json.bind(res);
    res.json = function (body) {
        // Logger l'action après que la réponse soit envoyée
        setImmediate(async () => {
            try {
                // Déterminer le type d'action
                let actionType = req.method;
                let entityType;
                let entityId;
                let details = {};
                // Extraire le type d'entité depuis l'URL
                const pathParts = req.path.split('/').filter(Boolean);
                if (pathParts.length >= 2) {
                    entityType = pathParts[1]; // Ex: /api/projects => 'projects'
                }
                // Déterminer l'action et l'ID selon le contexte
                if (req.method === 'POST') {
                    actionType = 'CREATE';
                    entityId = body?.data?.id || body?.id;
                    details = {
                        title: `Création de ${entityType}`,
                        description: body?.data?.title || body?.data?.name || body?.title || body?.name,
                    };
                }
                else if (req.method === 'PUT' || req.method === 'PATCH') {
                    actionType = 'UPDATE';
                    entityId = req.params.id || body?.data?.id || body?.id;
                    details = {
                        title: `Modification de ${entityType}`,
                        description: body?.data?.title || body?.data?.name || body?.title || body?.name,
                    };
                }
                else if (req.method === 'DELETE') {
                    actionType = 'DELETE';
                    entityId = req.params.id;
                    details = {
                        title: `Suppression de ${entityType}`,
                        description: `Entité ${entityType} supprimée`,
                    };
                }
                // Créer le log d'audit
                await auditLog_service_1.default.createLog({
                    action: actionType,
                    userId,
                    entityType,
                    entityId,
                    details,
                    metadata,
                    changes: req.method !== 'DELETE' ? {
                        after: body?.data || body,
                    } : undefined,
                });
            }
            catch (error) {
                console.error('Error in audit log middleware:', error);
                // Ne pas interrompre le flux normal même si le log échoue
            }
        });
        return originalJson(body);
    };
    next();
};
exports.auditLogMiddleware = auditLogMiddleware;
/**
 * Middleware pour logger les erreurs
 */
const auditErrorMiddleware = (err, req, res, next) => {
    const userId = req.user?.id;
    const metadata = {
        ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        method: req.method,
        path: req.path,
        query: req.query,
        source: 'http',
    };
    // Logger l'erreur de manière asynchrone
    setImmediate(async () => {
        try {
            await auditLog_service_1.default.logError(err, userId, undefined, undefined, metadata);
        }
        catch (logError) {
            console.error('Error logging error to audit:', logError);
        }
    });
    // Continuer avec le handler d'erreur normal
    next(err);
};
exports.auditErrorMiddleware = auditErrorMiddleware;
exports.default = exports.auditLogMiddleware;
//# sourceMappingURL=auditLog.middleware.js.map