// src/utils/fileHelpers.ts
import crypto from 'crypto';
import fs from 'fs';

export const generateFileHash = (filepath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('md5');
    const stream = fs.createReadStream(filepath);
    
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
};

export const getFileSize = (filepath: string): number => {
  const stats = fs.statSync(filepath);
  return stats.size;
};

export const deleteFile = (filepath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.unlink(filepath, (err) => {
      if (err && err.code !== 'ENOENT') {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

export const sanitizeFilename = (filename: string): string => {
  return filename.replace(/[^a-zA-Z0-9\-_\.]/g, '_');
};

export const getFileTypeFromMime = (mimeType: string): string => {
  const mimeToType: Record<string, string> = {
    'application/pdf': 'RAPPORT',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'DONNEES_EXPERIMENTALES',
    'application/vnd.ms-excel': 'DONNEES_EXPERIMENTALES',
    'text/csv': 'DONNEES_EXPERIMENTALES',
    'image/jpeg': 'IMAGE',
    'image/jpg': 'IMAGE',
    'image/png': 'IMAGE',
    'image/gif': 'IMAGE',
    'image/webp': 'IMAGE',
    'image/svg+xml': 'IMAGE',
  };
  
  return mimeToType[mimeType] || 'AUTRE';
};