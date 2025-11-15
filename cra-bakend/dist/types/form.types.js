"use strict";
// src/types/form.types.ts - Version corrigée sans doublons
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhotoProcessingStatus = exports.SyncStatus = exports.CollectorType = exports.FormAction = void 0;
// =============================================
// ÉNUMÉRATIONS
// =============================================
var FormAction;
(function (FormAction) {
    FormAction["CREATE"] = "CREATE";
    FormAction["UPDATE"] = "UPDATE";
    FormAction["DELETE"] = "DELETE";
    FormAction["SHARE"] = "SHARE";
    FormAction["UNSHARE"] = "UNSHARE";
    FormAction["CREATE_PUBLIC_LINK"] = "CREATE_PUBLIC_LINK";
    FormAction["SUBMIT_RESPONSE"] = "SUBMIT_RESPONSE";
    FormAction["UPLOAD_PHOTO"] = "UPLOAD_PHOTO";
    FormAction["EXPORT"] = "EXPORT";
    FormAction["SYNC_OFFLINE"] = "SYNC_OFFLINE";
    FormAction["VIEW"] = "VIEW";
    FormAction["PREVIEW"] = "PREVIEW";
    FormAction["DUPLICATE"] = "DUPLICATE";
})(FormAction || (exports.FormAction = FormAction = {}));
var CollectorType;
(function (CollectorType) {
    CollectorType["USER"] = "USER";
    CollectorType["SHARED_USER"] = "SHARED_USER";
    CollectorType["PUBLIC"] = "PUBLIC";
})(CollectorType || (exports.CollectorType = CollectorType = {}));
var SyncStatus;
(function (SyncStatus) {
    SyncStatus["PENDING"] = "PENDING";
    SyncStatus["SYNCING"] = "SYNCING";
    SyncStatus["SYNCED"] = "SYNCED";
    SyncStatus["ERROR"] = "ERROR";
    SyncStatus["RETRY"] = "RETRY";
})(SyncStatus || (exports.SyncStatus = SyncStatus = {}));
var PhotoProcessingStatus;
(function (PhotoProcessingStatus) {
    PhotoProcessingStatus["PENDING"] = "PENDING";
    PhotoProcessingStatus["PROCESSING"] = "PROCESSING";
    PhotoProcessingStatus["COMPLETED"] = "COMPLETED";
    PhotoProcessingStatus["FAILED"] = "FAILED";
})(PhotoProcessingStatus || (exports.PhotoProcessingStatus = PhotoProcessingStatus = {}));
//# sourceMappingURL=form.types.js.map