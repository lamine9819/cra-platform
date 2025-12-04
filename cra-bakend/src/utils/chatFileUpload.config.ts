// utils/chatFileUpload.config.ts
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Créer le dossier pour les fichiers du chat
const uploadDir = './uploads/chat';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9\-_]/g, '_');
    cb(null, `${uniqueSuffix}_${sanitizedName}${ext}`);
  }
});

// Filtre pour accepter images et PDFs
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
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
  } else {
    cb(new Error('Seuls les fichiers images (JPEG, PNG, GIF, WebP) et PDF sont autorisés'));
  }
};

// Configuration multer pour les fichiers du chat
export const uploadChatFile = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB max
  }
});
