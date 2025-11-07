/**
 * Member Validator
 * Zod-based validation for Member domain
 * Extends BaseValidator for SOLID + DRY compliance
 */
import { z } from 'zod';
import { BaseValidator } from '../../core/base/BaseValidator';
import { CreateMemberDTO, UpdateMemberDTO } from './member.types';

// Validation schemas
export const createMemberSchema = z.object({
  fullName: z.string()
    .min(2, 'Ad soyad en az 2 karakter olmalıdır')
    .max(100, 'Ad soyad en fazla 100 karakter olabilir'),

  email: z.string()
    .email('Geçerli bir e-posta adresi giriniz')
    .max(255, 'E-posta adresi çok uzun'),

  phone: z.string()
    .regex(/^(\+90|0)?[0-9]{10}$/, 'Geçerli bir telefon numarası giriniz')
    .transform(phone => {
      // Normalize phone number
      const cleanPhone = phone.replace(/\s/g, '');
      if (cleanPhone.startsWith('+90')) {
        return cleanPhone;
      } else if (cleanPhone.startsWith('0')) {
        return cleanPhone;
      } else {
        return `0${cleanPhone}`;
      }
    }),

  joinDate: z.string()
    .datetime('Geçerli bir tarih giriniz')
    .optional()
    .default(() => new Date().toISOString()),

  status: z.enum(['active', 'demo', 'inactive'])
    .default('active'),

  gender: z.enum(['Kadın', 'Erkek', 'Diğer'], 'Geçerli bir cinsiyet seçiniz'),

  isVeiled: z.boolean()
    .default(false),

  notes: z.string()
    .max(1000, 'Notlar çok uzun')
    .optional(),

  healthConditions: z.array(z.string().uuid('Geçersiz sağlık durumu ID'))
    .default([])
});

export const updateMemberSchema = z.object({
  fullName: createMemberSchema.shape.fullName.optional(),
  email: createMemberSchema.shape.email.optional(),
  phone: createMemberSchema.shape.phone.optional(),
  joinDate: createMemberSchema.shape.joinDate.optional(),
  status: createMemberSchema.shape.status.optional(),
  gender: createMemberSchema.shape.gender.optional(),
  isVeiled: createMemberSchema.shape.isVeiled.optional(),
  notes: createMemberSchema.shape.notes.optional(),
  healthConditions: createMemberSchema.shape.healthConditions.optional()
}).extend({
});

const idSchema = z.string().uuid('Geçersiz ID formatı');

const searchSchema = z.object({
  query: z.string()
    .min(2, 'Arama sorgusu en az 2 karakter olmalıdır')
    .max(100, 'Arama sorgusu çok uzun')
    .optional(),

  filters: z.object({
    status: z.enum(['active', 'demo', 'inactive']).optional(),
    gender: z.enum(['Kadın', 'Erkek', 'Diğer']).optional(),
    isVeiled: z.boolean().optional(),
    joinDateFrom: z.string().datetime('Geçersiz başlangıç tarihi').optional(),
    joinDateTo: z.string().datetime('Geçersiz bitiş tarihi').optional(),
    healthConditions: z.array(z.string().uuid('Geçersiz sağlık durumu ID')).optional()
  }).optional(),

  page: z.number().int().min(0).default(0),
  limit: z.number().int().min(1).max(100).default(10),
  sortBy: z.enum(['fullName', 'email', 'joinDate', 'createdAt']).default('fullName'),
  sortOrder: z.enum(['asc', 'desc']).default('asc')
});

/**
 * Member Validator Class
 * Extends BaseValidator for SOLID + DRY compliance
 */
export class MemberValidator extends BaseValidator<CreateMemberDTO, UpdateMemberDTO> {
  /**
   * Return create schema
   */
  protected getCreateSchema() {
    return createMemberSchema;
  }

  /**
   * Return update schema
   */
  protected getUpdateSchema() {
    return updateMemberSchema;
  }

  /**
   * Validate search parameters
   */
  validateSearch(data: unknown) {
    const result = searchSchema.safeParse(data);
    return this.convertZodResult(result);
  }

  /**
   * Validate minimum age
   */
  validateMinimumAge(joinDate: string, minimumAge: number = 18): boolean {
    const birthDate = new Date(joinDate);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= minimumAge;
  }
}
