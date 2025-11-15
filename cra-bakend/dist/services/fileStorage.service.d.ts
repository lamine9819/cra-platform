export declare class FileStorageService {
    static savePhoto(base64Data: string, options?: {
        filename?: string;
        quality?: number;
        maxSize?: number;
    }): Promise<{
        filename: string;
        filepath: string;
        size: number;
        width: number;
        height: number;
        url: string;
    }>;
    static deletePhoto(filename: string): Promise<boolean>;
}
//# sourceMappingURL=fileStorage.service.d.ts.map