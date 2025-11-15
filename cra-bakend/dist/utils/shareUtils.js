"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateShareToken = generateShareToken;
exports.isValidShareToken = isValidShareToken;
exports.generateDeviceId = generateDeviceId;
const tslib_1 = require("tslib");
// src/utils/shareUtils.ts - Utilitaires pour la gestion du partage
const crypto_1 = tslib_1.__importDefault(require("crypto"));
/**
 * Générer un token de partage sécurisé
 */
function generateShareToken() {
    return crypto_1.default.randomBytes(16).toString('hex');
}
/**
 * Valider un token de partage
 */
function isValidShareToken(token) {
    return /^[a-f0-9]{32}$/.test(token);
}
/**
 * Générer un ID d'appareil unique
 */
function generateDeviceId() {
    const timestamp = Date.now().toString(36);
    const random = crypto_1.default.randomBytes(8).toString('hex');
    return `${timestamp}-${random}`;
}
//# sourceMappingURL=shareUtils.js.map