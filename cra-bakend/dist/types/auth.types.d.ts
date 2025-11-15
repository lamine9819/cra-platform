import { Request } from 'express';
export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'CHERCHEUR' | 'COORDONATEUR_PROJET' | 'ADMINISTRATEUR';
    phoneNumber?: string;
    specialization?: string;
    department?: string;
}
export interface LoginRequest {
    email: string;
    password: string;
}
export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}
export interface AuthenticatedRequest extends Request {
    user: JWTPayload;
}
export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}
export interface ChangePasswordResponse {
    message: string;
}
//# sourceMappingURL=auth.types.d.ts.map