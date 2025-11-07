import { roles, pages, permissions, rolePermissions, users } from '../db/schema.js';

export const seedRoles = [
  {
    id: 'role-admin',
    name: 'admin',
    displayName: 'Yönetici',
    description: 'Sistem yöneticisi - tüm yetkiler',
    isActive: true,
  },
  {
    id: 'role-staff',
    name: 'staff',
    displayName: 'Personel',
    description: 'Fitness salonu personeli',
    isActive: true,
  },
  {
    id: 'role-member',
    name: 'member',
    displayName: 'Üye',
    description: 'Salon üyesi - sınırlı erişim',
    isActive: true,
  },
] as const;
