export declare class ValidationError extends Error {
    readonly field?: string;
    readonly code: string;
    readonly statusCode: number;
    constructor(message: string, field?: string);
}
export declare class AuthError extends Error {
    readonly code: string;
    readonly statusCode: number;
    constructor(message?: string);
}
export declare class NotFoundError extends Error {
    readonly code: string;
    readonly statusCode: number;
    constructor(message?: string);
}
export declare class ConflictError extends Error {
    readonly code: string;
    readonly statusCode: number;
    constructor(message: string);
}
export declare class DatabaseError extends Error {
    readonly originalError?: Error;
    readonly code: string;
    readonly statusCode: number;
    constructor(message: string, originalError?: Error);
}
export declare class ServiceUnavailableError extends Error {
    readonly code: string;
    readonly statusCode: number;
    constructor(message?: string);
}
export declare class RateLimitError extends Error {
    readonly retryAfter?: number;
    readonly code: string;
    readonly statusCode: number;
    constructor(message?: string, retryAfter?: number);
}
export declare function isCustomError(error: any): error is ValidationError | AuthError | AuthorizationError | NotFoundError | ConflictError | DatabaseError | ServiceUnavailableError | RateLimitError;
export declare function createErrorResponse(error: Error): {
    success: boolean;
    error: {
        retryAfter?: number;
        field?: string;
        code: string;
        message: string;
    };
    statusCode: number;
};
export declare class AuthorizationError extends Error {
    readonly code: string;
    readonly statusCode: number;
    constructor(message?: string);
}
//# sourceMappingURL=errors.d.ts.map