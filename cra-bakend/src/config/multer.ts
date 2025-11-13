// src/config/multer.ts
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ValidationError } from '../utils/errors';

// Créer les dossiers s'ils n'existent pas
const uploadDir = path.join(process.cwd(), 'uploads');
const documentsDir = path.join(uploadDir, 'documents');
const imagesDir = path.join(uploadDir, 'images');
const tempDir = path.join(uploadDir, 'temp');

[uploadDir, documentsDir, imagesDir, tempDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    // Déterminer le dossier selon le type de fichier
    const isImage = file.mimetype.startsWith('image/');
    const destination = isImage ? imagesDir : documentsDir;
    cb(null, destination);
  },
  filename: (_req, file, cb) => {
    // Générer un nom unique : timestamp_originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
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
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ValidationError(`Type de fichier non autorisé: ${file.mimetype}`));
  }
};

// Configuration principale de multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
    files: 5, // Maximum 5 fichiers par upload
  },
});

// Middleware pour fichier unique
export const uploadSingle = upload.single('file');

// Middleware pour fichiers multiples
export const uploadMultiple = upload.array('files', 5);