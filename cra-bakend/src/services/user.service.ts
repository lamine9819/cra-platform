// src/services/user.service.ts
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/bcrypt';
import { ValidationError, AuthError } from '../utils/errors';
import { CreateUserRequest, UpdateUserRequest, UserListQuery, UserResponse } from '../types/user.types';

const prisma = new PrismaClient();

// Type pour les utilisateurs avec relations incluses
type UserWithSupervisor = {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  phoneNumber?: string | null;
  specialization?: string | null;
  department?: string | null;
  supervisorId?: string | null;
  isActive: boolean;
  profileImage?: string | null;
  createdAt: Date;
  updatedAt: Date;
  supervisor?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  supervisedUsers?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  }[];
};

export class UserService {
  
  // Créer un utilisateur
  async createUser(userData: CreateUserRequest, creatorRole: string): Promise<UserResponse> {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    });

    if (existingUser) {
      throw new ValidationError('Un utilisateur avec cet email existe déjà');
    }

    // Vérifier les permissions de création selon le rôle
    if (creatorRole !== 'ADMINISTRATEUR') {
      if (userData.role === 'ADMINISTRATEUR') {
        throw new AuthError('Seul un administrateur peut créer un autre administrateur');
      }
      if (userData.role === 'CHERCHEUR' && creatorRole !== 'CHERCHEUR') {
        throw new AuthError('Seul un chercheur ou un administrateur peut créer un chercheur');
      }
    }

    // Valider le superviseur si fourni
    if (userData.supervisorId) {
      const supervisor = await prisma.user.findUnique({
        where: { id: userData.supervisorId }
      });

      if (!supervisor) {
        throw new ValidationError('Superviseur non trouvé');
      }

      if (supervisor.role !== 'CHERCHEUR' && supervisor.role !== 'ADMINISTRATEUR') {
        throw new ValidationError('Le superviseur doit être un chercheur ou un administrateur');
      }
    }

    // Hacher le mot de passe
    const hashedPassword = await hashPassword(userData.password);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
      include: {
        supervisor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });

    return this.formatUserResponse(user);
  }

  // Associer un superviseur à un utilisateur
  async assignSupervisor(userId: string, supervisorId: string, requesterId: string): Promise<UserResponse> {
    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new ValidationError('Utilisateur non trouvé');
    }

    // Vérifier que le superviseur existe et a le bon rôle
    const supervisor = await prisma.user.findUnique({
      where: { id: supervisorId }
    });

    if (!supervisor) {
      throw new ValidationError('Superviseur non trouvé');
    }

    if (supervisor.role !== 'CHERCHEUR' && supervisor.role !== 'ADMINISTRATEUR') {
      throw new ValidationError('Le superviseur doit être un chercheur ou un administrateur');
    }

    // Éviter l'auto-supervision
    if (userId === supervisorId) {
      throw new ValidationError('Un utilisateur ne peut pas se superviser lui-même');
    }

    // Vérifier les permissions (seul l'admin ou le superviseur actuel peut changer)
    const requester = await prisma.user.findUnique({
      where: { id: requesterId }
    });

    if (requester?.role !== 'ADMINISTRATEUR' && user.supervisorId !== requesterId) {
      throw new AuthError('Permissions insuffisantes pour modifier ce superviseur');
    }

    // Mettre à jour le superviseur
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { supervisorId },
      include: {
        supervisor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });

    return this.formatUserResponse(updatedUser);
  }

  // Activer/désactiver un utilisateur
  async toggleUserStatus(userId: string, isActive: boolean, requesterId: string): Promise<UserResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new ValidationError('Utilisateur non trouvé');
    }

    // Éviter l'auto-désactivation
    if (userId === requesterId) {
      throw new ValidationError('Vous ne pouvez pas modifier votre propre statut');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
      include: {
        supervisor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            department: true,
            specialization: true,
          }
        }
      }
    });

    return this.formatUserResponse(updatedUser);
  }
  // Mettre à jour un utilisateur
  async updateUser(userId: string, updateData: UpdateUserRequest, requesterId: string): Promise<UserResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new ValidationError('Utilisateur non trouvé');
    }

    // Vérifier les permissions (seul l'admin ou le superviseur actuel peut modifier)
    const requester = await prisma.user.findUnique({
      where: { id: requesterId }
    });

    if (requester?.role !== 'ADMINISTRATEUR' && user.supervisorId !== requesterId) {
      throw new AuthError('Permissions insuffisantes pour modifier cet utilisateur');
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        supervisor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            department: true,
            specialization: true,
          }
        }
      }
    });

    return this.formatUserResponse(updatedUser);
  }
  // Supprimer un utilisateur
  async deleteUser(userId: string, requesterId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new ValidationError('Utilisateur non trouvé');
    }

    // Vérifier les permissions (seul l'admin ou le superviseur actuel peut supprimer)
    const requester = await prisma.user.findUnique({
      where: { id: requesterId }
    });

    if (requester?.role !== 'ADMINISTRATEUR' && user.supervisorId !== requesterId) {
      throw new AuthError('Permissions insuffisantes pour supprimer cet utilisateur');
    }

    await prisma.user.delete({
      where: { id: userId }
    });
  }

  // Lister tous les utilisateurs avec filtres
  async listUsers(query: UserListQuery) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    // Construire les filtres
    const where: any = {};

    if (query.role) {
      where.role = query.role;
    }

    if (query.department) {
      where.department = {
        contains: query.department,
        mode: 'insensitive'
      };
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { specialization: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // Exécuter la requête avec pagination
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          supervisor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.user.count({ where })
    ]);

    return {
      users: users.map((user: any) => this.formatUserResponse(user)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      }
    };
  }

  // Lister les utilisateurs supervisés par un chercheur
  async getSupervisedUsers(supervisorId: string) {
    const supervisor = await prisma.user.findUnique({
      where: { id: supervisorId }
    });

    if (!supervisor) {
      throw new ValidationError('Superviseur non trouvé');
    }

    if (supervisor.role !== 'CHERCHEUR' && supervisor.role !== 'ADMINISTRATEUR') {
      throw new AuthError('Seuls les chercheurs et administrateurs peuvent avoir des utilisateurs supervisés');
    }

    const supervisedUsers = await prisma.user.findMany({
      where: {
        supervisorId: supervisorId,
        isActive: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        specialization: true,
        department: true,
        createdAt: true,
      },
      orderBy: {
        firstName: 'asc'
      }
    });

    return supervisedUsers;
  }

  // Obtenir un utilisateur par ID
  async getUserById(userId: string): Promise<UserResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        supervisor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        supervisedUsers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
          where: {
            isActive: true
          }
        }
      }
    });

    if (!user) {
      throw new ValidationError('Utilisateur non trouvé');
    }

    return this.formatUserResponse(user);
  }

  // Formater la réponse utilisateur
  private formatUserResponse(user: UserWithSupervisor): UserResponse {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as UserResponse;
  }
}