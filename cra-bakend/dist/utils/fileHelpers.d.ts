export declare const generateFileHash: (filepath: string) => Promise<string>;
export declare const getFileSize: (filepath: string) => number;
export declare const deleteFile: (filepath: string) => Promise<void>;
export declare const sanitizeFilename: (filename: string) => string;
export declare const getFileTypeFromMime: (mimeType: string) => string;
export declare const fileExists: (filepath: string) => boolean;
export declare const getFileInfo: (filepath: string) => {
    size: number;
    createdAt: Date;
    modifiedAt: Date;
} | null;
export declare const formatFileSize: (bytes: number) => string;
export declare const isAllowedMimeType: (mimeType: string, allowedTypes?: string[]) => boolean;
export declare const getFileExtension: (filename: string) => string;
export declare const isImage: (mimeType: string) => boolean;
export declare const isDocument: (mimeType: string) => boolean;
//# sourceMappingURL=fileHelpers.d.ts.map