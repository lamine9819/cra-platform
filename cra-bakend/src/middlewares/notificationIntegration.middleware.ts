// src/middlewares/notificationIntegration.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth.types';
import { AutomaticNotificationService } from '../services/automaticNotification.service';

// Middleware pour déclencher automatiquement les notifications
export const triggerNotifications = (actionType: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      
      // Capturer la réponse originale
      const originalSend = res.json;
      
      res.json = function(data: any) {
        // Si l'action a réussi, déclencher les notifications en arrière-plan
        if (data.success) {
          setImmediate(async () => {
            try {
              const userId = authenticatedReq.user.userId;
              
              switch (actionType) {
                case 'task_assigned':
                  if (data.data?.assigneeId && data.data?.id) {
                    await AutomaticNotificationService.notifyTaskAssigned(
                      data.data.id,
                      data.data.assigneeId,
                      userId
                    );
                  }
                  break;

                case 'task_completed':
                  if (data.data?.id && req.body?.status === 'TERMINE') {
                    await AutomaticNotificationService.notifyTaskCompleted(
                      data.data.id,
                      userId
                    );
                  }
                  break;

                case 'project_created':
                  if (data.data?.id) {
                    await AutomaticNotificationService.notifyProjectCreated(
                      data.data.id,
                      userId
                    );
                  }
                  break;

                case 'participant_added':
                  if (data.data?.projectId && data.data?.userId) {
                    await AutomaticNotificationService.notifyParticipantAdded(
                      data.data.projectId,
                      data.data.userId,
                      userId
                    );
                  }
                  break;

                case 'seminar_created':
                  if (data.data?.id) {
                    await AutomaticNotificationService.notifySeminarCreated(
                      data.data.id,
                      userId
                    );
                  }
                  break;

                case 'seminar_registration':
                  if (req.params?.id) {
                    await AutomaticNotificationService.notifySeminarRegistration(
                      req.params.id,
                      userId
                    );
                  }
                  break;

                case 'comment_added':
                  if (data.data?.id && req.body?.targetType && req.body?.targetId) {
                    await AutomaticNotificationService.notifyCommentAdded(
                      data.data.id,
                      userId,
                      req.body.targetType,
                      req.body.targetId
                    );
                  }
                  break;

                case 'document_shared':
                  if (data.data?.shares && req.params?.id) {
                    const sharedWithIds = data.data.shares.map((share: any) => share.sharedWith.id);
                    await AutomaticNotificationService.notifyDocumentShared(
                      req.params.id,
                      sharedWithIds,
                      userId
                    );
                  }
                  break;

                case 'form_response_submitted':
                  if (req.params?.id) {
                    await AutomaticNotificationService.notifyFormResponseSubmitted(
                      req.params.id,
                      userId
                    );
                  }
                  break;

                default:
                  console.log(`ℹ️ Type de notification non géré: ${actionType}`);
              }
            } catch (error) {
              console.error(`❌ Erreur notification automatique ${actionType}:`, error);
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

// Middleware spécialisés pour chaque action
export const notifyTaskAssigned = triggerNotifications('task_assigned');
export const notifyTaskCompleted = triggerNotifications('task_completed');
export const notifyProjectCreated = triggerNotifications('project_created');
export const notifyParticipantAdded = triggerNotifications('participant_added');
export const notifySeminarCreated = triggerNotifications('seminar_created');
export const notifySeminarRegistration = triggerNotifications('seminar_registration');
export const notifyCommentAdded = triggerNotifications('comment_added');
export const notifyDocumentShared = triggerNotifications('document_shared');
export const notifyFormResponseSubmitted = triggerNotifications('form_response_submitted');