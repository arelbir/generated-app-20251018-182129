import { sessions } from '../db/schema.js';

export const seedSessions = [
  // Ayşe Yılmaz'ın seansları
  {
    id: 'session-001',
    memberId: 'member-001',
    subDeviceId: 'Vacu 1',
    startTime: '2024-01-16T10:00:00.000Z',
    duration: 45,
    status: 'completed',
    notes: 'İlk seans, iyi başladı'
  },
  {
    id: 'session-002',
    memberId: 'member-001',
    subDeviceId: 'Vacu 1',
    startTime: '2024-01-18T10:00:00.000Z',
    duration: 45,
    status: 'completed',
    notes: 'Düzenli devam ediyor'
  },
  {
    id: 'session-003',
    memberId: 'member-001',
    subDeviceId: 'Vacu 2',
    startTime: '2024-03-15T14:00:00.000Z',
    duration: 45,
    status: 'booked',
    notes: 'Gelecek seans'
  },

  // Mehmet Kaya'nın seansları
  {
    id: 'session-004',
    memberId: 'member-002',
    subDeviceId: 'Roll 1',
    startTime: '2024-02-02T16:00:00.000Z',
    duration: 60,
    status: 'completed',
    notes: 'Yoğun program, iyi performans'
  },
  {
    id: 'session-005',
    memberId: 'member-002',
    subDeviceId: 'Vacu 1',
    startTime: '2024-02-05T16:00:00.000Z',
    duration: 45,
    status: 'completed',
    notes: 'Kombine seans'
  },
  {
    id: 'session-006',
    memberId: 'member-002',
    subDeviceId: 'Roll 1',
    startTime: '2024-03-20T16:00:00.000Z',
    duration: 60,
    status: 'confirmed',
    notes: 'Planlanan seans'
  },

  // Fatma Demir'in seansları
  {
    id: 'session-007',
    memberId: 'member-003',
    subDeviceId: 'Vacu 1',
    startTime: '2024-01-22T11:00:00.000Z',
    duration: 30,
    status: 'completed',
    notes: 'Hafif program, doktor onayı ile'
  },
  {
    id: 'session-008',
    memberId: 'member-003',
    subDeviceId: 'Vacu 1',
    startTime: '2024-03-18T11:00:00.000Z',
    duration: 30,
    status: 'booked',
    notes: 'Rutubet kontrolü'
  },

  // Zeynep Öztürk'ün seansları
  {
    id: 'session-009',
    memberId: 'member-005',
    subDeviceId: 'Vacu 2',
    startTime: '2024-02-17T09:00:00.000Z',
    duration: 40,
    status: 'completed',
    notes: 'Postpartum program, yavaş tempo'
  },
  {
    id: 'session-010',
    memberId: 'member-005',
    subDeviceId: 'Vacu 2',
    startTime: '2024-03-16T09:00:00.000Z',
    duration: 40,
    status: 'booked',
    notes: 'Devam seansı'
  },

  // İptal edilmiş seans örneği
  {
    id: 'session-011',
    memberId: 'member-001',
    subDeviceId: 'Vacu 1',
    startTime: '2024-02-20T10:00:00.000Z',
    duration: 45,
    status: 'cancelled',
    notes: 'Üye rahatsızlandı, iptal edildi'
  }
] as const;
