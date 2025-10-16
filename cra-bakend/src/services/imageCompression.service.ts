import sharp from 'sharp';

export class ImageCompressionService {
  static async compressImage(
    inputBuffer: Buffer,
    options: {
      quality?: number;
      maxWidth?: number;
      maxHeight?: number;
      format?: 'jpeg' | 'png' | 'webp';
    } = {}
  ): Promise<{ buffer: Buffer; size: number; width: number; height: number }> {
    
    const {
      quality = 80,
      maxWidth = 1920,
      maxHeight = 1920,
      format = 'jpeg'
    } = options;
    
    let processor = sharp(inputBuffer);
    
    processor = processor.resize(maxWidth, maxHeight, {
      fit: 'inside',
      withoutEnlargement: true
    });
    
    switch (format) {
      case 'jpeg':
        processor = processor.jpeg({ quality });
        break;
      case 'png':
        processor = processor.png({ quality });
        break;
      case 'webp':
        processor = processor.webp({ quality });
        break;
    }
    
    const buffer = await processor.toBuffer();
    const metadata = await sharp(buffer).metadata();
    
    return {
      buffer,
      size: buffer.length,
      width: metadata.width || 0,
      height: metadata.height || 0
    };
  }
  
  static async extractGPSData(buffer: Buffer): Promise<{ latitude?: number; longitude?: number }> {
    try {
      const metadata = await sharp(buffer).metadata();
      return {};
    } catch (error) {
      return {};
    }
  }
}