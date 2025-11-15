"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDocument = exports.isImage = exports.getFileExtension = exports.isAllowedMimeType = exports.formatFileSize = exports.getFileInfo = exports.fileExists = exports.getFileTypeFromMime = exports.sanitizeFilename = exports.deleteFile = exports.getFileSize = exports.generateFileHash = void 0;
const tslib_1 = require("tslib");
// src/utils/fileHelpers.ts - Version mise à jour
const crypto_1 = tslib_1.__importDefault(require("crypto"));
const fs_1 = tslib_1.__importDefault(require("fs"));
const generateFileHash = (filepath) => {
    return new Promise((resolve, reject) => {
        const hash = crypto_1.default.createHash('md5');
        const stream = fs_1.default.createReadStream(filepath);
        stream.on('data', (data) => hash.update(data));
        stream.on('end', () => resolve(hash.digest('hex')));
        stream.on('error', reject);
    });
};
exports.generateFileHash = generateFileHash;
const getFileSize = (filepath) => {
    const stats = fs_1.default.statSync(filepath);
    return stats.size;
};
exports.getFileSize = getFileSize;
const deleteFile = (filepath) => {
    return new Promise((resolve, reject) => {
        fs_1.default.unlink(filepath, (err) => {
            if (err && err.code !== 'ENOENT') {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
};
exports.deleteFile = deleteFile;
const sanitizeFilename = (filename) => {
    return filename.replace(/[^a-zA-Z0-9\-_\.]/g, '_');
};
exports.sanitizeFilename = sanitizeFilename;
// Mapper les types MIME vers les types de documents du schéma Prisma
const getFileTypeFromMime = (mimeType) => {
    const mimeToType = {
        // Rapports et documents
        'application/pdf': 'RAPPORT',
        'application/msword': 'RAPPORT',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'RAPPORT',
        // Données expérimentales
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'DONNEES_EXPERIMENTALES',
        'application/vnd.ms-excel': 'DONNEES_EXPERIMENTALES',
        'text/csv': 'DONNEES_EXPERIMENTALES',
        'application/vnd.oasis.opendocument.spreadsheet': 'DONNEES_EXPERIMENTALES',
        // Images
        'image/jpeg': 'IMAGE',
        'image/jpg': 'IMAGE',
        'image/png': 'IMAGE',
        'image/gif': 'IMAGE',
        'image/webp': 'IMAGE',
        'image/svg+xml': 'IMAGE',
        'image/bmp': 'IMAGE',
        'image/tiff': 'IMAGE',
        // Présentations
        'application/vnd.ms-powerpoint': 'PRESENTATION',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PRESENTATION',
        'application/vnd.oasis.opendocument.presentation': 'PRESENTATION',
        // Fichiers texte (formulaires, fiches techniques)
        'text/plain': 'FICHE_TECHNIQUE',
        'text/html': 'FICHE_TECHNIQUE',
        'application/json': 'FORMULAIRE',
        'application/xml': 'FORMULAIRE',
        'text/xml': 'FORMULAIRE',
        // Archives
        'application/zip': 'AUTRE',
        'application/x-rar-compressed': 'AUTRE',
        'application/x-7z-compressed': 'AUTRE',
    };
    return mimeToType[mimeType] || 'AUTRE';
};
exports.getFileTypeFromMime = getFileTypeFromMime;
// Vérifier si un fichier existe
const fileExists = (filepath) => {
    try {
        return fs_1.default.existsSync(filepath);
    }
    catch {
        return false;
    }
};
exports.fileExists = fileExists;
// Obtenir les informations d'un fichier
const getFileInfo = (filepath) => {
    try {
        const stats = fs_1.default.statSync(filepath);
        return {
            size: stats.size,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime,
        };
    }
    catch {
        return null;
    }
};
exports.getFileInfo = getFileInfo;
// Formater la taille d'un fichier en format lisible
const formatFileSize = (bytes) => {
    if (bytes === 0)
        return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};
exports.formatFileSize = formatFileSize;
// Vérifier si le type MIME est autorisé
const isAllowedMimeType = (mimeType, allowedTypes) => {
    if (!allowedTypes || allowedTypes.length === 0) {
        return true; // Aucune restriction
    }
    return allowedTypes.some(allowed => {
        if (allowed.endsWith('/*')) {
            // Wildcard type (ex: image/*)
            const baseType = allowed.split('/')[0];
            return mimeType.startsWith(baseType + '/');
        }
        return mimeType === allowed;
    });
};
exports.isAllowedMimeType = isAllowedMimeType;
// Extraire l'extension d'un fichier
const getFileExtension = (filename) => {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
};
exports.getFileExtension = getFileExtension;
// Vérifier si un fichier est une image
const isImage = (mimeType) => {
    return mimeType.startsWith('image/');
};
exports.isImage = isImage;
// Vérifier si un fichier est un document
const isDocument = (mimeType) => {
    const documentTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ];
    return documentTypes.includes(mimeType);
};
exports.isDocument = isDocument;
//# sourceMappingURL=fileHelpers.js.map