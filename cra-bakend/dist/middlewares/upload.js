"use strict";
// =============================================
// src/middlewares/upload.ts - Middleware pour upload de photos
// =============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPhoto = void 0;
const tslib_1 = require("tslib");
const multer_1 = tslib_1.__importDefault(require("multer"));
const path_1 = tslib_1.__importDefault(require("path"));
const fs_1 = tslib_1.__importDefault(require("fs"));
// Configuration du stockage
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadsDir = path_1.default.join(process.cwd(), 'uploads', 'photos');
        // Créer le dossier s'il n'existe pas
        if (!fs_1.default.existsSync(uploadsDir)) {
            fs_1.default.mkdirSync(uploadsDir, { recursive: true });
        }
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Générer un nom unique
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `photo-${uniqueSuffix}${ext}`);
    }
});
// Filtrer les types de fichiers
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Type de fichier non supporté. Utilisez JPEG, PNG ou WebP.'), false);
    }
};
exports.uploadPhoto = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
        files: 10 // Max 10 fichiers
    }
});
//# sourceMappingURL=upload.js.map