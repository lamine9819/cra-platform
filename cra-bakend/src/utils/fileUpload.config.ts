// utils/fileUpload.config.ts
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Créer les dossiers nécessaires
const uploadDir = './uploads/publications';
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
    cb(null, `publication-${uniqueSuffix}${ext}`);
  }
});

// Filtre pour n'accepter que les PDF
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['application/pdf'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers PDF sont autorisés'));
  }
};

// Configuration multer
export const uploadPublication = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB max
  }
});