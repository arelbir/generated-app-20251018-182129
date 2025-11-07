/**
 * Staff Validator
 * Zod-based validation for Staff domain
 * Extends BaseValidator for SOLID + DRY compliance
 */
import { z } from 'zod';
import { BaseValidator } from '../../core/base/BaseValidator';
import { ValidationResult } from '../../core/interfaces/IValidator';
import { CreateStaffDTO, UpdateStaffDTO, WorkingHours, DEFAULT_WORKING_HOURS, StaffSearchDTO } from './staff.types';

// Working hours validation
const workingHoursSchema = z.object({
  monday: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)-([01]\d|2[0-3]):([0-5]\d)$|^closed$/),
  tuesday: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)-([01]\d|2[0-3]):([0-5]\d)$|^closed$/),
  wednesday: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)-([01]\d|2[0-3]):([0-5]\d)$|^closed$/),
  thursday: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)-([01]\d|2[0-3]):([0-5]\d)$|^closed$/),
  friday: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)-([01]\d|2[0-3]):([0-5]\d)$|^closed$/),
  saturday: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)-([01]\d|2[0-3]):([0-5]\d)$|^closed$/),
  sunday: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)-([01]\d|2[0-3]):([0-5]\d)$|^closed$/)
});

// Create staff schema
export const createStaffSchema = z.object({
  fullName: z.string()
    .min(2, 'Ad soyad en az 2 karakter olmalıdır')
    .max(100, 'Ad soyad en fazla 100 karakter olabilir')
    .regex(/^[a-zA-ZçğıöşüÇĞİÖŞÜ\s]+$/, 'Ad soyad sadece harf ve boşluk içerebilir'),

  email: z.string()
    .email('Geçerli bir e-posta adresi giriniz')
    .max(255, 'E-posta adresi çok uzun')
    .toLowerCase(),

  phone: z.string()
    .optional()
    .refine((val) => !val || /^(\+90|0)?[0-9]{10}$/.test(val), {
      message: 'Geçerli bir telefon numarası giriniz'
    }),

  specializationId: z.string()
    .uuid('Geçersiz uzmanlık ID')
    .optional(),

  hireDate: z.string()
    .datetime('Geçerli bir işe giriş tarihi giriniz')
    .refine((date) => new Date(date) <= new Date(), {
      message: 'İşe giriş tarihi gelecekte olamaz'
    }),

  isActive: z.boolean()
    .default(true),

  workingHours: z.string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      try {
        const parsed = JSON.parse(val);
        workingHoursSchema.parse(parsed);
        return true;
      } catch {
        return false;
      }
    }, 'Geçersiz çalışma saatleri formatı'),

  notes: z.string()
    .max(1000, 'Notlar çok uzun')
    .optional()
});

// Update staff schema
export const updateStaffSchema: z.ZodType<UpdateStaffDTO> = z.object({
  fullName: z.string()
    .min(2, 'Ad soyad en az 2 karakter olmalıdır')
    .max(100, 'Ad soyad en fazla 100 karakter olabilir')
    .regex(/^[a-zA-ZçğıöşüÇĞİÖŞÜ\s]+$/, 'Ad soyad sadece harf ve boşluk içerebilir')
    .optional(),

  email: z.string()
    .email('Geçerli bir e-posta adresi giriniz')
    .max(255, 'E-posta adresi çok uzun')
    .toLowerCase()
    .optional(),

  phone: z.string()
    .optional()
    .refine((val) => !val || /^(\+90|0)?[0-9]{10}$/.test(val), {
      message: 'Geçerli bir telefon numarası giriniz'
    }),

  specializationId: z.string()
    .uuid('Geçersiz uzmanlık ID')
    .optional(),

  hireDate: z.string()
    .datetime('Geçerli bir işe giriş tarihi giriniz')
    .refine((date) => new Date(date) <= new Date(), {
      message: 'İşe giriş tarihi gelecekte olamaz'
    })
    .optional(),

  isActive: z.boolean()
    .optional(),

  workingHours: z.string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      try {
        const parsed = JSON.parse(val);
        workingHoursSchema.parse(parsed);
        return true;
      } catch {
        return false;
      }
    }, 'Geçersiz çalışma saatleri formatı'),

  notes: z.string()
    .max(1000, 'Notlar çok uzun')
    .optional()
});

// Search schema
const searchStaffSchema: z.ZodType<StaffSearchDTO> = z.object({
  query: z.string()
    .min(2, 'Arama sorgusu en az 2 karakter olmalıdır')
    .max(100, 'Arama sorgusu çok uzun')
    .optional(),

  filters: z.object({
    isActive: z.boolean().optional(),
    specializationId: z.string().uuid('Geçersiz uzmanlık ID').optional(),
    hireDateFrom: z.string().datetime('Geçersiz başlangıç tarihi').optional(),
    hireDateTo: z.string().datetime('Geçersiz bitiş tarihi').optional()
  }).optional(),

  page: z.number().int().min(0).default(0),
  limit: z.number().int().min(1).max(100).default(10),
  sortBy: z.enum(['fullName', 'email', 'hireDate', 'createdAt']).default('fullName'),
  sortOrder: z.enum(['asc', 'desc']).default('asc')
});

/**
 * Staff Validator Class
 */
export class StaffValidator extends BaseValidator<CreateStaffDTO, UpdateStaffDTO> {
  /**
   * Return create schema
   */
  protected getCreateSchema(): z.ZodType<CreateStaffDTO> {
    return createStaffSchema;
  }

  /**
   * Return update schema
   */
  protected getUpdateSchema(): z.ZodType<UpdateStaffDTO> {
    return updateStaffSchema;
  }

  /**
   * Validate search parameters
   */
  validateSearch(data: unknown): ValidationResult<StaffSearchDTO> {
    const result = searchStaffSchema.safeParse(data);
    return this.convertZodResult<StaffSearchDTO>(result);
  }

  /**
   * Validate working hours format
   */
  validateWorkingHours(hours: unknown): boolean {
    try {
      workingHoursSchema.parse(hours);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Parse working hours from JSON string
   */
  parseWorkingHours(hoursString?: string): WorkingHours | null {
    if (!hoursString) return null;

    try {
      const parsed = JSON.parse(hoursString);
      workingHoursSchema.parse(parsed);
      return parsed as WorkingHours;
    } catch {
      return null;
    }
  }

  /**
   * Check if staff member can be deactivated
   */
  validateStaffDeactivation(staff: any): boolean {
    // Check if staff has upcoming sessions
    // This would need to be checked in the service layer
    return true; // Placeholder
  }
}
