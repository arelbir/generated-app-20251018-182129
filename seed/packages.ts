import { packages } from '../db/schema.js';

export const seedPackages = [
  // Ayşe Yılmaz'ın paketleri
  {
    id: 'package-001',
    memberId: 'member-001',
    name: 'Slim Fit Paketi',
    deviceName: 'Vacu',
    startDate: '2024-01-15T00:00:00.000Z',
    endDate: '2024-04-15T00:00:00.000Z',
    totalSessions: 24,
    sessionsRemaining: 18
  },

  // Mehmet Kaya'nın paketleri
  {
    id: 'package-002',
    memberId: 'member-002',
    name: 'Muscle Gain Paketi',
    deviceName: 'Roll',
    startDate: '2024-02-01T00:00:00.000Z',
    endDate: '2024-05-01T00:00:00.000Z',
    totalSessions: 30,
    sessionsRemaining: 25
  },
  {
    id: 'package-003',
    memberId: 'member-002',
    name: 'Power Pack',
    deviceName: 'Vacu',
    startDate: '2024-02-01T00:00:00.000Z',
    endDate: '2024-05-01T00:00:00.000Z',
    totalSessions: 20,
    sessionsRemaining: 15
  },

  // Fatma Demir'in paketleri
  {
    id: 'package-004',
    memberId: 'member-003',
    name: 'Health Recovery Paketi',
    deviceName: 'Vacu',
    startDate: '2024-01-20T00:00:00.000Z',
    endDate: '2024-04-20T00:00:00.000Z',
    totalSessions: 18,
    sessionsRemaining: 12
  },

  // Ahmet Çelik'in paketleri (demo üye)
  {
    id: 'package-005',
    memberId: 'member-004',
    name: 'Demo Paketi',
    deviceName: 'Vacu',
    startDate: '2024-03-10T00:00:00.000Z',
    endDate: '2024-04-10T00:00:00.000Z',
    totalSessions: 8,
    sessionsRemaining: 8
  },

  // Zeynep Öztürk'ün paketleri
  {
    id: 'package-006',
    memberId: 'member-005',
    name: 'Postpartum Fitness Paketi',
    deviceName: 'Vacu',
    startDate: '2024-02-15T00:00:00.000Z',
    endDate: '2024-05-15T00:00:00.000Z',
    totalSessions: 22,
    sessionsRemaining: 20
  }
] as const;
