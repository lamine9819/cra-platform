"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyFormResponseSubmitted = exports.notifyDocumentShared = exports.notifyCommentAdded = exports.notifySeminarRegistration = exports.notifySeminarCreated = exports.notifyParticipantAdded = exports.notifyProjectCreated = exports.notifyTaskCompleted = exports.notifyTaskAssigned = exports.triggerNotifications = void 0;
const automaticNotification_service_1 = require("../services/automaticNotification.service");
// Middleware pour déclencher automatiquement les notifications
const triggerNotifications = (actionType) => {
    return async (req, res, next) => {
        try {
            const authenticatedReq = req;
            // Capturer la réponse originale
            const originalSend = res.json;
            res.json = function (data) {
                // Si l'action a réussi, déclencher les notifications en arrière-plan
                if (data.success) {
                    setImmediate(async () => {
                        try {
                            const userId = authenticatedReq.user.userId;
                            switch (actionType) {
                                case 'task_assigned':
                                    if (data.data?.assigneeId && data.data?.id) {
                                        await automaticNotification_service_1.AutomaticNotificationService.notifyTaskAssigned(data.data.id, data.data.assigneeId, userId);
                                    }
                                    break;
                                case 'task_completed':
                                    if (data.data?.id && req.body?.status === 'TERMINE') {
                                        await automaticNotification_service_1.AutomaticNotificationService.notifyTaskCompleted(data.data.id, userId);
                                    }
                                    break;
                                case 'project_created':
                                    if (data.data?.id) {
                                        await automaticNotification_service_1.AutomaticNotificationService.notifyProjectCreated(data.data.id, userId);
                                    }
                                    break;
                                case 'participant_added':
                                    if (data.data?.projectId && data.data?.userId) {
                                        await automaticNotification_service_1.AutomaticNotificationService.notifyParticipantAdded(data.data.projectId, data.data.userId, userId);
                                    }
                                    break;
                                case 'seminar_created':
                                    if (data.data?.id) {
                                        await automaticNotification_service_1.AutomaticNotificationService.notifySeminarCreated(data.data.id, userId);
                                    }
                                    break;
                                case 'seminar_registration':
                                    if (req.params?.id) {
                                        await automaticNotification_service_1.AutomaticNotificationService.notifySeminarRegistration(req.params.id, userId);
                                    }
                                    break;
                                case 'comment_added':
                                    if (data.data?.id && req.body?.targetType && req.body?.targetId) {
                                        await automaticNotification_service_1.AutomaticNotificationService.notifyCommentAdded(data.data.id, userId, req.body.targetType, req.body.targetId);
                                    }
                                    break;
                                case 'document_shared':
                                    if (data.data?.shares && req.params?.id) {
                                        const sharedWithIds = data.data.shares.map((share) => share.sharedWith.id);
                                        await automaticNotification_service_1.AutomaticNotificationService.notifyDocumentShared(req.params.id, sharedWithIds, userId);
                                    }
                                    break;
                                case 'form_response_submitted':
                                    if (req.params?.id) {
                                        await automaticNotification_service_1.AutomaticNotificationService.notifyFormResponseSubmitted(req.params.id, userId);
                                    }
                                    break;
                                default:
                                    console.log(`ℹ️ Type de notification non géré: ${actionType}`);
                            }
                        }
                        catch (error) {
                            console.error(`❌ Erreur notification automatique ${actionType}:`, error);
                        }
                    });
                }
                return originalSend.call(this, data);
            };
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.triggerNotifications = triggerNotifications;
// Middleware spécialisés pour chaque action
exports.notifyTaskAssigned = (0, exports.triggerNotifications)('task_assigned');
exports.notifyTaskCompleted = (0, exports.triggerNotifications)('task_completed');
exports.notifyProjectCreated = (0, exports.triggerNotifications)('project_created');
exports.notifyParticipantAdded = (0, exports.triggerNotifications)('participant_added');
exports.notifySeminarCreated = (0, exports.triggerNotifications)('seminar_created');
exports.notifySeminarRegistration = (0, exports.triggerNotifications)('seminar_registration');
exports.notifyCommentAdded = (0, exports.triggerNotifications)('comment_added');
exports.notifyDocumentShared = (0, exports.triggerNotifications)('document_shared');
exports.notifyFormResponseSubmitted = (0, exports.triggerNotifications)('form_response_submitted');
//# sourceMappingURL=notificationIntegration.middleware.js.map