// src/middlewares/auditMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth.types';
import { createAuditLog, detectChanges } from '../services/audit.service';
import { AuditAction, AuditLevel, EntityType } from '../types/audit.types';

// Middleware pour auditer automatiquement les actions
export const auditAction = (
  action: AuditAction,
  options: {
    level?: AuditLevel;
    entityType?: EntityType;
    extractEntityId?: (req: Request, res: Response) => string | undefined;
    extractDetails?: (req: Request, res: Response) => Record<string, any>;
    trackChanges?: boolean;
  } = {}
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      
      // Stocker les données originales pour le tracking des changements
      let originalData: any = null;
      if (options.trackChanges && options.entityType && req.params.id) {
        originalData = await getOriginalEntityData(options.entityType, req.params.id);
      }

      // Capturer la réponse originale
      const originalSend = res.json;
      
      res.json = function(data: any) {
        // Si l'action a réussi, créer le log d'audit en arrière-plan
        if (data.success) {
          setImmediate(async () => {
            try {
              const entityId = options.extractEntityId 
                ? options.extractEntityId(req, res)
                : req.params.id || data.data?.id;

              const details = options.extractDetails 
                ? options.extractDetails(req, res)
                : {
                    method: req.method,
                    url: req.url,
                    body: sanitizeRequestBody(req.body),
                    params: req.params,
                    query: req.query,
                  };

              let changes = undefined;
              if (options.trackChanges && originalData && data.data) {
                changes = detectChanges(originalData, data.data);
              }

              await createAuditLog(
                action,
                {
                  level: options.level || 'INFO',
                  userId: authenticatedReq.user?.userId,
                  entityType: options.entityType,
                  entityId,
                  details,
                  changes: changes && changes.fields.length > 0 ? changes : undefined
                },
                req
              );
            } catch (error) {
              console.error(`❌ Erreur audit automatique ${action}:`, error);
            }
          });
        }
        
        return originalSend.call(this, data);
      };
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Middleware pour auditer les tentatives de connexion
export const auditAuthAttempt = (_action: 'AUTH_LOGIN' | 'AUTH_LOGIN_FAILED') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.json;
    
    res.json = function(data: any) {
      setImmediate(async () => {
        try {
          const isSuccess = data.success;
          const auditAction = isSuccess ? 'AUTH_LOGIN' : 'AUTH_LOGIN_FAILED';
          const level = isSuccess ? 'INFO' : 'WARNING';

          await createAuditLog(
            auditAction,
            {
              level: level as AuditLevel,
              userId: isSuccess ? data.data?.user?.id : undefined,
              details: {
                email: req.body.email,
                success: isSuccess,
                timestamp: new Date().toISOString(),
                ...(data.message && { message: data.message })
              }
            },
            req
          );
        } catch (error) {
          console.error(`❌ Erreur audit authentification:`, error);
        }
      });
      
      return originalSend.call(this, data);
    };
    
    next();
  };
};

// Middleware pour auditer les actions d'administration
export const auditAdminAction = (action: AuditAction, entityType?: EntityType) => {
  return auditAction(action, {
    level: 'WARNING', // Les actions admin sont importantes
    entityType,
    extractDetails: (req: Request, res: Response) => ({
      adminAction: true,
      method: req.method,
      url: req.url,
      targetUser: req.params.userId || req.body.userId,
      changes: req.body,
      timestamp: new Date().toISOString()
    })
  });
};

// Middleware pour auditer les accès aux documents sensibles
export const auditDocumentAccess = (action: AuditAction) => {
  return auditAction(action, {
    level: 'INFO',
    entityType: 'document',
    extractEntityId: (req: Request) => req.params.id,
    extractDetails: (req: Request, res: Response) => ({
      documentAction: true,
      method: req.method,
      url: req.url,
      timestamp: new Date().toISOString(),
      ...(req.body.sharedWithIds && { sharedWith: req.body.sharedWithIds })
    })
  });
};

// Middleware pour auditer les modifications de données critiques
export const auditCriticalDataChange = (entityType: EntityType) => {
  return auditAction(`${entityType.toUpperCase()}_UPDATED` as AuditAction, {
    level: 'WARNING',
    entityType,
    trackChanges: true,
    extractDetails: (req: Request) => ({
      criticalChange: true,
      method: req.method,
      url: req.url,
      modifiedFields: Object.keys(req.body),
      timestamp: new Date().toISOString()
    })
  });
};

