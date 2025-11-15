"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMultiple = exports.uploadSingle = exports.upload = void 0;
const tslib_1 = require("tslib");
// src/config/multer.ts
const multer_1 = tslib_1.__importDefault(require("multer"));
const path_1 = tslib_1.__importDefault(require("path"));
const fs_1 = tslib_1.__importDefault(require("fs"));
const errors_1 = require("../utils/errors");
// Créer les dossiers s'ils n'existent pas
const uploadDir = path_1.default.join(process.cwd(), 'uploads');
const documentsDir = path_1.default.join(uploadDir, 'documents');
const imagesDir = path_1.default.join(uploadDir, 'images');
const tempDir = path_1.default.join(uploadDir, 'temp');
[uploadDir, documentsDir, imagesDir, tempDir].forEach(dir => {
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
});
// Configuration du stockage
const storage = multer_1.default.diskStorage({
    destination: (_req, file, cb) => {
        // Déterminer le dossier selon le type de fichier
        const isImage = file.mimetype.startsWith('image/');
        const destination = isImage ? imagesDir : documentsDir;
        cb(null, destination);
    },
    filename: (_req, file, cb) => {
        // Générer un nom unique : timestamp_originalname
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file.originalname);
        const nameWithoutExt = path_1.default.basename(file.originalname, ext);
        const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9\-_]/g, '_');
        cb(null, `${uniqueSuffix}_${sanitizedName}${ext}`);
    }
});
// Types de fichiers autorisés
const allowedMimeTypes = [
    // Documents
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword', // .doc
    'text/csv',
    'text/plain',
    'application/json',
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
];
// Filtrage des fichiers
const fileFilter = (_req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new errors_1.ValidationError(`Type de fichier non autorisé: ${file.mimetype}`));
    }
};
// Configuration principale de multer
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB max
        files: 5, // Maximum 5 fichiers par upload
    },
});
// Middleware pour fichier unique
exports.uploadSingle = exports.upload.single('file');
// Middleware pour fichiers multiples
exports.uploadMultiple = exports.upload.array('files', 5);
//# sourceMappingURL=multer.js.map