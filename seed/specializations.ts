import { specializations } from '../db/schema.js';

export const seedSpecializations = [
  {
    id: 'spec-vacuum',
    name: 'Vacuum Therapy',
    displayName: 'Vakum Terapi',
    description: 'Vakum ile lenfatik drenaj ve selülit azaltma',
    deviceCount: 3,
    sessionDuration: 60,
    pricePerSession: 150.0,
    isActive: true
  },
  {
    id: 'spec-rf',
    name: 'RF Therapy',
    displayName: 'RF Radyofrekans Terapi',
    description: 'Radyofrekans ile cilt sıkılaştırma ve gençleştirme',
    deviceCount: 2,
    sessionDuration: 45,
    pricePerSession: 200.0,
    isActive: true
  },
  {
    id: 'spec-laser',
    name: 'Laser Therapy',
    displayName: 'Lazer Terapi',
    description: 'Lazer ile epilasyon ve cilt tedavileri',
    deviceCount: 2,
    sessionDuration: 30,
    pricePerSession: 100.0,
    isActive: true
  },
  {
    id: 'spec-cavitation',
    name: 'Ultrasonic Cavitation',
    displayName: 'Ultrasonik Kavitasiyon',
    description: 'Ultrasonik dalgalar ile yağ eritme',
    deviceCount: 1,
    sessionDuration: 50,
    pricePerSession: 180.0,
    isActive: true
  },
  {
    id: 'spec-massage',
    name: 'Therapeutic Massage',
    displayName: 'Tedavi Masajı',
    description: 'Manuel masaj terapileri',
    deviceCount: 0,
    sessionDuration: 90,
    pricePerSession: 120.0,
    isActive: true
  }
] as const;
