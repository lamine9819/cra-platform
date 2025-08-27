// src/controllers/task.controller.ts
import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service';
import { AuthenticatedRequest } from '../types/auth.types';
import {
  createTaskSchema,
  updateTaskSchema,
  taskListQuerySchema
} from '../utils/taskValidation';

const taskService = new TaskService();

export class TaskController {

  // Créer une tâche
  createTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const validatedData = createTaskSchema.parse(req.body);
      const creatorId = authenticatedReq.user.userId;
      const creatorRole = authenticatedReq.user.role;

      const task = await taskService.createTask(validatedData, creatorId, creatorRole);

      res.status(201).json({
        success: true,
        message: 'Tâche créée avec succès',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  };

  // Mettre à jour une tâche
  updateTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const validatedData = updateTaskSchema.parse(req.body);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const task = await taskService.updateTask(id, validatedData, userId, userRole);

      res.status(200).json({
        success: true,
        message: 'Tâche mise à jour avec succès',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  };

  // Obtenir les tâches assignées à l'utilisateur connecté
  getAssignedTasks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const queryParams = taskListQuerySchema.parse(req.query);
      const userId = authenticatedReq.user.userId;

      const result = await taskService.getAssignedTasks(userId, queryParams);

      res.status(200).json({
        success: true,
        data: result.tasks,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  // Obtenir les tâches d'un projet
  getProjectTasks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { projectId } = req.params;
      const queryParams = taskListQuerySchema.parse(req.query);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const result = await taskService.getProjectTasks(projectId, userId, userRole, queryParams);

      res.status(200).json({
        success: true,
        data: result.tasks,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  // Obtenir les tâches d'une activité
  getActivityTasks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { activityId } = req.params;
      const queryParams = taskListQuerySchema.parse(req.query);
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const result = await taskService.getActivityTasks(activityId, userId, userRole, queryParams);

      res.status(200).json({
        success: true,
        data: result.tasks,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  // Obtenir les statistiques des tâches
  getTaskStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const userId = authenticatedReq.user.userId;
      const stats = await taskService.getTaskStats(userId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };

  // Obtenir une tâche par ID
  getTaskById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      const task = await taskService.getTaskById(id, userId, userRole);

      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  };

  // Supprimer une tâche
  deleteTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const userId = authenticatedReq.user.userId;
      const userRole = authenticatedReq.user.role;

      await taskService.deleteTask(id, userId, userRole);

      res.status(200).json({
        success: true,
        message: 'Tâche supprimée avec succès',
      });
    } catch (error) {
      next(error);
    }
  };
}