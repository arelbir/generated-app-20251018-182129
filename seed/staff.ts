import { staff } from '../db/schema.js';

export const seedStaff = [
  {
    id: 'staff-001',
    fullName: 'Ayşe Kaya',
    email: 'ayse.kaya@morfistudio.com',
    phone: '+90 555 111 2233',
    specializationId: 'spec-vacuum',
    hireDate: '2023-01-15T00:00:00.000Z',
    isActive: true,
    workingHours: JSON.stringify({
      monday: '09:00-18:00',
      tuesday: '09:00-18:00',
      wednesday: '09:00-18:00',
      thursday: '09:00-18:00',
      friday: '09:00-18:00',
      saturday: '10:00-16:00',
      sunday: null
    }),
    notes: 'Deneyimli vakum terapisti, 2 yıldır çalışıyor.'
  },
  {
    id: 'staff-002',
    fullName: 'Mehmet Öz',
    email: 'mehmet.oz@morfistudio.com',
    phone: '+90 555 222 3344',
    specializationId: 'spec-rf',
    hireDate: '2023-03-01T00:00:00.000Z',
    isActive: true,
    workingHours: JSON.stringify({
      monday: '10:00-19:00',
      tuesday: '10:00-19:00',
      wednesday: '10:00-19:00',
      thursday: '10:00-19:00',
      friday: '10:00-19:00',
      saturday: '11:00-17:00',
      sunday: null
    }),
    notes: 'RF terapisi uzmanı, yeni başlayan.'
  },
  {
    id: 'staff-003',
    fullName: 'Zeynep Yıldız',
    email: 'zeynep.yildiz@morfistudio.com',
    phone: '+90 555 333 4455',
    specializationId: 'spec-laser',
    hireDate: '2022-11-20T00:00:00.000Z',
    isActive: true,
    workingHours: JSON.stringify({
      monday: '08:00-17:00',
      tuesday: '08:00-17:00',
      wednesday: '08:00-17:00',
      thursday: '08:00-17:00',
      friday: '08:00-17:00',
      saturday: null,
      sunday: null
    }),
    notes: 'Lazer terapisi uzmanı, kıdemli personel.'
  }
] as const;
