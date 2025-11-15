export declare class ImageCompressionService {
    static compressImage(inputBuffer: Buffer, options?: {
        quality?: number;
        maxWidth?: number;
        maxHeight?: number;
        format?: 'jpeg' | 'png' | 'webp';
    }): Promise<{
        buffer: Buffer;
        size: number;
        width: number;
        height: number;
    }>;
    static extractGPSData(buffer: Buffer): Promise<{
        latitude?: number;
        longitude?: number;
    }>;
}
//# sourceMappingURL=imageCompression.service.d.ts.map