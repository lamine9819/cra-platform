import { RegisterRequest, LoginRequest, ChangePasswordRequest } from '../types/auth.types';
export declare class AuthService {
    register(userData: RegisterRequest): Promise<{
        user: {
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
            createdAt: Date;
            firstName: string;
            lastName: string;
            specialization: string;
            department: string;
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
            isActive: true;
            specialization: string;
            department: string;
            phoneNumber: string;
            profileImage: string;
            createdAt: Date;
            updatedAt: Date;
        };
        token: string;
        message: string;
    }>;
    getUserProfile(userId: string): Promise<{
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        firstName: string;
        lastName: string;
        isActive: boolean;
        profileImage: string;
        phoneNumber: string;
        specialization: string;
        department: string;
    }>;
    changePassword(userId: string, passwordData: ChangePasswordRequest): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=auth.service.d.ts.map