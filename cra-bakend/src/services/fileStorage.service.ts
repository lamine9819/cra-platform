import * as path from 'path';
import * as fs from 'fs/promises';
import { ImageCompressionService } from './imageCompression.service';

export class FileStorageService {
  
  static async savePhoto(
    base64Data: string,
    options: {
      filename?: string;
      quality?: number;
      maxSize?: number;
    } = {}
  ): Promise<{
    filename: string;
    filepath: string;
    size: number;
    width: number;
    height: number;
    url: string;
  }> {
    
    const buffer = Buffer.from(base64Data, 'base64');
    
    const compressed = await ImageCompressionService.compressImage(buffer, {
      quality: options.quality || 80,
      maxWidth: 1920,
      maxHeight: 1920,
      format: 'jpeg'
    });
    
    const filename = options.filename || `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`;
    const uploadsDir = path.join(process.cwd(), 'uploads', 'photos');
    const filepath = path.join(uploadsDir, filename);
    
    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.writeFile(filepath, compressed.buffer);
    
    return {
      filename,
      filepath,
      size: compressed.size,
      width: compressed.width,
      height: compressed.height,
      url: `/uploads/photos/${filename}`
    };
  }
  
  static async deletePhoto(filename: string): Promise<boolean> {
    try {
      const filepath = path.join(process.cwd(), 'uploads', 'photos', filename);
      await fs.unlink(filepath);
      return true;
    } catch (error) {
      console.error('Erreur suppression fichier:', error);
      return false;
    }
  }
}