// Middleware pour auditer les erreurs système
export const auditSystemError = async (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;

    // Ne pas créer d'audit log pour les erreurs d'authentification
    // car l'utilisateur n'est pas (ou n'est plus) valide
    if (error.name === 'AuthError' || (error as any).code === 'AUTH_ERROR') {
      next(error);
      return;
    }

    // Vérifier si l'utilisateur existe avant de créer l'audit log
    let userId = authenticatedReq.user?.userId;
    if (userId) {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      try {
        const userExists = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true }
        });
        if (!userExists) {
          userId = undefined; // L'utilisateur n'existe plus, ne pas l'associer au log
        }
      } catch {
        userId = undefined;
      } finally {
        await prisma.$disconnect();
      }
    }

    await createAuditLog(
      'SYSTEM_ERROR_OCCURRED',
      {
        level: 'ERROR',
        userId,
        details: {
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack?.split('\n').slice(0, 5), // Limiter la stack trace
          },
          request: {
            method: req.method,
            url: req.url,
            userAgent: req.get('User-Agent'),
            timestamp: new Date().toISOString()
          }
        }
      },
      req
    );
  } catch (auditError) {
    console.error('❌ Erreur lors de l\'audit d\'erreur système:', auditError);
  }

  next(error);
};

// =============================================
// FONCTIONS UTILITAIRES
// =============================================

// Récupérer les données originales d'une entité
async function getOriginalEntityData(entityType: EntityType, entityId: string): Promise<any> {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  try {
    switch (entityType) {
      case 'user':
        return await prisma.user.findUnique({ where: { id: entityId } });
      case 'project':
        return await prisma.project.findUnique({ where: { id: entityId } });
      case 'activity':
        return await prisma.activity.findUnique({ where: { id: entityId } });
      case 'task':
        return await prisma.task.findUnique({ where: { id: entityId } });
      case 'document':
        return await prisma.document.findUnique({ where: { id: entityId } });
      case 'seminar':
        return await prisma.seminar.findUnique({ where: { id: entityId } });
      default:
        return null;
    }
  } catch (error) {
    console.warn(`Impossible de récupérer les données originales pour ${entityType}:${entityId}`);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

// Nettoyer le body de la requête pour l'audit (enlever les mots de passe, etc.)
function sanitizeRequestBody(body: any): any {
  if (!body || typeof body !== 'object') return body;

  const sanitized = { ...body };
  
  // Champs sensibles à masquer
  const sensitiveFields = ['password', 'newPassword', 'currentPassword', 'token', 'secret'];
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }
  
  return sanitized;
}

// Middlewares pré-configurés pour actions communes
export const auditMiddlewares = {
  // Authentification
  login: auditAuthAttempt('AUTH_LOGIN'),
  logout: auditAction('AUTH_LOGOUT', { level: 'INFO' }),
  
  // Utilisateurs
  userCreated: auditAction('USER_CREATED', { 
    level: 'INFO', 
    entityType: 'user',
    extractEntityId: (req, res) => res.locals?.data?.id || req.body.id
  }),
  userUpdated: auditCriticalDataChange('user'),
  userDeleted: auditAdminAction('USER_DELETED', 'user'),
  
  // Projets
  projectCreated: auditAction('PROJECT_CREATED', { 
    level: 'INFO', 
    entityType: 'project' 
  }),
  projectUpdated: auditAction('PROJECT_UPDATED', { 
    level: 'INFO', 
    entityType: 'project',
    trackChanges: true 
  }),
  projectDeleted: auditAction('PROJECT_DELETED', { 
    level: 'WARNING', 
    entityType: 'project' 
  }),
  
  // Documents
  documentUploaded: auditDocumentAccess('DOCUMENT_UPLOADED'),
  documentDownloaded: auditDocumentAccess('DOCUMENT_DOWNLOADED'),
  documentShared: auditDocumentAccess('DOCUMENT_SHARED'),
  documentDeleted: auditAction('DOCUMENT_DELETED', { 
    level: 'WARNING', 
    entityType: 'document' 
  }),
  
  // Tâches
  taskCreated: auditAction('TASK_CREATED', { 
    level: 'INFO', 
    entityType: 'task' 
  }),
  taskAssigned: auditAction('TASK_ASSIGNED', { 
    level: 'INFO', 
    entityType: 'task',
    extractDetails: (req) => ({
      assigneeId: req.body.assigneeId,
      previousAssigneeId: req.body.previousAssigneeId
    })
  }),
  taskCompleted: auditAction('TASK_COMPLETED', { 
    level: 'INFO', 
    entityType: 'task' 
  }),
  
  // Séminaires
  seminarCreated: auditAction('SEMINAR_CREATED', { 
    level: 'INFO', 
    entityType: 'seminar' 
  }),
  seminarRegistered: auditAction('SEMINAR_REGISTERED', { 
    level: 'INFO', 
    entityType: 'seminar' 
  }),
};