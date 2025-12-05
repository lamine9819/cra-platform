"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadProfileImage = void 0;
const tslib_1 = require("tslib");
// utils/profileImageUpload.config.ts
const multer_1 = tslib_1.__importDefault(require("multer"));
const path_1 = tslib_1.__importDefault(require("path"));
const fs_1 = tslib_1.__importDefault(require("fs"));
// Créer le dossier pour les photos de profil
const uploadDir = './uploads/profiles';
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
        cb(null, `profile-${uniqueSuffix}${ext}`);
    }
});
// Filtre pour n'accepter que les images
const fileFilter = (req, file, cb) => {
    const allowedMimes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp'
    ];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Seuls les fichiers images (JPEG, PNG, GIF, WebP) sont autorisés'));
    }
};
// Configuration multer pour les photos de profil
exports.uploadProfileImage = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB max
    }
});
//# sourceMappingURL=profileImageUpload.config.js.map