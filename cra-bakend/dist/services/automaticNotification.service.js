"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomaticNotificationService = void 0;
// src/services/automaticNotification.service.ts
const client_1 = require("@prisma/client");
const notification_service_1 = require("./notification.service");
const prisma = new client_1.PrismaClient();
class AutomaticNotificationService {
    // =============================================
    // NOTIFICATIONS DE TÂCHES
    // =============================================
    // Notification d'assignation de tâche
    static async notifyTaskAssigned(taskId, assigneeId, assignerId) {
        try {
            const task = await prisma.task.findUnique({
                where: { id: taskId },
                include: {
                    project: { select: { id: true, title: true } },
                    activity: { select: { id: true, title: true } },
                    creator: { select: { firstName: true, lastName: true } }
                }
            });
            if (!task)
                return;
            const contextTitle = task.project?.title || task.activity?.title || 'Tâche isolée';
            // Déterminer l'URL d'action selon le contexte
            let actionUrl = '/projects'; // URL par défaut
            if (task.activityId) {
                actionUrl = `/activities/${task.activityId}`;
            }
            else if (task.projectId) {
                actionUrl = `/projects/${task.projectId}`;
            }
            await this.notificationService.createNotification({
                title: 'Nouvelle tâche assignée',
                message: `Vous avez été assigné(e) à la tâche "${task.title}" dans ${contextTitle}`,
                type: 'task_assigned',
                receiverId: assigneeId,
                senderId: assignerId,
                entityType: 'task',
                entityId: taskId,
                actionUrl
            });
            console.log(`✅ Notification envoyée: Tâche ${taskId} assignée à ${assigneeId}`);
        }
        catch (error) {
            console.error('❌ Erreur notification tâche assignée:', error);
        }
    }
    // Notification de tâche terminée
    static async notifyTaskCompleted(taskId, assigneeId) {
        try {
            const task = await prisma.task.findUnique({
                where: { id: taskId },
                include: {
                    project: {
                        select: {
                            id: true,
                            title: true,
                            creatorId: true,
                            participants: {
                                where: { role: { in: ['Chef de projet', 'Chef de projet adjoint'] } },
                                include: { user: { select: { id: true } } }
                            }
                        }
                    },
                    activity: { select: { id: true } },
                    assignee: { select: { firstName: true, lastName: true } }
                }
            });
            if (!task || !task.assignee)
                return;
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
            // Déterminer l'URL d'action selon le contexte
            let actionUrl = '/projects';
            if (task.activityId) {
                actionUrl = `/activities/${task.activityId}`;
            }
            else if (task.projectId) {
                actionUrl = `/projects/${task.projectId}`;
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
                    actionUrl
                });
            }
            console.log(`✅ Notifications envoyées: Tâche ${taskId} terminée`);
        }
        catch (error) {
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
                    assignee: { select: { id: true } },
                    activity: { select: { id: true } },
                    project: { select: { id: true } }
                }
            });
            for (const task of overdueTasks) {
                if (task.assignee) {
                    // Déterminer l'URL d'action selon le contexte
                    let actionUrl = '/projects';
                    if (task.activityId) {
                        actionUrl = `/activities/${task.activityId}`;
                    }
                    else if (task.projectId) {
                        actionUrl = `/projects/${task.projectId}`;
                    }
                    await this.notificationService.createNotification({
                        title: 'Tâche en retard ⚠️',
                        message: `La tâche "${task.title}" est en retard depuis le ${task.dueDate?.toLocaleDateString()}`,
                        type: 'task_overdue',
                        receiverId: task.assignee.id,
                        entityType: 'task',
                        entityId: task.id,
                        actionUrl
                    });
                }
            }
            console.log(`✅ ${overdueTasks.length} notifications de retard envoyées`);
        }
        catch (error) {
            console.error('❌ Erreur notifications tâches en retard:', error);
        }
    }
    // =============================================
    // NOTIFICATIONS DE PROJETS
    // =============================================
    // Notification de nouveau projet
    static async notifyProjectCreated(projectId, creatorId) {
        try {
            const project = await prisma.project.findUnique({
                where: { id: projectId },
                include: {
                    creator: { select: { firstName: true, lastName: true } }
                }
            });
            if (!project)
                return;
            // Notifier tous les chercheurs et admins
            const users = await prisma.user.findMany({
                where: {
                    role: { in: ['CHERCHEUR', 'ADMINISTRATEUR'] },
                    isActive: true,
                    id: { not: creatorId }
                }
            });
            const notificationPromises = users.map((user) => this.notificationService.createNotification({
                receiverId: user.id,
                senderId: creatorId,
                title: 'Nouveau projet créé 🚀',
                message: `${project.creator.firstName} ${project.creator.lastName} a créé le projet "${project.title}"`,
                type: 'project_created',
                actionUrl: `/projects/${projectId}`,
                entityType: 'project',
                entityId: projectId
            }));
            await Promise.allSettled(notificationPromises);
            console.log(`✅ ${users.length} notifications projet créé envoyées`);
        }
        catch (error) {
            console.error('❌ Erreur notification projet créé:', error);
        }
    }
    // Notification de participant ajouté à un projet
    static async notifyParticipantAdded(projectId, participantId, adderId) {
        try {
            const project = await prisma.project.findUnique({
                where: { id: projectId },
                select: { title: true }
            });
            if (!project)
                return;
            await this.notificationService.createNotification({
                title: 'Ajouté à un projet 🎯',
                message: `Vous avez été ajouté(e) au projet "${project.title}"`,
                type: 'project_participant_added',
                receiverId: participantId,
                senderId: adderId,
                entityType: 'project',
                entityId: projectId,
                actionUrl: `/projects/${projectId}`
            });
            console.log(`✅ Notification envoyée: Participant ${participantId} ajouté au projet ${projectId}`);
        }
        catch (error) {
            console.error('❌ Erreur notification participant ajouté:', error);
        }
    }
    // =============================================
    // NOTIFICATIONS D'ÉVÉNEMENTS
    // =============================================
    // Notification de nouvel événement
    static async notifyEventCreated(eventId, creatorId) {
        try {
            const event = await prisma.calendarEvent.findUnique({
                where: { id: eventId },
                include: {
                    creator: { select: { firstName: true, lastName: true } }
                }
            });
            if (!event)
                return;
            // Notifier tous les utilisateurs actifs (sauf le créateur)
            const users = await prisma.user.findMany({
                where: {
                    isActive: true,
                    id: { not: creatorId }
                }
            });
            const notificationPromises = users.map((user) => this.notificationService.createNotification({
                receiverId: user.id,
                senderId: creatorId,
                title: 'Nouvel événement créé 📅',
                message: `"${event.title}" créé par ${event.creator.firstName} ${event.creator.lastName} le ${event.startDate.toLocaleDateString()}`,
                type: 'event_created',
                actionUrl: `/calendar`,
                entityType: 'event',
                entityId: eventId
            }));
            await Promise.allSettled(notificationPromises);
            console.log(`✅ ${users.length} notifications événement créé envoyées`);
        }
        catch (error) {
            console.error('❌ Erreur notification événement créé:', error);
        }
    }
    // =============================================
    // NOTIFICATIONS DE SÉMINAIRES
    // =============================================
    // Notification de nouveau séminaire
    static async notifySeminarCreated(seminarId, organizerId) {
        try {
            const seminar = await prisma.seminar.findUnique({
                where: { id: seminarId },
                include: {
                    organizer: { select: { firstName: true, lastName: true } }
                }
            });
            if (!seminar)
                return;
            // Notifier tous les utilisateurs actifs (sauf l'organisateur)
            const users = await prisma.user.findMany({
                where: {
                    isActive: true,
                    id: { not: organizerId }
                }
            });
            const notificationPromises = users.map((user) => this.notificationService.createNotification({
                receiverId: user.id,
                senderId: organizerId,
                title: 'Nouveau séminaire disponible 📚',
                message: `"${seminar.title}" organisé par ${seminar.organizer.firstName} ${seminar.organizer.lastName} le ${seminar.startDate.toLocaleDateString()}`,
                type: 'seminar_created',
                actionUrl: `/calendar`,
                entityType: 'seminar',
                entityId: seminarId
            }));
            await Promise.allSettled(notificationPromises);
            console.log(`✅ ${users.length} notifications séminaire créé envoyées`);
        }
        catch (error) {
            console.error('❌ Erreur notification séminaire créé:', error);
        }
    }
    // Notification de rappel de séminaire
    static async notifySeminarReminder(seminarId) {
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
            if (!seminar)
                return;
            const notificationPromises = seminar.participants.map((participant) => this.notificationService.createNotification({
                receiverId: participant.participant.id,
                title: 'Rappel de séminaire 🔔',
                message: `Le séminaire "${seminar.title}" aura lieu demain à ${seminar.startDate.toLocaleTimeString()}`,
                type: 'seminar_reminder',
                actionUrl: `/calendar`,
                entityType: 'seminar',
                entityId: seminarId
            }));
            await Promise.allSettled(notificationPromises);
            console.log(`✅ ${seminar.participants.length} rappels de séminaire envoyés`);
        }
        catch (error) {
            console.error('❌ Erreur rappels séminaire:', error);
        }
    }
    // Notification d'inscription à un séminaire
    static async notifySeminarRegistration(seminarId, participantId) {
        try {
            const seminar = await prisma.seminar.findUnique({
                where: { id: seminarId },
                include: { organizer: { select: { id: true, firstName: true, lastName: true } } }
            });
            const participant = await prisma.user.findUnique({
                where: { id: participantId },
                select: { firstName: true, lastName: true }
            });
            if (!seminar || !participant)
                return;
            // Notifier l'organisateur
            await this.notificationService.createNotification({
                title: 'Nouvelle inscription à votre séminaire',
                message: `${participant.firstName} ${participant.lastName} s'est inscrit à "${seminar.title}"`,
                type: 'seminar_registration',
                receiverId: seminar.organizerId,
                senderId: participantId,
                entityType: 'seminar',
                entityId: seminarId,
                actionUrl: `/calendar`
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
                actionUrl: `/calendar`
            });
            console.log(`✅ Notifications inscription séminaire envoyées`);
        }
        catch (error) {
            console.error('❌ Erreur notification inscription séminaire:', error);
        }
    }
    // =============================================
    // NOTIFICATIONS DE COMMENTAIRES
    // =============================================
    // Notification de nouveau commentaire
    static async notifyCommentAdded(commentId, authorId, targetType, targetId) {
        try {
            const comment = await prisma.comment.findUnique({
                where: { id: commentId },
                include: {
                    author: { select: { firstName: true, lastName: true } }
                }
            });
            if (!comment)
                return;
            // Déterminer qui notifier selon le type de cible
            let receiversToNotify = [];
            let targetTitle = '';
            let actionUrl = '';
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
                        actionUrl = `/projects/${targetId}`;
                        receiversToNotify = [
                            project.creatorId,
                            ...project.participants.map((p) => p.user.id)
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
                        actionUrl = `/activities/${targetId}`;
                        receiversToNotify = [
                            activity.project.creatorId,
                            ...activity.project.participants.map((p) => p.user.id)
                        ].filter(id => id !== authorId);
                    }
                    break;
                case 'task':
                    const task = await prisma.task.findUnique({
                        where: { id: targetId },
                        include: {
                            activity: { select: { id: true } },
                            project: { select: { id: true } }
                        }
                    });
                    if (task) {
                        targetTitle = task.title;
                        // Pointer vers l'activité ou le projet parent
                        if (task.activityId) {
                            actionUrl = `/activities/${task.activityId}`;
                        }
                        else if (task.projectId) {
                            actionUrl = `/projects/${task.projectId}`;
                        }
                        receiversToNotify = [
                            task.creatorId,
                            ...(task.assigneeId ? [task.assigneeId] : [])
                        ].filter(id => id !== authorId);
                    }
                    break;
            }
            // Créer les notifications
            if (receiversToNotify.length > 0 && actionUrl) {
                const notificationPromises = receiversToNotify.map(receiverId => this.notificationService.createNotification({
                    receiverId,
                    senderId: authorId,
                    title: 'Nouveau commentaire 💬',
                    message: `${comment.author.firstName} ${comment.author.lastName} a commenté "${targetTitle}"`,
                    type: 'comment_added',
                    actionUrl,
                    entityType: 'comment',
                    entityId: commentId
                }));
                await Promise.allSettled(notificationPromises);
                console.log(`✅ ${receiversToNotify.length} notifications commentaire envoyées`);
            }
        }
        catch (error) {
            console.error('❌ Erreur notification commentaire:', error);
        }
    }
    // =============================================
    // NOTIFICATIONS DE DOCUMENTS
    // =============================================
    // Notification de document partagé
    static async notifyDocumentShared(documentId, sharedWithIds, sharerId) {
        try {
            const document = await prisma.document.findUnique({
                where: { id: documentId },
                include: {
                    owner: { select: { firstName: true, lastName: true } }
                }
            });
            if (!document)
                return;
            const notificationPromises = sharedWithIds.map(receiverId => this.notificationService.createNotification({
                receiverId,
                senderId: sharerId,
                title: 'Document partagé avec vous 📄',
                message: `${document.owner.firstName} ${document.owner.lastName} a partagé le document "${document.title}"`,
                type: 'document_shared',
                actionUrl: `/documents`,
                entityType: 'document',
                entityId: documentId
            }));
            await Promise.allSettled(notificationPromises);
            console.log(`✅ ${sharedWithIds.length} notifications document partagé envoyées`);
        }
        catch (error) {
            console.error('❌ Erreur notification document partagé:', error);
        }
    }
    // =============================================
    // NOTIFICATIONS DE FORMULAIRES
    // =============================================
    // Notification de réponse au formulaire
    static async notifyFormResponseSubmitted(formId, respondentId) {
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
            if (!form || !respondent)
                return;
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
                    actionUrl: `/forms/${formId}`
                });
            }
            console.log(`✅ ${receiversToNotify.length} notifications réponse formulaire envoyées`);
        }
        catch (error) {
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
    static async notifySystemMaintenance(message, scheduledTime) {
        try {
            const users = await prisma.user.findMany({
                where: { isActive: true }
            });
            const notificationPromises = users.map((user) => this.notificationService.createNotification({
                receiverId: user.id,
                title: 'Maintenance système prévue 🔧',
                message: `${message} - Prévue le ${scheduledTime.toLocaleDateString()} à ${scheduledTime.toLocaleTimeString()}`,
                type: 'system_maintenance',
                entityType: 'user',
                entityId: user.id
            }));
            await Promise.allSettled(notificationPromises);
            console.log(`✅ ${users.length} notifications maintenance envoyées`);
        }
        catch (error) {
            console.error('❌ Erreur notification maintenance:', error);
        }
    }
}
exports.AutomaticNotificationService = AutomaticNotificationService;
AutomaticNotificationService.notificationService = new notification_service_1.NotificationService();
//# sourceMappingURL=automaticNotification.service.js.map