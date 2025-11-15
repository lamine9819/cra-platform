"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditMiddlewares = exports.auditSystemError = exports.auditCriticalDataChange = exports.auditDocumentAccess = exports.auditAdminAction = exports.auditAuthAttempt = exports.auditAction = void 0;
const audit_service_1 = require("../services/audit.service");
// Middleware pour auditer automatiquement les actions
const auditAction = (action, options = {}) => {
    return async (req, res, next) => {
        try {
            const authenticatedReq = req;
            // Stocker les données originales pour le tracking des changements
            let originalData = null;
            if (options.trackChanges && options.entityType && req.params.id) {
                originalData = await getOriginalEntityData(options.entityType, req.params.id);
            }
            // Capturer la réponse originale
            const originalSend = res.json;
            res.json = function (data) {
                // Si l'action a réussi, créer le log d'audit en arrière-plan
                if (data.success) {
                    setImmediate(async () => {
                        try {
                            const entityId = options.extractEntityId
                                ? options.extractEntityId(req, res)
                                : req.params.id || data.data?.id;
                            const details = options.extractDetails
                                ? options.extractDetails(req, res)
                                : {
                                    method: req.method,
                                    url: req.url,
                                    body: sanitizeRequestBody(req.body),
                                    params: req.params,
                                    query: req.query,
                                };
                            let changes = undefined;
                            if (options.trackChanges && originalData && data.data) {
                                changes = (0, audit_service_1.detectChanges)(originalData, data.data);
                            }
                            await (0, audit_service_1.createAuditLog)(action, {
                                level: options.level || 'INFO',
                                userId: authenticatedReq.user?.userId,
                                entityType: options.entityType,
                                entityId,
                                details,
                                changes: changes && changes.fields.length > 0 ? changes : undefined
                            }, req);
                        }
                        catch (error) {
                            console.error(`❌ Erreur audit automatique ${action}:`, error);
                        }
                    });
                }
                return originalSend.call(this, data);
            };
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.auditAction = auditAction;
// Middleware pour auditer les tentatives de connexion
const auditAuthAttempt = (_action) => {
    return async (req, res, next) => {
        const originalSend = res.json;
        res.json = function (data) {
            setImmediate(async () => {
                try {
                    const isSuccess = data.success;
                    const auditAction = isSuccess ? 'AUTH_LOGIN' : 'AUTH_LOGIN_FAILED';
                    const level = isSuccess ? 'INFO' : 'WARNING';
                    await (0, audit_service_1.createAuditLog)(auditAction, {
                        level: level,
                        userId: isSuccess ? data.data?.user?.id : undefined,
                        details: {
                            email: req.body.email,
                            success: isSuccess,
                            timestamp: new Date().toISOString(),
                            ...(data.message && { message: data.message })
                        }
                    }, req);
                }
                catch (error) {
                    console.error(`❌ Erreur audit authentification:`, error);
                }
            });
            return originalSend.call(this, data);
        };
        next();
    };
};
exports.auditAuthAttempt = auditAuthAttempt;
// Middleware pour auditer les actions d'administration
const auditAdminAction = (action, entityType) => {
    return (0, exports.auditAction)(action, {
        level: 'WARNING', // Les actions admin sont importantes
        entityType,
        extractDetails: (req, res) => ({
            adminAction: true,
            method: req.method,
            url: req.url,
            targetUser: req.params.userId || req.body.userId,
            changes: req.body,
            timestamp: new Date().toISOString()
        })
    });
};
exports.auditAdminAction = auditAdminAction;
// Middleware pour auditer les accès aux documents sensibles
const auditDocumentAccess = (action) => {
    return (0, exports.auditAction)(action, {
        level: 'INFO',
        entityType: 'document',
        extractEntityId: (req) => req.params.id,
        extractDetails: (req, res) => ({
            documentAction: true,
            method: req.method,
            url: req.url,
            timestamp: new Date().toISOString(),
            ...(req.body.sharedWithIds && { sharedWith: req.body.sharedWithIds })
        })
    });
};
exports.auditDocumentAccess = auditDocumentAccess;
// Middleware pour auditer les modifications de données critiques
const auditCriticalDataChange = (entityType) => {
    return (0, exports.auditAction)(`${entityType.toUpperCase()}_UPDATED`, {
        level: 'WARNING',
        entityType,
        trackChanges: true,
        extractDetails: (req) => ({
            criticalChange: true,
            method: req.method,
            url: req.url,
            modifiedFields: Object.keys(req.body),
            timestamp: new Date().toISOString()
        })
    });
};
exports.auditCriticalDataChange = auditCriticalDataChange;
// Middleware pour auditer les erreurs système
const auditSystemError = async (error, req, res, next) => {
    try {
        const authenticatedReq = req;
        // Ne pas créer d'audit log pour les erreurs d'authentification
        // car l'utilisateur n'est pas (ou n'est plus) valide
        if (error.name === 'AuthError' || error.code === 'AUTH_ERROR') {
            next(error);
            return;
        }
        // Vérifier si l'utilisateur existe avant de créer l'audit log
        let userId = authenticatedReq.user?.userId;
        if (userId) {
            const { PrismaClient } = await Promise.resolve().then(() => __importStar(require('@prisma/client')));
            const prisma = new PrismaClient();
            try {
                const userExists = await prisma.user.findUnique({
                    where: { id: userId },
                    select: { id: true }
                });
                if (!userExists) {
                    userId = undefined; // L'utilisateur n'existe plus, ne pas l'associer au log
                }
            }
            catch {
                userId = undefined;
            }
            finally {
                await prisma.$disconnect();
            }
        }
        await (0, audit_service_1.createAuditLog)('SYSTEM_ERROR_OCCURRED', {
            level: 'ERROR',
            userId,
            details: {
                error: {
                    name: error.name,
                    message: error.message,
                    stack: error.stack?.split('\n').slice(0, 5), // Limiter la stack trace
                },
                request: {
                    method: req.method,
                    url: req.url,
                    userAgent: req.get('User-Agent'),
                    timestamp: new Date().toISOString()
                }
            }
        }, req);
    }
    catch (auditError) {
        console.error('❌ Erreur lors de l\'audit d\'erreur système:', auditError);
    }
    next(error);
};
exports.auditSystemError = auditSystemError;
// =============================================
// FONCTIONS UTILITAIRES
// =============================================
// Récupérer les données originales d'une entité
async function getOriginalEntityData(entityType, entityId) {
    const { PrismaClient } = await Promise.resolve().then(() => __importStar(require('@prisma/client')));
    const prisma = new PrismaClient();
    try {
        switch (entityType) {
            case 'user':
                return await prisma.user.findUnique({ where: { id: entityId } });
            case 'project':
                return await prisma.project.findUnique({ where: { id: entityId } });
            case 'activity':
                return await prisma.activity.findUnique({ where: { id: entityId } });
            case 'task':
                return await prisma.task.findUnique({ where: { id: entityId } });
            case 'document':
                return await prisma.document.findUnique({ where: { id: entityId } });
            case 'seminar':
                return await prisma.seminar.findUnique({ where: { id: entityId } });
            default:
                return null;
        }
    }
    catch (error) {
        console.warn(`Impossible de récupérer les données originales pour ${entityType}:${entityId}`);
        return null;
    }
    finally {
        await prisma.$disconnect();
    }
}
// Nettoyer le body de la requête pour l'audit (enlever les mots de passe, etc.)
function sanitizeRequestBody(body) {
    if (!body || typeof body !== 'object')
        return body;
    const sanitized = { ...body };
    // Champs sensibles à masquer
    const sensitiveFields = ['password', 'newPassword', 'currentPassword', 'token', 'secret'];
    for (const field of sensitiveFields) {
        if (sanitized[field]) {
            sanitized[field] = '[REDACTED]';
        }
    }
    return sanitized;
}
// Middlewares pré-configurés pour actions communes
exports.auditMiddlewares = {
    // Authentification
    login: (0, exports.auditAuthAttempt)('AUTH_LOGIN'),
    logout: (0, exports.auditAction)('AUTH_LOGOUT', { level: 'INFO' }),
    // Utilisateurs
    userCreated: (0, exports.auditAction)('USER_CREATED', {
        level: 'INFO',
        entityType: 'user',
        extractEntityId: (req, res) => res.locals?.data?.id || req.body.id
    }),
    userUpdated: (0, exports.auditCriticalDataChange)('user'),
    userDeleted: (0, exports.auditAdminAction)('USER_DELETED', 'user'),
    // Projets
    projectCreated: (0, exports.auditAction)('PROJECT_CREATED', {
        level: 'INFO',
        entityType: 'project'
    }),
    projectUpdated: (0, exports.auditAction)('PROJECT_UPDATED', {
        level: 'INFO',
        entityType: 'project',
        trackChanges: true
    }),
    projectDeleted: (0, exports.auditAction)('PROJECT_DELETED', {
        level: 'WARNING',
        entityType: 'project'
    }),
    // Documents
    documentUploaded: (0, exports.auditDocumentAccess)('DOCUMENT_UPLOADED'),
    documentDownloaded: (0, exports.auditDocumentAccess)('DOCUMENT_DOWNLOADED'),
    documentShared: (0, exports.auditDocumentAccess)('DOCUMENT_SHARED'),
    documentDeleted: (0, exports.auditAction)('DOCUMENT_DELETED', {
        level: 'WARNING',
        entityType: 'document'
    }),
    // Tâches
    taskCreated: (0, exports.auditAction)('TASK_CREATED', {
        level: 'INFO',
        entityType: 'task'
    }),
    taskAssigned: (0, exports.auditAction)('TASK_ASSIGNED', {
        level: 'INFO',
        entityType: 'task',
        extractDetails: (req) => ({
            assigneeId: req.body.assigneeId,
            previousAssigneeId: req.body.previousAssigneeId
        })
    }),
    taskCompleted: (0, exports.auditAction)('TASK_COMPLETED', {
        level: 'INFO',
        entityType: 'task'
    }),
    // Séminaires
    seminarCreated: (0, exports.auditAction)('SEMINAR_CREATED', {
        level: 'INFO',
        entityType: 'seminar'
    }),
    seminarRegistered: (0, exports.auditAction)('SEMINAR_REGISTERED', {
        level: 'INFO',
        entityType: 'seminar'
    }),
};
//# sourceMappingURL=auditMiddleware.js.map