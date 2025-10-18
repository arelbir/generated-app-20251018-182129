import { Member, Session, FinancialTransaction, MonthlyIncomeRow, AuditLog, Device, HealthConditionDefinition, PackageDefinition, Staff, SpecializationDefinition } from './types'
import { addDays, subDays } from 'date-fns';
export const MOCK_MEMBERS: Member[] = [
  {
    id: 'a1b2c3d4',
    fullName: 'Elif Akba��',
    email: 'elif.akbas@example.com',
    phone: '555-0101',
    joinDate: '2024-05-15T10:00:00Z',
    status: 'active',
    gender: 'Kadın',
    isVeiled: true,
    notes: 'Sabah saatlerini tercih ediyor.',
    healthConditions: ['Bel fıtığı başlangıc��'],
    measurements: [
      {
        date: '2024-05-15T10:00:00Z',
        weight: 68,
        height: 165,
        bodyFatPercentage: 28,
        waist: 78,
        hips: 102,
      },
      {
        date: '2024-06-15T10:00:00Z',
        weight: 65,
        height: 165,
        bodyFatPercentage: 26,
        waist: 75,
        hips: 100,
      },
    ],
    packages: [
      {
        id: 'pkg-01',
        name: '12 Seans Vacu Activ',
        deviceName: 'Vacu',
        startDate: '2024-05-15T10:00:00Z',
        endDate: '2024-07-15T10:00:00Z',
        totalSessions: 12,
        sessionsRemaining: 5,
      },
    ],
  },
  {
    id: 'e5f6g7h8',
    fullName: 'Pınar Selek',
    email: 'pinar.selek@example.com',
    phone: '555-0102',
    joinDate: '2024-06-01T14:30:00Z',
    status: 'active',
    gender: 'Kadın',
    isVeiled: false,
    notes: '',
    healthConditions: [],
    measurements: [
      {
        date: '2024-06-01T14:30:00Z',
        weight: 75,
        height: 172,
        bodyFatPercentage: 32,
        waist: 85,
        hips: 110,
      },
    ],
    packages: [
      {
        id: 'pkg-02',
        name: '24 Seans Roll Shape',
        deviceName: 'Roll',
        startDate: '2024-06-01T14:30:00Z',
        endDate: '2024-09-01T14:30:00Z',
        totalSessions: 24,
        sessionsRemaining: 20,
      },
    ],
  },
  {
    id: 'i9j0k1l2',
    fullName: 'Ayşe Yılmaz',
    email: 'ayse.yilmaz@example.com',
    phone: '555-0103',
    joinDate: '2024-06-10T09:00:00Z',
    status: 'demo',
    gender: 'Kadın',
    isVeiled: false,
    notes: 'Demo seansından sonra karar verecek.',
    healthConditions: [],
    measurements: [],
    packages: [],
  },
  {
    id: 'm3n4o5p6',
    fullName: 'Fatma Kaya',
    email: 'fatma.kaya@example.com',
    phone: '555-0104',
    joinDate: '2024-04-20T18:00:00Z',
    status: 'active',
    gender: 'Kadın',
    isVeiled: true,
    notes: 'Dizlerinde hassasiyet var.',
    healthConditions: ['Menisküs'],
    measurements: [
      {
        date: '2024-04-20T18:00:00Z',
        weight: 62,
        height: 160,
        bodyFatPercentage: 25,
        waist: 72,
        hips: 98,
      },
    ],
    packages: [
      {
        id: 'pkg-03',
        name: '12 Seans VIB',
        deviceName: 'VIB',
        startDate: '2024-04-20T18:00:00Z',
        endDate: '2024-06-20T18:00:00Z',
        totalSessions: 12,
        sessionsRemaining: 0,
      },
    ],
  },
  {
    id: 'q7r8s9t0',
    fullName: 'Zeynep Demir',
    email: 'zeynep.demir@example.com',
    phone: '555-0105',
    joinDate: '2024-06-12T11:00:00Z',
    status: 'demo',
    gender: 'Kadın',
    isVeiled: false,
    notes: '',
    healthConditions: [],
    measurements: [],
    packages: [],
  },
]
const today = new Date();
const yesterday = subDays(today, 1);
const tomorrow = addDays(today, 1);
const setTime = (date: Date, time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    return newDate.toISOString();
}
export const MOCK_SESSIONS: Session[] = [
  // Today's Sessions
  {
    id: 'ses-01',
    memberId: 'a1b2c3d4', // Elif Akbaş
    subDeviceId: 'Vacu 1',
    startTime: setTime(today, '09:30'),
    duration: 30,
    status: 'booked',
  },
  {
    id: 'ses-02',
    memberId: 'e5f6g7h8', // Pınar Selek
    subDeviceId: 'Vacu 2',
    startTime: setTime(today, '10:00'),
    duration: 30,
    status: 'completed',
  },
  {
    id: 'ses-03',
    memberId: 'i9j0k1l2', // Ayşe Yılmaz
    subDeviceId: 'Roll 1',
    startTime: setTime(today, '10:00'),
    duration: 30,
    status: 'booked',
  },
  // Yesterday's Sessions
  {
    id: 'ses-04',
    memberId: 'm3n4o5p6', // Fatma Kaya
    subDeviceId: 'Vacu 3',
    startTime: setTime(yesterday, '11:30'),
    duration: 30,
    status: 'completed',
  },
  {
    id: 'ses-05',
    memberId: 'q7r8s9t0', // Zeynep Demir
    subDeviceId: 'Roll 2',
    startTime: setTime(yesterday, '14:00'),
    duration: 30,
    status: 'completed',
  },
  // Tomorrow's Sessions
  {
    id: 'ses-06',
    memberId: 'a1b2c3d4',
    subDeviceId: 'VIB 1',
    startTime: setTime(tomorrow, '16:00'),
    duration: 30,
    status: 'booked',
  },
];
export const MOCK_FINANCIAL_TRANSACTIONS: FinancialTransaction[] = [
    {
        id: 'ft-01',
        date: new Date().toISOString(),
        type: 'income',
        amount: 4000,
        description: 'Paket Ödemesi (Vacu)',
        relatedMember: 'Elif Akbaş'
    },
    {
        id: 'ft-02',
        date: new Date().toISOString(),
        type: 'income',
        amount: 2500,
        description: 'Paket Ödemesi (Vacu)',
        relatedMember: 'Pınar Selek'
    }
];
export const MOCK_MONTHLY_INCOME: MonthlyIncomeRow[] = [
    {
        id: 'mir-01',
        packageDate: '2025-06-13T00:00:00Z',
        customerName: 'ELİF AKBAŞ',
        service: 'Vacu',
        salesPerson: 'admindenizli',
        packageFee: 12500,
        paymentMade: 4000,
        remainingBalance: 8500
    },
    {
        id: 'mir-02',
        packageDate: '2025-06-13T00:00:00Z',
        customerName: 'PINAR SELEK',
        service: 'Vacu',
        salesPerson: 'admindenizli',
        packageFee: 10500,
        paymentMade: 2500,
        remainingBalance: 8000
    }
];
export const MOCK_AUDIT_LOGS: AuditLog[] = [
    {
        id: 'log-01',
        timestamp: '2025-06-14T15:45:00Z',
        user: 'admindenizli',
        action: 'Seans İptal',
        description: 'FATMA SAFALI Vacu 15:45 14.06.2025 seansı iptal edildi'
    },
    {
        id: 'log-02',
        timestamp: '2025-06-14T15:40:00Z',
        user: 'admindenizli',
        action: 'Ödeme Alındı',
        description: 'Planlanan 3000 TL ödeme alındı (Ödeme Id: 1195)'
    },
    {
        id: 'log-03',
        timestamp: '2025-06-14T15:30:00Z',
        user: 'admindenizli',
        action: 'Seans Ekle',
        description: 'ELİF AKBAŞ için Vacu 1 16:00 15.06.2025 seansı eklendi'
    }
];
export const MOCK_DEVICES: Device[] = [
    {
        id: 'dev-01',
        name: 'Vacu',
        quantity: 3,
        measurementFrequency: 6,
        status: 'active',
        subDevices: [{id: 'sub-01', name: 'Vacu 1'}, {id: 'sub-02', name: 'Vacu 2'}, {id: 'sub-03', name: 'Vacu 3'}],
        requiredSpecializationIds: ['spec-02']
    },
    {
        id: 'dev-02',
        name: 'Roll',
        quantity: 3,
        measurementFrequency: 6,
        status: 'active',
        subDevices: [{id: 'sub-04', name: 'Roll 1'}, {id: 'sub-05', name: 'Roll 2'}, {id: 'sub-06', name: 'Roll 3'}],
        requiredSpecializationIds: []
    },
    {
        id: 'dev-03',
        name: 'VIB',
        quantity: 1,
        measurementFrequency: 6,
        status: 'active',
        subDevices: [{id: 'sub-07', name: 'VIB 1'}],
        requiredSpecializationIds: []
    },
    {
        id: 'dev-04',
        name: 'demo',
        quantity: 1,
        measurementFrequency: null,
        status: 'active',
        subDevices: [{id: 'sub-08', name: 'demo 1'}],
        requiredSpecializationIds: []
    }
];
export const MOCK_HEALTH_CONDITIONS: HealthConditionDefinition[] = [
    { id: 'hc-01', name: 'Bel Fıtığı' },
    { id: 'hc-02', name: 'Boyun Fıtığı' },
    { id: 'hc-03', name: 'Menisküs' },
    { id: 'hc-04', name: 'Yüksek Tansiyon' },
];
export const MOCK_PACKAGE_DEFINITIONS: PackageDefinition[] = [
    { id: 'pd-01', name: '12 Seans Vacu', deviceName: 'Vacu', totalSessions: 12, price: 8500, durationDays: 60 },
    { id: 'pd-02', name: '24 Seans Vacu', deviceName: 'Vacu', totalSessions: 24, price: 15000, durationDays: 90 },
    { id: 'pd-03', name: '12 Seans Roll', deviceName: 'Roll', totalSessions: 12, price: 7500, durationDays: 60 },
    { id: 'pd-04', name: '1 Aylık Sınırsız VIB', deviceName: 'VIB', totalSessions: 99, price: 5000, durationDays: 30 },
];
export const MOCK_STAFF: Staff[] = [
    { id: 'staff-01', fullName: 'Deniz Admin', email: 'admindenizli@example.com', phone: '555-0201', role: 'admin', status: 'active', gender: 'Kadın', joinDate: '2023-01-15T09:00:00Z', specializationIds: ['spec-04'], serviceCommissions: [{serviceId: 'pd-01', rate: 10}, {serviceId: 'pd-02', rate: 12}], workingHours: [{day: 'Pazartesi', startTime: '09:00', endTime: '18:00'}, {day: 'Salı', startTime: '09:00', endTime: '18:00'}] },
    { id: 'staff-02', fullName: 'Selin Uzman', email: 'selin.uzman@example.com', phone: '555-0202', role: 'uzman', status: 'active', gender: 'Kadın', joinDate: '2023-03-10T09:00:00Z', specializationIds: ['spec-01', 'spec-02'], serviceCommissions: [{serviceId: 'pd-03', rate: 15}], workingHours: [{day: 'Çarşamba', startTime: '10:00', endTime: '19:00'}, {day: 'Perşembe', startTime: '10:00', endTime: '19:00'}] },
    { id: 'staff-03', fullName: 'Ahmet Yılmaz', email: 'ahmet.yilmaz@example.com', phone: '555-0203', role: 'uzman', status: 'inactive', gender: 'Erkek', joinDate: '2023-05-20T09:00:00Z', specializationIds: ['spec-02'], notes: 'Ayrıldı', serviceCommissions: [], workingHours: [] },
];
export const MOCK_SPECIALIZATIONS: SpecializationDefinition[] = [
    { id: 'spec-01', name: 'Pilates' },
    { id: 'spec-02', name: 'Fonksiyonel Antrenman' },
    { id: 'spec-03', name: 'Diyetisyen' },
    { id: 'spec-04', name: 'Yönetim' },
];