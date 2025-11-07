import { members } from '../db/schema.js';

export const seedMembers = [
  {
    id: 'member-001',
    fullName: 'Ayşe Yılmaz',
    email: 'ayse.yilmaz@email.com',
    phone: '+90 555 123 4567',
    joinDate: '2024-01-15T10:00:00.000Z',
    status: 'active',
    gender: 'Kadın',
    isVeiled: true,
    notes: 'Düzenli fitness tutkunu, 3 yıldır devam ediyor.'
  },
  {
    id: 'member-002',
    fullName: 'Mehmet Kaya',
    email: 'mehmet.kaya@email.com',
    phone: '+90 555 234 5678',
    joinDate: '2024-02-01T14:30:00.000Z',
    status: 'active',
    gender: 'Erkek',
    isVeiled: false,
    notes: 'Profesyonel sporcu, kilo alma hedefi var.'
  },
  {
    id: 'member-003',
    fullName: 'Fatma Demir',
    email: 'fatma.demir@email.com',
    phone: '+90 555 345 6789',
    joinDate: '2024-01-20T09:15:00.000Z',
    status: 'active',
    gender: 'Kadın',
    isVeiled: false,
    notes: 'Sağlık sorunları nedeniyle kontrollü program.'
  },
  {
    id: 'member-004',
    fullName: 'Ahmet Çelik',
    email: 'ahmet.celik@email.com',
    phone: '+90 555 456 7890',
    joinDate: '2024-03-10T16:45:00.000Z',
    status: 'demo',
    gender: 'Erkek',
    isVeiled: false,
    notes: 'Demo üye, henüz karar vermedi.'
  },
  {
    id: 'member-005',
    fullName: 'Zeynep Öztürk',
    email: 'zeynep.ozturk@email.com',
    phone: '+90 555 567 8901',
    joinDate: '2024-02-15T11:20:00.000Z',
    status: 'active',
    gender: 'Kadın',
    isVeiled: true,
    notes: 'Yeni anne, postpartum fitness programı.'
  },
  {
    id: 'member-006',
    fullName: 'Mustafa Aydın',
    email: 'mustafa.aydin@email.com',
    phone: '+90 555 678 9012',
    joinDate: '2023-12-01T13:00:00.000Z',
    status: 'inactive',
    gender: 'Erkek',
    isVeiled: false,
    notes: 'Geçici olarak ara verdi, ilerleyen dönemde dönecek.'
  }
] as const;
