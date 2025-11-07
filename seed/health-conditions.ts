import { healthConditions } from '../db/schema.js';

export const seedHealthConditions = [
  {
    id: 'hc-001',
    memberId: 'member-001',
    conditionName: 'Alerji',
    severity: 'low',
    description: 'Yaz aylarında saman nezlesi',
    diagnosedDate: '2023-05-15T00:00:00.000Z',
    isActive: true,
    notes: 'Antihistaminik kullanımı önerilir.'
  },
  {
    id: 'hc-002',
    memberId: 'member-003',
    conditionName: 'Hamilelik',
    severity: 'high',
    description: 'İkinci trimester',
    diagnosedDate: '2024-08-01T00:00:00.000Z',
    isActive: true,
    notes: 'Gebelik dostu tedaviler uygulanmalı. Doktor onayı gerekli.'
  },
  {
    id: 'hc-003',
    memberId: 'member-005',
    conditionName: 'Cilt Hassasiyeti',
    severity: 'medium',
    description: 'Kozmetik ürünlere karşı hassasiyet',
    diagnosedDate: '2024-01-20T00:00:00.000Z',
    isActive: true,
    notes: 'Hipoalerjenik ürünler kullanılmalı.'
  }
] as const;
