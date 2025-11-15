"use strict";
// src/utils/errors.ts - Classes d'erreurs personnalisées
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorizationError = exports.RateLimitError = exports.ServiceUnavailableError = exports.DatabaseError = exports.ConflictError = exports.NotFoundError = exports.AuthError = exports.ValidationError = void 0;
exports.isCustomError = isCustomError;
exports.createErrorResponse = createErrorResponse;
class ValidationError extends Error {
    constructor(message, field) {
        super(message);
        this.field = field;
        this.code = 'VALIDATION_ERROR';
        this.statusCode = 400;
        this.name = 'ValidationError';
        // Maintenir la pile d'appel pour les erreurs personnalisées
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ValidationError);
        }
    }
}
exports.ValidationError = ValidationError;
class AuthError extends Error {
    constructor(message = 'Accès refusé') {
        super(message);
        this.code = 'AUTH_ERROR';
        this.statusCode = 403;
        this.name = 'AuthError';
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, AuthError);
        }
    }
}
exports.AuthError = AuthError;
class NotFoundError extends Error {
    constructor(message = 'Ressource non trouvée') {
        super(message);
        this.code = 'NOT_FOUND';
        this.statusCode = 404;
        this.name = 'NotFoundError';
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, NotFoundError);
        }
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends Error {
    constructor(message) {
        super(message);
        this.code = 'CONFLICT_ERROR';
        this.statusCode = 409;
        this.name = 'ConflictError';
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ConflictError);
        }
    }
}
exports.ConflictError = ConflictError;
class DatabaseError extends Error {
    constructor(message, originalError) {
        super(message);
        this.originalError = originalError;
        this.code = 'DATABASE_ERROR';
        this.statusCode = 500;
        this.name = 'DatabaseError';
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, DatabaseError);
        }
    }
}
exports.DatabaseError = DatabaseError;
class ServiceUnavailableError extends Error {
    constructor(message = 'Service temporairement indisponible') {
        super(message);
        this.code = 'SERVICE_UNAVAILABLE';
        this.statusCode = 503;
        this.name = 'ServiceUnavailableError';
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ServiceUnavailableError);
        }
    }
}
exports.ServiceUnavailableError = ServiceUnavailableError;
class RateLimitError extends Error {
    constructor(message = 'Trop de requêtes', retryAfter) {
        super(message);
        this.retryAfter = retryAfter;
        this.code = 'RATE_LIMIT_ERROR';
        this.statusCode = 429;
        this.name = 'RateLimitError';
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, RateLimitError);
        }
    }
}
exports.RateLimitError = RateLimitError;
// Type guard pour vérifier si une erreur est une erreur personnalisée
function isCustomError(error) {
    return error && typeof error.statusCode === 'number' && typeof error.code === 'string';
}
// Utilitaire pour créer une réponse d'erreur standardisée
function createErrorResponse(error) {
    if (isCustomError(error)) {
        return {
            success: false,
            error: {
                code: error.code,
                message: error.message,
                ...(error instanceof ValidationError && error.field ? { field: error.field } : {}),
                ...(error instanceof RateLimitError && error.retryAfter ? { retryAfter: error.retryAfter } : {}),
            },
            statusCode: error.statusCode
        };
    }
    // Erreur générique
    return {
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message: 'Une erreur interne s\'est produite'
        },
        statusCode: 500
    };
}
class AuthorizationError extends Error {
    constructor(message = 'Vous n\'êtes pas autorisé à effectuer cette action') {
        super(message);
        this.code = 'AUTHORIZATION_ERROR';
        this.statusCode = 403;
        this.name = 'AuthorizationError';
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, AuthorizationError);
        }
    }
}
exports.AuthorizationError = AuthorizationError;
//# sourceMappingURL=errors.js.map