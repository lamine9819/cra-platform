// src/utils/errors.ts - Classes d'erreurs personnalisées

export class ValidationError extends Error {
  public readonly code: string = 'VALIDATION_ERROR';
  public readonly statusCode: number = 400;

  constructor(message: string, public readonly field?: string) {
    super(message);
    this.name = 'ValidationError';
    
    // Maintenir la pile d'appel pour les erreurs personnalisées
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }
}

export class AuthError extends Error {
  public readonly code: string = 'AUTH_ERROR';
  public readonly statusCode: number = 403;

  constructor(message: string = 'Accès refusé') {
    super(message);
    this.name = 'AuthError';
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuthError);
    }
  }
}

export class NotFoundError extends Error {
  public readonly code: string = 'NOT_FOUND';
  public readonly statusCode: number = 404;

  constructor(message: string = 'Ressource non trouvée') {
    super(message);
    this.name = 'NotFoundError';
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NotFoundError);
    }
  }
}

export class ConflictError extends Error {
  public readonly code: string = 'CONFLICT_ERROR';
  public readonly statusCode: number = 409;

  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ConflictError);
    }
  }
}

export class DatabaseError extends Error {
  public readonly code: string = 'DATABASE_ERROR';
  public readonly statusCode: number = 500;

  constructor(message: string, public readonly originalError?: Error) {
    super(message);
    this.name = 'DatabaseError';
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DatabaseError);
    }
  }
}

export class ServiceUnavailableError extends Error {
  public readonly code: string = 'SERVICE_UNAVAILABLE';
  public readonly statusCode: number = 503;

  constructor(message: string = 'Service temporairement indisponible') {
    super(message);
    this.name = 'ServiceUnavailableError';
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ServiceUnavailableError);
    }
  }
}

export class RateLimitError extends Error {
  public readonly code: string = 'RATE_LIMIT_ERROR';
  public readonly statusCode: number = 429;

  constructor(message: string = 'Trop de requêtes', public readonly retryAfter?: number) {
    super(message);
    this.name = 'RateLimitError';
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RateLimitError);
    }
  }
}

// Type guard pour vérifier si une erreur est une erreur personnalisée
export function isCustomError(error: any): error is 
  | ValidationError 
  | AuthError 
  | AuthorizationError
  | NotFoundError 
  | ConflictError 
  | DatabaseError 
  | ServiceUnavailableError 
  | RateLimitError {
  return error && typeof error.statusCode === 'number' && typeof error.code === 'string';
}

// Utilitaire pour créer une réponse d'erreur standardisée
export function createErrorResponse(error: Error) {
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
export class AuthorizationError extends Error {
  public readonly code: string = 'AUTHORIZATION_ERROR';
  public readonly statusCode: number = 403;

  constructor(message: string = 'Vous n\'êtes pas autorisé à effectuer cette action') {
    super(message);
    this.name = 'AuthorizationError';
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuthorizationError);
    }
  }
}
