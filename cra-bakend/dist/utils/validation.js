"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.updateProfileSchema = exports.loginSchema = exports.registerSchema = void 0;
// src/utils/validation.ts
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().refine((val) => zod_1.z.email().safeParse(val).success, {
        message: 'Email invalide'
    }),
    password: zod_1.z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),
    firstName: zod_1.z.string().min(2, 'Le prénom doit contenir au moins 2 caractères')
        .max(50, 'Le prénom ne peut pas dépasser 50 caractères'),
    lastName: zod_1.z.string().min(2, 'Le nom doit contenir au moins 2 caractères')
        .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
    role: zod_1.z.enum(['CHERCHEUR', 'COORDONATEUR_PROJET', 'ADMINISTRATEUR']),
    phoneNumber: zod_1.z.string().regex(/^[+]?[\d\s\-()]+$/, 'Format de téléphone invalide').optional().or(zod_1.z.literal('')),
    specialization: zod_1.z.string().max(100, 'La spécialisation ne peut pas dépasser 100 caractères').optional(),
    department: zod_1.z.string().max(100, 'Le département ne peut pas dépasser 100 caractères').optional(),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().refine((val) => zod_1.z.email().safeParse(val).success, {
        message: 'Email invalide'
    }),
    password: zod_1.z.string().min(1, 'Le mot de passe est requis'),
});
// Schemas de validation supplémentaires
exports.updateProfileSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2, 'Le prénom doit contenir au moins 2 caractères').optional(),
    lastName: zod_1.z.string().min(2, 'Le nom doit contenir au moins 2 caractères').optional(),
    phoneNumber: zod_1.z.string().optional(),
    specialization: zod_1.z.string().optional(),
    department: zod_1.z.string().optional(),
});
exports.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1, 'Le mot de passe actuel est requis'),
    newPassword: zod_1.z.string().min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères'),
    confirmPassword: zod_1.z.string().min(1, 'La confirmation du mot de passe est requise'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
});
//# sourceMappingURL=validation.js.map