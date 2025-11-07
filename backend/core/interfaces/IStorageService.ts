/**
 * Storage Service Interface (SRP + DIP)
 * Defines file storage operations for photos and documents
 * Part of Interface Segregation Principle (ISP)
 */
export interface IStorageService {
  /**
   * Upload a file to storage
   * @param file File buffer
   * @param fileName Original file name
   * @param path Storage path/directory
   * @returns Uploaded file metadata
   */
  uploadFile(file: Buffer, fileName: string, path: string): Promise<UploadResult>;

  /**
   * Delete a file from storage
   * @param filePath File path to delete
   * @returns True if deleted successfully
   */
  deleteFile(filePath: string): Promise<boolean>;

  /**
   * Get file metadata
   * @param filePath File path
   * @returns File metadata or null if not found
   */
  getFileInfo(filePath: string): Promise<FileInfo | null>;

  /**
   * Generate signed URL for temporary access
   * @param filePath File path
   * @param expiresIn Expiration time in seconds
   * @returns Signed URL or null if not supported
   */
  getSignedUrl(filePath: string, expiresIn: number): Promise<string | null>;

  /**
   * Check if file exists
   * @param filePath File path
   * @returns True if file exists
   */
  fileExists(filePath: string): Promise<boolean>;
}

/**
 * Upload result structure
 */
export interface UploadResult {
  success: boolean;
  filePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url?: string; // Public URL if applicable
  error?: string;
}

/**
 * File information structure
 */
export interface FileInfo {
  filePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  lastModified: Date;
  url?: string;
}

/**
 * File validation rules
 */
export interface FileValidationRules {
  maxSize: number; // in bytes
  allowedTypes: string[]; // MIME types
  allowedExtensions: string[]; // file extensions
}

/**
 * Common file validation rules
 */
export const PHOTO_VALIDATION: FileValidationRules = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
};

export const DOCUMENT_VALIDATION: FileValidationRules = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  allowedExtensions: ['.pdf', '.doc', '.docx']
};

/**
 * Storage configuration interface
 */
export interface StorageConfig {
  provider: 'local' | 's3' | 'cloudinary';
  local?: {
    uploadDir: string;
    publicUrl: string;
  };
  s3?: {
    bucket: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    publicUrl?: string;
  };
  cloudinary?: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
    uploadPreset?: string;
  };
}
