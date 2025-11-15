"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPublication = void 0;
const tslib_1 = require("tslib");
// utils/fileUpload.config.ts
const multer_1 = tslib_1.__importDefault(require("multer"));
const path_1 = tslib_1.__importDefault(require("path"));
const fs_1 = tslib_1.__importDefault(require("fs"));
// Créer les dossiers nécessaires
const uploadDir = './uploads/publications';
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
        cb(null, `publication-${uniqueSuffix}${ext}`);
    }
});
// Filtre pour n'accepter que les PDF
const fileFilter = (req, file, cb) => {
    const allowedMimes = ['application/pdf'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Seuls les fichiers PDF sont autorisés'));
    }
};
// Configuration multer
exports.uploadPublication = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10 MB max
    }
});
//# sourceMappingURL=fileUpload.config.js.map