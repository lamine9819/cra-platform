"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileStorageService = void 0;
const tslib_1 = require("tslib");
const path = tslib_1.__importStar(require("path"));
const fs = tslib_1.__importStar(require("fs/promises"));
const imageCompression_service_1 = require("./imageCompression.service");
class FileStorageService {
    static async savePhoto(base64Data, options = {}) {
        const buffer = Buffer.from(base64Data, 'base64');
        const compressed = await imageCompression_service_1.ImageCompressionService.compressImage(buffer, {
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
    static async deletePhoto(filename) {
        try {
            const filepath = path.join(process.cwd(), 'uploads', 'photos', filename);
            await fs.unlink(filepath);
            return true;
        }
        catch (error) {
            console.error('Erreur suppression fichier:', error);
            return false;
        }
    }
}
exports.FileStorageService = FileStorageService;
//# sourceMappingURL=fileStorage.service.js.map