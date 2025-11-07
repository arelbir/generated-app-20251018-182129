/**
 * Session Validator
 * Zod-based validation for Session domain
 * Extends BaseValidator for SOLID + DRY compliance
 */
import { z } from 'zod';
import { BaseValidator } from '../../core/base/BaseValidator';
import { CreateSessionDTO, UpdateSessionDTO } from './session.types';

// Session status enum
const sessionStatusSchema = z.enum(['booked', 'confirmed', 'cancelled', 'completed']);

// Create session schema
export const createSessionSchema = z.object({
  memberId: z.string()
    .uuid('Geçersiz üye ID')
    .min(1, 'Üye ID gerekli'),

  subDeviceId: z.string()
    .min(1, 'Cihaz ID gerekli')
    .max(100, 'Cihaz ID çok uzun'),

  startTime: z.string()
    .datetime('Geçerli bir başlangıç tarihi giriniz')
    .refine((date) => new Date(date) > new Date(), {
      message: 'Başlangıç tarihi geçmişte olamaz'
    }),

  duration: z.number()
    .int('Süre tam sayı olmalıdır')
    .min(15, 'Minimum süre 15 dakika')
    .max(480, 'Maksimum süre 8 saat'),

  notes: z.string()
    .max(500, 'Notlar çok uzun')
    .optional()
});

// Update session schema
export const updateSessionSchema = z.object({
  status: sessionStatusSchema.optional(),

  startTime: z.string()
    .datetime('Geçerli bir tarih giriniz')
    .optional(),

  duration: z.number()
    .int('Süre tam sayı olmalıdır')
    .min(15, 'Minimum süre 15 dakika')
    .max(480, 'Maksimum süre 8 saat')
    .optional(),

  notes: z.string()
    .max(500, 'Notlar çok uzun')
    .optional()
});

// Search schema
const searchSessionSchema = z.object({
  query: z.string()
    .min(2, 'Arama sorgusu en az 2 karakter olmalıdır')
    .max(100, 'Arama sorgusu çok uzun')
    .optional(),

  filters: z.object({
    status: z.array(sessionStatusSchema).optional(),
    memberId: z.string().uuid('Geçersiz üye ID').optional(),
    subDeviceId: z.string().min(1).max(100).optional(),
    dateFrom: z.string().datetime('Geçersiz başlangıç tarihi').optional(),
    dateTo: z.string().datetime('Geçersiz bitiş tarihi').optional()
  }).optional(),

  page: z.number().int().min(0).default(0),
  limit: z.number().int().min(1).max(100).default(10),
  sortBy: z.enum(['startTime', 'createdAt', 'duration']).default('startTime'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

/**
 * Session Validator Class
 */
export class SessionValidator extends BaseValidator<CreateSessionDTO, UpdateSessionDTO> {
  /**
   * Return create schema
   */
  protected getCreateSchema() {
    return createSessionSchema;
  }

  /**
   * Return update schema
   */
  protected getUpdateSchema() {
    return updateSessionSchema;
  }

  /**
   * Validate search parameters
   */
  validateSearch(data: unknown) {
    const result = searchSessionSchema.safeParse(data);
    return this.convertZodResult(result);
  }

  /**
   * Validate session time conflict
   */
  validateNoTimeConflict(
    startTime: string,
    duration: number,
    subDeviceId: string,
    excludeSessionId?: string
  ): boolean {
    const start = new Date(startTime);
    const end = new Date(start.getTime() + duration * 60 * 1000);

    // This would typically check against database
    // For now, return true (no conflict)
    return true;
  }

  /**
   * Validate session can be modified
   */
  validateSessionModifiable(session: any): boolean {
    // Cannot modify completed or cancelled sessions
    return !['completed', 'cancelled'].includes(session.status);
  }
}
