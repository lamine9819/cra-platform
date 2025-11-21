// src/controllers/user.controller.ts
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { IndividualProfileService } from '../services/individualProfile.service';
import { AuthenticatedRequest } from '../types/auth.types';
import {
  createUserSchema,
  updateUserSchema,
  updateIndividualProfileSchema,
  assignSupervisorSchema,
  userListQuerySchema,
  createTimeAllocationSchema,
  validateIndividualProfileSchema,
  downloadIndividualProfileSchema
} from '../utils/userValidation';

const userService = new UserService();
const individualProfileService = new IndividualProfileService();

export class UserController {

  /**
   * Créer un utilisateur avec profil individuel si nécessaire
   */
  createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const validatedData = createUserSchema.parse(req.body);
      const creatorRole = authenticatedReq.user.role;

      const user = await userService.createUser(validatedData, creatorRole);

      res.status(201).json({
        success: true,
        message: 'Utilisateur créé avec succès',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Mettre à jour un utilisateur
   */
  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { userId } = req.params;
      const validatedData = updateUserSchema.parse(req.body);
      const requesterId = authenticatedReq.user.userId;

      const user = await userService.updateUser(userId, validatedData, requesterId);

      res.status(200).json({
        success: true,
        message: 'Utilisateur mis à jour avec succès',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Mettre à jour le profil individuel d'un chercheur
   */
  updateIndividualProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { userId } = req.params;
      const validatedData = updateIndividualProfileSchema.parse(req.body);
      const requesterId = authenticatedReq.user.userId;

      const user = await userService.updateIndividualProfile(userId, validatedData, requesterId);

      res.status(200).json({
        success: true,
        message: 'Profil individuel mis à jour avec succès',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Créer ou mettre à jour l'allocation de temps pour une année
   */
  updateTimeAllocation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { userId } = req.params;
      const validatedData = createTimeAllocationSchema.parse(req.body);
      const requesterId = authenticatedReq.user.userId;

      const timeAllocation = await userService.updateTimeAllocation(
        userId, 
        validatedData.year, 
        {
          tempsRecherche: validatedData.tempsRecherche,
          tempsEnseignement: validatedData.tempsEnseignement,
          tempsFormation: validatedData.tempsFormation,
          tempsConsultation: validatedData.tempsConsultation,
          tempsGestionScientifique: validatedData.tempsGestionScientifique,
          tempsAdministration: validatedData.tempsAdministration,
        },
        requesterId
      );

      res.status(200).json({
        success: true,
        message: 'Allocation de temps mise à jour avec succès',
        data: timeAllocation,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Valider un profil individuel ou une année spécifique
   */
  validateIndividualProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { userId } = req.params;
      const { year } = validateIndividualProfileSchema.parse(req.body);
      const validatorId = authenticatedReq.user.userId;

      await userService.validateIndividualProfile(userId, year || null, validatorId);

      res.status(200).json({
        success: true,
        message: year 
          ? `Allocation de temps pour l'année ${year} validée avec succès`
          : 'Profil individuel validé avec succès',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Télécharger la fiche individuelle d'un chercheur
   */
  downloadIndividualProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { userId } = req.params;
      const { format } = downloadIndividualProfileSchema.parse(req.query);
      const requesterId = authenticatedReq.user.userId;
      const requesterRole = authenticatedReq.user.role;

      // Vérifier les permissions
      if (
        requesterRole !== 'ADMINISTRATEUR' && 
        requesterRole !== 'COORDONATEUR_PROJET' && 
        userId !== requesterId
      ) {
        return res.status(403).json({
          success: false,
          message: 'Vous n\'avez pas la permission de télécharger cette fiche individuelle'
        });
      }

      // Générer le document
      const result = await individualProfileService.generateIndividualProfileDocument(
        userId,
        format
      );

      // Définir les en-têtes de réponse
      const contentType = format === 'pdf' 
        ? 'application/pdf' 
        : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      
      const extension = format === 'pdf' ? 'pdf' : 'docx';
      const filename = `Fiche_Individuelle_${result.matricule}.${extension}`;

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', result.buffer.length);

      res.send(result.buffer);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Télécharger sa propre fiche individuelle
   */
  downloadMyIndividualProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const userId = authenticatedReq.user.userId;
      const { format } = downloadIndividualProfileSchema.parse(req.query);

      // Générer le document
      const result = await individualProfileService.generateIndividualProfileDocument(
        userId,
        format
      );

      // Définir les en-têtes de réponse
      const contentType = format === 'pdf' 
        ? 'application/pdf' 
        : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      
      const extension = format === 'pdf' ? 'pdf' : 'docx';
      const filename = `Fiche_Individuelle_${result.matricule}.${extension}`;

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', result.buffer.length);

      res.send(result.buffer);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Supprimer un utilisateur
   */
  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { userId } = req.params;
      const requesterId = authenticatedReq.user.userId;

      await userService.deleteUser(userId, requesterId);

      res.status(200).json({
        success: true,
        message: 'Utilisateur supprimé avec succès',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Associer un superviseur
   */
  assignSupervisor = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { userId } = req.params;
      const { supervisorId } = assignSupervisorSchema.parse(req.body);
      const requesterId = authenticatedReq.user.userId;

      const user = await userService.assignSupervisor(userId, supervisorId, requesterId);

      res.status(200).json({
        success: true,
        message: 'Superviseur assigné avec succès',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Activer un utilisateur
   */
  activateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { userId } = req.params;
      const requesterId = authenticatedReq.user.userId;

      const user = await userService.toggleUserStatus(userId, true, requesterId);

      res.status(200).json({
        success: true,
        message: 'Utilisateur activé avec succès',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Désactiver un utilisateur
   */
  deactivateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { userId } = req.params;
      const requesterId = authenticatedReq.user.userId;

      const user = await userService.toggleUserStatus(userId, false, requesterId);

      res.status(200).json({
        success: true,
        message: 'Utilisateur désactivé avec succès',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Lister tous les utilisateurs avec filtres CRA
   */
  listUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const queryParams = userListQuerySchema.parse(req.query);
      const result = await userService.listUsers(queryParams);

      res.status(200).json({
        success: true,
        data: result.users,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Lister les utilisateurs supervisés
   */
  getSupervisedUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const supervisorId = authenticatedReq.user.userId;
      const supervisedUsers = await userService.getSupervisedUsers(supervisorId);

      res.status(200).json({
        success: true,
        data: supervisedUsers,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtenir un utilisateur par ID
   */
  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const user = await userService.getUserById(userId);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtenir les statistiques d'un utilisateur
   */
  getUserStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const stats = await userService.getUserStats(userId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtenir les chercheurs par thème de recherche
   */
  getResearchersByTheme = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { themeId } = req.params;
      const researchers = await userService.getResearchersByTheme(themeId);

      res.status(200).json({
        success: true,
        data: researchers,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtenir les coordonateurs de projet actifs
   */
  getProjectCoordinators = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const coordinators = await userService.getProjectCoordinators();

      res.status(200).json({
        success: true,
        data: coordinators,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtenir le profil complet de l'utilisateur connecté
   */
  getMyProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const userId = authenticatedReq.user.userId;
      
      const [user, stats] = await Promise.all([
        userService.getUserById(userId),
        userService.getUserStats(userId)
      ]);

      res.status(200).json({
        success: true,
        data: {
          ...user,
          stats
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Mettre à jour son propre profil
   */
  updateMyProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const userId = authenticatedReq.user.userId;
      const validatedData = updateUserSchema.parse(req.body);

      const user = await userService.updateUser(userId, validatedData, userId);

      res.status(200).json({
        success: true,
        message: 'Profil mis à jour avec succès',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Mettre à jour son propre profil individuel
   */
  updateMyIndividualProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const userId = authenticatedReq.user.userId;
      const validatedData = updateIndividualProfileSchema.parse(req.body);

      const user = await userService.updateIndividualProfile(userId, validatedData, userId);

      res.status(200).json({
        success: true,
        message: 'Profil individuel mis à jour avec succès',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Upload d'une photo de profil
   */
  uploadProfileImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const userId = authenticatedReq.user.userId;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Aucune image fournie',
        });
      }

      const imageUrl = `/uploads/profiles/${req.file.filename}`;
      const user = await userService.updateProfileImage(userId, imageUrl);

      res.status(200).json({
        success: true,
        message: 'Photo de profil mise à jour avec succès',
        data: {
          profileImage: user.profileImage,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Supprimer la photo de profil
   */
  deleteProfileImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const userId = authenticatedReq.user.userId;

      await userService.deleteProfileImage(userId);

      res.status(200).json({
        success: true,
        message: 'Photo de profil supprimée avec succès',
      });
    } catch (error) {
      next(error);
    }
  };
}