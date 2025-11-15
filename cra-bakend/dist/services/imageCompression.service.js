"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageCompressionService = void 0;
const tslib_1 = require("tslib");
const sharp_1 = tslib_1.__importDefault(require("sharp"));
class ImageCompressionService {
    static async compressImage(inputBuffer, options = {}) {
        const { quality = 80, maxWidth = 1920, maxHeight = 1920, format = 'jpeg' } = options;
        let processor = (0, sharp_1.default)(inputBuffer);
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
        const metadata = await (0, sharp_1.default)(buffer).metadata();
        return {
            buffer,
            size: buffer.length,
            width: metadata.width || 0,
            height: metadata.height || 0
        };
    }
    static async extractGPSData(buffer) {
        try {
            const metadata = await (0, sharp_1.default)(buffer).metadata();
            return {};
        }
        catch (error) {
            return {};
        }
    }
}
exports.ImageCompressionService = ImageCompressionService;
//# sourceMappingURL=imageCompression.service.js.map