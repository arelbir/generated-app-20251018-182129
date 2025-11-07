import { z } from 'zod';
import { BaseValidator } from '../../core/base/BaseValidator';
import { ValidationResult } from '../../core/interfaces/IValidator';
import {
  CreateMeasurementDTO,
  UpdateMeasurementDTO,
  MeasurementSearchDTO
} from './measurement.types';

const measurementNumber = (min: number, max?: number) =>
  z
    .number()
    .min(min, `Değer ${min} veya üzerinde olmalıdır`)
    .refine((value) => (max !== undefined ? value <= max : true), {
      message: max !== undefined ? `Değer ${max} veya altında olmalıdır` : 'Geçersiz değer'
    });

export const createMeasurementSchema = z.object({
  memberId: z.string().uuid('Geçersiz üye ID'),
  date: z
    .string()
    .datetime('Geçerli bir tarih giriniz')
    .refine((value) => new Date(value) <= new Date(), {
      message: 'Ölçüm tarihi gelecekte olamaz'
    }),
  weight: measurementNumber(20, 400),
  height: measurementNumber(80, 250).int('Boy tam sayı olmalıdır'),
  bodyFatPercentage: measurementNumber(0, 80).optional(),
  waist: measurementNumber(30, 300).int('Bel çevresi tam sayı olmalıdır'),
  hips: measurementNumber(30, 300).int('Kalça çevresi tam sayı olmalıdır'),
  chest: measurementNumber(30, 300).int('Göğüs çevresi tam sayı olmalıdır').optional(),
  arms: measurementNumber(20, 200).int('Kol çevresi tam sayı olmalıdır').optional(),
  thighs: measurementNumber(20, 200).int('Uyluk çevresi tam sayı olmalıdır').optional()
});

export const updateMeasurementSchema = createMeasurementSchema.partial();

export const searchMeasurementSchema = z.object({
  memberId: z.string().uuid('Geçersiz üye ID').optional(),
  dateFrom: z.string().datetime('Geçersiz başlangıç tarihi').optional(),
  dateTo: z.string().datetime('Geçersiz bitiş tarihi').optional(),
  minWeight: z.number().min(0).optional(),
  maxWeight: z.number().min(0).optional(),
  minBodyFat: z.number().min(0).optional(),
  maxBodyFat: z.number().min(0).optional(),
  page: z.number().int().min(0).default(0),
  limit: z.number().int().min(1).max(100).default(10),
  sortBy: z.enum(['date', 'weight', 'bodyFatPercentage', 'createdAt']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export class MeasurementValidator extends BaseValidator<CreateMeasurementDTO, UpdateMeasurementDTO> {
  protected getCreateSchema() {
    return createMeasurementSchema;
  }

  protected getUpdateSchema() {
    return updateMeasurementSchema;
  }

  validateSearch(data: unknown): ValidationResult<MeasurementSearchDTO> {
    const result = searchMeasurementSchema.safeParse(data);
    return this.convertZodResult<MeasurementSearchDTO>(result);
  }

  validateMeasurementDate(date: string): boolean {
    return new Date(date) <= new Date();
  }
}
