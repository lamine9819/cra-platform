"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadChatFile = void 0;
const tslib_1 = require("tslib");
// utils/chatFileUpload.config.ts
const multer_1 = tslib_1.__importDefault(require("multer"));
const path_1 = tslib_1.__importDefault(require("path"));
const fs_1 = tslib_1.__importDefault(require("fs"));
// Créer le dossier pour les fichiers du chat
const uploadDir = './uploads/chat';
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
// Configuration du stockage
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const ext = path_1.default.extname(file.originalname);
        const nameWithoutExt = path_1.default.basename(file.originalname, ext);
        const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9\-_]/g, '_');
        cb(null, `${uniqueSuffix}_${sanitizedName}${ext}`);
    }
});
// Filtre pour accepter images et PDFs
const fileFilter = (req, file, cb) => {
    const allowedMimes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf'
    ];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Seuls les fichiers images (JPEG, PNG, GIF, WebP) et PDF sont autorisés'));
    }
};
// Configuration multer pour les fichiers du chat
exports.uploadChatFile = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10 MB max
    }
});
//# sourceMappingURL=chatFileUpload.config.js.map