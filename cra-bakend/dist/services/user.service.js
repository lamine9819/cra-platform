"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
// src/services/user.service.ts
const client_1 = require("@prisma/client");
const bcrypt_1 = require("../utils/bcrypt");
const errors_1 = require("../utils/errors");
const prisma = new client_1.PrismaClient();
class UserService {
    /**
     * Créer un utilisateur avec ses spécificités CRA
     */
    async createUser(userData, creatorRole) {
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await prisma.user.findUnique({
            where: { email: userData.email }
        });
        if (existingUser) {
            throw new errors_1.ValidationError('Un utilisateur avec cet email existe déjà');
        }
        // Vérifier les permissions de création selon les rôles CRA
        await this.validateCreationPermissions(userData.role, creatorRole);
        // Valider le superviseur si fourni
        if (userData.supervisorId) {
            await this.validateSupervisor(userData.supervisorId);
        }
        // Vérifier l'unicité du matricule si profil individuel fourni
        if (userData.individualProfile?.matricule) {
            const existingProfile = await prisma.individualProfile.findUnique({
                where: { matricule: userData.individualProfile.matricule }
            });
            if (existingProfile) {
                throw new errors_1.ValidationError('Un profil avec ce matricule existe déjà');
            }
        }
        // Hacher le mot de passe
        const hashedPassword = await (0, bcrypt_1.hashPassword)(userData.password);
        // Créer l'utilisateur avec son profil individuel si nécessaire
        const user = await prisma.user.create({
            data: {
                email: userData.email,
                password: hashedPassword,
                firstName: userData.firstName,
                lastName: userData.lastName,
                role: userData.role,
                phoneNumber: userData.phoneNumber,
                dateOfBirth: userData.dateOfBirth,
                dateOfHire: userData.dateOfHire,
                diploma: userData.diploma,
                specialization: userData.specialization,
                discipline: userData.discipline,
                department: userData.department,
                supervisorId: userData.supervisorId,
                orcidId: userData.orcidId,
                researchGateId: userData.researchGateId,
                googleScholarId: userData.googleScholarId,
                linkedinId: userData.linkedinId,
                // Créer le profil individuel pour les chercheurs
                individualProfile: userData.individualProfile ? {
                    create: {
                        matricule: userData.individualProfile.matricule,
                        grade: userData.individualProfile.grade,
                        classe: userData.individualProfile.classe,
                        dateNaissance: userData.individualProfile.dateNaissance,
                        dateRecrutement: userData.individualProfile.dateRecrutement,
                        localite: userData.individualProfile.localite,
                        diplome: userData.individualProfile.diplome,
                        tempsRecherche: userData.individualProfile.tempsRecherche || 0,
                        tempsEnseignement: userData.individualProfile.tempsEnseignement || 0,
                        tempsFormation: userData.individualProfile.tempsFormation || 0,
                        tempsConsultation: userData.individualProfile.tempsConsultation || 0,
                        tempsGestionScientifique: userData.individualProfile.tempsGestionScientifique || 0,
                        tempsAdministration: userData.individualProfile.tempsAdministration || 0,
                    }
                } : undefined,
            },
            include: {
                supervisor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true,
                    }
                },
                individualProfile: true,
            }
        });
        return this.formatUserResponse(user);
    }
    /**
     * Mettre à jour un utilisateur
     */
    async updateUser(userId, updateData, requesterId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { individualProfile: true }
        });
        if (!user) {
            throw new errors_1.NotFoundError('Utilisateur non trouvé');
        }
        // Vérifier les permissions
        await this.validateUpdatePermissions(user, requesterId);
        // Valider le nouveau superviseur si fourni
        if (updateData.supervisorId) {
            await this.validateSupervisor(updateData.supervisorId, userId);
        }
        // Mettre à jour l'utilisateur
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                firstName: updateData.firstName,
                lastName: updateData.lastName,
                phoneNumber: updateData.phoneNumber,
                dateOfBirth: updateData.dateOfBirth,
                dateOfHire: updateData.dateOfHire,
                diploma: updateData.diploma,
                specialization: updateData.specialization,
                discipline: updateData.discipline,
                department: updateData.department,
                supervisorId: updateData.supervisorId,
                isActive: updateData.isActive,
                orcidId: updateData.orcidId,
                researchGateId: updateData.researchGateId,
                googleScholarId: updateData.googleScholarId,
                linkedinId: updateData.linkedinId,
                notificationPrefs: updateData.notificationPrefs,
                dashboardConfig: updateData.dashboardConfig,
            },
            include: {
                supervisor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true,
                    }
                },
                individualProfile: true,
                supervisedUsers: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true,
                        discipline: true,
                    },
                    where: { isActive: true }
                }
            }
        });
        return this.formatUserResponse(updatedUser);
    }
    /**
     * Mettre à jour le profil individuel d'un chercheur
     */
    async updateIndividualProfile(userId, profileData, requesterId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { individualProfile: true }
        });
        if (!user) {
            throw new errors_1.NotFoundError('Utilisateur non trouvé');
        }
        if (!user.individualProfile) {
            throw new errors_1.ValidationError('Cet utilisateur n\'a pas de profil individuel');
        }
        // Vérifier les permissions
        await this.validateUpdatePermissions(user, requesterId);
        // Vérifier l'unicité du matricule si modifié
        if (profileData.matricule && profileData.matricule !== user.individualProfile.matricule) {
            const existingProfile = await prisma.individualProfile.findUnique({
                where: { matricule: profileData.matricule }
            });
            if (existingProfile) {
                throw new errors_1.ValidationError('Un profil avec ce matricule existe déjà');
            }
        }
        // Mettre à jour le profil individuel
        await prisma.individualProfile.update({
            where: { userId },
            data: profileData,
        });
        // Retourner l'utilisateur mis à jour
        const updatedUser = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                supervisor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true,
                    }
                },
                individualProfile: true,
                supervisedUsers: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true,
                        discipline: true,
                    },
                    where: { isActive: true }
                }
            }
        });
        return this.formatUserResponse(updatedUser);
    }
    /**
     * Créer ou mettre à jour l'allocation de temps pour une année donnée
     */
    async updateTimeAllocation(userId, year, timeData, requesterId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { individualProfile: true }
        });
        if (!user?.individualProfile) {
            throw new errors_1.ValidationError('Profil individuel non trouvé');
        }
        // Vérifier les permissions
        await this.validateUpdatePermissions(user, requesterId);
        // Créer ou mettre à jour l'allocation de temps
        const timeAllocation = await prisma.individualTimeAllocation.upsert({
            where: {
                profileId_year: {
                    profileId: user.individualProfile.id,
                    year
                }
            },
            update: timeData,
            create: {
                profileId: user.individualProfile.id,
                year,
                ...timeData,
            }
        });
        return timeAllocation;
    }
    /**
     * Valider un profil individuel
     */
    async validateIndividualProfile(userId, year, validatorId) {
        const validator = await prisma.user.findUnique({ where: { id: validatorId } });
        // Seuls les administrateurs peuvent valider les profils
        if (validator?.role !== 'ADMINISTRATEUR') {
            throw new errors_1.AuthError('Seuls les administrateurs peuvent valider les profils individuels');
        }
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { individualProfile: true }
        });
        if (!user?.individualProfile) {
            throw new errors_1.ValidationError('Profil individuel non trouvé');
        }
        if (year) {
            // Valider une année spécifique
            await prisma.individualTimeAllocation.updateMany({
                where: {
                    profileId: user.individualProfile.id,
                    year,
                },
                data: {
                    isValidated: true,
                    validatedAt: new Date(),
                    validatedBy: `${validator.firstName} ${validator.lastName}`,
                }
            });
        }
        else {
            // Valider le profil général
            await prisma.individualProfile.update({
                where: { userId },
                data: {
                    isValidated: true,
                    validatedAt: new Date(),
                }
            });
        }
    }
    /**
     * Lister les utilisateurs avec filtres spécifiques CRA
     */
    async listUsers(query) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;
        const where = {};
        // Filtres de base
        if (query.role)
            where.role = query.role;
        if (query.department) {
            where.department = { contains: query.department, mode: 'insensitive' };
        }
        if (query.discipline) {
            where.discipline = { contains: query.discipline, mode: 'insensitive' };
        }
        if (query.isActive !== undefined)
            where.isActive = query.isActive;
        if (query.supervisorId)
            where.supervisorId = query.supervisorId;
        // Filtre par grade (via le profil individuel)
        if (query.grade) {
            where.individualProfile = {
                grade: query.grade
            };
        }
        // Filtre par localité (lieu d'affectation)
        if (query.localite) {
            where.individualProfile = {
                ...where.individualProfile,
                localite: { contains: query.localite, mode: 'insensitive' }
            };
        }
        // Recherche textuelle
        if (query.search) {
            where.OR = [
                { firstName: { contains: query.search, mode: 'insensitive' } },
                { lastName: { contains: query.search, mode: 'insensitive' } },
                { email: { contains: query.search, mode: 'insensitive' } },
                { specialization: { contains: query.search, mode: 'insensitive' } },
                { discipline: { contains: query.search, mode: 'insensitive' } },
                { department: { contains: query.search, mode: 'insensitive' } },
                // Recherche dans le profil individuel
                {
                    individualProfile: {
                        matricule: { contains: query.search, mode: 'insensitive' }
                    }
                }
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
                            role: true,
                        }
                    },
                    individualProfile: true,
                    supervisedUsers: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            role: true,
                            discipline: true,
                        },
                        where: { isActive: true }
                    },
                },
                orderBy: [
                    { role: 'asc' }, // Chercheurs en premier
                    { firstName: 'asc' }
                ]
            }),
            prisma.user.count({ where })
        ]);
        return {
            users: users.map((user) => this.formatUserResponse(user)),
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
    /**
     * Obtenir les statistiques d'un utilisateur
     */
    async getUserStats(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new errors_1.NotFoundError('Utilisateur non trouvé');
        }
        // Compter les projets
        const [totalProjects, activeProjects] = await Promise.all([
            prisma.projectParticipant.count({
                where: { userId }
            }),
            prisma.projectParticipant.count({
                where: {
                    userId,
                    project: { status: { in: ['PLANIFIE', 'EN_COURS'] } }
                }
            })
        ]);
        // Compter les activités
        const [totalActivities, activeActivities] = await Promise.all([
            prisma.activityParticipant.count({
                where: { userId }
            }),
            prisma.activityParticipant.count({
                where: {
                    userId,
                    activity: { status: { in: ['PLANIFIEE', 'EN_COURS'] } }
                }
            })
        ]);
        // Compter les encadrements
        const [supervisedUsers, ongoingSupervisions] = await Promise.all([
            prisma.user.count({
                where: { supervisorId: userId, isActive: true }
            }),
            prisma.supervision.count({
                where: {
                    supervisorId: userId,
                    status: 'EN_COURS'
                }
            })
        ]);
        // Compter les formations
        const [trainingsGiven, trainingsReceived] = await Promise.all([
            prisma.trainingParticipant.count({
                where: {
                    userId,
                    role: 'FORMATEUR'
                }
            }),
            prisma.trainingParticipant.count({
                where: {
                    userId,
                    role: 'PARTICIPANT'
                }
            })
        ]);
        // Publications (via la table de liaison)
        const publications = await prisma.publicationAuthor.count({
            where: { userId }
        });
        // Dernière activité
        const lastActivity = await prisma.activityParticipant.findFirst({
            where: { userId },
            include: {
                activity: {
                    select: {
                        updatedAt: true
                    }
                }
            },
            orderBy: {
                activity: {
                    updatedAt: 'desc'
                }
            }
        });
        return {
            totalProjects,
            activeProjects,
            totalActivities,
            activeActivities,
            supervisedUsers,
            ongoingSupervisions,
            publications,
            trainingsGiven,
            trainingsReceived,
            lastActivityDate: lastActivity?.activity.updatedAt,
        };
    }
    /**
     * Obtenir les chercheurs par thème de recherche
     */
    async getResearchersByTheme(themeId) {
        const researchers = await prisma.user.findMany({
            where: {
                role: 'CHERCHEUR',
                isActive: true,
                OR: [
                    // Chercheurs participant à des activités du thème
                    {
                        activityParticipations: {
                            some: {
                                activity: {
                                    themeId
                                }
                            }
                        }
                    },
                    // Chercheurs responsables d'activités du thème
                    {
                        responsibleActivities: {
                            some: {
                                themeId
                            }
                        }
                    }
                ]
            },
            include: {
                individualProfile: true,
                supervisor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    }
                }
            },
            orderBy: {
                firstName: 'asc'
            }
        });
        return researchers.map(researcher => this.formatUserResponse(researcher));
    }
    /**
     * Obtenir les coordonateurs de projet
     */
    async getProjectCoordinators() {
        const coordinators = await prisma.user.findMany({
            where: {
                role: 'COORDONATEUR_PROJET',
                isActive: true
            },
            include: {
                createdProjects: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                    },
                    where: {
                        status: { in: ['PLANIFIE', 'EN_COURS'] }
                    }
                },
                coordinatedPrograms: {
                    select: {
                        id: true,
                        name: true,
                        isActive: true,
                    }
                }
            },
            orderBy: {
                firstName: 'asc'
            }
        });
        return coordinators.map(coordinator => ({
            ...this.formatUserResponse(coordinator),
            activeProjects: coordinator.createdProjects?.length || 0,
            programs: coordinator.coordinatedPrograms || []
        }));
    }
    /**
     * Supprimer un utilisateur (avec vérifications CRA)
     */
    async deleteUser(userId, requesterId) {
        const requester = await prisma.user.findUnique({
            where: { id: requesterId }
        });
        if (requester?.role !== 'ADMINISTRATEUR') {
            throw new errors_1.AuthError('Seul un administrateur peut supprimer un utilisateur');
        }
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                createdProjects: true,
                responsibleActivities: true,
                coordinatedPrograms: true,
            }
        });
        if (!user) {
            throw new errors_1.NotFoundError('Utilisateur non trouvé');
        }
        // Éviter l'auto-suppression
        if (userId === requesterId) {
            throw new errors_1.ValidationError('Vous ne pouvez pas supprimer votre propre compte');
        }
        // Vérifier s'il y a des dépendances actives
        const hasActiveProjects = user.createdProjects.some(p => ['PLANIFIE', 'EN_COURS'].includes(p.status));
        const hasActiveActivities = user.responsibleActivities.some(a => ['PLANIFIEE', 'EN_COURS'].includes(a.status));
        if (hasActiveProjects || hasActiveActivities || user.coordinatedPrograms.length > 0) {
            throw new errors_1.ValidationError('Impossible de supprimer cet utilisateur car il a des projets/activités/programmes actifs');
        }
        // Supprimer l'utilisateur (CASCADE configuré dans le schema)
        await prisma.user.delete({
            where: { id: userId }
        });
    }
    // MÉTHODES PRIVÉES DE VALIDATION
    async validateCreationPermissions(targetRole, creatorRole) {
        switch (creatorRole) {
            case 'ADMINISTRATEUR':
                // L'admin peut créer n'importe quel rôle
                break;
            case 'CHERCHEUR':
                // Un chercheur peut créer d'autres chercheurs pour la collaboration
                if (targetRole !== 'CHERCHEUR') {
                    throw new errors_1.AuthError(`Un chercheur ne peut créer que d'autres chercheurs`);
                }
                break;
            case 'COORDONATEUR_PROJET':
                // Un coordonateur ne peut PAS créer d'utilisateurs
                throw new errors_1.AuthError('Un coordonateur de projet ne peut pas créer d\'utilisateurs');
            default:
                throw new errors_1.AuthError('Permissions insuffisantes pour créer un utilisateur');
        }
    }
    async validateUpdatePermissions(user, requesterId) {
        const requester = await prisma.user.findUnique({
            where: { id: requesterId }
        });
        if (!requester) {
            throw new errors_1.AuthError('Utilisateur non authentifié');
        }
        // L'admin peut tout modifier
        if (requester.role === 'ADMINISTRATEUR') {
            return;
        }
        // Un utilisateur peut modifier son propre profil (informations de base uniquement)
        if (user.id === requesterId) {
            return;
        }
        // Un superviseur (chercheur) peut modifier les profils de ses supervisés
        if (user.supervisorId === requesterId && requester.role === 'CHERCHEUR') {
            return;
        }
        // Un coordonateur NE PEUT PAS modifier les profils, seulement lire
        if (requester.role === 'COORDONATEUR_PROJET') {
            throw new errors_1.AuthError('Un coordonateur de projet ne peut pas modifier les profils utilisateurs');
        }
        throw new errors_1.AuthError('Permissions insuffisantes pour modifier cet utilisateur');
    }
    async validateSupervisor(supervisorId, userId) {
        const supervisor = await prisma.user.findUnique({
            where: { id: supervisorId }
        });
        if (!supervisor) {
            throw new errors_1.ValidationError('Superviseur non trouvé');
        }
        if (!supervisor.isActive) {
            throw new errors_1.ValidationError('Le superviseur doit être actif');
        }
        if (!['CHERCHEUR', 'ADMINISTRATEUR', 'COORDONATEUR_PROJET'].includes(supervisor.role)) {
            throw new errors_1.ValidationError('Le superviseur doit être un chercheur, coordonateur ou administrateur');
        }
        // Éviter l'auto-supervision
        if (userId && userId === supervisorId) {
            throw new errors_1.ValidationError('Un utilisateur ne peut pas se superviser lui-même');
        }
    }
    /**
     * Formater la réponse utilisateur en excluant le mot de passe
     */
    formatUserResponse(user) {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    /**
     * Obtenir un utilisateur par ID avec toutes ses relations
     */
    async getUserById(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                supervisor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true,
                    }
                },
                individualProfile: {
                    include: {
                        timeAllocations: {
                            orderBy: { year: 'desc' },
                            take: 5, // Les 5 dernières années
                        }
                    }
                },
                supervisedUsers: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true,
                        discipline: true,
                    },
                    where: { isActive: true }
                }
            }
        });
        if (!user) {
            throw new errors_1.NotFoundError('Utilisateur non trouvé');
        }
        return this.formatUserResponse(user);
    }
    /**
     * Obtenir les utilisateurs supervisés par un chercheur
     */
    async getSupervisedUsers(supervisorId) {
        const supervisor = await prisma.user.findUnique({
            where: { id: supervisorId }
        });
        if (!supervisor) {
            throw new errors_1.NotFoundError('Superviseur non trouvé');
        }
        if (!['CHERCHEUR', 'ADMINISTRATEUR', 'COORDONATEUR_PROJET'].includes(supervisor.role)) {
            throw new errors_1.AuthError('Seuls les chercheurs, coordonateurs et administrateurs peuvent avoir des utilisateurs supervisés');
        }
        const supervisedUsers = await prisma.user.findMany({
            where: {
                supervisorId: supervisorId,
                isActive: true
            },
            include: {
                individualProfile: {
                    select: {
                        matricule: true,
                        grade: true,
                        localite: true,
                        isValidated: true,
                    }
                }
            },
            orderBy: [
                { role: 'asc' },
                { firstName: 'asc' }
            ]
        });
        return supervisedUsers.map(user => this.formatUserResponse(user));
    }
    /**
     * Associer un superviseur à un utilisateur
     */
    async assignSupervisor(userId, supervisorId, requesterId) {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new errors_1.NotFoundError('Utilisateur non trouvé');
        }
        // Valider le superviseur
        await this.validateSupervisor(supervisorId, userId);
        // Vérifier les permissions
        await this.validateUpdatePermissions(user, requesterId);
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
                        role: true,
                    }
                },
                individualProfile: true,
            }
        });
        return this.formatUserResponse(updatedUser);
    }
    /**
     * Activer/désactiver un utilisateur
     */
    async toggleUserStatus(userId, isActive, requesterId) {
        const requester = await prisma.user.findUnique({
            where: { id: requesterId }
        });
        if (requester?.role !== 'ADMINISTRATEUR') {
            throw new errors_1.AuthError('Seul un administrateur peut modifier le statut d\'un utilisateur');
        }
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new errors_1.NotFoundError('Utilisateur non trouvé');
        }
        // Éviter l'auto-désactivation
        if (userId === requesterId) {
            throw new errors_1.ValidationError('Vous ne pouvez pas modifier votre propre statut');
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
                        role: true,
                    }
                },
                individualProfile: true,
            }
        });
        return this.formatUserResponse(updatedUser);
    }
    /**
     * Mettre à jour la photo de profil d'un utilisateur
     */
    async updateProfileImage(userId, imageUrl) {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new errors_1.NotFoundError('Utilisateur non trouvé');
        }
        // Supprimer l'ancienne image si elle existe
        if (user.profileImage) {
            const fs = require('fs');
            const path = require('path');
            const oldImagePath = path.join('.', user.profileImage);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { profileImage: imageUrl },
            include: {
                supervisor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true,
                    }
                },
                individualProfile: true,
            }
        });
        return this.formatUserResponse(updatedUser);
    }
    /**
     * Supprimer la photo de profil d'un utilisateur
     */
    async deleteProfileImage(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new errors_1.NotFoundError('Utilisateur non trouvé');
        }
        // Supprimer le fichier physique
        if (user.profileImage) {
            const fs = require('fs');
            const path = require('path');
            const imagePath = path.join('.', user.profileImage);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        // Mettre à jour la base de données
        await prisma.user.update({
            where: { id: userId },
            data: { profileImage: null }
        });
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map