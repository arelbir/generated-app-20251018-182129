/**
 * Package Validator
 * Zod-based validation for Package domain
 * Extends BaseValidator for SOLID + DRY compliance
 */
import { z } from 'zod';
import { BaseValidator } from '../../core/base/BaseValidator';
import { ValidationResult } from '../../core/interfaces/IValidator';
import {
  CreatePackageDTO,
  UpdatePackageDTO,
  PackageUsageDTO,
  PackageExtensionDTO,
  PackageSearchDTO,
  COMMON_PACKAGE_TYPES
} from './package.types';

// Create package schema
export const createPackageSchema = z.object({
  memberId: z.string()
    .uuid('Geçersiz üye ID')
    .min(1, 'Üye ID gerekli'),

  name: z.string()
    .min(2, 'Paket adı en az 2 karakter olmalıdır')
    .max(100, 'Paket adı çok uzun')
    .refine((val) => COMMON_PACKAGE_TYPES.includes(val as any) || val.length >= 5, {
      message: 'Geçerli bir paket adı giriniz'
    }),

  deviceName: z.string()
    .min(2, 'Cihaz adı en az 2 karakter olmalıdır')
    .max(100, 'Cihaz adı çok uzun'),

  startDate: z.string()
    .datetime('Geçerli bir başlangıç tarihi giriniz')
    .refine((date) => new Date(date) >= new Date(), {
      message: 'Başlangıç tarihi geçmişte olamaz'
    }),

  endDate: z.string()
    .datetime('Geçerli bir bitiş tarihi giriniz'),

  totalSessions: z.number()
    .int('Toplam seans sayısı tam sayı olmalıdır')
    .min(1, 'En az 1 seans gerekli')
    .max(100, 'Maksimum 100 seans'),

  notes: z.string()
    .max(500, 'Notlar çok uzun')
    .optional()
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
  message: 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır',
  path: ['endDate']
});

// Update package schema
export const updatePackageSchema = z.object({
  name: z.string()
    .min(2, 'Paket adı en az 2 karakter olmalıdır')
    .max(100, 'Paket adı çok uzun')
    .optional(),

  deviceName: z.string()
    .min(2, 'Cihaz adı en az 2 karakter olmalıdır')
    .max(100, 'Cihaz adı çok uzun')
    .optional(),

  startDate: z.string()
    .datetime('Geçerli bir başlangıç tarihi giriniz')
    .optional(),

  endDate: z.string()
    .datetime('Geçerli bir bitiş tarihi giriniz')
    .optional(),

  totalSessions: z.number()
    .int('Toplam seans sayısı tam sayı olmalıdır')
    .min(1, 'En az 1 seans gerekli')
    .max(100, 'Maksimum 100 seans')
    .optional(),

  sessionsRemaining: z.number()
    .int('Kalan seans sayısı tam sayı olmalıdır')
    .min(0, 'Kalan seans sayısı negatif olamaz')
    .optional(),

  isActive: z.boolean()
    .optional(),

  notes: z.string()
    .max(500, 'Notlar çok uzun')
    .optional()
});

// Package usage schema
export const packageUsageSchema = z.object({
  packageId: z.string()
    .uuid('Geçersiz paket ID'),

  sessionsToUse: z.number()
    .int('Kullanılacak seans sayısı tam sayı olmalıdır')
    .min(1, 'En az 1 seans kullanılmalıdır')
    .max(10, 'Tek seferde maksimum 10 seans kullanılabilir'),

  notes: z.string()
    .max(200, 'Not çok uzun')
    .optional()
});

// Package extension schema
export const packageExtensionSchema = z.object({
  packageId: z.string()
    .uuid('Geçersiz paket ID'),

  additionalSessions: z.number()
    .int('Ek seans sayısı tam sayı olmalıdır')
    .min(1, 'En az 1 seans eklenmelidir')
    .max(50, 'Maksimum 50 seans eklenebilir'),

  newEndDate: z.string()
    .datetime('Geçerli bir bitiş tarihi giriniz')
    .optional(),

  notes: z.string()
    .max(200, 'Not çok uzun')
    .optional()
});

// Search schema
const searchPackageSchema = z.object({
  query: z.string()
    .min(2, 'Arama sorgusu en az 2 karakter olmalıdır')
    .max(100, 'Arama sorgusu çok uzun')
    .optional(),

  filters: z.object({
    memberId: z.string().uuid('Geçersiz üye ID').optional(),
    deviceName: z.string().min(1).max(100).optional(),
    isActive: z.boolean().optional(),
    isExpiring: z.boolean().optional(),
    dateFrom: z.string().datetime('Geçersiz başlangıç tarihi').optional(),
    dateTo: z.string().datetime('Geçersiz bitiş tarihi').optional()
  }).optional(),

  page: z.number().int().min(0).default(0),
  limit: z.number().int().min(1).max(100).default(10),
  sortBy: z.enum(['startDate', 'endDate', 'createdAt', 'sessionsRemaining']).default('startDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

/**
 * Package Validator Class
 */
export class PackageValidator extends BaseValidator<CreatePackageDTO, UpdatePackageDTO> {
  /**
   * Return create schema
   */
  protected getCreateSchema() {
    return createPackageSchema;
  }

  /**
   * Return update schema
   */
  protected getUpdateSchema() {
    return updatePackageSchema;
  }

  /**
   * Validate search parameters
   */
  validateSearch(data: unknown): ValidationResult<PackageSearchDTO> {
    const result = searchPackageSchema.safeParse(data);
    return this.convertZodResult<PackageSearchDTO>(result);
  }

  /**
   * Validate package usage
   */
  validateUsage(data: unknown): ValidationResult<PackageUsageDTO> {
    const result = packageUsageSchema.safeParse(data);
    return this.convertZodResult<PackageUsageDTO>(result);
  }

  /**
   * Validate package extension
   */
  validateExtension(data: unknown): ValidationResult<PackageExtensionDTO> {
    const result = packageExtensionSchema.safeParse(data);
    return this.convertZodResult<PackageExtensionDTO>(result);
  }

  /**
   * Check if package can be used
   */
  validatePackageUsage(packageData: any, sessionsToUse: number): boolean {
    // Check if package is active
    if (!packageData.isActive) {
      return false;
    }

    // Check if package has expired
    if (new Date(packageData.endDate) < new Date()) {
      return false;
    }

    // Check if enough sessions remaining
    return packageData.sessionsRemaining >= sessionsToUse;
  }

  /**
   * Check if package can be extended
   */
  validatePackageExtension(packageData: any): boolean {
    // Only active packages can be extended
    return packageData.isActive;
  }

  /**
   * Check if package is expiring soon (within 7 days)
   */
  isExpiringSoon(endDate: string): boolean {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  }
}
