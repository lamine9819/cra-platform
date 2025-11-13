// src/services/auth.service.ts - Version mise à jour avec changement de mot de passe
import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword } from '../utils/bcrypt';
import { generateToken } from '../config/jwt';
import { AuthError, ValidationError } from '../utils/errors';
import { RegisterRequest, LoginRequest, ChangePasswordRequest } from '../types/auth.types';

const prisma = new PrismaClient();

export class AuthService {
  async register(userData: RegisterRequest) {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    });

    if (existingUser) {
      throw new ValidationError('Un utilisateur avec cet email existe déjà');
    }

    // Hacher le mot de passe
    const hashedPassword = await hashPassword(userData.password);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        specialization: true,
        department: true,
        createdAt: true,
      }
    });

    // Générer le token JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user,
      token,
      message: 'Utilisateur créé avec succès'
    };
  }

  async login(credentials: LoginRequest) {
    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: credentials.email }
    });

    if (!user) {
      throw new AuthError('Email ou mot de passe incorrect');
    }

    // Vérifier si l'utilisateur est actif
    if (!user.isActive) {
      throw new AuthError('Compte désactivé. Contactez l\'administrateur');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await comparePassword(credentials.password, user.password);

    if (!isPasswordValid) {
      throw new AuthError('Email ou mot de passe incorrect');
    }

    // Générer le token JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        specialization: user.specialization,
        department: user.department,
      },
      token,
      message: 'Connexion réussie'
    };
  }

  async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        specialization: true,
        department: true,
        phoneNumber: true,
        profileImage: true,
        createdAt: true,
      }
    });

    if (!user) {
      throw new AuthError('Utilisateur non trouvé');
    }

    return user;
  }

  // NOUVELLE MÉTHODE : Changer le mot de passe
  async changePassword(userId: string, passwordData: ChangePasswordRequest) {
    // Récupérer l'utilisateur avec son mot de passe
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        password: true,
        email: true,
        firstName: true,
        lastName: true,
      }
    });

    if (!user) {
      throw new AuthError('Utilisateur non trouvé');
    }

    // Vérifier le mot de passe actuel
    const isCurrentPasswordValid = await comparePassword(
      passwordData.currentPassword, 
      user.password
    );

    if (!isCurrentPasswordValid) {
      throw new AuthError('Le mot de passe actuel est incorrect');
    }

    // Vérifier que le nouveau mot de passe est différent de l'ancien
    const isSamePassword = await comparePassword(
      passwordData.newPassword, 
      user.password
    );

    if (isSamePassword) {
      throw new ValidationError('Le nouveau mot de passe doit être différent de l\'ancien');
    }

    // Hacher le nouveau mot de passe
    const hashedNewPassword = await hashPassword(passwordData.newPassword);

    // Mettre à jour le mot de passe dans la base de données
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
        updatedAt: new Date(),
      }
    });

    return {
      message: 'Mot de passe modifié avec succès'
    };
  }
}