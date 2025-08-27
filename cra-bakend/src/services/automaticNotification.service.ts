// src/services/automaticNotification.service.ts
import { PrismaClient } from '@prisma/client';
import { NotificationService } from './notification.service';
import { NotificationType, EntityType } from '../types/notification.types';
import { any } from 'zod';

const prisma = new PrismaClient();

export class AutomaticNotificationService {
  private static notificationService = new NotificationService();

  // =============================================
  // NOTIFICATIONS DE TÂCHES
  // =============================================

  // Notification d'assignation de tâche
  static async notifyTaskAssigned(taskId: string, assigneeId: string, assignerId: string) {
    try {
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          project: { select: { title: true } },
          activity: { select: { title: true } },
          creator: { select: { firstName: true, lastName: true } }
        }
      });

      if (!task) return;

      const contextTitle = task.project?.title || task.activity?.title || 'Tâche isolée';
      
      await this.notificationService.createNotification({
        title: 'Nouvelle tâche assignée',
        message: `Vous avez été assigné(e) à la tâche "${task.title}" dans ${contextTitle}`,
        type: 'task_assigned',
        receiverId: assigneeId,
        senderId: assignerId,
        entityType: 'task',
        entityId: taskId,
        priority: 'normal',
        actionUrl: `/tasks/${taskId}`
      });

      console.log(`✅ Notification envoyée: Tâche ${taskId} assignée à ${assigneeId}`);
    } catch (error) {
      console.error('❌ Erreur notification tâche assignée:', error);
    }
  }

  // Notification de tâche terminée
  static async notifyTaskCompleted(taskId: string, assigneeId: string) {
    try {
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          project: { 
            select: { 
              title: true, 
              creatorId: true,
              participants: {
                where: { role: { in: ['Chef de projet', 'Chef de projet adjoint'] } },
                include: { user: { select: { id: true } } }
              }
            } 
          },
          assignee: { select: { firstName: true, lastName: true } }
        }
      });

      if (!task || !task.assignee) return;

      const receiversToNotify = [];

      // Notifier le créateur du projet
      if (task.project?.creatorId && task.project.creatorId !== assigneeId) {
        receiversToNotify.push(task.project.creatorId);
      }

      // Notifier les chefs de projet
      for (const participant of task.project?.participants || []) {
        if (participant.user.id !== assigneeId) {
          receiversToNotify.push(participant.user.id);
        }
      }

      // Créer les notifications
      for (const receiverId of receiversToNotify) {
        await this.notificationService.createNotification({
          title: 'Tâche terminée',
          message: `${task.assignee.firstName} ${task.assignee.lastName} a terminé la tâche "${task.title}"`,
          type: 'task_completed',
          receiverId,
          senderId: assigneeId,
          entityType: 'task',
          entityId: taskId,
          priority: 'normal',
          actionUrl: `/tasks/${taskId}`
        });
      }

      console.log(`✅ Notifications envoyées: Tâche ${taskId} terminée`);
    } catch (error) {
      console.error('❌ Erreur notification tâche terminée:', error);
    }
  }

  // Notification de tâche en retard
  static async notifyOverdueTasks() {
    try {
      const now = new Date();
      const overdueTasks = await prisma.task.findMany({
        where: {
          dueDate: { lt: now },
          status: { in: ['A_FAIRE', 'EN_COURS'] },
          assigneeId: { not: null }
        },
        include: {
          assignee: { select: { id: true } }
        }
      });

      for (const task of overdueTasks) {
        if (task.assignee) {
          await this.notificationService.createNotification({
            title: 'Tâche en retard ⚠️',
            message: `La tâche "${task.title}" est en retard depuis le ${task.dueDate?.toLocaleDateString()}`,
            type: 'task_overdue',
            receiverId: task.assignee.id,
            entityType: 'task',
            entityId: task.id,
            priority: 'high',
            actionUrl: `/tasks/${task.id}`
          });
        }
      }

      console.log(`✅ ${overdueTasks.length} notifications de retard envoyées`);
    } catch (error) {
      console.error('❌ Erreur notifications tâches en retard:', error);
    }
  }

  // =============================================
  // NOTIFICATIONS DE PROJETS
  // =============================================

  // Notification de nouveau projet
  static async notifyProjectCreated(projectId: string, creatorId: string) {
    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          creator: { select: { firstName: true, lastName: true } }
        }
      });

      if (!project) return;

      // Notifier tous les chercheurs et admins
      const users = await prisma.user.findMany({
        where: {
          role: { in: ['CHERCHEUR', 'ADMINISTRATEUR'] },
          isActive: true,
          id: { not: creatorId }
        }
      });

      const notifications = users.map((user: any) => ({
        receiverId: user.id,
        title: 'Nouveau projet créé 🚀',
        message: `${project.creator.firstName} ${project.creator.lastName} a créé le projet "${project.title}"`,
        type: 'project_created' as NotificationType,
        entityType: 'project' as EntityType,
        entityId: projectId,
      }));

      await this.notificationService.createBulkNotifications({ notifications }, creatorId);
      console.log(`✅ ${notifications.length} notifications projet créé envoyées`);
    } catch (error) {
      console.error('❌ Erreur notification projet créé:', error);
    }
  }

  // Notification de participant ajouté à un projet
  static async notifyParticipantAdded(projectId: string, participantId: string, adderId: string) {
    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { title: true }
      });

      if (!project) return;

      await this.notificationService.createNotification({
        title: 'Ajouté à un projet 🎯',
        message: `Vous avez été ajouté(e) au projet "${project.title}"`,
        type: 'project_participant_added',
        receiverId: participantId,
        senderId: adderId,
        entityType: 'project',
        entityId: projectId,
        priority: 'normal',
        actionUrl: `/projects/${projectId}`
      });

      console.log(`✅ Notification envoyée: Participant ${participantId} ajouté au projet ${projectId}`);
    } catch (error) {
      console.error('❌ Erreur notification participant ajouté:', error);
    }
  }

  // =============================================
  // NOTIFICATIONS DE SÉMINAIRES
  // =============================================

  // Notification de nouveau séminaire
  static async notifySeminarCreated(seminarId: string, organizerId: string) {
    try {
      const seminar = await prisma.seminar.findUnique({
        where: { id: seminarId },
        include: {
          organizer: { select: { firstName: true, lastName: true } }
        }
      });

      if (!seminar) return;

      // Notifier tous les utilisateurs actifs (sauf l'organisateur)
      const users = await prisma.user.findMany({
        where: {
          isActive: true,
          id: { not: organizerId }
        }
      });

      const notifications = users.map((user: any) => ({
        receiverId: user.id,
        title: 'Nouveau séminaire disponible 📚',
        message: `"${seminar.title}" organisé par ${seminar.organizer.firstName} ${seminar.organizer.lastName} le ${seminar.startDate.toLocaleDateString()}`,
        type: 'seminar_created' as NotificationType,
        entityType: 'seminar' as EntityType,
        entityId: seminarId,
      }));

      await this.notificationService.createBulkNotifications({ notifications }, organizerId);
      console.log(`✅ ${notifications.length} notifications séminaire créé envoyées`);
    } catch (error) {
      console.error('❌ Erreur notification séminaire créé:', error);
    }
  }

  // Notification de rappel de séminaire
  static async notifySeminarReminder(seminarId: string) {
    try {
      const seminar = await prisma.seminar.findUnique({
        where: { id: seminarId },
        include: {
          participants: {
            include: {
              participant: { select: { id: true } }
            }
          }
        }
      });

      if (!seminar) return;

      const notifications = seminar.participants.map((participant: any) => ({
        receiverId: participant.participant.id,
        title: 'Rappel de séminaire 🔔',
        message: `Le séminaire "${seminar.title}" aura lieu demain à ${seminar.startDate.toLocaleTimeString()}`,
        type: 'seminar_reminder' as NotificationType,
        entityType: 'seminar' as EntityType,
        entityId: seminarId,
      }));

      await this.notificationService.createBulkNotifications({ notifications });
      console.log(`✅ ${notifications.length} rappels de séminaire envoyés`);
    } catch (error) {
      console.error('❌ Erreur rappels séminaire:', error);
    }
  }

  // Notification d'inscription à un séminaire
  static async notifySeminarRegistration(seminarId: string, participantId: string) {
    try {
      const seminar = await prisma.seminar.findUnique({
        where: { id: seminarId },
        include: { organizer: { select: { id: true, firstName: true, lastName: true } } }
      });

      const participant = await prisma.user.findUnique({
        where: { id: participantId },
        select: { firstName: true, lastName: true }
      });

      if (!seminar || !participant) return;

      // Notifier l'organisateur
      await this.notificationService.createNotification({
        title: 'Nouvelle inscription à votre séminaire',
        message: `${participant.firstName} ${participant.lastName} s'est inscrit à "${seminar.title}"`,
        type: 'seminar_registration',
        receiverId: seminar.organizerId,
        senderId: participantId,
        entityType: 'seminar',
        entityId: seminarId,
        priority: 'normal',
        actionUrl: `/seminars/${seminarId}`
      });

      // Notifier le participant
      await this.notificationService.createNotification({
        title: 'Inscription confirmée ✅',
        message: `Votre inscription au séminaire "${seminar.title}" a été confirmée`,
        type: 'seminar_registration',
        receiverId: participantId,
        senderId: seminar.organizerId,
        entityType: 'seminar',
        entityId: seminarId,
        priority: 'normal',
        actionUrl: `/seminars/${seminarId}`
      });

      console.log(`✅ Notifications inscription séminaire envoyées`);
    } catch (error) {
      console.error('❌ Erreur notification inscription séminaire:', error);
    }
  }

  // =============================================
  // NOTIFICATIONS DE COMMENTAIRES
  // =============================================

  // Notification de nouveau commentaire
  static async notifyCommentAdded(commentId: string, authorId: string, targetType: string, targetId: string) {
    try {
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
        include: {
          author: { select: { firstName: true, lastName: true } }
        }
      });

      if (!comment) return;

      // Déterminer qui notifier selon le type de cible
      let receiversToNotify: string[] = [];
      let targetTitle = '';

      switch (targetType) {
        case 'project':
          const project = await prisma.project.findUnique({
            where: { id: targetId },
            include: {
              participants: {
                where: { isActive: true },
                include: { user: { select: { id: true } } }
              }
            }
          });
          if (project) {
            targetTitle = project.title;
            receiversToNotify = [
              project.creatorId,
              ...project.participants.map((p: any) => p.user.id)
            ].filter(id => id !== authorId);
          }
          break;

        case 'activity':
          const activity = await prisma.activity.findUnique({
            where: { id: targetId },
            include: {
              project: {
                include: {
                  participants: {
                    where: { isActive: true },
                    include: { user: { select: { id: true } } }
                  }
                }
              }
            }
          });
          if (activity) {
            targetTitle = activity.title;
            receiversToNotify = [
              activity.project.creatorId,
              ...activity.project.participants.map((p: any) => p.user.id)
            ].filter(id => id !== authorId);
          }
          break;

        case 'task':
          const task = await prisma.task.findUnique({
            where: { id: targetId }
          });
          if (task) {
            targetTitle = task.title;
            receiversToNotify = [
              task.creatorId,
              ...(task.assigneeId ? [task.assigneeId] : [])
            ].filter(id => id !== authorId);
          }
          break;
      }

      // Créer les notifications
      if (receiversToNotify.length > 0) {
        const notifications = receiversToNotify.map(receiverId => ({
          receiverId,
          title: 'Nouveau commentaire 💬',
          message: `${comment.author.firstName} ${comment.author.lastName} a commenté "${targetTitle}"`,
          type: 'comment_added' as NotificationType,
          entityType: 'comment' as EntityType,
          entityId: commentId,
        }));

        await this.notificationService.createBulkNotifications({ notifications }, authorId);
        console.log(`✅ ${notifications.length} notifications commentaire envoyées`);
      }
    } catch (error) {
      console.error('❌ Erreur notification commentaire:', error);
    }
  }

  // =============================================
  // NOTIFICATIONS DE DOCUMENTS
  // =============================================

  // Notification de document partagé
  static async notifyDocumentShared(documentId: string, sharedWithIds: string[], sharerId: string) {
    try {
      const document = await prisma.document.findUnique({
        where: { id: documentId },
        include: {
          owner: { select: { firstName: true, lastName: true } }
        }
      });

      if (!document) return;

      const notifications = sharedWithIds.map(receiverId => ({
        receiverId,
        title: 'Document partagé avec vous 📄',
        message: `${document.owner.firstName} ${document.owner.lastName} a partagé le document "${document.title}"`,
        type: 'document_shared' as NotificationType,
        entityType: 'document' as EntityType,
        entityId: documentId,
      }));

      await this.notificationService.createBulkNotifications({ notifications }, sharerId);
      console.log(`✅ ${notifications.length} notifications document partagé envoyées`);
    } catch (error) {
      console.error('❌ Erreur notification document partagé:', error);
    }
  }

  // =============================================
  // NOTIFICATIONS DE FORMULAIRES
  // =============================================

  // Notification de réponse au formulaire
  static async notifyFormResponseSubmitted(formId: string, respondentId: string) {
    try {
      const form = await prisma.form.findUnique({
        where: { id: formId },
        include: {
          creator: { select: { id: true } },
          activity: {
            include: {
              project: {
                include: {
                  participants: {
                    where: { role: { in: ['Chef de projet', 'Chef de projet adjoint'] } },
                    include: { user: { select: { id: true } } }
                  }
                }
              }
            }
          }
        }
      });

      const respondent = await prisma.user.findUnique({
        where: { id: respondentId },
        select: { firstName: true, lastName: true }
      });

      if (!form || !respondent) return;

      const receiversToNotify = [];

      // Notifier le créateur du formulaire
      if (form.creatorId !== respondentId) {
        receiversToNotify.push(form.creatorId);
      }

      // Notifier les chefs de projet si le formulaire est lié à une activité
      for (const participant of form.activity?.project?.participants || []) {
        if (participant.user.id !== respondentId) {
          receiversToNotify.push(participant.user.id);
        }
      }

      // Créer les notifications
      for (const receiverId of receiversToNotify) {
        await this.notificationService.createNotification({
          title: 'Nouvelle réponse au formulaire 📝',
          message: `${respondent.firstName} ${respondent.lastName} a soumis une réponse au formulaire "${form.title}"`,
          type: 'form_response_submitted',
          receiverId,
          senderId: respondentId,
          entityType: 'form',
          entityId: formId,
          priority: 'normal',
          actionUrl: `/forms/${formId}/responses`
        });
      }

      console.log(`✅ ${receiversToNotify.length} notifications réponse formulaire envoyées`);
    } catch (error) {
      console.error('❌ Erreur notification réponse formulaire:', error);
    }
  }

  // =============================================
  // FONCTIONS UTILITAIRES
  // =============================================

  // Programmation des tâches récurrentes
  static scheduleRecurringNotifications() {
    // Vérifier les tâches en retard tous les jours à 9h
    const cron = require('node-cron');
    
    cron.schedule('0 9 * * *', () => {
      console.log('🔄 Vérification des tâches en retard...');
      this.notifyOverdueTasks();
    });

    // Envoyer les rappels de séminaires tous les jours à 18h
    cron.schedule('0 18 * * *', async () => {
      console.log('🔄 Envoi des rappels de séminaires...');
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const endOfTomorrow = new Date(tomorrow);
      endOfTomorrow.setHours(23, 59, 59, 999);

      const upcomingSeminars = await prisma.seminar.findMany({
        where: {
          startDate: {
            gte: tomorrow,
            lte: endOfTomorrow
          },
          status: 'PLANIFIE'
        }
      });

      for (const seminar of upcomingSeminars) {
        await this.notifySeminarReminder(seminar.id);
      }
    });

    console.log('📅 Notifications récurrentes programmées');
  }

  // Notification de maintenance système
  static async notifySystemMaintenance(message: string, scheduledTime: Date) {
    try {
      const users = await prisma.user.findMany({
        where: { isActive: true }
      });

      const notifications = users.map((user: any) => ({
        receiverId: user.id,
        title: 'Maintenance système prévue 🔧',
        message: `${message} - Prévue le ${scheduledTime.toLocaleDateString()} à ${scheduledTime.toLocaleTimeString()}`,
        type: 'system_maintenance' as NotificationType,
        entityType: 'user' as EntityType,
        entityId: user.id,
      }));

      await this.notificationService.createBulkNotifications({ notifications });
      console.log(`✅ ${notifications.length} notifications maintenance envoyées`);
    } catch (error) {
      console.error('❌ Erreur notification maintenance:', error);
    }
  }
}