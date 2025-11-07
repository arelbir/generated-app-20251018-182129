import { measurements } from '../db/schema.js';

export const seedMeasurements = [
  // Ayşe Yılmaz'ın ölçümleri
  {
    id: 'measurement-001',
    memberId: 'member-001',
    date: '2024-01-15T00:00:00.000Z',
    weight: 68.5,
    height: 165,
    bodyFatPercentage: 24.5,
    waist: 78,
    hips: 95,
    chest: 92,
    arms: 28,
    thighs: 55
  },
  {
    id: 'measurement-002',
    memberId: 'member-001',
    date: '2024-02-15T00:00:00.000Z',
    weight: 66.8,
    height: 165,
    bodyFatPercentage: 22.8,
    waist: 75,
    hips: 92,
    chest: 90,
    arms: 29,
    thighs: 56
  },

  // Mehmet Kaya'nın ölçümleri
  {
    id: 'measurement-003',
    memberId: 'member-002',
    date: '2024-02-01T00:00:00.000Z',
    weight: 75.2,
    height: 178,
    bodyFatPercentage: 12.3,
    waist: 82,
    hips: 88,
    chest: 98,
    arms: 35,
    thighs: 62
  },
  {
    id: 'measurement-004',
    memberId: 'member-002',
    date: '2024-03-01T00:00:00.000Z',
    weight: 78.1,
    height: 178,
    bodyFatPercentage: 13.8,
    waist: 84,
    hips: 90,
    chest: 101,
    arms: 36,
    thighs: 64
  },

  // Fatma Demir'in ölçümleri
  {
    id: 'measurement-005',
    memberId: 'member-003',
    date: '2024-01-20T00:00:00.000Z',
    weight: 72.3,
    height: 162,
    bodyFatPercentage: 28.7,
    waist: 85,
    hips: 100,
    chest: 95,
    arms: 26,
    thighs: 58
  },
  {
    id: 'measurement-006',
    memberId: 'member-003',
    date: '2024-02-20T00:00:00.000Z',
    weight: 70.8,
    height: 162,
    bodyFatPercentage: 26.9,
    waist: 82,
    hips: 98,
    chest: 93,
    arms: 27,
    thighs: 57
  },

  // Zeynep Öztürk'ün ölçümleri
  {
    id: 'measurement-007',
    memberId: 'member-005',
    date: '2024-02-15T00:00:00.000Z',
    weight: 58.9,
    height: 168,
    bodyFatPercentage: 21.4,
    waist: 72,
    hips: 88,
    chest: 86,
    arms: 24,
    thighs: 48
  }
] as const;
