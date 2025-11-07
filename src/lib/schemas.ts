import { z } from 'zod'

// Schema for form input (with objects for useFieldArray)
export const memberFormSchema = z.object({
  fullName: z.string().min(2, { message: 'Ad Soyad en az 2 karakter olmalıdır.' }),
  email: z.string().email({ message: 'Geçerli bir e-posta adresi girin.' }),
  phone: z.string().min(10, { message: 'Telefon numarası en az 10 karakter olmalıdır.' }),
  gender: z.enum(['Kadın', 'Erkek', 'Diğer']),
  isVeiled: z.boolean(),
  notes: z.string().optional(),
  healthConditions: z.array(z.object({ value: z.string() })),
  measurements: z.array(
    z.object({
      date: z.string(),
      weight: z.coerce.number(),
      height: z.coerce.number(),
      bodyFatPercentage: z.coerce.number().optional().nullable(),
      waist: z.coerce.number(),
      hips: z.coerce.number(),
    })
  ),
  packages: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      deviceName: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      totalSessions: z.coerce.number(),
      sessionsRemaining: z.coerce.number(),
    })
  ),
})

// Schema for final output (with string array for healthConditions)
export const memberSchema = memberFormSchema.transform((data) => ({
  ...data,
  healthConditions: data.healthConditions.map(item => item.value).filter(Boolean),
}))

// Type for form input
export type MemberFormInput = z.input<typeof memberFormSchema>;

// Type for final output
export type MemberFormValues = z.output<typeof memberSchema>;

export const deviceSchema = z.object({
  name: z.string().min(2, { message: 'Cihaz adı en az 2 karakter olmalıdır.' }),
  quantity: z.coerce.number().int().min(1, { message: 'Sayı en az 1 olmalıdır.' }),
  measurementFrequency: z.preprocess(
    (val) => (val === '' ? null : val),
    z.coerce.number().int().min(0).nullable()
  ),
  requiredSpecializationIds: z.array(z.string()).optional(),
})
export type DeviceFormValues = z.infer<typeof deviceSchema>
export const healthConditionSchema = z.object({
  name: z.string().min(2, { message: 'Rahatsızlık adı en az 2 karakter olmalıdır.' }),
})
export const packageDefinitionSchema = z.object({
  name: z.string().min(3, { message: 'Paket adı en az 3 karakter olmalıdır.' }),
  deviceName: z.string().min(1, { message: 'Lütfen bir cihaz seçin.' }),
  totalSessions: z.coerce.number().int().min(1, { message: 'Seans sayısı en az 1 olmalıdır.' }),
  price: z.coerce.number().min(0, { message: 'Ücret negatif olamaz.' }),
  durationDays: z.coerce.number().int().min(1, { message: 'Süre en az 1 gün olmalıdır.' }),
})
export const staffSchema = z.object({
  fullName: z.string().min(2, { message: 'Ad Soyad en az 2 karakter olmalıdır.' }),
  email: z.string().email({ message: 'Geçerli bir e-posta adresi girin.' }),
  phone: z.string().min(10, { message: 'Telefon numarası en az 10 karakter olmalıdır.' }),
  role: z.enum(['admin', 'uzman']),
  status: z.enum(['active', 'inactive']),
  gender: z.enum(['Kadın', 'Erkek', 'Diğer']),
  joinDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Geçerli bir tarih girin.' }),
  specializationIds: z.array(z.string()).optional(),
  notes: z.string().optional(),
  serviceCommissions: z.array(z.object({
    serviceId: z.string().min(1, { message: 'Lütfen bir servis seçin.' }),
    rate: z.coerce.number().min(0, { message: 'Oran pozitif olmalı.' }).max(100, { message: 'Oran 100\'den büy��k olamaz.' }),
  })),
  workingHours: z.array(z.object({
    day: z.enum(['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Geçerli bir saat girin (HH:mm)' }),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Geçerli bir saat girin (HH:mm)' }),
  })),
})
export type StaffFormValues = z.infer<typeof staffSchema>;
export const specializationSchema = z.object({
  name: z.string().min(2, { message: 'Uzmanlık alanı en az 2 karakter olmalıdır.' }),
})
export type SpecializationFormValues = z.infer<typeof specializationSchema>;