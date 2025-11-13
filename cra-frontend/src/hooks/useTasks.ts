// src/hooks/useTasks.ts
import { useState, useEffect, useCallback } from 'react';
import tasksApi, { Task, TaskFilters, TaskStats } from '../services/tasksApi';

// Hook pour la liste des tâches avec gestion d'erreurs et loading
export const useTasks = (initialFilters: TaskFilters = {}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  const [filters, setFilters] = useState<TaskFilters>({
    page: 1,
    limit: 12,
    sortBy: 'dueDate',
    sortOrder: 'asc',
    ...initialFilters
  });

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tasksApi.getAssignedTasks(filters);
      setTasks(response.tasks);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des tâches');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const updateFilter = useCallback((key: keyof TaskFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  }, []);

  const updateTask = useCallback((updatedTask: Task) => {
    setTasks(prev => prev.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
  }, []);

  const removeTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  }, []);

  const refetch = useCallback(() => {
    loadTasks();
  }, [loadTasks]);

  return {
    tasks,
    loading,
    error,
    pagination,
    filters,
    updateFilter,
    updateTask,
    removeTask,
    refetch
  };
};

// Hook pour une tâche individuelle
export const useTask = (taskId: string) => {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTask = useCallback(async () => {
    if (!taskId) return;
    
    try {
      setLoading(true);
      setError(null);
      const taskData = await tasksApi.getTaskById(taskId);
      setTask(taskData);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement de la tâche');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    loadTask();
  }, [loadTask]);

  const updateTask = useCallback(async (updates: Partial<Task>) => {
    if (!task) return null;
    
    try {
      const updatedTask = await tasksApi.updateTask(task.id, updates);
      setTask(updatedTask);
      return updatedTask;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour');
      throw err;
    }
  }, [task]);

  const deleteTask = useCallback(async () => {
    if (!task) return;
    
    try {
      await tasksApi.deleteTask(task.id);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression');
      throw err;
    }
  }, [task]);

  const refetch = useCallback(() => {
    loadTask();
  }, [loadTask]);

  return {
    task,
    loading,
    error,
    updateTask,
    deleteTask,
    refetch
  };
};

// Hook pour les statistiques des tâches
export const useTaskStats = () => {
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const statsData = await tasksApi.getTaskStats();
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const refetch = useCallback(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    error,
    refetch
  };
};

// Hook pour les actions rapides sur les tâches
export const useTaskActions = () => {
  const [updating, setUpdating] = useState(false);

  const updateTaskStatus = useCallback(async (taskId: string, status: Task['status']) => {
    setUpdating(true);
    try {
      const updatedTask = await tasksApi.updateTask(taskId, { status });
      return updatedTask;
    } finally {
      setUpdating(false);
    }
  }, []);

  const updateTaskProgress = useCallback(async (taskId: string, progress: number) => {
    setUpdating(true);
    try {
      const updatedTask = await tasksApi.updateTask(taskId, { progress });
      return updatedTask;
    } finally {
      setUpdating(false);
    }
  }, []);

  const markAsCompleted = useCallback(async (taskId: string) => {
    return updateTaskStatus(taskId, 'TERMINEE');
  }, [updateTaskStatus]);

  const markAsInProgress = useCallback(async (taskId: string) => {
    return updateTaskStatus(taskId, 'EN_COURS');
  }, [updateTaskStatus]);

  const deleteTask = useCallback(async (taskId: string) => {
    await tasksApi.deleteTask(taskId);
  }, []);

  return {
    updating,
    updateTaskStatus,
    updateTaskProgress,
    markAsCompleted,
    markAsInProgress,
    deleteTask
  };
};