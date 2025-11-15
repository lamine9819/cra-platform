import { RegisterRequest, LoginRequest, ChangePasswordRequest } from '../types/auth.types';
export declare class AuthService {
    register(userData: RegisterRequest): Promise<{
        user: {
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
            firstName: string;
            lastName: string;
            specialization: string | null;
            department: string | null;
            createdAt: Date;
        };
        token: string;
        message: string;
    }>;
    login(credentials: LoginRequest): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: import(".prisma/client").$Enums.UserRole;
            specialization: string | null;
            department: string | null;
        };
        token: string;
        message: string;
    }>;
    getUserProfile(userId: string): Promise<{
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        id: string;
        firstName: string;
        lastName: string;
        profileImage: string | null;
        phoneNumber: string | null;
        specialization: string | null;
        department: string | null;
        createdAt: Date;
    }>;
    changePassword(userId: string, passwordData: ChangePasswordRequest): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=auth.service.d.ts.map